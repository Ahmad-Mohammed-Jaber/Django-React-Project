import axios from "axios";

const DEFAULT_WEATHER_API_URL = "https://api.openweathermap.org/data/2.5";

const weatherApi = axios.create({
  baseURL: import.meta.env.VITE_WEATHER_API_URL || DEFAULT_WEATHER_API_URL,
  params: {
    appid: import.meta.env.VITE_WEATHER_API_KEY, // keep key in env
    units: "metric",
  },
});

export default weatherApi;
