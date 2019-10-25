/**
 * Initializes the bot controllers
 */

const { Botkit } = require('botkit')
const { SlackAdapter, SlackEventMiddleware, SlackMessageTypeMiddleware } = require('botbuilder-adapter-slack')
const handlers = require('./src/handlers')
const logger = require('./common/logger')

// Load process.env values from .env file
require('dotenv').config()

// Create ms teams controller
try {
  const msTeamsController = new Botkit({
    webhook_uri: '/api/messages',
    adapterConfig: {
      appId: process.env.APP_ID,
      appPassword: process.env.APP_PASSWORD
    }
  })

  // Create slack adapter
  const adapter = new SlackAdapter({
    clientSigningSecret: process.env.SIGNING_SECRET,
    botToken: process.env.BOT_TOKEN
  })
  adapter.use(new SlackEventMiddleware())
  adapter.use(new SlackMessageTypeMiddleware())

  // Create slack controller
  const slackController = new Botkit({
    adapter,
    disable_webserver: true
  })

  // Initialize handlers
  handlers.initialize(slackController, msTeamsController)
  msTeamsController.webserver.post('/slack/receive', handlers.handleSlackEvents)
  msTeamsController.webserver.get('/health', handlers.healthCheck)
  msTeamsController.ready(handlers.handleMsTeamsReady)
} catch (e) {
  logger.logFullError(e)
}
