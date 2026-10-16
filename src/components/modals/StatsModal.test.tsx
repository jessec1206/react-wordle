import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { StatsModal } from './StatsModal'
import { getDailySolution, selectedGame } from '../../lib/words'

test('the only share action combines all three games and their own hints', async () => {
  localStorage.clear()
  const writeText = jest.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
  for (const puzzle of [1, 2, 3]) {
    const solution = getDailySolution(selectedGame.date, puzzle).solution
    localStorage.setItem(
      `gameState:v2:${selectedGame.dateString}:${puzzle}`,
      JSON.stringify({
        solution,
        guesses: [solution],
        hints: { wordCount: puzzle === 1, grouping: puzzle === 2 },
      })
    )
  }
  const solution = getDailySolution(
    selectedGame.date,
    selectedGame.puzzle
  ).solution
  render(
    <StatsModal
      isOpen={true}
      handleClose={jest.fn()}
      solution={solution}
      guesses={[solution]}
      hints={{
        wordCount: selectedGame.puzzle === 1,
        grouping: selectedGame.puzzle === 2,
      }}
      gameStats={{
        totalGames: 3,
        gamesFailed: 0,
        currentStreak: 3,
        bestStreak: 3,
        successRate: 100,
        winDistribution: [3, 0, 0, 0, 0, 0],
      }}
      isGameLost={false}
      isGameWon={true}
      handleShareToClipboard={jest.fn()}
      handleMigrateStatsButton={jest.fn()}
      isDarkMode={false}
      isHighContrastMode={false}
      numberOfGuessesMade={1}
    />
  )
  expect(
    screen.queryByRole('button', { name: '分享本題' })
  ).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '分享當日三題' }))
  await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
  const text = writeText.mock.calls[0][0]
  expect(text).toContain('第1題 ✅ 1/6\n🟩🟩🟩🟩🟩\n選用提示：字數提示')
  expect(text).toContain('第2題 ✅ 1/6\n🟩🟩🟩🟩🟩\n選用提示：組合提示')
  expect(text).toContain('第3題 ✅ 1/6\n🟩🟩🟩🟩🟩\n選用提示：未開啟')
})
