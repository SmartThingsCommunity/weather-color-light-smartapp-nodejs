/**
 * Sample WebHook app for integrating with the SmartThings One IoT API.
 *
 * The app will set the color of a SmartThings-connected Color Control bulb
 * according to the current weather conditions of a user-entered US five-digit
 * Zip Code.
 */
'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');
const httpSignature = require('http-signature');
const prettyjson = require('prettyjson');

const commands = require('./lib/commands');
const stConfig = require('./lib/config');
const scheduling = require('./lib/scheduling');
const weather = require('./lib/weather');
const stApi = 'https://api.smartthings.com/v1';
const prettyjsonOptions = {};
const app = express();

app.use(bodyParser.json());

// UNCOMMENT THE FOLLOWING IN PRODUCTION
// const publicKey = fs.readFileSync('./config/smartthings_rsa.pub', 'utf8');
// END WARNING

/**
* Entry point for callbacks by SmartThings.
* Every incoming call will have a lifecycle, which determines how the
* app should respond.
*
* All requests will have their HTTP signature verified to ensure the
* request is actually from SmartThings, except for the PING lifecycle
* request (which occurs as the app is being created).
*/
app.post('/', function (req, response) {
  // We don't yet have the public key during PING (when the app is created),
  // so no need to verify the signature. All other requests are verified.
  if (req.body && req.body.lifecycle === "PING" || signatureIsVerified(req)) {
    handleRequest(req, response);
  } else {
    response.status(401).send("Forbidden");
  }
});

