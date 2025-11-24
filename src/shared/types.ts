export type Role = 'author' | 'editor' | 'reviewer'

export type ArticleStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'revisions'
  | 'accepted'
  | 'rejected'

export interface User {
  id: string
  name: string
  role: Role
  affiliation?: string
  expertise?: string[]
}

export interface Review {
  id: string
  articleId: string
  reviewerId: string
  recommendation: 'accept' | 'minor' | 'major' | 'reject'
  submittedAt: string
  comments: string
  round: number
  isAnonymous: boolean
}

export interface Article {
  id: string
  title: string
  abstract: string
  status: ArticleStatus
  specialty: string
  authors: string[]
  editorId?: string
  submittedAt: string
  version: number
  reviews: Review[]
}

export interface ReviewAssignment {
  id: string
  articleId: string
  reviewerId: string
  dueAt: string
  round: number
  isAnonymous: boolean
}

export interface JournalData {
  users: User[]
  articles: Article[]
  assignments: ReviewAssignment[]
}
