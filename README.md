## [botimize](botimize.io) - Analytics built to optimize your bots
[![npm](https://img.shields.io/npm/v/botimize.svg?maxAge=2592000)](https://www.npmjs.com/package/botimize)

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
  botimize.notify('<recipient-email>', '<text-content-to-be-sent>');
  ```

  ​
