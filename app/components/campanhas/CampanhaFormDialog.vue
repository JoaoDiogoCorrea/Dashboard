<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  CAMPANHA_TYPE_LABELS, CAMPANHA_TYPES, campanhaInputSchema, normalizeCoupon,
} from '#shared/schemas/campanha'

const props = defineProps<{ loading?: boolean, serverError?: string | null }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ submit: [input: ReturnType<typeof campanhaInputSchema.parse>] }>()

const form = reactive({ name: '', coupon: '', type: '', discountAmount: '' })
const errors = ref<Record<string, string>>({})

// Limpa o formulário sempre que o dialog é aberto
watch(open, (value) => {
  if (!value) return
  Object.assign(form, { name: '', coupon: '', type: '', discountAmount: '' })
  errors.value = {}
})

function onSubmit() {
  const result = campanhaInputSchema.safeParse({
    ...form,
    type: form.type || undefined,
    discountAmount: form.discountAmount === '' ? undefined : Number(form.discountAmount),
  })
  if (!result.success) {
    errors.value = {}
    for (const issue of result.error.issues) {
      const key = String(issue.path[0])
      errors.value[key] ??= issue.code === 'invalid_type' || issue.code === 'invalid_value'
        ? 'Campo obrigatório'
        : issue.message
    }
    return
  }
  errors.value = {}
  emit('submit', result.data)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent @interact-outside="props.loading && $event.preventDefault()">
      <DialogHeader>
        <DialogTitle>Nova campanha</DialogTitle>
        <DialogDescription>Informe os dados do cupom de desconto.</DialogDescription>
      </DialogHeader>

      <form class="grid gap-4" novalidate @submit.prevent="onSubmit">
        <div class="grid gap-1.5">
          <label for="campanha-name" class="text-sm font-medium">Nome</label>
          <Input id="campanha-name" v-model="form.name" placeholder="Black Friday 2026" :aria-invalid="!!errors.name" />
          <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="grid gap-1.5">
            <label for="campanha-coupon" class="text-sm font-medium">Cupom</label>
            <Input
              id="campanha-coupon" :model-value="form.coupon" class="font-mono uppercase"
              placeholder="BLACK50" :aria-invalid="!!errors.coupon"
              @update:model-value="form.coupon = normalizeCoupon(String($event))"
            />
            <p v-if="errors.coupon" class="text-sm text-destructive">{{ errors.coupon }}</p>
          </div>

          <div class="grid gap-1.5">
            <label for="campanha-type" class="text-sm font-medium">Tipo</label>
            <Select v-model="form.type">
              <SelectTrigger id="campanha-type" class="w-full" :aria-invalid="!!errors.type">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="t in CAMPANHA_TYPES" :key="t" :value="t">
                  {{ CAMPANHA_TYPE_LABELS[t] }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.type" class="text-sm text-destructive">{{ errors.type }}</p>
          </div>
        </div>

        <div class="grid gap-1.5">
          <label for="campanha-discount" class="text-sm font-medium">Desconto (R$)</label>
          <Input
            id="campanha-discount" v-model="form.discountAmount" type="number" min="0" step="0.01"
            inputmode="decimal" placeholder="10,00" :aria-invalid="!!errors.discountAmount"
          />
          <p v-if="errors.discountAmount" class="text-sm text-destructive">{{ errors.discountAmount }}</p>
        </div>

        <p v-if="serverError" class="text-sm text-destructive" role="alert">{{ serverError }}</p>

        <DialogFooter>
          <Button type="button" variant="outline" :disabled="loading" @click="open = false">Cancelar</Button>
          <Button type="submit" :disabled="loading">{{ loading ? 'Salvando…' : 'Criar campanha' }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
