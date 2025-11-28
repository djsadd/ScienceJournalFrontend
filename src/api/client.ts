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

export class ApiError extends Error {
  status: number
  bodyText: string
  bodyJson?: unknown
  url: string

  constructor(message: string, opts: { status: number; bodyText: string; bodyJson?: unknown; url: string }) {
    super(message)
    this.name = 'ApiError'
    this.status = opts.status
    this.bodyText = opts.bodyText
    this.bodyJson = opts.bodyJson
    this.url = opts.url
  }
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
      Accept: 'application/json',
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
    let parsed: unknown | undefined
    try {
      parsed = text ? JSON.parse(text) : undefined
    } catch {
      parsed = undefined
    }
    const message = `API error ${response.status}`
    throw new ApiError(message, { status: response.status, bodyText: text, bodyJson: parsed, url })
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
  // Domain-specific helpers
  getUnassignedArticles: <T>(params?: {
    status?: string
    author_name?: string
    year?: number
    article_type?: 'original' | 'review'
    keywords?: string
    search?: string
    page?: number
    page_size?: number
  }) => request<T>('/articles/unassigned', 'GET', { params }),
  getEditorArticleDetail: <T>(id: string | number) => request<T>(`/articles/editor/${id}`, 'GET'),
  assignReviewers: <T>(articleId: string | number, body: { reviewer_ids: number[]; deadline?: string }) =>
    request<T>(`/articles/${articleId}/assign_reviewers`, 'POST', { json: body }),
  getArticleReviewers: <T>(articleId: string | number) => request<T>(`/articles/${articleId}/reviewers`, 'GET'),
  getReviewers: <T>(language?: 'ru' | 'kz') => request<T>('/users/reviewers', 'GET', { params: { language } }),
  // Reviews
  getReviewById: <T>(reviewId: number | string) => request<T>(`/reviews/${reviewId}`, 'GET'),
  getMyReviews: <T>() => request<T>('/reviews/my-reviews', 'GET'),
  getReviewDetail: <T>(reviewId: number | string) => request<T>(`/reviews/${reviewId}/detail`, 'GET'),
  updateReview: <T>(reviewId: number | string, body: unknown) => request<T>(`/reviews/${reviewId}`, 'PATCH', { json: body }),
}
