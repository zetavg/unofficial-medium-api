class MediumAccountConnect {
  constructor({ browser, signInLink, cookies } = {}) {
    if (!signInLink && !cookies) {
      throw new Error('Please provied the signInLink or cookies.')
    }

    if (!browser) {
      throw new Error('Please provied a puppeteer browser.')
    }

    this.browser = browser
    this.signInLink = signInLink
    this.cookies = cookies

    this.setup()
  }

  async setup() {
    const { browser, signInLink } = this

    if (signInLink) {
      const page = await browser.newPage()
      await page.goto(signInLink)
      await page.waitFor(1000)
      await this._preserveDataFromPage(page)
      await page.close()
    }

    this.ready = true
  }

  async isAuthorized() {
    await until(() => this.ready)

    const page = await this.browser.newPage()
    await this._preparePage(page)
    await page.goto('https://medium.com/me/settings')
    const url = await page.url()

    await this._preserveDataFromPage(page)
    await page.close()

    return !!url.match(/medium\.com\/me\/settings/)
  }

  async getCookies() {
    await until(() => this.ready)
    let { cookies } = this
    const requiredCookieKeysSet = new Set(['uid', 'sid'])
    cookies = cookies.filter(c => requiredCookieKeysSet.has(c.name))
    cookies = cookies.map(({ name, value, domain }) => ({ name, value, domain }))
    return cookies
  }
  }

  async _preparePage(page) {
    await page.setCookie(...this.cookies)
  }

  async _preserveDataFromPage(page) {
    this.cookies = await page.cookies()
  }
}

module.exports = MediumAccountConnect

const until = (conditionFunc, timeout = 30000, checkInterval = 500) => new Promise((resolve, reject) => {
  const startTime = (new Date()).getTime()

  const checkCondition = () => {
    const condition = conditionFunc()
    if (condition) {
      resolve(condition)
    } else if ((new Date()).getTime() - startTime <= timeout) {
      setTimeout(checkCondition, checkInterval)
    } else {
      reject()
    }
  }

  checkCondition()
})
