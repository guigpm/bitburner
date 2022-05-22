import { waitTargetPid } from 'lib.js';

/** @param {NS} ns */
export async function main(ns) {
	if (ns.args.length != 1) {
		ns.tprint("Missing argument 0: <target>")
		ns.exit(1)
	}
	// Defines the "target server", which is the server
	// that we're going to hack. In this case, it's "n00dles"
	var target = ns.args[0];

	// Defines how much money a server should have before we hack it
	// In this case, it is set to 75% of the server's max money
	var moneyThresh = ns.getServerMaxMoney(target) * 0.75;

	// Defines the maximum security level the target server can
	// have. If the target's security level is higher than this,
	// we'll weaken it before doing anything else
	var securityThresh = ns.getServerMinSecurityLevel(target) + 5;


	const availableRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
	const weakThreads = Math.floor(availableRam / ns.getScriptRam("weak.js"));
	const growThreads = Math.floor(availableRam / ns.getScriptRam("grow.js"));
	const hackThreads = Math.floor(availableRam / ns.getScriptRam("hack.js"));
	// const threads = Math.floor(availableRam / harvestRam);


	// Infinite loop that continously hacks/grows/weakens the target server
	while (true) {
		let execPID = null;
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			if (weakThreads) {
				execPID = ns.exec("weak.js", target, weakThreads, target);
			}
			
			// If the server's security level is above our threshold, weaken it
			await ns.weaken(target);
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			if (growThreads) {
				execPID = ns.exec("grow.js", target, growThreads, target);
			}

			// If the server's money is less than our threshold, grow it
			await ns.grow(target);
		} else {
			if (hackThreads) {
				execPID = ns.exec("hack.js", target, hackThreads, target);
			}
			
			// Otherwise, hack it
			await ns.hack(target);
		}

		if (execPID) {
			await waitTargetPid(ns, execPID, target);
		}
	}
}
