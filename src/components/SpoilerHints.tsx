import { WORD_GROUPS } from '../constants/wordGroups'
import { GameHints } from '../lib/localStorage'

type Props = {
  solution: string
  hints: GameHints
  onReveal: (hint: keyof GameHints) => void
}

export const SpoilerHints = ({ solution, hints, onReveal }: Props) => {
  const groups = WORD_GROUPS[solution]
  if (!groups) return null
  const pattern = groups
    .map((length, index) => String.fromCharCode(65 + index).repeat(length))
    .join('')
  const items: { key: keyof GameHints; label: string; value: string }[] = [
    { key: 'wordCount', label: '字數提示', value: `${groups.length} 字` },
    { key: 'grouping', label: '組合提示', value: pattern },
  ]
  return (
    <section
      aria-label="選用提示"
      className="mx-auto mb-4 flex flex-wrap justify-center gap-x-5 gap-y-2 px-3 text-sm dark:text-white"
    >
      {items.map(({ key, label, value }) => (
        <div key={key} className="flex items-center gap-2">
          <span>{label}</span>
          <button
            type="button"
            aria-label={hints[key] ? `${label}：${value}` : `開啟${label}`}
            aria-expanded={hints[key]}
            disabled={hints[key]}
            onClick={() => onReveal(key)}
            className={
              hints[key]
                ? 'h-7 w-16 font-mono font-bold'
                : 'h-7 w-16 rounded hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-500'
            }
            style={
              hints[key]
                ? undefined
                : { backgroundColor: 'var(--absent-cell-bg-color)' }
            }
          >
            {hints[key] ? value : null}
          </button>
        </div>
      ))}
    </section>
  )
}
