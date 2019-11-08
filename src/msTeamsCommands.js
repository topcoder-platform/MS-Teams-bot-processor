/**
 * Handlers all the commands issued in Ms Teams
 */

const config = require('config')
const uuid = require('uuid/v4')
const fetch = require('node-fetch')
const HttpStatus = require('http-status-codes')
const bot = require('./bot')
const store = require('./store')
const logger = require('../common/logger')

const CONSTANTS = config.get('CONSTANTS')
const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i // eslint-disable-line

/**
 * Handles the @topbot request command from MS Teams
 * @param {Object} msTeamsBot the MS teams bot
 * @param {Object} message the received message
 */
async function handleRequestCommand (msTeamsBot, message) {
  try {
    const request = message.text.replace(config.get('COMMANDS.REQUEST'), '').trim()

    // If project description is empty, post error
    if (request.length === 0) {
      return msTeamsBot.reply(message, CONSTANTS.PROJECT_DESCRIPTION_EMPTY)
    }

    // Build slack message
    const requester = message.reference.user.name
    const text = CONSTANTS.CREATE_SLACK_REQUEST(requester, request)
    const id = uuid()

    // Post message to slack
    const slackMessage = await bot.slackBot.api.chat.postMessage({
      channel: process.env.CHANNEL,
      text,
      mrkdwn: true,
      attachments: [
        {
          fallback: CONSTANTS.POST_RESPONSE_BUTTON.FALLBACK,
          callback_id: id,
          attachment_type: 'default',
          actions: [{
            name: CONSTANTS.POST_RESPONSE_BUTTON.NAME,
            text: CONSTANTS.POST_RESPONSE_BUTTON.TEXT,
            type: 'button'
          }]
        }]
    })

    // Add request to pending list. We store the id of the button, reference to the ms teams message and a reference to the slack message
    store.set(id, {
      msTeamsMessage: message.reference,
      slackMessage: slackMessage,
      description: request,
      responded: false
    })

    // Post acknowledgement to ms teams
    await msTeamsBot.reply(message, CONSTANTS.REQUEST_RECEIVED_MESSAGE(request))
  } catch (e) {
    logger.logFullError(e)
  }
}

/**
 * Handles the @topbot email command from MS Teams
 * @param {Object} msTeamsBot
 * @param {Object} message
 */
async function handleEmailCommand (msTeamsBot, message) {
  try {
    // Get context
    const teamsChannel = message.teamsChannelId
    const activityId = message.channel.replace(`${teamsChannel};messageid=`, '')
    // Find request
    let request = null
    store.forEach((r) => {
      if ((r.msTeamsMessage || {}).activityId === activityId) {
        request = r
      }
    })
    if (!request || !request.projectId) {
      return msTeamsBot.say(CONSTANTS.EMAIL_COMMAND_IN_REQUEST_ONLY)
    }

    // Validate email
    const email = message.text.replace(config.get('COMMANDS.EMAIL'), '').trim()
    if (!emailRegex.test(email)) {
      return msTeamsBot.say(CONSTANTS.ENTER_VALID_EMAIL)
    }

    // Invite member to project using the Connect API
    const response = await fetch(config.get('CONNECT.INVITE_MEMBER')(request.projectId), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BEARER_TOKEN}`
      },
      body: JSON.stringify({
        param: {
          emails: [email],
          role: config.get('CONNECT.INVITE_ROLE')
        }
      })
    })
    const invite = await response.json()

    // Error
    if (response.status !== HttpStatus.CREATED) {
      const content = (((invite || {}).result || {}).content || {})
      const errorMessage = `${CONSTANTS.COULD_NOT_INVITE_USER}. ${content.message || (content.failed || [])[0].message || ''}`
      return msTeamsBot.say(errorMessage)
    }

    // Post invited user message to Slack
    await bot.slackBot.api.chat.postMessage({
      channel: request.slackMessage.channel,
      thread_ts: request.slackMessage.ts,
      text: CONSTANTS.USER_INVITED(email)
    })

    // Post success acknowledgement to Teams
    await msTeamsBot.say(CONSTANTS.INVITE_SUCCESS(email, config.get('CONNECT.PROJECT_URI')(request.projectId)))
  } catch (e) {
    logger.logFullError(e)
  }
}

module.exports = {
  handleRequestCommand,
  handleEmailCommand
}
