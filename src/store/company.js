import { create } from 'zustand'
import { companyApi } from '../api/company'

export const useCompanyStore = create((set) => ({
  company: null,
  loading: false,
  error: null,

  fetchCompany: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await companyApi.getByOwner()
      const companies = Array.isArray(data) ? data : (data.data || [])
      const company = companies.length > 0 ? companies[0] : null
      set({ company })
      return company
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch company' })
      return null
    } finally {
      set({ loading: false })
    }
  },

  createCompany: async (payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await companyApi.create(payload)
      set({ company: data })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create company' })
      return false
    } finally {
      set({ loading: false })
    }
  },

  updateCompany: async (id, payload) => {
    set({ loading: true, error: null })
    try {
      const { data } = await companyApi.update(id, payload)
      set({ company: data })
      return true
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update company' })
      return false
    } finally {
      set({ loading: false })
    }
  }
}))
