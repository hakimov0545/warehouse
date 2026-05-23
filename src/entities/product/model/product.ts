import { create } from 'zustand'
import { productApi } from '@entities/product/api/product'
import { productCategoryApi } from '@entities/product/api/productCategory'

export const useProductStore = create((set, get) => ({
  products: [],
  currentProduct: null,
  categories: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await productApi.getAll()
      const products = Array.isArray(data) ? data : (data.data || [])
      set({ products })
      return products
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch products' })
      return []
    } finally {
      set({ loading: false })
    }
  },

  fetchProduct: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await productApi.getById(id)
      set({ currentProduct: data })
      return data
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch product' })
      return null
    } finally {
      set({ loading: false })
    }
  },

  createProduct: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await productApi.create(payload)
      set({ products: [...get().products, data] })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create product' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  updateProduct: async (id, payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await productApi.update(id, payload)
      set({ products: get().products.map((p) => (p.id === id ? data : p)) })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update product' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null })
    try {
      await productApi.delete(id)
      set({ products: get().products.filter((p) => p.id !== id) })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete product' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await productCategoryApi.getAll()
      const categories = Array.isArray(data) ? data : (data.data || [])
      set({ categories })
      return categories
    } catch {
      set({ categories: [] })
      return []
    }
  }
}))
