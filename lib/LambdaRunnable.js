'use strict'

const LambdaError = require('./LambdaError')

class LambdaRunnable {
  constructor(options) {
    const opts = Object.assign({}, options)
    this.event = opts.event
    this.context = opts.context
  }

  async run() {
    return {}
  }

  createError(message, statusCode) {
    return new LambdaError(message, statusCode)
  }

  wrapError(error, statusCode) {
    return LambdaError.wrapError(error, statusCode)
  }

  static runHandler(event, context, callback) {
    const instance = new this({ event, context })
    return instance.run()
      .then( (result) => {
        const { statusCode, headers, body } = result
        const response = {
          statusCode: statusCode || 200,
          headers:    headers || {},
          body:       JSON.stringify(body || {}),
        }
        callback(null, response)
      })
      .catch( (error) => {
        if (error instanceof LambdaError) {
          const { statusCode, message } = error
          const response = {
            statusCode: statusCode,
            body:       JSON.stringify({ message }),
          }
          callback(null, response)
        } else {
          callback(error, null)
        }
      })
  }

}

module.exports = LambdaRunnable
