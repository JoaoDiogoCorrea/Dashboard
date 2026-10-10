/** Estatísticas de um tempo, sempre em horas corridas */
export interface EstatisticaTempo {
  amostras: number
  mediana: number
  p90: number
  media: number
}

export const FLUXO_KEYS = [
  'approved_first_try', 'approved_after_one_reproval', 'approved_after_multiple_reprovals', 'abandoned', 'pending',
] as const
export type FluxoKey = (typeof FLUXO_KEYS)[number]

export const FLUXO_LABELS: Record<FluxoKey, string> = {
  approved_first_try: 'Aprovada de primeira',
  approved_after_one_reproval: 'Aprovada após 1 reprovação',
  approved_after_multiple_reprovals: 'Aprovada após 2+ reprovações',
  abandoned: 'Abandonada após reprovação',
  pending: 'Em análise',
}

export interface MetricasAtendimento {
  periodo: { inicio: string, fim: string } | null
  totalInstalacoes: number
  totalLogs: number
  aprovadas: number
  aprovadasDePrimeira: number
  abandonadas: number
  /** Pedido de análise -> primeira resposta do colaborador */
  primeiraResposta: EstatisticaTempo
  /** Reprovação -> cliente reenviar para análise */
  reenvioCliente: EstatisticaTempo
  /** Pedido de análise -> aprovação (somente instalações aprovadas) */
  tempoTotalAprovacao: EstatisticaTempo
  fluxos: { key: FluxoKey, count: number }[]
  motivosReprovacao: { code: string, count: number }[]
  histogramaPrimeiraResposta: { label: string, count: number }[]
  histogramaReenvio: { label: string, count: number }[]
  /** Tempo de resposta em cada análise (inclusive reanálises), por colaborador */
  porColaborador: { nome: string, analises: number, mediana: number, p90: number }[]
  /** Pelo mês do pedido inicial */
  mensal: { mes: string, instalacoes: number, medianaPrimeiraResposta: number }[]
}
