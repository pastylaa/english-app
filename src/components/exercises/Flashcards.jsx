import { useState } from 'react'
import styles from './Exercise.module.css'

export default function Flashcards({ cards, answers, onChange }) {
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(new Set())
  const [done, setDone] = useState(false)

  const handleFlip = () => setFlipped(!flipped)

  const handleKnow = (knew) => {
    const newKnown = new Set(known)
    if (knew) newKnown.add(current)
    else newKnown.delete(current)
    setKnown(newKnown)

    if (current + 1 >= cards.length) {
      onChange(0, JSON.stringify({ known: newKnown.size, total: cards.length }))
      setDone(true)
    } else {
      setCurrent(current + 1)
      setFlipped(false)
    }
  }

  const restart = () => {
    setCurrent(0)
    setFlipped(false)
    setKnown(new Set())
    setDone(false)
  }

  if (done) return (
    <div className={styles.card} style={{ textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>
        {known.size === cards.length ? '🌟' : '💪'}
      </div>
      <p className={styles.sentence}>
        Знаєш <strong>{known.size}</strong> з <strong>{cards.length}</strong> карток!
      </p>
      <button className={styles.woReset} onClick={restart} style={{ margin: '16px auto 0', display: 'block' }}>
        ↺ Пройти знову
      </button>
    </div>
  )

  const card = cards[current]

  return (
    <div className={styles.card}>
      <div className={styles.fcProgress}>
        {current + 1} / {cards.length}
        <span className={styles.fcKnown}>✓ {known.size} знаю</span>
      </div>

      <div className={`${styles.fcCard} ${flipped ? styles.fcFlipped : ''}`} onClick={handleFlip}>
        <div className={styles.fcFront}>
          {card.imageUrl && <img src={card.imageUrl} alt="" className={styles.fcImage} />}
          <p className={styles.fcWord}>{card.front}</p>
          <p className={styles.fcHint}>натисни щоб перегорнути</p>
        </div>
        <div className={styles.fcBack}>
          <p className={styles.fcWord}>{card.back}</p>
          {card.example && <p className={styles.fcExample}>{card.example}</p>}
        </div>
      </div>

      {flipped && (
        <div className={styles.fcActions}>
          <button className={styles.fcDontKnow} onClick={() => handleKnow(false)}>
            ✗ Не знаю
          </button>
          <button className={styles.fcKnowBtn} onClick={() => handleKnow(true)}>
            ✓ Знаю!
          </button>
        </div>
      )}
    </div>
  )
}
