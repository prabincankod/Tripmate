// src/components/weather/WeatherCard.jsx
import React, { useEffect, useState } from "react";
import { Cloud, Sun, CloudRain, Snowflake } from "lucide-react";

const WeatherCard = ({ lat, lon }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lat || !lon) return;

    const fetchWeather = async () => {
      setLoading(true);
      try {
        const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        const data = await res.json();

        if (data?.main && data?.weather) {
          setWeather({
            temp: data.main.temp,
            description: getFriendlyDescription(data.weather[0].main),
            main: data.weather[0].main,
          });
        } else {
          setWeather(null);
        }
      } catch (err) {
        console.error("Weather fetch error:", err);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  // Map OpenWeather terms to simple words
  const getFriendlyDescription = (desc) => {
    const map = {
      mist: "Hazy",
      fog: "Light Fog",
      clouds: "Cloudy",
      drizzle: "Light Rain",
      rain: "Rainy",
      snow: "Snowy",
      clear: "Sunny",
    };
    return map[desc.toLowerCase()] || desc;
  };

  if (loading)
    return (
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-4 rounded-xl shadow-lg flex items-center gap-3 mt-2 text-white animate-pulse">
        Loading weather...
      </div>
    );

  if (!weather)
    return (
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-4 rounded-xl shadow-lg flex items-center gap-3 mt-2 text-white">
        Weather not available
      </div>
    );

  const WeatherIcon = () => {
    switch (weather.main.toLowerCase()) {
      case "clouds":
        return <Cloud className="text-white w-8 h-8" />;
      case "rain":
      case "drizzle":
        return <CloudRain className="text-white w-8 h-8" />;
      case "snow":
        return <Snowflake className="text-white w-8 h-8" />;
      default:
        return <Sun className="text-yellow-300 w-8 h-8" />;
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-400 to-blue-600 p-4 rounded-xl shadow-lg flex items-center gap-3 mt-2 text-white hover:scale-105 transition-transform duration-300">
      <WeatherIcon />
      <div>
        <span className="font-bold text-lg">{weather.temp.toFixed(1)}°C</span>
        <p className="capitalize text-sm">{weather.description}</p>
      </div>
    </div>
  );
};

export default WeatherCard;
