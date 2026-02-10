import React from 'react'

export default function Loading({ size = 40 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="animate-spin border-4 border-blue-300 border-t-blue-600 rounded-full" />
  )
}
