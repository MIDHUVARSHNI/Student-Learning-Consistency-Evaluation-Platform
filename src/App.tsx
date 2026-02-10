import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Learners from './pages/Learners'
import Toast from './components/Toast'

export default function App() {
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Student Learning Platform</h1>
      </header>
      <main>
        <Routes>
          <Route path="/learners" element={<Learners />} />
          <Route path="/" element={<Learners />} />
        </Routes>
      </main>
      <div id="toasts" className="fixed right-4 bottom-4" />
      <Toast message="" style={{ display: 'none' } as any} />
    </div>
  )
}
