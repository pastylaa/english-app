import { useState } from 'react'
import styles from './ExerciseBuilder.module.css'

const TYPES = [
  { id: 'fill-blank', label: 'Fill in the blank', emoji: '✏️', desc: 'Вставити пропущене слово' },
  { id: 'multiple-choice', label: 'Multiple choice', emoji: '☑️', desc: 'Вибір правильної відповіді' },
  { id: 'match-words', label: 'Match words', emoji: '🔗', desc: "З'єднати слова у пари (+ фото)" },
  { id: 'write-sentence', label: 'Write a sentence', emoji: '📝', desc: 'Написати речення / перекласти' },
  { id: 'word-order', label: 'Word order', emoji: '🔀', desc: 'Скласти речення зі слів' },
  { id: 'drag-fill', label: 'Drag & fill', emoji: '🎯', desc: 'Вибрати слово для пропуску (3 варіанти)' },
  { id: 'flashcards', label: 'Flash cards', emoji: '🃏', desc: 'Перегорнути картку — побачити переклад' },
  { id: 'anagram', label: 'Anagram', emoji: '🔤', desc: 'Розставити букви у правильному порядку' },
  { id: 'memory', label: "Пам'ять", emoji: '🧠', desc: 'Знайти відповідні пари карток' },
]

export default function ExerciseBuilder({ onSave, onClose }) {
  const [step, setStep] = useState(1)
  const [type, setType] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const [fillQuestions, setFillQuestions] = useState([{ sentence: '', answer: '', hint: '' }])
  const [mcQuestions, setMcQuestions] = useState([{ question: '', options: ['', '', '', ''], correct: 0 }])
  const [pairs, setPairs] = useState([{ left: '', right: '', imageUrl: '' }, { left: '', right: '', imageUrl: '' }, { left: '', right: '', imageUrl: '' }])
  const [writePrompts, setWritePrompts] = useState([{ prompt: '', example: '' }])
  const [wordOrderQ, setWordOrderQ] = useState([{ sentence: '', prompt: '' }])
  const [dragFillQ, setDragFillQ] = useState([{ sentence: '', options: ['', '', ''] }])
  const [flashCards, setFlashCards] = useState([{ front: '', back: '', example: '', imageUrl: '' }])
  const [anagramQ, setAnagramQ] = useState([{ word: '', hint: '', imageUrl: '' }])
  const [memoryPairs, setMemoryPairs] = useState([{ left: '', right: '', imageUrl: '' }, { left: '', right: '', imageUrl: '' }, { left: '', right: '', imageUrl: '' }])

  const handleSave = () => {
    if (!title.trim()) return alert('Введи назву вправи')
    const base = { title, description, type }

    if (type === 'fill-blank') {
      const valid = fillQuestions.filter(q => q.sentence && q.answer)
      if (!valid.length) return alert('Додай хоча б одне речення')
      onSave({ ...base, questions: valid })
    } else if (type === 'multiple-choice') {
      const valid = mcQuestions.filter(q => q.question)
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
    } else if (type === 'word-order') {
      const valid = wordOrderQ.filter(q => q.sentence)
      if (!valid.length) return alert('Додай хоча б одне речення')
      onSave({ ...base, questions: valid })
    } else if (type === 'drag-fill') {
      const valid = dragFillQ.filter(q => q.sentence && q.options[0])
      if (!valid.length) return alert('Додай хоча б одне завдання')
      onSave({ ...base, questions: valid })
    } else if (type === 'flashcards') {
      const valid = flashCards.filter(c => c.front && c.back)
      if (!valid.length) return alert('Додай хоча б одну картку')
      onSave({ ...base, cards: valid })
    } else if (type === 'anagram') {
      const valid = anagramQ.filter(q => q.word)
      if (!valid.length) return alert('Додай хоча б одне слово')
      onSave({ ...base, questions: valid })
    } else if (type === 'memory') {
      const valid = memoryPairs.filter(p => p.left && p.right)
      if (valid.length < 2) return alert('Додай хоча б 2 пари')
      onSave({ ...base, pairs: valid })
    }
  }

  const selectedType = TYPES.find(t => t.id === type)

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{step === 1 ? 'Тип вправи' : `Нова вправа: ${selectedType?.label || ''}`}</h2>
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
                <input className={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Наприклад: Тема Їжа — лексика" />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Опис (необов'язково)</label>
                <input className={styles.input} value={description} onChange={e => setDescription(e.target.value)} placeholder="Коротка підказка для учня" />
              </div>
              <div className={styles.divider} />

              {type === 'fill-blank' && <FillBlankEditor questions={fillQuestions} onChange={setFillQuestions} />}
              {type === 'multiple-choice' && <MultipleChoiceEditor questions={mcQuestions} onChange={setMcQuestions} />}
              {type === 'match-words' && <MatchWordsEditor pairs={pairs} onChange={setPairs} />}
              {type === 'write-sentence' && <WriteSentenceEditor prompts={writePrompts} onChange={setWritePrompts} />}
              {type === 'word-order' && <WordOrderEditor questions={wordOrderQ} onChange={setWordOrderQ} />}
              {type === 'drag-fill' && <DragFillEditor questions={dragFillQ} onChange={setDragFillQ} />}
              {type === 'flashcards' && <FlashcardsEditor cards={flashCards} onChange={setFlashCards} />}
              {type === 'anagram' && <AnagramEditor questions={anagramQ} onChange={setAnagramQ} />}
              {type === 'memory' && <MemoryEditor pairs={memoryPairs} onChange={setMemoryPairs} />}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          {step === 2 && <button className={styles.backBtn} onClick={() => setStep(1)}>← Назад</button>}
          <div style={{ flex: 1 }} />
          {step === 1 && <button className={styles.nextBtn} disabled={!type} onClick={() => setStep(2)}>Далі →</button>}
          {step === 2 && <button className={styles.saveBtn} onClick={handleSave}>💾 Зберегти вправу</button>}
        </div>
      </div>
    </div>
  )
}

