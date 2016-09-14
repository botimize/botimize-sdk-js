## [botimize](botimize.io) - Analytics built to optimize your bots

[![build status](https://img.shields.io/travis/botimize/botimize-sdk-js/master.svg?style=flat-square)](https://travis-ci.org/botimize/botimize-sdk-js)
[![npm version](https://img.shields.io/npm/v/botimize.svg?style=flat-square)](https://www.npmjs.com/package/botimize)

### Setup

* Create a free account at [botimize](botimize.io) to get an API key.
* Install botimize SDK with `npm`:

  ```shell
  npm install --save botimize
  ```

### Usage

- Use API key to create a new botimize object:

  ```javascript
  const botimize = require('botimize')('<YOUR-API-KEY'>, 'facebook');
  ```

- Log incoming messages:

  ```javascript
  app.post('/webhook', function (req, res)) {
    botimize.logIncoming(req.body);
    ...
  }
  ```

- Log outgoing messages

  ```javascript
  const options = {
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData
  };
  request(options, function (error, response, body) {
    botimize.logOutgoing(options);
    ...
  });
  ```

- Send notifications via email:

  ```javascript
  const data = {
    to: '<recipient-email>',
    text: '<text-content-to-be-sent>'
  };
  botimize.notify(data, 'email');
  ```

- Send notification via Slack:

  ```javascript
  const data = {
    to: '<incoming-webhook-url>',
    text: '<text-content-to-be-sent>'
  };
  botimize.notify(data, 'slack');
  ```

  `data` can hava all properties supported by [Slack incoming webhook](https://api.slack.com/incoming-webhooks), e.g., `channel`, `username`, `icon_emoji`,  `attachments`, etc.

