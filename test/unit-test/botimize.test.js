import Botimize from '../../src/botimize';

describe('BotimizeCore Test', () => {
  describe('.constructor()', () => {
    it('should have apikey and platform', () => {
      let botimize = Botimize('this_is_api_key', 'facebook', {
        apiUrl: 'http://api-test.botimize.io',
        debug: true,
      });
      expect(botimize.apiUrl).toBe('http://api-test.botimize.io');
      expect(botimize.debug).toBe(true);
      expect(botimize.apiKey).toBe('this_is_api_key');
    });
    it('should have error if no apikey and platform give', () => {
      try {
        expect(Botimize(undefined, 'facebook', {}));
      } catch (error) {
        return expect(error.message).toBe('No API key provided');
      }
      expect(undefined).toBe(new Error('should have error'));
    });
    it('should have error with unsuported platform', () => {
      try {
        expect(Botimize('this_is_api_key', 'koobecaf', {}));
      } catch (error) {
        return expect(error.message).toBe('Specified platform is not supported: koobecaf');
      }
      expect(undefined).toBe(new Error('should have error'));
    });
  });

  describe('.outgoing()', () => {
    it('[Facebook] should pass', () => {
      const pageAccessToken = 'this_is_facebook_page_access_token';
      const options = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: pageAccessToken },
        method: 'POST',
        json: {
          recipient: { id: 'sender' },
          message: 'messageData',
        },
      };
      const botimize = Botimize('this_is_api_key', 'facebook');

      Object.getPrototypeOf(botimize).track = jest.fn((event, properties) => {
        expect(properties.accessToken).toBe(pageAccessToken);
      });

      botimize.logOutgoing(options);
    });
    it('[Facebook] should error', () => {
      const options = {
        url: 'https://graph.facebook.com/v2.6/me/messages',
        method: 'POST',
        json: {
          recipient: { id: 'sender' },
          message: 'messageData',
        },
      };
      const botimize = Botimize('this_is_api_key', 'facebook');

      Object.getPrototypeOf(botimize).track = jest.fn((event, properties) => {
        console.log(event, properties);
      });
      try {
        botimize.logOutgoing(options);
      } catch (error) {
        // TODO(ggm) to have rich error message
        return expect(error.name).toBe('Error');
      }
      expect(undefined).toBe(new Error('should have error'));
    });

    it('[LINE] should pass', () => {
      const channelAccessToken = 'this_is_line_channel_access_token';
      const options = {
        url: 'https://api.line.me/v2/bot/message/reply',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${channelAccessToken}`,
        },
        body: {
          replyToken: 'replyToken',
          messages: 'messages',
        },
        json: true,
      };
      const botimize = Botimize('this_is_api_key', 'line');

      Object.getPrototypeOf(botimize).track = jest.fn((event, properties) => {
        expect(properties.channelAccessToken).toBe(channelAccessToken);
      });

      botimize.logOutgoing(options);
    });

    it('[LINE] should error', () => {
      const options = {
        url: 'https://api.line.me/v2/bot/message/reply',
        method: 'POST',
        body: {
          replyToken: 'replyToken',
          messages: 'messages',
        },
        json: true,
      };
      const botimize = Botimize('this_is_api_key', 'line');

      Object.getPrototypeOf(botimize).track = jest.fn((event, properties) => {
        console.log(event, properties);
      });

      try {
        botimize.logOutgoing(options);
      } catch (error) {
        // TODO(ggm) to have rich error message
        return expect(error.name).toBe('Error');
      }
      expect(undefined).toBe(new Error('should have error'));
    });

    it('[Telegram] should pass', () => {
      const token = 'this_is_telegram_token';
      let options = {
        url: `https://api.telegram.org/bot${token}/sendMessage`,
        method: 'POST',
        body: {
          chat_id: 'chatId',
          text: 'test',
        },
        json: true,
      };
      const botimize = Botimize('this_is_api_key', 'telegram');

      Object.getPrototypeOf(botimize).track = jest.fn((event, properties) => {
        expect(properties.token).toBe(token);
      });

      botimize.logOutgoing(options);
    });

    it('[Telegram] should error', () => {
      let options = {
        method: 'POST',
        body: {
          chat_id: 'chatId',
          text: 'test',
        },
        json: true,
      };
      const botimize = Botimize('this_is_api_key', 'telegram');

      Object.getPrototypeOf(botimize).track = jest.fn((event, properties) => {
        console.log(event, properties);
      });

      try {
        botimize.logOutgoing(options);
      } catch (error) {
        // TODO(ggm) to have rich error message
        return expect(error.name).toBe('Error');
      }
      expect(undefined).toBe(new Error('should have error'));
    });
  });
});
