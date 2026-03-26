'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[\u0E00-\u0E7F]+/g, (m) => encodeURIComponent(m).replace(/%/g, '').toLowerCase())
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function NewEventPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', slug: '', date: '', venue: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleName(name: string) {
    setForm(f => ({ ...f, name, slug: toSlug(name) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.slug) return setError('กรอก ชื่องาน และ Slug ด้วยนะครับ')
    setSaving(true)
    setError('')
    const { error } = await supabase.from('events').insert({
      name: form.name,
      slug: form.slug,
      date: form.date || null,
      venue: form.venue || null,
      description: form.description || null,
      is_active: true,
    })
    if (error) {
      setError(error.message.includes('unique') ? 'Slug นี้ใช้แล้ว กรุณาเปลี่ยน' : error.message)
      setSaving(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <nav className="sticky top-0 z-50 bg-[#F5F0E8]/95 backdrop-blur border-b-4 border-[#F5D020] px-6 h-14 flex items-center gap-3">
        <Link href="/admin" className="text-[#4A7CC7] hover:underline text-sm">← กลับ</Link>
        <span className="font-bold text-[#4A7CC7] text-lg tracking-widest">BOOTHBOY</span>
      </nav>

      <main className="max-w-lg mx-auto p-6">
        <h1 className="text-2xl font-bold text-[#0E1420] mb-6">สร้าง Event ใหม่</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-[rgba(74,124,199,0.15)] space-y-5">
          {/* ชื่องาน */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              ชื่องาน *
            </label>
            <input
              value={form.name}
              onChange={e => handleName(e.target.value)}
              placeholder="เช่น งานแต่ง James & Ploy"
              className="w-full border-2 border-[rgba(74,124,199,0.2)] rounded-lg px-3 py-2.5 text-sm focus:border-[#4A7CC7] outline-none"
            />
          </div>

          {/* Slug / URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              URL Slug *
            </label>
            <div className="flex items-center border-2 border-[rgba(74,124,199,0.2)] rounded-lg overflow-hidden focus-within:border-[#4A7CC7]">
              <span className="px-3 py-2.5 text-xs text-gray-400 bg-gray-50 border-r border-[rgba(74,124,199,0.2)] whitespace-nowrap">
                yourdomain.com/
              </span>
              <input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                placeholder="james-ploy-wedding"
                className="flex-1 px-3 py-2.5 text-sm outline-none font-mono"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">ใช้ตัวอักษร a-z, ตัวเลข, และ - เท่านั้น</p>
          </div>

          {/* วันที่ */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">วันที่จัดงาน</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full border-2 border-[rgba(74,124,199,0.2)] rounded-lg px-3 py-2.5 text-sm focus:border-[#4A7CC7] outline-none"
            />
          </div>

          {/* สถานที่ */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">สถานที่</label>
            <input
              value={form.venue}
              onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
              placeholder="เช่น Mandarin Oriental Bangkok"
              className="w-full border-2 border-[rgba(74,124,199,0.2)] rounded-lg px-3 py-2.5 text-sm focus:border-[#4A7CC7] outline-none"
            />
          </div>

          {/* หมายเหตุ */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">รายละเอียดเพิ่มเติม</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="เพิ่มเติม (optional)"
              className="w-full border-2 border-[rgba(74,124,199,0.2)] rounded-lg px-3 py-2.5 text-sm focus:border-[#4A7CC7] outline-none resize-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#4A7CC7] text-white py-3 rounded-lg font-semibold text-sm hover:bg-[#2E5BA3] transition disabled:opacity-60">
            {saving ? 'กำลังสร้าง...' : '✨ สร้าง Event'}
          </button>
        </form>
      </main>
    </div>
  )
}
