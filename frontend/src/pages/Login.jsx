import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import '../styles/components.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Неверное имя пользователя или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-icon">🔐</div>
        <h1 className="auth-title">Вход</h1>
        <p className="auth-subtitle">Войдите в свой аккаунт</p>
      </div>

      {error && (
        <div className="alert alert-error active">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Имя пользователя</label>
          <input
            type="text"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Введите имя пользователя"
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Пароль</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <div className="auth-divider">или</div>

      <div className="auth-link">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </div>
    </div>
  )
}

