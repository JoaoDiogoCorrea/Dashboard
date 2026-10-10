<script setup lang="ts">
defineProps<{ label: string, value: string, detail?: string, description: string }>()
</script>

<template>
  <div class="flex flex-col gap-1 rounded-xl border bg-background p-4">
    <p class="text-sm font-medium text-muted-foreground">{{ label }}</p>
    <p class="text-2xl font-semibold tracking-tight tabular-nums">{{ value }}</p>
    <p v-if="detail" class="text-sm tabular-nums">{{ detail }}</p>
    <p class="mt-auto pt-1 text-xs text-muted-foreground">{{ description }}</p>
  </div>
</template>
