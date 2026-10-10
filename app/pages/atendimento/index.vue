<script setup lang="ts">
import { ChartColumn, RotateCw } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import KpiCard from '@/components/atendimento/KpiCard.vue'
import ChartCard from '@/components/atendimento/ChartCard.vue'
import BarList from '@/components/atendimento/BarList.vue'
import ColumnChart from '@/components/atendimento/ColumnChart.vue'
import DadosExplicacaoDialog from '@/components/atendimento/DadosExplicacaoDialog.vue'
import { REPROVAL_REASON_LABELS } from '#shared/schemas/instalacaoLog'
import { FLUXO_LABELS, type FluxoKey, type MetricasAtendimento } from '#shared/schemas/metricasAtendimento'

useHead({ title: 'Análise de atendimento' })

const { data, status, error, refresh } = await useFetch<MetricasAtendimento>('/api/instalacoes/metricas')

const m = computed(() => data.value)
const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' })
const periodo = computed(() => m.value?.periodo
  ? `${dateFormatter.format(new Date(m.value.periodo.inicio))} a ${dateFormatter.format(new Date(m.value.periodo.fim))}`
  : 'Sem registros')

const ratio = (part: number) => (m.value?.totalInstalacoes ? part / m.value.totalInstalacoes : 0)

// Classes completas para o Tailwind enxergá-las
const FLUXO_COLORS: Record<FluxoKey, string> = {
  approved_first_try: 'bg-chart-2',
  approved_after_one_reproval: 'bg-chart-4',
  approved_after_multiple_reprovals: 'bg-chart-5',
  abandoned: 'bg-destructive',
  pending: 'bg-muted-foreground',
}

const fluxos = computed(() => (m.value?.fluxos ?? [])
  .filter(f => f.count > 0)
  .map(f => ({
    label: FLUXO_LABELS[f.key],
    value: f.count,
    display: `${f.count} (${formatPercent(ratio(f.count))})`,
    barClass: FLUXO_COLORS[f.key],
  })))

const motivos = computed(() => {
  const list = m.value?.motivosReprovacao ?? []
  const total = list.reduce((s, r) => s + r.count, 0)
  return list.map(r => ({
    label: REPROVAL_REASON_LABELS[r.code] ?? r.code,
    value: r.count,
    display: `${r.count} (${formatPercent(total ? r.count / total : 0)})`,
    barClass: 'bg-chart-1',
  }))
})

const colaboradores = computed(() => (m.value?.porColaborador ?? []).map(c => ({
  label: c.nome,
  value: c.mediana,
  display: formatDuration(c.mediana),
  hint: `${c.analises} análises · p90 ${formatDuration(c.p90)}`,
})))

