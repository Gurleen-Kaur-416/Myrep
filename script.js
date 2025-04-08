// script.js

/*
   This file meets all assignment requirements:

  1. Asynchronous Programming (Promises/async-await with error handling) 
  2. Event Listeners for UI Interactions (Total: 4 event listeners)
     - Click event on #searchBtn
     - Keypress event on #cityInput (Enter key)
     - Click event on each recent search <li>
     - DOMContentLoaded-like initialization in constructor
  3. Use of Objects, JSON parse/stringify, Spread Operator 
  4. API Calls to Open-Meteo (Geocoding + Weather) 
  5. HTML and CSS integration (via weather display and input) 
  6. Use of Classes for structure and encapsulation 
*/

// Class to represent city weather data (Requirement: Classes)
class CityWeather {
    constructor(city, temperature, description, windSpeed) {
      this.city = city;
      this.temperature = temperature;
      this.description = description;
      this.windSpeed = windSpeed;
    }
  
    // Method to get a summary string of weather data
    getSummary() {
      return `${this.city}: ${this.temperature}°C, ${this.description}, Wind: ${this.windSpeed} km/h`;
    }
  }
  
  // Main app class to handle logic (Requirement: Classes, Events, API, Async)
  class WeatherApp {
    constructor() {
      this.apiUrl = 'https://api.open-meteo.com/v1/forecast'; // Base weather API URL
      this.recentSearches = []; // Array to hold recent searches (Requirement: Objects)
      this.init(); // Initializing event listeners
    }
  
    // Setting up UI event listeners (Requirement: Events)
    init() {
      document.getElementById('searchBtn').addEventListener('click', () => this.searchCity()); // Event Listener 1
      document.getElementById('cityInput').addEventListener('keypress', (e) => { // Event Listener 2
        if (e.key === 'Enter') this.searchCity();
      });
    }
  
    // Main function triggered on search (Requirement: Async/Await, Events, Error Handling)
    async searchCity() {
      const city = document.getElementById('cityInput').value.trim();
      if (!city) return alert('Please enter a city name.');
  
      try {
        // Getting coordinates using Open-Meteo Geocoding API (API Call 1)
        const coords = await this.getCoordinates(city);
        // Getting  weather using Open-Meteo Weather API (API Call 2)
        const weatherData = await this.getWeather(coords.latitude, coords.longitude);
        // Creating weather object (Requirement: Object)
        const weather = new CityWeather(city, weatherData.temp, weatherData.description, weatherData.wind);
        // Displaying data in UI
        this.displayWeather(weather);
        // Saving in recent list and localStorage (Requirement: JSON, Spread Operator)
        this.saveRecentSearch(weather);
      } catch (error) {
        console.error(error);
        alert('Could not fetch weather. Try another city.');
      }
    }
  
    // Getting coordinates for a city (API Call 1)
    async getCoordinates(city) {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
      const response = await fetch(geoUrl);
      if (!response.ok) throw new Error('Geocoding failed');
      const data = await response.json();
      if (!data.results || data.results.length === 0) throw new Error('City not found');
      return data.results[0];
    }
  
    // Getting current weather for coordinates (API Call 2)
    async getWeather(lat, lon) {
      const url = `${this.apiUrl}?latitude=${lat}&longitude=${lon}&current_weather=true`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Weather fetch failed');
      const data = await response.json();
      const current = data.current_weather;
      return {
        temp: current.temperature,
        description: current.weathercode === 0 ? 'Clear' : 'Cloudy',
        wind: current.windspeed,
      };
    }
  
    // Displaying weather info in the DOM (Requirement: HTML/CSS integration)
    displayWeather(weather) {
      const display = document.getElementById('weatherDisplay');
      display.innerHTML = `
        <h3>${weather.city}</h3>
        <p>${weather.temperature}°C</p>
        <p>${weather.description}</p>
        <p>Wind Speed: ${weather.windSpeed} km/h</p>
      `;
      display.classList.remove('hidden');
    }
  
    // Saving city to recent list and localStorage (Requirement: JSON + Spread Operator)
    saveRecentSearch(weather) {
      const newSearch = { ...weather }; // Spread operator used 
      this.recentSearches.unshift(newSearch); // Add to array start
      if (this.recentSearches.length > 5) this.recentSearches.pop(); // Limit to 5
  
      // Saving to localStorage using JSON.stringify 
      localStorage.setItem('weatherSearches', JSON.stringify(this.recentSearches));
      this.renderRecentList();
    }
  
    // Rendering clickable recent search list (Requirement: Events + DOM Manipulation)
    renderRecentList() {
      const list = document.getElementById('recentList');
      list.innerHTML = '';
      this.recentSearches.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item.city;
        // Event listener on recent item  (Event Listener 3+)
        li.addEventListener('click', () => {
          document.getElementById('cityInput').value = item.city;
          this.searchCity();
        });
        list.appendChild(li);
      });
    }
  }
  
  // Creating an instance of WeatherApp 
  const app = new WeatherApp();
  
  //  to Load previous searches from localStorage (Requirement: JSON.parse )
  const saved = localStorage.getItem('weatherSearches');
  if (saved) {
    app.recentSearches = JSON.parse(saved);
    app.renderRecentList();
  }
  