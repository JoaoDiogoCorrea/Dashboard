<script setup lang="ts">
import { MoreHorizontal, Pencil, Trash2 } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Campanha } from '#shared/schemas/campanha'

defineProps<{ campanha: Campanha }>()
const emit = defineEmits<{ delete: [campanha: Campanha] }>()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="size-8" aria-label="Ações">
        <MoreHorizontal class="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <!-- Edição ainda não implementada -->
      <DropdownMenuItem disabled>
        <Pencil class="size-4" /> Editar
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" @select="emit('delete', campanha)">
        <Trash2 class="size-4" /> Excluir
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
