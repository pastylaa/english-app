import { useState, useEffect } from 'react'
import styles from './Exercise.module.css'

export default function Anagram({ questions, answers, onChange }) {
  return (
    <div className={styles.list}>
      {questions.map((q, i) => (
        <AnagramItem key={i} question={q} index={i} onChange={onChange} />
      ))}
    </div>
  )
}

function AnagramItem({ question, index, onChange }) {
  const [letters, setLetters] = useState([])
  const [placed, setPlaced] = useState([])

  useEffect(() => {
    const ls = question.word.toUpperCase().split('').map((l, i) => ({ letter: l, id: i }))
    setLetters([...ls].sort(() => Math.random() - 0.5))
    setPlaced([])
  }, [question.word])

  const place = (lObj) => {
    const newPlaced = [...placed, lObj]
    setPlaced(newPlaced)
    setLetters(letters.filter(l => l.id !== lObj.id))
    onChange(index, newPlaced.map(l => l.letter).join(''))
  }

  const remove = (lObj) => {
    const newPlaced = placed.filter(l => l.id !== lObj.id)
    setPlaced(newPlaced)
    setLetters([...letters, lObj])
    onChange(index, newPlaced.map(l => l.letter).join(''))
  }

  return (
    <div className={styles.card}>
      <div className={styles.qNum}>#{index + 1}</div>
      {question.hint && <p className={styles.hint}>💡 {question.hint}</p>}
      {question.imageUrl && <img src={question.imageUrl} alt="" className={styles.anagramImage} />}

      <div className={styles.anagramAnswer}>
        {placed.length === 0
          ? <span className={styles.woPlaceholder}>Натискай букви...</span>
          : placed.map((l) => (
            <button key={l.id} className={styles.anagramLetterPlaced} onClick={() => remove(l)}>
              {l.letter}
            </button>
          ))
        }
      </div>

      <div className={styles.anagramBank}>
        {letters.map((l) => (
          <button key={l.id} className={styles.anagramLetter} onClick={() => place(l)}>
            {l.letter}
          </button>
        ))}
      </div>
    </div>
  )
}
