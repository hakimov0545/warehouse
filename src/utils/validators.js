export const required = (msg = 'This field is required') => (val) => {
  if (val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0))
    return msg
  return null
}

export const minLength = (min, msg) => (val) => {
  if (val && val.length < min) return msg || `Minimum ${min} characters`
  return null
}

export const maxLength = (max, msg) => (val) => {
  if (val && val.length > max) return msg || `Maximum ${max} characters`
  return null
}

export const email = (msg = 'Invalid email address') => (val) => {
  if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return msg
  return null
}

export const numeric = (msg = 'Must be a number') => (val) => {
  if (val !== '' && val !== null && val !== undefined && isNaN(Number(val))) return msg
  return null
}

export const minValue = (min, msg) => (val) => {
  if (val !== '' && val !== null && Number(val) < min) return msg || `Minimum value is ${min}`
  return null
}

export const maxValue = (max, msg) => (val) => {
  if (val !== '' && val !== null && Number(val) > max) return msg || `Maximum value is ${max}`
  return null
}
