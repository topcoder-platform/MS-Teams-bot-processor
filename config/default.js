/**
 * Configuration options
 */

/**
 * Builds a regex for the MS Teams controller to match a command name
 * @param {String} command
 */
function buildCommandRegex (command) {
  // Message text has format, "<at>Name of bot</at> command "
  return new RegExp('^<at>.*</at> '.concat(command).concat(' '), 'm')
}

module.exports = {
  COMMANDS: { // List of commands
    REQUEST: buildCommandRegex('request')
  },
  CONSTANTS: { // String constants
    PROJECT_DESCRIPTION_EMPTY: 'Project</b> description cannot be empty. Please provide a project description message.',
    REQUEST_RECEIVED_MESSAGE: (request) => `**Request:** "${request}" sent!`,
    CREATE_SLACK_REQUEST: (requester, request) => `*Request from ${requester}:*   \n ${request}`,
    ALREADY_RESPONDED_MESSAGE: 'This request is not available any more',
    RESPONSE_MESSAGE: (responder, response) => `*@${responder}* from *${process.env.TEAM}* team responded to your request with,    \n **Response:** "${response}"`,
    RESPONSE_POSTED: (response) => `*Response*: "${response}" was successfully posted`,
    PROJECT_RESPONSE_EMPTY: 'Your response cannot be empty. Please provide a valid response.',
    POST_RESPONSE_BUTTON: {
      TEXT: 'Post a response',
      NAME: 'createResponse',
      FALLBACK: 'Click the button to post a response'
    },
    TEXT_AREA: {
      TITLE: 'Respond to request',
      SUBMIT_BUTTON_TEXT: 'Post',
      LABEL: 'Response',
      NAME: 'response'
    }
  },
  LOG_LEVEL: 'error'
}
