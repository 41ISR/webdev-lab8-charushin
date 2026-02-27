import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { itemsAPI } from '../api/api'
import { useAuth } from '../store/AuthContext'
import '../styles/pages.css'
import '../styles/components.css'

export default function CreateItem() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  if (!user) {
    navigate('/login')
    return null
  }

  const handleImageUrlChange = (e) => {
    const url = e.target.value
    setImageUrl(url)
    if (url) {
      setImagePreview(url)
    } else {
      setImagePreview('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const item = await itemsAPI.create(
        title.trim(),
        description.trim(),
        parseFloat(price),
        imageUrl.trim() || undefined
      )
      navigate(`/items/${item.id}`)
    } catch (err) {
      setError(err.message || 'Ошибка при создании товара')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <h1>Создать новый товар</h1>
      </div>

      <div className="form-container">
        {error && (
          <div className="alert alert-error active">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              Название товара <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: iPhone 14 Pro 256GB"
              maxLength={100}
              required
            />
            <div className="char-counter">
              <span className="current">{title.length}</span> / 100
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Описание <span className="required">*</span>
            </label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Подробно опишите товар, его состояние, характеристики..."
              maxLength={1000}
              required
            />
            <div className="char-counter">
              <span className="current">{description.length}</span> / 1000
            </div>
            <div className="form-hint">
              Чем подробнее описание, тем больше шансов продать товар
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Начальная цена <span className="required">*</span>
            </label>
            <div className="input-group">
              <input
                type="number"
                className="form-input with-prefix"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="5000"
                min="1"
                step="100"
                required
              />
              <span className="input-prefix">₽</span>
            </div>
            <div className="form-hint">
              Укажите минимальную цену, с которой начнутся торги
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">URL изображения</label>
            <input
              type="url"
              className="form-input"
              value={imageUrl}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/image.jpg"
            />
            <div className="form-hint">
              Вставьте ссылку на изображение товара (опционально)
            </div>
            {imagePreview && (
              <div className="image-preview active">
                <img src={imagePreview} alt="Предпросмотр" onError={() => setImagePreview('')} />
              </div>
            )}
          </div>

          <div className="form-actions">
            <Link to="/" className="btn-cancel">Отмена</Link>
            <button type="submit" className="btn-submit success" disabled={loading}>
              {loading ? 'Создание...' : 'Создать товар'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

