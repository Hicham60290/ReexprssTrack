import { format, formatDistance, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

export const formatDate = (date: string | Date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '-'
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    if (isNaN(dateObj.getTime())) return '-'
    return format(dateObj, formatStr, { locale: fr })
  } catch (error) {
    return '-'
  }
}

export const formatDateTime = (date: string | Date) => {
  if (!date) return '-'
  return formatDate(date, 'dd/MM/yyyy HH:mm')
}

export const formatRelativeTime = (date: string | Date) => {
  if (!date) return '-'
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : new Date(date)
    if (isNaN(dateObj.getTime())) return '-'
    return formatDistance(dateObj, new Date(), { addSuffix: true, locale: fr })
  } catch (error) {
    return '-'
  }
}

export const formatCurrency = (amount: number, currency = 'EUR') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatWeight = (weight: number) => {
  return `${weight.toFixed(2)} kg`
}

export const formatDimensions = (dimensions: { length: number; width: number; height: number }) => {
  return `${dimensions.length} x ${dimensions.width} x ${dimensions.height} cm`
}