// ---- Fill in the Blank ----
function FillBlankEditor({ questions, onChange }) {
  const update = (i, f, v) => { const q=[...questions]; q[i]={...q[i],[f]:v}; onChange(q) }
  const add = () => onChange([...questions, { sentence: '', answer: '', hint: '' }])
  const remove = (i) => onChange(questions.filter((_,idx)=>idx!==i))
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>✏️ Речення з пропуском</h4>
      <p className={styles.sectionHint}>Напиши речення з пропуском і правильну відповідь</p>
      {questions.map((q, i) => (
        <div key={i} className={styles.questionBlock}>
          <div className={styles.questionNum}>#{i+1}</div>
          <div className={styles.questionFields}>
            <input className={styles.input} value={q.sentence} onChange={e=>update(i,'sentence',e.target.value)} placeholder='She ___ a student.' />
            <div className={styles.row2}>
              <input className={styles.input} value={q.answer} onChange={e=>update(i,'answer',e.target.value)} placeholder="Правильна відповідь" />
              <input className={styles.input} value={q.hint} onChange={e=>update(i,'hint',e.target.value)} placeholder="Підказка (необов'язково)" />
            </div>
          </div>
          {questions.length > 1 && <button className={styles.removeBtn} onClick={()=>remove(i)}>✕</button>}
        </div>
      ))}
      <button className={styles.addBtn} onClick={add}>+ Додати речення</button>
    </div>
  )
}

// ---- Multiple Choice ----
function MultipleChoiceEditor({ questions, onChange }) {
  const update = (i, f, v) => { const q=[...questions]; q[i]={...q[i],[f]:v}; onChange(q) }
  const updateOpt = (qi, oi, v) => { const q=[...questions]; const opts=[...q[qi].options]; opts[oi]=v; q[qi]={...q[qi],options:opts}; onChange(q) }
  const add = () => onChange([...questions, { question:'', options:['','','',''], correct:0 }])
  const remove = (i) => onChange(questions.filter((_,idx)=>idx!==i))
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>☑️ Питання з варіантами</h4>
      {questions.map((q, i) => (
        <div key={i} className={styles.questionBlock}>
          <div className={styles.questionNum}>#{i+1}</div>
          <div className={styles.questionFields}>
            <input className={styles.input} value={q.question} onChange={e=>update(i,'question',e.target.value)} placeholder="Питання..." />
            <p className={styles.miniLabel}>Варіанти (✓ = правильний):</p>
            {q.options.map((opt, oi) => (
              <div key={oi} className={styles.optionRow}>
                <button className={`${styles.correctBtn} ${q.correct===oi?styles.correctActive:''}`} onClick={()=>update(i,'correct',oi)}>
                  {q.correct===oi?'✓':'○'}
                </button>
                <input className={styles.input} value={opt} onChange={e=>updateOpt(i,oi,e.target.value)} placeholder={`Варіант ${oi+1}`} />
              </div>
            ))}
          </div>
          {questions.length>1 && <button className={styles.removeBtn} onClick={()=>remove(i)}>✕</button>}
        </div>
      ))}
      <button className={styles.addBtn} onClick={add}>+ Додати питання</button>
    </div>
  )
}

