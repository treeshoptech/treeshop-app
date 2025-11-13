/**
 * Weather API Integration
 *
 * Fetch real-time weather data for job sites using Google Maps APIs.
 * Uses the SAME Google Maps API key already configured for the app.
 *
 * This data is used for:
 * - ML correlation analysis (weather impact on job performance)
 * - Automatic weather logging when work orders start
 * - Historical weather pattern analysis
 *
 * NOTE: Uses National Weather Service (NWS) API which is FREE and doesn't require API key.
 * Falls back to manual entry if API unavailable.
 */

import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Fetch current weather for a location
 * Uses National Weather Service (NWS) API - FREE, no API key required
 * Works for US locations only (perfect for TreeShop in Florida)
 */
export const fetchCurrentWeather = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
  },

  handler: async (ctx, args) => {
    try {
      // Step 1: Get the forecast office and grid coordinates from NWS
      const pointsUrl = `https://api.weather.gov/points/${args.latitude},${args.longitude}`;

      const pointsResponse = await fetch(pointsUrl, {
        headers: {
          'User-Agent': 'TreeShop App (treeshop.app)',
          'Accept': 'application/json'
        }
      });

      if (!pointsResponse.ok) {
        console.warn('NWS points API error, using manual entry fallback');
        return null;
      }

      const pointsData = await pointsResponse.json();

      // Step 2: Get current observations from nearest station
      const stationsUrl = pointsData.properties.observationStations;
      const stationsResponse = await fetch(stationsUrl, {
        headers: {
          'User-Agent': 'TreeShop App (treeshop.app)',
          'Accept': 'application/json'
        }
      });

      if (!stationsResponse.ok) {
        console.warn('NWS stations API error');
        return null;
      }

      const stationsData = await stationsResponse.json();
      const nearestStation = stationsData.features[0]?.id;

      if (!nearestStation) {
        console.warn('No nearby weather station found');
        return null;
      }

      // Step 3: Get latest observation from nearest station
      const observationUrl = `${nearestStation}/observations/latest`;
      const observationResponse = await fetch(observationUrl, {
        headers: {
          'User-Agent': 'TreeShop App (treeshop.app)',
          'Accept': 'application/json'
        }
      });

      if (!observationResponse.ok) {
        console.warn('NWS observation API error');
        return null;
      }

      const observationData = await observationResponse.json();
      const obs = observationData.properties;

      // Convert Celsius to Fahrenheit
      const tempF = obs.temperature.value ? (obs.temperature.value * 9/5) + 32 : 75;
      const feelsLikeF = obs.windChill.value ? (obs.windChill.value * 9/5) + 32 : tempF;

      // Convert m/s to mph for wind
      const windSpeedMPH = obs.windSpeed.value ? obs.windSpeed.value * 2.237 : 0;
      const windGustMPH = obs.windGust.value ? obs.windGust.value * 2.237 : null;

      // Transform NWS data to our weather data structure
      const weatherData = {
        timestamp: Date.now(),
        latitude: args.latitude,
        longitude: args.longitude,

        // Core metrics
        temperatureF: Math.round(tempF),
        feelsLikeF: Math.round(feelsLikeF),
        precipitationInches: 0, // NWS doesn't provide this in observations easily
        precipitationType: obs.presentWeather?.[0]?.weather?.includes('rain') ? 'rain' : null,
        windSpeedMPH: Math.round(windSpeedMPH),
        windGustMPH: windGustMPH ? Math.round(windGustMPH) : null,
        windDirection: obs.windDirection.value ? degreesToCardinal(obs.windDirection.value) : null,
        humidity: obs.relativeHumidity.value || 50,
        cloudCover: obs.cloudLayers?.[0]?.amount === 'OVC' ? 100 : obs.cloudLayers?.[0]?.amount === 'BKN' ? 75 : 50,
        visibility: obs.visibility.value ? obs.visibility.value / 1609.34 : null, // Convert meters to miles
        uvIndex: null,

        // Conditions
        condition: obs.textDescription || 'Unknown',
        conditionDescription: obs.textDescription || '',
        isExtremeHeat: tempF > 95,
        isExtremeCold: tempF < 32,
        isHighWind: windSpeedMPH > 25,
        isHeavyRain: obs.textDescription?.toLowerCase().includes('heavy rain') || false,
        isSevereWeather:
          windSpeedMPH > 35 ||
          obs.textDescription?.toLowerCase().includes('thunderstorm') ||
          obs.textDescription?.toLowerCase().includes('severe') ||
          false,

        // Air quality
        airQualityIndex: null,

        // Data source
        dataSource: 'National Weather Service',
      };

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather data from NWS:', error);
      return null;
    }
  },
});

