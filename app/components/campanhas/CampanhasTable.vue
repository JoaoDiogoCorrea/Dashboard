<script setup lang="ts">
import type { ColumnFiltersState, PaginationState, SortingState } from '@tanstack/vue-table'
import {
  FlexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useVueTable,
} from '@tanstack/vue-table'
import { ChevronLeft, ChevronRight, Search } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { valueUpdater } from '@/lib/utils'
import { CAMPANHA_TYPE_LABELS, CAMPANHA_TYPES, type Campanha } from '#shared/schemas/campanha'
import { createColumns } from './columns'

const props = defineProps<{ data: Campanha[] }>()
const emit = defineEmits<{ delete: [campanha: Campanha] }>()

const PAGE_SIZES = [10, 20, 50]
const ALL = 'all'

const sorting = ref<SortingState>([{ id: 'createdAt', desc: true }])
const columnFilters = ref<ColumnFiltersState>([])
const globalFilter = ref('')
const pagination = ref<PaginationState>({ pageIndex: 0, pageSize: 10 })

const columns = createColumns(c => emit('delete', c))

const table = useVueTable({
  get data() { return props.data },
  columns,
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get globalFilter() { return globalFilter.value },
    get pagination() { return pagination.value },
  },
  onSortingChange: u => valueUpdater(u, sorting),
  onColumnFiltersChange: u => valueUpdater(u, columnFilters),
  onGlobalFilterChange: u => valueUpdater(u, globalFilter),
  onPaginationChange: u => valueUpdater(u, pagination),
  // Busca por nome ou cupom, sem diferenciar maiúsculas/minúsculas
  globalFilterFn: (row, _columnId, value: string) => {
    const term = value.trim().toLowerCase()
    if (!term) return true
    const { name, coupon } = row.original
    return name.toLowerCase().includes(term) || coupon.toLowerCase().includes(term.replace(/\s+/g, ''))
  },
  autoResetPageIndex: true,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})

const typeFilter = computed({
  get: () => (table.getColumn('type')?.getFilterValue() as string | undefined) ?? ALL,
  set: (value: string) => table.getColumn('type')?.setFilterValue(value === ALL ? undefined : value),
})

const pageSize = computed({
  get: () => String(pagination.value.pageSize),
  set: (value: string) => table.setPageSize(Number(value)),
})

const filteredCount = computed(() => table.getFilteredRowModel().rows.length)
const pageCount = computed(() => Math.max(table.getPageCount(), 1))
</script>

<template>
  <div class="space-y-4">
    <!-- Busca e filtro -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div class="relative w-full sm:max-w-xs">
        <Search class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="globalFilter" placeholder="Buscar por nome ou cupom" class="pl-8" />
      </div>
      <Select v-model="typeFilter">
        <SelectTrigger class="w-full sm:w-44">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="ALL">Todos os tipos</SelectItem>
          <SelectItem v-for="t in CAMPANHA_TYPES" :key="t" :value="t">
            {{ CAMPANHA_TYPE_LABELS[t] }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Tabela -->
    <div class="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader class="bg-muted/50">
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows.length">
            <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
              <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <TableRow v-else>
            <TableCell :colspan="columns.length" class="h-32 text-center text-muted-foreground">
              Nenhuma campanha encontrada
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Rodapé: total e paginação -->
    <div class="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p class="text-muted-foreground">
        {{ filteredCount }} {{ filteredCount === 1 ? 'campanha' : 'campanhas' }}
      </p>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="text-muted-foreground">Por página</span>
          <Select v-model="pageSize">
            <SelectTrigger size="sm" class="w-18">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="size in PAGE_SIZES" :key="size" :value="String(size)">
                {{ size }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <span class="tabular-nums">
          Página {{ pagination.pageIndex + 1 }} de {{ pageCount }}
        </span>
        <div class="flex gap-1">
          <Button
            variant="outline" size="icon" class="size-8" aria-label="Página anterior"
            :disabled="!table.getCanPreviousPage()" @click="table.previousPage()"
          >
            <ChevronLeft class="size-4" />
          </Button>
          <Button
            variant="outline" size="icon" class="size-8" aria-label="Próxima página"
            :disabled="!table.getCanNextPage()" @click="table.nextPage()"
          >
            <ChevronRight class="size-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
