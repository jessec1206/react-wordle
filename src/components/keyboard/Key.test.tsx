import { render, screen, cleanup } from '@testing-library/react'
import { Key } from './Key'

test('unplayed keys use the three group colors', () => {
  for (const [value, color] of [
    ['ㄅ', 'bg-blue-100'],
    ['ㄧ', 'bg-violet-100'],
    ['ㄚ', 'bg-rose-100'],
  ]) {
    render(<Key value={value} onClick={jest.fn()} />)
    expect(screen.getByRole('button')).toHaveClass(color)
    cleanup()
  }
})

test('guess feedback overrides category colors and action keys remain neutral', () => {
  for (const [status, color] of [
    ['correct', 'bg-green-500'],
    ['present', 'bg-yellow-500'],
    ['absent', 'bg-slate-400'],
  ] as const) {
    render(<Key value="ㄧ" status={status} onClick={jest.fn()} />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass(color)
    expect(button).not.toHaveClass('bg-violet-100')
    cleanup()
  }
  render(<Key value="ENTER" onClick={jest.fn()} />)
  expect(screen.getByRole('button')).toHaveClass('bg-slate-200')
})
