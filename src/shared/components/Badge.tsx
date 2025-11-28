interface BadgeProps {
  status: string
}

const statusMap: Record<
  string,
  { label: string; tone: 'success' | 'info' | 'warn' | 'danger' | 'muted' }
> = {
  draft: { label: 'Черновик', tone: 'muted' },
  submitted: { label: 'Отправлено', tone: 'info' },
  in_progress: { label: 'В работе', tone: 'warn' },
  completed: { label: 'Завершено', tone: 'success' },
  cancelled: { label: 'Отменена', tone: 'muted' },
  pending: { label: 'Ожидает', tone: 'info' },
  in_review: { label: 'На рецензии', tone: 'warn' },
  revisions: { label: 'Правки', tone: 'warn' },
  accepted: { label: 'Принято', tone: 'success' },
  rejected: { label: 'Отклонено', tone: 'danger' },
}

export function Badge({ status }: BadgeProps) {
  const meta = statusMap[status] ?? { label: status, tone: 'muted' }
  return <span className={`badge badge--${meta.tone}`}>{meta.label}</span>
}
