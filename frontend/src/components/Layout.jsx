import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/AuthContext'
import '../styles/global.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header>
        <nav>
          <Link to="/" className="logo">🛒 Маркетплейс</Link>
          
          {user ? (
            <ul className="nav-links">
              <li><Link to="/">Товары</Link></li>
              <li><Link to="/my-bids">Мои ставки</Link></li>
              <li><Link to="/create-item" className="btn-primary">+ Создать товар</Link></li>
              <li className="user-info">
                <span className="username">{user.username}</span>
                <button className="btn-logout" onClick={handleLogout}>Выйти</button>
              </li>
            </ul>
          ) : (
            <ul className="nav-links">
              <li><Link to="/">Товары</Link></li>
              <li><Link to="/login">Войти</Link></li>
              <li><Link to="/register" className="btn-primary">Регистрация</Link></li>
            </ul>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        <p>&copy; 2025 Маркетплейс. Все права защищены.</p>
      </footer>
    </div>
  )
}

