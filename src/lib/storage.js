// Storage abstraction for user data. Branches on authentication state:
// - Authed users: read/write Supabase tables (RLS-enforced per user_id)
// - Anonymous users: read/write localStorage (legacy keys preserved)
//
// Public API exposes db-shape (Supabase column names: name, shade, color_hex,
// snake_case timestamps). Callers in MatchResults / Library / ColorScanner /
// Profile use db-shape; legacy localStorage shapes are translated on read for
// backward compat with pre-Phase-2 user data.
//
// Auth detection uses a module-level cache initialised via getSession() and
// kept fresh via onAuthStateChange. There is a brief race window (~10-50ms)
// at module import time where currentSession is null even for an authed user;
// storage calls fired during that window incorrectly take the anonymous path.
// Acceptable in practice — no UI interaction fires in that window.
//
// Streak/profile coupling: saveStreak and saveProfile both UPDATE the profiles
// row for the current user, but write disjoint columns (streak: current_streak
// + last_scan_date; profile: profile_dna + country + trial_started_at + ...).
// Concurrent calls don't conflict at the database level (column-level UPDATE).
//
// Error handling:
// - Reads: catch internally, return empty default ([] for arrays, {} for
//   objects). Do NOT fall back to localStorage when authed — surfacing
//   anonymous-mode artifacts to authed users would be confusing.
// - Writes: throw on Supabase error. Caller decides UI response (alert today,
//   toast in a future polish phase).
//
// updated_at on profiles is auto-bumped by a Supabase trigger; never pass it
// from the client.

import { supabase } from './supabase'

// ============================================================================
// auth state cache
// ============================================================================

let currentSession = null

supabase.auth.getSession().then(({ data }) => {
  currentSession = data.session
})

supabase.auth.onAuthStateChange((_event, session) => {
  currentSession = session
})

function isAuthed() {
  return !!currentSession?.user
}

function uid() {
  return currentSession?.user?.id ?? null
}

// ============================================================================
// legacy-shape translators
// localStorage data created by pre-Phase-2 app versions uses old field names.
// On read, translate old-shape entries to db-shape so callers see a uniform
// interface. New writes always use db-shape directly.
// ============================================================================

function scanFromLegacy(s) {
  if (s && s.color && typeof s.color === 'object') {
    return {
      color_hex: s.color.hex,
      skin_tone: s.skinTone,
      occasion: s.occasion,
      country: s.country,
      category: s.category,
      advice: s.advice,
      created_at: s.date,
    }
  }
  return s
}

function productFromLegacy(p) {
  if (p && 'productName' in p) {
    return {
      id: p.id,
      name: p.productName,
      brand: p.brand,
      category: p.category,
      hex: p.hex,
      shade: p.colorName,
      price: p.price,
      currency: p.currency,
      rating: p.rating,
      notes: p.notes,
      created_at: p.dateSaved,
    }
  }
  return p
}

function streakFromLegacy(s) {
  if (s && 'count' in s) {
    return { current_streak: s.count, last_scan_date: s.lastDate }
  }
  return s
}

// ============================================================================
// scans (append-only — UX has no delete; Supabase uncapped, localStorage
// capped at 50 for backward compat with existing client-side storage)
// ============================================================================

export async function getScans() {
  if (isAuthed()) {
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', uid())
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[storage] getScans:', error)
      return []
    }
    return data ?? []
  }
  try {
    const lib = JSON.parse(localStorage.getItem('mmm_library') || '{}')
    return (lib.scans || []).map(scanFromLegacy).reverse()
  } catch {
    return []
  }
}

export async function saveScan(scan) {
  if (isAuthed()) {
    const { data, error } = await supabase
      .from('scans')
      .insert({ ...scan, user_id: uid() })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const lib = JSON.parse(localStorage.getItem('mmm_library') || '{}')
  lib.scans = lib.scans || []
  lib.scans.push(scan)
  if (lib.scans.length > 50) lib.scans = lib.scans.slice(-50)
  localStorage.setItem('mmm_library', JSON.stringify(lib))
  return scan
}

// ============================================================================
// saved_products (full CRUD — Library has remove buttons)
// ============================================================================

export async function getSavedProducts() {
  if (isAuthed()) {
    const { data, error } = await supabase
      .from('saved_products')
      .select('*')
      .eq('user_id', uid())
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[storage] getSavedProducts:', error)
      return []
    }
    return data ?? []
  }
  try {
    const raw = JSON.parse(localStorage.getItem('mmm_my_products') || '[]')
    return raw.map(productFromLegacy)
  } catch {
    return []
  }
}

