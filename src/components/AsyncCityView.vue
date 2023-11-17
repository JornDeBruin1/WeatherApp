
<template>
  <div class="flex flex-col flex-1 items-center">
    <!-- Banner -->
    <div
      v-if="route.query.preview"
      class="text-white p-4 bg-weather-secondary w-full text-center"
    >
      <p>
        You are currently previewing this city, click the "+" icon to start
        tracking this city.
      </p>
    </div>
    <div class="flex flex-col items-center text-white py-12">
      <h1 class="text-4xl mb-2">{{ route.params.city }}</h1>
      <p class="text-sm mb-12" v-if="weatherData">
        {{ formattedTime(weatherData.currentTime) }}
      </p>
      <p
        class="text-8xl mb-8"
        v-if="weatherData && weatherData.hourly && weatherData.hourly.length > 0"
      >
        {{ Math.round(weatherData.hourly[0].temperature) }}&deg;C
      </p>
      <p
        v-if="weatherData && weatherData.hourly && weatherData.hourly.length > 0"
      >
        Feels like {{
          weatherData.hourly[0].feels_like !== undefined
            ? `${Math.round(weatherData.hourly[0].feels_like)} &deg;C`
            : "Temperature data not available"
        }}
      </p>
      <p
        class="capitalize"
        v-if="
          weatherData &&
          weatherData.current &&
          weatherData.current.weather &&
          weatherData.current.weather[0]
        "
      >
        {{ weatherData.current.weather[0].description }}
      </p>
      <img
        class="w-auto h-[50px] object-cover"
        :src="getWeatherIcon(weatherData.current && weatherData.current.weather && weatherData.current.weather[0].icon)"
        alt=""
      />
    </div>

    <!-- Hourly weather -->
    <hr class="border-white border-opacity-10 border w-full" />
    <div class="max-w-screen-md w-full py-12">
      <div class="mx-8 text-white">
        <h2 class="mb-4">Hourly weather</h2>
        <div class="flex gap-10 overflow-x-scroll scrollbar-thin scrollbar-thumb-weather-tertiary scrollbar-track-weather-secondary ">
          <div
            v-for="hourData in weatherData && weatherData.hourly"
            :key="hourData.currentTime"
            class="flex flex-col gap-4 items-center"
          >
            <p v-if="hourData.currentTime" class="whitespace-nowrap text-mb">
              {{ new Date(hourData.currentTime).toLocaleTimeString("en-us", { hour: "numeric" }) }}
            </p>
            <img
              v-if="hourData.weather && hourData.weather[0] && hourData.weather[0].icon"
              class="w-auto h-[50px] object-cover"
              :src="getWeatherIcon(hourData.weather[0].icon)"
              alt=""
            />
            <p class="text-xl">
              {{ Math.round(hourData.temperature) }}&deg;
            </p>
          </div>
        </div>
      </div>
    </div>
    <hr class="border-white border-opacity-10 border w-full" />
    <!-- Weekly Weather -->

    <div class="max-w-screen-md w-full py-12">
      <div class="mx-8 text-white">
        <h2 class="mb-4">5 Days forecast</h2>
        <div
          v-for="day in weatherData.daily"
          :key="day.dt"
          class="flex items-center"
        >
          <p class="flex-1">
            {{ new Date(day.dt * 1000).toLocaleDateString("en-us", { weekday: "long" }) }}
          </p>
          <img
            class="w-[50px] h-[50px] object-cover"
            :src="getWeatherIcon(day.weather[0].icon)"
            alt=""
          />
          <div class="flex gap-2 flex-1 justify-end">
            <div class="flex gap-2 flex-1 justify-end">
              <p>Max: {{ getMaxTemperature(day) }}&deg;C</p>
              <p>Min: {{ getMinTemperature(day) }}&deg;C</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div 
      class="flex items-center gap-2 py-12 text-white cursor-pointer duration-150 hover:text-red-500"
      @click="removeCity()"
    >
      <i class="fa-solid fa-trash"></i>
      <p>Remove City</p>
    </div>
  </div>
</template>
<script setup>
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import { reactive, onMounted } from "vue";
import { stringify } from "qs";
import openWeatherKey from '../assets/apiKey'
import { DateTime } from "luxon";

const getMaxTemperature = (day) => {
  return Math.round(day.temp_max);
};

const getMinTemperature = (day) => {
  return Math.round(day.temp_min);
};

const route = useRoute();
const weatherData = reactive({
  currentTime: 0,
  hourly: [],
  daily: [],
});

