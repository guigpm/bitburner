import { BaseClass } from 'baseClass.js';

/** @param {NS} nameSpace */
export class Log extends BaseClass {
	logLevels = [
		'error',
		'warning',
		'info',
		'debug',
		'trace'
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
		this.nameSpace.tprintf(this.getDebugMessage(message, 'fatal', origin));
		this.nameSpace.exit(1);
	}

	/**
	 * @param {string} message
	 * @param {string} origin
	 */
	error(message, origin = 'application') {
		this.nameSpace.tprintf(this.getDebugMessage(message, 'error', origin));
	}

	/**
	 * @param {string} message
	 * @param {string} origin
	 */
	warning(message, origin = 'application') {
		if (!this.inLogLevel('warning')) return;
		this.nameSpace.tprintf(this.getDebugMessage(message, 'warning', origin));
	}

	/**
	 * @param {string} message
	 * @param {string} origin
	 */
	info(message, origin = 'application') {
		if (!this.inLogLevel('info')) return;
		this.nameSpace.tprintf(this.getDebugMessage(message, 'info', origin));
	}

	/**
	 * @param {string} message
	 * @param {string} origin
	 */
	debug(message, origin = 'application') {
		if (!this.inLogLevel('debug')) return;
		this.nameSpace.tprintf(this.getDebugMessage(message, 'debug', origin));
	}

	/**
	 * @param {string} message
	 * @param {string} origin
	 */
	trace(message, origin = 'application') {
		if (!this.inLogLevel('trace')) return;
		this.nameSpace.tprintf(this.getDebugMessage(message, 'trace', origin));
	}

	/**
	 * @param {string} message
	 * @param {string} debug
	 * @param {string} origin
	 */
	getDebugMessage(message, type = 'debug', origin = 'application') {
		const dateNow = new Date;
		return sprintf(
			"[%04d-%02d-%02d %02d:%02d:%02d.%d][%s][%s] %s",
			dateNow.getFullYear(),
			dateNow.getMonth(),
			dateNow.getDate(),

			dateNow.getHours(),
			dateNow.getMinutes(),
			dateNow.getSeconds(),
			dateNow.getMilliseconds(),

			origin,

			type,

			message
		);
	}
}