// ---- Match Words (with images) ----
function MatchWordsEditor({ pairs, onChange }) {
  const update = (i, f, v) => { const p=[...pairs]; p[i]={...p[i],[f]:v}; onChange(p) }
  const add = () => onChange([...pairs, { left:'', right:'', imageUrl:'' }])
  const remove = (i) => onChange(pairs.filter((_,idx)=>idx!==i))
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>🔗 Пари для з'єднання</h4>
      <p className={styles.sectionHint}>Зліва — слово, справа — відповідність. Можна додати фото (URL з інтернету)</p>
      {pairs.map((p, i) => (
        <div key={i} className={styles.questionBlock} style={{flexDirection:'column'}}>
          <div style={{display:'flex',gap:10,alignItems:'center',width:'100%'}}>
            <span className={styles.questionNum} style={{paddingTop:0}}>#{i+1}</span>
            <input className={styles.input} value={p.left} onChange={e=>update(i,'left',e.target.value)} placeholder="Apple" />
            <span style={{color:'var(--brown)',opacity:.5,flexShrink:0}}>↔</span>
            <input className={styles.input} value={p.right} onChange={e=>update(i,'right',e.target.value)} placeholder="Яблуко" />
            {pairs.length>2 && <button className={styles.removeBtn} onClick={()=>remove(i)}>✕</button>}
          </div>
          <div style={{paddingLeft:32,marginTop:8}}>
            <input className={styles.input} value={p.imageUrl||''} onChange={e=>update(i,'imageUrl',e.target.value)} placeholder="🖼 Посилання на картинку (необов'язково)" style={{fontSize:12}} />
          </div>
          {p.imageUrl && <img src={p.imageUrl} alt="" style={{maxHeight:60,marginLeft:32,marginTop:6,borderRadius:6,objectFit:'contain'}} />}
        </div>
      ))}
      <button className={styles.addBtn} onClick={add}>+ Додати пару</button>
    </div>
  )
}

// ---- Write Sentence ----
function WriteSentenceEditor({ prompts, onChange }) {
  const update = (i, f, v) => { const p=[...prompts]; p[i]={...p[i],[f]:v}; onChange(p) }
  const add = () => onChange([...prompts, { prompt:'', example:'' }])
  const remove = (i) => onChange(prompts.filter((_,idx)=>idx!==i))
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>📝 Написати речення</h4>
      {prompts.map((p, i) => (
        <div key={i} className={styles.questionBlock}>
          <div className={styles.questionNum}>#{i+1}</div>
          <div className={styles.questionFields}>
            <input className={styles.input} value={p.prompt} onChange={e=>update(i,'prompt',e.target.value)} placeholder="Перекладіть: Вона йде до школи" />
            <input className={styles.input} value={p.example} onChange={e=>update(i,'example',e.target.value)} placeholder="Приклад відповіді: She goes to school" />
          </div>
          {prompts.length>1 && <button className={styles.removeBtn} onClick={()=>remove(i)}>✕</button>}
        </div>
      ))}
      <button className={styles.addBtn} onClick={add}>+ Додати завдання</button>
    </div>
  )
}

