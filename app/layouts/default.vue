<script setup lang="ts">
import { ChartColumn, Megaphone } from '@lucide/vue'
import UserMenu from '@/components/layout/UserMenu.vue'

const nav = [
  { to: '/campanhas', label: 'Campanhas', icon: Megaphone },
  { to: '/atendimento', label: 'Análise de atendimento', icon: ChartColumn },
]
</script>

<template>
  <div class="flex min-h-screen flex-col bg-muted/30">
    <header class="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-background px-4 md:px-5">
      <NuxtLink to="/" class="flex items-center gap-2 font-semibold">
        <!-- Substituir pela logomarca (ex.: <img src="/logo.svg">) -->
        <Megaphone class="size-5" />
        Dashboard
      </NuxtLink>
      <UserMenu />
    </header>

    <div class="flex flex-1">
      <aside class="hidden w-60 shrink-0 border-r bg-background md:block">
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
  </div>
</template>
