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
    REQUEST: buildCommandRegex('request'),
    EMAIL: buildCommandRegex('email')
  },
  CONSTANTS: { // String constants
    PROJECT_DESCRIPTION_EMPTY: 'Project</b> description cannot be empty. Please provide a project description message.',
    REQUEST_RECEIVED_MESSAGE: (request) => `**Request:** "${request}" sent!`,
    CREATE_SLACK_REQUEST: (requester, request) => `*Request from ${requester}:*   \n ${request}`,
    REQUEST_IS_NOT_AVAILABLE: 'This request is not available any more',
    RESPONSE_MESSAGE: (responder, response) => `*@${responder}* from *${process.env.TEAM}* team responded to your request with response, "${response}"`,
    RESPONSE_POSTED: (response) => `*Response*: "${response}" was successfully posted`,
    PROJECT_RESPONSE_EMPTY: 'Your response cannot be empty. Please provide a valid response.',
    PROJECT_ACCEPTED: 'Project has been accepted',
    ACCEPT_CLICKED: 'Successfully initiated project creation. You will be notified once it is created',
    PROJECT_CREATED: 'Project successfully created',
    ALREADY_RESPONDED: 'You have already responded to the request',
    PROJECT_ALREADY_ACCEPTED: 'You have already accepted the project',
    PROJECT_DECLINED: 'Sorry, the client declined the project.',
    PROJECT_ALREADY_DECLINED: 'You have already declined the project',
    ACCEPTED_CLICKED_ERROR: 'You can only Accept a project once',
    DECLINED_CLICKED_ERROR: 'Project has already been declined',
    COULD_NOT_CREATE_PROJECT: 'Project could not be created.',
    NAME_PROVIDED_ALREADY: 'You have already provided the project name',
    COULD_NOT_INVITE_USER: 'Invite could not be sent',
    INVITE_SUCCESS: (email, connectUri) => `User with email ${email} has been successfully invited to the project. You can access the project at [Connect](${connectUri})`,
    ENTER_VALID_EMAIL: 'The provided email id is invalid. Please enter a valid email id',
    USER_INVITED: (email) => `User with email ${email} has been invited to the project`,
    PROMPT_FOR_EMAIL: (projectName) => `Your project has been created with name *${projectName}*. Kindly provide an email using command *@topbot email your_email* to get an invite`,
    REQUEST_DOES_NOT_EXIST: 'Request does not exist',
    EMAIL_COMMAND_IN_REQUEST_ONLY: 'The email command can only be used inside a a valid project request',
    POST_RESPONSE_BUTTON: {
      TEXT: 'Post a response',
      NAME: 'createResponse',
      FALLBACK: 'Click the button to post a response'
    },
    POST_PROJECT_NAME_BUTTON: {
      TEXT: 'Provide a project name',
      NAME: 'createProjectName',
      FALLBACK: 'Click the button to provide a project name'
    },
    TEXT_AREA_PROJECT_DESCRIPTION: {
      TITLE: 'Respond to request',
      SUBMIT_BUTTON_TEXT: 'Post',
      LABEL: 'Response',
      NAME: 'response',
      TYPE: 'projectDescriptionResponse'
    },
    TEXT_AREA_PROJECT_NAME: {
      TITLE: 'Enter a project name',
      SUBMIT_BUTTON_TEXT: 'Post',
      LABEL: 'Project name',
      NAME: 'projectName',
      TYPE: 'projectNameResponse'
    },
    ACCEPT_BUTTON: {
      TEXT: 'Accept'
    },
    DECLINE_BUTTON: {
      TEXT: 'Decline'
    },
    SEPERATOR: '_'
  },
  LOG_LEVEL: 'error', // Winston log level
  CONNECT: { // Topcoder Connect configurations
    CREATE_PROJECT: 'https://api.topcoder-dev.com/v4/projects',
    INVITE_MEMBER: (projectId) => `https://api.topcoder-dev.com/v4/projects/${projectId}/members/invite`,
    PROJECT_URI: (projectId) => `https://connect.topcoder-dev.com/projects/${projectId}`,
    PROJECT_TYPE: 'app',
    INVITE_ROLE: 'customer'
  }
}
