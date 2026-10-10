/** GET /api/instalacoes/metricas — indicadores de tempo de resposta do fluxo de análise */
export default defineEventHandler(async () => {
  return calcularMetricasAtendimento(await readAllInstalacaoLogs())
})
