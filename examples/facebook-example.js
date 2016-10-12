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
 *      The bot will reply with generic template.
 *
 *   2. Say: "Email"
 *      The bot will invoke notify API to send email to a specific recipient.
 *
 *   3. Say: "Slack"
 *      The bot will invoke notify API to send message to Slack.
 *
 *   4. Say: "Buttons"
 *      The bot will reply with button template.
 *
 *   5. Say: "Receipt"
 *      The bot will reply with receipt template.
 *
 *   6. Say: "QuickReplies"
 *      The bot will reply with quick replies.
 *
 *   7. Say: "AirlineItinerary"
 *      The bot will reply airline itineraray template.
 *
 *   8. Say: "AirlineCheckin"
 *      The bot will reply airline check-in template.
 *
 *   9. Say: "AirlineBoardingPass"
 *      The bot will reply airline boarding pass template.
 *
 *  10. Say: "AirlineUpdate"
 *      The bot will reply airline flight update template.
 *
 *  11. Say anything other than "Generic", "Email", "Slack:
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
      if (text === 'Buttons') {
        sendButtonsMessage(sender);
        continue;
      }
      if (text === 'Receipt') {
        sendReceiptMessage(sender);
        continue;
      }
      if (text === 'QuickReplies') {
        sendQuickRepliesMessage(sender);
        continue;
      }
      if (text === 'AirlineItinerary') {
        sendAirlineItineraryMessage(sender);
        continue;
      }
      if (text === 'AirlineCheckin') {
        sendAirlineCheckinMessage(sender);
        continue;
      }
      if (text === 'AirlineBoardingPass') {
        sendAirlineBoardingPassMessage(sender);
        continue;
      }
      if (text === 'AirlineUpdate') {
        sendAirlineUpdateMessage(sender);
        continue;
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

function createRequestOptions(sender, messageData) {
  return {
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token: process.env.PAGE_TOKEN},
    method: 'POST',
    json: {
      recipient: {id: sender},
      message: messageData,
    },
  };
}

function makeSendRequest(options) {
  request(options, (err, res, body) => {
    console.log('Outgoing: ' + options);
    botimize.logOutgoing(options);
    if (err) {
      console.log('Error in sending messages: ' + JSON.stringify(err));
    } else if (res.body && res.body.error) {
      console.log('Error: ' + JSON.stringify(res.body.error));
    }
  });
}

function sendTextMessage(sender, text) {
  let messageData = {text: text};
  makeSendRequest(createRequestOptions(sender, messageData));
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
          }, {
            // share button only works in generic template.
            type: 'element_share',
          }],
        }, {
          title: 'Second card',
          subtitle: 'Element #2 of an hscroll',
          image_url: 'http://messengerdemo.parseapp.com/img/gearvr.png',
          buttons: [{
            type: 'postback',
            title: 'Postback',
            payload: 'Payload for second element in a generic bubble',
          }, {
            type: 'element_share',
          }],
        }],
      },
    },
  };
  makeSendRequest(createRequestOptions(sender, messageData));
}

function sendButtonsMessage(sender) {
  let messageData = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: 'What do you want to do next?',
        buttons: [{
          type: 'web_url',
          url: 'https://petersapparel.parseapp.com',
          title: 'Show Website',
        }, {
          type: 'postback',
          title: 'Start Chatting',
          payload: 'USER_DEFINED_PAYLOAD',
        }, {
          type: 'phone_number',
          title: 'Call Representative',
          payload: '+15105551234',
        }],
      },
    },
  };
  makeSendRequest(createRequestOptions(sender, messageData));
}

function sendReceiptMessage(sender) {
  let messageData = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'receipt',
        recipient_name: 'Stephane Crozatier',
        order_number: '12345678902',
        currency: 'USD',
        payment_method: 'Visa 2345',
        order_url: 'http://petersapparel.parseapp.com/order?order_id=123456',
        timestamp: '1428444852',
        elements: [{
          title: 'Classic White T-Shirt',
          subtitle: '100% Soft and Luxurious Cotton',
          quantity: 2,
          price: 50,
          currency: 'USD',
          image_url: 'http://petersapparel.parseapp.com/img/whiteshirt.png',
        }, {
          title: 'Classic Gray T-Shirt',
          subtitle: '100% Soft and Luxurious Cotton',
          quantity: 1,
          price: 25,
          currency: 'USD',
          image_url: 'http://petersapparel.parseapp.com/img/grayshirt.png',
        }],
        address: {
          street_1: '1 Hacker Way',
          street_2: '',
          city: 'Menlo Park',
          postal_code: '94025',
          state: 'CA',
          country: 'US',
        },
        summary: {
          subtotal: 75.00,
          shipping_cost: 4.95,
          total_tax: 6.19,
          total_cost: 56.14,
        },
        adjustments: [{
          name: 'New Customer Discount',
          amount: 20,
        }, {
          name: '$10 Off Coupon',
          amount: 10,
        }],
      },
    },
  };
  makeSendRequest(createRequestOptions(sender, messageData));
}

