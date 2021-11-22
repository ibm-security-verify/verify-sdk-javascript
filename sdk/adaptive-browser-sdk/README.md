![Type](https://img.shields.io/badge/Type-JavaScript-blue.svg)
![npm](https://img.shields.io/npm/v/adaptive-browser-sdk.svg?style=plastic)
![NPM](https://img.shields.io/npm/l/adaptive-browser-sdk.svg?colorB=blue&style=plastic)

# IBM Security Verify Adaptive Browser SDK

The purpose of the Browser SDK is to enable a developer to initiate a collection process, and verify the collected data. The collection process consists of the SDK collection device information, which will be assigned to a session identifier, and evaluated at later points in time. This SDK is to be used in conjunction with the Proxy SDK, which will be responsible for evaluating the session identifier during authentication.

## Prerequisites
- [Onboard your application](https://docs.verify.ibm.com/verify/docs/on-boarding-a-native-application).
- Configure and set up the Proxy SDK on your server. Check out the [Adding the proxy SDK to an application](https://docs.verify.ibm.com/verify/docs/developing-a-native-web-application#add-the-proxy-sdk-to-the-application) to get started.

##  Installation
After setting up the Proxy SDK on your server, you can install the IBM Security Verify Adaptive Browser SDK by cloning this repository, or installing from [npm](https://github.com/npm/cli). Check out the [Add the web SDK](https://docs.verify.ibm.com/verify/docs/developing-a-native-web-application#add-the-proxy-sdk-to-the-application) for a detailed guide.

```bash
npm install adaptive-browser-sdk
```

## Overview

| Function | Async | Return |
|----------------|-------|--------|
| [`startAdaptiveV1(host, snippetID)`](#start-the-collection-process) | ✅ | `undefined`
| [`getSessionId()`](#get-the-session-id-after-collection) | ✅ | `Promise<Object>`

## Usage

### Reference the Browser SDK in your application

```html
<script src="/static/adaptive-v1.js"></script>
```

Alternatively, the minified version:
```html
<script src="/static/adaptive-v1.min.js"></script>
```

### Start the collection process

Starts the Trusteer collection process. This will gather device information, and assign it to a session ID under the hood. To obtain this session ID, see [Get the session ID after collection](#get-the-session-id-after-collection).

#### `startAdaptiveV1(host, snippetID)`

| Parameter   | Type     | Description |
|-------------|----------|-------------|
| `host`      | `string` | The host of the Trusteer JavaScript snippet received during [application onboarding](https://docs.verify.ibm.com/verify/docs/on-boarding-a-native-application#enable-adaptive-sign-on).
| `snippetID` | `int` \| `string` | The Trusteer snippet ID received during [application onboarding](https://docs.verify.ibm.com/verify/docs/on-boarding-a-native-application#enable-adaptive-sign-on).

#### Example usage

```html
<script src="/static/adaptive-v1.js"></script>
<script>startAdaptiveV1('a1bcdefgh2ijkl.cloudfront.net', 123456);</script>
```

### Get the session ID after collection

Retrieves the session ID once the [collection process](#start-the-collection-process) has completed. This function returns a promise, which is fulfilled after the collection process completes.

Note; it is [`startAdaptiveV1(host, snippetID)`](#start-the-collection-process) that eventually fulfills the returned promise. Therefore, [`startAdaptiveV1(host, snippetID)`](#start-the-collection-process) must be called in order to resolve the returned promise.

#### `getSessionId()`


#### Example usage

```html
<script>
  getSessionId().then((sessionId) => {
    console.log(`Gathering has completed. Session ID received: ${sessionId}`);
  });
</script>
```