// ---- Word Order ----
function WordOrderEditor({ questions, onChange }) {
  const update = (i, f, v) => { const q=[...questions]; q[i]={...q[i],[f]:v}; onChange(q) }
  const add = () => onChange([...questions, { sentence:'', prompt:'' }])
  const remove = (i) => onChange(questions.filter((_,idx)=>idx!==i))
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>🔀 Склади речення</h4>
      <p className={styles.sectionHint}>Введи правильне речення — букви автоматично перемішаються для учня</p>
      {questions.map((q, i) => (
        <div key={i} className={styles.questionBlock}>
          <div className={styles.questionNum}>#{i+1}</div>
          <div className={styles.questionFields}>
            <input className={styles.input} value={q.sentence} onChange={e=>update(i,'sentence',e.target.value)} placeholder="She goes to school every day." />
            <input className={styles.input} value={q.prompt} onChange={e=>update(i,'prompt',e.target.value)} placeholder="Підказка: Перекладіть речення (необов'язково)" />
          </div>
          {questions.length>1 && <button className={styles.removeBtn} onClick={()=>remove(i)}>✕</button>}
        </div>
      ))}
      <button className={styles.addBtn} onClick={add}>+ Додати речення</button>
    </div>
  )
}

// ---- Drag Fill ----
function DragFillEditor({ questions, onChange }) {
  const update = (i, f, v) => { const q=[...questions]; q[i]={...q[i],[f]:v}; onChange(q) }
  const updateOpt = (qi, oi, v) => { const q=[...questions]; const opts=[...q[qi].options]; opts[oi]=v; q[qi]={...q[qi],options:opts}; onChange(q) }
  const add = () => onChange([...questions, { sentence:'', options:['','',''] }])
  const remove = (i) => onChange(questions.filter((_,idx)=>idx!==i))
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>🎯 Встав слово (3 варіанти)</h4>
      <p className={styles.sectionHint}>Використай ___ для пропуску. Перший варіант — правильна відповідь</p>
      {questions.map((q, i) => (
        <div key={i} className={styles.questionBlock}>
          <div className={styles.questionNum}>#{i+1}</div>
          <div className={styles.questionFields}>
            <input className={styles.input} value={q.sentence} onChange={e=>update(i,'sentence',e.target.value)} placeholder="She ___ to school every day." />
            <div className={styles.row2} style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
              <input className={styles.input} value={q.options[0]} onChange={e=>updateOpt(i,0,e.target.value)} placeholder="✓ Правильне" style={{borderColor:'var(--green)'}} />
              <input className={styles.input} value={q.options[1]} onChange={e=>updateOpt(i,1,e.target.value)} placeholder="✗ Хибне 1" />
              <input className={styles.input} value={q.options[2]} onChange={e=>updateOpt(i,2,e.target.value)} placeholder="✗ Хибне 2" />
            </div>
          </div>
          {questions.length>1 && <button className={styles.removeBtn} onClick={()=>remove(i)}>✕</button>}
        </div>
      ))}
      <button className={styles.addBtn} onClick={add}>+ Додати завдання</button>
    </div>
  )
}

// ---- Flashcards ----
function FlashcardsEditor({ cards, onChange }) {
  const update = (i, f, v) => { const c=[...cards]; c[i]={...c[i],[f]:v}; onChange(c) }
  const add = () => onChange([...cards, { front:'', back:'', example:'', imageUrl:'' }])
  const remove = (i) => onChange(cards.filter((_,idx)=>idx!==i))
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>🃏 Флеш-картки</h4>
      {cards.map((c, i) => (
        <div key={i} className={styles.questionBlock} style={{flexDirection:'column'}}>
          <div style={{display:'flex',gap:10,alignItems:'flex-start',width:'100%'}}>
            <span className={styles.questionNum}>#{i+1}</span>
            <div className={styles.questionFields} style={{flex:1}}>
              <div className={styles.row2}>
                <input className={styles.input} value={c.front} onChange={e=>update(i,'front',e.target.value)} placeholder="Слово (англ.)" />
                <input className={styles.input} value={c.back} onChange={e=>update(i,'back',e.target.value)} placeholder="Переклад" />
              </div>
              <input className={styles.input} value={c.example||''} onChange={e=>update(i,'example',e.target.value)} placeholder="Приклад вживання (необов'язково)" />
              <input className={styles.input} value={c.imageUrl||''} onChange={e=>update(i,'imageUrl',e.target.value)} placeholder="🖼 Посилання на картинку (необов'язково)" style={{fontSize:12}} />
            </div>
            {cards.length>1 && <button className={styles.removeBtn} onClick={()=>remove(i)}>✕</button>}
          </div>
          {c.imageUrl && <img src={c.imageUrl} alt="" style={{maxHeight:60,marginLeft:32,marginTop:6,borderRadius:6,objectFit:'contain'}} />}
        </div>
      ))}
      <button className={styles.addBtn} onClick={add}>+ Додати картку</button>
    </div>
  )
}

