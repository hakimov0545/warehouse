import { create } from 'zustand'
import { warehouseApi } from '../api/warehouse'

export const useWarehouseStore = create((set, get) => ({
  warehouses: [],
  activeCount: 0,
  currentWarehouse: null,
  loading: false,
  error: null,

  fetchWarehouses: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await warehouseApi.getByOwner()
      const warehouses = Array.isArray(data) ? data : (data.data || [])
      set({ warehouses })
      return warehouses
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch warehouses' })
      return []
    } finally {
      set({ loading: false })
    }
  },

  fetchActiveCount: async () => {
    try {
      const { data } = await warehouseApi.getPage({ isActive: true, size: 10, page: 0 })
      set({ activeCount: data.totalElements || 0 })
    } catch {
      set({ activeCount: 0 })
    }
  },

  fetchWarehouse: async (id) => {
    set({ loading: true, error: null })
    try {
      const { data } = await warehouseApi.getById(id)
      set({ currentWarehouse: data })
      return data
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch warehouse' })
      return null
    } finally {
      set({ loading: false })
    }
  },

  createWarehouse: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await warehouseApi.create(payload)
      set({ warehouses: [...get().warehouses, data] })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create warehouse' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  updateWarehouse: async (id, payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await warehouseApi.update(id, payload)
      set({ warehouses: get().warehouses.map((w) => (w.id === id ? data : w)) })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update warehouse' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  deleteWarehouse: async (id) => {
    set({ loading: true, error: null })
    try {
      await warehouseApi.delete(id)
      set({ warehouses: get().warehouses.filter((w) => w.id !== id) })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete warehouse' })
      return false
    } finally {
      set({ loading: false })
    }
  }
}))
