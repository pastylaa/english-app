import styles from './Exercise.module.css'

export default function MultipleChoice({ questions, answers, onChange }) {
  return (
    <div className={styles.list}>
      {questions.map((q, i) => (
        <div key={i} className={styles.card} style={{ animationDelay: `${i * 0.06}s` }}>
          <div className={styles.qNum}>#{i + 1}</div>
          <p className={styles.sentence}>{q.question}</p>
          <div className={styles.options}>
            {q.options.filter(o => o).map((opt, oi) => (
              <button
                key={oi}
                className={`${styles.option} ${String(answers[i]) === String(oi) ? styles.optionSelected : ''}`}
                onClick={() => onChange(i, oi)}
              >
                <span className={styles.optionLetter}>{String.fromCharCode(65 + oi)}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
