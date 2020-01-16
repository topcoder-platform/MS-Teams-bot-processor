const HttpStatus = require('http-status-codes')
const { authenticateTeamsRequest, getSnsClient, getArnForTopic } = require('../../common/helper')

module.exports.handler = async event => {
  const body = JSON.parse(event.body)
  const authHeader = event.headers.authorization || event.headers.Authorization || ''

  // Validate request
  if (!authenticateTeamsRequest(body, authHeader)) {
    return {
      statusCode: HttpStatus.UNAUTHORIZED
    }
  }

  const snsClient = getSnsClient()
  const arn = getArnForTopic(process.env.CLIENT_TEAMS_EVENTS_TOPIC)
  snsClient.publish({
    Message: event.body,
    TopicArn: arn
  }).send()

  return {
    statusCode: HttpStatus.OK
  }
}
