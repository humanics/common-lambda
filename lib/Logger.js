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
    this.level = level || 'info'
  }

  getLevel() {
    return LOGGER_LEVEL[this.level]
  }

  print(level, ...args) {
    const loggerLevel = LOGGER_LEVEL[level]
    if (this.getLevel() >= loggerLevel) {
      console.log(...args) //eslint-disable-line
    }
  }

  fatal(...args) {
    this.print('fatal', ...args)
  }

  error(...args) {
    this.print('error', ...args)
  }

  warn(...args) {
    this.print('warn',... args)
  }

  info(...args) {
    this.print('info', ...args)
  }

  debug(...args) {
    this.print('debug', ...args)
  }

  trace(...args) {
    this.print('trace', ...args)
  }

}

module.exports = Logger
