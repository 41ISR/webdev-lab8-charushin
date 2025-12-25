import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { itemsAPI, statsAPI } from '../api/api'
import '../styles/pages.css'

export default function ItemsList() {
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [itemsData, statsData] = await Promise.all([
        itemsAPI.getAll(),
        statsAPI.get()
      ])
      setItems(itemsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
  }

  const getInitials = (username) => {
    return username.substring(0, 2).toUpperCase()
  }

  if (loading) {
    return <div>Загрузка...</div>
  }

  return (
    <>
      <div className="page-header">
        <h1>Все товары</h1>
      </div>

      {stats && (
        <div className="stats">
          <div className="stat-item">
            <span className="stat-value">{stats.totalItems}</span>
            <span className="stat-label">Товаров</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.totalBids}</span>
            <span className="stat-label">Ставок</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.activeItems}</span>
            <span className="stat-label">Активных</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatPrice(Math.round(stats.averageItemPrice))}</span>
            <span className="stat-label">Средняя цена</span>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="no-items">
          <div className="no-items-icon">📦</div>
          <h2>Товаров пока нет</h2>
          <p>Станьте первым, кто разместит товар на продажу!</p>
        </div>
      ) : (
        <div className="items-grid">
          {items.map((item) => (
            <Link key={item.id} to={`/items/${item.id}`} className="item-card">
              <img
                src={item.imageUrl || `https://via.placeholder.com/300x200/3498db/ffffff?text=${encodeURIComponent(item.title)}`}
                alt={item.title}
                className="item-image"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/300x200/ecf0f1/7f8c8d?text=${encodeURIComponent(item.title)}`
                }}
              />
              <div className="item-content">
                <span className={`status-badge status-${item.status}`}>
                  {item.status === 'active' ? 'Активно' : item.status}
                </span>
                <h3 className="item-title">{item.title}</h3>
                <p className="item-description">{item.description}</p>
                <div className="item-footer">
                  <div>
                    <div className="item-price">{formatPrice(item.price)}</div>
                    {item.highestBid && item.highestBid > item.price && (
                      <div className="bid-info">
                        Текущая ставка: {formatPrice(item.highestBid)}
                        {item.bidCount > 0 && (
                          <span className="bid-count">{item.bidCount}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="item-meta">
                    <span className="item-seller">Продавец: {item.username}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}

