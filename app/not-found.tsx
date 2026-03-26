import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center text-center p-6">
      <p className="text-6xl mb-4">📸</p>
      <h1 className="text-2xl font-bold text-[#0E1420] mb-2">ไม่พบ Event นี้</h1>
      <p className="text-gray-400 text-sm mb-6">URL อาจไม่ถูกต้อง หรือ Event ถูกปิดไปแล้ว</p>
      <Link href="/admin" className="bg-[#4A7CC7] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#2E5BA3] transition">
        ไปหน้า Admin
      </Link>
    </div>
  )
}
