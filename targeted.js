/** @param {NS} ns */
let activeExecuters = [];


function log(ns, target, message) {
	ns.tprint(target, " ", message);
	ns.print(target, " ", message);
}

function validTarget(ns, target) {
	const alreadyRunning = ns.scriptRunning("invade.js", target);
	const moneyAvailable = ns.getServerMoneyAvailable(target) > 0;
	const rootAccess = ns.hasRootAccess(target);
	const hackLevel = ns.getServerRequiredHackingLevel(target) <= ns.getHackingLevel();

	alreadyRunning && log(ns, target, "is already being hacked");
	!moneyAvailable && log(ns, target, "has no money");
	!rootAccess && log(ns, target, "doesnt have root access");
	!hackLevel && log(ns, target, "hack level is above mine");

	return !alreadyRunning && moneyAvailable && rootAccess && hackLevel;
}

export async function main(ns) {
	ns.disableLog("sleep");
	const servers = ns.scan();
	let pids = [];
	activeExecuters = servers.filter((server) => server.substring(0, 5) == "home-");
	const targets = servers.filter((server) => server.substring(0, 5) != "home-" && server != "home");
	ns.tprint(targets);
	for (var i = 0; i < targets.length; i++) {
		const target = targets[i];
		while(activeExecuters.length == 0) {
			for (var j = 0; j < pids.length; j++) {
				if (pids[j].active && !ns.isRunning(pids[j].pid)) {
					activeExecuters.push(pids[j].executer);
					pids[j].active = false;
				}
			}
			await ns.sleep(1000);
		}
		if (validTarget(ns, target)) {
			log(ns, target, "Valid");
			const executer = activeExecuters.pop();
			const pid = ns.run("breakServer.js", 1, executer, target);
			pids.push({"pid": pid, "executer": executer, "active": true});
		}
	}
}
