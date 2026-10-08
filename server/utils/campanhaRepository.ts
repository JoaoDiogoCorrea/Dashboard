import type { Campanha } from '#shared/schemas/campanha'

const KEY = 'campanhas.json'

/** Lê todas as campanhas do JSON local, incluindo as excluídas (soft delete). */
export async function readAllCampanhas(): Promise<Campanha[]> {
  return (await useStorage('db').getItem<Campanha[]>(KEY)) ?? []
}

export async function writeAllCampanhas(campanhas: Campanha[]): Promise<void> {
  await useStorage('db').setItem(KEY, JSON.stringify(campanhas, null, 2))
}

/** Busca uma campanha ativa pelo id; lança 404 se não existir ou estiver excluída. */
export async function findActiveCampanhaOrFail(id: string) {
  const campanhas = await readAllCampanhas()
  const index = campanhas.findIndex(c => c.id === id && !c.deleted)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Campanha não encontrada' })
  }
  return { campanhas, index, campanha: campanhas[index]! }
}
