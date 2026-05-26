import { useState, useEffect } from 'react'
import styles from './Exercise.module.css'

export default function MemoryGame({ pairs, answers, onChange }) {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState(new Set())
  const [moves, setMoves] = useState(0)
  const [disabled, setDisabled] = useState(false)

  useEffect(() => {
    const deck = []
    pairs.forEach((p, i) => {
      deck.push({ id: `l${i}`, pairId: i, text: p.left, imageUrl: p.imageUrl })
      deck.push({ id: `r${i}`, pairId: i, text: p.right })
    })
    setCards(deck.sort(() => Math.random() - 0.5))
    setFlipped([])
    setMatched(new Set())
    setMoves(0)
  }, [])

  const handleFlip = (cardId) => {
    if (disabled || matched.has(cardId) || flipped.includes(cardId)) return
    if (flipped.length === 2) return

    const newFlipped = [...flipped, cardId]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves(m => m + 1)
      setDisabled(true)
      const [a, b] = newFlipped.map(id => cards.find(c => c.id === id))
      if (a.pairId === b.pairId) {
        const newMatched = new Set([...matched, a.id, b.id])
        setMatched(newMatched)
        setFlipped([])
        setDisabled(false)
        if (newMatched.size === cards.length) {
          onChange(0, JSON.stringify({ moves, pairs: pairs.length }))
        }
      } else {
        setTimeout(() => { setFlipped([]); setDisabled(false) }, 1000)
      }
    }
  }

  const allDone = matched.size === cards.length && cards.length > 0

  return (
    <div className={styles.card}>
      <div className={styles.fcProgress}>
        Знайдено: {matched.size / 2} / {pairs.length} пар · Ходів: {moves}
      </div>

      {allDone && (
        <div className={styles.memoryDone}>
          🎉 Всі пари знайдено за {moves} ходів!
        </div>
      )}

      <div className={styles.memoryGrid} style={{ gridTemplateColumns: `repeat(${Math.min(4, cards.length)}, 1fr)` }}>
        {cards.map(card => {
          const isFlipped = flipped.includes(card.id) || matched.has(card.id)
          const isMatched = matched.has(card.id)
          return (
            <button
              key={card.id}
              className={`${styles.memoryCard} ${isFlipped ? styles.memoryFlipped : ''} ${isMatched ? styles.memoryMatched : ''}`}
              onClick={() => handleFlip(card.id)}
            >
              {isFlipped ? (
                <div className={styles.memoryFront}>
                  {card.imageUrl
                    ? <img src={card.imageUrl} alt={card.text} className={styles.memoryImg} />
                    : card.text
                  }
                </div>
              ) : (
                <div className={styles.memoryBack}>?</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
