import { useState, useEffect } from 'react'
import styles from './Exercise.module.css'

export default function MatchWords({ pairs, answers, onChange }) {
  const [shuffledRight, setShuffledRight] = useState([])
  const [selected, setSelected] = useState(null) // { side: 'left'|'right', index }
  const [matches, setMatches] = useState({}) // leftIndex -> rightIndex

  useEffect(() => {
    const indices = pairs.map((_, i) => i)
    const shuffled = [...indices].sort(() => Math.random() - 0.5)
    setShuffledRight(shuffled)
  }, [pairs])

  const handleSelect = (side, index) => {
    if (!selected) {
      setSelected({ side, index })
      return
    }

    if (selected.side === side) {
      setSelected({ side, index })
      return
    }

    // Match!
    let leftIdx, rightOriginalIdx
    if (side === 'right') {
      leftIdx = selected.index
      rightOriginalIdx = index
    } else {
      leftIdx = index
      rightOriginalIdx = selected.index
    }

    const newMatches = { ...matches, [leftIdx]: rightOriginalIdx }
    setMatches(newMatches)
    Object.entries(newMatches).forEach(([li, ri]) => onChange(Number(li), Number(ri)))
    setSelected(null)
  }

  const isLeftMatched = (li) => li in matches
  const isRightMatched = (ri) => Object.values(matches).includes(ri)
  const isSelectedLeft = (li) => selected?.side === 'left' && selected.index === li
  const isSelectedRight = (ri) => selected?.side === 'right' && selected.index === ri

  const clearMatch = (li) => {
    const newMatches = { ...matches }
    delete newMatches[li]
    setMatches(newMatches)
    onChange(li, undefined)
  }

  return (
    <div className={styles.card}>
      <p className={styles.matchInstructions}>
        Натисни слово зліва, потім відповідне слово справа щоб з'єднати пару
      </p>
      <div className={styles.matchGrid}>
        <div className={styles.matchCol}>
          {pairs.map((p, li) => (
            <button
              key={li}
              className={`${styles.matchItem} ${styles.matchLeft}
                ${isLeftMatched(li) ? styles.matchMatched : ''}
                ${isSelectedLeft(li) ? styles.matchSelectedLeft : ''}
              `}
              onClick={() => isLeftMatched(li) ? clearMatch(li) : handleSelect('left', li)}
            >
              {p.left}
              {isLeftMatched(li) && <span className={styles.matchedWith}> → {pairs[matches[li]]?.right}</span>}
            </button>
          ))}
        </div>
        <div className={styles.matchCol}>
          {shuffledRight.map((origIdx) => (
            <button
              key={origIdx}
              className={`${styles.matchItem} ${styles.matchRight}
                ${isRightMatched(origIdx) ? styles.matchMatched : ''}
                ${isSelectedRight(origIdx) ? styles.matchSelectedRight : ''}
              `}
              onClick={() => !isRightMatched(origIdx) && handleSelect('right', origIdx)}
              disabled={isRightMatched(origIdx)}
            >
              {pairs[origIdx]?.right}
            </button>
          ))}
        </div>
      </div>
      <p className={styles.matchProgress}>
        {Object.keys(matches).length} / {pairs.length} пар з'єднано
      </p>
    </div>
  )
}
