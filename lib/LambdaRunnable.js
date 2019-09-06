'use strict'

const LambdaError = require('./LambdaError')
const Logger = require('./Logger')

class LambdaRunnable {
  constructor(options) {
    const opts = Object.assign({}, options)
    this._event = opts.event
    this._context = opts.context
    this._callback = opts.callback
    this._isCallbackExecuted = false
    this._environmentVariables = this.collectEnvironmentVariables(opts)
    this.logger = opts.logger || new Logger(this.environmentVariables.loggerLevel)
  }

  get event() {
    return this._event
  }

  get context() {
    return this._context
  }

  get callback() {
    return this._callback
  }

  get isCallbackExecuted() {
    return this._isCallbackExecuted
  }

  get environmentVariables() {
    return this._environmentVariables
  }

  /* istanbul ignore next */
  async run() {
    return {}
  }

  /* istanbul ignore next */
  createError(message, statusCode) {
    return new LambdaError(message, statusCode)
  }

  /* istanbul ignore next */
  wrapError(error, statusCode) {
    return LambdaError.wrapError(error, statusCode)
  }

  collectEnvironmentVariables(options) {
    const opts = Object.assign({}, options)
    const variables = {}
    variables.loggerLevel = opts.loggerLevel || process.env.LOGGER_LEVEL
    return variables
  }

  getExecutionContext() {
    const { event, context, isCallbackExecuted, logger, environmentVariables } = this
    return { event, context, isCallbackExecuted, logger, environmentVariables }
  }


  executeCallback(error, response) {
    if (!this.isCallbackExecuted) {
      this._isCallbackExecuted = true
      this.callback(error, response)
    }
  }

  async executeHandler() {
    try {
      const result = await this.run()
      const { statusCode, headers, body } = Object.assign({}, result)
      const content = typeof body === 'string' ? body : JSON.stringify(body || {})
      const response = {
        statusCode: statusCode || 200,
        headers:    headers || {},
        body:       content,
      }
      this.executeCallback(null, response)
    } catch (e) {
      this.logger.error(`Lambda Error: ${e.message}`)
      this.logger.error(e.stack)
      if (e instanceof LambdaError) {
        const { statusCode, message } = e
        const response = {
          statusCode: statusCode || 400,
          body:       JSON.stringify({ message }),
        }
        this.executeCallback(null, response)
      } else {
        this.executeCallback(e, null)
      }
    }
  }

  /* istanbul ignore next */
  static create(options) {
    return new this(options)
  }

  /* istanbul ignore next */
  static handler(event, context, callback) {
    const instance = this.create({ event, context, callback })
    return instance.executeHandler()
  }

}

module.exports = LambdaRunnable
