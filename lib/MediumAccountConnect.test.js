const MediumAccountConnect = require('./MediumAccountConnect')

const puppeteer = require('puppeteer')

let browser

const testCookies = JSON.parse(process.env.TEST_COOKIES || '[{"name":"uid","value":"dbc0f304ed33","domain":".medium.com"},{"name":"sid","value":"1:tsM+kOgvdWR7tq4hEnNI3C4Nf7ek0QVHDjKX10czlArlUVgupXW6aK9aOyj1+MLY","domain":".medium.com"}]')

describe('MediumAccountConnect', () => {
  beforeAll(async () => {
    jest.setTimeout(30000)
    browser = await puppeteer.launch({ devtools: !!process.env.ENABLE_DEVTOOLS })
  })

  afterAll(async () => {
    browser.close()
  })

  test('Throws a new error if no signInLink or cookie is provided', () => {
    expect(() => {
      new MediumAccountConnect()
    }).toThrow()
  })

  test('Throws a new error if no browser is provided', () => {
    expect(() => {
      new MediumAccountConnect()
    }).toThrow()
  })

  describe('.isAuthorized()', () => {
    test('Asynchronously returns true if authorized', async () => {
      const mediumAccountConnect = new MediumAccountConnect({ browser, cookies: testCookies })
      expect(await mediumAccountConnect.isAuthorized()).toBe(true)
    })

    test('Asynchronously returns false if not authorized', async () => {
      const mediumAccountConnect = new MediumAccountConnect({ browser, cookies: [{ name: 'sid', value: 'invalid-sid', domain: '.medium.com' }] })
      expect(await mediumAccountConnect.isAuthorized()).toBe(false)
    })
  })
})
