/** DELETE /api/campanhas/:id — soft delete: marca deleted = true e mantém o registro */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const { campanhas, index, campanha } = await findActiveCampanhaOrFail(id)

  campanhas[index] = { ...campanha, deleted: true, updatedAt: new Date().toISOString() }
  await writeAllCampanhas(campanhas)

  setResponseStatus(event, 204)
  return null
})