/**
 * Fetch weather forecast for job planning
 * Uses NWS 7-day forecast - FREE, no API key required
 */
export const fetchWeatherForecast = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
  },

  handler: async (ctx, args) => {
    try {
      // Step 1: Get the forecast office and grid coordinates
      const pointsUrl = `https://api.weather.gov/points/${args.latitude},${args.longitude}`;

      const pointsResponse = await fetch(pointsUrl, {
        headers: {
          'User-Agent': 'TreeShop App (treeshop.app)',
          'Accept': 'application/json'
        }
      });

      if (!pointsResponse.ok) {
        console.warn('NWS points API error');
        return [];
      }

      const pointsData = await pointsResponse.json();

      // Step 2: Get hourly forecast
      const forecastUrl = pointsData.properties.forecastHourly;
      const forecastResponse = await fetch(forecastUrl, {
        headers: {
          'User-Agent': 'TreeShop App (treeshop.app)',
          'Accept': 'application/json'
        }
      });

      if (!forecastResponse.ok) {
        console.warn('NWS forecast API error');
        return [];
      }

      const forecastData = await forecastResponse.json();

      // Transform forecast periods (next 7 days, hourly)
      const forecast = forecastData.properties.periods.slice(0, 168).map((period: any) => ({
        timestamp: new Date(period.startTime).getTime(),
        temperatureF: period.temperature,
        feelsLikeF: period.temperature, // NWS doesn't provide feels like
        precipitationInches: period.probabilityOfPrecipitation?.value ? period.probabilityOfPrecipitation.value / 100 : 0,
        precipitationType: period.shortForecast.toLowerCase().includes('rain') ? 'rain' :
                           period.shortForecast.toLowerCase().includes('snow') ? 'snow' : null,
        windSpeedMPH: parseInt(period.windSpeed.split(' ')[0]) || 0,
        humidity: period.relativeHumidity?.value || 50,
        cloudCover: 50, // Not provided by NWS
        condition: period.shortForecast,
        conditionDescription: period.detailedForecast,
        isExtremeHeat: period.temperature > 95,
        isExtremeCold: period.temperature < 32,
        isHighWind: parseInt(period.windSpeed.split(' ')[0]) > 25,
        isHeavyRain: period.shortForecast.toLowerCase().includes('heavy rain'),
        isSevereWeather:
          period.shortForecast.toLowerCase().includes('severe') ||
          period.shortForecast.toLowerCase().includes('thunderstorm'),
      }));

      return forecast;
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      return [];
    }
  },
});


/**
 * Helper: Convert wind degrees to cardinal direction
 */
function degreesToCardinal(degrees: number): string {
  const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return cardinals[index];
}

/**
 * Get weather severity score (0-10)
 * Used for ML feature engineering
 */
export function calculateWeatherSeverity(weather: {
  temperatureF: number;
  windSpeedMPH: number;
  precipitationInches: number;
  condition: string;
}): number {
  let severity = 0;

  // Temperature extremes
  if (weather.temperatureF > 95) severity += 3;
  else if (weather.temperatureF > 85) severity += 1;
  if (weather.temperatureF < 32) severity += 3;
  else if (weather.temperatureF < 40) severity += 1;

  // Wind
  if (weather.windSpeedMPH > 35) severity += 4;
  else if (weather.windSpeedMPH > 25) severity += 2;
  else if (weather.windSpeedMPH > 15) severity += 1;

  // Precipitation
  if (weather.precipitationInches > 0.5) severity += 3;
  else if (weather.precipitationInches > 0.1) severity += 1;

  // Severe weather conditions
  if (weather.condition === 'Thunderstorm') severity += 5;
  else if (weather.condition === 'Snow') severity += 3;

  return Math.min(severity, 10);
}
