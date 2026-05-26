import { Routes, Route, Navigate } from 'react-router-dom'
import TeacherLogin from './pages/TeacherLogin.jsx'
import TeacherDashboard from './pages/TeacherDashboard.jsx'
import ExercisePage from './pages/ExercisePage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/teacher" replace />} />
      <Route path="/teacher" element={<TeacherLogin />} />
      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="/teacher/results/:exerciseId" element={<ResultsPage />} />
      <Route path="/exercise/:exerciseId" element={<ExercisePage />} />
    </Routes>
  )
}

export default App
