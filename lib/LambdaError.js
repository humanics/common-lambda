'use strict'

class LambdaError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }

  /* istanbul ignore next */
  static wrapError(error, statusCode = 400) {
    return new this(error ? error.message : '', statusCode)
  }

}

module.exports = LambdaError
