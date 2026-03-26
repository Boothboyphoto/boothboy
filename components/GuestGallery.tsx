'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase, type Event, type Photo } from '@/lib/supabase'

export default function GuestGallery({ event, initialPhotos }: { event: Event; initialPhotos: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Photo | null>(null)

  // Realtime subscription — รูปใหม่ขึ้นทันที
  useEffect(() => {
    const channel = supabase
      .channel(`gallery:${event.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'photos',
        filter: `event_id=eq.${event.id}`,
      }, payload => {
        setPhotos(prev => [payload.new as Photo, ...prev])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [event.id])

  const filtered = search
    ? photos.filter(p => p.filename?.toLowerCase().includes(search.toLowerCase()) || p.name_tags?.toLowerCase().includes(search.toLowerCase()))
    : photos

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* HEADER */}
      <header className="bg-[#4A7CC7] text-white px-6 py-10 text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-white/60 mb-2">BOOTHBOY</p>
        <h1 className="text-3xl font-bold mb-1">{event.name}</h1>
        {event.venue && <p className="text-white/70 text-sm">{event.venue}</p>}
        {event.date && (
          <p className="text-white/60 text-xs mt-1">
            {new Date(event.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/70">{photos.length} รูป · อัปเดตอัตโนมัติ</span>
        </div>
      </header>

      {/* SEARCH */}
      <div className="sticky top-0 z-10 bg-[#F5F0E8]/95 backdrop-blur border-b border-[rgba(74,124,199,0.15)] px-4 py-3">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 ค้นหาชื่อหรือ tag..."
          className="w-full max-w-md mx-auto block border-2 border-[rgba(74,124,199,0.2)] rounded-full px-4 py-2 text-sm focus:border-[#4A7CC7] outline-none bg-white"
        />
      </div>

      {/* GRID */}
      <main className="p-4 max-w-6xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            {photos.length === 0 ? 'รอรูปจากช่างภาพนะครับ...' : 'ไม่พบรูปที่ค้นหา'}
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {filtered.map(photo => (
              <div key={photo.id}
                className="break-inside-avoid cursor-pointer rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                onClick={() => setSelected(photo)}>
                <img
                  src={photo.url}
                  alt={photo.filename || ''}
                  className="w-full object-cover"
                  loading="lazy"
                />
                {photo.name_tags && (
                  <div className="px-3 py-2">
                    {photo.name_tags.split(',').map(tag => (
                      <span key={tag} className="inline-block text-xs bg-[#EBF1FA] text-[#4A7CC7] rounded-full px-2 py-0.5 mr-1 mb-1">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* LIGHTBOX */}
      {selected && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <img src={selected.url} alt="" className="max-h-[80vh] max-w-full rounded-lg object-contain" onClick={e => e.stopPropagation()} />
          <div className="mt-4 flex gap-3">
            <a href={selected.url} download={selected.filename || 'photo'}
              onClick={e => e.stopPropagation()}
              className="bg-white text-[#0E1420] px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-100 transition">
              ⬇ ดาวน์โหลด
            </a>
            <button onClick={() => setSelected(null)}
              className="bg-white/20 text-white px-5 py-2.5 rounded-full text-sm hover:bg-white/30 transition">
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
