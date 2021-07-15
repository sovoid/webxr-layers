# Project Setup

## Clone the repository and Install Dependencies
Simply clone the repository and install dependencies.

```
> git clone https://github.com/MLH-Fellowship/webxr-layers.git
> cd webxr-layers
> npm install
```

At this point, running `npm run dev` should have run the project. But, it would possibly give an error.
This is because of the snowpack configuration. In snowpack.config.js file, we can see inside 'devOptions', the secure flag is set to true. 

It is because to run a WebXR application in the browser, HTTPs is required.

## Configure HTTPs for localhost

We will configure HTTPs for localhost and for signing the SSL certificate, OpenSSL will be used.

### Install OpenSSL
- Download the OpenSSL. ([Download Link](https://slproweb.com/products/Win32OpenSSL.html))
- Install OpenSSL.
- Add it to the path in Environment Variables.

### Create SSL certificates

- In the project root directory, run `npx devcert-cli generate localhost`

This should generate two certificate files.

- Rename those files as snowpack.crt and snowpack.key
- Now run `npm run dev`
- Open https://localhost:8080 on your browser to see the project.

## Setup Browser Emulator

WebXR Browser Emulator can be used to run and test WebXR content in desktop browsers without using a real XR device.

- Update the Google Chrome Browser
- Install the Chrome Browser Extension ([Link](https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgeghkdijejnciaefnkjmkafnnje))
- Open the Project site or https://localhost:8080/ for our project.

In Developer Tools, there should be a new tab named 'Web XR'. 

- Clicking on that, the Device Emulator should be accessible.
