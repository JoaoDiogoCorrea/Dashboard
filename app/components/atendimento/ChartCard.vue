<script setup lang="ts">
/** Moldura padrão dos gráficos: título, descritivo (o que mostra e como ler) e rodapé opcional */
defineProps<{ title: string, description: string }>()
</script>

<template>
  <section class="flex flex-col gap-4 rounded-xl border bg-background p-5">
    <header class="space-y-1">
      <h2 class="font-semibold leading-none">{{ title }}</h2>
      <p class="text-sm text-muted-foreground">{{ description }}</p>
    </header>
    <div class="flex-1">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-sm text-muted-foreground">
      <slot name="footer" />
    </footer>
  </section>
</template>
