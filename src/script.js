const APIKEY = '8944afa6845bd7c413a687258d3211ef';

function isAlertShown() {
  const myAlert = document.querySelector('#alertJS');
  return myAlert.classList.contains('show');
}

function changeAlertText(text) {
  const myAlert = document.querySelector('#alertJS');
  myAlert.innerHTML = text;
}

function hideAlert() {
  const myAlert = document.querySelector('#alertJS');
  myAlert.classList.remove('show');
  myAlert.classList.add('hide');
}

function showAlert() {
  const myAlert = document.querySelector('#alertJS');
  myAlert.classList.remove('hide');
  myAlert.classList.add('show');
}

function showWeatherSection() {
  const mainContent = document.querySelector('#weatherSectionJS');
  mainContent.classList.remove('hide');
  mainContent.classList.add('show');
}

function hideWeatherSection() {
  const mainContent = document.querySelector('#weatherSectionJS');
  mainContent.classList.remove('show');
  mainContent.classList.add('hide');
}

function isWeatherSectionShown() {
  const mainContent = document.querySelector('#weatherSectionJS');
  return mainContent.classList.contains('show');
}

function showSpinner() {
  const spinner = document.querySelector('#spinnerJS');
  spinner.classList.remove('hide');
  spinner.classList.add('show');
}

function hideSpinner() {
  const spinner = document.querySelector('#spinnerJS');
  spinner.classList.remove('show');
  spinner.classList.add('hide');
}

function updateCity(city) {
  const cityHeading = document.querySelector('#currentCityJS');
  cityHeading.textContent = city;
}

function updateCurrentTemperature(temp, tempUnits) {
  const h2 = document.querySelector('#currentTempJS');
  h2.innerHTML = `${temp}<sup>${tempUnits}</sup>`;
}

function updateCurrentIcon(iconId) {
  const icon = document.querySelector('#currentIconJS');
  icon.src = `https://openweathermap.org/img/wn/${iconId}@4x.png`;
}

function updateLocationDetails(locationDetails) {
  const locationHeading = document.querySelector('#locationDetailsJS');
  locationHeading.textContent = locationDetails;
}

function determineUnits() {
  let apiUnits;
  let tempUnits;
  let windUnits;
  const toggle = document.querySelector('#tempUnitsSwitchJS');

  if (toggle.checked) {
    apiUnits = 'imperial';
    tempUnits = '°F';
    windUnits = 'mph';
  } else {
    apiUnits = 'metric';
    tempUnits = '°C';
    windUnits = 'm/s';
  }
  return { apiUnits, tempUnits, windUnits };
}

function getTime(hourCycle, date) {
  return new Intl.DateTimeFormat('default', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle,
  }).format(date);
}

function getFormattedDate(hourCycle, date, timeZone) {
  return new Intl.DateTimeFormat('default', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle,
    timeZone,
  }).format(date);
}

function getWeekDay(date, timeZone) {
  return new Intl.DateTimeFormat('default', {
    weekday: 'long',
    timeZone,
  }).format(date);
}

function determineTimeConvention() {
  const toggle = document.querySelector('#clockSwitchJS');
  let hourCycle;
  if (toggle.checked) {
    hourCycle = 'h12';
  } else {
    hourCycle = 'h23';
  }
  return hourCycle;
}

function setDateTime(formattedDate) {
  const dateTime = document.querySelector('#currentTimeJS');
  dateTime.textContent = formattedDate;
}

function toggleTimeConvention() {
  if (isWeatherSectionShown()) {
    const dates = document.querySelectorAll('.date');

    dates.forEach((element) => {
      const [day, time, modifier] = element.textContent.split(' ');
      let [hour, minutes] = time.split(':').map(Number);
      const hourCycle = determineTimeConvention();

      if (modifier === 'PM' && hour < 12) {
        hour += 12;
      } else if (modifier === 'AM' && hour === 12) {
        hour = 0;
      }

      const date = new Date().setHours(hour, minutes);
      const formattedTime = getTime(hourCycle, date);
      element.textContent = `${day} ${formattedTime}`;
    });
  }
}
function updateCurrentDescription(currentDescription) {
  const desc = document.querySelector('#currentDescriptionJS');
  desc.innerText = currentDescription;
}

