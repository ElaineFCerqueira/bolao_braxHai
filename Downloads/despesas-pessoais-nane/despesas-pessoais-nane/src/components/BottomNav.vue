<template>
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-primary-dark border-t border-blue-900 z-20 flex">
    <NavItem to="/" icon="🏠" label="Home" />
    <NavItem to="/add" icon="➕" label="Adicionar" />
    <NavItem to="/history" icon="📋" label="Histórico" />
    <NavItem to="/reports" icon="📊" label="Relatórios" />
    <NavItem to="/settings" icon="⚙️" label="Config" />
  </nav>
</template>

<script setup>
import NavItem from './NavItem.vue'
</script>
