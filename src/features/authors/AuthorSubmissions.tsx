import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Article, User } from '../../shared/types'
import { Badge } from '../../shared/components/Badge'

interface AuthorSubmissionsProps {
  articles: Article[]
  users: User[]
}

const getActionLabel = (status: Article['status']) => {
  switch (status) {
    case 'in_review':
      return 'Смотреть'
    case 'revisions':
      return 'Скачать рецензию'
    case 'accepted':
      return 'PDF'
    default:
      return 'Подробнее'
  }
}

export function AuthorSubmissions({ articles, users }: AuthorSubmissionsProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | Article['status']>('all')
  const [yearFilter, setYearFilter] = useState<'all' | string>('all')
  const [query, setQuery] = useState('')

  const years = useMemo(
    () =>
      Array.from(
        new Set(
          articles
            .map((a) => new Date(a.submittedAt).getFullYear())
            .filter((year) => !Number.isNaN(year)),
        ),
      )
        .sort((a, b) => b - a)
        .map(String),
    [articles],
  )

  const filtered = useMemo(
    () =>
      articles.filter((article) => {
        const matchesStatus = statusFilter === 'all' || article.status === statusFilter
        const matchesYear = yearFilter === 'all' || new Date(article.submittedAt).getFullYear().toString() === yearFilter
        const matchesQuery = article.title.toLowerCase().includes(query.trim().toLowerCase())
        return matchesStatus && matchesYear && matchesQuery
      }),
    [articles, statusFilter, yearFilter, query],
  )

  return (
    <div className="app-container">
      <section className="section-header">
        <div>
          <p className="eyebrow">Автор</p>
          <h1 className="page-title">Мои статьи</h1>
          <p className="subtitle">Быстрый обзор статусов рукописей и действий по ним.</p>
        </div>
        <Link className="button button--primary" to="/cabinet/submission">
          Подать статью
        </Link>
      </section>

      <section className="section">
        <div className="panel">
          <div className="filters">
            <div className="filter-group">
              <label className="filter-label">Статус</label>
              <select
                className="chip-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              >
                <option value="all">Все</option>
                <option value="in_review">На рецензии</option>
                <option value="revisions">Правки</option>
                <option value="accepted">Принято</option>
                <option value="submitted">Отправлено</option>
                <option value="draft">Черновик</option>
                <option value="rejected">Отклонено</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Год</label>
              <select
                className="chip-select"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value as typeof yearFilter)}
              >
                <option value="all">Все</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group filter-group--wide">
              <label className="filter-label">Поиск</label>
              <input
                className="search"
                placeholder="Название статьи"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table">
            <div className="table__head">
              <span>Название статьи</span>
              <span>Статус</span>
              <span>Дата</span>
              <span>Действия</span>
            </div>
            <div className="table__body">
              {filtered.map((article) => (
                <div className="table__row" key={article.id}>
                  <div className="table__cell table__cell--title">
                    <div className="table__title">{article.title}</div>
                    <div className="table__meta">
                      {users.find((u) => u.id === article.editorId)?.name ?? 'Редактор не назначен'}
                    </div>
                  </div>
                  <div className="table__cell">
                    <Badge status={article.status} />
                  </div>
                  <div className="table__cell">
                    {new Date(article.submittedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
                  </div>
                  <div className="table__cell">
                    <Link className="button button--ghost button--compact" to={`/cabinet/articles/${article.id}`}>
                      {getActionLabel(article.status)}
                    </Link>
                  </div>
                </div>
              ))}
              {filtered.length === 0 ? <div className="table__empty">Ничего не найдено по выбранным фильтрам.</div> : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
