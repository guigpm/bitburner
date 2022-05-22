import { waitTargetPid, deploy } from 'lib.js';

/**
 * @param {NS} ns
 * @param {string} target
 */
async function spread(ns, target) {
	const pid = ns.exec(ns.getScriptName(), target, 1, ns.args[0]);
	await waitTargetPid(ns, pid, target);
}

/**
 * @param {NS} ns
 * @param {string} target
 */
async function own(ns, target) {
	const portsRequired = ns.getServerNumPortsRequired(target);
	if (portsRequired > 2) {
		return;
	}

	if (portsRequired >= 2) {
		if (!ns.fileExists("FTPCrack.exe", "home")) {
			return;
		}
		ns.ftpcrack(target);
	}
	if (portsRequired >= 1) {
		if (!ns.fileExists("BruteSSH.exe", "home")) {
			return;
		}
		ns.brutessh(target);
	}
	if (portsRequired >= 0) {
		ns.nuke(target);
	}

	if (ns.fileExists(ns.getScriptName(), target)) return;

	await deploy(ns, target);
	await spread(ns, target);
}

/**
 * @param {NS} ns
 * @param {string} target
 */
async function startHack(ns, target) {
	const availableRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target)
	const harvestRam = ns.getScriptRam("harvest.js");
	const threads = Math.floor(availableRam / harvestRam);
	if (threads) {
		ns.exec("harvest.js", target, 1, target);
	} else {
		ns.tprint("[ERROR]: ", target, " has no available RAM");
	}
}

/**
 * @param {NS} ns
 * @param {string} target
 */
async function killall_target(ns, target) {
	ns.killall(target);
	await spread(ns, target);
	ns.rm(ns.getHostname(), target);
}

/**
 * @param {NS} ns
 */
export async function main(ns) {
	if (ns.args.length != 1) {
		ns.tprint("Usage: HACK|KILLALL|DEPLOY");
		ns.exit(1);
	}
	const operation = ns.args[0];
	const adjacents = ns.scan();

	ns.tprint(operation);
	for(var i = 0; i < adjacents.length; i++ ) {
		const target = adjacents[i];
		if (target.substring(0, 5) == "home-" || target == "home") continue;
		ns.tprint("Starting: ", target);
		await own(ns, target);
		if (operation.toLowerCase() == "hack") {
			await startHack(ns, target);
		} else if (operation.toLowerCase() == "killall") {
			await killall_target(ns, target);
		} else if (operation.toLowerCase() == "deploy") {
			continue;
		} else {

		}
		ns.tprint("Done: ", target);
	}
}
