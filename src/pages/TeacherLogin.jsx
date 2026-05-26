import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './TeacherLogin.module.css'

export default function TeacherLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const correctPwd = import.meta.env.VITE_TEACHER_PASSWORD
    if (password === correctPwd) {
      sessionStorage.setItem('teacher_auth', '1')
      navigate('/teacher/dashboard')
    } else {
      setError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ animation: 'fadeIn 0.4s ease' }}>
        <div className={styles.icon}>🦉</div>
        <h1 className={styles.title}>English Exercises</h1>
        <p className={styles.subtitle}>Вхід для вчителя</p>

        <form onSubmit={handleSubmit} className={`${styles.form} ${shaking ? styles.shake : ''}`}>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false) }}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            autoFocus
          />
          {error && <p className={styles.error}>Невірний пароль</p>}
          <button type="submit" className={styles.button}>Увійти →</button>
        </form>

        <p className={styles.hint}>
          Хочеш пройти вправу як учень?<br />
          <span className={styles.hintMuted}>Скористайся посиланням від вчителя</span>
        </p>
      </div>
    </div>
  )
}
