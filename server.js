require('dotenv').config();
const express = require('express');
const SmartApp = require('@smartthings/smartapp');
const fs = require('fs');
const weather = require('./lib/weather');
const server = express();
const PORT = process.env.PORT || 3005;

const smartapp = new SmartApp()
    .configureI18n()
    .enableEventLogging(2)
    .page('mainPage', (context, page, configData) => {
      page.section('forecast', section => {
        section.numberSetting('zipCode')
        section.enumSetting('forecastInterval').options([
          {id: "1", name: "3 Hours"},
          {id: "2", name: "6 Hours"},
          {id: "3", name: "9 Hours"},
          {id: "4", name: "12 Hours"}
        ]);
        section.enumSetting('scheduleInterval').options([
          {id: "15", name: "15 Minutes"},
          {id: "30", name: "30 Minutes"},
          {id: "45", name: "45 Minutes"},
          {id: "60", name: "60 Minutes"}
        ]);
      });
      page.section('lights', section => {
        section.deviceSetting('colorLight')
            .capabilities(['colorControl', 'switch', 'switchLevel'])
            .permissions('rx')
      });
    })
    .updated(async ctx => {
      await ctx.api.schedules.unscheduleAll();
      return ctx.api.schedules.schedule('weatherHandler', `0/${ctx.configStringValue('scheduleInterval')} * * * ? *`);
    })
    .scheduledEventHandler('weatherHandler', async ctx => {
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
    });

if (fs.existsSync('./config/smartthings_rsa.pub')) {
    smartapp.publicKey('@config/smartthings_rsa.pub');
}

server.use(express.json());
server.post('/', (req, res, next) => {
  smartapp.handleHttpCallback(req, res);
});

server.listen(PORT, () => console.log(`Server is up and running on port ${PORT}`));
