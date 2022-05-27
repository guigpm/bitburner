import { BaseClass, BaseContext } from './base.js';

export const logLevel = {
  'fatal': 'fatal',
  'error': 'error',
  'warning': 'warning',
  'info': 'info',
  'debug': 'debug',
  'trace': 'trace',
};

export const printFns = {
  "terminal": "tprintf",
  "script": "printf"
};

export class Log extends BaseContext {
  logLevels = [
    logLevel.error,
    logLevel.warning,
    logLevel.info,
    logLevel.debug,
    logLevel.trace
  ];

  actualLogLevel = logLevel.info;
  printFn = printFns.terminal;

  /**
   * @param {import("./NameSpace").NS} ns
   * @param {string} fn
   */
  disableFunctionLog(fn) {
    if (this.ns.isLogEnabled(fn)) {
      this.ns.disableLog(fn);
    }
  }

  /**
   * @param {import("./NameSpace").NS} ns
   * @param {string} fn
   */
  enableFunctionLog(fn) {
    if (!this.ns.isLogEnabled(fn)) {
      this.ns.enableLog(fn);
    }
  }

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
    return this.logLevels.indexOf(level) <= this.logLevels.indexOf(this.actualLogLevel);
  }

  set logLevel(level) {
    this.actualLogLevel = level;
  }

  /**
   * @param {string} message
   * @param {string} origin
   */
  fatal(message, origin = this.ns.getHostname()) {
    this.ns[this.printFn](this.getMessage(message, 'fatal', origin));
    this.ns.exit(1);
  }

  /**
   * @param {string} message
   * @param {string} origin
   */
  error(message, origin = this.ns.getHostname()) {
    this.ns[this.printFn](this.getMessage(message, 'error', origin));
  }

  /**
   * @param {string} message
   * @param {string} origin
   */
  warning(message, origin = this.ns.getHostname()) {
    if (!this.inLogLevel('warning')) return;
    this.ns[this.printFn](this.getMessage(message, 'warning', origin));
  }

  /**
   * @param {string} message
   * @param {string} origin
   */
  info(message, origin = this.ns.getHostname()) {
    if (!this.inLogLevel('info')) return;
    this.ns[this.printFn](this.getMessage(message, 'info', origin));
  }

  /**
   * @param {string} message
   * @param {string} origin
   */
  debug(message, origin = this.ns.getHostname()) {
    if (!this.inLogLevel('debug')) return;
    this.ns[this.printFn](this.getMessage(message, 'debug', origin));
  }

  /**
   * @param {string} message
   * @param {string} origin
   */
  trace(message, origin = this.ns.getHostname()) {
    if (!this.inLogLevel('trace')) return;
    this.ns[this.printFn](this.getMessage(message, 'trace', origin));
  }

  /**
   * @param {string} message
   * @param {string} debug
   * @param {string} origin
   */
  getMessage(message, type = 'debug', origin = this.ns.getHostname()) {
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

      this.ns.getScriptName(),

      origin,

      type,

      message
    );
  }
}