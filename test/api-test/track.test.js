import request from 'request';
import Botimize from '../../src/botimize';

const API_HOST = 'https://api-stg.getbotimize.com';

describe('Botimize SDK Track Test', () => {
  let projectApiKey;

  beforeAll((done) => {
    let options = {
      url: `${API_HOST}/projects/public`,
      method: 'POST',
      json: true,
      body: {
        name: 'created by sdk api-test/compatible.test.js',
        platform: 'facebook',
      },
    };
    request(options, (error, response, body) => {
      if (error) { console.trace(error); }
      projectApiKey = body.apikey;
      expect(error).toBeNull();
      done();
    });
  });
  it('Should log incoming messages', () => {
    let botimize = Botimize(projectApiKey, 'facebook', {
      apiUrl: API_HOST,
    });

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
              },
            },
          ],
        },
      ],
    };
    botimize.logIncoming(requestBody);
  });

  it('Should log incoming messages with another apiKey', () => {
    let botimize = Botimize('fake_key', 'facebook', {
      apiUrl: API_HOST,
    });

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
              },
            },
          ],
        },
      ],
    };
    botimize.logIncoming(requestBody, { apiKey: projectApiKey });
  });

  it('Should log outgoing messages', () => {
    let botimize = Botimize(projectApiKey, 'facebook', {
      apiUrl: API_HOST,
    });

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

  it('Should log outgoing messages with another apiKey', () => {
    let botimize = Botimize('fake_key', 'facebook', {
      apiUrl: API_HOST,
    });

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
    botimize.logOutgoing(options, { apiKey: projectApiKey });
  });
});
