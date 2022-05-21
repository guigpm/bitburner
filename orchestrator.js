/** @param {NS} ns */
export async function main(ns) {
	if (ns.args.length != 1) {
		ns.tprint("Missing argument 0: <target>");
		ns.exit(1);
	}
	var target = ns.args[0];

	if (ns.getServerMoneyAvailable(target) == 0) {
		ns.tprint("Server has no money");
		ns.exit(1);
	}

	var moneyThresh = ns.getServerMaxMoney(target) * 0.75;
	var securityThresh = ns.getServerMinSecurityLevel(target) + 5;

	const availableRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
	const weakThreads = Math.floor(availableRam / ns.getScriptRam("weak.js"));
	const growThreads = Math.floor(availableRam / ns.getScriptRam("grow.js"));
	const hackThreads = Math.floor(availableRam / ns.getScriptRam("hack.js"));

	let pid = 0;
	while (true) {
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			pid = ns.exec("weak.js", target, weakThreads, target);
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			pid = ns.exec("grow.js", target, growThreads, target);
		} else {
			pid = ns.exec("hack.js", target, hackThreads, target);
		}
		while (ns.isRunning(pid, target)) {
			await ns.sleep(500);
		}
	}
}
