const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

/** 10 -> "R$ 10,00" */
export const formatCurrency = (value: number) => currencyFormatter.format(value)

/** ISO -> "08/10/2026 14:30" */
export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso)).replace(',', '')
