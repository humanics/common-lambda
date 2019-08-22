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
    this.logger = opts.logger || new Logger(opts.loggerLevel)
    this.environmentVariables = this.collectEnvironmentVariables(opts)
  }

  async run() {
    return {}
  }

  collectEnvironmentVariables() {
    return {}
  }

  getExecutionContext() {
    const { event, context, callback, isCallbackExecuted, logger, environmentVariables } = this
    return { event, context, callback, isCallbackExecuted, logger, environmentVariables }
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

  static handler(event, context, callback) {
    const instance = new this({ event, context, callback })
    return instance.run()
      .then( (result) => {
        const { statusCode, headers, body } = result || {}
        const content = typeof body === 'string' ? body : JSON.stringify(body || {})
        const response = {
          statusCode: statusCode || 200,
          headers:    headers || {},
          body:       content,
        }
        instance.executeCallback(null, response)
      })
      .catch( (error) => {
        instance.logger.error(`Lambda Error: ${error.message}`)
        instance.logger.error(error.stack)
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
