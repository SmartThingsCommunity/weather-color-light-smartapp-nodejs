const rp = require('request-promise');
const prettyjson = require('prettyjson');

const stApi = 'https://api.smartthings.com/v1';
const prettyjsonOptions = {};

module.exports = {
  /**
   * Builds and returns a Bluebird Request Promise to actuate a
   * SmartThings-connected device.
   *
   * @param {string} deviceId - the ID of the device to actuate.
   * @param {string} token - the Auth token to use for the request.
   * @param {Object[]} commands - The commands request body to send.
   *
   * @returns {Promise} A request-promise for the request.
   */
  actuate: function(deviceId, token, commands) {
    const path = `/devices/${deviceId}/commands`;
    const options = {
      url: `${stApi}${path}`,
      method: 'POST',
      json: true,
      body: commands,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };
    console.log("Device command request:");
    console.log(prettyjson.render(options, prettyjsonOptions));
    return rp(options);
  }
};
