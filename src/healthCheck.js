const logger = require('../common/logger')

async function healthCheck (req, res) {
  try {
    // Pass the webhook event into the controller to be processed
    await res.json({ ok: true })
  } catch (e) {
    logger.logFullError(e)
  }
}

module.exports = healthCheck
