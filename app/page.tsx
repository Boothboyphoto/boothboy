import { redirect } from 'next/navigation'

// หน้าหลัก redirect ไป admin
export default function Home() {
  redirect('/admin')
}
