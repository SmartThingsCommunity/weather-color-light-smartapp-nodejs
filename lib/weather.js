const rp = require('request-promise');
const prettyjson = require('prettyjson');
const prettyjsonOptions = {};
const weatherUrl = 'https://api.openweathermap.org/data/2.5';
const weatherApiKey = process.env.WEATHER_API_KEY;
const colorType = require('../constants/colors');

module.exports = {
  /**
   * Returns a Bluebird Promise for getting the current weather.
   * @param {string} zipCode - A valid, 5-digit zip code for the are to get
   *    the weather for.
   * @returns {Promise} the Bluebird request-promise for this request.
   */
  getCurrentWeather: function(zipCode) {
    const options = {
      url: `${weatherUrl}/weather`,
      qs: {
        zip: zipCode,
        units: 'imperial',
        APPID: weatherApiKey
      },
      json: true
    };
    return rp(options);
  },

  /**
   * Returns a Bluebird Promise for getting the weather forecast.
   * @param {string} zipCode - A valid, 5-digit zip code for the are to get
   *    the weather for.
   * @returns {Promise} the Bluebird request-promise for this request.
   */
  getForecast: function(zipCode) {
    const options = {
      url: `${weatherUrl}/forecast`,
      qs: {
        zip: zipCode,
        units: 'imperial',
        APPID: weatherApiKey
      },
      json: true
    };
    return rp(options);
  },

  /**
   * Returns the hue and saturation values for a given forecast and chunks (in 3 hour intervals from current time):
   *
   * Any precipitation will return values for the color Purple, regardless of
   *   temp.
   * Any forecast temperature greater than 80 degrees Fahrenheit return values
   *   for orange.
   * Any forecast temperature less than 50 degress Fahrenheit return values for
   *   blue.
   * Any other forecast temperature or conditions return values for soft white.
   *
   * @param {Object} weather - The current forecast.
   * @param {number} chunks - The number of forecast chunks to check (each chunk
   *   is 3 hours)
   * @returns {Object} The hue and saturation values. E.g., {hue: 23, saturation: 100}
   */
  getColorForForecast: function(weather, chunks) {
    console.log(`will get forecast for the next ${chunks} chunks`);

    let forecast = weather.list.slice(0, chunks);
    let precip = false;
    //    console.log(prettyjson.render(forecast,prettyjsonOptions))
    let temps = forecast.map(function(item) {
      return item.main.temp;
    });

    let conditions = forecast.map(function(item) {
      return item.weather[0].main;
    });
    //    console.log(prettyjson.render({temps, conditions}, prettyjsonOptions));
    let highestTemp = Math.max(...temps);
    let lowestTemp = Math.min(...temps);

    if ((conditions.indexOf('Rain') > - 1) ||
        (conditions.indexOf('Mist') > -1) ||
        (conditions.indexOf('Snow') > -1)) {
        precip = true;
      }

    let color = null;
    if (precip) {
      color = colorType.PURPLE;
    } else if (highestTemp > 80) {
      color = colorType.RED;
    } else if (lowestTemp < 50) {
      color = colorType.BLUE;
    } else {
      color = colorType.WHITE;
    }

    console.log(`color values: ${prettyjson.render(color, prettyjsonOptions)}`);
    return color;
  }
};
