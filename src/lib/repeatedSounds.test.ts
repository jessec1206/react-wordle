import { getRepeatedSoundHint } from './repeatedSounds'

test('reports repetition counts without revealing the sounds', () => {
  expect(getRepeatedSoundHint('ㄧㄚㄑㄧㄢ')).toBe('有 1 個注音出現 2 次')
  expect(getRepeatedSoundHint('ㄧㄚㄧㄚㄢ')).toBe('有 2 個注音出現 2 次')
  expect(getRepeatedSoundHint('ㄧㄧㄧㄚㄚ')).toBe(
    '有 1 個注音出現 2 次；有 1 個注音出現 3 次'
  )
  expect(getRepeatedSoundHint('ㄕㄚㄏㄞㄗ')).toBe('')
})
