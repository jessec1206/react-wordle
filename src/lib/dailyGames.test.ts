import {
  firstGameDate,
  formatGameDate,
  getDailySolution,
  gameUrl,
  resolveGameSelection,
  isWordInWordList,
} from './words'
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
} from './localStorage'

const today = new Date(2026, 9, 14)

test('only valid historical dates and puzzle slots can be selected', () => {
  expect(
    resolveGameSelection('?date=2024-02-29&puzzle=3', today)
  ).toMatchObject({
    dateString: '2024-02-29',
    puzzle: 3,
  })
  for (const date of ['2024-02-30', '2026-10-15', '2021-12-31', 'bad']) {
    expect(resolveGameSelection(`?date=${date}&puzzle=4`, today)).toMatchObject(
      {
        dateString: '2026-10-14',
        puzzle: 1,
      }
    )
  }
})

test('three distinct, valid and reproducible answers across the date range', () => {
  const date = new Date(firstGameDate)
  while (date <= today) {
    const answers = [1, 2, 3].map(
      (puzzle) => getDailySolution(date, puzzle).solution
    )
    expect(new Set(answers).size).toBe(3)
    for (const answer of answers) expect(isWordInWordList(answer)).toBe(true)
    expect(getDailySolution(new Date(date), 2).solution).toBe(answers[1])
    date.setDate(date.getDate() + 1)
  }
})

test('share URLs retain the current host and identify the date and slot', () => {
  const url = new URL(gameUrl(formatGameDate(today), 3))
  expect(url.origin).toBe(window.location.origin)
  expect(url.searchParams.get('date')).toBe('2026-10-14')
  expect(url.searchParams.get('puzzle')).toBe('3')
})

test('new game storage leaves legacy data and other puzzles intact', () => {
  localStorage.clear()
  localStorage.setItem('gameState', 'legacy')
  localStorage.setItem('gameState:v2:2024-02-29:3', 'other puzzle')
  const game = { guesses: ['ㄕㄚㄏㄞㄗ'], solution: 'ㄕㄚㄏㄞㄗ' }
  saveGameStateToLocalStorage(game)
  expect(loadGameStateFromLocalStorage()).toEqual(game)
  expect(localStorage.getItem('gameState')).toBe('legacy')
  expect(localStorage.getItem('gameState:v2:2024-02-29:3')).toBe('other puzzle')
})

test('progress is isolated across slots and dates, and restored on return', () => {
  localStorage.clear()
  const open = (query: string) => {
    window.history.replaceState({}, '', `/${query}`)
    let storage: typeof import('./localStorage')
    jest.isolateModules(() => {
      storage = require('./localStorage')
    })
    return storage!
  }
  const first = {
    guesses: ['ㄕㄚㄏㄞㄗ'],
    solution: 'first',
    hints: { wordCount: true, grouping: false },
  }
  const second = {
    guesses: ['ㄓㄢㄍㄨㄥ'],
    solution: 'second',
    hints: { wordCount: false, grouping: true },
  }
  open('?date=2024-02-29&puzzle=1').saveGameStateToLocalStorage(first)
  expect(
    open('?date=2024-02-29&puzzle=2').loadGameStateFromLocalStorage()
  ).toBeNull()
  open('?date=2024-02-29&puzzle=2').saveGameStateToLocalStorage(second)
  expect(
    open('?date=2024-02-28&puzzle=1').loadGameStateFromLocalStorage()
  ).toBeNull()
  expect(
    open('?date=2024-02-29&puzzle=1').loadGameStateFromLocalStorage()
  ).toEqual(first)
  expect(
    open('?date=2024-02-29&puzzle=2').loadGameStateFromLocalStorage()
  ).toEqual(second)
  window.history.replaceState({}, '', '/')
})
