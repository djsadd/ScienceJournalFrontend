import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const payload = { username, email, password }
      const response = await api.post<{ access_token: string; refresh_token?: string; token_type?: string }>(
        '/auth/login',
        payload,
      )
      api.setTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
        tokenType: response.token_type ?? 'bearer',
      })
      navigate('/cabinet')
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="public-container auth-layout">
      <section className="public-section auth-card">
        <div className="auth-header">
          <p className="eyebrow">Вход</p>
          <h1 className="hero__title">Войти и продолжить работу</h1>
          <p className="subtitle">
            Используйте учетные данные Science Journal, чтобы получить доступ к кабинету, заданиям и публикациям.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">Username</span>
            <input
              className="text-input"
              type="text"
              placeholder="your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span className="form-label">Email</span>
            <input
              className="text-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span className="form-label">Пароль</span>
            <input
              className="text-input"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <div className="auth-row">
            <label className="checkbox">
              <input type="checkbox" />
              <span>Запомнить устройство</span>
            </label>
            <a className="auth-link" href="mailto:support@sciencejournal.kz">
              Нужна помощь?
            </a>
          </div>

          <button type="submit" className="button button--primary auth-submit" disabled={submitting}>
            {submitting ? 'Отправляем...' : 'Войти'}
          </button>

          <div className="auth-footer">
            <span>Еще нет аккаунта?</span>
            <Link to="/register" className="auth-link">
              Зарегистрироваться
            </Link>
          </div>
        </form>
      </section>

      <section className="public-section auth-aside">
        <div className="auth-note">
          <p className="eyebrow">Для чего входить</p>
          <h2 className="panel-title">Работа с материалами</h2>
          <p className="subtitle">
            Получайте доступ к заявкам, рецензиям, верстке и редактированию. Сохраняем ваши действия под защищенным
            токеном.
          </p>
        </div>

        <div className="auth-badges">
          <div className="pill">Безопасное подключение</div>
          <div className="pill">Разграничение ролей</div>
          <div className="pill">Работа в одном окне</div>
        </div>

        <div className="auth-steps">
          <div className="auth-step">
            <span className="auth-step__number">1</span>
            <div>
              <div className="auth-step__title">Войти в кабинет</div>
              <div className="auth-step__text">Вводите username и пароль, чтобы открыть инструменты.</div>
            </div>
          </div>
          <div className="auth-step">
            <span className="auth-step__number">2</span>
            <div>
              <div className="auth-step__title">Работайте с заявками</div>
              <div className="auth-step__text">Отвечайте, публикуйте и рецензируйте в одном интерфейсе.</div>
            </div>
          </div>
          <div className="auth-step">
            <span className="auth-step__number">3</span>
            <div>
              <div className="auth-step__title">Сохраняйте прогресс</div>
              <div className="auth-step__text">Данные защищены токенами доступа и обновления.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
