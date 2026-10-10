import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = {
  title: '',
  price: '',
  category: 'textbooks',
  condition: 'new',
  description: '',
  status: 'active'
}

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    let isCurrent = true
    setLoading(true)

    async function loadListing() {
      try {
        const response = await api.get(`/listings/${id}`)
        const listing = response.data.listing ?? response.data
        if (!isCurrent) return
        setForm({
          title: listing.title,
          price: Number(listing.price),
          category: listing.category,
          condition: listing.condition,
          description: listing.description || '',
          status: listing.status
        })
        setError('')
      } catch (err) {
        if (isCurrent) {
          setError(err.response?.data?.message || err.response?.data?.error || 'An error occurred')
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadListing()
    return () => {
      isCurrent = false
    }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(current => ({
      ...current,
      [name]: name === 'price' && value !== '' ? Number(value) : value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const payload = {
      title: form.title,
      price: Number(form.price),
      category: form.category,
      condition: form.condition,
      description: form.description,
      ...(id && { status: form.status })
    }

    try {
      if (id) {
        await api.patch(`/listings/${id}`, payload)
      } else {
        await api.post('/listings', payload)
      }
      nav('/listings')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Listing</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>}

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="title">Title</label>
          <input
            className="input"
            id="title"
            name="title"
            value={form.title}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="price">Price</label>
          <input
            className="input"
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={onChange}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="category">Category</label>
          <select className="input" id="category" name="category" value={form.category} onChange={onChange}>
            <option value="textbooks">Textbooks</option>
            <option value="electronics">Electronics</option>
            <option value="furniture">Furniture</option>
            <option value="clothing">Clothing</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="condition">Condition</label>
          <select className="input" id="condition" name="condition" value={form.condition} onChange={onChange}>
            <option value="new">New</option>
            <option value="like-new">Like New</option>
            <option value="used">Used</option>
            <option value="worn">Worn</option>
          </select>
        </div>

        {Boolean(id) && (
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="status">Status</label>
            <select className="input" id="status" name="status" value={form.status} onChange={onChange}>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="description">Description</label>
          <textarea
            className="input"
            id="description"
            name="description"
            rows="4"
            value={form.description}
            onChange={onChange}
          />
        </div>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}
