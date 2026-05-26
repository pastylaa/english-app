# 🦉 English Exercises — Інструкція з деплою

## Що це?
Платформа для вчителя англійської мови:
- **Вчитель** створює вправи (fill in the blank, multiple choice, match words, write a sentence)
- **Учень** отримує посилання і виконує вправу
- **Вчитель** бачить результати в реальному часі

---

## 🚀 Деплой за 10 хвилин

### Крок 1: Firebase (безкоштовна БД)

1. Зайди на [console.firebase.google.com](https://console.firebase.google.com)
2. Натисни **"Add project"** → придумай назву → Next → Next → Create
3. В лівому меню → **"Realtime Database"** → Create database
   - Вибери регіон (будь-який)
   - Вибери **"Start in test mode"** → Enable
4. В лівому меню → **"Project Settings"** (шестерня вгорі зліва)
5. Прокрути вниз до **"Your apps"** → натисни іконку `</>` (Web)
6. Придумай нікнейм → Register app
7. **Скопіюй весь об'єкт `firebaseConfig`** — він знадобиться

### Крок 2: Налаштуй .env.local

Скопіюй файл `.env.example` → перейменуй в `.env.local`:
```
cp .env.example .env.local
```

Заповни своїми значеннями з Firebase:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=my-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://my-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=my-project
VITE_FIREBASE_STORAGE_BUCKET=my-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

VITE_TEACHER_PASSWORD=мій_секретний_пароль
```

> ⚠️ `.env.local` НЕ завантажується на GitHub (він у .gitignore) — це безпечно

### Крок 3: Деплой на Vercel

1. Зайди на [vercel.com](https://vercel.com) → Sign up with GitHub (безкоштовно)
2. Завантаж цю папку на GitHub:
   ```bash
   git init
   git add .
   git commit -m "initial"
   git remote add origin https://github.com/твій-username/english-app.git
   git push -u origin main
   ```
3. На Vercel: **"New Project"** → Import твій репозиторій
4. **Важливо**: Додай Environment Variables (налаштування проєкту):
   - Копіюй всі рядки з `.env.local` по одному
5. Натисни **Deploy** → чекай 1-2 хв

### Крок 4: Готово! 🎉

Твій сайт буде на адресі: `https://english-app-xxx.vercel.app`

- **Вчитель**: `https://твій-сайт.vercel.app/teacher`
- **Учень**: посилання генерується автоматично після створення вправи

---

## 💻 Локальний запуск (для тестування)

```bash
npm install
cp .env.example .env.local
# заповни .env.local своїми даними
npm run dev
```

Відкрий `http://localhost:5173`

---

## 📱 Як користуватись

### Вчитель:
1. Зайди на `/teacher` → введи пароль
2. Натисни **"+ Нова вправа"**
3. Вибери тип → заповни завдання → збережи
4. Натисни **"🔗 Скопіювати посилання"** → надішли учню
5. Натисни **"📊 Результати"** → спостерігай в реальному часі

### Учень:
1. Отримай посилання від вчителя
2. Введи ім'я → виконай вправу → надішли відповіді

---

## 🔒 Безпека Firebase

Після тестування заміни правила в Realtime Database на:
```json
{
  "rules": {
    "exercises": {
      ".read": true,
      ".write": false,
      "$id": { ".write": false }
    },
    "results": {
      ".read": false,
      ".write": true,
      "$exerciseId": { ".read": false }
    }
  }
}
```
Це дозволить учням читати вправи і записувати результати, але не редагувати.
