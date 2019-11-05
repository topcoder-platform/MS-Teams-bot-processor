/**
 * Handlers events from Ms teams to the bot
 */
const config = require('config')
const bot = require('./bot')
const store = require('./store')
const logger = require('../common/logger')

const CONSTANTS = config.get('CONSTANTS')

/**
 * Handles the click on Accept button
 * @param {Object} msTeamsBot
 * @param {String} requestId
 */
async function handleProjectAccept (msTeamsBot, requestId) {
  try {
    const request = store.get(requestId)
    if (!request) {
      return msTeamsBot.say(CONSTANTS.REQUEST_DOES_NOT_EXIST)
    }

    // Cannot accept after declining
    if (request.declined) {
      return msTeamsBot.say(CONSTANTS.PROJECT_ALREADY_DECLINED)
    }

    // Can click on accept only once
    if (request.accepted) {
      return msTeamsBot.say(CONSTANTS.ACCEPTED_CLICKED_ERROR)
    }

    // Post message to get the project name to slack
    await bot.slackBot.api.chat.postMessage({
      channel: process.env.CHANNEL,
      text: CONSTANTS.PROJECT_ACCEPTED,
      thread_ts: request.slackMessage.ts,
      mrkdwn: true,
      attachments: [
        {
          fallback: CONSTANTS.POST_PROJECT_NAME_BUTTON.FALLBACK,
          callback_id: `${requestId}${CONSTANTS.SEPERATOR}${CONSTANTS.POST_PROJECT_NAME_BUTTON.NAME}`,
          attachment_type: 'default',
          actions: [{
            name: CONSTANTS.POST_PROJECT_NAME_BUTTON.NAME,
            text: CONSTANTS.POST_PROJECT_NAME_BUTTON.TEXT,
            type: 'button'
          }]
        }]
    })

    // Post acknowledgement to teams
    await msTeamsBot.say(CONSTANTS.ACCEPT_CLICKED)
    request.accepted = true
    request.projectNameProvided = false
  } catch (e) {
    logger.logFullError(e)
  }
}

/**
 * Handles click on the Decline button
 * @param {Object} msTeamsBot
 * @param {String} requestId
 */
async function handleProjectDecline (msTeamsBot, requestId) {
  try {
    const request = store.get(requestId)
    if (!request) {
      return msTeamsBot.say(CONSTANTS.REQUEST_DOES_NOT_EXIST)
    }

    // Cannot decline after accepting
    if (request.accepted) {
      return msTeamsBot.say(CONSTANTS.PROJECT_ALREADY_ACCEPTED)
    }

    // Already declined
    if (request.declined) {
      return msTeamsBot.say(CONSTANTS.DECLINED_CLICKED_ERROR)
    }

    // Post declined message to slack
    await bot.slackBot.api.chat.postMessage({
      channel: request.slackMessage.channel,
      thread_ts: request.slackMessage.ts,
      text: CONSTANTS.PROJECT_DECLINED
    })

    request.declined = true
  } catch (e) {
    logger.logFullError(e)
  }
}

/**
 * Root dispatcher for all events
 * @param {Object} msTeamsBot
 * @param {Object} message
 */
async function handleMsTeamsEvents (msTeamsBot, message) {
  const requestId = (message.value || {}).requestId
  if (requestId) {
    const button = message.text
    switch (button) {
      case CONSTANTS.ACCEPT_BUTTON.TEXT:
        await handleProjectAccept(msTeamsBot, requestId)
        break
      case CONSTANTS.DECLINE_BUTTON.TEXT:
        await handleProjectDecline(msTeamsBot, requestId)
        break
      default:
    }
  }
}

module.exports = {
  handleMsTeamsEvents
}
