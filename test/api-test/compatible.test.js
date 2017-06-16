import request from 'request';
import Botimize from '../../src/botimize';

describe('Botimize SDK Compatibility Test', () => {
  let botimize;
  beforeAll((done) => {
    let options = {
      url: 'https://api-stg.botimize.io/projects/public',
      method: 'POST',
      json: true,
      body: {
        name: 'created by sdk api-test/compatible.test.js',
        platform: 'facebook',
      }
    };
    request(options, (error, response, body) => {
      if (error) { console.trace(error); }
      botimize = Botimize(body.apikey, 'facebook', {
        apiUrl: 'http://api-stg.botimize.io',
      });
      expect(error).toBeNull();
      done();
    });
  });
  describe('0.4.2', () => {
    it('Log incoming messages', () => {
      let requestBody = {
        'object': 'page',
        'entry': [
          {
            'id': '247349599062786',
            'time': 1497605673815,
            'messaging': [
              {
                'sender': {
                  'id': '1846048872078817',
                },
                'recipient': {
                  'id': '247349599062786',
                },
                'timestamp': 1497605673649,
                'message': {
                  'mid': 'mid.$cAAC6AFgUYTpi4YZasVcsEE4c45vH',
                  'seq': 10404,
                  'text': 'hello facebook',
                }
              }
            ]
          }
        ]
      };
      botimize.logIncoming(requestBody);
    });

    it('Log outgoing messages', () => {
      const options = {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: 'ACCESS_TOKEN' },
        method: 'POST',
        json: {
          message: {
            text: 'hellow, world!',
          },
          recipient: {
            id: '1846048872078817',
          },
        },
      };
      botimize.logOutgoing(options);
    });
  });

  describe('0.5.0', () => {
    it('Log incoming messages', () => {
      let requestBody = {
        'object': 'page',
        'entry': [
          {
            'id': '247349599062786',
            'time': 1497605673815,
            'messaging': [
              {
                'sender': {
                  'id': '1846048872078817',
                },
                'recipient': {
                  'id': '247349599062786',
                },
                'timestamp': 1497605673649,
                'message': {
                  'mid': 'mid.$cAAC6AFgUYTpi4YZasVcsEE4c45vH',
                  'seq': 10404,
                  'text': 'hello facebook',
                }
              }
            ]
          }
        ]
      };
      botimize.logIncoming(requestBody);
    });

    it('Log outgoing messages using parse=request', () => {
      const options = {
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: 'ACCESS_TOKEN' },
        method: 'POST',
        json: true,
        body: {
          message: {
            text: 'hellow, world!',
          },
          recipient: {
            id: '1846048872078817',
          },
        },
      };
      botimize.logOutgoing(options, { parse: 'request' });
    });

    it('Log outgoing messages using parse=true', () => {
      const data = {
        message: {
          text: 'hellow, world!',
        },
        recipient: {
          id: '1846048872078817',
        },
        accessToken: 'ACCESS_TOKEN',
      };
      botimize.logOutgoing(data, { parse: 'pure' });
    });
  });
});
