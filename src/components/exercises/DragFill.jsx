import { useState, useEffect } from 'react'
import styles from './Exercise.module.css'

export default function DragFill({ questions, answers, onChange }) {
  return (
    <div className={styles.list}>
      {questions.map((q, i) => (
        <DragFillItem key={i} question={q} index={i} value={answers[i]} onChange={onChange} />
      ))}
    </div>
  )
}

function DragFillItem({ question, index, value, onChange }) {
  // question.sentence has ___ for blank
  // question.options = [correct, wrong1, wrong2]
  const [shuffledOptions, setShuffledOptions] = useState([])
  const [chosen, setChosen] = useState(null)

  useEffect(() => {
    setShuffledOptions([...question.options].sort(() => Math.random() - 0.5))
    setChosen(null)
  }, [question.options?.join(',')])

  const parts = question.sentence.split('___')

  const pick = (opt) => {
    if (chosen === opt) {
      setChosen(null)
      onChange(index, '')
    } else {
      setChosen(opt)
      onChange(index, opt)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.qNum}>#{index + 1}</div>
      <div className={styles.dfSentence}>
        <span>{parts[0]}</span>
        <span className={`${styles.dfBlank} ${chosen ? styles.dfFilled : ''}`}>
          {chosen || '___'}
        </span>
        <span>{parts[1]}</span>
      </div>

      <div className={styles.woBank}>
        {shuffledOptions.map((opt, i) => (
          <button
            key={i}
            className={`${styles.woWord} ${chosen === opt ? styles.woWordChosen : ''}`}
            onClick={() => pick(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
