const envApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = envApiBaseUrl
  ? envApiBaseUrl.replace(/\/+$/, '')
  : import.meta.env.DEV
    ? 'http://localhost:3001/api'
    : '/api';

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  publicationYear: number;
  source: string;
  abstract: string;
  relevanceScore: number;
  type: 'journal' | 'conference' | 'book' | 'article';
  detailUrl?: string;
}

export interface GenerateReportParams {
  query: string;
  papers: ResearchPaper[];
  reportType: 'summary' | 'detailed' | 'comparative';
}

export interface SearchParams {
  query: string;
  filters?: {
    type?: string;
    publicationYear?: number | number[];
    author?: string;
    source?: string;
  };
  sortBy?: 'relevance' | 'publicationYear' | 'citationCount';
  page?: number;
  pageSize?: number;
}

export interface SearchResults {
  results: ResearchPaper[];
  total: number;
  page: number;
  pageSize: number;
  facets: {
    type: Array<{ value: string; count: number }>;
    publicationYear: Array<{ value: number; count: number }>;
    authors: Array<{ value: string; count: number }>;
    sources: Array<{ value: string; count: number }>;
  };
}

export interface HistoryItem {
  id: string;
  type: string;
  query: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export type UserPreferences = {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  notifications?: boolean;
};

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload extends AuthCredentials {
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    preferences?: UserPreferences;
  };
}

function getAuthToken(): string {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
}

function getAuthStorage() {
  return localStorage.getItem('authToken') ? localStorage : sessionStorage;
}

function normalizeErrorMessage(message?: string, fallback = '请求失败，请稍后重试') {
  const normalized = String(message || '').trim();
  if (!normalized) return fallback;

  const lower = normalized.toLowerCase();
  if (lower.includes('unauthorized') || lower.includes('invalid email or password')) return '邮箱或密码错误';
  if (lower.includes('invalid credentials')) return '请输入正确的邮箱和密码';
  if (lower.includes('email already')) return '该邮箱已被注册';
  if (lower.includes('invalid email format')) return '邮箱格式不正确';
  if (lower.includes('password must be at least 6')) return '密码至少需要 6 位';
  if (lower.includes('user not found')) return '用户不存在';

  return normalized;
}

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  let payload: any = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(normalizeErrorMessage(payload?.message, fallbackMessage));
  }

  return payload as T;
}

export function persistAuth(response: AuthResponse, rememberMe = false) {
  const activeStorage = rememberMe ? localStorage : sessionStorage;
  const inactiveStorage = rememberMe ? sessionStorage : localStorage;

  inactiveStorage.removeItem('authToken');
  inactiveStorage.removeItem('authUser');

  activeStorage.setItem('authToken', response.token);
  activeStorage.setItem('authUser', JSON.stringify(response.user || {}));
}

export function applyUserPreferences(preferences?: UserPreferences | null) {
  const themeMode = preferences?.theme || 'light';
  const language = preferences?.language || 'zh-CN';

  localStorage.setItem('themeMode', themeMode);
  localStorage.setItem('language', language);

  const resolvedTheme =
    themeMode === 'auto'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : themeMode;

  document.documentElement.classList.remove('theme-light', 'theme-dark');
  document.documentElement.classList.add(resolvedTheme === 'dark' ? 'theme-dark' : 'theme-light');
  document.documentElement.setAttribute('data-theme', resolvedTheme);
  document.documentElement.lang = language;
  window.dispatchEvent(new CustomEvent('app-language-changed', { detail: { language } }));
}

export function applyGuestDefaults() {
  localStorage.removeItem('themeMode');
  localStorage.removeItem('language');
  document.documentElement.classList.remove('theme-dark');
  document.documentElement.classList.add('theme-light');
  document.documentElement.setAttribute('data-theme', 'light');
  document.documentElement.lang = 'zh-CN';
  window.dispatchEvent(new CustomEvent('app-language-changed', { detail: { language: 'zh-CN' } }));
}

export async function generateResearchReport(params: GenerateReportParams): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/reports/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(params)
  });

  const data = await parseResponse<{ reportContent: string }>(response, '报告生成失败，请稍后重试');
  if (!data?.reportContent) {
    throw new Error('报告生成失败，请稍后重试');
  }
  return data.reportContent;
}

export async function searchPapers(params: SearchParams): Promise<SearchResults> {
  const queryParams = new URLSearchParams();
  queryParams.append('query', params.query);

  if (params.filters?.type) queryParams.append('type', params.filters.type);
  if (params.filters?.publicationYear) {
    const years = Array.isArray(params.filters.publicationYear)
      ? params.filters.publicationYear
      : [params.filters.publicationYear];
    years.forEach((year) => queryParams.append('year', String(year)));
  }
  if (params.filters?.author) queryParams.append('author', params.filters.author);
  if (params.filters?.source) queryParams.append('source', params.filters.source);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.page) queryParams.append('page', String(params.page));
  if (params.pageSize) queryParams.append('pageSize', String(params.pageSize));

  const response = await fetch(`${API_BASE_URL}/papers/search?${queryParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });

  return parseResponse<SearchResults>(response, '搜索失败，请稍后重试');
}

export async function login(credentials: AuthCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  return parseResponse<AuthResponse>(response, '登录失败，请稍后重试');
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<AuthResponse>(response, '注册失败，请稍后重试');
}

export async function fetchCurrentUser(): Promise<AuthResponse['user']> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });

  const data = await parseResponse<{ user: AuthResponse['user'] }>(response, '获取用户信息失败');
  return data.user;
}

export async function updateUserPreferences(preferences: UserPreferences): Promise<UserPreferences> {
  const response = await fetch(`${API_BASE_URL}/users/me/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    },
    body: JSON.stringify(preferences)
  });

  const data = await parseResponse<{ preferences: UserPreferences }>(response, '保存偏好设置失败');
  const storage = getAuthStorage();
  const rawUser = storage.getItem('authUser');
  if (rawUser) {
    try {
      const user = JSON.parse(rawUser);
      user.preferences = { ...(user.preferences || {}), ...(data.preferences || {}) };
      storage.setItem('authUser', JSON.stringify(user));
    } catch {
      // Ignore corrupted cache.
    }
  }
  return data.preferences;
}

export async function fetchSearchHistory(): Promise<HistoryItem[]> {
  const response = await fetch(`${API_BASE_URL}/users/me/history`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`
    }
  });

  const data = await parseResponse<{ items: HistoryItem[] }>(response, '获取搜索历史失败');
  const items = Array.isArray(data?.items) ? data.items : [];
  const seen = new Set<string>();

  return items
    .filter((item) => item?.type === 'search' && typeof item?.query === 'string' && item.query.trim())
    .filter((item) => {
      const key = item.query.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function logout(): void {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  sessionStorage.removeItem('authUser');
  localStorage.removeItem('userEmail');
  applyGuestDefaults();
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
