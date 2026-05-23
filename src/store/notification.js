import { create } from 'zustand'

let nextId = 0

export const useNotificationStore = create((set, get) => ({
  notifications: [],

  add: ({ type = 'info', message, duration = 4000 }) => {
    const id = ++nextId
    set((s) => ({ notifications: [...s.notifications, { id, type, message }] }))
    if (duration > 0) {
      setTimeout(() => get().remove(id), duration)
    }
  },

  remove: (id) => {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }))
  },

  success: (message) => get().add({ type: 'success', message }),
  error: (message) => get().add({ type: 'error', message, duration: 6000 }),
  warning: (message) => get().add({ type: 'warning', message }),
  info: (message) => get().add({ type: 'info', message })
}))
