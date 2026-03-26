'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, type Event, type Photo } from '@/lib/supabase'

export default function RealtimeDisplay({ event, initialPhotos }: { event: Event; initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [current, setCurrent] = useState(0)
  const [isNew, setIsNew] = useState(false)

  // Auto-advance slideshow
  useEffect(() => {
    if (photos.length <= 1) return
    const t = setInterval(() => {
      setCurrent(c => (c + 1) % photos.length)
    }, 5000)
    return () => clearInterval(t)
  }, [photos.length])

  // Realtime: รูปใหม่เข้า → แสดงทันที
  useEffect(() => {
    const channel = supabase
      .channel(`display:${event.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'photos',
        filter: `event_id=eq.${event.id}`,
      }, payload => {
        const newPhoto = payload.new as Photo
        setPhotos(prev => [newPhoto, ...prev])
        setCurrent(0)
        setIsNew(true)
        setTimeout(() => setIsNew(false), 3000)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [event.id])

  const photo = photos[current]

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden">
      {/* Main photo */}
      <div className="flex-1 relative flex items-center justify-center">
        {photo ? (
          <img
            key={photo.id}
            src={photo.url}
            alt=""
            className={`max-h-screen max-w-full object-contain transition-all duration-700 ${isNew ? 'scale-105 brightness-110' : 'scale-100'}`}
          />
        ) : (
          <div className="text-center text-white/30">
            <p className="text-6xl mb-4">📸</p>
            <p className="text-xl">รอรูปจากช่างภาพ...</p>
          </div>
        )}

        {/* NEW photo flash */}
        {isNew && (
          <div className="absolute inset-0 border-4 border-[#F5D020] pointer-events-none animate-pulse rounded" />
        )}
      </div>

      {/* Bottom bar */}
      <div className="bg-black/80 backdrop-blur px-8 py-4 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-lg">{event.name}</p>
          {event.venue && <p className="text-white/50 text-sm">{event.venue}</p>}
        </div>
        <div className="text-right">
          <p className="text-[#F5D020] font-bold text-2xl">{photos.length}</p>
          <p className="text-white/50 text-xs">รูปทั้งหมด</p>
        </div>
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-1 p-2 bg-black overflow-x-auto scrollbar-hide">
          {photos.slice(0, 10).map((p, i) => (
            <img
              key={p.id}
              src={p.url}
              alt=""
              onClick={() => setCurrent(i)}
              className={`h-12 w-16 object-cover rounded cursor-pointer flex-shrink-0 transition-all ${i === current ? 'ring-2 ring-[#F5D020] opacity-100' : 'opacity-40 hover:opacity-70'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
