<script setup lang="ts">
export interface ColumnItem {
  label: string
  value: number
  /** Texto exibido acima da coluna (padrão: o valor) */
  display?: string
  /** Texto do tooltip */
  title?: string
}

const props = defineProps<{ items: ColumnItem[], barClass?: string, emptyText?: string }>()
const max = computed(() => Math.max(...props.items.map(i => i.value), 0))
</script>

<template>
  <p v-if="items.length === 0 || max === 0" class="py-6 text-center text-sm text-muted-foreground">
    {{ emptyText ?? 'Sem dados' }}
  </p>
  <div v-else class="flex h-52 items-end gap-2">
    <div v-for="item in items" :key="item.label" class="flex h-full min-w-0 flex-1 flex-col justify-end" :title="item.title ?? `${item.label}: ${item.display ?? item.value}`">
      <span class="mb-1 text-center text-xs font-medium tabular-nums">{{ item.display ?? item.value }}</span>
      <div
        class="w-full rounded-t-md" :class="barClass ?? 'bg-chart-2'"
        :style="{ height: `${(item.value / max) * 100}%`, minHeight: item.value ? '2px' : '0' }"
      />
      <span class="mt-2 truncate text-center text-xs text-muted-foreground">{{ item.label }}</span>
    </div>
  </div>
</template>
