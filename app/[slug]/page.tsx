import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import GuestGallery from '@/components/GuestGallery'

// Server component — fetch event data
export default async function EventPage({ params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!event) notFound()

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false })

  return <GuestGallery event={event} initialPhotos={photos || []} />
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: event } = await supabase.from('events').select('name,venue,date').eq('slug', params.slug).single()
  return {
    title: event ? `${event.name} | BOOTHBOY` : 'BOOTHBOY',
    description: event ? `ดูรูปถ่ายจากงาน ${event.name}` : '',
  }
}
