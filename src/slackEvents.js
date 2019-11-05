/**
 * Handles all events from Slack to the bot
 */
const config = require('config')
const HttpStatus = require('http-status-codes')
const { SlackDialog } = require('botbuilder-adapter-slack')
const fetch = require('node-fetch')
const store = require('./store')
const bot = require('./bot')
const logger = require('../common/logger')

const CONSTANTS = config.get('CONSTANTS')

/**
 * Handles interactive Slack messages like button clicks
 * @param {Object} slackBot Slack bot
 * @param {Object} message The message received
 */
async function handleInteractiveMessages (slackBot, message) {
  try {
    switch (message.actions[0].name) {
      // Clicked on Post a response button
      case CONSTANTS.POST_RESPONSE_BUTTON.NAME:
        {
          const id = message.incoming_message.channelData.callback_id
          const request = store.get(id)
          // Check if request is present
          if (request) {
            // Check if request has a response
            if (!request.responded) {
              // If not responded, create a text area for response
              const TEXT_AREA = CONSTANTS.TEXT_AREA_PROJECT_DESCRIPTION
              const dialog = new SlackDialog(TEXT_AREA.TITLE, id, TEXT_AREA.SUBMIT_BUTTON_TEXT).addTextarea(TEXT_AREA.LABEL, TEXT_AREA.NAME)
              dialog.state(JSON.stringify({
                type: TEXT_AREA.TYPE
              }))
              await slackBot.replyWithDialog(message, dialog.asObject())
            } else {
              // Otherwise, show an error message
              await slackBot.api.chat.postMessage({
                channel: request.slackMessage.channel,
                thread_ts: request.slackMessage.ts,
                text: CONSTANTS.ALREADY_RESPONDED
              })
            }
          } else {
            return slackBot.api.chat.postMessage({
              channel: message.channel,
              thread_ts: message.message_ts,
              text: CONSTANTS.REQUEST_DOES_NOT_EXIST
            })
          }
        }
        break
      // Handles click on the "Provide project name" button
      case CONSTANTS.POST_PROJECT_NAME_BUTTON.NAME:
        {
          const id = message.incoming_message.channelData.callback_id.split(CONSTANTS.SEPERATOR)[0]
          const request = store.get(id)
          if (request) {
            // Can only provide name once
            if (request.projectNameProvided) {
              return slackBot.api.chat.postMessage({
                channel: request.slackMessage.channel,
                thread_ts: request.slackMessage.ts,
                text: CONSTANTS.NAME_PROVIDED_ALREADY
              })
            }
            // Show dialog
            const TEXT_AREA = CONSTANTS.TEXT_AREA_PROJECT_NAME
            const dialog = new SlackDialog(TEXT_AREA.TITLE, id, TEXT_AREA.SUBMIT_BUTTON_TEXT).addTextarea(TEXT_AREA.LABEL, TEXT_AREA.NAME)
            dialog.state(JSON.stringify({
              type: TEXT_AREA.TYPE
            }))
            await slackBot.replyWithDialog(message, dialog.asObject())
          } else {
            return slackBot.api.chat.postMessage({
              channel: message.channel,
              thread_ts: message.message_ts,
              text: CONSTANTS.REQUEST_DOES_NOT_EXIST
            })
          }
        }
        break
      default:
    }
  } catch (e) {
    logger.logFullError(e)
  }
}

/**
 * Handles the project description dialog submission/post
 * @param {Object} slackBot
 * @param {Object} message
 */
async function handleProjectDescriptionDialogSubmission (slackBot, message) {
  try {
    const id = message.incoming_message.channelData.callback_id
    const request = store.get(id)
    // Check if request is present
    if (request) {
      // Check if request has a response
      if (!request.responded) {
        // If response is not present, accept response from dialog
        const responder = message.incoming_message.channelData.user.name
        const response = message.submission.response.trim()

        // If response is empty, post error, keep the request with responded set to false
        if (response.length === 0) {
          return slackBot.api.chat.postMessage({
            channel: request.slackMessage.channel,
            thread_ts: request.slackMessage.ts,
            text: CONSTANTS.PROJECT_RESPONSE_EMPTY
          })
        }

        // Post response to ms teams
        const buttonValue = JSON.stringify({
          requestId: id
        })
        const msTeamsBot = bot.msTeamsBot
        await msTeamsBot.changeContext(request.msTeamsMessage)
        // Create a card with accept and decline buttons
        await msTeamsBot.say({
          text: CONSTANTS.RESPONSE_MESSAGE(responder, response),
          attachments: [{
            contentType: 'application/vnd.microsoft.card.hero',
            content: {
              buttons: [{
                type: 'messageBack',
                value: buttonValue,
                text: CONSTANTS.ACCEPT_BUTTON.TEXT
              }, {
                type: 'messageBack',
                value: buttonValue,
                text: CONSTANTS.DECLINE_BUTTON.TEXT
              }]
            }
          }]
        })

        request.accepted = false
        request.declined = false

        // Post acknowledgement to slack
        await slackBot.api.chat.postMessage({
          channel: request.slackMessage.channel,
          thread_ts: request.slackMessage.ts,
          text: CONSTANTS.RESPONSE_POSTED(response)
        })

        // Set responded to true
        request.responded = true
      } else {
        // Otherwise, show an error message
        await slackBot.api.chat.postMessage({
          channel: request.slackMessage.channel,
          thread_ts: request.slackMessage.ts,
          text: CONSTANTS.REQUEST_IS_NOT_AVAILABLE
        })
      }
    }
  } catch (e) {
    logger.logFullError(e)
  }
}

