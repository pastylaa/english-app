import styles from './Exercise.module.css'

export default function FillBlank({ questions, answers, onChange }) {
  return (
    <div className={styles.list}>
      {questions.map((q, i) => (
        <div key={i} className={styles.card} style={{ animationDelay: `${i * 0.06}s` }}>
          <div className={styles.qNum}>#{i + 1}</div>
          <p className={styles.sentence}>{q.sentence}</p>
          {q.hint && <p className={styles.hint}>💡 {q.hint}</p>}
          <input
            className={styles.textInput}
            value={answers[i] || ''}
            onChange={e => onChange(i, e.target.value)}
            placeholder="Твоя відповідь..."
          />
        </div>
      ))}
    </div>
  )
}
