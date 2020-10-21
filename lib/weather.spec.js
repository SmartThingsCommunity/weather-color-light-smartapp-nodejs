const test = require('ava');
const colorType = require('../constants/colors');
const weather = require('./weather');
const forecast = require('../config/forecast-test.json');

test('cloudy first chunk snow second chunk should be purple', t => {
  const color = weather.getColorForForecast(forecast, 2);
  t.is(color, colorType.PURPLE);
});
