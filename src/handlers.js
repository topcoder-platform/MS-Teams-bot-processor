/**
 * Handlers bot events
 */

const config = require('config')
const uuid = require('uuid/v4')
const { SlackDialog } = require('botbuilder-adapter-slack')
const logger = require('../common/logger')

let slackController = null
let msTeamsController = null
let slackBot = null
const requests = new Map()

const COMMANDS = config.get('COMMANDS')
const CONSTANTS = config.get('CONSTANTS')

/**
 * Set values of controllers
 * @param {Object} _slackController slack controller instance
 * @param {Object} _msTeamsController ms teams controller instance
 */
function initialize (_slackController, _msTeamsController) {
  slackController = _slackController
  msTeamsController = _msTeamsController
}

/**
 * Handles POST messages to /slack/receive from Slack events api
 * @param {Object} req the HTTP request object
 * @param {Object} res the HTTP response object
 */
async function handleSlackEvents (req, res) {
  try {
    // Pass the webhook event into the controller to be processed
    await slackController.adapter.processActivity(req, res, async (context) => {
      if (context) {
        if (context._activity.channelData.type === 'interactive_message') context._activity.channelData.botkitEventType = 'interactive_message'
        await slackController.handleTurn(context)
      }
    })
  } catch (e) {
    logger.logFullError(e)
  }
}

/**
 * Handles interactive Slack messages like button clicks
 * @param {Object} bot Slack bot
 * @param {Object} message The message received
 */
async function handleInteractiveMessages (bot, message) {
  try {
    switch (message.actions[0].name) {
      // Clicked on Post a response button
      case CONSTANTS.POST_RESPONSE_BUTTON.NAME:
        {
          const id = message.incoming_message.channelData.callback_id
          const request = requests.get(id)
          // Check if request is present
          if (request) {
            // Check if request has a response
            if (!request.responded) {
              // If not responded, create a text area for response
              const TEXT_AREA = CONSTANTS.TEXT_AREA
              const dialog = new SlackDialog(TEXT_AREA.TITLE, id, TEXT_AREA.SUBMIT_BUTTON_TEXT).addTextarea(TEXT_AREA.LABEL, TEXT_AREA.NAME)
              await bot.replyWithDialog(message, dialog.asObject())
            } else {
              // Otherwise, show an error message
              await bot.api.chat.postMessage({
                channel: request.slackMessage.channel,
                thread_ts: request.slackMessage.ts,
                text: CONSTANTS.ALREADY_RESPONDED_MESSAGE
              })
            }
          }
        }
        break
    }
  } catch (e) {
    logger.logFullError(e)
  }
}

/**
 * Handles Slack dialog submission events like clicking Post in a text area
 * @param {Object} bot Slack bot
 * @param {Object} message message received
 */
async function handleDialogSubmission (bot, message) {
  try {
    const id = message.incoming_message.channelData.callback_id
    const request = requests.get(id)
    // Check if request is present
    if (request) {
      // Check if request has a response
      if (!request.responded) {
        // If response is not present, accept response from dialog
        const responder = message.incoming_message.channelData.user.name
        const response = message.submission.response.trim()

        // If response is empty, post error, keep the request with responded set to false
        if (response.length === 0) {
          return bot.api.chat.postMessage({
            channel: request.slackMessage.channel,
            thread_ts: request.slackMessage.ts,
            text: CONSTANTS.PROJECT_RESPONSE_EMPTY
          })
        }

        // Post response to ms teams
        const msTeamsBot = await msTeamsController.spawn()
        await msTeamsBot.changeContext(request.msTeamsMessage)
        await msTeamsBot.say(CONSTANTS.RESPONSE_MESSAGE(responder, response))

        // Post acknowledgement to slack
        await bot.api.chat.postMessage({
          channel: request.slackMessage.channel,
          thread_ts: request.slackMessage.ts,
          text: CONSTANTS.RESPONSE_POSTED(response)
        })

        // Set responded to true
        request.responded = true
      } else {
        // Otherwise, show an error message
        await bot.api.chat.postMessage({
          channel: request.slackMessage.channel,
          thread_ts: request.slackMessage.ts,
          text: CONSTANTS.ALREADY_RESPONDED_MESSAGE
        })
      }
    }
  } catch (e) {
    logger.logFullError(e)
  }
}

/**
 * Handles the @topbot request command from MS Teams
 * @param {Object} bot the MS teams bot
 * @param {Object} message the received message
 */
async function handleRequestCommand (bot, message) {
  try {
    const request = message.text.replace(COMMANDS.REQUEST, '').trim()

    // If project description is empty, post error
    if (request.length === 0) {
      return bot.reply(message, CONSTANTS.PROJECT_DESCRIPTION_EMPTY)
    }

    // Build slack message
    const requester = message.reference.user.name
    const text = CONSTANTS.CREATE_SLACK_REQUEST(requester, request)
    const id = uuid()

    // Post message to slack
    const slackMessage = await slackBot.api.chat.postMessage({
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
    requests.set(id, {
      msTeamsMessage: message.reference,
      slackMessage: slackMessage,
      responded: false
    })

    // Post acknowledgement to ms teams
    await bot.reply(message, CONSTANTS.REQUEST_RECEIVED_MESSAGE(request))
  } catch (e) {
    logger.logFullError(e)
  }
}

/**
 * On ready function for MS Teams controller
 */
async function handleMsTeamsReady () {
  try {
    slackBot = await slackController.spawn(process.env.TEAM)
    slackController.on('interactive_message', handleInteractiveMessages)
    slackController.on('dialog_submission', handleDialogSubmission)
    msTeamsController.hears(COMMANDS.REQUEST, 'message,direct_message', handleRequestCommand)
  } catch (e) {
    logger.logFullError(e)
  }
}

async function healthCheck (req, res) {
  try {
    // Pass the webhook event into the controller to be processed
    await res.json({ ok: true })
  } catch (e) {
    logger.logFullError(e)
  }
}

module.exports = {
  initialize,
  handleSlackEvents,
  handleMsTeamsReady,
  healthCheck
}
