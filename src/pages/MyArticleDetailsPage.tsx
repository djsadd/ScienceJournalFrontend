import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'

interface ApiKeyword {
  id: number
  title_kz: string
  title_en: string
  title_ru: string
}

interface ApiAuthor {
  id: number
  email: string
  prefix: string
  first_name: string
  patronymic: string | null
  last_name: string
  phone: string
  address: string
  country: string
  affiliation1: string
  affiliation2: string
  affiliation3: string
  is_corresponding: boolean
  orcid: string
  scopus_author_id: string
  researcher_id: string
}

interface ApiArticle {
  id: number
  title_kz: string
  title_en: string
  title_ru: string
  abstract_kz: string
  abstract_en: string
  abstract_ru: string
  doi: string | null
  status: string
  article_type: string
  responsible_user_id: number
  antiplagiarism_file_url: string | null
  not_published_elsewhere: boolean
  plagiarism_free: boolean
  authors_agree: boolean
  generative_ai_info: string | null
  manuscript_file_url: string | null
  author_info_file_url: string | null
  cover_letter_file_url: string | null
  created_at: string
  updated_at: string | null
  versions: unknown[]
  keywords: ApiKeyword[]
  authors: ApiAuthor[]
}

interface WithdrawResponse {
  id: number
  status: string
  message: string
}

interface ArticleUpdatePayload {
  title_kz?: string | null
  title_en?: string | null
  title_ru?: string | null
  abstract_kz?: string | null
  abstract_en?: string | null
  abstract_ru?: string | null
  doi?: string | null
}

