# [botimize](http://botimize.io) - Analytics built to optimize your bots

[![build status](https://img.shields.io/travis/botimize/botimize-sdk-js/master.svg?style=flat-square)](https://travis-ci.org/botimize/botimize-sdk-js)
[![npm version](https://img.shields.io/npm/v/botimize.svg?style=flat-square)](https://www.npmjs.com/package/botimize)

## Setup

* Create a free account at [botimize](http://botimize.io) to get an API key.
* Install botimize SDK with `npm`:

  ```shell
  npm install --save botimize
  ```

## Usage

### Initialization

Use API key to create a new botimize object

- Facebook:

  ```javascript
  const botimize = require('botimize')('<YOUR-API-KEY'>, 'facebook');
  ```

- Telegram:

  ```javascript
  const botimize = require('botimize')('<YOUR-API-KEY'>, 'telegram');
  ```

- Line:

  ```javascript
  const botimize = require('botimize')('<YOUR-API-KEY'>, 'line');
  ```

- Generic Logging:

  ```javascript
  const botimize = require('botimize')('<YOUR-API-KEY'>, 'generic');
  ```

### Log incoming messages:

- Facebook
  ```javascript
  app.post('/webhook', function (req, res)) {
    botimize.logIncoming(req.body);
    ...
  }
  ```

- Telegram
  ```javascript
  app.post('/webhook', function (req, res)) {
    botimize.logIncoming(req.body);
    ...
  }
  ```

- Line
  ```javascript
  app.post('/webhook', function (req, res)) {
    botimize.logIncoming(req.body);
    ...
  }
  ```

- Generic
  ```javascript
  app.post('/webhook', function (req, res)) {
    const incomingLog = {
      sender: {
        id: 'UNIQUE_USER_ID',
        name: 'USER_SCREEN_NAME'
      },
      content: {
        type: 'CONTENT_TYPE', // 'text', 'image', 'audio', 'video', 'file', 'location'
        text: 'CONTENT_TEXT'
      }
    };
    botimize.logIncoming(incomingLog);
    ...
  }
  ```

### Log outgoing messages

- Facebook
  ```javascript
  const options = {
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: true,
    body: messageData
  };
  request(options, function (error, response, body) {
    botimize.logOutgoing(options);
    ...
  });
  ```

- Telegram
  ```javascript
  const options = {
    uri: `https://api.telegram.org/bot${token}/sendMessage`,
    method: 'POST',
    json: true,
    body: messageData
  };
  request(options, function (error, response, body) {
    botimize.logOutgoing(options);
    ...
  });
  ```

- LINE
  ```javascript
  const options = {
    uri: 'https://api.line.me/v2/bot/message/reply',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    headers: {
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    method: 'POST',
    json: true,
    body: messageData
  };
  request(options, function (error, response, body) {
    botimize.logOutgoing(options);
    ...
  });
  ```

- Generic
  ```javascript
    const outgoingLog = {
      receiver: {
        id: 'UNIQUE_USER_ID',
        name: 'USER_SCREEN_NAME'
      },
      content: {
        type: 'CONTENT_TYPE', // 'text', 'image', 'audio', 'video', 'file', 'location'
        text: 'CONTENT_TEXT'
      }
    };
  request(options, function (error, response, body) {
    botimize.logOutgoing(outgoingLog);
    ...
  });
  ```

### Send notifications via email:

  ```javascript
  const data = {
    to: '<recipient-email>',
    text: '<text-content-to-be-sent>'
  };
  botimize.notify(data, 'email');
  ```

### Send notifications via Slack:

  ```javascript
  const data = {
    to: '<incoming-webhook-url>',
    text: '<text-content-to-be-sent>'
  };
  botimize.notify(data, 'slack');
  ```

  `data` can have all properties supported by [Slack incoming webhook](https://api.slack.com/incoming-webhooks), e.g., `channel`, `username`, `icon_emoji`,  `attachments`, etc.

