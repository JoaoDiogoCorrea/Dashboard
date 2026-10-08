<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Megaphone, Plus, RotateCw } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import CampanhasTable from '@/components/campanhas/CampanhasTable.vue'
import CampanhaDeleteDialog from '@/components/campanhas/CampanhaDeleteDialog.vue'
import type { Campanha } from '#shared/schemas/campanha'

useHead({ title: 'Campanhas' })

const store = useCampanhasStore()
// Busca a lista a cada navegação para a página (SSR na primeira carga)
await callOnce('campanhas', () => store.fetchAll(), { mode: 'navigation' })

const toDelete = ref<Campanha | null>(null)
const deleting = ref(false)

async function confirmDelete() {
  if (!toDelete.value) return
  const { id, name } = toDelete.value
  deleting.value = true
  try {
    await store.remove(id)
    toast.success(`Campanha "${name}" excluída`)
    toDelete.value = null
  }
  catch {
    toast.error('Não foi possível excluir a campanha')
  }
  finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Campanhas</h1>
        <p class="text-sm text-muted-foreground">Gerencie cupons e descontos das campanhas.</p>
      </div>
      <!-- Criação ainda não implementada -->
      <Button disabled title="Em breve">
        <Plus class="size-4" /> Nova campanha
      </Button>
    </header>

    <!-- Carregando -->
    <div v-if="store.status === 'loading' || store.status === 'idle'" class="space-y-3">
      <div class="flex gap-2">
        <Skeleton class="h-9 w-72" />
        <Skeleton class="h-9 w-44" />
      </div>
      <Skeleton v-for="i in 6" :key="i" class="h-12 w-full" />
    </div>

    <!-- Erro -->
    <div v-else-if="store.status === 'error'" class="rounded-lg border border-destructive/30 bg-background p-10 text-center">
      <p class="font-medium">{{ store.error }}</p>
      <Button variant="outline" class="mt-4" @click="store.fetchAll()">
        <RotateCw class="size-4" /> Tentar novamente
      </Button>
    </div>

    <!-- Vazio -->
    <div v-else-if="store.items.length === 0" class="rounded-lg border border-dashed bg-background p-12 text-center">
      <Megaphone class="mx-auto size-10 text-muted-foreground" />
      <p class="mt-3 font-medium">Nenhuma campanha cadastrada</p>
      <p class="text-sm text-muted-foreground">Crie a primeira campanha para começar.</p>
      <Button class="mt-4" disabled title="Em breve">
        <Plus class="size-4" /> Nova campanha
      </Button>
    </div>

    <!-- Listagem -->
    <div v-else class="rounded-xl border bg-background p-4 md:p-6">
      <CampanhasTable :data="store.items" @delete="toDelete = $event" />
    </div>

    <CampanhaDeleteDialog
      :campanha="toDelete" :loading="deleting"
      @confirm="confirmDelete" @close="toDelete = null"
    />
  </div>
</template>
