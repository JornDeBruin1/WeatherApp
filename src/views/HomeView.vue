<template>
  <main class="container text-white">
    <div class="pt-4 mb-8 relative">
      <input 
        type="text" 
        v-model="searchQuery"
        @input="getSearchResults"
        placeholder="Search for a city or state"
        class="py-2 px-1 w-full bg-transparent border-b
        focus:border-weather-secondary focus:outline-none
        focus:shadow-[0px_1px_0_0_#004E71]"
      />
      <ul 
        v-if="mapboxSearchResults"
        class="absolute bg-weather-secondary text-white 
        w-full shadow-md py-2 px-1 top-[66px]"
      >
        <p v-if="searchError">
          Sorry, something went wrong, please try again.
        </p>
        <p v-if="!serverError && mapboxSearchResults.length === 0">
          No results match your query, try a different term.
        </p>
        <template v-else>
          <li 
            v-for="searchResult in mapboxSearchResults"
            :key="searchResult.id"
            class="py-2 cursor-pointer" 
          >
            {{ searchResult.place_name }}
          </li>
        </template>
      </ul>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios'

const mapBoxAPIKey = "pk.eyJ1Ijoiam9ybmRlYnJ1aW4iLCJhIjoiY2xvc2hjcTdkMDBoNzJqcTA4N245eW5neSJ9.3LX7ZM3tTNpulvjiJoGajg"
const searchQuery = ref("");
const queryTimeout = ref(null);
const mapboxSearchResults = ref(null);
const searchError = ref(null)

const getSearchResults = () => {
  clearTimeout(queryTimeout.value)
queryTimeout.value = setTimeout(async () => {
  if(searchQuery.value !== ""){
    try{
      const result = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery.value}.json?access_token=${mapBoxAPIKey}&types=place`
    );
    mapboxSearchResults.value = result.data.features;
    }
    catch(e){
      searchError.value = true
    }
    return;
  }
  mapboxSearchResults.value = null;
}, 300)
}
</script>