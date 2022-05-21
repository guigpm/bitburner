/** @param {NS} ns */
function log(ns, target, message) {
	ns.tprint(target, " ", message);
	ns.print(target, " ", message);
}

export async function main(ns) {
	ns.disableLog("sleep");
	const executer = ns.args[0];
	const target = ns.args[1];
	await ns.scp("hack.js", executer);
	await ns.scp("weak.js", executer);
	await ns.scp("grow.js", executer);
	await ns.scp("invade.js", target);

	var moneyThresh = ns.getServerMaxMoney(target) * 0.75;
	var securityThresh = ns.getServerMinSecurityLevel(target) + 5;

	const availableRam = ns.getServerMaxRam(executer) - ns.getServerUsedRam(executer);
	const availableRamTarget = ns.getServerMaxRam(target) - ns.getServerUsedRam(target);
	const weakThreads = Math.floor(availableRam / ns.getScriptRam("weak.js"));
	const growThreads = Math.floor(availableRam / ns.getScriptRam("grow.js"));
	const invadeThreads = Math.floor(availableRamTarget / ns.getScriptRam("invade.js"));

	let pid = 0;
	while (true) {
		if (ns.getServerSecurityLevel(target) > securityThresh) {
			log(ns, executer, "Weak " + target)
			pid = ns.exec("weak.js", executer, weakThreads, target);
		} else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
			log(ns, executer, "Grow " + target)
			pid = ns.exec("grow.js", executer, growThreads, target);
		} else {
			log(ns, executer, "Invade " + target)
			pid = ns.exec("invade.js", target, invadeThreads, target);
			break;
		}
		while (ns.isRunning(pid, executer)) {
			await ns.sleep(500);
		}
	}
}
