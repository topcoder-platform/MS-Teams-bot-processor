/**
 * Initializes the bot controllers
 */

// Load process.env values from .env file
require('dotenv').config()

const config = require('config')
const logger = require('./common/logger')
const bot = require('./src/bot')
const slackEvents = require('./src/slackEvents')
const msTeamsCommands = require('./src/msTeamsCommands')
const msTeamsEvents = require('./src/msTeamsEvents')
const healthCheck = require('./src/healthCheck')

/**
 * Initialize bots and setup events and commands
 */
async function initializeBot () {
  await bot.createBots()

  // Slack events
  bot.initializeSlackEvents([{
    name: 'interactive_message',
    handler: slackEvents.handleInteractiveMessages
  }, {
    name: 'dialog_submission',
    handler: slackEvents.handleDialogSubmission
  }])

  // Ms teams commands
  bot.initializeMsTeamsCommands([{
    name: config.get('COMMANDS.REQUEST'),
    handler: msTeamsCommands.handleRequestCommand
  }, {
    name: config.get('COMMANDS.EMAIL'),
    handler: msTeamsCommands.handleEmailCommand
  }])

  // Ms teams events
  bot.initializeMsTeamsEvents([{
    name: 'message',
    handler: msTeamsEvents.handleMsTeamsEvents
  }])
}

try {
  // Initialize express server routes
  bot.initializeWebServer([{
    method: 'post',
    path: '/v5/topbot-ms/slack/receive',
    handler: slackEvents.handleSlackEvents
  }, {
    method: 'get',
    path: '/v5/topbot-ms/health',
    handler: healthCheck
  }])

  bot.msTeamsController.ready(initializeBot)
} catch (e) {
  logger.logFullError(e)
}
