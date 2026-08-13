import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './state/AppContext'
import { BottomNav } from './components/BottomNav'
import { Home } from './pages/Home'
import { History } from './pages/History'
import { Notifications } from './pages/Notifications'
import { AddHub } from './pages/AddHub'
import { AddIncome } from './pages/AddIncome'
import { AddExpense } from './pages/AddExpense'

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="flex-1 overflow-y-auto pb-2">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/add" element={<AddHub />} />
            <Route path="/add/income" element={<AddIncome />} />
            <Route path="/add/expense" element={<AddExpense />} />
          </Routes>
        </div>
        <BottomNav />
      </HashRouter>
    </AppProvider>
  )
}

export default App
