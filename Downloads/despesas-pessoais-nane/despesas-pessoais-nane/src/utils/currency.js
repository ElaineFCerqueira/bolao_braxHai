// Currency utilities
export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value))
}

export function parseCurrency(str) {
  if (!str) return 0
  const clean = str.toString().replace(/[R$\s.]/g, '').replace(',', '.')
  return parseFloat(clean) || 0
}

export function maskCurrency(value) {
  let v = value.toString().replace(/\D/g, '')
  v = (parseInt(v) / 100).toFixed(2)
  v = v.replace('.', ',')
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
  return 'R$ ' + v
}