function updateHumidity(humidity) {
  const humidityEl = document.querySelector('#humidityJS');
  humidityEl.innerText = `Humidity: ${humidity}`;
}

function updateClouds(cloud) {
  const cloudEl = document.querySelector('#cloudJS');
  cloudEl.innerText = `Cloudiness: ${cloud}`;
}

function updateWindSpeed(windspeed) {
  const windspeedEl = document.querySelector('#windspeedJS');
  windspeedEl.innerText = `Wind speed: ${windspeed}`;
}

function updateSunset(sunset) {
  const sunsetEl = document.querySelector('#sunsetJS');
  sunsetEl.innerText = `${sunset}`;
}

function updateSunrise(sunrise) {
  const sunriseEl = document.querySelector('#sunriseJS');
  sunriseEl.innerText = `${sunrise}`;
}

function updateCurrentForcastCard({
  temp,
  tempUnits,
  city,
  icon,
  sunrise,
  sunset,
  dateTime,
  timezone,
  windspeed,
  humidity,
  clouds,
  currentDescription,
  locationDetails,
}) {
  updateCurrentIcon(icon);
  updateCurrentTemperature(temp, tempUnits);
  updateCity(city);
  updateCurrentDescription(currentDescription);
  const hourCycle = determineTimeConvention();
  const formattedDate = getFormattedDate(hourCycle, dateTime, timezone);
  setDateTime(formattedDate);
  updateSunrise(sunrise);
  updateSunset(sunset);
  updateLocationDetails(locationDetails);
  updateWindSpeed(windspeed);
  updateClouds(clouds);
  updateHumidity(humidity);
}

function updateWeeklyForecast({ tempUnits, forecast }) {
  const dayHeader = document.querySelectorAll('.dayJS');
  const tempMax = document.querySelectorAll('.tempsMaxForecastJS');
  const tempMin = document.querySelectorAll('.tempsMinForecastJS');
  const icon = document.querySelectorAll('.forecastIconJS');
  const desc = document.querySelectorAll('.forecastDescriptionJS');

  forecast.forEach((day, index) => {
    dayHeader[index].innerText = day.weekday;
    tempMax[index].innerHTML = `${day.maxTemp}<sup>${tempUnits}</sup>`;
    tempMin[index].innerHTML = `${day.minTemp}<sup>${tempUnits}</sup>`;
    desc[index].innerText = day.description;
    icon[index].src = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;
  });
}
function hasSunRose(utcNow, utcSunRise, utcSunset) {
  return utcNow > utcSunRise && utcNow < utcSunset;
}

function transformWeatherData(data, tempUnits, windUnits, city, locationDetails) {
  const temp = Math.round(data.current.temp);
  const timezone = data.timezone;
  const hourCycle = determineTimeConvention();
  const isSunOut = hasSunRose(data.current.dt, data.current.sunrise, data.current.sunset);
  const dateTime = new Date(data.current.dt * 1000);
  const sunrise = getFormattedDate(hourCycle, new Date(data.current.sunrise * 1000), timezone);
  const sunset = getFormattedDate(hourCycle, new Date(data.current.sunset * 1000), timezone);
  const currentIcon = data.current.weather[0].icon;
  const currentDescription = data.current.weather[0].description;
  const humidity = `${data.current.humidity}%`;
  const clouds = `${data.current.clouds}%`;
  const windspeed = `${data.current.wind_speed} ${windUnits}`;

  const forecast = [];
  data.daily.slice(0, 5).forEach((day) => {
    const weekday = getWeekDay(new Date(day.dt * 1000), timezone);
    const maxTemp = Math.round(day.temp.max);
    const minTemp = Math.round(day.temp.min);
    const description = day.weather[0].description;
    const icon = day.weather[0].icon;
    forecast.push({ weekday, maxTemp, minTemp, description, icon });
  });

  return {
    temp,
    tempUnits,
    dateTime,
    city,
    icon: currentIcon,
    isSunOut,
    sunrise,
    sunset,
    humidity,
    clouds,
    windspeed,
    currentDescription,
    forecast,
    timezone,
    locationDetails,
  };
}

