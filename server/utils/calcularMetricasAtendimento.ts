import type { InstalacaoLog } from '#shared/schemas/instalacaoLog'
import {
  FLUXO_KEYS, type EstatisticaTempo, type FluxoKey, type MetricasAtendimento,
} from '#shared/schemas/metricasAtendimento'

const HOUR = 3_600_000

/** Percentil com interpolação linear (p entre 0 e 1) */
function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0
  const pos = (sorted.length - 1) * p
  const lower = Math.floor(pos)
  const upper = Math.ceil(pos)
  return sorted[lower]! + (sorted[upper]! - sorted[lower]!) * (pos - lower)
}

function estatistica(values: number[]): EstatisticaTempo {
  const sorted = [...values].sort((a, b) => a - b)
  return {
    amostras: sorted.length,
    mediana: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    media: sorted.length ? sorted.reduce((s, v) => s + v, 0) / sorted.length : 0,
  }
}

/** Conta valores por faixa; `bounds` são os limites superiores (em horas) e a última faixa é aberta */
function histograma(values: number[], bounds: number[], labels: string[]) {
  const counts = labels.map(() => 0)
  for (const v of values) {
    const i = bounds.findIndex(b => v < b)
    counts[i === -1 ? labels.length - 1 : i]!++
  }
  return labels.map((label, i) => ({ label, count: counts[i]! }))
}

const hoursBetween = (a: InstalacaoLog, b: InstalacaoLog) =>
  (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) / HOUR

const isEmployeeAction = (log: InstalacaoLog) => log.status === 'approved' || log.status === 'reproved'

function classificarFluxo(history: InstalacaoLog[]): FluxoKey {
  const last = history.at(-1)!
  const reprovals = history.filter(l => l.status === 'reproved').length
  if (last.status === 'approved') {
    return reprovals === 0 ? 'approved_first_try'
      : reprovals === 1 ? 'approved_after_one_reproval'
        : 'approved_after_multiple_reprovals'
  }
  return last.status === 'reproved' ? 'abandoned' : 'pending'
}

export function calcularMetricasAtendimento(logs: InstalacaoLog[]): MetricasAtendimento {
  const byInstalacao = new Map<string, InstalacaoLog[]>()
  for (const log of logs) {
    const list = byInstalacao.get(log.parent_id) ?? []
    list.push(log)
    byInstalacao.set(log.parent_id, list)
  }

  const primeiraResposta: number[] = []
  const reenvio: number[] = []
  const tempoTotal: number[] = []
  const fluxos = new Map<FluxoKey, number>(FLUXO_KEYS.map(k => [k, 0]))
  const motivos = new Map<string, number>()
  const colaboradores = new Map<string, number[]>()
  const mensal = new Map<string, { instalacoes: number, primeiras: number[] }>()

  for (const history of byInstalacao.values()) {
    history.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const fluxo = classificarFluxo(history)
    fluxos.set(fluxo, fluxos.get(fluxo)! + 1)

    const mes = history[0]!.createdAt.slice(0, 7)
    const bucket = mensal.get(mes) ?? { instalacoes: 0, primeiras: [] }
    bucket.instalacoes++
    mensal.set(mes, bucket)

    let firstResponseSeen = false
    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i]!
      const next = history[i + 1]!
      if (current.status === 'under_analysis' && isEmployeeAction(next)) {
        const hours = hoursBetween(current, next)
        colaboradores.set(next.actor, [...(colaboradores.get(next.actor) ?? []), hours])
        if (!firstResponseSeen) {
          primeiraResposta.push(hours)
          bucket.primeiras.push(hours)
          firstResponseSeen = true
        }
      }
      if (current.status === 'reproved' && next.status === 'under_analysis') {
        reenvio.push(hoursBetween(current, next))
      }
    }

    for (const log of history) {
      if (log.status === 'reproved' && log.reason) motivos.set(log.reason, (motivos.get(log.reason) ?? 0) + 1)
    }
    if (history.at(-1)!.status === 'approved') tempoTotal.push(hoursBetween(history[0]!, history.at(-1)!))
  }

  const sortedDates = logs.map(l => l.createdAt).sort()
  const totalInstalacoes = byInstalacao.size
  const count = (k: FluxoKey) => fluxos.get(k)!

  return {
    periodo: sortedDates.length ? { inicio: sortedDates[0]!, fim: sortedDates.at(-1)! } : null,
    totalInstalacoes,
    totalLogs: logs.length,
    aprovadas: count('approved_first_try') + count('approved_after_one_reproval') + count('approved_after_multiple_reprovals'),
    aprovadasDePrimeira: count('approved_first_try'),
    abandonadas: count('abandoned'),
    primeiraResposta: estatistica(primeiraResposta),
    reenvioCliente: estatistica(reenvio),
    tempoTotalAprovacao: estatistica(tempoTotal),
    fluxos: FLUXO_KEYS.map(key => ({ key, count: count(key) })),
    motivosReprovacao: [...motivos].map(([code, n]) => ({ code, count: n })).sort((a, b) => b.count - a.count),
    histogramaPrimeiraResposta: histograma(
      primeiraResposta,
      [2, 4, 8, 12, 24, 48],
      ['< 2h', '2–4h', '4–8h', '8–12h', '12–24h', '24–48h', '> 48h'],
    ),
    histogramaReenvio: histograma(
      reenvio,
      [12, 24, 48, 96, 168, 336],
      ['< 12h', '12–24h', '1–2 dias', '2–4 dias', '4–7 dias', '7–14 dias', '> 14 dias'],
    ),
    porColaborador: [...colaboradores].map(([nome, hours]) => {
      const s = estatistica(hours)
      return { nome, analises: s.amostras, mediana: s.mediana, p90: s.p90 }
    }).sort((a, b) => a.mediana - b.mediana),
    mensal: [...mensal]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, m]) => ({ mes, instalacoes: m.instalacoes, medianaPrimeiraResposta: estatistica(m.primeiras).mediana })),
  }
}
