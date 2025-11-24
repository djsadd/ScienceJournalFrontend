import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const payload = { name: fullName, username, affiliation, email, password, confirmPassword: confirm }
      const response = await api.post('/auth/register', payload)
      console.log('Register response:', response)
      navigate('/login')
    } catch (error) {
      console.error('Register error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="public-container auth-layout">
      <section className="public-section auth-card">
        <div className="auth-header">
          <p className="eyebrow">Новый аккаунт</p>
          <h1 className="hero__title">Регистрация в Science Journal</h1>
          <p className="subtitle">
            Создайте профиль автора, редактора или рецензента. После подтверждения мы пришлём инструкции на электронную
            почту.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field">
            <span className="form-label">Full name</span>
            <input
              className="text-input"
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span className="form-label">Username</span>
            <input
              className="text-input"
              type="text"
              placeholder="Login / username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span className="form-label">Affiliation</span>
            <input
              className="text-input"
              type="text"
              placeholder="University, company, institute"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span className="form-label">Work email</span>
            <input
              className="text-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <div className="grid grid-2 auth-grid">
            <label className="form-field">
              <span className="form-label">Password</span>
              <input
                className="text-input"
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="form-hint">Use letters, numbers, and special symbols.</span>
            </label>
            <label className="form-field">
              <span className="form-label">Confirm password</span>
              <input
                className="text-input"
                type="password"
                placeholder="Repeat password once more"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="auth-row auth-row--wrap">
            <label className="checkbox">
              <input type="checkbox" required />
              <span>I accept the offer and privacy policy</span>
            </label>
            <label className="checkbox">
              <input type="checkbox" />
              <span>Send me updates and emails</span>
            </label>
          </div>

          <button type="submit" className="button button--primary auth-submit" disabled={submitting}>
            {submitting ? "Sending..." : "Register"}
          </button>

          <div className="auth-footer">
            <span>Already have an account?</span>
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>
        </form>
      </section>

      <section className="public-section auth-aside">
        <div className="auth-note">
          <p className="eyebrow">Перед стартом</p>
          <h2 className="panel-title">Укажите роль и профиль</h2>
          <p className="subtitle">
            Регистрация открывает доступ к инструментам автора, рецензента или редактора. Мы сверяем профиль с
            требованиями журнала, чтобы подобрать нужные права.
          </p>
        </div>

        <div className="auth-steps">
          <div className="auth-step">
            <span className="auth-step__number">1</span>
            <div>
              <div className="auth-step__title">Заполните профиль</div>
              <div className="auth-step__text">Укажите актуальные контакты и организацию, чтобы редакция могла связаться.</div>
            </div>
          </div>
          <div className="auth-step">
            <span className="auth-step__number">2</span>
            <div>
              <div className="auth-step__title">Выберите роль</div>
              <div className="auth-step__text">Автор, редактор или рецензент — права будут настроены после проверки.</div>
            </div>
          </div>
          <div className="auth-step">
            <span className="auth-step__number">3</span>
            <div>
              <div className="auth-step__title">Получите подтверждение</div>
              <div className="auth-step__text">Мы отправим письмо с подтверждением регистрации и дальнейшими шагами.</div>
            </div>
          </div>
        </div>

        <div className="auth-meta">
          <div className="auth-meta__item">Поддержка: support@sciencejournal.kz</div>
          <div className="auth-meta__item">Среднее время активации — 1 рабочий день</div>
          <div className="auth-meta__item">В любой момент можно обновить профиль и контакты</div>
        </div>
      </section>
    </div>
  )
}
