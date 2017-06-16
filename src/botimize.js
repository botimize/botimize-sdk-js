import request from 'request';
import _ from 'lodash';

const API_URL = 'https://api.botimize.io';
const SUPPORTED_PLATFORM = ['facebook', 'telegram', 'line', 'generic'];

function makeRequest(options, cb) {
  // send request to api server
  try {
    request(options, (err, res, body) => {
      if (err) {
        return cb && cb(err);
      }
      if (body && body.error) {
        return cb && cb(body.error.message);
      }
      cb && cb(null, body);
    });
  } catch (err) {
    console.log(err);
  }
}

class BotimizeCore {
  /*
   * constructor
   *
   *  @param apiKey the access token for sending events to botimize api server.
   */
  constructor(apiKey, platform, options = {}) {
    if (!apiKey) {
      throw new Error('No API key provided');
    }
    if (!platform) {
      throw new Error('platform is not defined');
    }

    platform = platform.toLocaleLowerCase();

    if (SUPPORTED_PLATFORM.indexOf(platform) === -1) {
      throw new Error('Specified platform is not supported: ' + platform);
    }
    this.apiKey = apiKey;
    this.platform = platform;
    this.apiUrl = options.apiUrl || API_URL;
    this.debug = options.debug || false;
    // super properties
    this.superProperties = {
      platform: platform,
      tag: 'unknown',
    };
  }

  /*
   * track
   *  track event
   *
   *  @param event the event name.
   *  @param properties the event properties.
   */
  track(event, properties) {
    const _props = JSON.parse(JSON.stringify(properties));

    const options = {
      method: 'POST',
      uri: this.apiUrl + '/messages',
      qs: {
        apikey: this.apiKey,
      },
      json: true,
      body: {
        tag: this.superProperties.tag,
        platform: this.platform,
        direction: event,
        raw: _props,
      },
    };
    makeRequest(options, error => {
      if (error) {
        console.log('failed to send track event to botimize server.');
        console.log(error);
      }
    });
  }

  logIncoming(data, options = {}) {
    const prefix = `[botimize][${this.platform}][incoming]`;
    if (this.debug) {
      console.log(`${prefix}: ${JSON.stringify(data, null, 2)}`);
    }
    this.track('incoming', data);
  }

  logOutgoing(data, options = {}) {
    const parse = options.parse || 'request';
    const prefix = `[botimize][${this.platform}][outgoing]`;
    let formatedData = {};

    if (this.platform === 'generic' || parse === 'pure') {
      formatedData = data;
    } else if (parse === 'request') {
      if (_.isEmpty(data.body) && _.isEmpty(data.json)) {
        console.error('empty body');
      }
      formatedData = data.body || data.json;
      try {
        if (this.platform === 'facebook') {
          formatedData.accessToken = data.qs.access_token || data.access_token;
        } else if (this.platform === 'telegram') {
          const reg = /https:\/\/api\.telegram\.org\/bot(.*)\/(.*)/g;
          const matches = reg.exec(data.uri || data.url);
          formatedData.token = matches[1];
          formatedData.method = matches[2];
        } else if (this.platform === 'line') {
          formatedData.channelAccessToken = data.headers['Authorization']
            .replace('Bearer', '')
            .trim();
        }
      } catch (error) {
        throw new Error(`Parsing error, platform: ${this.platform}, data: ${JSON.stringify(data)}, options: ${JSON.stringify(options)}`);
      }
    } else {
      throw new Error('unknow parsing method: ' + parse);
    }

    this.track('outgoing', formatedData);

    if (this.debug) {
      console.log(`${prefix}: ${JSON.stringify(formatedData, null, 2)}`);
    }
  }

  /*
   *  notify
   *      send a notification event.
   */
  notify(data, via = 'email') {
    const options = {
      method: 'POST',
      uri: this.apiUrl + '/projects/notify',
      qs: {
        apikey: this.apiKey,
        via: via,
      },
      json: true,
      body: data,
    };
    makeRequest(options, error => {
      if (error) {
        console.log('failed to send notification to botimize server.');
        console.log(error);
      }
    });
  }
}

export default function botimize(apiKey, platform, options = {}) {
  return new BotimizeCore(apiKey, platform, options);
}
