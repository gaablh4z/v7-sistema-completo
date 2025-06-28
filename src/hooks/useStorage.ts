"use client"

import { useState, useEffect } from "react"

// Hook para localStorage
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : initialValue
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
    }
    return initialValue
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  const removeValue = () => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, removeValue] as const
}

// Hook para sessionStorage
export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = sessionStorage.getItem(key)
        return item ? JSON.parse(item) : initialValue
      }
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error)
    }
    return initialValue
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error)
    }
  }

  const removeValue = () => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, removeValue] as const
}

// Hook para persistir estado do formulário
export function useFormPersistence<T extends Record<string, any>>(
  key: string,
  initialState: T,
  useSession = false
) {
  const storage = useSession ? useSessionStorage : useLocalStorage
  const [formData, setFormData, clearFormData] = storage(key, initialState)

  const updateField = (field: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData(initialState)
    clearFormData()
  }

  return {
    formData,
    updateField,
    resetForm,
    setFormData,
    clearFormData
  }
}
