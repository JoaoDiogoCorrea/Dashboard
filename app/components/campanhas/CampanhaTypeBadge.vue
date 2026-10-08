<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { CAMPANHA_TYPE_LABELS, type CampanhaType } from '#shared/schemas/campanha'

defineProps<{ type: CampanhaType }>()

const colors: Record<CampanhaType, string> = {
  promotional: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300',
  collaborator: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  partner: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300',
}
</script>

<template>
  <Badge variant="outline" :class="colors[type]">
    {{ CAMPANHA_TYPE_LABELS[type] }}
  </Badge>
</template>
