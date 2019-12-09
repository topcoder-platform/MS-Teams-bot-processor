const { MicrosoftAppCredentials, ConnectorClient, SimpleCredentialProvider, JwtTokenValidation } = require('botframework-connector')
const credentials = new MicrosoftAppCredentials(process.env.APP_ID, process.env.APP_PASSWORD)
const credentialsProvider = new SimpleCredentialProvider(process.env.APP_ID, process.env.APP_PASSWORD)

/**
 * Returns an instance of the slack web api client
 */
function getTeamsClient (serviceUrl = 'https://smba.trafficmanager.net/in/') {
  MicrosoftAppCredentials.trustServiceUrl(serviceUrl)
  return new ConnectorClient(credentials, {
    baseUri: serviceUrl
  })
}

/**
 * Validates incoming request from teams
 * @param {Object} body
 * @param {String} authHeader
 */
async function validateRequest (body, authHeader) {
  try {
    const identity = await JwtTokenValidation.authenticateRequest(body, authHeader, credentialsProvider, '')
    return identity.isAuthenticated
  } catch (e) {
    return false
  }
}

module.exports = {
  getTeamsClient,
  validateRequest
}