export async function saveProduct(product) {
  if (isAuthed()) {
    const { data, error } = await supabase
      .from('saved_products')
      .insert({ ...product, user_id: uid() })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const raw = JSON.parse(localStorage.getItem('mmm_my_products') || '[]')
  const existing = raw.map(productFromLegacy)
  existing.push(product)
  localStorage.setItem('mmm_my_products', JSON.stringify(existing))
  return product
}

export async function removeSavedProduct(id) {
  if (isAuthed()) {
    const { error } = await supabase
      .from('saved_products')
      .delete()
      .eq('id', id)
      .eq('user_id', uid())
    if (error) throw error
    return
  }
  const raw = JSON.parse(localStorage.getItem('mmm_my_products') || '[]')
  const updated = raw.map(productFromLegacy).filter(p => p.id !== id)
  localStorage.setItem('mmm_my_products', JSON.stringify(updated))
}

// ============================================================================
// saved_shades (full CRUD)
// ============================================================================

export async function getSavedShades() {
  if (isAuthed()) {
    const { data, error } = await supabase
      .from('saved_shades')
      .select('*')
      .eq('user_id', uid())
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[storage] getSavedShades:', error)
      return []
    }
    return data ?? []
  }
  try {
    return JSON.parse(localStorage.getItem('mmm_my_shades') || '[]')
  } catch {
    return []
  }
}

export async function saveShade(shade) {
  if (isAuthed()) {
    const { data, error } = await supabase
      .from('saved_shades')
      .insert({ ...shade, user_id: uid() })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const raw = JSON.parse(localStorage.getItem('mmm_my_shades') || '[]')
  raw.push(shade)
  localStorage.setItem('mmm_my_shades', JSON.stringify(raw))
  return shade
}

export async function removeSavedShade(id) {
  if (isAuthed()) {
    const { error } = await supabase
      .from('saved_shades')
      .delete()
      .eq('id', id)
      .eq('user_id', uid())
    if (error) throw error
    return
  }
  const raw = JSON.parse(localStorage.getItem('mmm_my_shades') || '[]')
  const updated = raw.filter(s => s.id !== id)
  localStorage.setItem('mmm_my_shades', JSON.stringify(updated))
}

// ============================================================================
// saved_looks (full CRUD)
// ============================================================================

export async function getSavedLooks() {
  if (isAuthed()) {
    const { data, error } = await supabase
      .from('saved_looks')
      .select('*')
      .eq('user_id', uid())
      .order('created_at', { ascending: false })
    if (error) {
      console.error('[storage] getSavedLooks:', error)
      return []
    }
    return data ?? []
  }
  try {
    return JSON.parse(localStorage.getItem('mmm_my_looks') || '[]')
  } catch {
    return []
  }
}

export async function saveLook(look) {
  if (isAuthed()) {
    const { data, error } = await supabase
      .from('saved_looks')
      .insert({ ...look, user_id: uid() })
      .select()
      .single()
    if (error) throw error
    return data
  }
  const raw = JSON.parse(localStorage.getItem('mmm_my_looks') || '[]')
  raw.push(look)
  localStorage.setItem('mmm_my_looks', JSON.stringify(raw))
  return look
}

export async function removeSavedLook(id) {
  if (isAuthed()) {
    const { error } = await supabase
      .from('saved_looks')
      .delete()
      .eq('id', id)
      .eq('user_id', uid())
    if (error) throw error
    return
  }
  const raw = JSON.parse(localStorage.getItem('mmm_my_looks') || '[]')
  const updated = raw.filter(l => l.id !== id)
  localStorage.setItem('mmm_my_looks', JSON.stringify(updated))
}

// ============================================================================
// profile (single record — auto-created by handle_new_user trigger on signup)
// ============================================================================

export async function getProfile() {
  if (isAuthed()) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', uid())
      .maybeSingle()
    if (error) {
      console.error('[storage] getProfile:', error)
      return {}
    }
    return data ?? {}
  }
  try {
    return JSON.parse(localStorage.getItem('mmm_profile') || '{}')
  } catch {
    return {}
  }
}

export async function saveProfile(partial) {
  if (isAuthed()) {
    const { data, error } = await supabase
      .from('profiles')
      .update(partial)
      .eq('user_id', uid())
      .select()
      .single()
    if (error) throw error
    return data
  }
  const existing = JSON.parse(localStorage.getItem('mmm_profile') || '{}')
  const next = { ...existing, ...partial }
  localStorage.setItem('mmm_profile', JSON.stringify(next))
  return next
}

// ============================================================================
// streak (lives on profiles row's current_streak + last_scan_date columns)
// ============================================================================

