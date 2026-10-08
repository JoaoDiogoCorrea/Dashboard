/** GET /api/campanhas/:id — detalhe de uma campanha ativa */
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const { campanha } = await findActiveCampanhaOrFail(id)
  return campanha
})
