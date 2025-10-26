export interface User {
  id: string
  email: string
  created_at: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}
