/**
 * Utility functions for user location and real-time weather detection using Open-Meteo & BigDataCloud APIs
 */

export async function fetchWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code`
    );
    if (!res.ok) throw new Error('Failed to fetch weather data from Open-Meteo');
    const data = await res.json();
    return data.current;
  } catch (err) {
    console.error('Weather API error:', err);
    return null;
  }
}

export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) throw new Error('Failed to reverse geocode location');
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || data.countryName || 'Your Location';
  } catch (err) {
    console.warn('Reverse geocode error:', err);
    return 'Your Location';
  }
}

export async function fetchWeatherByIPFallback() {
  try {
    const res = await fetch('http://ip-api.com/json/');
    if (!res.ok) throw new Error('IP Location failed');
    const data = await res.json();
    if (data.lat && data.lon) {
      const weather = await fetchWeatherByCoords(data.lat, data.lon);
      return {
        city: data.city || data.regionName || 'Your Location',
        temp: weather ? Math.round(weather.temperature_2m) : null,
        weatherCode: weather ? weather.weather_code : 0,
        precipitation: weather ? weather.precipitation : 0
      };
    }
  } catch (e) {
    console.warn('IP location fallback failed:', e);
  }
  return null;
}

export function parseWeatherCategory(weatherCode, temp, precipitation) {
  // WMO Weather interpretation codes
  // Rain / Drizzle / Thunderstorm: 51-67, 80-82, 95-99
  const isRain =
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    (weatherCode >= 95 && weatherCode <= 99) ||
    (precipitation && precipitation > 0);

  // Snow / Freezing / Low Temperature (< 15°C): 71-77, 85-86
  const isCold =
    (weatherCode >= 71 && weatherCode <= 77) ||
    (weatherCode >= 85 && weatherCode <= 86) ||
    (temp !== null && temp < 15);

  let conditionDesc = 'Sunny';
  if (isRain) {
    conditionDesc = 'Rainy';
  } else if (isCold) {
    conditionDesc = 'Cold';
  } else if (weatherCode === 2 || weatherCode === 3) {
    conditionDesc = 'Partly Cloudy';
  }

  let category = 'Sunny';
  if (isRain) category = 'Rainy';
  else if (isCold) category = 'Cold';

  return {
    category,
    conditionDesc,
    icon: isRain ? '🌧️' : isCold ? '❄️' : '☀️'
  };
}

export async function getUserLocationAndWeather() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      // Fallback to IP location
      fetchWeatherByIPFallback().then((data) => {
        if (!data) return resolve(null);
        const { category, conditionDesc, icon } = parseWeatherCategory(data.weatherCode, data.temp, data.precipitation);
        resolve({
          city: data.city,
          temp: data.temp,
          category,
          conditionDesc,
          icon
        });
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const [cityName, weather] = await Promise.all([
          reverseGeocode(lat, lon),
          fetchWeatherByCoords(lat, lon)
        ]);

        if (weather) {
          const temp = Math.round(weather.temperature_2m);
          const { category, conditionDesc, icon } = parseWeatherCategory(weather.weather_code, temp, weather.precipitation);
          resolve({
            city: cityName,
            temp,
            category,
            conditionDesc,
            icon
          });
        } else {
          // Fallback to IP location if weather fetch failed
          const ipData = await fetchWeatherByIPFallback();
          if (ipData) {
            const { category, conditionDesc, icon } = parseWeatherCategory(ipData.weatherCode, ipData.temp, ipData.precipitation);
            resolve({
              city: ipData.city,
              temp: ipData.temp,
              category,
              conditionDesc,
              icon
            });
          } else {
            resolve(null);
          }
        }
      },
      async (err) => {
        console.warn('Geolocation permission denied or error, using IP fallback:', err.message);
        const ipData = await fetchWeatherByIPFallback();
        if (ipData) {
          const { category, conditionDesc, icon } = parseWeatherCategory(ipData.weatherCode, ipData.temp, ipData.precipitation);
          resolve({
            city: ipData.city,
            temp: ipData.temp,
            category,
            conditionDesc,
            icon
          });
        } else {
          resolve(null);
        }
      },
      { timeout: 8000 }
    );
  });
}
