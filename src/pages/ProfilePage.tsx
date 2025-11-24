interface Profile {
  name: string
  orcid: string
  email: string
  affiliation: string
  languages: string[]
  fields: string[]
  photo?: string
}

const profile: Profile = {
  name: 'Анна Садыкова',
  orcid: '0000-0002-1234-5678',
  email: 'anna.sadykova@example.com',
  affiliation: 'КазАНУ, кафедра физики',
  languages: ['Русский', 'English'],
  fields: ['Физика конденсированного состояния', 'Материаловедение'],
}

export function ProfilePage() {
  return (
    <div className="app-container">
      <section className="section-header">
        <div>
          <p className="eyebrow">Профиль</p>
          <h1 className="page-title">Мой профиль</h1>
          <p className="subtitle">Контакты и специализация для назначения рецензий.</p>
        </div>
        <div className="pill pill--ghost">Обновить данные</div>
      </section>

      <div className="panel profile-card">
        <div className="profile-card__top">
          <div className="avatar">{profile.name[0]}</div>
          <div>
            <div className="profile-name">{profile.name}</div>
            <div className="profile-meta">{profile.affiliation}</div>
          </div>
        </div>
        <div className="profile-grid">
          <div className="profile-field">
            <div className="profile-label">ORCID</div>
            <div className="profile-value">{profile.orcid}</div>
          </div>
          <div className="profile-field">
            <div className="profile-label">Email</div>
            <div className="profile-value">{profile.email}</div>
          </div>
          <div className="profile-field">
            <div className="profile-label">Аффилиация</div>
            <div className="profile-value">{profile.affiliation}</div>
          </div>
          <div className="profile-field">
            <div className="profile-label">Языки рецензирования</div>
            <div className="profile-value">{profile.languages.join(', ')}</div>
          </div>
          <div className="profile-field">
            <div className="profile-label">Научные области</div>
            <div className="profile-tags">
              {profile.fields.map((field) => (
                <span key={field} className="status-chip status-chip--draft">
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
