import { defineStore } from 'pinia'
import type { Campanha } from '#shared/schemas/campanha'

type Status = 'idle' | 'loading' | 'success' | 'error'

export const useCampanhasStore = defineStore('campanhas', () => {
  const items = ref<Campanha[]>([])
  const status = ref<Status>('idle')
  const error = ref<string | null>(null)

  async function fetchAll() {
    status.value = 'loading'
    error.value = null
    try {
      items.value = await $fetch<Campanha[]>('/api/campanhas')
      status.value = 'success'
    }
    catch (e: any) {
      error.value = e?.statusMessage ?? 'Não foi possível carregar as campanhas'
      status.value = 'error'
    }
  }

  /** Soft delete no servidor e remoção da lista local */
  async function remove(id: string) {
    await $fetch(`/api/campanhas/${id}`, { method: 'DELETE' })
    items.value = items.value.filter(c => c.id !== id)
  }

  return { items, status, error, fetchAll, remove }
})
