import {
  generateEmojiGrid,
  generateDailyShareText,
  shareDailyStatus,
} from './share'
import { selectedGame, getDailySolution } from './words'

describe('generateEmojiGrid', () => {
  test('generates grid for ascii', () => {
    const guesses = ['EDCBA', 'VWXYZ', 'ABCDE']
    const tiles = ['C', 'P', 'A'] // Correct, Present, Absemt

    const grid = generateEmojiGrid('ABCDE', guesses, tiles)
    const gridParts = grid.split('\n')
    expect(gridParts[0]).toBe('PPCPP')
    expect(gridParts[1]).toBe('AAAAA')
    expect(gridParts[2]).toBe('CCCCC')
  })
  test('generates grid for emoji', () => {
    const guesses = ['5️⃣4️⃣3️⃣2️⃣1️⃣', '♠️♥️♦️♣️🔔', '1️⃣2️⃣3️⃣4️⃣5️⃣']
    const tiles = ['C', 'P', 'A'] // Correct, Present, Absemt

    const grid = generateEmojiGrid('1️⃣2️⃣3️⃣4️⃣5️⃣', guesses, tiles)
    const gridParts = grid.split('\n')
    expect(gridParts[0]).toBe('PPCPP')
    expect(gridParts[1]).toBe('AAAAA')
    expect(gridParts[2]).toBe('CCCCC')
  })
})

describe('daily sharing', () => {
  test('combines a win, a failure and an unfinished puzzle without exposing answers', () => {
    const text = generateDailyShareText(
      '2026-10-15',
      [
        { solution: 'ABCDE', guesses: ['EDCBA', 'ABCDE'] },
        { solution: 'FGHIJ', guesses: Array(6).fill('KLMNO') },
        { solution: 'PQRST', guesses: ['TSRQP'] },
      ],
      false,
      false
    )
    expect(text).toContain('第1題 ✅ 2/6')
    expect(text).toContain('第2題 ❌ X/6')
    expect(text).toContain('第3題 ⏳ 未完成')
    expect(text).toContain('🟩🟩🟩🟩🟩')
    expect(text).not.toMatch(/ABCDE|FGHIJ|PQRST|TSRQP/)
    expect(
      text.split('\n').filter((line) => /^[🟩🟨⬜]+$/u.test(line))
    ).toHaveLength(8)
    const url = new URL(text.split('\n').pop()!)
    expect(url.searchParams.get('date')).toBe('2026-10-15')
    expect(url.searchParams.has('puzzle')).toBe(false)
  })

  test('counts a sixth-guess win as a success and supports missing games', () => {
    const text = generateDailyShareText(
      '2026-10-15',
      [
        { solution: 'ABCDE', guesses: [...Array(5).fill('EDCBA'), 'ABCDE'] },
        null,
        null,
      ],
      true,
      true
    )
    expect(text).toContain('第1題 ✅ 6/6')
    expect(text).toContain('第2題 ⏳ 未完成')
    expect(text).toContain('第3題 ⏳ 未完成')
    expect(text).toContain('🟧🟧🟧🟧🟧')
  })

  test('reads other puzzles from the same selected date and uses live current guesses', async () => {
    localStorage.clear()
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    const copied = jest.fn()
    const other = [1, 2, 3].find((puzzle) => puzzle !== selectedGame.puzzle)!
    const answer = getDailySolution(selectedGame.date, other).solution
    localStorage.setItem(
      `gameState:v2:${selectedGame.dateString}:${other}`,
      JSON.stringify({ solution: answer, guesses: [answer] })
    )
    await shareDailyStatus('ABCDE', ['ABCDE'], false, false, copied)
    expect(writeText.mock.calls[0][0]).toContain(`第${other}題 ✅ 1/6`)
    expect(writeText.mock.calls[0][0]).toContain(
      `第${selectedGame.puzzle}題 ✅ 1/6`
    )
    expect(copied).toHaveBeenCalledTimes(1)
  })
})

test('reports both hint types independently, including an unfinished puzzle', () => {
  const text = generateDailyShareText(
    '2026-10-16',
    [
      {
        solution: 'ABCDE',
        guesses: ['ABCDE'],
        hints: { wordCount: true, grouping: true },
      },
      {
        solution: 'FGHIJ',
        guesses: [],
        hints: { wordCount: false, grouping: true },
      },
      null,
    ],
    false,
    false
  )
  expect(text).toContain('選用提示：字數提示、組合提示')
  expect(text).toContain('第2題 ⏳ 未完成\n選用提示：組合提示')
  expect(text).toContain('第3題 ⏳ 未完成\n選用提示：未開啟')
  expect(text).not.toContain('ABCDE')
  expect(text).not.toContain('FGHIJ')
})
