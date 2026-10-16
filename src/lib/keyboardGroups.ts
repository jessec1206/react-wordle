export const KEYBOARD_GROUPS = [
  {
    name: '聲母',
    sounds: 'ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙ',
    classes:
      'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 active:bg-blue-300',
  },
  {
    name: '介音',
    sounds: 'ㄧㄨㄩ',
    classes:
      'bg-violet-100 dark:bg-violet-900 hover:bg-violet-200 active:bg-violet-300',
  },
  {
    name: '韻母',
    sounds: 'ㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ',
    classes:
      'bg-rose-100 dark:bg-rose-900 hover:bg-rose-200 active:bg-rose-300',
  },
]

export const getKeyboardGroup = (sound: string) =>
  KEYBOARD_GROUPS.find(
    (group) => sound.length === 1 && group.sounds.includes(sound)
  )
