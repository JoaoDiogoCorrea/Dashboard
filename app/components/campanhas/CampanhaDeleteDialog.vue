<script setup lang="ts">
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import type { Campanha } from '#shared/schemas/campanha'

const props = defineProps<{ campanha: Campanha | null, loading?: boolean }>()
const emit = defineEmits<{ confirm: [], close: [] }>()

const open = computed({
  get: () => props.campanha !== null,
  set: (value) => { if (!value) emit('close') },
})
</script>

<template>
  <AlertDialog v-model:open="open">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir campanha?</AlertDialogTitle>
        <AlertDialogDescription>
          A campanha <strong>{{ campanha?.name }}</strong> será removida da listagem.
          O cupom <strong class="font-mono">{{ campanha?.coupon }}</strong> não poderá ser reutilizado.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="loading">Cancelar</AlertDialogCancel>
        <Button variant="destructive" :disabled="loading" @click="emit('confirm')">
          {{ loading ? 'Excluindo…' : 'Excluir' }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
