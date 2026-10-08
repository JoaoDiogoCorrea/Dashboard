import { z } from 'zod'

export const CAMPANHA_TYPES = ['promotional', 'collaborator', 'partner'] as const

export const CAMPANHA_TYPE_LABELS: Record<CampanhaType, string> = {
  promotional: 'Promocional',
  collaborator: 'Colaborador',
  partner: 'Parceiro',
}

/** Remove espaços e coloca em maiúsculas: "black 10" -> "BLACK10" */
export const normalizeCoupon = (value: string) => value.replace(/\s+/g, '').toUpperCase()

export const campanhaSchema = z.object({
  id: z.uuid(),
  type: z.enum(CAMPANHA_TYPES),
  coupon: z.string().transform(normalizeCoupon).pipe(z.string().min(1, 'Cupom é obrigatório')),
  /** Valor em reais (ex.: 10 = R$ 10,00) */
  discountAmount: z.number().positive('Desconto deve ser maior que zero'),
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  deleted: z.boolean(),
})

/** Campos enviados pelo formulário (o restante é gerado pelo servidor) */
export const campanhaInputSchema = campanhaSchema.pick({
  type: true,
  coupon: true,
  discountAmount: true,
  name: true,
})

export type CampanhaType = (typeof CAMPANHA_TYPES)[number]
export type Campanha = z.infer<typeof campanhaSchema>
export type CampanhaInput = z.infer<typeof campanhaInputSchema>
