#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
//  BOOTHBOY v2 — Mac Folder Watcher
//  Upload อัตโนมัติไปที่ Next.js API → Supabase Storage + Realtime
//
//  ติดตั้ง: npm install
//  รัน:     node watcher.js
// ═══════════════════════════════════════════════════════════
require('dotenv').config()
const chokidar = require('chokidar')
const path = require('path')
const fs = require('fs')
const os = require('os')

// ── CONFIG ──────────────────────────────────────────────────
const API_URL      = process.env.NEXT_PUBLIC_APP_URL   // https://boothboy.vercel.app
const EVENT_ID     = process.env.ALBUM_ID              // UUID ของ event จาก Supabase
const NAME_TAGS    = process.env.NAME_TAGS || ''
const WATCH_FOLDER = process.env.WATCH_FOLDER || path.join(os.homedir(), 'Desktop', 'boothboy-export')
const IMG_EXTS     = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif'])

// ── VALIDATE ─────────────────────────────────────────────────
const missing = ['NEXT_PUBLIC_APP_URL', 'ALBUM_ID'].filter(k => !process.env[k])
if (missing.length) { console.error('❌ ขาด config ใน .env:', missing.join(', ')); process.exit(1) }

// ── UPLOAD ───────────────────────────────────────────────────
async function uploadFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (!IMG_EXTS.has(ext)) return
  const filename = path.basename(filePath)
  console.log('\n📸', filename)

  try {
    await new Promise(r => setTimeout(r, 800))
    const { default: fetch } = await import('node-fetch')
    const { FormData, Blob } = await import('node-fetch')

    const fileBuffer = fs.readFileSync(filePath)
    const mime = ext.includes('png') ? 'image/png' : ext.includes('webp') ? 'image/webp' : 'image/jpeg'

    const form = new FormData()
    form.append('file', new Blob([fileBuffer], { type: mime }), filename)
    form.append('event_id', EVENT_ID)
    if (NAME_TAGS) form.append('name_tags', NAME_TAGS)

    const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: form })
    const data = await res.json()

    if (!res.ok) throw new Error(data.error || 'Upload failed')
    console.log('✅ ขึ้นเว็บแล้ว:', data.photo?.url)

  } catch (e) {
    console.error('❌', e.message)
  }
}

// ── START ────────────────────────────────────────────────────
if (!fs.existsSync(WATCH_FOLDER)) {
  fs.mkdirSync(WATCH_FOLDER, { recursive: true })
  console.log('📁 สร้างโฟลเดอร์:', WATCH_FOLDER)
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🎯  BOOTHBOY Watcher v2 → Supabase')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📂  Watch:', WATCH_FOLDER)
console.log('🆔  Event:', EVENT_ID)
console.log('🏷   Tags:', NAME_TAGS || '(ไม่มี)')
console.log('🌐  API:  ', API_URL)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('✨  Export รูปจาก Capture One → โฟลเดอร์นี้')
console.log('    รูปจะขึ้นเว็บ + TV อัตโนมัติใน ~5 วินาที\n')

chokidar.watch(WATCH_FOLDER, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 100 },
}).on('add', uploadFile)
