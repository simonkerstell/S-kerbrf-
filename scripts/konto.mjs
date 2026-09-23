#!/usr/bin/env node
// Hantera kontoansökningar från VS Code med Supabase service-nyckel.
//
// Kräver i .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=...
//   SUPABASE_SERVICE_ROLE_KEY=...   (Supabase → Project Settings → API → service_role)
//
// Användning:
//   node scripts/konto.mjs list                 -> visa väntande ansökningar
//   node scripts/konto.mjs list --alla          -> visa alla ansökningar
//   node scripts/konto.mjs approve <email>       -> godkänn + skapa konto (lösenord genereras)
//   node scripts/konto.mjs approve <email> <lösenord>
//   node scripts/konto.mjs reject <email>        -> avvisa ansökan

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'

// --- Ladda .env.local ---
try {
  const txt = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of txt.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch { /* ignoreras – env kan komma från skalet */ }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('❌ Saknar NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY i .env.local')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

function genPassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(10)
  return Array.from(bytes, b => chars[b % chars.length]).join('') + '4k'
}

async function list(alla) {
  let q = admin.from('konto_ansokan').select('*').order('skapad_tid', { ascending: false })
  if (!alla) q = q.eq('status', 'vantar')
  const { data, error } = await q
  if (error) { console.error('❌', error.message); process.exit(1) }
  if (!data.length) { console.log(alla ? 'Inga ansökningar.' : 'Inga väntande ansökningar.'); return }
  for (const a of data) {
    const när = new Date(a.skapad_tid).toLocaleString('sv-SE')
    console.log(`\n• ${a.namn}  <${a.email}>   [${a.status}]`)
    if (a.brf_namn) console.log(`  BRF: ${a.brf_namn}`)
    if (a.telefon) console.log(`  Tel: ${a.telefon}`)
    if (a.meddelande) console.log(`  Meddelande: ${a.meddelande}`)
    console.log(`  Inkom: ${när}`)
  }
  console.log('')
}

async function approve(email, password) {
  if (!email) { console.error('Ange e-post: node scripts/konto.mjs approve <email> [lösenord]'); process.exit(1) }
  password = password || genPassword()

  const { data: ansokan } = await admin
    .from('konto_ansokan').select('*').eq('email', email).eq('status', 'vantar')
    .order('skapad_tid', { ascending: false }).limit(1).maybeSingle()
  const namn = ansokan?.namn || email

  const { data: created, error: authErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
  })
  if (authErr) { console.error('❌ Kunde inte skapa konto:', authErr.message); process.exit(1) }

  const { error: profErr } = await admin.from('profiles').insert({
    id: created.user.id, roll: 'ordforande', namn, email,
  })
  if (profErr) { console.error('❌ Kontot skapades men profilen misslyckades:', profErr.message); process.exit(1) }

  if (ansokan) {
    await admin.from('konto_ansokan').update({ status: 'godkand', hanterad_tid: new Date().toISOString() }).eq('id', ansokan.id)
  }

  console.log('\n✅ Konto skapat!')
  console.log('──────────────────────────────')
  console.log(`  Namn:     ${namn}`)
  console.log(`  E-post:   ${email}`)
  console.log(`  Lösenord: ${password}`)
  console.log('──────────────────────────────')
  console.log('Skicka uppgifterna till användaren. Be dem byta lösenord vid första inloggning.\n')
}

async function reject(email) {
  if (!email) { console.error('Ange e-post: node scripts/konto.mjs reject <email>'); process.exit(1) }
  const { error } = await admin.from('konto_ansokan')
    .update({ status: 'avvisad', hanterad_tid: new Date().toISOString() })
    .eq('email', email).eq('status', 'vantar')
  if (error) { console.error('❌', error.message); process.exit(1) }
  console.log(`Ansökan från ${email} markerad som avvisad.`)
}

const [cmd, ...rest] = process.argv.slice(2)
switch (cmd) {
  case 'list': await list(rest.includes('--alla')); break
  case 'approve': await approve(rest[0], rest[1]); break
  case 'reject': await reject(rest[0]); break
  default:
    console.log('Kommandon:\n  list [--alla]\n  approve <email> [lösenord]\n  reject <email>')
}
