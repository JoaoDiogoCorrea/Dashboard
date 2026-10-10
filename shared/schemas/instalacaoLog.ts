import { z } from 'zod'

export const INSTALACAO_STATUS = [
  'active', 'approved', 'pending_agreement', 'under_analysis', 'reproved', 'inactive',
  'contract_signed', 'awaiting_first_invoice', 'under_cancellation', 'suspended', 'canceled', 'pending_invoice',
] as const

export const REPROVAL_REASONS = [
  'missing_documents', 'illegible_documents', 'holder_data_mismatch',
  'unpaid_invoice', 'address_not_covered', 'incomplete_registration',
] as const

export const REPROVAL_REASON_LABELS: Record<string, string> = {
  missing_documents: 'Documentos ausentes',
  illegible_documents: 'Documentos ilegíveis',
  holder_data_mismatch: 'Dados do titular divergentes',
  unpaid_invoice: 'Fatura em aberto',
  address_not_covered: 'Endereço sem cobertura',
  incomplete_registration: 'Cadastro incompleto',
}

/** Cada mudança de status de uma instalação gera um log */
export const instalacaoLogSchema = z.object({
  id: z.uuid(),
  status: z.enum(INSTALACAO_STATUS),
  type: z.literal('register'),
  /** id da instalação */
  parent_id: z.uuid(),
  /** "customer" (cliente) ou o nome do colaborador que executou a ação */
  actor: z.string(),
  /** Motivo: pedido inicial/reenvio (under_analysis), motivo da reprovação (reproved) ou null */
  reason: z.string().nullable(),
  createdAt: z.iso.datetime(),
})

export type InstalacaoLog = z.infer<typeof instalacaoLogSchema>
