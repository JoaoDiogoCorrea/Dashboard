import type { Column, ColumnDef } from '@tanstack/vue-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from '@lucide/vue'
import { h } from 'vue'
import { Button } from '@/components/ui/button'
import type { Campanha } from '#shared/schemas/campanha'
import CampanhaTypeBadge from './CampanhaTypeBadge.vue'
import CampanhaRowActions from './CampanhaRowActions.vue'

/** Cabeçalho clicável que alterna a ordenação da coluna */
function sortableHeader(column: Column<Campanha>, label: string, align: 'left' | 'right' = 'left') {
  const sorted = column.getIsSorted()
  const Icon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown
  return h(Button, {
    variant: 'ghost',
    size: 'sm',
    class: align === 'right' ? '-mr-3 ml-auto flex' : '-ml-3',
    onClick: () => column.toggleSorting(sorted === 'asc'),
  }, () => [label, h(Icon, { class: 'size-3.5 opacity-60' })])
}

export function createColumns(onDelete: (campanha: Campanha) => void): ColumnDef<Campanha>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => sortableHeader(column, 'Nome'),
      cell: ({ row }) => h('span', { class: 'font-medium' }, row.original.name),
    },
    {
      accessorKey: 'coupon',
      header: ({ column }) => sortableHeader(column, 'Cupom'),
      cell: ({ row }) => h('code', {
        class: 'rounded bg-muted px-1.5 py-0.5 font-mono text-xs font-semibold',
      }, row.original.coupon),
    },
    {
      accessorKey: 'type',
      header: ({ column }) => sortableHeader(column, 'Tipo'),
      cell: ({ row }) => h(CampanhaTypeBadge, { type: row.original.type }),
      filterFn: 'equalsString',
    },
    {
      accessorKey: 'discountAmount',
      header: ({ column }) => sortableHeader(column, 'Desconto', 'right'),
      cell: ({ row }) => h('div', { class: 'text-right tabular-nums' }, formatCurrency(row.original.discountAmount)),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => sortableHeader(column, 'Criada em'),
      cell: ({ row }) => h('span', { class: 'text-muted-foreground tabular-nums' }, formatDateTime(row.original.createdAt)),
    },
    {
      id: 'actions',
      enableSorting: false,
      header: () => h('span', { class: 'sr-only' }, 'Ações'),
      cell: ({ row }) => h('div', { class: 'text-right' }, h(CampanhaRowActions, {
        campanha: row.original,
        onDelete,
      })),
    },
  ]
}
