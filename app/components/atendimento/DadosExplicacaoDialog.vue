<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Info } from '@lucide/vue'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { REPROVAL_REASON_LABELS } from '#shared/schemas/instalacaoLog'
import { FLUXO_LABELS, type MetricasAtendimento } from '#shared/schemas/metricasAtendimento'

const props = defineProps<{ metricas?: MetricasAtendimento | null }>()

/** Sequência de status de cada fluxo, como aparece nos logs */
const FLUXO_SEQUENCIAS = {
  approved_first_try: 'under_analysis → approved',
  approved_after_one_reproval: 'under_analysis → reproved → under_analysis → approved',
  approved_after_multiple_reprovals: 'under_analysis → reproved → under_analysis → reproved → under_analysis → approved',
  abandoned: 'under_analysis → reproved',
} as const

const fluxos = computed(() =>
  (Object.keys(FLUXO_SEQUENCIAS) as (keyof typeof FLUXO_SEQUENCIAS)[]).map(key => ({
    label: FLUXO_LABELS[key],
    sequencia: FLUXO_SEQUENCIAS[key],
    count: props.metricas?.fluxos.find(f => f.key === key)?.count,
  })))

const CAMPOS = [
  { nome: 'id', desc: 'Identificador único do log (UUID).' },
  { nome: 'status', desc: 'Status em que a instalação entrou nesta mudança.' },
  { nome: 'type', desc: 'Tipo do log. Hoje sempre "register" (registro de mudança de status).' },
  { nome: 'parent_id', desc: 'Identificador da instalação (UUID). Todos os logs da mesma instalação compartilham o mesmo valor.' },
  { nome: 'actor', desc: '"customer" quando a ação é do cliente; nome do colaborador quando é aprovação ou reprovação.' },
  { nome: 'reason', desc: 'Motivo da ação: "initial_request" ou "resubmission" no pedido de análise, o código do motivo na reprovação e null na aprovação.' },
  { nome: 'createdAt', desc: 'Data e hora da mudança de status (ISO 8601, UTC).' },
]
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline" size="sm">
        <Info class="size-4" /> Entenda os dados
      </Button>
    </DialogTrigger>
    <DialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Entenda os dados</DialogTitle>
        <DialogDescription>
          De onde vêm os números desta página e como a massa de dados foi construída.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 text-sm">
        <section class="space-y-2">
          <h3 class="font-semibold">Dados simulados</h3>
          <p>
            Os registros são <strong>fictícios</strong>, gerados por script para testar a análise antes de
            existirem dados reais. Os tempos, os percentuais de cada fluxo e os nomes dos colaboradores foram
            definidos por suposição. Portanto, as conclusões valem para o modelo, não para o atendimento real.
          </p>
          <p v-if="metricas" class="text-muted-foreground">
            Massa atual: <strong class="text-foreground">{{ metricas.totalInstalacoes }} instalações</strong> e
            <strong class="text-foreground">{{ metricas.totalLogs }} logs</strong>, de janeiro a outubro de 2026.
          </p>
        </section>

        <section class="space-y-2">
          <h3 class="font-semibold">O que é um log</h3>
          <p>
            Cada mudança de status de uma instalação gera um log. Esta análise usa só os status do fluxo de
            análise: <code class="rounded bg-muted px-1">under_analysis</code> (o cliente pede análise),
            <code class="rounded bg-muted px-1">reproved</code> e <code class="rounded bg-muted px-1">approved</code>
            (o colaborador responde).
          </p>
          <dl class="divide-y rounded-lg border">
            <div v-for="c in CAMPOS" :key="c.nome" class="grid gap-1 p-3 sm:grid-cols-[7rem_1fr]">
              <dt><code class="font-mono text-xs font-semibold">{{ c.nome }}</code></dt>
              <dd class="text-muted-foreground">{{ c.desc }}</dd>
            </div>
          </dl>
          <p class="rounded-lg bg-muted/60 p-3 font-mono text-xs leading-relaxed">
            { "status": "reproved", "type": "register", "parent_id": "…",<br>
            &nbsp;&nbsp;"actor": "Ana Souza", "reason": "missing_documents", "createdAt": "2026-03-04T14:22:10Z" }
          </p>
        </section>

        <section class="space-y-2">
          <h3 class="font-semibold">Fluxos possíveis</h3>
          <p>As instalações seguem um destes quatro caminhos:</p>
          <ul class="space-y-2">
            <li v-for="f in fluxos" :key="f.label" class="rounded-lg border p-3">
              <div class="flex items-baseline justify-between gap-3">
                <span class="font-medium">{{ f.label }}</span>
                <span v-if="f.count !== undefined" class="tabular-nums text-muted-foreground">{{ f.count }} instalações</span>
              </div>
              <code class="mt-1 block text-xs text-muted-foreground">{{ f.sequencia }}</code>
            </li>
          </ul>
        </section>

        <section class="space-y-2">
          <h3 class="font-semibold">Motivos de reprovação</h3>
          <p>
            Seis motivos possíveis:
            {{ Object.values(REPROVAL_REASON_LABELS).join(', ').toLowerCase() }}.
            Na mesma instalação o motivo nunca se repete entre duas reprovações.
          </p>
        </section>

        <section class="space-y-2">
          <h3 class="font-semibold">Como os tempos foram simulados</h3>
          <ul class="list-disc space-y-1 pl-5">
            <li>
              <strong>Pedidos do cliente</strong> acontecem a qualquer hora, inclusive à noite e em fins de semana.
            </li>
            <li>
              <strong>Respostas do colaborador</strong> só acontecem em dias úteis, das 8h às 18h (horário de Brasília).
              Se o prazo cai fora desse horário, a resposta vai para a próxima abertura.
            </li>
            <li>
              <strong>Prazos típicos:</strong> reprovação em torno de 6h, reenvio do cliente em torno de 2 dias e
              aprovação em torno de 3h (5h quando a aprovação é direta), sempre com variação e alguns casos bem longos.
            </li>
            <li>
              <strong>Colaboradores:</strong> cada um tem um ritmo diferente, e em 25% das reanálises outro
              colaborador assume o caso.
            </li>
            <li>
              <strong>Motivos:</strong> o tempo de correção do cliente depende do motivo (documentos ausentes
              demoram mais; endereço sem cobertura demora menos).
            </li>
          </ul>
        </section>

        <section class="space-y-2">
          <h3 class="font-semibold">Como são calculados os indicadores</h3>
          <ul class="list-disc space-y-1 pl-5">
            <li><strong>Primeira resposta:</strong> do primeiro <code>under_analysis</code> até a primeira aprovação ou reprovação.</li>
            <li><strong>Reenvio do cliente:</strong> de cada <code>reproved</code> até o <code>under_analysis</code> seguinte.</li>
            <li><strong>Tempo até aprovar:</strong> do primeiro pedido até o <code>approved</code>, só nas instalações aprovadas.</li>
            <li><strong>Tempo por colaborador:</strong> de cada <code>under_analysis</code> até a resposta, inclusive nas reanálises.</li>
            <li>Todos os tempos são em horas corridas. Mediana é o valor central; p90 é o tempo abaixo do qual ficam 90% dos casos.</li>
          </ul>
        </section>

        <section class="space-y-2">
          <h3 class="font-semibold">Como gerar novamente</h3>
          <p>
            Os dados ficam em <code class="rounded bg-muted px-1">data/instalacoes-logs.json</code>. Para refazer ou
            aumentar a massa, rode o script abaixo. A mesma semente gera sempre o mesmo resultado.
          </p>
          <p class="rounded-lg bg-muted/60 p-3 font-mono text-xs">node scripts/gerar-logs-instalacao.mjs 200 42</p>
        </section>
      </div>
    </DialogContent>
  </Dialog>
</template>
