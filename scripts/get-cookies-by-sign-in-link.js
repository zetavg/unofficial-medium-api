/**
 * Get authenticated cookies by a sing in link
 *
 * Usage: node get-cookies-by-sign-in-link.js 'login_link_here'
 */

const MediumAccountConnect = require('../lib/MediumAccountConnect')

const puppeteer = require('puppeteer')

const signInLink = process.argv[2]

const exec = async () => {
  if (!signInLink) {
    console.error('Error: Please provide a sign in link via argument')
    throw new Error()
  }

  const browser = await puppeteer.launch({ devtools: !!process.env.ENABLE_DEVTOOLS })
  const mediumAccountConnect = new MediumAccountConnect({ browser, signInLink })
  const cookies = await mediumAccountConnect.getCookies()
  const isAuthenticated = await mediumAccountConnect.isAuthenticated()

  if (!isAuthenticated) {
    console.error('Error: The sign in link does not work!')
    throw new Error()
  }

  console.log(JSON.stringify(cookies))
}

exec().then(() => process.exit()).catch(() => process.exit(1))
