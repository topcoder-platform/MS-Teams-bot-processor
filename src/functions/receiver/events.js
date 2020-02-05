const HttpStatus = require('http-status-codes')
const { authenticateTeamsRequest, getSnsClient, getArnForTopic } = require('../../common/helper')

module.exports.handler = async event => {
  console.log('Receiver Event : ', event)
  const body = JSON.parse(event.body)
  const authHeader = event.headers.authorization || event.headers.Authorization || ''

  // Validate request
  if (!authenticateTeamsRequest(body, authHeader)) {
    return {
      statusCode: HttpStatus.UNAUTHORIZED
    }
  }
  try {
    const response = await publishSnsTopic(event.body)
    console.log('Response : ', response)
    return {
      statusCode: HttpStatus.OK,
      body: JSON.stringify({
        challenge: body.challenge // Event subscription handler must respond with the challenge value
      })
    }
  } catch (err) {
    console.log('err : ', err)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Couldn\'t published the message due to an internal error.'
      })
    }
  }
}

async function publishSnsTopic (data) {
  const params = {
    Message: data,
    TopicArn: getArnForTopic(process.env.CLIENT_TEAMS_EVENTS_TOPIC)
  }
  const snsClient = getSnsClient()
  return snsClient.publish(params).promise()
}
