require('dotenv').config();
const express = require('express');
const SmartApp = require('@smartthings/smartapp');
const weather = require('./lib/weather');
const server = express();
const PORT = process.env.PORT || 3005;


async function setColor(ctx) {
  const forecast = await weather.getForecast(ctx.configStringValue('zipCode'));
  const color = weather.getColorForForecast(forecast, ctx.configNumberValue('forecastInterval'));
  return ctx.api.devices.sendCommands(ctx.config.colorLight, [
      {
          capability: 'switch',
          command: 'on'
      },
      {
          capability: 'switchLevel',
          command: 'setLevel',
          arguments: [20]
      },
      {
          capability: 'colorControl',
          command: 'setColor',
          arguments: [color]
      }
  ]);
}

const smartapp = new SmartApp()
    .configureI18n()
    .enableEventLogging(2)
    .page('mainPage', (context, page, configData) => {
      page.section('forecast', section => {
        section.numberSetting('zipCode')
            .required(true)
        section.enumSetting('forecastInterval')
            .options([
              {id: "1", name: "3 Hours"},
              {id: "2", name: "6 Hours"},
              {id: "3", name: "9 Hours"},
              {id: "4", name: "12 Hours"}
            ])
            .defaultValue("1");
        section.enumSetting('scheduleInterval')
            .options([
              {id: "15", name: "15 Minutes"},
              {id: "30", name: "30 Minutes"},
              {id: "45", name: "45 Minutes"},
              {id: "60", name: "60 Minutes"}
            ])
            .defaultValue("15");
      });
      page.section('lights', section => {
        section.deviceSetting('colorLight')
            .capabilities(['colorControl', 'switch', 'switchLevel'])
            .permissions('rx')
            .required(true)
      });
    })
    .updated(async ctx => {
      await ctx.api.schedules.delete();

      // switch light on to initial color
      await setColor(ctx);

      // schedule future changes
      return ctx.api.schedules.schedule('weatherHandler', `0/${ctx.configStringValue('scheduleInterval')} * * * ? *`, 'UTC');
    })
    .scheduledEventHandler('weatherHandler', setColor);

server.use(express.json());
server.post('/', (req, res, next) => {
  smartapp.handleHttpCallback(req, res);
});

server.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));
