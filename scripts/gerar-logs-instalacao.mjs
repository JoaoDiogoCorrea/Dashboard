// Gera massa de dados: logs do fluxo de análise de instalações.
// Fluxos: under_analysis -> [reproved -> under_analysis]* -> approved (ou abandono após reprovação)
// Uso: node scripts/gerar-logs-instalacao.mjs [quantidade] [seed]
import { randomUUID } from 'node:crypto'
import { writeFileSync } from 'node:fs'

const TOTAL = Number(process.argv[2] ?? 200)
let seed = Number(process.argv[3] ?? 42)

/** PRNG determinístico (mulberry32): mesma seed gera a mesma massa */
function rand() {
  seed = (seed + 0x6D2B79F5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const uuid = () => randomUUID()

/** Colaboradores que analisam; `speed` multiplica o tempo de resposta (menor = mais rápido) */
const EMPLOYEES = [
  { name: 'Ana Souza', speed: 0.7 },
  { name: 'Bruno Lima', speed: 1.0 },
  { name: 'Carla Mendes', speed: 0.9 },
  { name: 'Diego Alves', speed: 1.4 },
  { name: 'Elisa Rocha', speed: 1.1 },
]

/** Motivos de reprovação: peso na amostra e `fix` = multiplicador do tempo do cliente para corrigir */
const REPROVAL_REASONS = [
  { code: 'missing_documents', weight: 35, fix: 1.6 },
  { code: 'illegible_documents', weight: 20, fix: 0.8 },
  { code: 'holder_data_mismatch', weight: 18, fix: 1.0 },
  { code: 'unpaid_invoice', weight: 12, fix: 1.3 },
  { code: 'address_not_covered', weight: 8, fix: 0.6 },
  { code: 'incomplete_registration', weight: 7, fix: 0.7 },
]

function pick(list, weightOf = () => 1) {
  let r = rand() * list.reduce((sum, item) => sum + weightOf(item), 0)
  for (const item of list) { r -= weightOf(item); if (r <= 0) return item }
  return list.at(-1)
}

/** Distribuição log-normal: mediana `median` (horas); `sigma` controla a cauda longa */
function logNormalHours(median, sigma) {
  const u1 = Math.max(rand(), 1e-9), u2 = rand()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return median * Math.exp(sigma * z)
}

const HOUR = 3600_000
// Expediente do colaborador: seg–sex, 08h–18h (BRT = UTC-3 → 11h–21h UTC)
const OPEN_UTC = 11, CLOSE_UTC = 21

function toBusinessHours(date) {
  const d = new Date(date)
  const reopen = () => d.setUTCHours(OPEN_UTC, Math.floor(rand() * 90), Math.floor(rand() * 60), Math.floor(rand() * 1000))
  for (;;) {
    const day = d.getUTCDay()
    if (day === 0 || day === 6) { d.setUTCDate(d.getUTCDate() + (day === 0 ? 1 : 2)); reopen(); continue }
    if (d.getUTCHours() >= CLOSE_UTC) { d.setUTCDate(d.getUTCDate() + 1); reopen(); continue }
    if (d.getUTCHours() < OPEN_UTC) { reopen(); continue }
    return d
  }
}

const START = Date.UTC(2026, 0, 5)
const END = Date.UTC(2026, 8, 15) // folga até hoje para o fluxo terminar

/** Variações do fluxo. `reprovals` = quantas vezes o colaborador reprova; `abandons` = cliente não reenvia após a última reprovação */
const FLOWS = [
  { name: 'approved_first_try', weight: 38, reprovals: 0, abandons: false },
  { name: 'reproved_once', weight: 34, reprovals: 1, abandons: false },
  { name: 'reproved_twice', weight: 14, reprovals: 2, abandons: false },
  { name: 'abandoned_after_reproval', weight: 14, reprovals: 1, abandons: true },
]
/** Chance de a reanálise cair com outro colaborador */
const HANDOFF_CHANCE = 0.25

const logs = []
for (let i = 0; i < TOTAL; i++) {
  const parent_id = uuid()
  const flow = pick(FLOWS, f => f.weight)
  let t = new Date(START + rand() * (END - START)) // cliente pede análise a qualquer hora
  const push = (status, actor, reason) => logs.push({
    id: uuid(), status, type: 'register', parent_id, actor, reason, createdAt: t.toISOString(),
  })
  const after = (hours) => new Date(t.getTime() + hours * HOUR)

  let employee = pick(EMPLOYEES)
  const usedReasons = []
  push('under_analysis', 'customer', 'initial_request')

  for (let n = 0; n < flow.reprovals; n++) {
    // colaborador reprova: mediana ~6h úteis, cauda longa
    t = toBusinessHours(after(logNormalHours(6 * employee.speed, 0.9)))
    const reproval = pick(REPROVAL_REASONS.filter(r => !usedReasons.includes(r.code)), r => r.weight)
    usedReasons.push(reproval.code)
    push('reproved', employee.name, reproval.code)

    if (flow.abandons && n === flow.reprovals - 1) break // cliente nunca volta

    // cliente corrige e pede nova análise: mediana ~2 dias (varia com o motivo)
    t = after(logNormalHours(48 * reproval.fix, 1.0))
    push('under_analysis', 'customer', 'resubmission')
    if (rand() < HANDOFF_CHANCE) employee = pick(EMPLOYEES)
  }

  if (!flow.abandons) {
    // colaborador aprova: mediana ~3h úteis (mais rápido quando já houve reprovação)
    t = toBusinessHours(after(logNormalHours((flow.reprovals ? 3 : 5) * employee.speed, 0.8)))
    push('approved', employee.name, null)
  }
}

logs.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
writeFileSync(new URL('../data/instalacoes-logs.json', import.meta.url), JSON.stringify(logs, null, 2) + '\n')
console.log(`${TOTAL} instalações, ${logs.length} logs -> data/instalacoes-logs.json`)