const mensal = computed(() => (m.value?.mensal ?? []).map(x => ({
  label: formatMonth(x.mes),
  value: x.medianaPrimeiraResposta,
  display: formatDuration(x.medianaPrimeiraResposta),
  title: `${formatMonth(x.mes)}: ${x.instalacoes} pedidos, mediana ${formatDuration(x.medianaPrimeiraResposta)}`,
})))
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <header>
      <div class="flex flex-wrap items-center gap-3">
        <h1 class="text-2xl font-semibold tracking-tight">Análise de atendimento</h1>
        <DadosExplicacaoDialog :metricas="m" />
      </div>
      <p class="text-sm text-muted-foreground">
        Tempo de resposta no fluxo de análise de instalações · {{ periodo }}
      </p>
    </header>

    <div v-if="status === 'pending'" class="space-y-4">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Skeleton v-for="i in 5" :key="i" class="h-32" />
      </div>
      <div class="grid gap-4 lg:grid-cols-2">
        <Skeleton v-for="i in 4" :key="i" class="h-72" />
      </div>
    </div>

    <div v-else-if="error || !m" class="rounded-lg border border-destructive/30 bg-background p-10 text-center">
      <p class="font-medium">Não foi possível carregar os indicadores</p>
      <Button variant="outline" class="mt-4" @click="refresh()">
        <RotateCw class="size-4" /> Tentar novamente
      </Button>
    </div>

    <div v-else-if="m.totalInstalacoes === 0" class="rounded-lg border border-dashed bg-background p-12 text-center">
      <ChartColumn class="mx-auto size-10 text-muted-foreground" />
      <p class="mt-3 font-medium">Nenhum registro de instalação</p>
      <p class="text-sm text-muted-foreground">Gere a massa de dados em <code>data/instalacoes-logs.json</code>.</p>
    </div>

    <template v-else>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Instalações" :value="String(m.totalInstalacoes)" :detail="`${m.totalLogs} logs de status`"
          description="Total de instalações com pedido de análise no período."
        />
        <KpiCard
          label="Taxa de aprovação" :value="formatPercent(ratio(m.aprovadas))" :detail="`${m.aprovadas} de ${m.totalInstalacoes}`"
          description="Instalações que terminaram aprovadas, de qualquer fluxo."
        />
        <KpiCard
          label="Aprovadas de primeira" :value="formatPercent(ratio(m.aprovadasDePrimeira))" :detail="`${m.aprovadasDePrimeira} instalações`"
          description="Aprovadas sem nenhuma reprovação. Quanto maior, menos retrabalho."
        />
        <KpiCard
          label="Primeira resposta" :value="formatDuration(m.primeiraResposta.mediana)" :detail="`p90: ${formatDuration(m.primeiraResposta.p90)}`"
          description="Mediana do tempo entre o pedido do cliente e a resposta do colaborador."
        />
        <KpiCard
          label="Tempo até aprovar" :value="formatDuration(m.tempoTotalAprovacao.mediana)" :detail="`p90: ${formatDuration(m.tempoTotalAprovacao.p90)}`"
          description="Mediana do primeiro pedido até a aprovação, incluindo reenvios."
        />
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Como as instalações terminaram"
          description="Resultado final de cada instalação no fluxo de análise. Mostra quantas são aprovadas de primeira e quantas se perdem porque o cliente não reenvia após a reprovação."
        >
          <BarList :items="fluxos" />
        </ChartCard>

        <ChartCard
          title="Motivos de reprovação"
          description="Quantidade de reprovações por motivo. Uma instalação reprovada duas vezes conta duas vezes. Os motivos no topo são os que mais geram retrabalho."
        >
          <BarList :items="motivos" empty-text="Nenhuma reprovação no período" />
        </ChartCard>

        <ChartCard
          title="Tempo até a primeira resposta"
          description="Quantas instalações caíram em cada faixa de tempo entre o pedido de análise do cliente e a primeira resposta do colaborador (aprovação ou reprovação). Horas corridas, incluindo noites e fins de semana."
        >
          <ColumnChart :items="m.histogramaPrimeiraResposta.map(b => ({ label: b.label, value: b.count }))" />
          <template #footer>
            <span>Mediana: <strong class="text-foreground">{{ formatDuration(m.primeiraResposta.mediana) }}</strong></span>
            <span>p90: <strong class="text-foreground">{{ formatDuration(m.primeiraResposta.p90) }}</strong></span>
            <span>Média: <strong class="text-foreground">{{ formatDuration(m.primeiraResposta.media) }}</strong></span>
          </template>
        </ChartCard>

        <ChartCard
          title="Tempo de reenvio do cliente"
          description="Quanto o cliente demora para pedir nova análise depois de uma reprovação. Considera só quem reenviou; quem abandonou o processo não entra no gráfico."
        >
          <ColumnChart :items="m.histogramaReenvio.map(b => ({ label: b.label, value: b.count }))" bar-class="bg-chart-4" />
          <template #footer>
            <span>Mediana: <strong class="text-foreground">{{ formatDuration(m.reenvioCliente.mediana) }}</strong></span>
            <span>p90: <strong class="text-foreground">{{ formatDuration(m.reenvioCliente.p90) }}</strong></span>
            <span>{{ m.reenvioCliente.amostras }} reenvios</span>
          </template>
        </ChartCard>

        <ChartCard
          title="Tempo de resposta por colaborador"
          description="Mediana do tempo que cada colaborador leva para responder uma análise (inclusive reanálises), do mais rápido ao mais lento. O p90 indica o tempo abaixo do qual ficam 90% das respostas."
        >
          <BarList :items="colaboradores" />
        </ChartCard>

        <ChartCard
          title="Evolução mensal da primeira resposta"
          description="Mediana do tempo até a primeira resposta, agrupada pelo mês do pedido de análise. Serve para ver se o atendimento está melhorando ou piorando ao longo do tempo."
        >
          <ColumnChart :items="mensal" />
        </ChartCard>
      </div>

      <p class="text-xs text-muted-foreground">
        Todos os tempos são em horas corridas. Mediana é o valor central (metade dos casos é mais rápida que ela);
        p90 é o tempo abaixo do qual ficam 90% dos casos.
      </p>
    </template>
  </div>
</template>
