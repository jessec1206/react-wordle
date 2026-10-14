import { unicodeSplit } from './words'

export const getRepeatedSoundHint = (answer: string) => {
  const sounds = new Map<string, number>()
  for (const sound of unicodeSplit(answer)) {
    sounds.set(sound, (sounds.get(sound) || 0) + 1)
  }
  const groups = new Map<number, number>()
  sounds.forEach((count) => {
    if (count > 1) groups.set(count, (groups.get(count) || 0) + 1)
  })
  return Array.from(groups)
    .sort(([a], [b]) => a - b)
    .map(([count, amount]) => `有 ${amount} 個注音出現 ${count} 次`)
    .join('；')
}
