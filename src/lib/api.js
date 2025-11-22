// Ultra-robust backend base discovery with active probing, rotation, and auto-recovery
// - Tries multiple candidate URLs derived from env + current location
// - Pings fast endpoints (/api/health, /test, /) with timeout
// - Retries requests and rotates base if a fetch fails (CORS/network)
// - Re-probes on visibility change and on hard errors

const HEALTH_PATHS = ["/api/health", "/test", "/"]

const unique = (arr) => Array.from(new Set(arr.filter(Boolean)))

const candidateUrls = () => {
  const out = []
  const env = import.meta.env?.VITE_BACKEND_URL
  if (env && typeof env === 'string' && env.trim()) out.push(env.trim())

  // Allow override via global for debugging
  if (typeof window !== 'undefined' && window.__BACKEND_URL__) out.push(String(window.__BACKEND_URL__))

  try {
    const { protocol, hostname, origin } = window.location

    // 1) Same host on 8000
    out.push(`${protocol}//${hostname}:8000`)

    // 2) Replace :3000 -> :8000
    if (origin.includes(':3000')) out.push(origin.replace(':3000', ':8000'))

    // 3) Modal-style hostname swap -3000. -> -8000.
    const swapModalDot = origin.replace('-3000.', '-8000.')
    if (swapModalDot !== origin) out.push(swapModalDot)

    // 4) Generic -3000 -> -8000 anywhere
    if (origin.includes('-3000')) out.push(origin.replace('-3000', '-8000'))

    // 5) Also try backend subdomain heuristic (portless)
    try {
      const u = new URL(origin)
      if (u.hostname.includes('-3000')) {
        const host8000 = u.hostname.replace('-3000', '-8000')
        out.push(`${u.protocol}//${host8000}`)
      }
    } catch {}

    // 6) Localhost fallbacks
    out.push('http://localhost:8000')
    out.push('https://localhost:8000')
  } catch (_) {
    out.push('http://localhost:8000')
  }

  return unique(out)
}

let resolvedBase = null
let resolving = null
let lastTriedBases = []

async function ping(url, timeoutMs = 1000) {
  // Try multiple quick health endpoints
  for (const p of HEALTH_PATHS) {
    const ctrl = new AbortController()
    const to = setTimeout(() => ctrl.abort('timeout'), timeoutMs)
    try {
      const res = await fetch(`${url}${p}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        mode: 'cors',
        credentials: 'omit',
        signal: ctrl.signal,
      })
      if (res.ok) return true
    } catch (_) {
      // try next path
    } finally {
      clearTimeout(to)
    }
  }
  return false
}

async function resolveBackendBase(force = false) {
  if (resolvedBase && !force) return resolvedBase
  if (resolving && !force) return resolving

  resolving = (async () => {
    const cand = candidateUrls()
    for (const url of cand) {
      const ok = await ping(url)
      if (ok) {
        resolvedBase = url
        lastTriedBases = [url]
        return url
      }
    }
    // If none responded, keep best guess (env or first candidate)
    resolvedBase = cand[0]
    lastTriedBases = [resolvedBase]
    return resolvedBase
  })()

  return resolving
}

export async function getApiBase() {
  return resolveBackendBase()
}

async function handleResponse(res, base) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}) at ${base}: ${text}`)
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}

async function tryAllBases(path, init) {
  const cand = candidateUrls()
  // Put currently resolved base first if present
  const base = resolvedBase || cand[0]
  const ordered = unique([base, ...cand])

  let lastErr = null
  for (const b of ordered) {
    try {
      const res = await fetch(`${b}${path}`, init)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await handleResponse(res, b)
      // lock in working base
      resolvedBase = b
      return data
    } catch (err) {
      lastErr = err
      // probe b quickly; if unhealthy, continue to next
      const ok = await ping(b)
      if (!ok) continue
    }
  }
  throw lastErr || new Error('All backend bases failed')
}

async function doFetch(path, init, retries = 1) {
  // First ensure we have a base (non-blocking if already set)
  try { await resolveBackendBase() } catch {}

  try {
    const res = await fetch(`${resolvedBase}${path}`, init)
    return await handleResponse(res, resolvedBase)
  } catch (err) {
    if (retries > 0) {
      // brief backoff then rotate through all candidates
      await new Promise(r => setTimeout(r, 300))
      try {
        const data = await tryAllBases(path, init)
        return data
      } catch (e) {
        // force re-resolve and one final attempt
        await resolveBackendBase(true)
        return doFetch(path, init, retries - 1)
      }
    }
    throw err
  }
}

export async function apiGet(path) {
  return doFetch(path, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    credentials: 'omit',
    method: 'GET',
    mode: 'cors',
  })
}

export async function apiPost(path, body) {
  return doFetch(path, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    credentials: 'omit',
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(body ?? {}),
  })
}

// Re-probe when the tab becomes visible (containers may have slept)
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) resolveBackendBase(true).catch(() => {})
  })
}
