export type Lang = 'ru' | 'en' | 'kz'

const typeMap = {
  ru: {
    original: 'Оригинальная статья',
    review: 'Обзорная статья',
  },
  en: {
    original: 'Original article',
    review: 'Review article',
  },
  kz: {
    original: 'Оригинальная мақала',
    review: 'Шолу мақаласы',
  },
} as const

const statusMap = {
  ru: {
    draft: 'Черновик',
    submitted: 'Отправлено',
    under_review: 'На рецензировании',
    accepted: 'Принято',
    published: 'Опубликовано',
    withdrawn: 'Отозвано',
  },
  en: {
    draft: 'Draft',
    submitted: 'Submitted',
    under_review: 'Under review',
    accepted: 'Accepted',
    published: 'Published',
    withdrawn: 'Withdrawn',
  },
  kz: {
    draft: 'Жоба',
    submitted: 'Жіберілді',
    under_review: 'Рецензияда',
    accepted: 'Қабылданды',
    published: 'Жарияланды',
    withdrawn: 'Қайтарылды',
  },
} as const

export function formatArticleType(code: string, lang: Lang = 'ru'): string {
  const l = (['ru', 'en', 'kz'] as const).includes(lang) ? lang : 'ru'
  const map = typeMap[l] as Record<string, string>
  return map[code] ?? code
}

export function formatArticleStatus(code: string, lang: Lang = 'ru'): string {
  const l = (['ru', 'en', 'kz'] as const).includes(lang) ? lang : 'ru'
  const map = statusMap[l] as Record<string, string>
  return map[code] ?? code
}
