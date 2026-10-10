import { defineStore } from 'pinia'
import type { Campanha, CampanhaInput } from '#shared/schemas/campanha'

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

  /** Cria a campanha no servidor e a insere no topo da lista local */
  async function create(input: CampanhaInput) {
    const created = await $fetch<Campanha>('/api/campanhas', { method: 'POST', body: input })
    items.value = [created, ...items.value]
    return created
  }

  /** Soft delete no servidor e remoção da lista local */
  async function remove(id: string) {
    await $fetch(`/api/campanhas/${id}`, { method: 'DELETE' })
    items.value = items.value.filter(c => c.id !== id)
  }

  return { items, status, error, fetchAll, create, remove }
})
