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
| [Core](sdk/core) | The core component provides supporting functionality to other components, such as logging, abstract error structures and utility functions. |
| [Auth](sdk/auth) | The auth component is an OAuth/OIDC cllient that implements authorization requests based on [OAuth 2.0 Authorization Framework](https://www.ietf.org/rfc/rfc6749.txt). |
| [Privacy](sdk/privacy) | Fast, opinionated, simple privacy component that leverages the data privacy & consent engine on IBM Security Verify. |
| [Adaptive](sdk/adaptive) | The adaptive component provides device assessment.  Based on cloud risk policies, authentication and authorization challenages can be evaluated. |


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
]
```
