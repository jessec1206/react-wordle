import { render, screen } from '@testing-library/react'
import { GamePicker } from './GamePicker'
import { gameUrl, selectedGame, solution } from '../lib/words'

test('shows three selectable puzzles and current completion without a reload', () => {
  const { rerender } = render(<GamePicker guesses={[]} />)
  for (const puzzle of [1, 2, 3]) {
    expect(
      screen.getByRole('link', { name: `第 ${puzzle} 題` })
    ).toHaveAttribute('href', gameUrl(selectedGame.dateString, puzzle))
  }
  expect(
    screen.getByLabelText('每日三題', { selector: 'input' })
  ).toBeInTheDocument()
  expect(document.getElementById('game-date')).toHaveAttribute(
    'min',
    '2022-01-01'
  )
  rerender(<GamePicker guesses={[solution]} />)
  expect(
    screen.getByRole('link', { name: `第 ${selectedGame.puzzle} 題 ✓` })
  ).toHaveAttribute('aria-current', 'page')
})
