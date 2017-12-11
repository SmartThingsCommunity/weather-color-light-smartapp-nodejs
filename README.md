# SmartThings SmartApp: Set the color of a light based on the weather.

This is a sample WebHook automation SmartApp, that was used as the basis for a demo showcasing the use of the new SmartThings API.

This SmartApp showcases:

- App installation and configuration flow.
- HTTP Signature verification to ensure incoming requests are from SmartThings.
- Integrating with a third-party API (Weather API in this case).
- Actuating devices using the SmartThings API.
- Creating schedules and handling scheduled executions.

## Setup instructions

__NOTE: The purpose of this example is to showcase the code that powers SmartApps. The tooling to support the registration and installation of SmartApps is subject to change with the launch of the [Developer Workspace](https://smartthings.developer.samsung.com/develop/workspace/index.html) and future versions of the Samsung Connect app.__

### Prerequisites

- [Node.js](https://nodejs.org) and [npm](https://npmjs.com) installed (verified with npm version 4.0.5 and Node 7.4.0).
- [ngrok](https://ngrok.com/) installed to create a secure tunnel to create a globally available URL for fast testing.
- A [Samsung account](https://account.samsung.com/membership/index.do) and the SmartThings mobile application.
- A SmartThings-compatible color bulb, such as LIFX or Phillips Hue.

Example requests will be shown in [cURL](https://curl.haxx.se/).
You may use a different REST interface tool if you choose.

### Steps

1. Clone or download this repository.
2. Create a [personal access token](https://account.smartthings.com/create-token) with **all Installed Apps and Apps scopes selected**. Copy or store this token in a secure place.
3. Create an API key with [Open Weather Map](https://api.openweathermap.org) (free tier is fine), and store it in an enviornment variable named `WEATHER_API_KEY`.
4. Install the dependencies for this app: `npm install`.
5. Start the server: `npm start`.
6. Start ngrok (in another terminal window/tab): `ngrok http 3005`. Copy the `https:` URL to your clipboard.
7. Register your SmartApp ([API Docs](https://smartthings.developer.samsung.com/develop/api-ref/st-api.html#operation/createApp)). **NOTE: The app name must be globally unique.**:

  ```
  curl -X POST https://api.smartthings.com/v1/apps \
       -H "Authorization: Bearer YOUR-SMARTTHINGS-AUTH-TOKEN" \
       -H "Content-Type: application/json; charset=utf-8" \
       -d $'{"appName": "YOUR-GLOBALLY-UNIQUE-APP-NAME", "displayName": "Example Weather Color Light", "description": "Weather light", "appType": "WEBHOOK_SMART_APP", "webhookSmartApp": {"targetUrl": "YOUR-NGROK-HTTPS-URL"}}'
  ```

  Save the response somewhere.
8. Copy the public key you received in the response and replace the contents of the file `smartthings_rsa.pub` with it. Be sure to replace all `\n` and `\r\n` with actual line breaks.
9. Update the registered app OAuth (this defines the specific [permissions](https://smartthings.developer.samsung.com/develop/guides/smartapps/auth-and-permissions.html) your SmartApp may request). The `appId` can be found in the response when registering your SmartApp:
  ```
  curl -X "PUT" "https://api.smartthings.com/v1/apps/YOUR-APP-ID/oauth" \
       -H "Authorization: Bearer YOUR-SMARTTHINGS-AUTH-TOKEN" \
       -H "Content-Type: application/json; charset=utf-8" \
       -d $'{
    "scope": [
      "r:devices:*",
      "x:devices:*",
      "r:schedules",
      "w:schedules"
    ],
    "clientName": "Weather App OAuth Client"
  }'  
  ```
10. Stop the server: `CTRL-C`.
11. Start the server again: `npm start` (this ensures the public key will be used to verify requests from SmartThings).
12. Install the SmartApp in the SmartThings mobile app (go to Marketplace->SmartApps->My Apps->Example Weather Color Light.
13. Enter all required inputs on the configuration screens.
14. Once installed, the configured bulb should turn on and its color should either be purple (if precipitation is in the forecast), orange (if the forecast calls for temperatures above 80 degrees Fahrenheit), blue (if the forecast calls for temperatures below 50 degrees Fahrenheit), or white (if no precipitation and temperature between 50 and 80 degrees Fahrenheit). It will check the current weather at the interval selected by the user during installation.

## Documentation

- Documentation for developing SmartApps can be found on the new [SmartThings developer portal](https://smartthings.developer.samsung.com/develop/guides/smartapps/basics.html).
- [SmartThings API reference documentation](https://smartthings.developer.samsung.com/develop/api-ref/st-api.html)

## Credits

The concept of a SmartThings-connected color bulb that changes its color based upon weather or other environmental data is not new or original to this example.
The [SmartThings Community](https://community.smartthings.com) has created several similar solutions, including:

- [Color Changing Smart Weather Lamp](https://community.smartthings.com/t/color-changing-smart-weather-lamp-app/12046)
- [ColorCast - Color Changing Weather Lamp](https://community.smartthings.com/t/colorcast-color-changing-weather-lamp/13874)
