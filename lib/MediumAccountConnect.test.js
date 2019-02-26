const MediumAccountConnect = require('./MediumAccountConnect')

const puppeteer = require('puppeteer')

let browser

const testCookies = JSON.parse(process.env.TEST_COOKIES || '[{"name":"xsrf","value":"06zg3x1F2Go4","domain":"medium.com","path":"/","expires":1551260172.077509,"size":16,"httpOnly":true,"secure":true,"session":false},{"name":"uid","value":"dbc0f304ed33","domain":".medium.com","path":"/","expires":1582709772.501289,"size":15,"httpOnly":true,"secure":true,"session":false},{"name":"_gat","value":"1","domain":".medium.com","path":"/","expires":1551173831,"size":5,"httpOnly":false,"secure":false,"session":false},{"name":"pr","value":"1","domain":"medium.com","path":"/","expires":1551778572,"size":3,"httpOnly":false,"secure":false,"session":false},{"name":"lightstep_guid/medium-web","value":"97af22a61d409b0f","domain":"medium.com","path":"/","expires":1551778572,"size":41,"httpOnly":false,"secure":false,"session":false},{"name":"sz","value":"800","domain":"medium.com","path":"/","expires":1551778572,"size":5,"httpOnly":false,"secure":false,"session":false},{"name":"_ga","value":"GA1.2.1784355546.1551173771","domain":".medium.com","path":"/","expires":1614245773,"size":30,"httpOnly":false,"secure":false,"session":false},{"name":"_parsely_session","value":"{%22sid%22:1%2C%22surl%22:%22https://medium.com/m/callback/email?token=5f145b9edd31&operation=login%22%2C%22sref%22:%22%22%2C%22sts%22:1551173771442%2C%22slts%22:0}","domain":".medium.com","path":"/","expires":1551175572,"size":180,"httpOnly":false,"secure":false,"session":false},{"name":"_parsely_visitor","value":"{%22id%22:%22pid=7c102b596746ebaa178c13ae514291c1%22%2C%22session_count%22:1%2C%22last_session_ts%22:1551173771442}","domain":".medium.com","path":"/","expires":1585337772,"size":131,"httpOnly":false,"secure":false,"session":false},{"name":"sid","value":"1:0R8xcxcyYMXoVeDe19sbpTA1ngwJKRSIupPVe3QqbqGjiOibcoJseJXYf2W89fIw","domain":".medium.com","path":"/","expires":1582709772.501371,"size":69,"httpOnly":true,"secure":true,"session":false},{"name":"lightstep_session_id","value":"74f095fbc2074b56","domain":"medium.com","path":"/","expires":1551778572,"size":36,"httpOnly":false,"secure":false,"session":false},{"name":"_gid","value":"GA1.2.718474192.1551173771","domain":".medium.com","path":"/","expires":1551260173,"size":30,"httpOnly":false,"secure":false,"session":false},{"name":"tz","value":"-480","domain":"medium.com","path":"/","expires":1551778572,"size":6,"httpOnly":false,"secure":false,"session":false},{"name":"__cfduid","value":"dc3c2e5e60f0d49e062232a92b4596b091551173769","domain":".medium.com","path":"/","expires":1582709769.435593,"size":51,"httpOnly":true,"secure":false,"session":false}]')

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
      const mediumAccountConnect = new MediumAccountConnect({ browser, cookies: [{ name: 'sid', value: 'invalid-sid', domain: '.medium.com', path: '/' }] })
      expect(await mediumAccountConnect.isAuthorized()).toBe(false)
    })
  })
})
