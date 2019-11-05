/**
 * Base class which holds the bots and its controllers
 */

const { Botkit } = require('botkit')
const { SlackAdapter, SlackEventMiddleware, SlackMessageTypeMiddleware } = require('botbuilder-adapter-slack')

class Bot {
  constructor () {
    // Create ms teams controller
    this.msTeamsController = new Botkit({
      webhook_uri: '/api/messages',
      adapterConfig: {
        appId: process.env.APP_ID,
        appPassword: process.env.APP_PASSWORD
      }
    })

    // Create slack controller
    const slackAdapter = new SlackAdapter({
      clientSigningSecret: process.env.SIGNING_SECRET,
      botToken: process.env.BOT_TOKEN
    })
    slackAdapter.use(new SlackEventMiddleware())
    slackAdapter.use(new SlackMessageTypeMiddleware())
    this.slackController = new Botkit({
      adapter: slackAdapter,
      disable_webserver: true
    })

    this.msTeamsBot = null
    this.slackBot = null
  }

  /**
   * Initialize slack and ms teams bots
   */
  async createBots () {
    this.slackBot = await this.slackController.spawn(process.env.TEAM)
    this.msTeamsBot = await this.msTeamsController.spawn()
  }

  /**
   * Sets up slack events
   * @param {Array<Object>} events
   */
  initializeSlackEvents (events) {
    events.forEach((event) => {
      this.slackController.on(event.name, event.handler)
    })
  }

  /**
   * Sets up Ms teams events
   * @param {Array<Object>} events
   */
  initializeMsTeamsEvents (events) {
    events.forEach((event) => {
      this.msTeamsController.on(event.name, event.handler)
    })
  }

  /**
   * Sets up Ms Teams commands
   * @param {Array<Object>} commands
   */
  initializeMsTeamsCommands (commands) {
    commands.forEach((command) => {
      this.msTeamsController.hears(command.name, 'message,direct_message', command.handler)
    })
  }

  /**
   * Sets up the routes on the express webserver inside msTeamsController
   * @param {Array<Object>} routes
   */
  initializeWebServer (routes) {
    routes.forEach((route) => {
      this.msTeamsController.webserver[route.method](route.path, route.handler)
    })
  }
}

module.exports = new Bot() // Export singleton instance
