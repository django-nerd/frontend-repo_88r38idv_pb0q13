// Robust backend base discovery with active probing and retries
const candidateUrls = () => {
  const out = []
  const env = import.meta.env?.VITE_BACKEND_URL
  if (env && typeof env === 'string' && env.trim()) out.push(env.trim())

  try {
    const { protocol, hostname, port, origin } = window.location
    // 1) Same host, port 8000
    out.push(`${protocol}//${hostname}:8000`)

    // 2) Replace :3000 -> :8000 explicitly
    if (origin.includes(':3000')) out.push(origin.replace(':3000', ':8000'))

    // 3) Modal-style hostname swap -3000. -> -8000.
    const swapModal = origin.replace('-3000.', '-8000.')
    if (swapModal !== origin) out.push(swapModal)

    // 4) Generic -3000 -> -8000 anywhere
    if (origin.includes('-3000')) out.push(origin.replace('-3000', '-8000'))

    // 5) Fallback to http(s) localhost
    out.push('http://localhost:8000')
    if (protocol === 'https:') out.push('https://localhost:8000')
  } catch (_) {
    out.push('http://localhost:8000')
  }

  // Deduplicate while preserving order
  return Array.from(new Set(out))
}

let resolvedBase = null
let resolving = null

async function ping(url, path = '/test', timeoutMs = 1200) {
  const ctrl = new AbortController()
  const to = setTimeout(() => ctrl.abort('timeout'), timeoutMs)
  try {
    const res = await fetch(`${url}${path}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      mode: 'cors',
      credentials: 'omit',
      signal: ctrl.signal,
    })
    if (!res.ok) throw new Error(`status ${res.status}`)
    await res.json().catch(() => ({}))
    return true
  } catch (_) {
    return false
  } finally {
    clearTimeout(to)
  }
}

async function resolveBackendBase() {
  if (resolvedBase) return resolvedBase
  if (resolving) return resolving

  resolving = (async () => {
    const cand = candidateUrls()
    for (const url of cand) {
      const ok = await ping(url)
      if (ok) {
        resolvedBase = url
        return url
      }
    }
    // If none responded, keep best guess (env or first candidate)
    resolvedBase = cand[0]
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

async function doFetch(path, init, retries = 1) {
  const base = await resolveBackendBase()
  try {
    const res = await fetch(`${base}${path}`, init)
    return await handleResponse(res, base)
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 350))
      return doFetch(path, init, retries - 1)
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
