/*
 * This is a sample Facebook bot works with botimize.
 *
 * # RUN THIS BOT:
 *
 *   1. Setup your Facebook app and page
 *
 *   2. Install required packages and build this package:
 *
 *      npm install
 *      npm run build
 *
 *   3. Run from command line:
 *
 *      PAGE_TOKEN=<your page token> VERIFY_TOKEN=<your verify token> BOTIMIZE_KEY=<your botimize api key> node
 *      facebook-example.js
 *
 *   4. Setup webhook URL for your Facebook app:
 *
 *      Localtunnel will create a URL for you. Add this URL as your webhook in your Facebook app.
 *
 *
 * # USE THIS BOT:
 *
 *   1. Say: "Generic"
 *      The bot will reply with attachments.
 *
 *   2. Say: "Email"
 *      The bot will invoke notify API to send email to a specific recipient.
 *
 *   3. Say: "Slack"
 *      The bot will invoke notify API to send message to Slack.
 *
 *   4. Say anything other than "Generic", "Email", "Slack:
 *      The bot will echo the messages.
 *
 *
 * # This example is modified from https://github.com/jw84/messenger-bot-tutorial
 *
 */

'use strict';

if (!process.env.PAGE_TOKEN) {
  console.log('Missing PAGE_TOKEN in environment');
  process.exit(1);
}

if (!process.env.VERIFY_TOKEN) {
  console.log('Missing VERIFY_TOKEN in environment');
  process.exit(1);
}

if (!process.env.BOTIMIZE_KEY) {
  console.log('Missing BOTIMIZE_KEY in environment');
  process.exit(1);
}

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var localtunnel = require('localtunnel');
var botimize = require('../lib/botimize')(process.env.BOTIMIZE_KEY, 'facebook');
var app = express();

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
  res.send('Hello world, I am a chat bot');
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
    return;
  }
  res.send('Error, wrong token');
});

// to post data
app.post('/webhook/', function (req, res) {
  console.log('Incoming: ' + req.body);
  botimize.logIncoming(req.body);
  let messagingEvents = req.body.entry[0].messaging;
  for (let i = 0; i < messagingEvents.length; i++) {
    let event = req.body.entry[0].messaging[i];
    let sender = event.sender.id;
    if (event.message && event.message.text) {
      let text = event.message.text;
      if (text === 'Generic') {
        sendGenericMessage(sender);
        continue;
      }
      if (text === 'Email') {
        // Uncomment this line to use the notify API sending email notification.
        // const data = {
        //   to: '<your-email>',
        //   text: 'notification message',
        // };
        // botimize.notify(data, 'email');
        console.log('Email sent');
      }
      if (text === 'Slack') {
        // Uncomment this line to use the notify API sending slack notifications.
        // const data = {
        //   to: '<your-incoming-webhook-url>',
        //   text: 'notification message',
        // };
        // botimize.notify(data, 'slack');
        console.log('Message sent to Slack');
      }
      sendTextMessage(sender, 'Text received, echo: ' + text.substring(0, 200));
    }
    if (event.postback) {
      let text = JSON.stringify(event.postback);
      sendTextMessage(sender, 'Postback received: ' + text.substring(0, 200));
      continue;
    }
  }
  res.sendStatus(200);
});

function makeSendRequest(options) {
  request(options, (err, res, body) => {
    console.log('Outgoing: ' + options);
    botimize.logOutgoing(options);
    if (err) {
      console.log('Error in sending messages: ' + err);
    } else if (res.body && res.body.error) {
      console.log('Error: ' + res.body.error);
    }
  });
}

function sendTextMessage(sender, text) {
  let messageData = {text: text};
  var options = {
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_TOKEN},
    method: 'POST',
    json: {
      recipient: {
        id: sender,
      },
      message: messageData,
    },
  };
  makeSendRequest(options);
}

function sendGenericMessage(sender) {
  let messageData = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [{
          title: 'First card',
          subtitle: 'Element #1 of an hscroll',
          image_url: 'http://messengerdemo.parseapp.com/img/rift.png',
          buttons: [{
            type: 'web_url',
            url: 'https://www.messenger.com',
            title: 'web url',
          }, {
            type: 'postback',
            title: 'Postback',
            payload: 'Payload for first element in a generic bubble',
          }],
        }, {
          title: 'Second card',
          subtitle: 'Element #2 of an hscroll',
          image_url: 'http://messengerdemo.parseapp.com/img/gearvr.png',
          buttons: [{
            type: 'postback',
            title: 'Postback',
            payload: 'Payload for second element in a generic bubble',
          }],
        }],
      },
    },
  };
  var options = {
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData,
    },
  };
  makeSendRequest(options);
}

var subdomain = 'thisisasubdomain';
let tunnel = localtunnel(app.get('port'), {subdomain: subdomain}, (err, tunnel) => {
  if (err) {
    process.exit();
  }
  console.log('Your bot is available on the web at the following URL: ' + tunnel.url + '/webhook');
});

tunnel.on('close', () => {
  console.log('Your bot is no longer available on the web at the localtunnnel.me URL.');
  process.exit();
});

// Spin up the server
app.listen(app.get('port'), function() {
  console.log('running on port', app.get('port'));
});