function changeTheme(isSunOut) {
  if (isSunOut) {
    document.body.setAttribute('data-theme', 'light');
  } else {
    document.body.setAttribute('data-theme', 'dark');
  }
}

async function fetchWeather(lat, lon, city, locationDetails) {
  const url = 'https://api.openweathermap.org/data/2.5/onecall?';
  const { apiUnits, tempUnits, windUnits } = determineUnits();

  try {
    const { data } = await axios.get(url, {
      params: {
        lat,
        lon,
        units: apiUnits,
        appid: APIKEY,
        exclude: 'minutely,hourly,alerts',
      },
    });

    if (isAlertShown()) {
      hideAlert();
    }
    const weatherData = transformWeatherData(data, tempUnits, windUnits, city, locationDetails);
    changeTheme(weatherData.isSunOut);
    updateCurrentForcastCard(weatherData);
    updateWeeklyForecast(weatherData);
    hideSpinner();
    showWeatherSection();
  } catch (error) {
    if (error.response.status === 404) {
      changeAlertText(
        `Nothing found when searching for city. <br /> Searched with this lat: ${lat} lon:${lon} city:${city}`
      );
    } else if (error.response.status === 429) {
      changeAlertText('Open Weather API has too many calls from this key. Try another key.');
    } else if (error.response.status === 401) {
      changeAlertText('The Open Weather API key is not valid. Try another key.');
    } else {
      changeAlertText(error.message);
    }
    hideSpinner();
    showAlert();
  }
}

async function fetchLocationByZip(zip) {
  const url = 'https://api.openweathermap.org/geo/1.0/zip?';
  hideWeatherSection();
  showSpinner();

  try {
    const { data } = await axios.get(url, {
      params: {
        zip,
        appid: APIKEY,
      },
    });
    if (zip.includes(',')) {
      zip = zip.split(',')[0];
    }
    const { lat, lon, name, country } = data;
    const locationDetails = `${zip}, ${country}`;
    await fetchWeather(lat, lon, name, locationDetails);
  } catch (error) {
    if (error.response.status === 400) {
      changeAlertText(
        `No result found for ${zip}. <br /> Please search by zipcode in US or zipcode,country code. <br /> Country codes are two digit ISO 3166 country codes.`
      );
    } else if (error.response.status === 404) {
      changeAlertText(
        `No result found for ${zip}. <br /> Please search by zipcode in US or zipcode,country code. <br /> Country codes are two digit ISO 3166 country codes.`
      );
    } else if (error.response.status === 429) {
      changeAlertText('Open Weather API has too many calls from this key. Try another key.');
    } else if (error.response.status === 401) {
      changeAlertText('The Open Weather API key is not valid. Try another key.');
    } else {
      changeAlertText(error.message);
    }
    hideSpinner();
    showAlert();
  }
}

async function fetchLocationByCity(city) {
  const url = 'https://api.openweathermap.org/geo/1.0/direct';
  hideWeatherSection();
  showSpinner();

  try {
    const { data } = await axios.get(url, {
      params: {
        q: city,
        appid: APIKEY,
        limit: 1,
      },
    });
    if (data.length > 0) {
      const { state = 'unknown', country, lat, lon, name } = data[0];
      let locationDetails;
      if (state !== 'unknown') {
        locationDetails = `${state}, ${country}`;
      } else {
        locationDetails = country;
      }
      await fetchWeather(lat, lon, name, locationDetails);
    } else {
      const error = new Error('No city found');
      error.code = 'NOT_FOUND';
      throw error;
    }
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      changeAlertText(
        `${error.message} for ${city}. <br /> Please search by city name or city name,country code. <br /> Country codes are two digit ISO 3166 country codes.`
      );
    } else if (error.response.status === 404) {
      changeAlertText(`Nothing found while searching for ${city}`);
    } else if (error.response.status === 429) {
      changeAlertText('Open Weather API has too many calls from this key. Try another key.');
    } else if (error.response.status === 401) {
      changeAlertText('The Open Weather API key is not valid. Try another key.');
    } else {
      changeAlertText(error.message);
    }
    hideSpinner();
    showAlert();
  }
}

