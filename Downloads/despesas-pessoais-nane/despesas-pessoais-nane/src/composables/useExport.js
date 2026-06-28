import * as XLSX from 'xlsx'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

export function useExport() {
  function buildRows(transactions, categories, cards) {
    return transactions.map(t => ({
      'Descrição': t.description,
      'Categoria': categories.find(c => c.id === t.categoryId)?.name || '-',
      'Valor': formatCurrency(t.amount),
      'Data': formatDate(t.date),
      'Cartão': cards.find(c => c.id === t.cardId)?.name || 'Dinheiro/Pix',
      'Status': t.status === 'pago' ? 'Pago' : 'Pendente',
      'Tipo': t.type === 'income' ? 'Receita' : 'Despesa',
      'Parcela': t.isInstallment ? `${t.installmentIndex}/${t.installmentTotal}` : '-',
      'Recorrente': t.isRecurring ? 'Sim' : 'Não'
    }))
  }

  function buildTotals(transactions, categories, cards) {
    const byCategory = {}
    const byCard = {}
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = categories.find(c => c.id === t.categoryId)?.name || 'Outros'
      byCategory[cat] = (byCategory[cat] || 0) + t.amount
      const card = cards.find(c => c.id === t.cardId)?.name || 'Dinheiro/Pix'
      byCard[card] = (byCard[card] || 0) + t.amount
    })
    const catRows = Object.entries(byCategory).map(([k, v]) => ({ 'Categoria': k, 'Total': formatCurrency(v) }))
    const cardRows = Object.entries(byCard).map(([k, v]) => ({ 'Cartão': k, 'Total': formatCurrency(v) }))
    return { catRows, cardRows }
  }

  function exportXLSX(transactions, categories, cards, month, year) {
    const wb = XLSX.utils.book_new()
    const rows = buildRows(transactions, categories, cards)
    const ws1 = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws1, 'Despesas')

    const { catRows, cardRows } = buildTotals(transactions, categories, cards)
    const totaisData = [
      { A: 'TOTAIS POR CATEGORIA' }, {},
      ...catRows.map(r => ({ A: r['Categoria'], B: r['Total'] })),
      {}, { A: 'TOTAIS POR CARTÃO' }, {},
      ...cardRows.map(r => ({ A: r['Cartão'], B: r['Total'] }))
    ]
    const ws2 = XLSX.utils.json_to_sheet(totaisData, { header: ['A','B'], skipHeader: true })
    XLSX.utils.book_append_sheet(wb, ws2, 'Totais')

    XLSX.writeFile(wb, `despesas_${month}_${year}.xlsx`)
  }

  function exportCSV(transactions, categories, cards, month, year) {
    const rows = buildRows(transactions, categories, cards)
    const { catRows, cardRows } = buildTotals(transactions, categories, cards)

    const ws = XLSX.utils.json_to_sheet(rows)
    let csv = XLSX.utils.sheet_to_csv(ws)

    csv += '\n\nTOTAIS POR CATEGORIA\nCategoria,Total\n'
    catRows.forEach(r => { csv += `${r['Categoria']},${r['Total']}\n` })
    csv += '\nTOTAIS POR CARTÃO\nCartão,Total\n'
    cardRows.forEach(r => { csv += `${r['Cartão']},${r['Total']}\n` })

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `despesas_${month}_${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return { exportXLSX, exportCSV }
}
