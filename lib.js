import { BaseClass } from 'baseClass.js';

/** @param {NS} nameSpace */
export class Lib extends BaseClass {
	defaultWaitInterval = 100;

	/**
	 * @param {number} pid
	 * @param {string} target [optional]
	 */
	async waitTargetPid(pid, target = undefined) {
		while (this.nameSpace.isRunning(pid, target)) {
			await sleep(this.defaultWaitInterval);
		}
	}
}
