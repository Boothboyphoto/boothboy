'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, type Event } from '@/lib/supabase'

export default function EditEventPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [form, setForm] = useState({ name: '', slug: '', date: '', venue: '', description: '', is_active: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('events').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (data) setForm({
          name: data.name,
          slug: data.slug,
          date: data.date || '',
          venue: data.venue || '',
          description: data.description || '',
          is_active: data.is_active,
        })
        setLoading(false)
      })
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { error } = await supabase.from('events').update({
      name: form.name,
      slug: form.slug,
      date: form.date || null,
      venue: form.venue || null,
      description: form.description || null,
      is_active: form.is_active,
    }).eq('id', id)
    if (error) { setError(error.message); setSaving(false) }
    else router.push('/admin')
  }

  if (loading) return <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center text-gray-400">กำลังโหลด...</div>

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <nav className="sticky top-0 z-50 bg-[#F5F0E8]/95 backdrop-blur border-b-4 border-[#F5D020] px-6 h-14 flex items-center gap-3">
        <Link href="/admin" className="text-[#4A7CC7] hover:underline text-sm">← กลับ</Link>
        <span className="font-bold text-[#4A7CC7] text-lg tracking-widest">BOOTHBOY</span>
      </nav>

      <main className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-bold text-[#0E1420] mb-6">แก้ไข Event</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(74,124,199,0.15)] space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">ชื่องาน *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border-2 border-[rgba(74,124,199,0.2)] rounded-lg px-3 py-2.5 text-sm focus:border-[#4A7CC7] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">URL Slug *</label>
            <div className="flex items-center border-2 border-[rgba(74,124,199,0.2)] rounded-lg overflow-hidden focus-within:border-[#4A7CC7]">
              <span className="px-3 py-2.5 text-xs text-gray-400 bg-gray-50 border-r border-[rgba(74,124,199,0.2)]">yourdomain.com/</span>
              <input value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                className="flex-1 px-3 py-2.5 text-sm outline-none font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">วันที่จัดงาน</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border-2 border-[rgba(74,124,199,0.2)] rounded-lg px-3 py-2.5 text-sm focus:border-[#4A7CC7] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">สถานที่</label>
            <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
              className="w-full border-2 border-[rgba(74,124,199,0.2)] rounded-lg px-3 py-2.5 text-sm focus:border-[#4A7CC7] outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">รายละเอียด</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} className="w-full border-2 border-[rgba(74,124,199,0.2)] rounded-lg px-3 py-2.5 text-sm focus:border-[#4A7CC7] outline-none resize-none" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="active" checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="w-4 h-4 accent-[#4A7CC7]" />
            <label htmlFor="active" className="text-sm font-medium text-[#0E1420]">เปิดให้เข้าชม</label>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={saving}
            className="w-full bg-[#4A7CC7] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#2E5BA3] transition disabled:opacity-60">
            {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        </form>
      </main>
    </div>
  )
}
