<template>
  <header class="sticky top-0 z-10 bg-weather-primary shadow-lg">
    <nav class="container flex flex-col items-center gap-4 py-6 text-white sm:flex-row">
      <div class="flex items-center gap-3">
        <RouterLink :to="{ name: 'home' }">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-sun text-2xl"></i>
            <p class="text-2xl">The Local Weather</p>
          </div>
        </RouterLink>
      </div>

      <div class="flex flex-1 justify-end gap-3">
        <RouterLink :to="{ name: 'home' }">
          <i
            v-if="!isHomeRoute"
            class="fa-solid fa-arrow-left cursor-pointer text-xl duration-150 hover:text-weather-secondary"
            @click="goBack"
          ></i>
        </RouterLink>
        <i
          class="fa-solid fa-circle-info cursor-pointer text-xl duration-150 hover:text-weather-secondary"
          @click="toggleModal"
        ></i>
        <i
          v-if="route.query.preview"
          class="fa-solid fa-plus cursor-pointer text-xl duration-150 hover:text-weather-secondary"
          @click="addCity"
        ></i>
      </div>
      <BaseModal :modalActive="modalActive" @close-modal="toggleModal">
        <div class="text-black">
          <h1 class="mb-1 text-2xl">About:</h1>
          <p class="mb-4">
            The Local Weather allows you to track the current and future weather of cities of your choosing.
          </p>
          <h2 class="text-2xl">How it works:</h2>
          <ol class="mb-4 list-inside list-decimal">
            <li>Search for your city by entering the name into the search bar.</li>
            <li>
              Select a city within the results, this will take you to the current weather for your selection.
            </li>
            <li>
              Track the city by clicking on the "+" icon in the top right. This will save the city to view at
              a later time on the home page.
            </li>
          </ol>

          <h2 class="text-2xl">Removing a city</h2>
          <p>
            If you no longer wish to track a city, simply select the city within the home page. At the bottom
            of the page, there will be an option to delete the city.
          </p>
        </div>
      </BaseModal>
    </nav>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue';
import { uid } from 'uid';
import { RouterLink, useRouter, useRoute } from 'vue-router';
import BaseModal from './BaseModal.vue';

const savedCities = ref([]);
const route = useRoute();
const router = useRouter();

const isHomeRoute = computed(() => router.currentRoute.value.name === 'home');

const addCity = () => {
  // Ensure that required route parameters and query values are present
  if (!route.params.state || !route.params.city || !route.query.lat || !route.query.lng) {
    console.error('Missing required route parameters or query values.');
    return;
  }

  // Log the content before parsing
  console.log('Content to be parsed:', route.fullPath);

  // Retrieve existing cities from localStorage
  const savedCitiesData = localStorage.getItem('savedCities');
  try {
    savedCities.value = savedCitiesData ? JSON.parse(decodeURIComponent(savedCitiesData)) : [];
  } catch (error) {
    console.error('Error parsing JSON:', error);
    console.log('Content that caused the error:', savedCitiesData);
  }

  // Add the new city
  const locationObj = {
    id: uid(),
    state: route.params.state,
    city: route.params.city,
    coords: {
      lat: route.query.lat,
      lng: route.query.lng,
    },
  };

  savedCities.value.push(locationObj);

  // Store the entire array in localStorage
  localStorage.setItem('savedCities', JSON.stringify(savedCities.value));

  let query = { ...route.query };
  delete query.preview;
  query.id = locationObj.id;
  router.replace({ query });
  console.log('Data to be saved:', savedCities.value);
};

const modalActive = ref(null);
const toggleModal = () => {
  modalActive.value = !modalActive.value;
};

const goBack = () => {
  router.push({ name: 'home' });
};
</script>
