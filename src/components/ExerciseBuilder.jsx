import { useState } from 'react'
import styles from './ExerciseBuilder.module.css'

const TYPES = [
  { id: 'fill-blank', label: 'Fill in the blank', emoji: '✏️', desc: 'Вставити пропущене слово' },
  { id: 'multiple-choice', label: 'Multiple choice', emoji: '☑️', desc: 'Вибір правильної відповіді' },
  { id: 'match-words', label: 'Match words', emoji: '🔗', desc: "З'єднати слова у пари" },
  { id: 'write-sentence', label: 'Write a sentence', emoji: '📝', desc: 'Написати речення / перекласти' },
]

export default function ExerciseBuilder({ onSave, onClose }) {
  const [step, setStep] = useState(1) // 1: choose type, 2: fill content
  const [type, setType] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  // Fill in the blank
  const [fillQuestions, setFillQuestions] = useState([{ sentence: '', answer: '', hint: '' }])

  // Multiple choice
  const [mcQuestions, setMcQuestions] = useState([{
    question: '', options: ['', '', '', ''], correct: 0
  }])

  // Match words
  const [pairs, setPairs] = useState([
    { left: '', right: '' },
    { left: '', right: '' },
    { left: '', right: '' },
  ])

  // Write sentence
  const [writePrompts, setWritePrompts] = useState([{ prompt: '', example: '' }])

  const handleSave = () => {
    if (!title.trim()) return alert('Введи назву вправи')
    const base = { title, description, type }

    if (type === 'fill-blank') {
      const valid = fillQuestions.filter(q => q.sentence && q.answer)
      if (!valid.length) return alert('Додай хоча б одне речення з відповіддю')
      onSave({ ...base, questions: valid })
    } else if (type === 'multiple-choice') {
      const valid = mcQuestions.filter(q => q.question && q.options.some(o => o))
      if (!valid.length) return alert('Додай хоча б одне питання')
      onSave({ ...base, questions: valid })
    } else if (type === 'match-words') {
      const valid = pairs.filter(p => p.left && p.right)
      if (valid.length < 2) return alert('Додай хоча б 2 пари')
      onSave({ ...base, pairs: valid })
    } else if (type === 'write-sentence') {
      const valid = writePrompts.filter(p => p.prompt)
      if (!valid.length) return alert('Додай хоча б одне завдання')
      onSave({ ...base, questions: valid })
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{step === 1 ? 'Тип вправи' : `Нова вправа: ${type ? TYPES.find(t=>t.id===type)?.label : ''}`}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          {step === 1 && (
            <div className={styles.typeGrid}>
              {TYPES.map(t => (
                <button
                  key={t.id}
                  className={`${styles.typeCard} ${type === t.id ? styles.typeCardActive : ''}`}
                  onClick={() => setType(t.id)}
                >
                  <span className={styles.typeEmoji}>{t.emoji}</span>
                  <span className={styles.typeLabel}>{t.label}</span>
                  <span className={styles.typeDesc}>{t.desc}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className={styles.formBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Назва вправи *</label>
                <input
                  className={styles.input}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Наприклад: Present Simple — to be"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Опис (необов'язково)</label>
                <input
                  className={styles.input}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Коротка підказка для учня"
                />
              </div>

              <div className={styles.divider} />

              {type === 'fill-blank' && (
                <FillBlankEditor questions={fillQuestions} onChange={setFillQuestions} />
              )}
              {type === 'multiple-choice' && (
                <MultipleChoiceEditor questions={mcQuestions} onChange={setMcQuestions} />
              )}
              {type === 'match-words' && (
                <MatchWordsEditor pairs={pairs} onChange={setPairs} />
              )}
              {type === 'write-sentence' && (
                <WriteSentenceEditor prompts={writePrompts} onChange={setWritePrompts} />
              )}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          {step === 2 && (
            <button className={styles.backBtn} onClick={() => setStep(1)}>← Назад</button>
          )}
          <div style={{ flex: 1 }} />
          {step === 1 && (
            <button
              className={styles.nextBtn}
              disabled={!type}
              onClick={() => setStep(2)}
            >
              Далі →
            </button>
          )}
          {step === 2 && (
            <button className={styles.saveBtn} onClick={handleSave}>
              💾 Зберегти вправу
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ---- Fill in the Blank ----
function FillBlankEditor({ questions, onChange }) {
  const update = (i, field, val) => {
    const q = [...questions]
    q[i] = { ...q[i], [field]: val }
    onChange(q)
  }
  const add = () => onChange([...questions, { sentence: '', answer: '', hint: '' }])
  const remove = (i) => onChange(questions.filter((_, idx) => idx !== i))

  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>✏️ Речення з пропуском</h4>
      <p className={styles.sectionHint}>
        Напиши речення і правильну відповідь (слово, яке треба вставити)
      </p>
      {questions.map((q, i) => (
        <div key={i} className={styles.questionBlock}>
          <div className={styles.questionNum}>#{i + 1}</div>
          <div className={styles.questionFields}>
            <input
              className={styles.input}
              value={q.sentence}
              onChange={e => update(i, 'sentence', e.target.value)}
              placeholder="She ___ a student. (The blank is ___)"
            />
            <div className={styles.row2}>
              <input
                className={styles.input}
                value={q.answer}
                onChange={e => update(i, 'answer', e.target.value)}
                placeholder="Правильна відповідь"
              />
              <input
                className={styles.input}
                value={q.hint}
                onChange={e => update(i, 'hint', e.target.value)}
                placeholder="Підказка (необов'язково)"
              />
            </div>
          </div>
          {questions.length > 1 && (
            <button className={styles.removeBtn} onClick={() => remove(i)}>✕</button>
          )}
        </div>
      ))}
      <button className={styles.addBtn} onClick={add}>+ Додати речення</button>
    </div>
  )
}

// ---- Multiple Choice ----
function MultipleChoiceEditor({ questions, onChange }) {
  const update = (i, field, val) => {
    const q = [...questions]
    q[i] = { ...q[i], [field]: val }
    onChange(q)
  }
  const updateOption = (qi, oi, val) => {
    const q = [...questions]
    const opts = [...q[qi].options]
    opts[oi] = val
    q[qi] = { ...q[qi], options: opts }
    onChange(q)
  }
  const add = () => onChange([...questions, { question: '', options: ['', '', '', ''], correct: 0 }])
  const remove = (i) => onChange(questions.filter((_, idx) => idx !== i))

  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>☑️ Питання з варіантами</h4>
      {questions.map((q, i) => (
        <div key={i} className={styles.questionBlock}>
          <div className={styles.questionNum}>#{i + 1}</div>
          <div className={styles.questionFields}>
            <input
              className={styles.input}
              value={q.question}
              onChange={e => update(i, 'question', e.target.value)}
              placeholder="Питання або речення..."
            />
            <p className={styles.miniLabel}>Варіанти (натисни ✓ щоб позначити правильний):</p>
            {q.options.map((opt, oi) => (
              <div key={oi} className={styles.optionRow}>
                <button
                  className={`${styles.correctBtn} ${q.correct === oi ? styles.correctActive : ''}`}
                  onClick={() => update(i, 'correct', oi)}
                >
                  {q.correct === oi ? '✓' : '○'}
                </button>
                <input
                  className={styles.input}
                  value={opt}
                  onChange={e => updateOption(i, oi, e.target.value)}
                  placeholder={`Варіант ${oi + 1}`}
                />
              </div>
            ))}
          </div>
          {questions.length > 1 && (
            <button className={styles.removeBtn} onClick={() => remove(i)}>✕</button>
          )}
        </div>
      ))}
      <button className={styles.addBtn} onClick={add}>+ Додати питання</button>
    </div>
  )
}

// ---- Match Words ----
function MatchWordsEditor({ pairs, onChange }) {
  const update = (i, side, val) => {
    const p = [...pairs]
    p[i] = { ...p[i], [side]: val }
    onChange(p)
  }
  const add = () => onChange([...pairs, { left: '', right: '' }])
  const remove = (i) => onChange(pairs.filter((_, idx) => idx !== i))

  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>🔗 Пари для з'єднання</h4>
      <p className={styles.sectionHint}>Зліва — слово/фраза, справа — відповідність (переклад, синонім тощо)</p>
      {pairs.map((p, i) => (
        <div key={i} className={styles.pairRow}>
          <input
            className={styles.input}
            value={p.left}
            onChange={e => update(i, 'left', e.target.value)}
            placeholder="Apple"
          />
          <span className={styles.arrow}>↔</span>
          <input
            className={styles.input}
            value={p.right}
            onChange={e => update(i, 'right', e.target.value)}
            placeholder="Яблуко"
          />
          {pairs.length > 2 && (
            <button className={styles.removeBtn} onClick={() => remove(i)}>✕</button>
          )}
        </div>
      ))}
      <button className={styles.addBtn} onClick={add}>+ Додати пару</button>
    </div>
  )
}

// ---- Write Sentence ----
function WriteSentenceEditor({ prompts, onChange }) {
  const update = (i, field, val) => {
    const p = [...prompts]
    p[i] = { ...p[i], [field]: val }
    onChange(p)
  }
  const add = () => onChange([...prompts, { prompt: '', example: '' }])
  const remove = (i) => onChange(prompts.filter((_, idx) => idx !== i))

  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>📝 Написати речення</h4>
      <p className={styles.sectionHint}>Завдання для учня + зразок відповіді (показується після виконання)</p>
      {prompts.map((p, i) => (
        <div key={i} className={styles.questionBlock}>
          <div className={styles.questionNum}>#{i + 1}</div>
          <div className={styles.questionFields}>
            <input
              className={styles.input}
              value={p.prompt}
              onChange={e => update(i, 'prompt', e.target.value)}
              placeholder="Перекладіть: Вона йде до школи"
            />
            <input
              className={styles.input}
              value={p.example}
              onChange={e => update(i, 'example', e.target.value)}
              placeholder="Приклад відповіді: She goes to school"
            />
          </div>
          {prompts.length > 1 && (
            <button className={styles.removeBtn} onClick={() => remove(i)}>✕</button>
          )}
        </div>
      ))}
      <button className={styles.addBtn} onClick={add}>+ Додати завдання</button>
    </div>
  )
}
