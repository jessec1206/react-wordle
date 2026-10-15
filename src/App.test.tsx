import React from 'react'
import { render, screen } from '@testing-library/react'
import App from './App'
import { GAME_TITLE } from './constants/strings'

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
})

test('renders App component', () => {
  render(<App />)
  const linkElement = screen.getByText(GAME_TITLE)
  expect(linkElement).toBeInTheDocument()
})

test('automatically shows the tutorial only on the first visit', async () => {
  localStorage.clear()
  const first = render(<App />)
  expect(await screen.findByText('遊戲說明')).toBeInTheDocument()
  expect(localStorage.getItem('hasSeenWelcomeInfo')).toBe('1')
  first.unmount()
  window.history.replaceState({}, '', '/?puzzle=2')
  const second = render(<App />)
  await new Promise((resolve) => setTimeout(resolve, 500))
  expect(screen.queryByText('遊戲說明')).not.toBeInTheDocument()
  second.unmount()
  window.history.replaceState({}, '', '/?puzzle=3')
  render(<App />)
  await new Promise((resolve) => setTimeout(resolve, 500))
  expect(screen.queryByText('遊戲說明')).not.toBeInTheDocument()
  window.history.replaceState({}, '', '/')
})

test('existing players do not see the welcome tutorial after upgrading', async () => {
  localStorage.clear()
  localStorage.setItem(
    'gameState:v2:2024-01-01:1',
    JSON.stringify({ guesses: [], solution: '' })
  )
  render(<App />)
  await new Promise((resolve) => setTimeout(resolve, 500))
  expect(screen.queryByText('遊戲說明')).not.toBeInTheDocument()
  expect(localStorage.getItem('hasSeenWelcomeInfo')).toBe('1')
})
