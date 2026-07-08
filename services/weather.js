// Weather via Open-Meteo (https://open-meteo.com). No API key required.

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

// Default to Bengaluru if no location is available yet.
export const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 };

// WMO weather interpretation codes -> label + emoji.
const WMO = {
  0: { label: "Clear sky", emoji: "☀️" },
  1: { label: "Mainly clear", emoji: "🌤️" },
  2: { label: "Partly cloudy", emoji: "⛅" },
  3: { label: "Overcast", emoji: "☁️" },
  45: { label: "Fog", emoji: "🌫️" },
  48: { label: "Rime fog", emoji: "🌫️" },
  51: { label: "Light drizzle", emoji: "🌦️" },
  53: { label: "Drizzle", emoji: "🌦️" },
  55: { label: "Dense drizzle", emoji: "🌧️" },
  56: { label: "Freezing drizzle", emoji: "🌧️" },
  57: { label: "Freezing drizzle", emoji: "🌧️" },
  61: { label: "Light rain", emoji: "🌦️" },
  63: { label: "Rain", emoji: "🌧️" },
  65: { label: "Heavy rain", emoji: "🌧️" },
  66: { label: "Freezing rain", emoji: "🌧️" },
  67: { label: "Freezing rain", emoji: "🌧️" },
  71: { label: "Light snow", emoji: "🌨️" },
  73: { label: "Snow", emoji: "🌨️" },
  75: { label: "Heavy snow", emoji: "❄️" },
  77: { label: "Snow grains", emoji: "🌨️" },
  80: { label: "Rain showers", emoji: "🌦️" },
  81: { label: "Rain showers", emoji: "🌧️" },
  82: { label: "Violent rain showers", emoji: "⛈️" },
  85: { label: "Snow showers", emoji: "🌨️" },
  86: { label: "Snow showers", emoji: "❄️" },
  95: { label: "Thunderstorm", emoji: "⛈️" },
  96: { label: "Thunderstorm with hail", emoji: "⛈️" },
  99: { label: "Thunderstorm with hail", emoji: "⛈️" },
};

export function describeWeatherCode(code) {
  return WMO[code] || { label: "Unknown", emoji: "🌡️" };
}

export async function getWeather(lat, lng) {
  if (lat == null || lng == null) return null;
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: "temperature_2m,weather_code",
    timezone: "auto",
  });
  const res = await fetch(`${OPEN_METEO_URL}?${params}`);
  if (!res.ok) throw new Error("Weather request failed");
  const data = await res.json();
  const current = data.current || {};
  const code = current.weather_code;
  const info = describeWeatherCode(code);
  return {
    temperature: Math.round(Number(current.temperature_2m)),
    weatherCode: code,
    label: info.label,
    emoji: info.emoji,
    time: current.time,
  };
}
