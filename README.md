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

- [Node.js](https://nodejs.org) and [npm](https://npmjs.com) installed (verified with npm version 4.0.5 and Node 7.4.0).
- [ngrok](https://ngrok.com/) installed to create a secure tunnel to create a globally available URL for fast testing.
- A [Samsung account](https://account.samsung.com/membership/index.do) and the SmartThings mobile application.
- A SmartThings-compatible color bulb, such as SYLVANIA Smart RGBW or LIFX, or Phillips Hue.
- Make sure you open an account (it is free) on [Developer Workspace](https://devworkspace.developer.samsung.com/smartthingsconsole/iotweb/site/index.html#/home).

### Steps

1. Clone or download this repository.

2. Create an API key with [Open Weather Map](https://api.openweathermap.org) (free tier is fine), and store it in an environment variable named `WEATHER_API_KEY`.

3. Install the dependencies for this app: `npm install`.

4. Start the server: `npm start`.

5. Start ngrok (in another terminal window/tab): `ngrok http 3005`. Copy the `https:` URL to your clipboard.

6. Go to the [Automation](https://devworkspace.developer.samsung.com/smartthingsconsole/iotweb/site/index.html#/development/automation) section of the Developer Workspace and create an Automation.
	- For the **SmartApp Type** select **WebHook endpoint** and enter the https URL you copied from the above step.
	- For the **Scopes**, click on the **Add** button and select the following scopes:
		- `r:devices:*`
		- `x:devices:*`
	- Click **SAVE AND NEXT**.
	- In the next screen you will be presented with the **Public Key**.

7. Copy this public key and replace the contents of the file `config/smartthings_rsa.pub` with it.

8. Click **CONFIRM** to register your automation in self-publishing mode.

9. Install the SmartApp in the SmartThings mobile app (go to Marketplace->SmartApps->My Apps->Example Weather Color Light.

10. Enter all required inputs on the configuration screens.

11. Once installed, the configured bulb will turn on and its color will either be purple (if precipitation is in the forecast), orange (if the forecast calls for temperatures above 80 degrees Fahrenheit), blue (if the forecast calls for temperatures below 50 degrees Fahrenheit), or white (if no precipitation and temperature between 50 and 80 degrees Fahrenheit). It will check the current weather at the interval set during installation.

## Troubleshooting

- When you try to install the SmartApp in the SmartThings mobile app if you get an error **Something went wrong. Please try to install the SmartApp again**, then it is possible that you did not restart the npm server as specified in Step 10 above. If this is the case, then in the npm server terminal you will also see this error: `forbidden - failed verifySignature`. Make sure you restart the npm server by doing Step 10 above.

## Documentation

- Documentation for developing SmartApps can be found on the new [SmartThings developer portal](https://smartthings.developer.samsung.com/develop/guides/smartapps/basics.html).
- [SmartThings API reference documentation](https://smartthings.developer.samsung.com/develop/api-ref/st-api.html)

## Credits

The concept of a SmartThings-connected color bulb that changes its color based upon weather or other environmental data is not new or original to this example.
The [SmartThings Community](https://community.smartthings.com) has created several similar solutions, including:

- [Color Changing Smart Weather Lamp](https://community.smartthings.com/t/color-changing-smart-weather-lamp-app/12046)
- [ColorCast - Color Changing Weather Lamp](https://community.smartthings.com/t/colorcast-color-changing-weather-lamp/13874)
