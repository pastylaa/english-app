import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../firebase.js'
import { ref, onValue, push, set } from 'firebase/database'
import { v4 as uuidv4 } from 'uuid'
import FillBlank from '../components/exercises/FillBlank.jsx'
import MultipleChoice from '../components/exercises/MultipleChoice.jsx'
import MatchWords from '../components/exercises/MatchWords.jsx'
import WriteSentence from '../components/exercises/WriteSentence.jsx'
import styles from './ExercisePage.module.css'

export default function ExercisePage() {
  const { exerciseId } = useParams()
  const [exercise, setExercise] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [studentName, setStudentName] = useState('')
  const [nameSet, setNameSet] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)

  useEffect(() => {
    const savedName = sessionStorage.getItem(`name_${exerciseId}`)
    if (savedName) { setStudentName(savedName); setNameSet(true) }
  }, [exerciseId])

  useEffect(() => {
    const exRef = ref(db, `exercises/${exerciseId}`)
    const unsub = onValue(exRef, (snap) => {
      if (snap.exists()) {
        setExercise(snap.val())
      } else {
        setNotFound(true)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [exerciseId])

  const handleAnswer = (qIndex, value) => {
    setAnswers(prev => ({ ...prev, [qIndex]: value }))
  }

  const handleSubmit = async () => {
    if (!exercise) return
    const sessionId = uuidv4()
    const timestamp = Date.now()

    // Calculate score for auto-graded types
    let calculatedScore = null
    let total = 0
    let correct = 0

    if (exercise.type === 'fill-blank') {
      total = exercise.questions.length
      exercise.questions.forEach((q, i) => {
        if (answers[i]?.trim().toLowerCase() === q.answer.trim().toLowerCase()) correct++
      })
      calculatedScore = { correct, total }
    } else if (exercise.type === 'multiple-choice') {
      total = exercise.questions.length
      exercise.questions.forEach((q, i) => {
        if (Number(answers[i]) === q.correct) correct++
      })
      calculatedScore = { correct, total }
    } else if (exercise.type === 'match-words') {
      total = exercise.pairs.length
      exercise.pairs.forEach((p, i) => {
        if (answers[i] === i) correct++ // answers[i] = index of matched right item
      })
      calculatedScore = { correct, total }
    }

    const result = {
      sessionId,
      studentName,
      answers,
      score: calculatedScore,
      timestamp,
      exerciseId,
      exerciseTitle: exercise.title,
      exerciseType: exercise.type,
    }

    const resultRef = ref(db, `results/${exerciseId}/${sessionId}`)
    await set(resultRef, result)

    setScore(calculatedScore)
    setSubmitted(true)
  }

  if (loading) return (
    <div className={styles.center}>
      <div className={styles.spinner} />
    </div>
  )

  if (notFound) return (
    <div className={styles.center}>
      <div className={styles.card}>
        <div className={styles.bigEmoji}>😕</div>
        <h2>Вправу не знайдено</h2>
        <p>Перевір посилання або попроси вчителя надіслати його знову.</p>
      </div>
    </div>
  )

  if (!nameSet) return (
    <div className={styles.center}>
      <div className={styles.card} style={{ animation: 'fadeIn 0.4s ease' }}>
        <div className={styles.bigEmoji}>👋</div>
        <h2 className={styles.exerciseTitle}>{exercise?.title}</h2>
        <p className={styles.exerciseDesc}>{exercise?.description}</p>
        <div className={styles.nameForm}>
          <label className={styles.nameLabel}>Як тебе звати?</label>
          <input
            className={styles.nameInput}
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            placeholder="Твоє ім'я"
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter' && studentName.trim()) {
                sessionStorage.setItem(`name_${exerciseId}`, studentName.trim())
                setNameSet(true)
              }
            }}
          />
          <button
            className={styles.startBtn}
            disabled={!studentName.trim()}
            onClick={() => {
              sessionStorage.setItem(`name_${exerciseId}`, studentName.trim())
              setNameSet(true)
            }}
          >
            Розпочати вправу →
          </button>
        </div>
      </div>
    </div>
  )

  if (submitted) return (
    <div className={styles.center}>
      <div className={styles.card} style={{ animation: 'fadeIn 0.4s ease' }}>
        <div className={styles.bigEmoji}>
          {score ? (score.correct === score.total ? '🌟' : score.correct >= score.total / 2 ? '🎉' : '💪') : '✅'}
        </div>
        <h2 className={styles.doneTitle}>
          {score
            ? score.correct === score.total ? 'Відмінно!' : 'Молодець!'
            : 'Вправу виконано!'
          }
        </h2>
        {score && (
          <div className={styles.scoreBox}>
            <span className={styles.scoreNum}>{score.correct}</span>
            <span className={styles.scoreSlash}>/</span>
            <span className={styles.scoreTotal}>{score.total}</span>
          </div>
        )}
        <p className={styles.doneText}>
          Твій вчитель вже бачить результати. Гарна робота, {studentName}! 🎈
        </p>
        {exercise.type === 'write-sentence' && (
          <div className={styles.writeDoneAnswers}>
            {exercise.questions.map((q, i) => (
              <div key={i} className={styles.writeDoneItem}>
                <p className={styles.writeDonePrompt}>{q.prompt}</p>
                <p className={styles.writeDoneStudentAnswer}>Твоя відповідь: <em>{answers[i] || '—'}</em></p>
                {q.example && <p className={styles.writeDoneExample}>Приклад: <em>{q.example}</em></p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <header className={styles.exHeader}>
        <div className={styles.exHeaderInner}>
          <div>
            <h1 className={styles.exTitle}>{exercise.title}</h1>
            {exercise.description && <p className={styles.exDesc}>{exercise.description}</p>}
          </div>
          <div className={styles.studentChip}>{studentName} 👤</div>
        </div>
      </header>

      <main className={styles.exMain}>
        {exercise.type === 'fill-blank' && (
          <FillBlank questions={exercise.questions} answers={answers} onChange={handleAnswer} />
        )}
        {exercise.type === 'multiple-choice' && (
          <MultipleChoice questions={exercise.questions} answers={answers} onChange={handleAnswer} />
        )}
        {exercise.type === 'match-words' && (
          <MatchWords pairs={exercise.pairs} answers={answers} onChange={handleAnswer} />
        )}
        {exercise.type === 'write-sentence' && (
          <WriteSentence questions={exercise.questions} answers={answers} onChange={handleAnswer} />
        )}

        <div className={styles.submitRow}>
          <button className={styles.submitBtn} onClick={handleSubmit}>
            Відправити відповіді ✓
          </button>
        </div>
      </main>
    </div>
  )
}
