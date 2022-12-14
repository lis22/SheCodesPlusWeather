const APIKEY = '8944afa6845bd7c413a687258d3211ef';

function hideElement(id) {
  document.querySelector(id).style.display = 'none';
}

function showElement(id) {
  document.querySelector(id).style.display = 'block';
}

function isElementShown(id) {
  return document.querySelector(id).style.display === 'block';
}

function changeElementText(id, text) {
  document.querySelector(id).innerText = text;
}

function changeElementHTML(id, text) {
  document.querySelector(id).innerHTML = text;
}

function changeIcon(id, iconId) {
  document.querySelector(id).src = `https://openweathermap.org/img/wn/${iconId}@4x.png`;
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
    hour: 'numeric',
    minute: '2-digit',
    hourCycle,
  }).format(date);
}

function getFormattedDate(hourCycle, date, timeZone) {
  return new Intl.DateTimeFormat('default', {
    weekday: 'long',
    hour: 'numeric',
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

function toggleTimeConvention() {
  if (isElementShown('#weatherSectionJS')) {
    const dates = document.querySelectorAll('.date');

    dates.forEach((element, index) => {
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
      dates[index].textContent = `${day} ${formattedTime}`;
    });
  }
}

function updateCurrentWeather({
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
  const hourCycle = determineTimeConvention();
  const formattedDate = getFormattedDate(hourCycle, dateTime, timezone);

  changeIcon('#currentIconJS', icon);
  changeElementText('#currentDescriptionJS', currentDescription);
  changeElementText('#currentCityJS', city);
  changeElementText('#locationDetailsJS', locationDetails);
  changeElementHTML('#currentTempJS', `${temp}<sup>${tempUnits}</sup>`);
  changeElementText('#currentTimeJS', formattedDate);
  changeElementText('#sunriseJS', sunrise);
  changeElementText('#sunsetJS', sunset);
  changeElementText('#humidityJS', humidity);
  changeElementText('#cloudJS', clouds);
  changeElementText('#windspeedJS', windspeed);
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
  const alertId = '#alertJS';
  let data;
  const { apiUnits, tempUnits, windUnits } = determineUnits();

  try {
    ({ data } = await axios.get(url, {
      params: {
        lat,
        lon,
        units: apiUnits,
        appid: APIKEY,
        exclude: 'minutely,hourly,alerts',
      },
    }));
  } catch (error) {
    if (error.response.status === 404) {
      changeElementText(
        alertId,
        `Nothing found when searching for city. Searched with this lat: ${lat} lon:${lon} city:${city}`
      );
    } else if (error.response.status === 429) {
      changeElementText(alertId, 'Open Weather API has too many calls from this key. Try another key.');
    } else if (error.response.status === 401) {
      changeElementText(alertId, 'The Open Weather API key is not valid. Try another key.');
    } else {
      changeElementText(alertId, error.message);
    }
    hideElement('#spinnerJS');
    showElement(alertId);
  }

  if (isElementShown(alertId)) {
    hideElement(alertId);
  }
  const weatherData = transformWeatherData(data, tempUnits, windUnits, city, locationDetails);
  changeTheme(weatherData.isSunOut);
  updateCurrentWeather(weatherData);
  updateWeeklyForecast(weatherData);
  hideElement('#spinnerJS');
  showElement('#weatherSectionJS');
}

async function fetchLocationByZip(zip) {
  const url = 'https://api.openweathermap.org/geo/1.0/zip?';
  const alertId = '#alertJS';
  let data;

  hideElement('#weatherSectionJS');
  showElement('#spinnerJS');

  try {
    ({ data } = await axios.get(url, {
      params: {
        zip,
        appid: APIKEY,
      },
    }));
  } catch (error) {
    if (error.response.status === 400) {
      changeElementText(
        alertId,
        `No result found for ${zip}. Please search by zipcode in US or zipcode,country code. Country codes are two digit ISO 3166 country codes.`
      );
    } else if (error.response.status === 404) {
      changeElementText(
        alertId,
        `No result found for ${zip}. Please search by zipcode in US or zipcode,country code. Country codes are two digit ISO 3166 country codes.`
      );
    } else if (error.response.status === 429) {
      changeElementText(alertId, 'Open Weather API has too many calls from this key. Try another key.');
    } else if (error.response.status === 401) {
      changeElementText(alertId, 'The Open Weather API key is not valid. Try another key.');
    } else {
      changeElementText(alertId, error.message);
    }
    hideElement('#spinnerJS');
    showElement(alertId);
  }
  if (zip.includes(',')) {
    zip = zip.split(',')[0];
  }
  const { lat, lon, name, country } = data;
  const locationDetails = `${zip}, ${country}`;
  await fetchWeather(lat, lon, name, locationDetails);
}

async function fetchLocationByCity(city) {
  const url = 'https://api.openweathermap.org/geo/1.0/direct';
  const alertId = '#alertJS';
  let data;

  hideElement('#weatherSectionJS');
  showElement('#spinnerJS');

  try {
    ({ data } = await axios.get(url, {
      params: {
        q: city,
        appid: APIKEY,
        limit: 1,
      },
    }));
  } catch (error) {
    if (error.response.status === 400) {
      changeElementText(
        alertId,
        `Nothing found while searching for ${city}. Please search by city name or city name,country code. Country codes are two digit ISO 3166 country codes.`
      );
    } else if (error.response.status === 404) {
      changeElementText(alertId, `Nothing found while searching for ${city}`);
    } else if (error.response.status === 429) {
      changeElementText(alertId, 'Open Weather API has too many calls from this key. Try another key.');
    } else if (error.response.status === 401) {
      changeElementText(alertId, 'The Open Weather API key is not valid. Try another key.');
    } else {
      changeElementText(alertId, error.message);
    }
    hideElement('#spinnerJS');
    showElement(alertId);
  }

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
    changeElementText(
      alertId,
      `Nothing found while searching for ${city}. Please search by city name or city name,country code. Country codes are two digit ISO 3166 country codes.`
    );
    hideElement('#spinnerJS');
    showElement(alertId);
  }
}

async function fetchLocationByLatLon(lat, lon) {
  const url = 'https://api.openweathermap.org/geo/1.0/reverse?';
  const alertId = '#alertJS';
  let data;

  hideElement('#weatherSectionJS');
  showElement('#spinnerJS');

  try {
    ({ data } = await axios.get(url, {
      params: {
        lat,
        lon,
        appid: APIKEY,
        limit: 1,
      },
    }));
  } catch (error) {
    if (error.response.status === 404) {
      changeElementText(alertId, `Nothing found with this lat: ${lat} lon:${lon}`);
    } else if (error.response.status === 429) {
      changeElementText(alertId, 'Open Weather API has too many calls from this key. Try another key.');
    } else if (error.response.status === 401) {
      changeElementText(alertId, 'The Open Weather API key is not valid. Try another key.');
    } else {
      changeElementText(alertId, error.message);
    }
    hideElement('#spinnerJS');
    showElement(alertId);
  }
  const { state = 'unknown', country, name } = data[0];
  let locationDetails;

  if (state !== 'unknown') {
    locationDetails = `${state}, ${country}`;
  } else {
    locationDetails = country;
  }
  await fetchWeather(lat, lon, name, locationDetails);
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
    changeElementText('#alertJS', 'Please enter a city or zipcode');
    showElement('#alertJS');
  }
  document.querySelector('#userInputJS').value = '';
}

function setTemps(conversionFn, tempUnits) {
  const temps = document.querySelectorAll('.tempsJS');
  temps.forEach((element, index) => {
    const temp = element.innerText.split('°')[0];
    const convertedTemp = conversionFn(temp);
    temps[index].innerHTML = `${convertedTemp}<sup>${tempUnits}</sup>`;
  });
}

function convertToCelsius(temp) {
  return Math.round((temp - 32) * (5 / 9));
}

function convertToFahrenheit(temp) {
  return Math.round(temp * (9 / 5) + 32);
}

function toggleTempUnits() {
  if (isElementShown('#weatherSectionJS')) {
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
  changeElementText(
    '#alertJS',
    'We could not get your location. Please make sure to allow geolocation in your browser'
  );
  hideElement('#spinnerJS');
  showElement('#alertJS');
}

function getGeoLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(geoSucess, geoError);
  } else {
    changeElementText('#alertJS', 'Geolocation is not supported by this browser');
    hideElement('#spinnerJS');
    showElement('#alertJS');
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
