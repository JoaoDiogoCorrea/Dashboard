const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

/** 10 -> "R$ 10,00" */
export const formatCurrency = (value: number) => currencyFormatter.format(value)

/** ISO -> "08/10/2026 14:30" */
export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso)).replace(',', '')

/** Horas -> "35 min", "15,0 h", "2,3 dias" */
export function formatDuration(hours: number) {
  if (hours < 1) return `${Math.round(hours * 60)} min`
  if (hours < 48) return `${hours.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`
  return `${(hours / 24).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} dias`
}

/** 0.4123 -> "41,2%" */
export const formatPercent = (ratio: number) =>
  ratio.toLocaleString('pt-BR', { style: 'percent', maximumFractionDigits: 1 })

/** "2026-03" -> "mar/26" */
export function formatMonth(yearMonth: string) {
  return new Date(`${yearMonth}-01T12:00:00Z`)
    .toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' })
    .replace('. de ', '/').replace(' de ', '/').replace('.', '')
}
