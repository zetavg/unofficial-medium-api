const fetch = require('node-fetch')

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

  async getCookies() {
    await until(() => this.ready)
    let { cookies } = this
    const requiredCookieKeysSet = new Set(['uid', 'sid'])
    cookies = cookies.filter(c => requiredCookieKeysSet.has(c.name))
    cookies = cookies.map(({ name, value, domain }) => ({ name, value, domain }))
    return cookies
  }

  async getCookieHeader() {
    return (await this.getCookies()).map(c => `${c.name}=${c.value}`).join('; ')
  }

  async authenticatedFetch(input, init = {}) {
    const cookie = await this.getCookieHeader()
    return fetch(input, Object.assign({}, init, {
      headers: Object.assign({ 'Content-Type': 'application/json' }, init.headers, {
        cookie,
      }),
    }))
  }

  async isAuthenticated() {
    const results = await this.authenticatedFetch('https://medium.com/_/grout/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: `
          {
            viewer {
              id
            }
          }
        `,
      }),
    }).then(r => r.json())

    return !!results.data.viewer
  }

  async isAuthenticatedSlow() {
    await until(() => this.ready)

    const page = await this.browser.newPage()
    await this._preparePage(page)
    await page.goto('https://medium.com/me/settings')
    const url = await page.url()

    await this._preserveDataFromPage(page)
    await page.close()

    return !!url.match(/medium\.com\/me\/settings/)
  }

  async getAccountData() {
    await until(() => this.ready)

    const page = await this.browser.newPage()
    await this._prepareAuthenticatedPage(page)

    const result = await page.evaluate(() => fetch('/_/grout/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          {
            viewer {
              id
              bio
              name
              username
              userPostCounts {
                allPosts
                draftPosts
                publishedPosts
                unlistedPosts
              }
            }
          }
        `,
      }),
    }).then(r => r.json()))

    await this._preserveDataFromPage(page)
    await page.close()

    return result.data.viewer
  }

  async createStory(markdown) {
    const page = await this.browser.newPage()
    try {
      await this._prepareAuthenticatedPage(page)

      await page.goto('https://medium.com/new-story')

      const title = 'Test Title'
      const content = 'Test content.'

      const wd = await page.evaluate(() => {
        // navigator.webdriver = undefined
        return navigator.webdriver
      })

console.log('0', wd)
console.log('0', wd)
await page.screenshot({path: 'a.png'})
await page.waitFor(3000)
await page.screenshot({path: 'b.png'})
await page.waitFor(3000)
await page.screenshot({path: 'c.png'})
      await page.waitForSelector('.postArticle-content .graf--title')
      await page.waitForSelector('.postArticle-content .graf--p')
console.log('1')
console.log('1')
      await page.evaluate(({
        title,
        content,
      }) => {
        const titleElement = document.querySelector('.postArticle-content .graf--title')
        const firstPElement = document.querySelector('.postArticle-content .graf--p')

        titleElement.innerHTML = title
        firstPElement.innerHTML = content
      }, {
        title,
        content,
      })
console.log('a')
console.log('a')
      await page.waitForXPath('/html/head/link[@rel="canonical"][@href!="/new-story"]')
      await page.waitFor(10)
console.log('b')
console.log('b')

      const pageURL = await page.url()
      const storyID = pageURL.match(/\/p\/([0-9a-z]+)\/edit/)[1]

      await page.click('.siteNav-logo')
      await page.waitForXPath('/html/head/link[@rel="canonical"][@href="/"]')
console.log('c')
console.log('c')

      await this._ensureWorkDoneOfPage(page)
      await this._preserveDataFromPage(page)

      return storyID
    } finally {
      await page.close()
    }
  }

  async _preparePage(page) {
    await page.setCookie(...(await this.getCookies()))
  }

  async _prepareAuthenticatedPage(page) {
    await page.setCookie(...(await this.getCookies()))
    await page.goto('https://medium.com/me/settings')
    const url = await page.url()
    if (!url.match(/medium\.com\/me\/settings/)) {
      throw new Error('Not Authenticated')
    }

    await this._preserveDataFromPage(page)
    return page
  }

  async _ensureWorkDoneOfPage(page) {
    await page.click('.siteNav-logo')
    await page.waitForXPath('/html/head/link[@rel="canonical"][@href="/"]')
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
