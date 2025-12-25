import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import '../styles/components.css'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const calculatePasswordStrength = (pwd) => {
    if (pwd.length === 0) return ''
    if (pwd.length < 6) return 'weak'
    if (pwd.length < 10) return 'medium'
    return 'strong'
  }

  const handlePasswordChange = (e) => {
    const pwd = e.target.value
    setPassword(pwd)
    setPasswordStrength(calculatePasswordStrength(pwd))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }

    if (username.length < 3) {
      setError('Имя пользователя должно быть не менее 3 символов')
      return
    }

    setLoading(true)

    try {
      await register(username, password, email || undefined)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Ошибка при регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-icon">👤</div>
        <h1 className="auth-title">Регистрация</h1>
        <p className="auth-subtitle">Создайте новый аккаунт</p>
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
            minLength={3}
            required
            autoComplete="username"
          />
          <div className="form-hint">Минимум 3 символа</div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Email <span className="optional">(необязательно)</span>
          </label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Пароль</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Введите пароль"
            minLength={6}
            required
            autoComplete="new-password"
          />
          {password && (
            <div className="password-strength">
              <div className={`password-strength-bar ${passwordStrength}`}></div>
            </div>
          )}
          <div className="form-hint">Минимум 6 символов</div>
        </div>

        <div className="form-group">
          <label className="form-label">Подтверждение пароля</label>
          <input
            type="password"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторите пароль"
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="btn-submit success" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <div className="auth-divider">или</div>

      <div className="auth-link">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </div>
    </div>
  )
}