/**
 * Handles the provide a project name dialog submission/post
 * @param {Object} slackBot
 * @param {Object} message
 */
async function handleProjectNameDialogSubmission (slackBot, message) {
  try {
    // Get root request
    const id = message.incoming_message.channelData.callback_id
    const request = store.get(id)
    if (!request) {
      return slackBot.api.chat.postMessage({
        channel: request.slackMessage.channel,
        thread_ts: request.slackMessage.ts,
        text: CONSTANTS.REQUEST_IS_NOT_AVAILABLE
      })
    }

    // Validate project name
    const projectName = message.submission.projectName.trim()
    if (projectName.length === 0) {
      return slackBot.api.chat.postMessage({
        channel: request.slackMessage.channel,
        thread_ts: request.slackMessage.ts,
        text: CONSTANTS.PROJECT_RESPONSE_EMPTY
      })
    }

    // Create a project using Connect API
    const response = await fetch(config.get('CONNECT.CREATE_PROJECT'), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.BEARER_TOKEN}`
      },
      body: JSON.stringify({
        param: {
          name: projectName,
          description: request.description,
          type: config.get('CONNECT.PROJECT_TYPE')
        }
      })
    })
    const project = await response.json()

    // Error
    if (response.status !== HttpStatus.CREATED) {
      const errorMessage = `${CONSTANTS.COULD_NOT_CREATE_PROJECT} ${(((project || {}).result || {}).content || {}).message || ''}`
      await slackBot.api.chat.postMessage({
        channel: request.slackMessage.channel,
        thread_ts: request.slackMessage.ts,
        text: errorMessage
      })
      return bot.msTeamsBot.say(errorMessage)
    }

    const projectId = (((project || {}).result || {}).content || {}).id
    if (!projectId) {
      await slackBot.api.chat.postMessage({
        channel: request.slackMessage.channel,
        thread_ts: request.slackMessage.ts,
        text: CONSTANTS.COULD_NOT_CREATE_PROJECT
      })
      return bot.msTeamsBot.say(CONSTANTS.COULD_NOT_CREATE_PROJECT)
    }

    // Post success to slack
    await slackBot.api.chat.postMessage({
      channel: request.slackMessage.channel,
      thread_ts: request.slackMessage.ts,
      text: CONSTANTS.PROJECT_CREATED
    })
    // Show success message and prompt for email
    await bot.msTeamsBot.say(CONSTANTS.PROMPT_FOR_EMAIL(projectName))
    request.projectId = projectId
    request.projectNameProvided = true
  } catch (e) {
    logger.error(e)
  }
}

/**
 * Root dispatcher for Slack dialog submission events
 * @param {Object} slackBot Slack bot
 * @param {Object} message message received
 */
async function handleDialogSubmission (slackBot, message) {
  try {
    const type = JSON.parse(message.state).type
    switch (type) {
      case CONSTANTS.TEXT_AREA_PROJECT_DESCRIPTION.TYPE:
        await handleProjectDescriptionDialogSubmission(slackBot, message)
        break
      case CONSTANTS.TEXT_AREA_PROJECT_NAME.TYPE:
        await handleProjectNameDialogSubmission(slackBot, message)
        break
      default:
    }
  } catch (e) {
    logger.logFullError(e)
  }
}

/**
 * Handles POST messages to /slack/receive from Slack events api
 * @param {Object} req the HTTP request object
 * @param {Object} res the HTTP response object
 */
async function handleSlackEvents (req, res) {
  try {
    // Pass the webhook event into the controller to be processed
    await bot.slackController.adapter.processActivity(req, res, async (context) => {
      if (context) {
        if (context._activity.channelData.type === 'interactive_message') context._activity.channelData.botkitEventType = 'interactive_message'
        res.json() // Tell slack that the event was successfully received
        await bot.slackController.handleTurn(context)
      }
    })
  } catch (e) {
    logger.logFullError(e)
  }
}

module.exports = {
  handleInteractiveMessages,
  handleDialogSubmission,
  handleSlackEvents
}
