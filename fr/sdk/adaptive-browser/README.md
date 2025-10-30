![Type](https://img.shields.io/badge/Type-JavaScript-blue.svg)
![npm](https://img.shields.io/npm/v/adaptive-browser-sdk.svg?style=plastic)
![NPM](https://img.shields.io/npm/l/adaptive-browser-sdk.svg?colorB=blue&style=plastic)

# IBM Security Verify Adaptive Browser SDK (en anglais)

L'objectif du SDK du navigateur est de permettre à un développeur de lancer un processus de collecte et de vérifier les données collectées. Le processus de collecte consiste en la collecte par le SDK d'informations sur le dispositif, qui seront attribuées à un identifiant de session et évaluées ultérieurement. Ce SDK doit être utilisé conjointement avec le Proxy SDK, qui sera responsable de l'évaluation de l'identifiant de session lors de l'authentification.

## Prérequis
- [Embarquez votre application](https://docs.verify.ibm.com/verify/docs/on-boarding-a-native-application).
- Configurez et installez le Proxy SDK sur votre serveur. Pour commencer, consultez la page [Ajouter le SDK proxy à une application](https://docs.verify.ibm.com/verify/docs/developing-a-native-web-application#add-the-proxy-sdk-to-the-application).

## Installation
Après avoir configuré le Proxy SDK sur votre serveur, vous pouvez installer le SDK IBM Security Verify Adaptive Browser en clonant ce dépôt ou en l'installant à partir de [npm](https://github.com/npm/cli). Consultez le [SDK Add the web](https://docs.verify.ibm.com/verify/docs/developing-a-native-web-application#add-the-proxy-sdk-to-the-application) pour obtenir un guide détaillé.

```bash
npm install @ibm-verify/adaptive-browser
```

## Présentation

| Fonction | Asynchrone | Renvoyer |
|----------------|-------|--------|
| [`startAdaptiveV1(host, snippetID)`](#start-the-collection-process) | ✅ | `undefined` |
| [`getSessionId()`](#get-the-session-id-after-collection) | ✅ | `Promise<Object>` |

## Utilisation

### Référencez le SDK du navigateur dans votre application

```html
<script src="/static/adaptive-v1.js"></script>
```

Alternativement, la version minifiée :
```html
<script src="/static/adaptive-v1.min.js"></script>
```

### Lancer le processus de collecte

Lance le processus de collecte de Trusteer. Cela permet de collecter des informations sur l'appareil et de les attribuer à un identifiant de session sous le capot. Pour obtenir cet identifiant de session, voir [Obtenir l'identifiant de session après la collecte](#get-the-session-id-after-collection).

#### `startAdaptiveV1(host, snippetID)`

| Paramètre | Type | Description |
|-------------|----------|-------------|
| `host` | `string` | L'hôte de l'extrait JavaScript de Trusteer reçu lors de l'[inscription à l'application.](https://docs.verify.ibm.com/verify/docs/on-boarding-a-native-application#enable-adaptive-sign-on) |
| `snippetID` | `int` \| `string` | L'identifiant du snippet Trusteer reçu lors de l'[inscription à l'application.](https://docs.verify.ibm.com/verify/docs/on-boarding-a-native-application#enable-adaptive-sign-on) |

#### Utilisation d'exemple

```html
<script src="/static/adaptive-v1.js"></script>
<script>startAdaptiveV1('a1bcdefgh2ijkl.cloudfront.net', 123456);</script>
```

### Obtenir l'identifiant de session après la collecte

Récupère l'identifiant de la session une fois le [processus de collecte](#start-the-collection-process) terminé. Cette fonction renvoie une promesse, qui est tenue une fois le processus de collecte terminé.

Remarque : c'est [`startAdaptiveV1(host, snippetID)`](#start-the-collection-process) qui remplit finalement la promesse renvoyée. Par conséquent, [`startAdaptiveV1(host, snippetID)`](#start-the-collection-process) doit être appelé pour résoudre la promesse renvoyée.

#### `getSessionId()`


#### Utilisation d'exemple

```html
<script>
  getSessionId().then((sessionId) => {
    console.log(`Gathering has completed. Session ID received: ${sessionId}`);
  });
</script>
```

<!-- v2.3.7 : caits-prod-app-gp_webui_20241231T140459-5_en_fr -->