import { fireEvent, render, screen } from '@testing-library/react'
import { SpoilerHints } from './SpoilerHints'
import { WORDS } from '../constants/wordlist'
import { WORD_GROUPS } from '../constants/wordGroups'

test('spoilers are hidden until individually revealed', () => {
  const reveal = jest.fn()
  const { rerender } = render(
    <SpoilerHints
      solution="ㄧㄡㄓㄩㄢ"
      hints={{ wordCount: false, grouping: false }}
      onReveal={reveal}
    />
  )
  expect(screen.queryByText('3 字')).not.toBeInTheDocument()
  expect(screen.queryByText('AABCC')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '開啟字數提示' }))
  expect(reveal).toHaveBeenCalledWith('wordCount')
  rerender(
    <SpoilerHints
      solution="ㄧㄡㄓㄩㄢ"
      hints={{ wordCount: true, grouping: false }}
      onReveal={reveal}
    />
  )
  expect(screen.getByText('3 字')).toBeInTheDocument()
  expect(screen.queryByText('AABCC')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: '開啟組合提示' }))
  expect(reveal).toHaveBeenCalledWith('grouping')
  rerender(
    <SpoilerHints
      solution="ㄧㄡㄓㄩㄢ"
      hints={{ wordCount: true, grouping: true }}
      onReveal={reveal}
    />
  )
  expect(screen.getByText('AABCC')).toBeInTheDocument()
})

test('precomputed groups cover every answer without changing its length', () => {
  expect(Object.keys(WORD_GROUPS)).toHaveLength(new Set(WORDS).size)
  for (const word of WORDS) {
    const lengths = WORD_GROUPS[word]
    expect(
      lengths.every(
        (length) => Number.isInteger(length) && length >= 1 && length <= 3
      )
    ).toBe(true)
    expect(lengths.reduce((sum, length) => sum + length, 0)).toBe(word.length)
  }
  expect(WORD_GROUPS['ㄉㄨㄧㄨㄦ']).toEqual([2, 1, 1, 1])
})
