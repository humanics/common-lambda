'use strict'

const LambdaError = require('./LambdaError')
const Logger = require('./Logger')

class LambdaRunnable {
  constructor(options) {
    const opts = Object.assign({}, options)
    this.event = opts.event
    this.context = opts.context
    this.callback = opts.callback
    this.isCallbackExecuted = false
    this.logger = new Logger(opts.loggerLevel)
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

  executeCallback(error, response) {
    if (!this.isCallbackExecuted) {
      this.isCallbackExecuted = true
      this.callback(error, response)
    }
  }

  static runHandler(event, context, callback) {
    const instance = new this({ event, context, callback })
    return instance.run()
      .then( (result) => {
        const { statusCode, headers, body } = result
        const response = {
          statusCode: statusCode || 200,
          headers:    headers || {},
          body:       JSON.stringify(body || {}),
        }
        instance.executeCallback(null, response)
      })
      .catch( (error) => {
        if (error instanceof LambdaError) {
          const { statusCode, message } = error
          const response = {
            statusCode: statusCode,
            body:       JSON.stringify({ message }),
          }
          instance.executeCallback(null, response)
        } else {
          instance.executeCallback(error, null)
        }
      })
  }

}

module.exports = LambdaRunnable
