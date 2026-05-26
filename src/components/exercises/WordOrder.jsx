import { useState, useEffect } from 'react'
import styles from './Exercise.module.css'

export default function WordOrder({ questions, answers, onChange }) {
  return (
    <div className={styles.list}>
      {questions.map((q, i) => (
        <WordOrderItem key={i} question={q} index={i} value={answers[i]} onChange={onChange} />
      ))}
    </div>
  )
}

function WordOrderItem({ question, index, value, onChange }) {
  const [shuffled, setShuffled] = useState([])
  const [placed, setPlaced] = useState([])

  useEffect(() => {
    const words = question.sentence.split(' ').map((w, i) => ({ word: w, id: i }))
    setShuffled([...words].sort(() => Math.random() - 0.5))
    setPlaced([])
  }, [question.sentence])

  const addWord = (wordObj) => {
    const newPlaced = [...placed, wordObj]
    setPlaced(newPlaced)
    setShuffled(shuffled.filter(w => w.id !== wordObj.id))
    onChange(index, newPlaced.map(w => w.word).join(' '))
  }

  const removeWord = (wordObj) => {
    const newPlaced = placed.filter(w => w.id !== wordObj.id)
    setPlaced(newPlaced)
    setShuffled([...shuffled, wordObj])
    onChange(index, newPlaced.map(w => w.word).join(' '))
  }

  const reset = () => {
    const words = question.sentence.split(' ').map((w, i) => ({ word: w, id: i }))
    setShuffled([...words].sort(() => Math.random() - 0.5))
    setPlaced([])
    onChange(index, '')
  }

  return (
    <div className={styles.card}>
      <div className={styles.qNum}>#{index + 1}</div>
      {question.prompt && <p className={styles.sentence}>{question.prompt}</p>}

      <div className={styles.woDropZone}>
        {placed.length === 0
          ? <span className={styles.woPlaceholder}>Натискай слова знизу щоб скласти речення...</span>
          : placed.map((w) => (
            <button key={w.id} className={styles.woWordPlaced} onClick={() => removeWord(w)}>
              {w.word}
            </button>
          ))
        }
      </div>

      <div className={styles.woBank}>
        {shuffled.map((w) => (
          <button key={w.id} className={styles.woWord} onClick={() => addWord(w)}>
            {w.word}
          </button>
        ))}
      </div>

      {placed.length > 0 && (
        <button className={styles.woReset} onClick={reset}>↺ Скинути</button>
      )}
    </div>
  )
}
