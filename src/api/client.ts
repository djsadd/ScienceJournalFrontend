const API_BASE = 'http://localhost:8000/'
const TOKEN_KEY = 'sj_tokens'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  json?: unknown
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  tokenType?: string
}

const buildUrl = (path: string, params?: RequestOptions['params']) => {
  const url = new URL(path.replace(/^\//, ''), API_BASE)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) return
      url.searchParams.set(key, String(value))
    })
  }
  return url.toString()
}

const readTokens = (): AuthTokens | null => {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    return raw ? (JSON.parse(raw) as AuthTokens) : null
  } catch (e) {
    console.error('Failed to read tokens', e)
    return null
  }
}

const persistTokens = (tokens: AuthTokens | null) => {
  if (!tokens) {
    localStorage.removeItem(TOKEN_KEY)
    return
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
}

let currentTokens = readTokens()
let refreshPromise: Promise<AuthTokens | null> | null = null

const doRefresh = async (): Promise<AuthTokens | null> => {
  if (!currentTokens?.refreshToken) return null
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(buildUrl('/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: currentTokens?.refreshToken }),
        })
        if (!res.ok) throw new Error(await res.text())
        const data = (await res.json()) as { access_token: string; refresh_token?: string; token_type?: string }
        const tokens: AuthTokens = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token ?? currentTokens?.refreshToken,
          tokenType: data.token_type ?? 'bearer',
        }
        currentTokens = tokens
        persistTokens(tokens)
        return tokens
      } catch (err) {
        console.error('Token refresh failed', err)
        currentTokens = null
        persistTokens(null)
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

const request = async <T>(path: string, method: HttpMethod = 'GET', options: RequestOptions = {}): Promise<T> => {
  const { params, json, headers, ...rest } = options
  const url = buildUrl(path, params)

  const makeRequest = async () => {
    const isFormData = rest.body instanceof FormData

    const resolvedHeaders: HeadersInit = {
      ...(json && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(currentTokens?.accessToken ? { Authorization: `Bearer ${currentTokens.accessToken}` } : {}),
      ...(headers || {}),
    }

    return fetch(url, {
      method,
      headers: resolvedHeaders,
      body: json ? JSON.stringify(json) : rest.body,
      ...rest,
    })
  }

  let response = await makeRequest()
  if (response.status === 401) {
    const refreshed = await doRefresh()
    if (refreshed) {
      response = await makeRequest()
    }
  }

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API error ${response.status}: ${text}`)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, 'GET', options),
  post: <T>(path: string, json?: unknown, options?: RequestOptions) => request<T>(path, 'POST', { ...options, json }),
  put: <T>(path: string, json?: unknown, options?: RequestOptions) => request<T>(path, 'PUT', { ...options, json }),
  patch: <T>(path: string, json?: unknown, options?: RequestOptions) => request<T>(path, 'PATCH', { ...options, json }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, 'DELETE', options),
  request,
  baseUrl: API_BASE,
  setTokens: (tokens: AuthTokens | null) => {
    currentTokens = tokens
    persistTokens(tokens)
  },
  getTokens: () => currentTokens,
  logout: () => {
    currentTokens = null
    persistTokens(null)
  },
}
