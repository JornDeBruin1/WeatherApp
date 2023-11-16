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
        {{ console.log("Raw Timestamp:", weatherData.currentTime) }}
        {{
          new Date(weatherData.currentTime).toLocaleDateString("nl-NL", {
            weekday: "short",
            day: "2-digit",
            month: "long",
          })
        }}
        {{ formattedTime(weatherData.currentTime) }}
        {{ console.log(
          "Formatted Time:",
          formattedTime(weatherData.currentTime)
        ) }}
      </p>
      <p
        class="text-8xl mb-8"
        v-if="weatherData && weatherData.hourly && weatherData.hourly.length > 0"
      >
        {{
          Math.round(
            weatherData.hourly[0].temperature 
          ) }}&deg;C
      </p>
      
        {{
          console.log("weatherData:", weatherData)
        }}
        <p
          v-if="
            weatherData &&
            weatherData.hourly &&
            weatherData.hourly.length > 0
          "
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
          {{
            weatherData.current.weather[0].description
          }}
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
        <div class="flex gap-10 overflow-x-hidden">
          <div
            v-for="hourData in weatherData && weatherData.hourly"
            :key="hourData.currentTime"
            class="flex flex-col gap-4 items-center"
          >
            <p v-if="hourData.currentTime" class="whitespace-nowrap text-mb">
              {{
                new Date(hourData.currentTime).toLocaleTimeString("en-us", {
                  hour: "numeric",
                })
              }}
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
          v-for="day in weatherData.daily.slice(0, 7)"
          :key="day.dt"
          class="flex items-center"
        >
          <p class="flex-1">
            {{
              new Date(day.dt * 1000).toLocaleDateString(
                "en-us",
                { weekday: "long" }
              )
            }}
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
      class="flex items-center gap-2 py-12 text-white cursor-pointer
      duration-150 hover:text-red-500"
      @click="removeCity()"
    >
      <i class="fa-solid fa-trash "></i>
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


const getMaxTemperature = (day) => {
  const maxTemperature = day.temperature.temp_max;
  return Math.round(maxTemperature);
};

const getMinTemperature = (day) => {
  const minTemperature = day.temperature.temp_min;
  return Math.round(minTemperature);
};

const route = useRoute();
const weatherData = reactive({
  currentTime: 0,
  hourly: [],
  daily: [],
});

const formattedTime = (currentTime) => {
  const date = new Date(currentTime);
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Amsterdam",
  };

  const formatter = new Intl.DateTimeFormat("nl-NL", options);
  return formatter.format(date);
};

const getWeatherData = async () => {
  try {
     
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${route.query.lat}&lon=${route.query.lng}&appid=${openWeatherKey.apiKeyOpenWeather()}&units=metric`;
    const response = await axios.get(apiUrl);

    if (response.data && response.data.list && response.data.list.length > 0) {
      const currentDate = new Date(response.data.list[0].dt * 1000);
      currentDate.setHours(0, 0, 0, 0);

      weatherData.currentTime = currentDate.getTime();
      weatherData.hourly = response.data.list.map((hour) => {
        const temperatureInKelvin = hour.main.temp;
        const temperatureInCelsius = temperatureInKelvin;
        const currentTime = hour.dt * 1000;

        return {
          temperature: temperatureInCelsius,
          currentTime,
          weather: hour.weather,
        };
      });

      // Extract daily data from the list
      const dailyData = response.data.list.filter((hour) =>
        hour.dt_txt.includes("12:00:00")
      );

       // flicker delay
       await new Promise((res) => setTimeout(res, 1000));

      weatherData.daily = dailyData.map((day) => {
        return {
          dt: day.dt,
          weather: day.weather,
          temperature: day.main,
        };
      });
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
  const updatedCitites = cities.filter(
    (city) => city.id !== route.query.id
  );
  localStorage.setItem(
    "savedCities",
    stringify(updatedCitites)
  );
  router.push({
    name:"home",
  });
}
</script>