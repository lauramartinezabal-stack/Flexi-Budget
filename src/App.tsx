import { HashRouter, Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { useNotificationEngine } from './hooks/useNotificationEngine'
import Dashboard from './pages/Dashboard'
import AddEntry from './pages/AddEntry'
import History from './pages/History'
import Alerts from './pages/Alerts'

function AppShell() {
  useNotificationEngine()

  return (
    <div className="min-h-svh flex flex-col">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddEntry />} />
          <Route path="/history" element={<History />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
  )
}
