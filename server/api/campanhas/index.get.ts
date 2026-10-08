/** GET /api/campanhas — lista somente campanhas ativas, mais recentes primeiro */
export default defineEventHandler(async () => {
  const campanhas = await readAllCampanhas()
  return campanhas
    .filter(c => !c.deleted)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})
