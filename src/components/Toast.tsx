import React from 'react'

type ToastProps = { message: string; type?: 'info' | 'success' | 'error' }

export default function Toast({ message, type = 'info' }: ToastProps) {
  const bg = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  return (
    <div className={`${bg} text-white px-4 py-2 rounded shadow`}>{message}</div>
  )
}
