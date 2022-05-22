import { BaseClass } from './baseClass.js';

export const logLevel = {
  'fatal':'fatal',
  'error':'error',
  'warning':'warning',
  'info':'info',
  'debug':'debug',
  'trace':'trace',
};

export class Log extends BaseClass {
  logLevels = [
    logLevel.error,
    logLevel.warning,
    logLevel.info,
    logLevel.debug,
    logLevel.trace
  ];

  actualLogLevel = 'info';

  /**
   * @param {string} level
   */
  setLogLevel(level) {
    if (this.logLevels.indexOf(level) >= 0) {
      this.actualLogLevel = level;
    } else {
      this.fatal(`level '${level}' not accptable`);
    }
  }

  /**
   * @param {string} level
   */
  inLogLevel(level) {
    return this.logLevels.indexOf(level) >= this.logLevels.indexOf(this.actualLogLevel);
  }

  /**
   * @param {string} message
   * @param {string} origin
   */
  fatal(message, origin = 'application') {
    this.nameSpace.tprintf(this.getMessage(message, 'fatal', origin));
    this.nameSpace.exit(1);
  }

  /**
   * @param {string} message
   * @param {string} origin
   */
  error(message, origin = 'application') {
    this.nameSpace.tprintf(this.getMessage(message, 'error', origin));
  }

  /**
   * @param {string} message
   * @param {string} origin
   */
  warning(message, origin = 'application') {
    if (!this.inLogLevel('warning')) return;
    this.nameSpace.tprintf(this.getMessage(message, 'warning', origin));
  }

  /**
   * @param {string} message
   * @param {string} origin
   */
  info(message, origin = 'application') {
    if (!this.inLogLevel('info')) return;
    this.nameSpace.tprintf(this.getMessage(message, 'info', origin));
  }

  /**
   * @param {string} message
   * @param {string} origin
   */
  debug(message, origin = 'application') {
    if (!this.inLogLevel('debug')) return;
    this.nameSpace.tprintf(this.getMessage(message, 'debug', origin));
  }

  /**
   * @param {string} message
   * @param {string} origin
   */
  trace(message, origin = 'application') {
    if (!this.inLogLevel('trace')) return;
    this.nameSpace.tprintf(this.getMessage(message, 'trace', origin));
  }

  /**
   * @param {string} message
   * @param {string} debug
   * @param {string} origin
   */
  getMessage(message, type = 'debug', origin = 'application') {
    const dateNow = new Date;
    return sprintf(
      "[%04d-%02d-%02d %02d:%02d:%02d.%03d][%s][%s][%s] %s",
      dateNow.getFullYear(),
      dateNow.getMonth(),
      dateNow.getDate(),

      dateNow.getHours(),
      dateNow.getMinutes(),
      dateNow.getSeconds(),
      dateNow.getMilliseconds(),

      this.nameSpace.getScriptName(),

      origin,

      type,

      message
    );
  }
}

export const log = {
  'logLevel': 'info',

  /**
   * 
   * @param {import("./NameSpace").NS} ns 
   * @param {string} message
   * @param {string} logType
   * @param {string} origin
   */
  'log': (ns, message, logType, origin = 'application') => {
    const logClass = new Log(ns);
    logClass.setLogLevel(log.logLevel);
    logClass[logType](message, origin);
  },

  /**
   * Log message and exit program
   * 
   * @param {import("./NameSpace").NS} ns 
   * @param {string} message
   * @param {string} origin
   */
  'fatal' : (ns, message, origin = 'application') => {
    log.log(ns, message, logLevel.fatal, origin);
  },

  /**
   * 
   * @param {import("./NameSpace").NS} ns 
   * @param {string} message
   * @param {string} origin
   */
  'error' : (ns, message, origin = 'application') => {
    log.log(ns, message, logLevel.error, origin);
  },

  /**
   * 
   * @param {import("./NameSpace").NS} ns 
   * @param {string} message
   * @param {string} origin
   */
  'warning' : (ns, message, origin = 'application') => {
    log.log(ns, message, logLevel.warning, origin);
  },

  /**
   * 
   * @param {import("./NameSpace").NS} ns 
   * @param {string} message
   * @param {string} origin
   */
  'info' : (ns, message, origin = 'application') => {
    log.log(ns, message, logLevel.info, origin);
  },

  /**
   * 
   * @param {import("./NameSpace").NS} ns 
   * @param {string} message
   * @param {string} origin
   */
  'debug' : (ns, message, origin = 'application') => {
    log.log(ns, message, logLevel.debug, origin);
  },

  /**
   * 
   * @param {import("./NameSpace").NS} ns 
   * @param {string} message
   * @param {string} origin
   */
  'trace' : (ns, message, origin = 'application') => {
    log.log(ns, message, logLevel.trace, origin);
  }
};
