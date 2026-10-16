import { getGuessStatuses } from './statuses'
import { selectedGame, gameUrl, unicodeSplit, getDailySolution } from './words'
import { GameHints, StoredGameState } from './localStorage'
import { GAME_TITLE } from '../constants/strings'
import { MAX_CHALLENGES } from '../constants/settings'
import { UAParser } from 'ua-parser-js'

const webShareApiDeviceTypes: string[] = ['mobile', 'smarttv', 'wearable']
const parser = new UAParser()
const browser = parser.getBrowser()
const device = parser.getDevice()

const shareText = async (text: string, onCopied: () => void) => {
  const shareData = { text }
  try {
    if (attemptShare(shareData)) {
      await navigator.share(shareData)
      return
    }
  } catch (error) {
    // Closing the native share sheet is intentional, not a copy request.
    if (error instanceof Error && error.name === 'AbortError') return
  }
  await navigator.clipboard.writeText(text)
  onCopied()
}

export const generateDailyShareText = (
  date: string,
  games: (StoredGameState | null)[],
  isDarkMode: boolean,
  isHighContrastMode: boolean
) => {
  const tiles = getEmojiTiles(isDarkMode, isHighContrastMode)
  const results = [0, 1, 2].map((index) => {
    const game = games[index]
    const winIndex = game?.guesses.indexOf(game.solution) ?? -1
    const won = winIndex >= 0
    const lost = !won && (game?.guesses.length || 0) >= MAX_CHALLENGES
    const title = `第${index + 1}題`
    const openedHints = [
      game?.hints?.wordCount === true ? '字數提示' : '',
      game?.hints?.grouping === true ? '組合提示' : '',
    ].filter(Boolean)
    const hintLine = `選用提示：${
      openedHints.length ? openedHints.join('、') : '未開啟'
    }`
    if (!game || (!won && !lost)) return `${title} ⏳ 未完成\n${hintLine}`
    const guesses = game.guesses.slice(0, won ? winIndex + 1 : MAX_CHALLENGES)
    return `${title} ${
      won ? `✅ ${guesses.length}` : '❌ X'
    }/${MAX_CHALLENGES}\n${generateEmojiGrid(
      game.solution,
      guesses,
      tiles
    )}\n${hintLine}`
  })
  const url = new URL(gameUrl(date, 1))
  url.searchParams.delete('puzzle')
  return `${GAME_TITLE}｜${date}\n\n${results.join('\n\n')}\n\n${url.href}`
}

export const shareDailyStatus = (
  solution: string,
  guesses: string[],
  isDarkMode: boolean,
  isHighContrastMode: boolean,
  onCopied: () => void,
  hints?: GameHints
) => {
  const games = [1, 2, 3].map((puzzle): StoredGameState | null => {
    if (puzzle === selectedGame.puzzle) return { solution, guesses, hints }
    try {
      const raw = localStorage.getItem(
        `gameState:v2:${selectedGame.dateString}:${puzzle}`
      )
      const game = raw ? JSON.parse(raw) : null
      return game?.solution ===
        getDailySolution(selectedGame.date, puzzle).solution &&
        Array.isArray(game.guesses) &&
        game.guesses.every((guess: unknown) => typeof guess === 'string')
        ? game
        : null
    } catch {
      return null
    }
  })
  return shareText(
    generateDailyShareText(
      selectedGame.dateString,
      games,
      isDarkMode,
      isHighContrastMode
    ),
    onCopied
  )
}

export const generateEmojiGrid = (
  solution: string,
  guesses: string[],
  tiles: string[]
) => {
  return guesses
    .map((guess) => {
      const status = getGuessStatuses(solution, guess)
      const splitGuess = unicodeSplit(guess)

      return splitGuess
        .map((_, i) => {
          switch (status[i]) {
            case 'correct':
              return tiles[0]
            case 'present':
              return tiles[1]
            default:
              return tiles[2]
          }
        })
        .join('')
    })
    .join('\n')
}

const attemptShare = (shareData: object) => {
  return (
    // Deliberately exclude Firefox Mobile, because its Web Share API isn't working correctly
    browser.name?.toUpperCase().indexOf('FIREFOX') === -1 &&
    webShareApiDeviceTypes.indexOf(device.type ?? '') !== -1 &&
    navigator.canShare &&
    navigator.canShare(shareData) &&
    navigator.share
  )
}

const getEmojiTiles = (isDarkMode: boolean, isHighContrastMode: boolean) => {
  let tiles: string[] = []
  tiles.push(isHighContrastMode ? '🟧' : '🟩')
  tiles.push(isHighContrastMode ? '🟦' : '🟨')
  tiles.push(isDarkMode ? '⬛' : '⬜')
  return tiles
}
