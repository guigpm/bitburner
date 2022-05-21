/** @param {NS} ns */
async function spread(ns, target) {
	const pid = ns.exec("crawler.js", target, 1, ns.args[0]);
	while(ns.isRunning(pid)) {
		await ns.sleep(100);
	}
}

async function own(ns, target) {
	if (ns.getServerNumPortsRequired(target) == 0) {
		ns.nuke(target);
	} else if (ns.getServerNumPortsRequired(target) == 1) {
		ns.brutessh(target);
		ns.nuke(target);
	}
	else {
		return;
	}
	if (ns.fileExists("crawler.js", target)) return;
	await ns.scp("harvest.js", target);
	await ns.scp("crawler.js", target);
	
	await spread(ns, target);
}

async function startHack(ns, target) {
	const availableRam = ns.getServerMaxRam(target) - ns.getServerUsedRam(target)
	const harvestRam = 2.4;
	const threads = Math.floor(availableRam / harvestRam);
	if (threads) {
		ns.exec("harvest.js", target, threads, target);
	} 
	else {
		ns.tprint("[ERROR]: ", target, " has no available RAM");
	}
}

async function killall_target(ns, target) {
	ns.killall(target);
	await spread(ns, target);
	ns.rm("crawler.js", target);
}

export async function main(ns) {
	if (ns.args.length != 1) {
		ns.tprint("Usage: HACK|KILLALL");
		ns.exit(1);
	}
	const operation = ns.args[0];
	const adjacents = ns.scan();

	ns.tprint(operation);
	for(var i = 0; i < adjacents.length; i++ ) {
		const target = adjacents[i]
		if (target.substring(0, 5) == "home-" || target == "home") continue;
		ns.tprint("Starting: ", target);
		await own(ns, target);
		if (operation.toLowerCase() == "hack") {
			await startHack(ns, target);
		} else if (operation.toLowerCase() == "killall") {
			await killall_target(ns, target);
		}
		ns.tprint("Done: ", target);
	}
}
