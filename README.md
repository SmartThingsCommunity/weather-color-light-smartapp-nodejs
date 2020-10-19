# SmartThings SmartApp: Set the color of a light based on the weather.

This sample WebHook SmartApp demonstrates the use of the new SmartThings API for Automation.

This WebHook SmartApp showcases:

- App installation and configuration flow.
- HTTP Signature verification to ensure that the incoming requests are from SmartThings.
- Integrating with a third-party API (Weather API in this case).
- Actuating devices using the SmartThings API.
- Creating schedules and handling scheduled executions.

## Setup instructions


### Prerequisites

- [Node.js](https://nodejs.org) and [npm](https://npmjs.com) installed (verified with npm version 6.14.8 and Node 12.19.0).
- [ngrok](https://ngrok.com/) installed to create a secure tunnel to create a globally available URL for fast testing.
- A [Samsung account](https://account.samsung.com/membership/index.do) and the SmartThings mobile application.
- A SmartThings-compatible color bulb, such as SYLVANIA Smart RGBW or LIFX, or Phillips Hue.
- Make sure you open an account (it is free) on [Developer Workspace](https://smartthings.developer.samsung.com/workspace/).

### Steps

1. Clone or download this repository.

1. Create an API key at [Open Weather Map](https://api.openweathermap.org) (free tier is fine). 

1. Create a `.env` and store your OpenWeather API key as shown in `.env.example` file.

1. Install the dependencies for this app: `npm install`.

1. Start the server: `npm start`.

1. Start ngrok (in another terminal window/tab): `ngrok http 3005`. Copy the `https:` URL to your clipboard.

1. At the [Developer Workspace](https://smartthings.developer.samsung.com/workspace) create an **Automation** project.
	- Register your Automation SmartApp as a WebHook with the `https:` previously copied.
	- From the scopes list, select the next ones:
		- `r:devices:*`
		- `x:devices:*`
	- Click **SAVE AND NEXT**.

1. A `CONFIRMATION request` log should show in the log output of the local server. Navigate to this link to register the app to receive events.

1. Click **Deploy to Test** in Developer Workspace App `Overview` to register your automation in self-publishing mode.

1. Install the SmartApp in the SmartThings mobile app after [enabling developer mode](https://smartthings.developer.samsung.com/docs/testing/how-to-test.html#Test-your-Automation).

1. Enter all required inputs on the configuration screens.

1. Once installed, the configured bulb will turn on and its color will either be purple (if precipitation is in the forecast), orange (if the forecast calls for temperatures above 80 degrees Fahrenheit), blue (if the forecast calls for temperatures below 50 degrees Fahrenheit), or white (if no precipitation and temperature between 50 and 80 degrees Fahrenheit). It will check the current weather at the interval set during installation.

## Troubleshooting

- When you try to install the SmartApp in the SmartThings mobile app if you get an error **Something went wrong. Please try to install the SmartApp again**, then it is possible that you did not navigate to the registration link as specified above. If this is the case, then in the npm server terminal you will also see an error. Make sure you navigate to the URL sent with the `CONFIRMATION request` to the npm server. This can be resent by navigating to Developer Workspace `Overview` and clicking `Verify App Registration`.

## Documentation

- Documentation for developing SmartApps can be found on the new [SmartThings developer portal](https://smartthings.developer.samsung.com/develop/guides/smartapps/basics.html).
- [SmartThings API reference documentation](https://smartthings.developer.samsung.com/develop/api-ref/st-api.html)

## Credits

The concept of a SmartThings-connected color bulb that changes its color based upon weather or other environmental data is not new or original to this example.
The [SmartThings Community](https://community.smartthings.com) has created several similar solutions, including:

- [Color Changing Smart Weather Lamp](https://community.smartthings.com/t/color-changing-smart-weather-lamp-app/12046)
- [ColorCast - Color Changing Weather Lamp](https://community.smartthings.com/t/colorcast-color-changing-weather-lamp/13874)
