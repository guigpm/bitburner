import { canBeHacked, disableFunctionLog } from 'lib.js';
import { log } from 'log.js';

let activeExecuters = ['home'];

/** @param {NS} ns */
export async function main(ns) {
	disableFunctionLog(ns, "sleep");
	const servers = ns.scan();
	let pids = [];
	// activeExecuters = servers.filter((server) => server.substring(0, 5) == "home-");
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
		if (canBeHacked(ns, target)) {
			const executer = activeExecuters.pop();
			log.info(ns, `Will break ${target}`, executer);
			const pid = ns.run("breakServer.js", 1, executer, target);
			pids.push({"pid": pid, "executer": executer, "active": true});
		}
	}
}
