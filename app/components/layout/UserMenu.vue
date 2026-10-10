<script setup lang="ts">
import { ChevronDown, LogOut, Settings, User } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Ainda não há autenticação: dados fixos de exemplo
const user = { name: 'João Correa', email: 'joao.correa@methaenergia.com.br' }
const initials = user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="h-10 gap-2 px-2" aria-label="Menu do perfil">
        <span class="hidden text-right leading-tight sm:block">
          <span class="block text-sm font-medium">{{ user.name }}</span>
          <span class="block text-xs text-muted-foreground">{{ user.email }}</span>
        </span>
        <span class="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
          {{ initials }}
        </span>
        <ChevronDown class="size-4 text-muted-foreground" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <DropdownMenuLabel class="font-normal sm:hidden">
        <span class="block text-sm font-medium">{{ user.name }}</span>
        <span class="block text-xs text-muted-foreground">{{ user.email }}</span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator class="sm:hidden" />
      <!-- Itens ainda não implementados -->
      <DropdownMenuItem disabled><User class="size-4" /> Meu perfil</DropdownMenuItem>
      <DropdownMenuItem disabled><Settings class="size-4" /> Configurações</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem variant="destructive" disabled><LogOut class="size-4" /> Sair</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
