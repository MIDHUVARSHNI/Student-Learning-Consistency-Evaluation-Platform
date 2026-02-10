import React, { useEffect, useState } from 'react'
import api from '../services/api'
import Loading from '../components/Loading'

type Learner = {
  _id: string
  studentId: string
  firstName: string
  lastName: string
  email?: string
}

export default function Learners() {
  const [learners, setLearners] = useState<Learner[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ studentId: '', firstName: '', lastName: '', email: '' })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchLearners()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search])

  async function fetchLearners() {
    setLoading(true)
    try {
      const res = await api.get('/learners', { params: { page, limit: 10, search } })
      setLearners(res.data.data)
      setPage(res.data.page || 1)
      setTotalPages(res.data.totalPages || 1)
    } catch (err) {
      console.error(err)
      alert('Failed to fetch learners. Ensure the backend is running and CORS origin is allowed.')
    } finally {
      setLoading(false)
    }
  }

  async function createLearner(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await api.post('/learners', form)
      setLearners((s) => [res.data, ...s])
      setForm({ studentId: '', firstName: '', lastName: '', email: '' })
      alert('Learner created')
    } catch (err) {
      console.error(err)
      alert('Failed to create learner')
    }
  }

  async function deleteLearner(id: string) {
    if (!confirm('Delete learner?')) return
    try {
      await api.delete(`/learners/${id}`)
      setLearners((s) => s.filter((l) => l._id !== id))
      alert('Deleted')
    } catch (err) {
      console.error(err)
      alert('Failed to delete learner')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Learners</h2>
        <div className="flex items-center">
          <input className="border p-2 mr-2" placeholder="Search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        </div>
      </div>

      <form onSubmit={createLearner} className="mb-4 flex flex-wrap gap-2">
        <input className="border p-2" placeholder="Student ID" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} />
        <input className="border p-2" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        <input className="border p-2" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        <input className="border p-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <button className="bg-blue-600 text-white px-3 py-2 rounded" type="submit">Add</button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loading size={48} /></div>
      ) : (
        <>
          <table className="w-full table-auto border-collapse mb-4">
            <thead>
              <tr className="text-left">
                <th className="border p-2">Student ID</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {learners.map((l) => (
                <tr key={l._id}>
                  <td className="border p-2">{l.studentId}</td>
                  <td className="border p-2">{l.firstName} {l.lastName}</td>
                  <td className="border p-2">{l.email}</td>
                  <td className="border p-2">
                    <button className="text-red-600" onClick={() => deleteLearner(l._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between">
            <div>Page {page} of {totalPages}</div>
            <div className="space-x-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded">Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
