# IBM Security Verify SDK for Javascript

This repository is for active development of the IBM Security Verify SDK for Javascript.

## Getting started

For your convenience, each component is seperate for you to choose from instead of one large IBM Security Verify package.  To get started with a specific component, see the **README.md** file located in each of components project folder.

### Prerequisites

- Typescript v4.3.5
- To use the multi-factor component a valid IBM Security Verify tenant or IBM Security Verify Access is required.

### Components

Releases of all packages are available here: [Releases](https://github.ibm.com/ibm-security-verify/verify-sdk-javascript/releases)

The following components are currently offered in the package.
| Component | Description |
| ----------- | ----------- |



### Installation

[Node Package Manager](https://www.npmjs.com) is used for automating the distribution of components code:

```javascript
# npm - https://www.npmjs.com
npm i ibm-security-verify
```

then in the `dependencies` section of the your `package.json`, add one or more components to your, for example:

```javascript
"dependencies": {
    "ibm-security-verify": "1.^"
}
```
