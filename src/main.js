import { createApp } from 'vue'
// import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import { initGoogleAnalytics } from './services/googleAnalyticsService';


initGoogleAnalytics();

const app = createApp(App)

app.use(router)

app.mount('#app')
