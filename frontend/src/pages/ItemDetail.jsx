import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { itemsAPI, bidsAPI } from '../api/api'
import { useAuth } from '../store/AuthContext'
import '../styles/pages.css'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [item, setItem] = useState(null)
  const [bids, setBids] = useState([])
  const [bidAmount, setBidAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadItem()
    loadBids()
  }, [id])

  const loadItem = async () => {
    try {
      const itemData = await itemsAPI.getById(id)
      if (!itemData) {
        navigate('/')
        return
      }
      setItem(itemData)
      if (itemData.highestBid) {
        setBidAmount(String(itemData.highestBid + 100))
      } else {
        setBidAmount(String(itemData.price + 100))
      }
    } catch (error) {
      console.error('Failed to load item:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const loadBids = async () => {
    try {
      const bidsData = await bidsAPI.getByItemId(id)
      setBids(bidsData)
    } catch (error) {
      console.error('Failed to load bids:', error)
    }
  }

  const handleBidSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const amount = parseFloat(bidAmount)
      await bidsAPI.create(id, amount)
      await loadItem()
      await loadBids()
      setBidAmount(String(amount + 100))
    } catch (err) {
      setError(err.message || 'Ошибка при создании ставки')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
      return
    }

    try {
      await itemsAPI.delete(id)
      navigate('/')
    } catch (error) {
      alert('Ошибка при удалении товара')
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
  }

  const getInitials = (username) => {
    return username.substring(0, 2).toUpperCase()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  if (!item) {
    return null
  }

  const isOwner = user && user.id === item.userId
  const minBid = item.highestBid || item.price
  const highestBidAmount = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : null

  return (
    <>
      <Link to="/" className="back-link">← Вернуться к списку товаров</Link>

      <div className="item-detail">
        <div className="item-header">
          <div>
            <img
              src={item.imageUrl || `https://via.placeholder.com/600x400/3498db/ffffff?text=${encodeURIComponent(item.title)}`}
              alt={item.title}
              className="item-image-large"
              onError={(e) => {
                e.target.src = `https://via.placeholder.com/600x400/ecf0f1/7f8c8d?text=${encodeURIComponent(item.title)}`
              }}
            />
          </div>

          <div className="item-info">
            <span className={`item-status status-${item.status}`}>
              {item.status === 'active' ? 'Активно' : item.status}
            </span>

            <h1 className="item-title-large">{item.title}</h1>

            <div className="item-seller-info">
              <div className="seller-avatar">{getInitials(item.username)}</div>
              <div className="seller-details">
                <div className="seller-name">{item.username}</div>
                <div className="seller-date">Опубликовано: {formatDate(item.createdAt)}</div>
              </div>
            </div>

            <div className="item-description-full">
              {item.description.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            <div className="price-section">
              <div className="starting-price">Начальная цена:</div>
              <div className="current-price">{formatPrice(item.price)}</div>
              {item.highestBid && item.highestBid > item.price && (
                <div className="highest-bid">Текущая ставка: {formatPrice(item.highestBid)}</div>
              )}

              {!isOwner && item.status === 'active' && user && (
                <form className="bid-form" onSubmit={handleBidSubmit}>
                  {error && (
                    <div className="alert alert-error active">{error}</div>
                  )}
                  <input
                    type="number"
                    className="bid-input"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`Введите вашу ставку (мин. ${formatPrice(minBid + 1)})`}
                    min={minBid + 1}
                    step="100"
                    required
                  />
                  <button type="submit" className="btn-bid" disabled={submitting}>
                    {submitting ? 'Отправка...' : 'Сделать ставку'}
                  </button>
                </form>
              )}

              {!user && (
                <div className="auth-link">
                  <Link to="/login">Войдите</Link>, чтобы сделать ставку
                </div>
              )}
            </div>

            {isOwner && (
              <button className="btn-delete" onClick={handleDelete}>
                Удалить товар
              </button>
            )}
          </div>
        </div>

        <div className="bids-section">
          <div className="bids-header">
            <h2 className="bids-title">История ставок</h2>
            <span className="bids-count">{bids.length}</span>
          </div>

          {bids.length === 0 ? (
            <div className="no-bids">
              <p>Ставок пока нет. Станьте первым!</p>
            </div>
          ) : (
            <div className="bids-list">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className={`bid-item ${highestBidAmount === bid.amount ? 'highest-bid-item' : ''}`}
                >
                  <div className="bid-user">
                    <div className="bid-avatar">{getInitials(bid.username)}</div>
                    <div className="bid-details">
                      <span className="bid-username">{bid.username}</span>
                      <span className="bid-time">{getTimeAgo(bid.createdAt)}</span>
                    </div>
                    {highestBidAmount === bid.amount && (
                      <span className="highest-badge">🏆 Лидирует</span>
                    )}
                  </div>
                  <div className="bid-amount">{formatPrice(bid.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