async function fetchLocationByLatLon(lat, lon) {
  const url = 'https://api.openweathermap.org/geo/1.0/reverse?';
  hideWeatherSection();
  showSpinner();

  try {
    const { data } = await axios.get(url, {
      params: {
        lat,
        lon,
        appid: APIKEY,
        limit: 1,
      },
    });
    const { state = 'unknown', country, name } = data[0];
    let locationDetails;

    if (state !== 'unknown') {
      locationDetails = `${state}, ${country}`;
    } else {
      locationDetails = country;
    }
    await fetchWeather(lat, lon, name, locationDetails);
  } catch (error) {
    if (error.response.status === 404) {
      changeAlertText(`Nothing found with this lat: ${lat} lon:${lon}`);
    } else if (error.response.status === 429) {
      changeAlertText('Open Weather API has too many calls from this key. Try another key.');
    } else if (error.response.status === 401) {
      changeAlertText('The Open Weather API key is not valid. Try another key.');
    } else {
      changeAlertText(error.message);
    }
    hideSpinner();
    showAlert();
  }
}

function containsNumbers(input) {
  const matches = input.match(/\d+/g);
  return matches !== null;
}
function removeSpacesBetweenComma(input) {
  return input.replace(/\s*,\s*/g, ',');
}
function getUserInput(event) {
  event.preventDefault();
  let input = document.querySelector('#userInputJS').value.trim();

  if (input) {
    if (input.includes(',')) {
      input = removeSpacesBetweenComma(input);
    }
    if (containsNumbers(input)) {
      fetchLocationByZip(input);
    } else {
      fetchLocationByCity(input);
    }
  } else {
    changeAlertText('Please enter a city or zipcode');
    showAlert();
  }

  document.querySelector('#userInputJS').value = '';
}

function setTemps(conversionFn, tempUnits) {
  const temps = document.querySelectorAll('.tempsJS');
  temps.forEach((element) => {
    const temp = element.innerText.split('°')[0];
    const convertedTemp = conversionFn(temp);
    element.innerHTML = `${convertedTemp}<sup>${tempUnits}</sup>`;
  });
}

function convertToCelsius(temp) {
  return Math.round((temp - 32) * (5 / 9));
}

function convertToFahrenheit(temp) {
  return Math.round(temp * (9 / 5) + 32);
}

function toggleTempUnits() {
  if (isWeatherSectionShown()) {
    const toggle = document.querySelector('#tempUnitsSwitchJS');
    if (toggle.checked) {
      setTemps(convertToFahrenheit, '°F');
    } else {
      setTemps(convertToCelsius, '°C');
    }
  }
}

function geoSucess(position) {
  fetchLocationByLatLon(position.coords.latitude, position.coords.longitude);
}

function geoError() {
  changeAlertText('We could not get your location. Please make sure to allow geolocation in your browser');
  hideSpinner();
  showAlert();
}

function getGeoLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geoSucess, geoError);
  } else {
    changeAlertText('Geolocation is not supported by this browser');
    hideSpinner();
    showAlert();
  }
}

const form = document.querySelector('#inputFormJS');
form.addEventListener('submit', getUserInput);

const geoButton = document.querySelector('#geoButtonJS');
geoButton.addEventListener('click', getGeoLocation);

const clockSwitch = document.querySelector('#clockSwitchJS');
clockSwitch.addEventListener('change', toggleTimeConvention);

const tempUnitsSwitch = document.querySelector('#tempUnitsSwitchJS');
tempUnitsSwitch.addEventListener('change', toggleTempUnits);

fetchLocationByCity('Philadelphia');
