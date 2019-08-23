'use strict'

const LOGGER_LEVEL = {
  'fatal': 0,
  'error': 1,
  'warn':  2,
  'info':  3,
  'debug': 4,
  'trace': 5
}

class Logger {
  constructor(level) {
    this.level = 'info'
    if (LOGGER_LEVEL[level] !== undefined) {
      this.level = level
    }
  }

  /* istanbul ignore next */
  get loggerLevel() {
    return LOGGER_LEVEL[this.level]
  }

  /* istanbul ignore next */
  getWriter() {
    return { write: console.log } //eslint-disable-line
  }

  /* istanbul ignore next */
  print(level, ...args) {
    const loggerLevel = LOGGER_LEVEL[level]
    if (this.loggerLevel >= loggerLevel) {
      const writer = this.getWriter()
      writer.write(...args) //eslint-disable-line
    }
  }

  /* istanbul ignore next */
  fatal(...args) {
    this.print('fatal', ...args)
  }

  /* istanbul ignore next */
  error(...args) {
    this.print('error', ...args)
  }

  /* istanbul ignore next */
  warn(...args) {
    this.print('warn',... args)
  }

  /* istanbul ignore next */
  info(...args) {
    this.print('info', ...args)
  }

  /* istanbul ignore next */
  debug(...args) {
    this.print('debug', ...args)
  }

  /* istanbul ignore next */
  trace(...args) {
    this.print('trace', ...args)
  }

}

module.exports = Logger
