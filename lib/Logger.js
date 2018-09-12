'use strict'

const LOGGER_LEVEL = {
  'error': 0,
  'warn':  1,
  'info':  2,
  'debug': 3,
  'trace': 4
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
