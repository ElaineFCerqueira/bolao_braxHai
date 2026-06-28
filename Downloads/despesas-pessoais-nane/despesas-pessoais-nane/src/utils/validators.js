import { parseCurrency } from './currency.js'

export function validateTransaction(form) {
  const errors = {}

  if (!form.description || form.description.trim().length < 3)
    errors.description = 'Descrição deve ter pelo menos 3 caracteres'

  if (!form.categoryId)
    errors.categoryId = 'Selecione uma categoria'

  const amount = parseCurrency(form.amountRaw)
  if (!amount || amount <= 0)
    errors.amount = 'Informe um valor válido maior que zero'

  if (!form.date)
    errors.date = 'Informe a data da despesa'

  if (form.paymentMethod === 'parcelado') {
    if (!form.installmentTotal || form.installmentTotal < 2)
      errors.installmentTotal = 'Número de parcelas deve ser pelo menos 2'
  }

  return errors
}
