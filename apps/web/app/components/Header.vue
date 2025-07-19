<script setup lang="ts">
import { USeparator } from "#components";
import ModeToggle from "./ModeToggle.vue";
import UserMenu from "./UserMenu.vue";

const links = [
	{ to: "/", label: "Home" },
	{ to: "/dashboard", label: "Dashboard" },
];
</script>

<template>
  <div>
    <div class="flex flex-row items-center justify-between px-2 py-1">
      <nav class="flex gap-4 text-lg">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="text-foreground hover:text-primary"
          active-class="text-primary font-semibold"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
      <div class="flex items-center gap-2">
        <ModeToggle />
        <UserMenu />
      </div>
    </div>
    <USeparator />
  </div>
</template>
