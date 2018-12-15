/**
* Creates the app info for this installed app.
*/
function createConfigInitializeSetting() {
  return {
    name: 'Weather bulb color',
    description: 'Bulb color by current temp',
    id: 'app',
    firstPageId: '1'
  }
}

/**
* Creates the configuration page for end user to configure this installation.
* @param pageId name of page to send to user
* @param currentConfig the values of the currently set configurations by the user for the settings
*/
function createConfigPage(pageId, currentConfig) {
  if (pageId !== '1') {
    throw new Error(`Unsupported page name: ${pageId}`);
  }

  return {
    pageId: '1',
    name: 'Bulb color by temperature',
    nextPageId: null,
    previousPageId: null,
    complete: true,
    sections: [
      {
        name: 'For the temperature at this US zip code',
        settings: [
          {
            id: 'zipCode',
            name: 'What 5-digit US Zip Code?',
            description: 'Enter Zip Code',
            type: 'NUMBER',
            required: true
          },
          {
            id: "forecastInterval",
            name: "How many hours in the future to check?",
            description: "Tap to set",
            type: "ENUM",
            required: true,
            multiple: false,
            options: [
              {
                id: "forecast-hours-3",
                name: "3 Hours"
              },
              {
                id: "forecast-hours-6",
                name: "6 Hours"
              },
              {
                id: "forecast-hours-9",
                name: "9 Hours"
              },
              {
                id: "forecast-hours-12",
                name: "12 Hours"
              }
            ]
          },
          {
            id: "scheduleInterval",
            name: "How often to check forecast?",
            description: "Tap to set",
            type: "ENUM",
            required: true,
            multiple: false,
            options: [
              {
                id: "schedule-interval-15-minutes",
                name: "15 Minutes"
              },
              {
                id: "schedule-interval-30-minutes",
                name: "30 Minutes"
              },
              {
                id: "schedule-interval-45-minutes",
                name: "45 Minutes"
              },
              {
                id: "schedule-interval-60-minutes",
                name: "60 Minutes"
              }
            ]
          }
        ]
      },
      {
        name: 'Set the color of this light',
        settings: [
          {
            id: 'colorLight', // ID of this field
            name: 'Which color light?',
            description: 'Tap to set',
            type: 'DEVICE',
            required: true,
            multiple: false,
            capabilities: ['colorControl', 'switch', 'switchLevel'],
            permissions: ['r', 'x']
          }
        ]
      }
    ]
  };
}

module.exports = {
  /**
  * Creates the configuration required to install this app.
  * @param event - the event object.
  */
  handle: function(event) {
    if (!event.config) {
      throw new Error('No config section set in request.');
    }
    let config = {};
    const phase = event.phase;
    const pageId = event.pageId;
    const settings = event.config;
    switch (phase) {
      case 'INITIALIZE':
        config.initialize = createConfigInitializeSetting();
        break;
      case 'PAGE':
        config.page = createConfigPage(pageId, settings);
        break;
      default:
        throw new Error(`Unsupported config phase: ${phase}`);
        break;
    }
    return config;
  },

  /**
  * Gets the number of forecast chunks to retrieve from the weather API
  * @param intervalSetting - the selected interval from configuration
  * @return chunks - the number of forecast chunks to retrieve.
  */
  getForecastChunks: function(intervalSetting) {
    let chunks = null;
    switch(intervalSetting) {
      case 'forecast-hours-3': {
        chunks = 1;
        break;
      }
      case 'forecast-hours-6': {
        chunks = 2;
        break;
      }
      case 'forecast-hours-9': {
        chunks = 3;
        break;
      }
      case 'forecast-hours-12': {
        chunks = 4;
        break;
      }
      default: {
        chunks = 4;
        break;
      }
    }
    return chunks;
  },

  /**
  * Gets the number of minutes to check the forecast
  * @param selectedOption - the selected schedule interval from configuration
  * @return interval - the number of minutes for a scheduled execution
  */
  getScheduleInterval(selectedOption) {
    let interval = null;
    switch(selectedOption) {
      case 'schedule-interval-15-minutes': {
        interval = 15;
        break;
      }
      case 'schedule-interval-30-minutes': {
        interval = 30;
        break;
      }
      case 'schedule-interval-45-minutes': {
        interval = 45;
        break;
      }
      case 'schedule-interval-60-minutes': {
        interval = 60;
        break;
      }
      default: {
        interval = 60;
        break;
      }
    }
    return interval;
  }
};
