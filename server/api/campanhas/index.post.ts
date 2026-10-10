import { campanhaInputSchema, type Campanha } from '#shared/schemas/campanha'

/** POST /api/campanhas — cria uma campanha; o cupom deve ser único (inclusive entre as excluídas) */
export default defineEventHandler(async (event) => {
  const parsed = campanhaInputSchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: parsed.error.issues[0]?.message ?? 'Dados inválidos',
    })
  }

  const campanhas = await readAllCampanhas()
  if (campanhas.some(c => c.coupon === parsed.data.coupon)) {
    throw createError({ statusCode: 409, statusMessage: 'Este cupom já está em uso' })
  }

  const now = new Date().toISOString()
  const campanha: Campanha = { id: crypto.randomUUID(), ...parsed.data, createdAt: now, updatedAt: now, deleted: false }
  await writeAllCampanhas([...campanhas, campanha])

  setResponseStatus(event, 201)
  return campanha
})
