export function formatDate(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('pt-BR')
}

export function formatDateInput(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date)
  return d.toISOString().split('T')[0]
}

export function getMonthName(month) {
  const names = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
  return names[month - 1]
}

export function addMonths(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

export function today() {
  return new Date().toISOString().split('T')[0]
}
