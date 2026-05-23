import { create } from 'zustand'
import { productWarehouseApi } from '../api/productWarehouse'

export const useProductWarehouseStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchByWarehouse: async (warehouseId) => {
    set({ loading: true, error: null })
    try {
      const { data } = await productWarehouseApi.getByWarehouse(warehouseId)
      const items = Array.isArray(data) ? data : (data.data || [])
      set({ items })
      return items
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch inventory' })
      return []
    } finally {
      set({ loading: false })
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await productWarehouseApi.getAll()
      const items = Array.isArray(data) ? data : (data.data || [])
      set({ items })
      return items
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch inventory' })
      return []
    } finally {
      set({ loading: false })
    }
  },

  createItem: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await productWarehouseApi.create(payload)
      set({ items: [...get().items, data] })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to add inventory' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  updateItem: async (id, payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await productWarehouseApi.update(id, payload)
      set({ items: get().items.map((i) => (i.id === id ? data : i)) })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update inventory' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  deleteItem: async (id) => {
    set({ loading: true, error: null })
    try {
      await productWarehouseApi.delete(id)
      set({ items: get().items.filter((i) => i.id !== id) })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete inventory' })
      return false
    } finally {
      set({ loading: false })
    }
  }
}))
