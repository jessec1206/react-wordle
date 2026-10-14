import {
  selectedGame,
  formatGameDate,
  firstGameDate,
  getToday,
  gameUrl,
  solution,
} from '../lib/words'

export const GamePicker = ({ guesses }: { guesses: string[] }) => {
  const today = formatGameDate(getToday())
  const isHistory = selectedGame.dateString !== today
  return (
    <section
      aria-label="選擇每日題目"
      className="max-w-md w-full mx-auto px-3 mb-5 text-gray-900 dark:text-gray-100"
    >
      <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
        <label htmlFor="game-date">{isHistory ? '歷史日期' : '每日三題'}</label>
        <input
          id="game-date"
          type="date"
          className="rounded border border-gray-400 px-2 py-1 bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
          value={selectedGame.dateString}
          min={formatGameDate(firstGameDate)}
          max={today}
          onChange={(event) => {
            const date = event.target.value
            if (date >= formatGameDate(firstGameDate) && date <= today) {
              window.location.assign(gameUrl(date, 1))
            }
          }}
        />
        {isHistory && (
          <a className="underline" href={gameUrl(today, 1)}>
            回到今天
          </a>
        )}
      </div>
      <nav aria-label="每日三題" className="flex justify-center gap-2">
        {[1, 2, 3].map((puzzle) => {
          const state = localStorage.getItem(
            `gameState:v2:${selectedGame.dateString}:${puzzle}`
          )
          let status = ''
          try {
            const saved =
              puzzle === selectedGame.puzzle
                ? { guesses, solution }
                : state
                ? JSON.parse(state)
                : null
            if (saved?.guesses.includes(saved.solution)) status = ' ✓'
            else if (saved?.guesses.length >= 6) status = ' 已結束'
            else if (saved?.guesses.length > 0) status = ' 進行中'
          } catch {
            // A malformed saved game should not prevent changing puzzles.
          }
          return (
            <a
              key={puzzle}
              href={gameUrl(selectedGame.dateString, puzzle)}
              aria-current={selectedGame.puzzle === puzzle ? 'page' : undefined}
              className={`rounded px-3 py-2 text-sm ${
                selectedGame.puzzle === puzzle
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
              }`}
            >
              第 {puzzle} 題{status}
            </a>
          )
        })}
      </nav>
      <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-300">
        每天三題，進度各自保存；歷史日期也有三題可玩。
      </p>
    </section>
  )
}
