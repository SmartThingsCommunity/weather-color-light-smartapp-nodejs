const rp = require('request-promise');
const prettyjson = require('prettyjson');
const prettyjsonOptions = {};

module.exports = {
  /**
   * Builds and returns a Bluebird Request Promise to create a
   * SmartThings cron schedule.
   *
   * @param {Object} cronExpression - A SmartThings cron expression that
   *    represents the recurring schedule to execute.
   * @param {string} installedAppId - The ID of the installed app.
   * @param {string} baseUrl - The Base SmartThings API URL.
   * @param {string} token - The OAuth2 token used to make the
   *    request. The token must have the required scopes to create the schedule.
   *
   * @returns {Promise} A request-promise for the request.
   */
  createCron: function(cronExpression, timeZone, installedAppId, baseUrl, token) {
    const path = `/installedapps/${installedAppId}/schedules`;
    const scheduleRequest = {
      once: null,
      name: 'weather-check-schedule',
      cron: {
        expression: cronExpression,
        timezone: timeZone
      }
    };
    const options = {
      url: `${baseUrl}${path}`,
      method: 'POST',
      json: true,
      body: scheduleRequest,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };
    console.log("Schedule request:");
    console.log(prettyjson.render(options, prettyjsonOptions));
    return rp(options);
  },

  /**
   * Builds and returns a Bluebird Request Promise to delete all schedules
   * for an installed app.
   *
   * @param {string} installedAppId - The ID of the installed app.
   * @param {string} baseUrl - The Base SmartThings API URL.
   * @param {string} token - The OAuth2 token used to make the
   *    request. The token must have the required scopes to delete the schedule.
   *
   * @returns {Promise} A request-promise for the request.
   */
  deleteSchedules: function(installedAppId, baseUrl, token) {
    const path = `/installedapps/${installedAppId}/schedules`;
    const options = {
      url: `${baseUrl}${path}`,
      method: 'DELETE',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };
    return rp(options);
  }
};
