import { useState } from 'react'

export const useBookingForm = (initialValues = {}) => {
  const [form, setForm] = useState({ subject: '', date: '', time: '', notes: '', ...initialValues })
  const [errors, setErrors] = useState({})

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const reset = () => setForm(initialValues)

  return { form, errors, setField, setErrors, reset }
}

export default useBookingForm
