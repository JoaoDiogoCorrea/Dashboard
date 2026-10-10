<script setup lang="ts">
export interface BarItem {
  label: string
  value: number
  /** Texto exibido à direita (padrão: o valor) */
  display?: string
  /** Texto auxiliar abaixo do rótulo */
  hint?: string
  /** Classe de cor da barra (classe Tailwind completa, ex.: "bg-chart-2") */
  barClass?: string
}

const props = defineProps<{ items: BarItem[], emptyText?: string }>()
const max = computed(() => Math.max(...props.items.map(i => i.value), 0))
</script>

<template>
  <p v-if="items.length === 0" class="py-6 text-center text-sm text-muted-foreground">
    {{ emptyText ?? 'Sem dados' }}
  </p>
  <ul v-else class="space-y-3">
    <li v-for="item in items" :key="item.label">
      <div class="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span class="min-w-0 truncate">
          {{ item.label }}
          <span v-if="item.hint" class="text-xs text-muted-foreground"> · {{ item.hint }}</span>
        </span>
        <span class="shrink-0 font-medium tabular-nums">{{ item.display ?? item.value }}</span>
      </div>
      <div class="h-2.5 rounded-full bg-muted">
        <div
          class="h-full rounded-full" :class="item.barClass ?? 'bg-chart-2'"
          :style="{ width: max ? `${Math.max((item.value / max) * 100, item.value ? 1.5 : 0)}%` : '0%' }"
        />
      </div>
    </li>
  </ul>
</template>
