<script setup lang="ts">
const { $api } = useNuxtApp();

import { useQuery } from "@tanstack/vue-query";

const healthCheck = useQuery({
	queryKey: ["healthCheck"],
	queryFn: () => $api.healthCheck(),
});
</script>

<template>
  <div class="container mx-auto max-w-3xl px-4 py-2 h-full">
    <div class="grid grid-rows-[1fr_auto] h-full">
      <section class="flex justify-center items-center">
        <CarveLogo class="w-[75svw] max-w-[736px] h-auto" />
      </section>

      <section class="border p-4">
        <h2 class="mb-2 font-medium">API Status</h2>
        <div class="flex items-center gap-2">
            <div class="flex items-center gap-2">
              <div
                class="w-2 h-2 rounded-full"
                :class="{
                  'bg-yellow-500 animate-pulse': healthCheck.status.value === 'pending',
                  'bg-green-500': healthCheck.status.value === 'success',
                  'bg-red-500': healthCheck.status.value === 'error',
                  'bg-gray-400': healthCheck.status.value !== 'pending' &&
                    healthCheck.status.value !== 'success' &&
                    healthCheck.status.value !== 'error'
                }"
              ></div>
              <span class="text-sm text-muted-foreground">
                <template v-if="healthCheck.status.value === 'pending'">
                  Checking...
                </template>
                <template v-else-if="healthCheck.status.value === 'success'">
                  Connected ({{ healthCheck.data.value }})
                </template>
                <template v-else-if="healthCheck.status.value === 'error'">
                  Error: {{ healthCheck.error.value?.message || 'Failed to connect' }}
                </template>
                 <template v-else>
                  Idle
                </template>
              </span>
            </div>
          </div>
      </section>
    </div>
  </div>
</template>
