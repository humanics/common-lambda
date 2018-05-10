'use strict'

class LambdaError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }

  static wrapError(error, statusCode = 400) {
    return new this(error.message, statusCode)
  }

}

module.exports = LambdaError
