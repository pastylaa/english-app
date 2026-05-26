import styles from './Exercise.module.css'

export default function WriteSentence({ questions, answers, onChange }) {
  return (
    <div className={styles.list}>
      {questions.map((q, i) => (
        <div key={i} className={styles.card} style={{ animationDelay: `${i * 0.06}s` }}>
          <div className={styles.qNum}>#{i + 1}</div>
          <p className={styles.sentence}>{q.prompt}</p>
          <textarea
            className={styles.textarea}
            value={answers[i] || ''}
            onChange={e => onChange(i, e.target.value)}
            placeholder="Напиши своє речення..."
            rows={3}
          />
        </div>
      ))}
    </div>
  )
}
