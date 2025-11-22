const inferBackendBase = () => {
  const env = import.meta.env.VITE_BACKEND_URL
  if (env && typeof env === 'string' && env.trim().length > 0) return env.trim()
  try {
    const { protocol, hostname, port, origin } = window.location
    if (origin.includes('-3000')) return origin.replace('-3000', '-8000')
    if (origin.includes(':3000')) return origin.replace(':3000', ':8000')
    if (hostname && port === '3000') return `${protocol}//${hostname}:8000`
    return `${protocol}//${hostname}:8000`
  } catch (e) {
    return 'http://localhost:8000'
  }
}

export const API_BASE = inferBackendBase()

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Request failed (${res.status}) at ${API_BASE}: ${text}`)
  }
  return res.json()
}

async function doFetch(input, init, retries = 1) {
  try {
    const res = await fetch(input, init)
    return await handleResponse(res)
  } catch (err) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 300))
      return doFetch(input, init, retries - 1)
    }
    throw err
  }
}

export async function apiGet(path) {
  return doFetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    credentials: 'omit',
    method: 'GET',
    mode: 'cors',
  })
}

export async function apiPost(path, body) {
  return doFetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    credentials: 'omit',
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify(body ?? {}),
  })
}