export function MyArticleDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [article, setArticle] = useState<ApiArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)
  const [revokeMessage, setRevokeMessage] = useState<string | null>(null)
  const [revokeLoading, setRevokeLoading] = useState(false)
  const [lang, setLang] = useState<'ru' | 'en' | 'kz'>(() => {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.get('lang') as 'ru' | 'en' | 'kz' | null
    return fromQuery && ['ru', 'en', 'kz'].includes(fromQuery) ? fromQuery : 'ru'
  })

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    api
      .get<ApiArticle>(`/articles/my/${id}`)
      .then((data) => {
        console.log('Детальная статья /articles/my/{id}:', data)
        setArticle(data)
      })
      .catch((err: Error) => {
        console.error('Ошибка загрузки статьи', err)
        setError('Не удалось загрузить статью')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="app-container">
        <div className="panel">
          <p className="panel-title">Загрузка статьи...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="app-container">
        <div className="panel">
          <p className="panel-title">{error ?? 'Статья не найдена'}</p>
          <button className="button button--ghost" onClick={() => navigate(-1)}>
            Назад
          </button>
        </div>
      </div>
    )
  }

  const handleWithdraw = async () => {
    if (!article) return
    try {
      setRevokeLoading(true)
      setRevokeMessage(null)
      const res = await api.post<WithdrawResponse>(`/articles/${article.id}/withdrawn`)
      setArticle({ ...article, status: res.status })
      setRevokeMessage(res.message || 'Статья была успешно отозвана.')
      setTimeout(() => {
        setShowRevokeConfirm(false)
      }, 1500)
    } catch (e) {
      console.error('Ошибка при отзыве статьи', e)
      setRevokeMessage('Не удалось отозвать статью. Попробуйте позже.')
    } finally {
      setRevokeLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!article) return
    try {
      const payload: ArticleUpdatePayload = {
        title_kz: article.title_kz || null,
        title_en: article.title_en || null,
        title_ru: article.title_ru || null,
        abstract_kz: article.abstract_kz || null,
        abstract_en: article.abstract_en || null,
        abstract_ru: article.abstract_ru || null,
        doi: article.doi || null,
      }
      const updated = await api.put<ApiArticle>(`/articles/${article.id}`, payload)
      setArticle(updated)
      alert(`Статья "${updated.title_ru || updated.title_en || updated.title_kz}" успешно обновлена.`)
    } catch (e) {
      console.error('Ошибка при обновлении статьи', e)
      alert('Не удалось обновить статью. Попробуйте позже.')
    }
  }

  return (
    <div className="app-container">
      <section className="section-header">
        <div>
          <p className="eyebrow">Моя статья</p>
          <h1 className="page-title">
            {lang === 'ru' ? article.title_ru : lang === 'en' ? article.title_en : article.title_kz}
          </h1>
          <p className="subtitle">Детальная страница рукописи. Отображается только выбранный язык.</p>
        </div>
        <div className="pill">#{article.id}</div>
      </section>

      <div className="panel panel--compact">
        <div className="lang-toggle-row">
          <span className="lang-toggle-row__label">Язык рукописи</span>
          <div className="lang-toggle">
            <button
              type="button"
              className={`lang-toggle__item ${lang === 'ru' ? 'lang-toggle__item--active' : ''}`}
              onClick={() => setLang('ru')}
            >
              Русский
            </button>
            <button
              type="button"
              className={`lang-toggle__item ${lang === 'kz' ? 'lang-toggle__item--active' : ''}`}
              onClick={() => setLang('kz')}
            >
              Казахский
            </button>
            <button
              type="button"
              className={`lang-toggle__item ${lang === 'en' ? 'lang-toggle__item--active' : ''}`}
              onClick={() => setLang('en')}
            >
              Английский
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <p className="eyebrow">Заголовок</p>
        {article.status === 'withdrawn' ? (
          <>
            <div className="form-field">
              <label className="form-label">Заголовок (RU)</label>
              <input
                className="text-input"
                value={article.title_ru}
                onChange={(e) => setArticle({ ...article, title_ru: e.target.value })}
                placeholder="Заголовок на русском"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Title (EN)</label>
              <input
                className="text-input"
                value={article.title_en}
                onChange={(e) => setArticle({ ...article, title_en: e.target.value })}
                placeholder="Title in English"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Тақырып (KZ)</label>
              <input
                className="text-input"
                value={article.title_kz}
                onChange={(e) => setArticle({ ...article, title_kz: e.target.value })}
                placeholder="Тақырып қазақ тілінде"
              />
            </div>
          </>
        ) : (
          <div className="form-field">
            <div className="form-label">{lang === 'ru' ? 'Заголовок (RU)' : lang === 'en' ? 'Title (EN)' : 'Тақырып (KZ)'}</div>
            <div className="form-hint">
              {lang === 'ru' && article.title_ru}
              {lang === 'en' && article.title_en}
              {lang === 'kz' && article.title_kz}
            </div>
          </div>
        )}
      </div>

      <div className="panel">
        <p className="eyebrow">Основная информация</p>
        <div className="grid grid-2">
          <div className="form-field">
            <div className="form-label">Статус</div>
            <div className="form-hint">{article.status}</div>
          </div>
          <div className="form-field">
            <div className="form-label">Тип статьи</div>
            <div className="form-hint">
              {article.article_type === 'original' ? 'Оригинальная статья' : article.article_type}
            </div>
          </div>
          <div className="form-field">
            <div className="form-label">Дата создания</div>
            <div className="form-hint">{new Date(article.created_at).toLocaleDateString('ru-RU')}</div>
          </div>
          <div className="form-field">
            <div className="form-label">DOI</div>
            {article.status === 'withdrawn' ? (
              <input
                className="text-input"
                value={article.doi ?? ''}
                onChange={(e) => setArticle({ ...article, doi: e.target.value || null })}
                placeholder="Например: 10.1234/abcd.2025.01"
              />
            ) : (
              <div className="form-hint">{article.doi ?? 'Не присвоен'}</div>
            )}
          </div>
        </div>
        {article.status === 'submitted' && (
          <div className="section-actions" style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="button button--danger"
              onClick={() => setShowRevokeConfirm(true)}
            >
              Отозвать статью
            </button>
          </div>
        )}
      </div>

      <div className="panel">
        <p className="eyebrow">Аннотация</p>
        {article.status === 'withdrawn' ? (
          <>
            <div className="form-field">
              <label className="form-label">Аннотация (RU)</label>
              <textarea
                className="text-input"
                rows={4}
                value={article.abstract_ru}
                onChange={(e) => setArticle({ ...article, abstract_ru: e.target.value })}
                placeholder="Аннотация на русском"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Abstract (EN)</label>
              <textarea
                className="text-input"
                rows={4}
                value={article.abstract_en}
                onChange={(e) => setArticle({ ...article, abstract_en: e.target.value })}
                placeholder="Abstract in English"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Аннотация (KZ)</label>
              <textarea
                className="text-input"
                rows={4}
                value={article.abstract_kz}
                onChange={(e) => setArticle({ ...article, abstract_kz: e.target.value })}
                placeholder="Аннотация на казахском"
              />
            </div>
          </>
        ) : (
          <div className="form-field">
            <div className="form-label">
              {lang === 'ru' ? 'Аннотация (RU)' : lang === 'en' ? 'Abstract (EN)' : 'Аннотация (KZ)'}
            </div>
            <p className="article-abstract">
              {lang === 'ru' && (article.abstract_ru || 'Аннотация не заполнена.')}
              {lang === 'en' && (article.abstract_en || 'Аннотация не заполнена.')}
              {lang === 'kz' && (article.abstract_kz || 'Аннотация не заполнена.')}
            </p>
          </div>
        )}
      </div>

      <div className="panel">
        <p className="eyebrow">Ключевые слова</p>
        {article.keywords.length === 0 ? (
          <div className="table__empty">Ключевые слова не указаны.</div>
        ) : (
          <div className="pill-list">
            {article.keywords.map((kw) => (
              <span key={kw.id} className="pill pill--ghost">
                {lang === 'ru' && kw.title_ru}
                {lang === 'en' && kw.title_en}
                {lang === 'kz' && kw.title_kz}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <p className="eyebrow">Согласия и проверки</p>
        <div className="grid grid-3">
          <div className="form-field">
            <div className="form-label">Не публиковалась ранее</div>
            <div className="form-hint">{article.not_published_elsewhere ? 'Да' : 'Нет'}</div>
          </div>
          <div className="form-field">
            <div className="form-label">Без плагиата</div>
            <div className="form-hint">{article.plagiarism_free ? 'Да' : 'Нет'}</div>
          </div>
          <div className="form-field">
            <div className="form-label">Все авторы согласны</div>
            <div className="form-hint">{article.authors_agree ? 'Да' : 'Нет'}</div>
          </div>
          <div className="form-field" style={{ gridColumn: '1 / -1' }}>
            <div className="form-label">Использование генеративного ИИ</div>
            <div className="form-hint">{article.generative_ai_info || 'Не указано'}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <p className="eyebrow">Авторы</p>
        {article.authors.length === 0 ? (
          <div className="table__empty">Список авторов не заполнен.</div>
        ) : (
          <div className="assignment-list">
            {article.authors.map((a) => (
              <div className="assignment-row" key={a.id}>
                <div>
                  <div className="assignment-title">
                    {a.last_name} {a.first_name} {a.patronymic ?? ''}
                  </div>
                  <div className="article-meta">
                    <span>{a.affiliation1}</span>
                    {a.affiliation2 ? <span className="dot">·</span> : null}
                    {a.affiliation2 ? <span>{a.affiliation2}</span> : null}
                    {a.country ? (
                      <>
                        <span className="dot">·</span>
                        <span>{a.country}</span>
                      </>
                    ) : null}
                  </div>
                </div>
                {a.is_corresponding ? <span className="pill">Ответственный автор</span> : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <p className="eyebrow">Файлы</p>
        <div className="grid grid-3">
          <div className="form-field">
            <div className="form-label">Рукопись</div>
            {article.manuscript_file_url ? (
              <a className="link" href={article.manuscript_file_url} target="_blank" rel="noreferrer">
                Скачать
              </a>
            ) : (
              <div className="form-hint">Не загружено</div>
            )}
          </div>
          <div className="form-field">
            <div className="form-label">Антиплагиат</div>
            {article.antiplagiarism_file_url ? (
              <a className="link" href={article.antiplagiarism_file_url} target="_blank" rel="noreferrer">
                Скачать
              </a>
            ) : (
              <div className="form-hint">Не загружено</div>
            )}
          </div>
          <div className="form-field">
            <div className="form-label">Данные автора</div>
            {article.author_info_file_url ? (
              <a className="link" href={article.author_info_file_url} target="_blank" rel="noreferrer">
                Скачать
              </a>
            ) : (
              <div className="form-hint">Не загружено</div>
            )}
          </div>
          <div className="form-field">
            <div className="form-label">Сопроводительное письмо</div>
            {article.cover_letter_file_url ? (
              <a className="link" href={article.cover_letter_file_url} target="_blank" rel="noreferrer">
                Скачать
              </a>
            ) : (
              <div className="form-hint">Не загружено</div>
            )}
          </div>
        </div>
      </div>

      {article.status === 'withdrawn' && (
        <div className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Действия автора</p>
              <h3 className="panel-title">Отправить обновлённую рукопись</h3>
            </div>
          </div>
          <div className="pill-list">
            <button
              type="button"
              className="button button--primary"
              onClick={handleUpdate}
            >
              Отправить
            </button>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Быстрые действия</p>
            <h3 className="panel-title">Навигация</h3>
          </div>
          <div className="pill pill--ghost">Мои статьи</div>
        </div>
        <div className="pill-list">
          <Link className="button button--ghost button--compact" to="/cabinet/submissions">
            К списку статей
          </Link>
        </div>
      </div>

      {showRevokeConfirm && (
        <div className="modal-backdrop" onClick={() => setShowRevokeConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal__header">
              <p className="eyebrow">Подтверждение действия</p>
              <h3 className="panel-title">Отозвать статью?</h3>
            </div>
            <div className="modal__body">
              <p className="subtitle">
                Вы уверены, что хотите отозвать эту статью? После отзыва редакция приостановит рассмотрение
                рукописи.
              </p>
              {revokeMessage && <div className="alert alert--info">{revokeMessage}</div>}
            </div>
            <div className="modal__footer">
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setShowRevokeConfirm(false)}
              >
                Отмена
              </button>
              <button
                type="button"
                className="button button--danger"
                disabled={revokeLoading}
                onClick={handleWithdraw}
              >
                {revokeLoading ? 'Отзываем…' : 'Отозвать статью'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
