import { create } from 'zustand'
import { supplyApi } from '../api/supply'

export const useSupplyStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await supplyApi.getAll()
      const items = Array.isArray(data) ? data : (data.data || [])
      set({ items })
      return items
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch supply records' })
      return []
    } finally {
      set({ loading: false })
    }
  },

  fetchByWarehouse: async (warehouseId) => {
    set({ loading: true, error: null })
    try {
      const { data } = await supplyApi.getByWarehouse(warehouseId)
      const items = Array.isArray(data) ? data : (data.data || [])
      set({ items })
      return items
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch supply records' })
      return []
    } finally {
      set({ loading: false })
    }
  },

  fetchByProduct: async (productId) => {
    set({ loading: true, error: null })
    try {
      const { data } = await supplyApi.getByProduct(productId)
      const items = Array.isArray(data) ? data : (data.data || [])
      set({ items })
      return items
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch supply records' })
      return []
    } finally {
      set({ loading: false })
    }
  },

  createItem: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await supplyApi.create(payload)
      set({ items: [...get().items, data] })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create supply record' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  deleteItem: async (id) => {
    set({ loading: true, error: null })
    try {
      await supplyApi.delete(id)
      set({ items: get().items.filter((i) => i.id !== id) })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete supply record' })
      return false
    } finally {
      set({ loading: false })
    }
  }
}))
