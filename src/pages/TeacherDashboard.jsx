import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../firebase.js'
import { ref, push, onValue, remove, set } from 'firebase/database'
import { v4 as uuidv4 } from 'uuid'
import ExerciseBuilder from '../components/ExerciseBuilder.jsx'
import styles from './TeacherDashboard.module.css'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [exercises, setExercises] = useState([])
  const [showBuilder, setShowBuilder] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sessionStorage.getItem('teacher_auth')) {
      navigate('/teacher')
      return
    }
    const exercisesRef = ref(db, 'exercises')
    const unsub = onValue(exercisesRef, (snap) => {
      const data = snap.val()
      if (data) {
        const list = Object.entries(data).map(([id, val]) => ({ id, ...val }))
        setExercises(list.sort((a, b) => b.createdAt - a.createdAt))
      } else {
        setExercises([])
      }
      setLoading(false)
    })
    return () => unsub()
  }, [navigate])

  const saveExercise = async (exerciseData) => {
    const id = uuidv4()
    const exerciseRef = ref(db, `exercises/${id}`)
    await set(exerciseRef, {
      ...exerciseData,
      id,
      createdAt: Date.now(),
      status: 'active'
    })
    setShowBuilder(false)
  }

  const deleteExercise = async (id) => {
    if (confirm('Видалити цю вправу?')) {
      await remove(ref(db, `exercises/${id}`))
      await remove(ref(db, `results/${id}`))
    }
  }

  const copyLink = (id) => {
    const url = `${window.location.origin}/exercise/${id}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const typeLabels = {
    'fill-blank': { label: 'Fill in the blank', emoji: '✏️', color: '#DBEAFE' },
    'multiple-choice': { label: 'Multiple choice', emoji: '☑️', color: '#EDE9FE' },
    'match-words': { label: 'Match words', emoji: '🔗', color: '#FEF3C7' },
    'write-sentence': { label: 'Write a sentence', emoji: '📝', color: '#DCFCE7' },
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <h1 className={styles.logo}>🦉 English Exercises</h1>
            <p className={styles.logoSub}>Панель вчителя</p>
          </div>
          <button className={styles.newBtn} onClick={() => setShowBuilder(true)}>
            + Нова вправа
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {loading ? (
          <div className={styles.empty}>
            <div className={styles.spinner} />
          </div>
        ) : exercises.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📚</div>
            <h2>Ще немає вправ</h2>
            <p>Створи першу вправу для своєї учениці!</p>
            <button className={styles.newBtnLarge} onClick={() => setShowBuilder(true)}>
              Створити вправу
            </button>
          </div>
        ) : (
          <div className={styles.grid}>
            {exercises.map((ex, i) => {
              const typeInfo = typeLabels[ex.type] || { label: ex.type, emoji: '📄', color: '#F3F4F6' }
              return (
                <div key={ex.id} className={styles.card} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className={styles.cardTop}>
                    <span className={styles.typeBadge} style={{ background: typeInfo.color }}>
                      {typeInfo.emoji} {typeInfo.label}
                    </span>
                    <span className={styles.date}>
                      {new Date(ex.createdAt).toLocaleDateString('uk-UA')}
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{ex.title}</h3>
                  {ex.description && <p className={styles.cardDesc}>{ex.description}</p>}
                  <div className={styles.cardMeta}>
                    {ex.questions?.length || ex.pairs?.length || 0} завдань
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.copyBtn}
                      onClick={() => copyLink(ex.id)}
                    >
                      {copiedId === ex.id ? '✓ Скопійовано!' : '🔗 Скопіювати посилання'}
                    </button>
                    <button
                      className={styles.resultsBtn}
                      onClick={() => navigate(`/teacher/results/${ex.id}`)}
                    >
                      📊 Результати
                    </button>
                    <button className={styles.deleteBtn} onClick={() => deleteExercise(ex.id)}>
                      🗑
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showBuilder && (
        <ExerciseBuilder
          onSave={saveExercise}
          onClose={() => setShowBuilder(false)}
        />
      )}
    </div>
  )
}
