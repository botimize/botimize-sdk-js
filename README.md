# [botimize](https://www.getbotimize.com/) - Analytics built to optimize your bots

[![build status](https://img.shields.io/travis/botimize/botimize-sdk-js/master.svg?style=flat-square)](https://travis-ci.org/botimize/botimize-sdk-js)
[![npm version](https://img.shields.io/npm/v/botimize.svg?style=flat-square)](https://www.npmjs.com/package/botimize)

## Table of contents

- [Setup](#setup)
- [Usage](#usage)
- [Initialization](#initialization)
- [Log incoming messages](#log-incoming-messages)
- [Log outgoing messages](#log-outgoing-messages)
- [Send notifications](#send-notifications)
- [References & Full Examples](#references--full-examples)

## Setup

* Create a free account at [Botimize](https://www.getbotimize.com/) to get an API key.
* Install botimize SDK with `npm`:

  ```shell
  npm install --save botimize
  ```

## Usage

### Initialization

Use Botimize API key to create a new botimize object, and `<PLATFORM>` should be `facebook`, `telegram`, `line` or `generic`.

  ```javascript
  const botimize = require('botimize')('<YOUR-BOTIMIZE-API-KEY>', '<PLATFORM>');
  ```
  ```javascript
  const botimize = require('botimize')('NS1W0O5YCIDH9HJOGNQQWP5NU7YJ0S0S', 'facebook');
  ```

### Log incoming messages:

The log incoming message put into `logIncoming()` is slightly different from the body received from platform webhook but not complicated. You can also put the body received from platform webhook directly into `logIncoming()`. For the sake of convience, the body sent are avaliable for both string and object type.

The diffenece between the bodies is with one more field. For facebook, we have `accessToken` as an additional field. For telegram, we have `token` as an additionl field. For line, we have `channelAccessToken` as an additional field. The reason why we need this additional field is because this access token allow us to get the profiles of users. Hence, the users' profiles are shown on our dashboard.

If you are intrested in the api for getting users' profiles, take a look at [facebook profile api](https://developers.facebook.com/docs/messenger-platform/user-profile), [telegram profile api](https://core.telegram.org/bots/api#userprofilephotos), and [line profile api](https://devdocs.line.me/en/#bot-api-get-profile).

#### Facebook

- Use data format structure listed as below, where the messageBody is getting from [Facebook request body example](https://developers.facebook.com/docs/messenger-platform/webhook-reference#format).

  ```javascript
  let data = {
    ...messageBody,
    accessToken,
  };
  botimize.logIncoming(data);
  ```
  ```javascript
  let data = {
    object: 'page',
    entry: [
      {
        id: '247349599062786',
        time: 1492541234486,
        messaging: [
          {
            sender: {
              id: '1846048872078817'
            },
            recipient: {
              id: '247349599062786'
            },
            timestamp: 1492541234394,
            message: {
              mid: 'mid.$cAAC6AFgUYTphs6kk2lbgmPaOon0R',
              seq: 3915,
              text: 'hello facebook'
            }
          }
        ]
      }
    ],
    accessToken: 'EAAXUgsVmiP8BAMcRWxLa1N5RycMzZBfjwiekoqCik6pZASPsnmkJtG29gp5QXdyMaKfFg0iZCIDlqhfhTZCLqRKuM4hUCfdZBcxl8GzKgZA0AwI8syxG49M9OaZCsjyZC8FPg30yIRDFG5hp9jNNtvqtWW0KKzB9a59rTkZBsgz2oe4QZDZD',
  };
  botimize.logIncoming(data);
  ```

#### Telegram

- Use data format structure listed as below, where the messageBody is getting from [Telegram request body example](https://core.telegram.org/bots/api#getting-updates).

  ```javascript
  let data = {
    ...messageBody,
    token,
  };
  botimize.logIncoming(data);
  ```
  ```javascript
  let data = {
    update_id: 596819141,
    message: {
      message_id: 27,
      from: {
        id: 161696362,
        first_name: 'Kuan-Hung',
        username: 'godgunman'
      },
      chat: {
        id: 161696362,
        first_name: 'Kuan-Hung',
        username: 'godgunman',
        type: 'private'
      },
      date: 1492511288,
      text: 'hello telegram'
    },
    token: '308726257:AAHnmJpvkAepqirk82ZOrgtF6Hz2ijbRavA',
  };
  botimize.logIncoming(data);
  ```

#### Line

- Use data format structure listed as below, where the messageBody is getting from [LINE request body example](https://devdocs.line.me/en/#webhook-event-object).

  ```javascript
  let data = {
    ...messageBody,
    channelAccessToken,
  };
  ```
  ```javascript
  let data = {
    events: [
      {
        type: 'message',
        replyToken: '6a37af4d99a94ce9bbe9184171398b70',
        source: {
          userId: 'Uc76d8ae9ccd1ada4f06c4e1515d46466',
          type: 'user'
        },
        timestamp: 1492439626890,
        message: {
          type: 'text',
          id: '5952264121603',
          text: 'hello'
        }
      }
    ],
    channelAccessToken: 'GxvuC0QfatJ0/Bv5d3DoVbUcfVd6MXLj9QY8aFHSqCYJkZhKG6u5I5dtbKZBNMbmLmwKox1Ktd0Kcwfsxm9S5OmIwQoChcV1gPlK/1CI8cUe3eqaG/UrqL65y1Birb6rnssT0Acaz+7Lr7V2WVnwrQdB04t89/1O/w1cDnyilFU=',
  };

  botimize.logIncoming(data);
  ```

#### Generic
```javascript
app.post('/webhook', function (req, res)) {
  const incomingLog = {
    timestamp: '<TIME OF MESSAGE(in milliseconds)>',
    recipient: {
      id: '<UUID_OF_RECIPIENT>',
      name: '<NAME_OF_RECIPIENT>'
    },
    sender: {
      id: '<UUID_OF_SENDER>',
      name: '<NAME_OF_SENDER>'
    },
    message: {
      type: '<MESSAGE_TYPE>', // 'text', 'image', 'audio', 'video', 'file', 'location'
      text: '<MESSAGE_CONTENT>'
    }
  };
  botimize.logIncoming(incomingLog);
  // ...
}
```

### Log outgoing messages

For logging outgoing message, Botimize SDK provides two methods to parse the data. This is a little different from `logIncoming()` because outgoing messages have token for sending message to client. **"Fortunately"**, there are three platforms and have three differents ways to authorize by using token. **"Unfortunately"**, one easy way is all Botimize needs.

[Request](https://github.com/request/request) is a popular nodejs package to make HTTP calls, so if you already use request to your project and send outgoing message, it will be very convenient to log outgoing message. If not, don't worry you just need to do a little change.

#### Facebook 
- For those who already use request to your poject: Put options of request into `logOutgoing()`.
  ```javascript
  let options = {
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: accessToken },
    method: 'POST',
    json: true,
    body: messageBody,
  };
  request(options, function (error, response, body) {
    botimize.logOutgoing(options, {parse: 'request'});
    ...
  });
  ```

- For those who are not using request to send outgoing messages: Use data format structure listed as below.
  ```javascript
  let data = {
    ...messageBody,
    accessToken,
  };
  botimize.logOutgoing(data, { parse: 'pure' });
  ```
  ```javascript
  let data = {
    recipient: { id: '1487766407960998' },
    message: { text: 'hello facebook messenger' },
    accessToken: 'EAAXUgsVmiP8BAMcRWxLa1N5RycMzZBfjwiekoqCik6pZASPsnmkJtG29gp5QXdyMaKfFg0iZCIDlqhfhTZCLqRKuM4hUCfdZBcxl8GzKgZA0AwI8syxG49M9OaZCsjyZC8FPg30yIRDFG5hp9jNNtvqtWW0KKzB9a59rTkZBsgz2oe4QZDZD'
  };
  botimize.logOutgoing(data, { parse: 'pure' });
  ```


#### Telegram
- For those who already use request to your poject: Put options of request into `logOutgoing()`.
  ```javascript
  let options = {
    uri: `https://api.telegram.org/bot${token}/sendMessage`,
    method: 'POST',
    json: true,
    body: messageBody,
  };
  request(options, function (error, response, body) {
    botimize.logOutgoing(options, { parse: 'request' });
    // ...
  });
  ```
- For those who are not using request to send outgoing messages: Use data format structure listed as below.
  ```javascript
  let data = {
    ...messageBody,
    token,
  };
  botimize.logOutgoing(data, { parse: 'pure' });
  ```

  ```javascript
  let data = {
    chat_id: '161696362',
    text: 'hello telegram',
    token: '308726257:AAHnmJpvkAepqirk82ZOrgtF6Hz2ijbRavA',
  };
  botimize.logOutgoing(data, { parse: 'pure' });
  ```

#### LINE
- For those who already use request to your poject: Put options of request into `logOutgoing()`.
  ```javascript
  let options = {
    uri: 'https://api.line.me/v2/bot/message/reply',
    headers: {
        'Authorization': `Bearer ${channelAccessToken}`,
    },
    method: 'POST',
    json: true,
    body: messageBody
  };
  request(options, function (error, response, body) {
    botimize.logOutgoing(options, { parse: 'request' });
    // ...
  });
  ```
- For those who are not using request to send outgoing messages: Use data format structure listed as below.
  ```javascript
  let data = {
    ...messageBody,
    channelAccessToken,
  };
  botimize.logOutgoing(data, { parse: 'pure' });
  ```
  ```javascript
  let data = {
    replyToken: '9bd439c6961346d7b2ec4184469b9946',
    messages: [{
      type: 'text',
      text: 'hello, this is a message from LINE chatbot',
    }],
    channelAccessToken: 'GxvuC0QfatJ0/Bv5d3DoVbUcfVd6MXLj9QY8aFHSqCYJkZhKG6u5I5dtbKZBNMbmLmwKox1Ktd0Kcwfsxm9S5OmIwQoChcV1gPlK/1CI8cUe3eqaG/UrqL65y1Birb6rnssT0Acaz+7Lr7V2WVnwrQdB04t89/1O/w1cDnyilFU=',
  };
  botimize.logOutgoing(data, { parse: 'pure' });
  ```

#### Generic
  ```javascript
  const outgoingLog = {
    timestamp: '<TIME OF MESSAGE(in milliseconds)>',
    recipient: {
      id: '<UUID_OF_RECIPIENT>',
      name: '<NAME_OF_RECIPIENT>'
    },
    sender: {
      id: '<UUID_OF_SENDER>',
      name: '<NAME_OF_SENDER>'
    },
    message: {
      type: '<MESSAGE_TYPE>', // 'text', 'image', 'audio', 'video', 'file', 'location'
      text: '<MESSAGE_CONTENT>'
    }
  };
  botimize.logOutgoing(outgoingLog, { parse: 'pure' });
  ```

## Send notifications

### via email

  ```javascript
  const data = {
    to: '<recipient-email>',
    text: '<text-content-to-be-sent>'
  };
  botimize.notify(data, 'email');
  ```

### via Slack

  ```javascript
  const data = {
    to: '<incoming-webhook-url>',
    text: '<text-content-to-be-sent>'
  };
  botimize.notify(data, 'slack');
  ```

  `data` can have all properties supported by [Slack incoming webhook](https://api.slack.com/incoming-webhooks), e.g., `channel`, `username`, `icon_emoji`,  `attachments`, etc.

## References & Full Examples

### References
* [facebook-incoming-message](https://developers.facebook.com/docs/messenger-platform/webhook-reference#format)
* [facebook-outgoing-message](https://developers.facebook.com/docs/messenger-platform/send-api-reference#request)
* [telegram-incoming-message](https://core.telegram.org/bots/api#getting-updates)
* [telegram-outgoing-message](https://core.telegram.org/bots/api#sendmessage)
* [line-incoming-message](https://devdocs.line.me/en/#webhook-event-object)
* [line-outgoing-message](https://devdocs.line.me/en/?shell#reply-message)

### Full Examples
* [line-python-bot](https://github.com/botimize/line-python-bot)
* [telegram-node-bot](https://github.com/botimize/telegram-node-bot)
* [telegram-python-bot](https://github.com/botimize/telegram-python-bot)
* [messenger-node-bot](https://github.com/botimize/messenger-node-bot)
* [messenger-python-bot](https://github.com/botimize/messenger-python-bot)