/**
* Verifies that the request is actually from SmartThings.
* @returns true if verified, false otherwise.
*/
function signatureIsVerified(req) {
  // WARNING: DO NOT USE THIS IN PRODUCTION
  // We will read the public key from FS everytime we need to verify
  // COMMENT OUT THIS LINE INPRODUCTION
  const publicKey = fs.readFileSync('./config/smartthings_rsa.pub', 'utf8');
  // END WARNING
  try {
    let parsed = httpSignature.parseRequest(req);
    if (!httpSignature.verifySignature(parsed, publicKey)) {
      console.log('forbidden - failed verifySignature');
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
}

function handleRequest(req, response) {
  let evt = req.body;
  let lifecycle = evt.lifecycle;
  let res;

  console.log(`${lifecycle} lifecycle. Request body:`);
  console.log(prettyjson.render(evt, prettyjsonOptions));

  switch(lifecycle) {
    // PING happens during app creation. Purpose is to verify app
    // is alive and is who it says it is.
    case 'PING': {
      let chal = evt.pingData.challenge;
      response.json({statusCode: 200, pingData: {challenge: chal}});
      break;
    }
    // CONFIGURATION happens as user begins to install the app.
    case 'CONFIGURATION': {
      res = stConfig.handle(evt.configurationData);
      console.log("CONFIGURATION response:");
      console.log(prettyjson.render({configurationData: res}, prettyjsonOptions));
      response.json({statusCode: 200, configurationData: res});
      break;
    }
    // INSTALL happens after a user finishes configuration, and installs the
    // app.
    case 'INSTALL': {
      let token = evt.installData.authToken;
      setBulbColor(evt.installData.installedApp, token);
      createSchedule(evt.installData.installedApp, token);

      response.json({statusCode: 200, installData: {}});
      break;
    }
    // UPDATE happens when a user updates the configuration of an
    // already-installed app.
    case 'UPDATE': {
      let token = evt.updateData.authToken;
      setBulbColor(evt.updateData.installedApp, token);
      createSchedule(evt.updateData.installedApp, token);
      response.json({statusCode: 200, updateData: {}});
      break;
    }
    // UNINSTALL happens when a user uninstalls the app.
    case 'UNINSTALL': {
      response.json({statusCode: 200, uninstallData: {}});
      break;
    }
    // EVENT happens when any subscribed-to event or schedule executes.
    case 'EVENT': {
      handleEvent(evt.eventData);
      response.json({statusCode: 200, eventData: {}});
      break;
    }
    default: {
      console.log(`Lifecycle ${lifecycle} not supported`);
    }
  }
}

/**
* Turns the configured bulb on and sets the color according to the current
* temperature and weather conditions.
*
* @param {Object} installedApp - The installed app
* @param {string} token - The OAuth2 token for this installed app
**/
function setBulbColor(installedApp, token) {
  const zipCode = installedApp.config.zipCode[0].stringConfig.value;
  const deviceId = installedApp.config.colorLight[0].deviceConfig.deviceId;
  const intervalSetting = installedApp.config.forecastInterval[0].stringConfig.value;
  console.log(`FORECAST INTERVAL SELECTED IS: ${intervalSetting}`);

  const chunks = stConfig.getForecastChunks(intervalSetting);

  weather.getForecast(zipCode)
  .then(function(forecast) {
    const color = weather.getColorForForecast(forecast, chunks);
    commands.actuate(deviceId, token, [
      {
        command: 'on',
        capability: 'switch',
        component: 'main',
        arguments: []
      },
      {
        command: 'setLevel',
        capability: 'switchLevel',
        component: 'main',
        arguments: [20]
      },
      {
        command: 'setColor',
        capability: 'colorControl',
        component: 'main',
        arguments: [color]
      }
    ])
    .then(function() {
      console.log('successfully sent device commands');
    })
    .catch(function(cmdErr) {
      console.error('Error executing command');
      console.error(prettyjson.render(cmdErr, prettyjsonOptions));
    })
  })
  .catch(function(weatherError) {
    console.error("Error getting current weather conditions:");
    console.error(prettyjson.render(weatherError, prettyjsonOptions));
  });
}

/**
 * Creates a recurring scheduled execution for this installed app.
 *
 * @param {Object} installedApp - the installedApp to create the schedule for.
 * @param {string} token - The OAuth2 token to create the schedule.
 */
function createSchedule(installedApp, token) {
  const scheduleSetting = installedApp.config.scheduleInterval[0].stringConfig.value;

  const scheduleInterval = stConfig.getScheduleInterval(scheduleSetting);
  console.log(`SCHEDULE INTERVAL SELECTED IS: ${scheduleInterval}`);

  scheduling.deleteSchedules(installedApp.installedAppId, stApi, token)
  .then(function(resp) {
    // since it's a recurring schedule, no need to get Location's timezone,
    // just use UTC
    scheduling.createCron(`0/${scheduleInterval} * * * ? *`, "UTC", installedApp.installedAppId,
      stApi, token)
      .then(function(resp) {
        console.log("Successfully created schedule:");
        console.log(prettyjson.render(resp, prettyjsonOptions));
      }).catch(function(createScheduleErr) {
        console.log("Error creating schedule:");
        console.log(prettyjson.render(createScheduleErr, prettyjsonOptions));
      })
  }).
  catch(function(deleteScheduleErr) {
    console.log("Error creating schedule:");
    console.log(prettyjson.render(deleteScheduleErr, prettyjsonOptions));
  });
}

/**
 * Handles incoming EVENT lifecycle requests.
 *
 * Updates the bulb's color based on the latest weather conditions.
 * @param {Object} eventData - The eventData associated with this event.
 */
function handleEvent(eventData) {
  const eventType = eventData.events[0].eventType;
  const token = eventData.authToken;
  if ("TIMER_EVENT" === eventType) {
    let timerEvent = eventData.events[0].timerEvent;
    console.log(`Received timer event for schedule ${timerEvent.name} at ${timerEvent.time}`);
    setBulbColor(eventData.installedApp, token);
  } else {
    console.error(`This app only expects TIMER_EVENTs. Got ${eventType}`)
  }
}

let server = app.listen(3005);

module.exports = server;
console.log('Open: http://127.0.0.1:3005');
