import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import RealtimeDisplay from '@/components/RealtimeDisplay'

export default async function DisplayPage({ params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!event) notFound()

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return <RealtimeDisplay event={event} initialPhotos={photos || []} />
}
