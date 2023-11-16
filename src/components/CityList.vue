<template>
    <div v-for="city in citiesArray" :key="city.id">
      <CityCard :city="city" @click="goToCityView(city)" />
    </div>
  
    <p v-if="citiesArray.length === 0">
      No locations added. To start tracking a location, search in the field above.
    </p>
  </template>
  
  <script setup>
  import axios from 'axios';
  import { ref, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import CityCard from './CityCard.vue';
  
  const savedCities = ref([]);
  const router = useRouter();
  
  const getCities = async () => {
    try {
      const storedCities = localStorage.getItem('savedCities');
      console.log('Content to be parsed:', storedCities);
  
      if (storedCities) {
        const citiesArray = JSON.parse(storedCities);
        console.log('Parsed citiesArray:', citiesArray);
  
        savedCities.value = citiesArray;
  
        const request = [];
        savedCities.value.forEach((city) => {
          if (city && city.coords && city.coords.lat && city.coords.lng) {
            request.push(
              axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${city.coords.lat}&lon=${city.coords.lng}&appid=12682e99547b67e008b080163c026ae8&units=metric`
              )
            );
          }
        });
  
        const weatherData = await Promise.all(request);
  
        await new Promise((res) => setTimeout(res, 1000));
  
        weatherData.forEach((value, index) => {
          savedCities.value[index].weather = value.data;
        });
  
        console.log('Cities with weather data:', savedCities.value);
      } else {
        console.error('No saved cities found.');
      }
    } catch (error) {
      console.error('Error parsing storedCities:', error);
    }
  };
  
  onMounted(() => {
    getCities();
  });
  
  const citiesArray = computed(() => {
    return Object.values(savedCities.value);
  });
  
  const goToCityView = (city) => {
    router.push({
      name: 'cityView',
      params: { state: city.state, city: city.city },
      query: {
        id: city.id,
        lat: city.coords.lat,
        lng: city.coords.lng,
      },
    });
  };
  
 
  </script>