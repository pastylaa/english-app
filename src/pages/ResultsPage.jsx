import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { db } from '../firebase.js'
import { ref, onValue } from 'firebase/database'
import styles from './ResultsPage.module.css'

export default function ResultsPage() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const [exercise, setExercise] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [pulse, setPulse] = useState(false)
  const [prevCount, setPrevCount] = useState(0)

  useEffect(() => {
    if (!sessionStorage.getItem('teacher_auth')) {
      navigate('/teacher')
      return
    }
    const exRef = ref(db, `exercises/${exerciseId}`)
    onValue(exRef, snap => {
      if (snap.exists()) setExercise(snap.val())
    })
  }, [exerciseId, navigate])

  useEffect(() => {
    const resRef = ref(db, `results/${exerciseId}`)
    const unsub = onValue(resRef, (snap) => {
      const data = snap.val()
      const list = data
        ? Object.values(data).sort((a, b) => b.timestamp - a.timestamp)
        : []
      if (list.length > prevCount && prevCount > 0) {
        setPulse(true)
        setTimeout(() => setPulse(false), 1000)
      }
      setPrevCount(list.length)
      setResults(list)
      setLoading(false)
    })
    return () => unsub()
  }, [exerciseId, prevCount])

  const typeLabels = {
    'fill-blank': 'Fill in the blank',
    'multiple-choice': 'Multiple choice',
    'match-words': 'Match words',
    'write-sentence': 'Write a sentence',
  }

  const getAnswerLabel = (exercise, answers, index) => {
    if (!exercise) return answers[index] || '—'
    if (exercise.type === 'fill-blank') {
      const correct = exercise.questions[index]?.answer || ''
      const student = answers[index] || ''
      const isOk = student.trim().toLowerCase() === correct.trim().toLowerCase()
      return { student, correct, isOk }
    }
    if (exercise.type === 'multiple-choice') {
      const q = exercise.questions[index]
      const chosenIdx = Number(answers[index])
      const student = q?.options[chosenIdx] || '—'
      const correct = q?.options[q?.correct] || ''
      const isOk = chosenIdx === q?.correct
      return { student, correct, isOk }
    }
    return null
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <button className={styles.backBtn} onClick={() => navigate('/teacher/dashboard')}>
              ← Назад
            </button>
            <h1 className={styles.title}>{exercise?.title || 'Результати'}</h1>
            <p className={styles.subtitle}>{typeLabels[exercise?.type] || ''}</p>
          </div>
          <div className={`${styles.liveChip} ${pulse ? styles.livePulse : ''}`}>
            🔴 Live
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {loading ? (
          <div className={styles.center}><div className={styles.spinner} /></div>
        ) : results.length === 0 ? (
          <div className={styles.center}>
            <div className={styles.waitIcon}>⏳</div>
            <h2>Очікуємо відповіді...</h2>
            <p>Як тільки учень виконає вправу — результати з'являться тут автоматично</p>
          </div>
        ) : (
          <div className={styles.resultsList}>
            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <span className={styles.statNum}>{results.length}</span>
                <span className={styles.statLabel}>Виконань</span>
              </div>
              {results[0]?.score && (
                <div className={styles.statBox}>
                  <span className={styles.statNum}>
                    {Math.round(results.reduce((s, r) => s + (r.score?.correct / r.score?.total * 100 || 0), 0) / results.length)}%
                  </span>
                  <span className={styles.statLabel}>Середній результат</span>
                </div>
              )}
            </div>

            {results.map((r, i) => (
              <div key={r.sessionId} className={`${styles.resultCard} ${i === 0 && pulse ? styles.newCard : ''}`}>
                <div className={styles.resultHeader}>
                  <div className={styles.studentInfo}>
                    <span className={styles.studentName}>👤 {r.studentName}</span>
                    <span className={styles.timestamp}>
                      {new Date(r.timestamp).toLocaleString('uk-UA')}
                    </span>
                  </div>
                  {r.score && (
                    <div className={`${styles.scoreBadge} ${
                      r.score.correct === r.score.total ? styles.scorePerfect :
                      r.score.correct >= r.score.total / 2 ? styles.scoreGood : styles.scorePoor
                    }`}>
                      {r.score.correct}/{r.score.total}
                    </div>
                  )}
                </div>

                <div className={styles.answersGrid}>
                  {exercise?.type === 'fill-blank' && exercise.questions.map((q, qi) => {
                    const info = getAnswerLabel(exercise, r.answers, qi)
                    return (
                      <div key={qi} className={`${styles.answerItem} ${info?.isOk ? styles.answerCorrect : styles.answerWrong}`}>
                        <p className={styles.answerQ}>{q.sentence}</p>
                        <p className={styles.answerA}>
                          {info?.isOk ? '✓' : '✗'} <strong>{info?.student || '—'}</strong>
                          {!info?.isOk && <span className={styles.correctAnswer}> (правильно: {info?.correct})</span>}
                        </p>
                      </div>
                    )
                  })}

                  {exercise?.type === 'multiple-choice' && exercise.questions.map((q, qi) => {
                    const info = getAnswerLabel(exercise, r.answers, qi)
                    return (
                      <div key={qi} className={`${styles.answerItem} ${info?.isOk ? styles.answerCorrect : styles.answerWrong}`}>
                        <p className={styles.answerQ}>{q.question}</p>
                        <p className={styles.answerA}>
                          {info?.isOk ? '✓' : '✗'} <strong>{info?.student || '—'}</strong>
                          {!info?.isOk && <span className={styles.correctAnswer}> (правильно: {info?.correct})</span>}
                        </p>
                      </div>
                    )
                  })}

                  {exercise?.type === 'match-words' && (
                    <div className={styles.matchResults}>
                      {exercise.pairs.map((p, pi) => {
                        const matchedRightIdx = r.answers?.[pi]
                        const matched = matchedRightIdx !== undefined ? exercise.pairs[matchedRightIdx]?.right : '—'
                        const isOk = Number(matchedRightIdx) === pi
                        return (
                          <div key={pi} className={`${styles.answerItem} ${isOk ? styles.answerCorrect : styles.answerWrong}`}>
                            <p className={styles.answerQ}>{p.left} ↔ <strong>{matched}</strong></p>
                            <p className={styles.answerA}>
                              {isOk ? '✓ Правильно' : `✗ Правильно: ${p.right}`}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {exercise?.type === 'write-sentence' && exercise.questions.map((q, qi) => (
                    <div key={qi} className={styles.answerItem}>
                      <p className={styles.answerQ}>{q.prompt}</p>
                      <p className={styles.answerA}>📝 {r.answers?.[qi] || <em>без відповіді</em>}</p>
                      {q.example && <p className={styles.exampleAnswer}>Приклад: {q.example}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
