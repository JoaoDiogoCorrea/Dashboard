import type { InstalacaoLog } from '#shared/schemas/instalacaoLog'

const KEY = 'instalacoes-logs.json'

export async function readAllInstalacaoLogs(): Promise<InstalacaoLog[]> {
  return (await useStorage('db').getItem<InstalacaoLog[]>(KEY)) ?? []
}