function sendQuickRepliesMessage(sender) {
  let messageData = {
    text: 'Pick a color or share your location:',
    quick_replies: [{
      content_type: 'text',
      title: 'Red',
      payload: 'QUICK_REPLIES_0',
    }, {
      content_type: 'text',
      title: 'Green',
      payload: 'QUICK_REPLIES_1',
      image_url: 'http://petersfantastichats.com/img/green.png',
    }, {
      content_type: 'location',
    }],
  };
  makeSendRequest(createRequestOptions(sender, messageData));
}

function sendAirlineItineraryMessage(sender) {
  let messageData = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'airline_itinerary',
        intro_message: 'Here\'s your flight itinerary.',
        locale: 'en_US',
        pnr_number: 'ABCDEF',
        theme_color: '#FF2D2D',
        passenger_info: [{
          name: 'Farbound Smith Jr',
          ticket_number: '0741234567890',
          passenger_id: 'p001',
        }, {
          name: 'Wang/TingYu',
          ticket_number: '0741234567891',
          passenger_id: 'p002',
        }],
        flight_info: [{
          connection_id: 'c001',
          segment_id: 's001',
          flight_number: 'BR2132',
          aircraft_type: 'Boeing 737',
          departure_airport: {
            airport_code: 'TPE',
            city: 'Taipei',
            terminal: 'T4',
            gate: 'D8',
          },
          arrival_airport: {
            airport_code: 'KIX',
            city: 'Kansai',
            terminal: 'T4',
            gate: 'D8',
          },
          flight_schedule: {
            departure_time: '2016-01-02T19:45',
            arrival_time: '2016-01-02T21:20',
          },
          travel_class: 'business',
        }, {
          connection_id: 'c002',
          segment_id: 's002',
          flight_number: 'KL321',
          aircraft_type: 'Boeing 747-200',
          travel_class: 'business',
          departure_airport: {
            airport_code: 'KIX',
            city: 'Kansai',
            terminal: 'T1',
            gate: 'G33',
          },
          arrival_airport: {
            airport_code: 'AMS',
            city: 'Amsterdam',
            terminal: 'T1',
            gate: 'G33',
          },
          flight_schedule: {
            departure_time: '2016-01-02T22:45',
            arrival_time: '2016-01-03T17:20',
          },
        }],
        passenger_segment_info: [{
          segment_id: 's001',
          passenger_id: 'p001',
          seat: '12A',
          seat_type: 'Business',
        }, {
          segment_id: 's001',
          passenger_id: 'p002',
          seat: '12B',
          seat_type: 'Business',
        }, {
          segment_id: 's002',
          passenger_id: 'p001',
          seat: '73A',
          seat_type: 'World Business',
          product_info: [{
            title: 'Lounge',
            value: 'Complimentary lounge access',
          }, {
            title: 'Baggage',
            value: '1 extra bag 50lbs',
          }],
        }, {
          segment_id: 's002',
          passenger_id: 'p002',
          seat: '73B',
          seat_type: 'World Business',
          product_info: [{
            title: 'Lounge',
            value: 'Complimentary lounge access',
          }, {
            title: 'Baggage',
            value: '1 extra bag 50lbs',
          }],
        }],
        price_info: [{
          title: 'Fuel surcharge',
          amount: '1597',
          currency: 'USD',
        }],
        base_price: '12206',
        tax: '200',
        total_price: '14003',
        currency: 'USD',
      },
    },
  };
  makeSendRequest(createRequestOptions(sender, messageData));
}

