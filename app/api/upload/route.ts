import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const eventId = formData.get('event_id') as string
    const nameTags = formData.get('name_tags') as string | null

    if (!file || !eventId) {
      return NextResponse.json({ error: 'file and event_id required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Verify event exists
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Upload to Supabase Storage
    const ext = file.name.split('.').pop() || 'jpg'
    const storagePath = `events/${eventId}/${Date.now()}_${file.name}`
    const buffer = await file.arrayBuffer()

    const { data: uploaded, error: uploadError } = await supabase.storage
      .from('boothboy-photos')
      .upload(storagePath, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('boothboy-photos')
      .getPublicUrl(storagePath)

    // Insert photo record → triggers Realtime
    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        event_id: eventId,
        storage_path: storagePath,
        url: publicUrl,
        filename: file.name,
        name_tags: nameTags || null,
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, photo })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
