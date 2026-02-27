import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { bidsAPI, itemsAPI } from '../api/api'
import { useAuth } from '../store/AuthContext'
import '../styles/pages.css'

export default function MyBids() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bids, setBids] = useState([])
  const [items, setItems] = useState({})
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    winning: 0,
    totalAmount: 0
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadBids()
  }, [user, navigate])

  const loadBids = async () => {
    try {
      const bidsData = await bidsAPI.getMyBids()
      setBids(bidsData)

      const itemsMap = {}
      for (const bid of bidsData) {
        try {
          const item = await itemsAPI.getById(bid.itemId)
          if (item) {
            itemsMap[bid.itemId] = item
          }
        } catch (error) {
          console.error(`Failed to load item ${bid.itemId}:`, error)
        }
      }
      setItems(itemsMap)

      const winning = bidsData.filter(bid => bid.isWinning).length
      const totalAmount = bidsData.reduce((sum, bid) => sum + bid.amount, 0)
      setStats({
        total: bidsData.length,
        winning,
        totalAmount
      })
    } catch (error) {
      console.error('Failed to load bids:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days > 0) {
      return `${days} ${days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'} назад`
    }
    if (hours > 0) {
      return `${hours} ${hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'} назад`
    }
    return 'Только что'
  }

  if (loading) {
    return <div>Загрузка...</div>
  }

  return (
    <>
      <div className="page-header">
        <h1>Мои ставки</h1>
        <p className="page-subtitle">История ваших ставок на товары</p>
      </div>

      <div className="bids-summary">
        <div className="summary-card">
          <span className="summary-value">{stats.total}</span>
          <span className="summary-label">Всего ставок</span>
        </div>
        <div className="summary-card winning">
          <span className="summary-value">{stats.winning}</span>
          <span className="summary-label">Лидирующих ставок</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{formatPrice(stats.totalAmount)}</span>
          <span className="summary-label">Общая сумма</span>
        </div>
      </div>

      {bids.length === 0 ? (
        <div className="no-bids">
          <div className="no-bids-icon">💸</div>
          <h2>Вы еще не делали ставок</h2>
          <p>Просмотрите доступные товары и сделайте первую ставку!</p>
          <Link to="/" className="btn-browse">Посмотреть товары</Link>
        </div>
      ) : (
        <div className="bids-list">
          {bids.map((bid) => {
            const item = items[bid.itemId]
            const isWinning = bid.isWinning
            const currentHighest = item?.highestBid || item?.price

            return (
              <div key={bid.id} className={`bid-item-list ${isWinning ? 'winning' : ''}`}>
                <img
                  src={item?.imageUrl || `https://via.placeholder.com/80x80/ecf0f1/7f8c8d?text=${encodeURIComponent(item?.title || 'Item')}`}
                  alt={item?.title || 'Товар'}
                  className="bid-item-image"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/80x80/ecf0f1/7f8c8d?text=Item`
                  }}
                />
                <div className="bid-item-content">
                  <div className="bid-item-header">
                    <Link to={`/items/${bid.itemId}`} className="bid-item-title">
                      {item?.title || bid.itemTitle || 'Товар'}
                    </Link>
                    {isWinning ? (
                      <span className="winning-badge">🏆 Лидирую</span>
                    ) : (
                      <span className="outbid-badge">Перебита</span>
                    )}
                  </div>
                  <div className="bid-item-meta">
                    <span>⏰ {getTimeAgo(bid.createdAt)}</span>
                    {item && (
                      <span>💰 Начальная: {formatPrice(item.price)}</span>
                    )}
                  </div>
                </div>
                <div className="bid-item-amount">
                  <span className="bid-amount">{formatPrice(bid.amount)}</span>
                  <span className="bid-status">Моя ставка</span>
                  {!isWinning && item && currentHighest > bid.amount && (
                    <div className="current-highest">Текущая: {formatPrice(currentHighest)}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