function sendAirlineCheckinMessage(sender) {
  let messageData = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'airline_checkin',
        intro_message: 'Check-in is available now.',
        locale: 'en_US',
        pnr_number: 'ABCDEF',
        flight_info: [{
          flight_number: 'f001',
          departure_airport: {
            airport_code: 'TPE',
            city: 'Taipei',
            terminal: 'T4',
            gate: 'G8',
          },
          arrival_airport: {
            airport_code: 'SEA',
            city: 'Seattle',
            terminal: 'T4',
            gate: 'G8',
          },
          flight_schedule: {
            boarding_time: '2016-01-05T15:05',
            departure_time: '2016-01-05T15:45',
            arrival_time: '2016-01-05T17:30',
          },
        }],
        checkin_url: 'https://www.airline.com/check-in',
      },
    },
  };
  makeSendRequest(createRequestOptions(sender, messageData));
}

function sendAirlineBoardingPassMessage(sender) {
  let messageData = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'airline_boardingpass',
        intro_message: 'You are checked in.',
        locale: 'en_US',
        boarding_pass: [{
          passenger_name: 'SMITH/NICOLAS',
          pnr_number: 'CG4X7U',
          travel_class: 'business',
          seat: '74J',
          auxiliary_fields: [{
            label: 'Terminal',
            value: 'T1',
          }, {
            label: 'Departure',
            value: '30OCT 19:05',
          }],
          secondary_fields: [{
            label: 'Boarding',
            value: '18:30',
          }, {
            label: 'Gate',
            value: 'D57',
          }, {
            label: 'Seat',
            value: '74J',
          }, {
            label: 'Sec.Nr.',
            value: '003',
          }],
          logo_image_url: 'https://www.example.com/en/logo.png',
          header_image_url: 'https://www.example.com/en/fb/header.png',
          qr_code: 'M1SMITH/NICOLAS  CG4X7U nawouehgawgnapwi3jfa0wfh',
          above_bar_code_image_url: 'https://www.example.com/en/PLAT.png',
          flight_info: {
            flight_number: 'KL0642',
            departure_airport: {
              airport_code: 'JFK',
              city: 'New York',
              terminal: 'T1',
              gate: 'D57',
            },
            arrival_airport: {
              airport_code: 'AMS',
              city: 'Amsterdam',
            },
            flight_schedule: {
              departure_time: '2016-01-02T19:05',
              arrival_time: '2016-01-05T17:30',
            },
          },
        }, {
          passenger_name: 'JONES/FARBOUND',
          pnr_number: 'CG4X7U',
          travel_class: 'business',
          seat: '74K',
          auxiliary_fields: [{
            label: 'Terminal',
            value: 'T1',
          }, {
            label: 'Departure',
            value: '30OCT 19:05',
          }],
          secondary_fields: [{
            label: 'Boarding',
            value: '18:30',
          }, {
            label: 'Gate',
            value: 'D57',
          }, {
            label: 'Seat',
            value: '74K',
          }, {
            label: 'Sec.Nr.',
            value: '004',
          }],
          logo_image_url: 'https://www.example.com/en/logo.png',
          header_image_url: 'https://www.example.com/en/fb/header.png',
          qr_code: 'M1JONES/FARBOUND  CG4X7U nawouehgawgnapwi3jfa0wfh',
          above_bar_code_image_url: 'https://www.example.com/en/PLAT.png',
          flight_info: {
            flight_number: 'KL0642',
            departure_airport: {
              airport_code: 'JFK',
              city: 'New York',
              terminal: 'T1',
              gate: 'D57',
            },
            arrival_airport: {
              airport_code: 'AMS',
              city: 'Amsterdam',
            },
            flight_schedule: {
              departure_time: '2016-01-02T19:05',
              arrival_time: '2016-01-05T17:30',
            },
          },
        }],
      },
    },
  };
  makeSendRequest(createRequestOptions(sender, messageData));
}

function sendAirlineUpdateMessage(sender) {
  let messageData = {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'airline_update',
        intro_message: 'Your flight is delayed',
        update_type: 'delay',
        locale: 'en_US',
        pnr_number: 'CF23G2',
        update_flight_info: {
          flight_number: 'KL123',
          departure_airport: {
            airport_code: 'TPE',
            city: 'Taipei',
            terminal: 'T4',
            gate: 'G8',
          },
          arrival_airport: {
            airport_code: 'AMS',
            city: 'Amsterdam',
            terminal: 'T4',
            gate: 'G8',
          },
          flight_schedule: {
            boarding_time: '2015-12-26T10:30',
            departure_time: '2015-12-26T11:30',
            arrival_time: '2015-12-27T07:30',
          },
        },
      },
    },
  };
  makeSendRequest(createRequestOptions(sender, messageData));
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
