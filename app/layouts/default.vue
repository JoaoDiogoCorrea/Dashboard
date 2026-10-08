<script setup lang="ts">
import { Megaphone } from '@lucide/vue'

const nav = [
  { to: '/campanhas', label: 'Campanhas', icon: Megaphone },
]
</script>

<template>
  <div class="flex min-h-screen bg-muted/30">
    <aside class="hidden w-60 shrink-0 border-r bg-background md:block">
      <div class="flex h-14 items-center border-b px-5 font-semibold">
        Dashboard
      </div>
      <nav class="space-y-1 p-3">
        <NuxtLink
          v-for="item in nav" :key="item.to" :to="item.to"
          class="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          active-class="bg-muted font-medium !text-foreground"
        >
          <component :is="item.icon" class="size-4" />
          {{ item.label }}
        </NuxtLink>
      </nav>
    </aside>
    <main class="min-w-0 flex-1 p-4 md:p-8">
      <slot />
    </main>
  </div>
</template>