// ---- Anagram ----
function AnagramEditor({ questions, onChange }) {
  const update = (i, f, v) => { const q=[...questions]; q[i]={...q[i],[f]:v}; onChange(q) }
  const add = () => onChange([...questions, { word:'', hint:'', imageUrl:'' }])
  const remove = (i) => onChange(questions.filter((_,idx)=>idx!==i))
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>🔤 Анаграма</h4>
      <p className={styles.sectionHint}>Введи слово — букви перемішаються для учня</p>
      {questions.map((q, i) => (
        <div key={i} className={styles.questionBlock} style={{flexDirection:'column'}}>
          <div style={{display:'flex',gap:10,alignItems:'flex-start',width:'100%'}}>
            <span className={styles.questionNum}>#{i+1}</span>
            <div className={styles.questionFields} style={{flex:1}}>
              <div className={styles.row2}>
                <input className={styles.input} value={q.word} onChange={e=>update(i,'word',e.target.value)} placeholder="Apple" />
                <input className={styles.input} value={q.hint||''} onChange={e=>update(i,'hint',e.target.value)} placeholder="Підказка (необов'язково)" />
              </div>
              <input className={styles.input} value={q.imageUrl||''} onChange={e=>update(i,'imageUrl',e.target.value)} placeholder="🖼 Посилання на картинку (необов'язково)" style={{fontSize:12}} />
            </div>
            {questions.length>1 && <button className={styles.removeBtn} onClick={()=>remove(i)}>✕</button>}
          </div>
          {q.imageUrl && <img src={q.imageUrl} alt="" style={{maxHeight:60,marginLeft:32,marginTop:6,borderRadius:6,objectFit:'contain'}} />}
        </div>
      ))}
      <button className={styles.addBtn} onClick={add}>+ Додати слово</button>
    </div>
  )
}

// ---- Memory Game ----
function MemoryEditor({ pairs, onChange }) {
  const update = (i, f, v) => { const p=[...pairs]; p[i]={...p[i],[f]:v}; onChange(p) }
  const add = () => onChange([...pairs, { left:'', right:'', imageUrl:'' }])
  const remove = (i) => onChange(pairs.filter((_,idx)=>idx!==i))
  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>🧠 Пам'ять — пари карток</h4>
      <p className={styles.sectionHint}>Можна додати картинку зліва — учень буде поєднувати фото зі словом</p>
      {pairs.map((p, i) => (
        <div key={i} className={styles.questionBlock} style={{flexDirection:'column'}}>
          <div style={{display:'flex',gap:10,alignItems:'center',width:'100%'}}>
            <span className={styles.questionNum} style={{paddingTop:0}}>#{i+1}</span>
            <input className={styles.input} value={p.left} onChange={e=>update(i,'left',e.target.value)} placeholder="Apple" />
            <span style={{color:'var(--brown)',opacity:.5,flexShrink:0}}>↔</span>
            <input className={styles.input} value={p.right} onChange={e=>update(i,'right',e.target.value)} placeholder="Яблуко" />
            {pairs.length>2 && <button className={styles.removeBtn} onClick={()=>remove(i)}>✕</button>}
          </div>
          <div style={{paddingLeft:32,marginTop:8}}>
            <input className={styles.input} value={p.imageUrl||''} onChange={e=>update(i,'imageUrl',e.target.value)} placeholder="🖼 Посилання на картинку (необов'язково)" style={{fontSize:12}} />
          </div>
          {p.imageUrl && <img src={p.imageUrl} alt="" style={{maxHeight:60,marginLeft:32,marginTop:6,borderRadius:6,objectFit:'contain'}} />}
        </div>
      ))}
      <button className={styles.addBtn} onClick={add}>+ Додати пару</button>
    </div>
  )
}