export async function getStreak() {
  if (isAuthed()) {
    const { data, error } = await supabase
      .from('profiles')
      .select('current_streak, last_scan_date')
      .eq('user_id', uid())
      .maybeSingle()
    if (error) {
      console.error('[storage] getStreak:', error)
      return { current_streak: 0, last_scan_date: null }
    }
    return data ?? { current_streak: 0, last_scan_date: null }
  }
  try {
    const raw = JSON.parse(localStorage.getItem('mmm_streak') || '{}')
    const translated = streakFromLegacy(raw)
    return {
      current_streak: translated.current_streak ?? 0,
      last_scan_date: translated.last_scan_date ?? null,
    }
  } catch {
    return { current_streak: 0, last_scan_date: null }
  }
}

export async function saveStreak(streak) {
  if (isAuthed()) {
    const { error } = await supabase
      .from('profiles')
      .update({
        current_streak: streak.current_streak,
        last_scan_date: streak.last_scan_date,
      })
      .eq('user_id', uid())
    if (error) throw error
    return
  }
  localStorage.setItem('mmm_streak', JSON.stringify(streak))
}

// ─────────────────────────────────────────────────────────
// Migration: anon localStorage → authed Supabase
// Called from AuthProvider on SIGNED_IN. Fire-and-forget.
// Safe to call repeatedly: no-ops when localStorage is empty.
// On partial failure, preserves localStorage for retry next SIGNED_IN.
// ─────────────────────────────────────────────────────────
export async function migrateAnonymousData() {
  const rawProducts = JSON.parse(localStorage.getItem('mmm_my_products') || '[]')
  const rawShades = JSON.parse(localStorage.getItem('mmm_my_shades') || '[]')

  if (rawProducts.length === 0 && rawShades.length === 0) {
    return { migrated: 0, skipped: 0, errors: 0 }
  }

  // Defensive session hydration (mirrors Step 5 hotfix pattern)
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    console.warn('[migration] No session on SIGNED_IN — aborting')
    return { migrated: 0, skipped: 0, errors: 1 }
  }

  const userId = session.user.id
  const localProducts = rawProducts.map(productFromLegacy)
  const localShades = rawShades

  // Fetch existing rows for dup detection
  const [productsRes, shadesRes] = await Promise.all([
    supabase.from('saved_products').select('name, brand, shade').eq('user_id', userId),
    supabase.from('saved_shades').select('name, hex').eq('user_id', userId),
  ])

  if (productsRes.error || shadesRes.error) {
    console.warn('[migration] Fetch existing failed — aborting, localStorage preserved',
      productsRes.error || shadesRes.error)
    return { migrated: 0, skipped: 0, errors: 1 }
  }

  const existingProductKeys = new Set(
    (productsRes.data || []).map(p => `${p.name}|${p.brand || ''}|${p.shade || ''}`)
  )
  const existingShadeKeys = new Set(
    (shadesRes.data || []).map(s => `${s.name}|${s.hex}`)
  )

  const productsToInsert = localProducts.filter(
    p => !existingProductKeys.has(`${p.name}|${p.brand || ''}|${p.shade || ''}`)
  )
  const shadesToInsert = localShades.filter(
    s => !existingShadeKeys.has(`${s.name}|${s.hex}`)
  )

  const dupsSkipped =
    (localProducts.length - productsToInsert.length) +
    (localShades.length - shadesToInsert.length)

  let migratedCount = 0
  let errorCount = 0

  if (productsToInsert.length > 0) {
    const rows = productsToInsert.map(p => ({
      user_id: userId,
      name: p.name,
      brand: p.brand || null,
      category: p.category || null,
      hex: p.hex || null,
      shade: p.shade || null,
      price: p.price ?? null,
      currency: p.currency || null,
    }))
    const { error } = await supabase
      .from('saved_products')
      .upsert(rows, {
        onConflict: 'user_id,name,brand,shade',
        ignoreDuplicates: true,
      })
    if (error) {
      console.warn('[migration] Products upsert failed:', error)
      errorCount++
    } else {
      migratedCount += rows.length
    }
  }

  if (shadesToInsert.length > 0) {
    const rows = shadesToInsert.map(s => ({
      user_id: userId,
      name: s.name,
      hex: s.hex,
    }))
    const { error } = await supabase
      .from('saved_shades')
      .upsert(rows, {
        onConflict: 'user_id,name,hex',
        ignoreDuplicates: true,
      })
    if (error) {
      console.warn('[migration] Shades upsert failed:', error)
      errorCount++
    } else {
      migratedCount += rows.length
    }
  }

  if (errorCount === 0) {
    localStorage.removeItem('mmm_my_products')
    localStorage.removeItem('mmm_my_shades')
    console.log(`[migration] Migrated ${migratedCount} items, skipped ${dupsSkipped} dups`)
  } else {
    console.warn(`[migration] Partial failure — localStorage preserved for retry. Migrated ${migratedCount}, errors ${errorCount}`)
  }

  return { migrated: migratedCount, skipped: dupsSkipped, errors: errorCount }
}
