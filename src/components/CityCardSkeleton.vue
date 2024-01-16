<!-- Original template with AnimatedPlaceholder components -->
<template>
  <div class="flex rounded-md bg-weather-secondary px-3 py-6 shadow-md">
    <div class="flex flex-1 flex-col gap-2">
      <AnimatedPlaceholder class="max-w-[50%]" />
      <AnimatedPlaceholder class="max-w-[40%]" />
    </div>

    <div class="flex flex-1 flex-col items-end gap-2">
      <AnimatedPlaceholder class="w-full max-w-[50px]" />
      <AnimatedPlaceholder class="w-full max-w-[75px]" />
    </div>
  </div>
</template>

<script setup>
import AnimatedPlaceholder from './AnimatedPlaceholder.vue';
</script>
