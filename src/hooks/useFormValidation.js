import { useState, useCallback, useMemo } from 'react'

export function useFormValidation(form, rules) {
  const [errors, setErrors] = useState({})

  const validateField = useCallback((key, valueOverride) => {
    const fieldRules = rules[key]
    if (!fieldRules) {
      setErrors((prev) => ({ ...prev, [key]: null }))
      return true
    }
    const validators = Array.isArray(fieldRules) ? fieldRules : [fieldRules]
    const value = valueOverride !== undefined ? valueOverride : (form && form[key])
    for (const validator of validators) {
      const err = validator(value)
      if (err) {
        setErrors((prev) => ({ ...prev, [key]: err }))
        return false
      }
    }
    setErrors((prev) => ({ ...prev, [key]: null }))
    return true
  }, [rules, form])

  const validate = useCallback((override) => {
    const target = override || form || {}
    const next = {}
    let valid = true
    for (const key of Object.keys(rules)) {
      const fieldRules = rules[key]
      const validators = Array.isArray(fieldRules) ? fieldRules : [fieldRules]
      next[key] = null
      for (const validator of validators) {
        const err = validator(target[key])
        if (err) {
          next[key] = err
          valid = false
          break
        }
      }
    }
    setErrors(next)
    return valid
  }, [rules, form])

  const clearErrors = useCallback(() => setErrors({}), [])

  const isValid = useMemo(() => Object.values(errors).every((e) => !e), [errors])

  return { errors, validate, validateField, clearErrors, isValid }
}
