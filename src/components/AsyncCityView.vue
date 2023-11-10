<template>
    <div>

    </div>
</template>

<script setup>
import axios from 'axios';
import { useRoute } from 'vue-router';

const route = useRoute();

const getWeatherData = async () => {
    try{
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${route.query.lat}&lon=${route.query.lng}&appid=12682e99547b67e008b080163c026ae8`;
        console.log(apiUrl);
        const weatherData = await axios.get(apiUrl);
        // cal current date & time
        const localOffset = new Date().getTimezoneOffset() * 60000;
        const utc = weatherData.data.current.dt * 1000 + localOffset;
        weatherData.data.currentTime = 
            utc + 1000 * weatherData.data.timezone_offset;
        
        // cal hourly weather offset
        weatherData.data.hourly.forEach((hour) => {
            const utc = hour.dt * 1000 + localOffset;
            hour.currentTime =
                utc + 1000 * weatherData.data.timezone_offset;
        });

        return weatherData;
    } catch (error) {
        console.log(error)
}
};
const weatherData = await getWeatherData();
</script>