const formattedTime = (currentTime) => {
  try {
    // Ensure that currentTime is a valid number
    const currentTimeMillis = typeof currentTime === 'number' ? currentTime : parseInt(currentTime, 10);

    if (isNaN(currentTimeMillis) || !isFinite(currentTimeMillis)) {
      throw new Error('Invalid timestamp format');
    }

    const date = DateTime.fromMillis(currentTimeMillis, { zone: "Europe/Amsterdam" });
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    const formattedDate = date.toLocaleString(options);
    return formattedDate;
  } catch (error) {
    console.error("Error in formattedTime:", error);
    // console.log("Current time:", currentTime);
    return "Invalid time";
  }
};

const getWeatherData = async () => {
  try {
    
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${route.query.lat}&lon=${route.query.lng}&appid=${openWeatherKey.apiKeyOpenWeather()}&units=metric`;
    const response = await axios.get(apiUrl);
    // console.log("API Response:", response.data);

if (response.data && response.data.list && response.data.list.length > 0) {
  const currentTimeLocal = DateTime.now().setZone("Europe/Amsterdam").toMillis();
  weatherData.currentTime = currentTimeLocal;

  const firstHour = response.data.list[0];

  if (!firstHour.dt || typeof firstHour.dt !== 'number') {
    console.error("Invalid timestamp format in API response:", firstHour.dt);
    return;
  }

  weatherData.currentTime = currentTimeLocal;

  weatherData.hourly = response.data.list.map((hour) => {
    const temperatureInCelsius = hour.main.temp;

    if (!hour.dt || typeof hour.dt !== 'number') {
      console.error("Invalid timestamp format in API response:", hour.dt);
      return null;
    }

    const currentTimeUTC = hour.dt * 1000;

    try {
      const currentTimeLocal = DateTime.fromMillis(currentTimeUTC).setZone("Europe/Amsterdam").toMillis();
      return {
        temperature: temperatureInCelsius,
        feels_like: hour.main.feels_like || 0, 
        currentTime: currentTimeLocal,
        weather: hour.weather,
      };
    } catch (error) {
      console.error("Error processing weather data:", error);
      return null;
    }
  });
  

  // console.log("Hourly Data:", weatherData.hourly);

  weatherData.daily = response.data.list.reduce((dailyData, item) => {
  const itemDate = new Date(item.dt * 1000).toLocaleDateString("en-us", { weekday: "long" });

  if (!dailyData[itemDate]) {
    dailyData[itemDate] = [];
  }

  dailyData[itemDate].push(item);

  return dailyData;
}, {});

weatherData.daily = Object.keys(weatherData.daily).map((day) => {
      const dayItems = weatherData.daily[day];

      if (dayItems.length > 0) {
        const totalTemperature = dayItems.reduce((sum, item) => sum + item.main.temp, 0);
        const totalFeelsLike = dayItems.reduce((sum, item) => sum + (item.main.feels_like || 0), 0);

        const averageTemperature = totalTemperature / dayItems.length;
        const averageFeelsLike = totalFeelsLike / dayItems.length;

        const maxTemperature = Math.max(...dayItems.map(item => item.main.temp));
        const minTemperature = Math.min(...dayItems.map(item => item.main.temp));

        return {
          dt: dayItems[0].dt,
          weather: dayItems[0].weather,
          temperature: averageTemperature,
          temp_min: minTemperature,
          temp_max: maxTemperature,
          feels_like: averageFeelsLike,
        };
      } else {
        console.warn(`No data available for the date: ${day}`);
        return {
          dt: 0,
          // weather: [{ icon: '01d' }], // Default data for missing day
          temperature: 0,
          temp_min: 0,
          temp_max: 0,
          feels_like: 0,
        };
      }
    });

  // console.log("Daily Data:", weatherData.daily);

} else {
  console.error("Invalid data structure:", response.data);
}
} catch (error) {
console.error("Error fetching weather data:", error);
}
};


const getWeatherIcon = (icon) => {
  const url = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : '';
  return url;
};

onMounted(() => {
  if (!route.query) {
    console.error("Route or query not available");
    return;
  }

  getWeatherData();

  // Refresh data every minute
  setInterval(() => {
    getWeatherData();
  }, 60 * 1000);
});

const router = useRouter();
const removeCity = () => {
  const cities = JSON.parse(localStorage.getItem('savedCities'));
  const updatedCities = cities.filter(
    (city) => city.id !== route.query.id
  );
  localStorage.setItem(
    "savedCities",
    JSON.stringify(updatedCities)
  );
  router.push({
    name: "home",
  });
};
</script>