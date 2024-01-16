<template>
  <div class="flex flex-1 flex-col">
    <!-- Overview -->
    <div class="flex flex-col items-center py-12">
      <AnimatedPlaceholder class="mb-2 w-full max-w-[300px]" />
      <AnimatedPlaceholder class="mb-12 w-full max-w-[300px]" />
      <AnimatedPlaceholder class="mb-12 h-[100px] w-full max-w-[300px]" />
      <AnimatedPlaceholder class="mb-8 w-full max-w-[300px]" />
      <AnimatedPlaceholder class="h-[75px] w-full max-w-[300px]" />
    </div>
    <!-- Hourly -->
    <div class="flex flex-col items-center py-12">
      <AnimatedPlaceholder class="mb-12 h-[100px] w-full max-w-screen-md" />
    </div>
    <!-- Weekly -->
    <div class="flex flex-col items-center py-12">
      <AnimatedPlaceholder class="mb-12 h-[100px] w-full max-w-screen-md" />
    </div>
  </div>
</template>
<script setup>
import AnimatedPlaceholder from './AnimatedPlaceholder.vue';
</script>
