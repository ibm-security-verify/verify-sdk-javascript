# IBM Security Verify Adaptive Proxy SDK pour JavaScript

Le Proxy SDK pour JavaScript côté serveur [(Node](https://nodejs.org) ).
L'objectif de cette bibliothèque est de fournir une interface pour l'authentification des appareils, l'autorisation et l'évaluation des risques à l'aide de IBM Security Verify
d'authentification, d'autorisation et d'évaluation des risques à l'aide d' IBM Security Verify.

## Installation

Utilisez [npm](https://github.com/npm/cli) pour installer le Proxy SDK :

```bash
npm install @ibm-verify/adaptive-proxy
```
## Paramètres du proxy HTTP (facultatif)

Pour utiliser un proxy HTTP, vous devez définir des variables d'environnement dans un fichier `.env`. Le fichier `.env` doit contenir les paramètres suivants
paramètres :

| Paramètre | Type | Description |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PROXY_HOST` | `string` | Le nom d'hôte ou l'adresse IP du proxy. |
| `PROXY_SECURE` | `boolean` | Indicateur pour l'utilisation du protocole proxy http ou https.  La valeur par défaut est `false` (http). |
| `PROXY_PORT` | `integer` | Le port sur lequel le proxy écoute. |


## Paramètres de configuration

Pour utiliser le Proxy SDK, vous devez initialiser un objet `Adaptive` avec un objet de configuration
objet de configuration. L'objet de configuration doit contenir les
paramètres suivants :

| Paramètre | Type | Description |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tenantUrl` | `string` | L' URL base de votre [IBM Security Verify Tenant](https://iamdevportal.us-east.mybluemix.net/verify/javascript/civ-getting-started/configuring-your-ci-tenant) |
| `clientId` | `string` | L'identifiant de votre application Security Verify  |
| `clientSecret` | `string` | Le secret de votre application Security Verify  |

Voir [Initialiser un objet adaptatif](#initialise-an-adaptive-object) pour un
exemple.

## Objet contextuel

Un appel à chaque fonction de ce SDK nécessite un objet de contexte en tant que
paramètre. Cet objet contextuel contient des informations sur l'agent
user-agent à l'origine de la demande, comme un identifiant de session.
Ces informations relatives au dispositif seront utilisées pour évaluer le risque lors de chaque demande
chaque demande.

L'objet contextuel doit contenir les paramètres suivants :

| Paramètre | Type | Description |
| ----------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sessionId` | `string` | L'identifiant de session généré par l'agent utilisateur, à l'aide d'un SDK client adaptatif. |
| `userAgent` | `string` | L'agent utilisateur, généralement obtenu à partir de l'en-tête HTTP User-Agent. |
| `ipAddress` | `string` | L'adresse IP de l'agent utilisateur. |
| `[evaluationContext="login"]` | `string` | L'étape du user-agent pour laquelle une évaluation doit être effectuée. (Utilisé pour l'évaluation continue dans l'ensemble de l'agent utilisateur) Différentes "étapes" ou "contextes" donneront lieu à des résultats d'évaluation différents, tels que configurés dans les sous-politiques de la politique de l'application locataire. Les options possibles sont `"login"` (par défaut), `"landing"`, `"profile"`, `"resume"`, `"highassurance"`, `"other"`. |

## Présentation
### [`class Adaptive(config, [transactionFunctions])`](#initialise-an-adaptive-object)
| Fonction | Asynchrone | Renvoyer |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------------- |
| [`assessPolicy(context)`](#assess-a-policy) | ✅ | `Promise<Object>` |
| [`lookupIdentitySources(context, transactionId, [sourceName]`](#lookup-identity-sources) | ✅ | `Promise<Object>` |
| [`evaluatePassword(context, transactionId, identitySourceId, username, password)`](#evaluate-a-password-verification) | ✅ | `Promise<Object>` |
| [`generateFIDO(context, transactionId, relyingPartyId, userId)`](#generate-a-fido-verification) | ✅ | `Promise<Object>` |
| [`evaluateFIDO(context, transactionId, relyingPartyId, authenticatorData, userHandle, signature, clientDataJSON)`](#evaluate-a-fido-verification) | ✅ | `Promise<Object>` |
| [`generateQR(context, transactionId, profileId)`](#generate-a-qr-login-verification) | ✅ | `Promise<Object>` |
| [`evaluateQR(context, transactionId)`](#evaluate-a-qr-login-verification) | ✅ | `Promise<Object>` |
| [`generateEmailOTP(context, transactionId, enrollmentId)`](#generate-an-email-otp-verification) | ✅ | `Promise<Object>` |
| [`generateSMSOTP(context, transactionId, enrollmentId)`](#generate-an-sms-otp-verification) | ✅ | `Promise<Object>` |
| [`generateVoiceOTP(context, transactionId, enrollmentId)`](#generate-a-voice-otp-verification) | ✅ | `Promise<Object>` |
| [`evaluateTOTP(context, transactionId, enrollmentId, otp)`](#evaluate-a-totp-verification) | ✅ | `Promise<Object>` |
| [`evaluateEmailOTP(context, transactionId, otp)`](#evaluate-an-email-otp-verification) | ✅ | `Promise<Object>` |
| [`evaluateSMSOTP(context, transactionId, otp)`](#evaluate-an-sms-otp-verification) | ✅ | `Promise<Object>` |
| [`evaluateVoiceOTP(context, transactionId, otp)`](#evaluate-a-voice-otp-verification) | ✅ | `Promise<Object>` |
| [`generateQuestions(context, transactionId, enrollmentId)`](#generate-a-knowledge-questions-verification) | ✅ | `Promise<Object>` |
| [`evaluateQuestions(context, transactionId, questions)`](#evaluate-a-knowledge-questions-verification) | ✅ | `Promise<Object>` |
| [`generatePush(context, transactionId, enrollmentId, authenticatorId, message, pushNotificationTitle, pushNotificationMessage, additionalData)`](#generate-a-push-notification-verification) | ✅ | `Promise<Object>` |
| [`evaluatePush(context, transactionId)`](#evaluate-a-push-notification-verification) | ✅ | `Promise<Object>` |
| [`getToken(transactionId)`](#get-access-token-for-a-transaction) |       | `String` |
| [`logout(accessToken)`](#logout) | ✅ | `undefined` |
| [`refresh(context, refreshToken)`](#refresh) | ✅ | `Promise<Object>` |
| [`introspect(token, [tokenTypeHint])`](#introspect) | ✅ | `Promise<Object>` |
| [`introspectMiddleware([config])`](#introspect-middleware) | ✅ | `Function` |

## Utilisation

### Importer le Proxy SDK

```javascript
const Adaptive = require('@ibm-verify/adaptive-proxy');
```

### Initialiser un objet adaptatif

```javascript
const config = {
  tenantUrl: 'https://mytenant.ibmcloudsecurity.com',
  clientId: 'e957e707-c032-4076-98cc-3dcf24db8aed',
  clientSecret: '05UXCBaJgL',
};

const adaptive = new Adaptive(config);
```

#### Stockage personnalisé des transactions

Vous pouvez également transmettre un objet `transactionFunctions` à l'initialisation d'Adaptive, comme indiqué ci-dessous.

```javascript
const config = {
  tenantUrl: 'https://mytenant.ibmcloudsecurity.com',
  clientId: 'e957e707-c032-4076-98cc-3dcf24db8aed',
  clientSecret: '05UXCBaJgL',
};

const transactionFunctions = {
  createTransaction: myCreateTransactionFunction,
  getTransaction: myGetTransactionFunction,
  updateTransaction: myUpdateTransactionFunction,
  deleteTransaction: myDeleteTransactionFunction
};

const adaptive = new Adaptive(config, transactionFunctions);
```

Ce paramètre est facultatif, au cas où vous souhaiteriez gérer le stockage, l'extraction, la mise à jour et la suppression des transactions créées pendant le flux A2 dans une base de données externe. Dans le cas contraire, une option en mémoire par défaut est utilisée pour gérer les transactions.

S'il est spécifié, cet objet doit contenir quatre paramètres :
* `createTransaction`
   * La fonction utilisée pour créer (stocker) une transaction. Cette fonction doit prendre un paramètre : une transaction `Object`. Il doit stocker l'objet dans une base de données de son choix, indexée par un UUID v4 généré de manière aléatoire (c'est-à-dire l'identifiant de la transaction). Après avoir stocké l'objet de transaction associé à un identifiant de transaction, la fonction doit renvoyer l'identifiant de transaction sous la forme d'une adresse `string`.
* `getTransaction`
   * La fonction utilisée pour récupérer les transactions stockées. Cette fonction ne doit prendre qu'un seul paramètre : l'identifiant de la transaction `string`. Elle doit renvoyer la transaction `Object` associée à l'identifiant de transaction donné.
* `updateTransaction`
   * La fonction utilisée pour mettre à jour (c'est-à-dire ajouter des propriétés supplémentaires) une transaction existante. Cette fonction doit prendre deux paramètres (dans l'ordre): un ID de transaction `string` de la transaction à mettre à jour, et un `Object` de propriétés supplémentaires à ajouter à la transaction. Cette fonction ne doit rien renvoyer.
   * Par exemple, si la transaction existante est
      ```javascript
      {
        "userId": "123456"
      }
      ```
      et l'objet transmis à cette fonction est
      ```javascript
      {
        "name": "John"
      }
      ```
      l'opération mise à jour devrait se traduire par
      ```javascript
      {
        "userId": "123456",
        "name": "John"
      }
      ```
* `deleteTransaction`
   * Fonction utilisée pour supprimer une transaction existante. Cette fonction ne doit prendre qu'un seul paramètre : l'identifiant de la transaction `string`. La fonction doit supprimer de la base de données la transaction associée à l'identifiant de transaction donné. Cette fonction ne doit rien renvoyer.

Le mécanisme de stockage que vous avez choisi devrait idéalement avoir une durée de vie pour les transactions (par exemple, 1 heure), afin d'éviter l'accumulation de transactions inutilisées ou inachevées.

### Évaluer une politique

Effectue la demande de subvention initiale auprès de l'OIDC. L'évaluation des risques de la politique sera effectuée, ce qui donnera lieu à une réponse de type `deny` ou `requires`.

#### `assessPolicy(context)`

| Paramètre | Type | Description |
| --------- | -------- | -------------------------------------- |
| `context` | `Object` | Voir [objet contextuel](#context-object). |

#### Réponses

* Une réponse `deny` est reçue lorsque l'évaluation de la politique échoue.
   ```javascript
   {
     "status": "deny"
   }
   ```

* Une réponse `requires` contiendra un tableau de facteurs autorisés, indiquant qu'une vérification supplémentaire est nécessaire (c'est-à-dire que la vérification du premier facteur doit être effectuée)
   qu'une vérification supplémentaire est nécessaire (c'est-à-dire que la vérification du premier facteur doit être effectuée) pour recevoir un jeton
   doit être effectuée) pour recevoir un jeton. Les options possibles pour le premier facteur sont `"qr"`,
   `"fido"` et `"password"`. Vous pouvez utiliser le
   [`generateQR`](#generate-a-qr-login-verification),
   [`generateFIDO`](#generate-a-fido-verification) et
   [`evaluatePassword`](#evaluate-a-password-verification)
   respectivement pour initier ces premiers facteurs. Un identifiant de transaction sera également renvoyé, qui sera utilisé pour associer les demandes ultérieures à cette subvention initiale.
   ```javascript
   {
     "status": "requires",
     "transactionId": "36a101c7-7426-4f45-ab3c-55f8dc075c6e",
     "allowedFactors": ["qr", "fido", "password"]
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.assessPolicy(context)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Consultation des sources d'identité

Recherche de sources d'identité par nom.  Si le nom n'est pas défini, il renvoie toutes les sources compatibles avec le mot de passe.

#### `lookupIdentitySources(context, transactionId, [sourceName])`

| Paramètre | Type | Description |
| --------------- | -------- | ------------------------------------------------------------------ |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |
| `[sourceName]` | `string` | (Facultatif) nom de la source d'identité, par exemple "Cloud Directory". |

#### Réponse

* Une réponse contenant un tableau d'objets source d'identité :
   ```javascript
    [
      {
        "name": "Cloud Directory",
        "location": "https://<tenant_url>/v1.0/authnmethods/password/11111111-2222-3333-4444-555555555555",
        "id": "11111111-2222-3333-4444-555555555555",
        "type": "ibmldap"
      }
    ]
   ```

#### Exemple de syntaxe

```javascript
let identitySourceId
adaptive.lookupIdentitySources(context, transactionId, "Cloud Directory")
    .then((result) => {
      identitySourceId = result[0].id;
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Évaluer la vérification d'un mot de passe

Tentative de vérification du mot de passe à l'aide du premier facteur après
avoir reçu un statut `requires` de la part de [`assessPolicy`](#assess-a-policy). Il en résultera une réponse de type `allow`, `deny` ou `requires`.

#### `evaluatePassword(context, transactionId, identitySourceId, username, password)`

| Paramètre | Type | Description |
| ------------------ | -------- | -------------------------------------------------------------------------------- |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |
| `identitySourceId` | `string` | L'identifiant de la source d'identité associée à l'enregistrement du mot de passe. |
| `username` | `string` | Le nom d'utilisateur à utiliser pour l'authentification. |
| `password` | `string` | Le mot de passe à utiliser pour l'authentification. |

#### Réponses

* Une réponse `allow` contiendra un jeton permettant d'accéder à l'API.
   ```javascript
   {
     "status": "allow",
     "token": {
       "access_token": "zscmjBdvIjudOPLhpbmJi6nBRJg7cZ6WY0Udw1nC",
       "refresh_token": "wFTjurPxTvRD1cW09itgQM83XwCm1UKwsxhVFb1H7HJh8JkwZz",
       "scope": "openid",
       "grant_id": "a0b440b6-fefb-46ea-a603-e1040534cd28",
       "id_token": "eyJhbGciOiJSUzI1NiIsInR5cC...5j_rMn7H3ZpE4axt0WvsYu4jbA",
       "token_type": "Bearer",
       "expires_in": 7120
     }
   }
   ```

* Une réponse `deny` est reçue lorsque la politique refuse l'accès ou que l'évaluation de la politique échoue.  Si des informations d'erreur sont disponibles, elles seront renvoyées dans un attribut details.
   ```javascript
   {
     "status": "deny"
     "detail": {
        "error": "adaptive_more_info_required",
        "error_description": "CSIAQ0298E Adaptive access..."
     }
   }
   ```

* Une réponse `requires` contiendra un tableau des inscriptions d'authentification autorisées, indiquant qu'une vérification supplémentaire est requise (c'est-à-dire un deuxième facteur)
   autorisés, indiquant qu'une vérification supplémentaire est nécessaire (c'est-à-dire qu'une
   doit être effectuée) pour recevoir un jeton. Les inscriptions multi-facteurs possibles
   sont `"emailotp"`, `"smsotp"`, `"voiceotp"`, `"totp"`, `"questions"`, `"push"` et `"fido"`.
   Vous pouvez utiliser le
   [`generateEmailOTP`](#generate-an-email-otp-verification),
   [`generateSMSOTP`](#generate-an-sms-otp-verification),
   [`generateVoiceOTP`](#generate-a-voice-otp-verification),
   [`evaluateTOTP`](#evaluate-a-totp-verification),
   [`generateQuestions`](#generate-a-knowledge-questions-verification), [`generatePush`](#generate-a-push-verification),
   et [`generateFIDO`](#generate-a-fido-verification) respectivement pour
   effectuer ces vérifications 2FA. Vous pouvez utiliser n'importe laquelle des inscriptions renvoyées pour effectuer l'authentification à deuxième facteur. L'identifiant de la transaction initiale sera également
   retourné.
   ```javascript
   {
     "status": "requires",
     "transactionId": "36a101c7-7426-4f45-ab3c-55f8dc075c6e",
     "enrolledFactors": [
       {
         "id": "61e39f0a-836b-48fa-b4c9-cface6a3ef5a",
         "userId": "60300035KP",
         "type": "emailotp",
         "created": "2020-06-15T02:51:49.131Z",
         "updated": "2020-06-15T03:15:18.896Z",
         "attempted": "2020-07-16T04:30:14.066Z",
         "enabled": true,
         "validated": true,
         "attributes": {
           "emailAddress": "email@email.com"
         }
       }
     ]
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.evaluatePassword(context, transactionId, identitySourceId, username, password)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Générer une vérification FIDO

Lancer une vérification FIDO des premiers facteurs après avoir reçu un statut `requires`
de la part de [`assessPolicy`](#assess-a-policy) ou une vérification FIDO des seconds facteurs après avoir reçu un statut
la réception d'un statut `requires` de la part d'un achèvement du premier facteur
( [`evaluateQR`](#evaluate-a-qr-login-verification),
[`evaluatePassword`](#evaluate-a-password-verification) ou
[`evaluateFIDO`](#evaluate-a-fido-verification)). Cela renverra un défi FIDO
à renvoyer à l'utilisateur pour signature.

#### `generateFIDO(context, transactionId, relyingPartyId, userId)`

| Paramètre | Type | Description |
| ---------------- | -------- | -------------------------------------------------------------------------- |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |
| `relyingPartyId` | `string` | L'identifiant de la partie utilisatrice associé à l'enregistrement FIDO. |
| `userId` | `string` | L'identifiant de l'utilisateur OIDC pour lequel une vérification FIDO doit être lancée. |

#### Réponse

* La réponse contiendra un défi FIDO à signer par votre authentificateur,
   puis envoyé à [`evaluateFIDO`](#evaluate-a-fido-verification) pour
   l'achèvement. L'identifiant de la transaction initiale sera également renvoyé.
   ```javascript
   {
     "transactionId": "36a101c7-7426-4f45-ab3c-55f8dc075c6e",
     "fido": {
       "rpId": "fido.verify.ibm.com",
       "challenge": "Q29uZ3JhdHVsYXRpb25zIFlvdSBmb3VuZCBpdAo",
       "userVerification": "preferred",
       "timeout": 30000,
       "allowCredentials": [
         {
           "type": "public-key",
           "id": "SSBhbSBhIGNyZWRlbnRpYWwK"
         }
       ]
     }
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.generateFIDO(context, transactionId, relyingPartyId, userId)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Évaluer une vérification FIDO

Effectuer une vérification FIDO après avoir reçu et signé un défi FIDO
de la part de [`generateFIDO`](#generate-a-fido-verification). Cela se traduira par une réponse de type ,  ou
donnera lieu à une réponse de type `allow`, `deny` ou `requires`.

#### `evaluateFIDO(context, transactionId, relyingPartyId, authenticatorData, userHandle, signature, clientDataJSON)`

| Paramètre | Type | Description |
| ------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |
| `relyingPartyId` | `string` | L'identifiant de la partie utilisatrice associé à l'enregistrement FIDO. |
| `authenticatorData` | `string` | Informations sur l'authentification produite par l'authentificateur. |
| `userHandle` | `string` | L'identifiant de l'utilisateur qui possède cet authentificateur. |
| `signature` | `string` | Le défi FIDO reçu et signé de [`generateFIDO`](#generate-a-fido-verification). |
| `clientDataJSON` | `string` | L'objet JSON des données du client encodées en base64. |

#### Réponses

* Une réponse `allow` contiendra un jeton permettant d'accéder à l'API.
   ```javascript
   {
     "status": "allow",
     "token": {
       "access_token": "zscmjBdvIjudOPLhpbmJi6nBRJg7cZ6WY0Udw1nC",
       "refresh_token": "wFTjurPxTvRD1cW09itgQM83XwCm1UKwsxhVFb1H7HJh8JkwZz",
       "scope": "openid",
       "grant_id": "a0b440b6-fefb-46ea-a603-e1040534cd28",
       "id_token": "eyJhbGciOiJSUzI1NiIsInR5cC...5j_rMn7H3ZpE4axt0WvsYu4jbA",
       "token_type": "Bearer",
       "expires_in": 7120
     }
   }
   ```

* Une réponse `deny` est reçue lorsque la politique refuse l'accès ou que l'évaluation de la politique échoue.  Si des informations d'erreur sont disponibles, elles seront renvoyées dans un attribut details.
   ```javascript
   {
     "status": "deny"
     "detail": {
        "error": "adaptive_more_info_required",
        "error_description": "CSIAQ0298E Adaptive access..."
     }
   }
   ```

* Une réponse `requires` ne peut être reçue que lors de la vérification du premier facteur. Dans ce cas, la réponse contiendra un tableau des inscriptions d'authentification autorisées, indiquant qu'une vérification supplémentaire est nécessaire (c'est-à-dire un deuxième facteur)
   autorisés, indiquant qu'une vérification supplémentaire est nécessaire (c'est-à-dire qu'une
   doit être effectuée) pour recevoir un jeton. Les inscriptions multi-facteurs possibles
   sont `"emailotp"`, `"smsotp"`, `"voiceotp"`, `"totp"`, `"questions"`, `"push"` et `"fido"`.
   Vous pouvez utiliser le
   [`generateEmailOTP`](#generate-an-email-otp-verification),
   [`generateSMSOTP`](#generate-an-sms-otp-verification),
   [`generateVoiceOTP`](#generate-a-voice-otp-verification),
   [`evaluateTOTP`](#evaluate-a-totp-verification),
   [`generateQuestions`](#generate-a-knowledge-questions-verification), [`generatePush`](#generate-a-push-verification),
   et [`generateFIDO`](#generate-a-fido-verification) respectivement pour
   effectuer ces vérifications 2FA. Vous pouvez utiliser n'importe laquelle des inscriptions renvoyées pour effectuer l'authentification à deuxième facteur. L'identifiant de la transaction initiale sera également
   retourné.
   ```javascript
   {
     "status": "requires",
     "transactionId": "36a101c7-7426-4f45-ab3c-55f8dc075c6e",
     "enrolledFactors": [
       {
         "id": "61e39f0a-836b-48fa-b4c9-cface6a3ef5a",
         "userId": "60300035KP",
         "type": "emailotp",
         "created": "2020-06-15T02:51:49.131Z",
         "updated": "2020-06-15T03:15:18.896Z",
         "attempted": "2020-07-16T04:30:14.066Z",
         "enabled": true,
         "validated": true,
         "attributes": {
           "emailAddress": "email@email.com"
         }
       }
     ]
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.evaluateFIDO(context, transactionId, relyingPartyId, authenticatorData, userHandle, signature, clientDataJSON)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Générer un QR de vérification de connexion

Lancer une vérification à première vue de la connexion QR après avoir reçu un message d'alerte `requires`
statut de [`assessPolicy`](#assess-a-policy). Cela renverra un code de connexion QR
à renvoyer à l'utilisateur pour qu'il le scanne.

#### `generateQR(context, transactionId, profileId)`

| Paramètre | Type | Description |
| --------------- | -------- | ------------------------------------------------------------------ |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |
| `profileId` | `string` | Identifiant d'un profil d'enregistrement IBM Verify. |

#### Réponse

* La réponse contiendra un code de connexion QR à scanner par votre authentificateur. Lors de l'analyse, l'authentificateur doit envoyer une demande à [`evaluateQR`](#evaluate-a-qr-login-verification) pour
   l'achèvement. L'identifiant de la transaction initiale sera également renvoyé.
   ```javascript
   {
     "transactionId": "36a101c7-7426-4f45-ab3c-55f8dc075c6e",
     "qr": {
       "code": "iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABR..."
     }
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.generateQR(context, transactionId, profileId)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Évaluer la vérification d'une connexion QR

Effectuer une vérification du premier facteur après avoir reçu et scanné un code de connexion QR
de la part de [`generateQR`](#generate-a-qr-login-verification).
Il en résultera une réponse de type `pending`, `timeout`, `error`, `allow`, `deny`, ou `requires`.

#### `evaluateQR(context, transactionId)`

| Paramètre | Type | Description |
| --------------- | -------- | ------------------------------------------------------------------ |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |

#### Réponses

* Une réponse `pending` indique que la transaction par code QR n'a pas encore été effectuée.
   ```javascript
   {
     "status": "pending",
     "expiry": "2021-04-26T12:06:06.501Z"
   }
   ```
* Une réponse `timeout` indique que la transaction du code QR a expiré.
   ```javascript
   {
     "status": "timeout",
     "expiry": "2021-04-26T12:06:06.501Z"
   }
   ```

* Une réponse `error` indique une erreur dans l'interrogation de la transaction du code QR.
   ```javascript
   {
     "status": "error"
   }
   ```

* Une réponse `allow` contiendra un jeton permettant d'accéder à l'API.
   ```javascript
   {
     "status": "allow",
     "token": {
       "access_token": "zscmjBdvIjudOPLhpbmJi6nBRJg7cZ6WY0Udw1nC",
       "refresh_token": "wFTjurPxTvRD1cW09itgQM83XwCm1UKwsxhVFb1H7HJh8JkwZz",
       "scope": "openid",
       "grant_id": "a0b440b6-fefb-46ea-a603-e1040534cd28",
       "id_token": "eyJhbGciOiJSUzI1NiIsInR5cC...5j_rMn7H3ZpE4axt0WvsYu4jbA",
       "token_type": "Bearer",
       "expires_in": 7120
     }
   }
   ```

* Une réponse `deny` est reçue lorsque la politique refuse l'accès ou que l'évaluation de la politique échoue.  Si des informations d'erreur sont disponibles, elles seront renvoyées dans un attribut details.
   ```javascript
   {
     "status": "deny"
     "detail": {
        "error": "adaptive_more_info_required",
        "error_description": "CSIAQ0298E Adaptive access..."
     }
   }
   ```

* Une réponse `requires` contiendra un tableau des inscriptions d'authentification autorisées, indiquant qu'une vérification supplémentaire est requise (c'est-à-dire un deuxième facteur)
   autorisés, indiquant qu'une vérification supplémentaire est nécessaire (c'est-à-dire qu'une
   doit être effectuée) pour recevoir un jeton. Les inscriptions multi-facteurs possibles
   sont `"emailotp"`, `"smsotp"`, `"voiceotp"`, `"totp"`, `"questions"`, `"push"` et `"fido"`.
   Vous pouvez utiliser le
   [`generateEmailOTP`](#generate-an-email-otp-verification),
   [`generateSMSOTP`](#generate-an-sms-otp-verification),
   [`generateVoiceOTP`](#generate-a-voice-otp-verification),
   [`evaluateTOTP`](#evaluate-a-totp-verification),
   [`generateQuestions`](#generate-a-knowledge-questions-verification), [`generatePush`](#generate-a-push-verification),
   et [`generateFIDO`](#generate-a-fido-verification) respectivement pour
   effectuer ces vérifications 2FA. Vous pouvez utiliser n'importe laquelle des inscriptions renvoyées pour effectuer l'authentification à deuxième facteur. L'identifiant de la transaction initiale sera également
   retourné.
   ```javascript
   {
     "status": "requires",
     "transactionId": "36a101c7-7426-4f45-ab3c-55f8dc075c6e",
     "enrolledFactors": [
       {
         "id": "61e39f0a-836b-48fa-b4c9-cface6a3ef5a",
         "userId": "60300035KP",
         "type": "emailotp",
         "created": "2020-06-15T02:51:49.131Z",
         "updated": "2020-06-15T03:15:18.896Z",
         "attempted": "2020-07-16T04:30:14.066Z",
         "enabled": true,
         "validated": true,
         "attributes": {
           "emailAddress": "email@email.com"
         }
       }
     ]
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.evaluateQR(context, transactionId)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Générer un courriel de vérification OTP

Demander une vérification multifactorielle OTP par courrier électronique après avoir reçu un message d'alerte `requires`
à partir de l'achèvement d'un premier facteur
( [`evaluateQR`](#evaluate-a-qr-login-verification),
[`evaluatePassword`](#evaluate-a-password-verification) ou
[`evaluateFIDO`](#evaluate-a-fido-verification)). Cela enverra un
OTP à l'adresse électronique enregistrée de l'utilisateur et renvoie une corrélation à quatre chiffres associée à la vérification
associé à la vérification. Cette corrélation sera préfixée
au mot de passe à usage unique dans le SMS à envoyer.

#### `generateEmailOTP(context, transactionId, enrollmentId)`

| Paramètre | Type | Description |
| --------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`evaluatePolicy`](#evaluate-a-policy). |
| `enrollmentId` | `string` | L'identifiant de l'inscription OTP par courriel, reçu dans une réponse `requires` après une tentative de premier facteur. |

#### Exemple de syntaxe

```javascript
adaptive.generateEmailOTP(context, transactionId, enrollmentId)
    .then((result) =>{
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Générer un SMS de vérification OTP

Demander une vérification multifactorielle par SMS OTP après avoir reçu un statut `requires`
à la suite de l'achèvement d'un premier facteur
( [`evaluateQR`](#evaluate-a-qr-login-verification),
[`evaluatePassword`](#evaluate-a-password-verification) ou
[`evaluateFIDO`](#evaluate-a-fido-verification)). Cela enverra un
OTP au numéro de téléphone de l'utilisateur et renvoie une corrélation à quatre chiffres
associée à la vérification. Cette corrélation sera préfixée au mot de passe à usage unique dans le SMS à envoyer
mot de passe à usage unique dans le SMS à envoyer.

#### `generateSMSOTP(context, transactionId, enrollmentId)`

| Paramètre | Type | Description |
| --------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assess`](#assess-a-policy). |
| `enrollmentId` | `string` | L'identifiant de l'inscription OTP par SMS, reçu dans une réponse `requires` après une tentative de premier facteur. |

#### Exemple de syntaxe

```javascript
adaptive.generateSMSOTP(context, transactionId, enrollmentId)
    .then((result) =>{
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Évaluer une vérification TOTP

Vérifier une vérification TOTP à deuxième facteur après avoir reçu un
`requires` statut après une tentative de premier facteur
( [`evaluateQR`](#evaluate-a-qr-login-verification),
[`evaluatePassword`](#evaluate-a-password-verification) ou
[`evaluateFIDO`](#evaluate-a-fido-verification)). Si la vérification est réussie, la réponse sera `allow`.

#### `evaluateTOTP(context, transactionId, enrollmentId, otp)`

| Paramètre | Type | Description |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |
| `enrollmentId` | `string` | L'identifiant de l'inscription TOTP, reçu dans une réponse `requires` après une tentative de premier facteur. |
| `otp` | `string` | Le TOTP à vérifier. |

#### Réponses

* Une réponse `allow` contiendra un jeton permettant d'accéder à l'API.
   ```javascript
   {
     "status": "allow",
     "token": {
       "access_token": "zscmjBdvIjudOPLhpbmJi6nBRJg7cZ6WY0Udw1nC",
       "refresh_token": "wFTjurPxTvRD1cW09itgQM83XwCm1UKwsxhVFb1H7HJh8JkwZz",
       "scope": "openid",
       "grant_id": "a0b440b6-fefb-46ea-a603-e1040534cd28",
       "id_token": "eyJhbGciOiJSUzI1NiIsInR5cC...5j_rMn7H3ZpE4axt0WvsYu4jbA",
       "token_type": "Bearer",
       "expires_in": 7120
     }
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.evaluateTOTP(context, transactionId, enrollmentId, otp)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Évaluer une vérification OTP par courriel

Vérifier un OTP par courriel Vérification du second facteur après avoir reçu un OTP par courriel de la part de [`generateEmailOTP`](#generate-an-email-otp-verification). Si la vérification est réussie, la réponse sera `allow`.

#### `evaluateEmailOTP(context, transactionId, otp)`

| Paramètre | Type | Description |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |
| `otp` | `string` | L'OTP de l'email à vérifier. Cet OTP ne doit pas inclure le préfixe de corrélation (les quatre chiffres avant le tiret). |

#### Réponses

* Une réponse `allow` contiendra un jeton permettant d'accéder à l'API.
   ```javascript
   {
     "status": "allow",
     "token": {
       "access_token": "zscmjBdvIjudOPLhpbmJi6nBRJg7cZ6WY0Udw1nC",
       "refresh_token": "wFTjurPxTvRD1cW09itgQM83XwCm1UKwsxhVFb1H7HJh8JkwZz",
       "scope": "openid",
       "grant_id": "a0b440b6-fefb-46ea-a603-e1040534cd28",
       "id_token": "eyJhbGciOiJSUzI1NiIsInR5cC...5j_rMn7H3ZpE4axt0WvsYu4jbA",
       "token_type": "Bearer",
       "expires_in": 7120
     }
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.evaluateEmailOTP(context, transactionId, otp)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Évaluer une vérification OTP par SMS

Vérifier un SMS OTP vérification du second facteur après avoir reçu un SMS OTP de la part de [`generateSMSOTP`](#generate-an-sms-otp-verification). Si la vérification est réussie, la réponse sera `allow`.

#### `evaluateSMSOTP(transactionId, otp)`

| Paramètre | Type | Description |
| --------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |
| `otp` | `string` | Le SMS OTP à vérifier. Cet OTP ne doit pas inclure le préfixe de corrélation (les quatre chiffres avant le tiret). |

#### Réponses

* Une réponse `allow` contiendra un jeton permettant d'accéder à l'API.
   ```javascript
   {
     "status": "allow",
     "token": {
       "access_token": "zscmjBdvIjudOPLhpbmJi6nBRJg7cZ6WY0Udw1nC",
       "refresh_token": "wFTjurPxTvRD1cW09itgQM83XwCm1UKwsxhVFb1H7HJh8JkwZz",
       "scope": "openid",
       "grant_id": "a0b440b6-fefb-46ea-a603-e1040534cd28",
       "id_token": "eyJhbGciOiJSUzI1NiIsInR5cC...5j_rMn7H3ZpE4axt0WvsYu4jbA",
       "token_type": "Bearer",
       "expires_in": 7120
     }
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.evaluateSMSOTP(context, transactionId, otp)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Générer une vérification des questions de connaissance

Demander une vérification du second facteur après avoir reçu un message d'alerte
`requires` à partir d'un achèvement au premier facteur
( [`evaluateQR`](#evaluate-a-qr-login-verification),
[`evaluatePassword`](#evaluate-a-password-verification) ou
[`evaluateFIDO`](#evaluate-a-fido-verification)). Cela renverra un
des questions de connaissances de l'utilisateur auxquelles il faut répondre.

#### `generateQuestions(context, transactionId, enrollmentId)`

| Paramètre | Type | Description |
| --------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |
| `enrollmentId` | `string` | L'identifiant de l'inscription aux questions de connaissance, reçu dans une réponse `requires` après une tentative de premier facteur. |

#### Réponse

* La réponse contiendra une série de questions de connaissances auxquelles l'utilisateur devra répondre
   l'utilisateur, puis envoyées à
   [`evaluateQuestions`](#evaluate-a-knowledge-questions-verification) pour
   l'achèvement. L'identifiant de la transaction initiale sera également renvoyé.
   ```javascript
   {
     "transactionId": "36a101c7-7426-4f45-ab3c-55f8dc075c6e",
     "questions": [
       {
         "questionKey": "firstHouseStreet",
         "question": "What was the street name of the first house you ever lived in?"
       },
       {
         "questionKey": "bestFriend",
         "question": "What is the first name of your best friend?"
       },
       {
         "questionKey": "mothersMaidenName",
         "question": "What is your mothers maiden name?"
       }
     ]
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.generateQuestions(context, transactionId, enrollmentId)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Évaluer la vérification d'une question de connaissance

Vérifier une question de connaissance à l'aide d'un deuxième facteur après avoir reçu et répondu à une série de questions de connaissance de la part de l'utilisateur
répondre à un ensemble de questions de connaissance de la part de
[`generateQuestions`](#generate-a-knowledge-questions-verification).
Si la vérification est réussie, la réponse sera `allow`.

#### `evaluateQuestions(context, transactionId, questions)`

| Paramètre | Type | Description |
| ------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |
| `questions` | `Object[]` | Tableau d'objets contenant une clé de question (reçue de [`generateQuestions`](#generate-a-knowledge-questions-verification)) et la réponse correspondante à vérifier. |
| `questions[].questionKey` | `string` | L'identifiant de la question reçue de [`generateQuestions`](#generate-a-knowledge-questions-verification). |
| `questions[].answer` | `string` | Réponse à la question. |

#### Réponses

* Une réponse `allow` contiendra un jeton permettant d'accéder à l'API.
   ```javascript
   {
     "status": "allow",
     "token": {
       "access_token": "zscmjBdvIjudOPLhpbmJi6nBRJg7cZ6WY0Udw1nC",
       "refresh_token": "wFTjurPxTvRD1cW09itgQM83XwCm1UKwsxhVFb1H7HJh8JkwZz",
       "scope": "openid",
       "grant_id": "a0b440b6-fefb-46ea-a603-e1040534cd28",
       "id_token": "eyJhbGciOiJSUzI1NiIsInR5cC...5j_rMn7H3ZpE4axt0WvsYu4jbA",
       "token_type": "Bearer",
       "expires_in": 7120
     }
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.evaluateQuestions(context, transactionId, questions)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Générer une vérification de la notification push

Demander une notification push de vérification du second facteur après avoir reçu un message d'alerte
`requires` à partir d'un achèvement au premier facteur
( [`evaluateQR`](#evaluate-a-qr-login-verification),
[`evaluatePassword`](#evaluate-a-password-verification) ou
[`evaluateFIDO`](#evaluate-a-fido-verification)). Un code de corrélation associé à la transaction de vérification sera renvoyé.

#### `generatePush(context, transactionId, enrollmentId, authenticatorId, message, pushNotificationTitle, pushNotificationMessage, additionalData)`

| Paramètre | Type | Description |
| ------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |
| `enrollmentId` | `string` | L'identifiant de l'enrôlement de signature avec lequel la vérification de deuxième facteur doit être effectuée. |
| `authenticatorId` | `string` | L'identifiant de l'authentificateur appartenant à la signature. |
| `message` | `string` | Le message de vérification à afficher dans l'application. |
| `pushNotificationTitle` | `string` | Titre à afficher dans la bannière de la notification push. |
| `pushNotificationMessage` | `string` | Le message à afficher dans la bannière de notification push. |
| `additionalData` | `Object[]` | Un tableau d'objets contenant les attributs `"name"` et `"value"` à afficher dans l'application. |

#### Exemple de syntaxe

```javascript
adaptive.generatePush(context, transactionId, enrollmentId, authenticatorId, message, pushNotificationMessage, pushNotificationMessage, additionalData)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Évaluer la vérification d'une notification push

Vérifier une notification push vérification du second facteur après réception d'une notification push [`generatePush`](#generate-a-push-notification-verification). Si la vérification est réussie, la réponse sera `allow`.

#### `evaluatePush(context, transactionId)`

| Paramètre | Type | Description |
| --------------- | -------- | ------------------------------------------------------------------ |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |

#### Réponses

* Une réponse `pending` indique que la transaction n'a pas encore été effectuée.
   ```javascript
   {
     "status": "pending",
     "expiry": "2021-04-26T12:06:06.501Z",
     "pushState": "SUCCESS"
   }
   ```
* Une réponse `timeout` indique que la transaction a été interrompue.
   ```javascript
   {
     "status": "timeout",
     "expiry": "2021-04-26T12:06:06.501Z",
     "pushState": "SUCCESS"
   }
   ```

* Une réponse `error` indique une erreur dans l'interrogation de la transaction.
   ```javascript
   {
     "status": "error"
   }
   ```

* Une réponse `allow` contiendra un jeton permettant d'accéder à l'API.
   ```javascript
   {
     "status": "allow",
     "token": {
       "access_token": "zscmjBdvIjudOPLhpbmJi6nBRJg7cZ6WY0Udw1nC",
       "refresh_token": "wFTjurPxTvRD1cW09itgQM83XwCm1UKwsxhVFb1H7HJh8JkwZz",
       "scope": "openid",
       "grant_id": "a0b440b6-fefb-46ea-a603-e1040534cd28",
       "id_token": "eyJhbGciOiJSUzI1NiIsInR5cC...5j_rMn7H3ZpE4axt0WvsYu4jbA",
       "token_type": "Bearer",
       "expires_in": 7120
     }
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.evaluatePush(context, transactionId)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Obtenir un jeton d'accès pour une transaction

Obtenir le jeton d'accès associé à la transaction en cours.

#### `getToken(transactionId)`

| Paramètre | Type | Description |
| --------------- | -------- | ------------------------------------------------------------------ |
| `transactionId` | `string` | L'identifiant de la transaction reçu dans [`assessPolicy`](#assess-a-policy). |

#### Réponse
Une chaîne est renvoyée contenant le jeton d'accès associé à la transaction.

#### Exemple de syntaxe

```javascript
var txnAccessToken = adaptive.getToken(transactionId);
```

### Déconnexion

Termine la session de l'utilisateur.

#### `logout(accessToken)`

| Paramètre | Type | Description |
| ------------- | -------- | ------------------------------------------------------------------------------ |
| `accessToken` | `string` | Le jeton d'accès à révoquer, reçu après une tentative de deuxième facteur réussie. |

#### Exemple de syntaxe

```javascript
adaptive.logout(accessToken)
    .then(() =>{
      res.send(); // Nothing to return
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Actualiser

Lancer un flux OAuth Refresh pour obtenir des jetons mis à jour.

#### `refresh(context, refreshToken)`

| Paramètre | Type | Description |
| -------------- | -------- | --------------------------------------------------- |
| `context` | `Object` | Voir [objet contextuel](#context-object). |
| `refreshToken` | `string` | Le jeton de rafraîchissement avec lequel le jeton d'accès doit être actualisé. |

#### Réponses

* Une réponse `allow` contiendra un jeton permettant d'accéder à l'API, ainsi qu'un nouveau jeton de rafraîchissement.
   ```javascript
   {
     "status": "allow",
     "token": {
       "access_token": "zscmjBdvIjudOPLhpbmJi6nBRJg7cZ6WY0Udw1nC",
       "refresh_token": "wFTjurPxTvRD1cW09itgQM83XwCm1UKwsxhVFb1H7HJh8JkwZz",
       "scope": "openid",
       "grant_id": "a0b440b6-fefb-46ea-a603-e1040534cd28",
       "id_token": "eyJhbGciOiJSUzI1NiIsInR5cC...5j_rMn7H3ZpE4axt0WvsYu4jbA",
       "token_type": "Bearer",
       "expires_in": 7120
     }
   }
   ```

* Une réponse `deny` est reçue lorsque la politique refuse l'accès ou que l'évaluation de la politique échoue.  Si des informations d'erreur sont disponibles, elles seront renvoyées dans un attribut details.
   ```javascript
   {
     "status": "deny"
     "detail": {
        "error": "adaptive_more_info_required",
        "error_description": "CSIAQ0298E Adaptive access..."
     }
   }
   ```

* Une réponse `requires` contiendra un tableau des inscriptions d'authentification autorisées, indiquant qu'une vérification supplémentaire est requise (c'est-à-dire un deuxième facteur)
   autorisés, indiquant qu'une vérification supplémentaire est nécessaire (c'est-à-dire qu'une
   doit être effectuée) pour recevoir un jeton. Les inscriptions multi-facteurs possibles
   sont `"emailotp"`, `"smsotp"`, `"voiceotp"`, `"totp"`, `"questions"`, `"push"` et `"fido"`.
   Vous pouvez utiliser le
   [`generateEmailOTP`](#generate-an-email-otp-verification),
   [`generateSMSOTP`](#generate-an-sms-otp-verification),
   [`generateVoiceOTP`](#generate-a-voice-otp-verification),
   [`evaluateTOTP`](#evaluate-a-totp-verification),
   [`generateQuestions`](#generate-a-knowledge-questions-verification), [`generatePush`](#generate-a-push-verification),
   et [`generateFIDO`](#generate-a-fido-verification) respectivement pour
   effectuer ces vérifications 2FA. Vous pouvez utiliser n'importe laquelle des inscriptions renvoyées pour effectuer l'authentification à deuxième facteur. L'identifiant de la transaction initiale sera également
   retourné.
   ```javascript
   {
     "status": "requires",
     "transactionId": "36a101c7-7426-4f45-ab3c-55f8dc075c6e",
     "enrolledFactors": [
       {
         "id": "61e39f0a-836b-48fa-b4c9-cface6a3ef5a",
         "userId": "60300035KP",
         "type": "emailotp",
         "created": "2020-06-15T02:51:49.131Z",
         "updated": "2020-06-15T03:15:18.896Z",
         "attempted": "2020-07-16T04:30:14.066Z",
         "enabled": true,
         "validated": true,
         "attributes": {
           "emailAddress": "email@email.com"
         }
       }
     ]
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.refresh(context, refreshToken)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Procéder à l'introspection

Introspecter un jeton de rafraîchissement ou d'accès.

#### `introspect(token, [tokenTypeHint])`

| Paramètre | Type | Description |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `token` | `string` | Le rafraîchissement ou le jeton d'accès à l'introspection. |
| `[tokenTypeHint]` | `string` | Type de jeton. Cet attribut est un indice facultatif sur le jeton qui fait l'objet de l'introspection. Les valeurs possibles sont `access_token` et `refresh_token`. |

#### Réponses

* La réponse contiendra une propriété `active` qui indique si le jeton introspecté est valide ou non. D'autres propriétés seront également incluses lorsque le statut `active` est `true`.
   ```javascript
   {
     "at_hash": "SivVIXwh1lUxzFHqPAMxJQ",
     "ext": {
       "tenantId": "..."
     },
     "sub": "6040004OML",
     "realmName": "cloudIdentityRealm",
     "entitlements" : [
     ...
     ]
     "amr": [
       "emailotp",
       "password"
     ],
     "uniqueSecurityName": "6040004OML",
     "iss": "https://.../oidc/endpoint/default",
     "active": true,
     "preferred_username": "name",
     "token_type": "Bearer",
     "client_id": "57bd5573-73cf-48e5-a42c-656bd2d2ad06",
     "aud": "57bd5573-73cf-48e5-a42c-656bd2d2ad06",
     "acr": "urn:ibm:security:policy:id:331844",
     "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
     "restrictEntitlements": false,
     "scope": "openid",
     "grant_id": "393168ec-eb53-46b8-9957-64158719f075",
     "userType": "regular",
     "category": "application",
     "exp": 1598346175,
     "app_id": "2624486582876118578",
     "iat": 1598338975
   }
   ```

#### Exemple de syntaxe

```javascript
adaptive.introspect(token, tokenTypeHint)
    .then((result) => {
      res.send(result);
    }).catch((error) => {
      console.log(error);
      res.status(404).send({error: error.message});
    });
```

### Logiciel médiateur Introspect

Cette fonction renvoie une fonction d'intergiciel Express, dont la signature est `(req, res, next) => ()`. Cet intergiciel appellera la fonction [`introspect`](#introspect) sous le capot, et effectuera des vérifications supplémentaires basées sur l'objet de configuration. Si l'introspection des jetons réussit, l'intergiciel suivant sera appelé dans la pile. Si une erreur survient lors de l'introspection des jetons, elle sera transmise à la fonction `next()`. Vous pouvez écrire votre propre intergiciel de gestion d'erreur pour attraper l'erreur et la traiter en conséquence.

Le résultat d'une introspection réussie est mis en cache afin d'économiser les appels d'introspection coûteux pour les demandes suivantes.

#### `introspectMiddleware([config])`

| Paramètre | Type | Description |
| -------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `[config]` | `Object` | Les paramètres de configuration utilisés pour l'intergiciel d'introspection des jetons. |
| `[config.cacheMaxSize=0]` | `number` | La taille maximale du cache, c'est-à-dire le nombre maximal de réponses d'introspection de jetons réussies à mettre en cache. Si le cache est plein, le résultat de l'introspection le moins récemment utilisé sera supprimé. Une valeur de `0` signifie qu'il n'y a pas de taille maximale, c'est-à-dire l'infini. Cette valeur est ignorée après la première initialisation (c'est-à-dire après le premier appel à la fonction). La valeur par défaut est `0`. |
| `[config.cacheTTL=0]` | `number` | Durée (en secondes) de mise en cache d'un résultat d'introspection réussi. Si l'introspection du jeton est réussie, le résultat sera mis en cache pour la période de temps indiquée, afin d'éviter des appels d'introspection coûteux lors de chaque demande ultérieure. La valeur 0 permet de mettre en cache la réponse introspect pendant la durée de vie du jeton, comme indiqué dans la propriété `exp` de la réponse introspect. La valeur par défaut est `0`. |
| `[config.denyMFAChallenge=true]` | `boolean` | Un drapeau indiquant si une réponse de jeton introspectif avec un `scope` de `'mfa_challenge'` doit être refusée. Si `true`, les jetons avec `scope` ou `'mfa_challenge'` seront rejetés. Si `false`, les `scope` des jetons ne seront pas pris en compte. |

#### Exemple de syntaxe

```javascript
// Add the middleware so it's called at every request to a protected endpoint.
// Cache at most 50 successful introspection responses for 15 minutes each.
app.use('/protected', adaptive.introspectMiddleware({cacheMaxSize: 50, cacheTTL: 900, denyMFAChallenge: true}));

// Optionally define a custom error handler, so any errors thrown by previous middleware can be handled.
app.use((err, req, res, next) => {
  console.log(err.message);
  res.sendStatus(403);
});
```

## Démo

Une application Node.js de démonstration utilisant le Proxy SDK se trouve dans le dossier
 [demo](./demo).

## Documentation

La documentation HTML complète du Proxy SDK se trouve dans le dossier [docs](./docs)
dans le dossier docs.

<!-- v2.3.7 : caits-prod-app-gp_webui_20241231T140444-18_en_fr -->