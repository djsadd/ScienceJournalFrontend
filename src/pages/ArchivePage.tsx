import { useState } from 'react'

type Volume = {
  title: string
  description: string
  date: string
}

type ArchiveYear = {
  year: number
  volumes: Volume[]
}

const archives: ArchiveYear[] = [
  {
    year: 2025,
    volumes: [
      {
        title: 'Том 12, №1',
        description: 'Фокус: цифровая экономика, финансы и управление.',
        date: 'Март 2025',
      },
    ],
  },
  {
    year: 2024,
    volumes: [
      {
        title: 'Том 11, №4',
        description: 'Право и государственное управление, кейсы ГЧП.',
        date: 'Декабрь 2024',
      },
      {
        title: 'Том 11, №3',
        description: 'Социальные и гуманитарные науки, миграционные процессы.',
        date: 'Сентябрь 2024',
      },
      {
        title: 'Том 11, №2',
        description: 'Маркетинг и предпринимательство, устойчивые модели роста.',
        date: 'Июнь 2024',
      },
    ],
  },
  {
    year: 2023,
    volumes: [
      {
        title: 'Том 10, №4',
        description: 'Экономика и управление: цифровые экосистемы.',
        date: 'Декабрь 2023',
      },
      {
        title: 'Том 10, №3',
        description: 'Право: регуляторика и защита данных.',
        date: 'Сентябрь 2023',
      },
    ],
  },
]

export function ArchivePage() {
  const [openYears, setOpenYears] = useState<Record<number, boolean>>({ 2025: true })

  const toggleYear = (year: number) => {
    setOpenYears((prev) => ({ ...prev, [year]: !prev[year] }))
  }

  return (
    <div className="public-container">
      <div className="section public-section">
        <p className="eyebrow">архив номеров</p>
        <h1 className="hero__title">Раскрывающийся список томов по годам</h1>
        <div className="panel" style={{ marginBottom: '1rem' }}>
          <div className="grid grid-3">
            <div>
              <div className="panel-title">Свидетельство о регистрации</div>
              <p className="subtitle">№ 17458-Ж, дата 14.01.2019.</p>
            </div>
            <div>
              <div className="panel-title">ISSN</div>
              <p className="subtitle">2663-631X — международный номер печатного издания.</p>
            </div>
            <div>
              <div className="panel-title">Периодичность</div>
              <p className="subtitle">4 раза в год. Языки: русский, казахский, английский.</p>
            </div>
          </div>
        </div>

        <div className="accordion">
          {archives.map((group) => {
            const isOpen = Boolean(openYears[group.year])
            return (
              <div className={`accordion-item ${isOpen ? 'accordion-item--open' : ''}`} key={group.year}>
                <button className="accordion-header" onClick={() => toggleYear(group.year)} aria-expanded={isOpen}>
                  <div className="accordion-title">
                    <span className="panel-title">Год {group.year}</span>
                    <span className="subtitle">{group.volumes.length} выпуск(а)</span>
                  </div>
                  <span className="accordion-icon">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen ? (
                  <div className="accordion-body">
                    <div className="volume-chip">Тома {group.year}</div>
                    <ul className="volume-list">
                      {group.volumes.map((volume) => (
                        <li key={volume.title} className="volume-item">
                          <div>
                            <div className="volume-title">{volume.title}</div>
                            <div className="subtitle">{volume.description}</div>
                          </div>
                          <div className="meta-label">{volume.date}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
