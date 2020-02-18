const AWS = require('aws-sdk')
const { MicrosoftAppCredentials, ConnectorClient } = require('botframework-connector')
const credentials = new MicrosoftAppCredentials(process.env.APP_ID, process.env.APP_PASSWORD)

const { SimpleCredentialProvider, JwtTokenValidation } = require('botframework-connector')
const credentialsProvider = new SimpleCredentialProvider(process.env.CLIENT_TEAMS_APP_ID, process.env.CLIENT_TEAMS_APP_PASSWORD)

/**
 * Returns an instance of the sns client
 */
function getSnsClient () {
  const snsConfig = {
    region: process.env.SNS_REGION
  }
  // use endpoint value when doing local setup
  if (process.env.IS_OFFLINE) {
    snsConfig.endpoint = process.env.SNS_ENDPOINT
  }
  return new AWS.SNS(snsConfig)
}

/**
 * Creates an arn from topic name
 * @param {String} topic
 */
function getArnForTopic (topic) {
  return `arn:aws:sns:${process.env.SNS_REGION}:${process.env.SNS_ACCOUNT_ID}:${topic}`
}

/**
 * Validates incoming request from teams
 * @param {Object} body
 * @param {String} authHeader
 */
async function authenticateTeamsRequest (body, authHeader) {
  try {
    const identity = await JwtTokenValidation.authenticateRequest(body, authHeader, credentialsProvider, '')
    return identity.isAuthenticated
  } catch (e) {
    return false
  }
}

/**
 * Returns an instance of the slack web api client
 */
function getTeamsClient (serviceUrl = 'https://smba.trafficmanager.net/in/') {
  MicrosoftAppCredentials.trustServiceUrl(serviceUrl)
  return new ConnectorClient(credentials, {
    baseUri: serviceUrl
  })
}

module.exports = {
  getTeamsClient,
  getSnsClient,
  getArnForTopic,
  authenticateTeamsRequest
}
