import { BaseContext } from "./base";
import { getMaxThreadsFromScript } from "./lib";
import { Process } from "./process";

export class Machine extends BaseContext {
    /**
     *  @param {import("./context").Context} ctx 
     *  @param {string} hostname 
     */
    constructor(ctx, hostname, ...args) {
        super(ctx);
        this.hostname = hostname;
    }
}

export class InvasionTarget extends Machine {
    /**
     * 
     * @remarks RAM cost: 0.45 GB
     * 
     * @param {int} portsRequired [optional]
     * @returns {boolean} Success on open ports in target
     */
    openPorts(portsRequired = undefined) {
        if (portsRequired === undefined) {
            portsRequired = this.ns.getServerNumPortsRequired(this.hostname);
        }

        // BruteSSH.exe - Opens up SSH Ports.
        // FTPCrack.exe - Opens up FTP Ports.
        // relaySMTP.exe - Opens up SMTP Ports.
        // HTTPWorm.exe - Opens up HTTP Ports.
        // SQLInject.exe - Opens up SQL Ports.
        // ServerProfiler.exe - Displays detailed information about a server.
        // DeepscanV1.exe - Enables 'scan-analyze' with a depth up to 5.
        // DeepscanV2.exe - Enables 'scan-analyze' with a depth up to 10.
        // AutoLink.exe - Enables direct connect via 'scan-analyze'.

        if (portsRequired > 5) {
            return false;
        }

        if (portsRequired >= 5) {
            if (!this.ns.fileExists("SQLInject.exe", "home")) {
                return false;
            }
            this.ns.sqlinject(this.hostname);
        }
        if (portsRequired >= 4) {
            if (!this.ns.fileExists("HTTPWorm.exe", "home")) {
                return false;
            }
            this.ns.httpworm(this.hostname);
        }
        if (portsRequired >= 3) {
            if (!this.ns.fileExists("relaySMTP.exe", "home")) {
                return false;
            }
            this.ns.relaysmtp(this.hostname);
        }
        if (portsRequired >= 2) {
            if (!this.ns.fileExists("FTPCrack.exe", "home")) {
                return false;
            }
            this.ns.ftpcrack(this.hostname);
        }
        if (portsRequired >= 1) {
            if (!this.ns.fileExists("BruteSSH.exe", "home")) {
                return false;
            }
            this.ns.brutessh(this.hostname);
        }

        return true;
    }

    /**
     * @remarks RAM cost: 0.05 GB
     */
    gainRootAccess() {
        this.ns.nuke(this.hostname);
    }

    backdoor() {
        throw 'Not implemented yet.';
        // this.ns.singularity.installBackdoor()
    }

    own() {
        if (this.openPorts()) {
            this.gainRootAccess();
            this.ctx.log.debug(`Server ${this.hostname} owned`);
        } else {
            this.ctx.log.debug(`Can't open ports on ${this.hostname}`);
        }
    }
    /**
     * @param {string} hostName [optional]
     */
    async deploy(hostName = undefined) {
        this.ctx.log.trace(`Deleting old scripts from ${this.hostname}`, hostName ?? this.ns.getHostname());
        const targetSources = this.ns.ls(this.hostname, '.js');
        for (const file of targetSources) {
            this.ns.rm(file, this.hostname);
        }
        this.ctx.log.trace(`Copying scripts to ${this.hostname}`, hostName ?? this.ns.getHostname());
        const sources = this.ns.ls(hostName ?? this.ns.getHostname(), '.js');
        this.ctx.log.debug(sources);
        for (const file of sources) {
            await this.ns.scp(file, this.hostname);
        }
    }

    killall() {
        this.ctx.log.info(`Killing all process on ${this.hostname}`);
        this.ns.killall(this.hostname);
        this.ctx.log.debug(`Deleted ${this.ns.getScriptName()} on ${this.hostname}`);
    }

    /**
     * @returns {Process}
    */
    async startHarvest() {
        this.ctx.log.trace(`Start harvest on ${this.hostname}`);
        const threads = getMaxThreadsFromScript(this.ns, this.hostname, "harvest.js");
        if (threads) {
            return new Process(this.ctx, "harvest.js", this.hostname).start(this.hostname, 1);
        } else if (this.ns.getServerMaxRam(this.hostname) <= 4 && this.ns.getServerMaxRam(this.hostname) >= 2) {
            return new Process(this.ctx, "cheapHarvest.js", this.hostname).start(this.hostname, 1);
        } else {
            this.ctx.log.warning(`Can't run harvest|cheapHarvest on ${this.hostname}. No RAM.`);
        }
    }


    /**
     * @remarks RAM cost 0.4 GB
     * @returns {boolean} 
     */
    get canBeHacked() {
        const moneyAvailable = this.ns.getServerMaxMoney(this.hostname) > 0;
        const rootAccess = this.ns.hasRootAccess(this.hostname);
        const hackLevel = this.ns.getServerRequiredHackingLevel(this.hostname) <= this.ns.getHackingLevel();

        const reasons = [];
        if (!moneyAvailable) reasons.push("no money");
        if (!rootAccess) reasons.push("no root access");
        if (!hackLevel) reasons.push("player hack level too low");

        if (reasons.length > 0) this.ctx.log.info(`Cannot hack ${this.hostname}: ${reasons.join(' / ')}`);

        return moneyAvailable && rootAccess && hackLevel;
    }
}

export class Executor extends Machine {

}