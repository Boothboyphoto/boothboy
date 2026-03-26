'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, type Event } from '@/lib/supabase'

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  async function loadEvents() {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
    setEvents(data || [])
    setLoading(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('events').update({ is_active: !current }).eq('id', id)
    loadEvents()
  }

  async function deleteEvent(id: string, name: string) {
    if (!confirm(`ลบ "${name}" ออกจากระบบ? รูปทั้งหมดจะถูกลบด้วย`)) return
    await supabase.from('events').delete().eq('id', id)
    loadEvents()
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-[#F5F0E8]/95 backdrop-blur border-b-4 border-[#F5D020] px-6 h-14 flex items-center justify-between">
        <span className="font-bold text-[#4A7CC7] text-lg tracking-widest">BOOTHBOY</span>
        <Link href="/admin/events/new"
          className="bg-[#4A7CC7] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#2E5BA3] transition">
          + สร้าง Event ใหม่
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-[#0E1420] mb-6">จัดการ Events</h1>

        {loading ? (
          <div className="text-center py-20 text-gray-400">กำลังโหลด...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">ยังไม่มี Event</p>
            <Link href="/admin/events/new"
              className="bg-[#4A7CC7] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2E5BA3]">
              สร้าง Event แรก
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map(event => (
              <div key={event.id}
                className="bg-white rounded-xl p-5 flex items-center gap-4 shadow-sm border border-[rgba(74,124,199,0.15)]">
                {/* Status dot */}
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${event.is_active ? 'bg-green-400' : 'bg-gray-300'}`} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0E1420] truncate">{event.name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {event.date ? new Date(event.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    {event.venue ? ` · ${event.venue}` : ''}
                  </p>
                  {/* URL */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <a href={`/${event.slug}`} target="_blank"
                      className="text-xs text-[#4A7CC7] hover:underline font-mono">
                      /{event.slug}
                    </a>
                    <span className="text-gray-300">|</span>
                    <a href={`/display/${event.slug}`} target="_blank"
                      className="text-xs text-purple-400 hover:underline">
                      📺 Display
                    </a>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(event.id, event.is_active)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                      event.is_active
                        ? 'bg-green-50 text-green-600 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}>
                    {event.is_active ? 'เปิดอยู่' : 'ปิดอยู่'}
                  </button>
                  <Link href={`/admin/events/${event.id}`}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#EBF1FA] text-[#4A7CC7] hover:bg-[#4A7CC7] hover:text-white transition font-medium">
                    แก้ไข
                  </Link>
                  <button onClick={() => deleteEvent(event.id, event.name)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition font-medium">
                    ลบ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
