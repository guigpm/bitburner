import { BaseContext } from "./base";

export class Invade extends BaseContext {

    /** @type {string} target */
    target = undefined;

    /**
     *  @param {import("./context").Context} ctx 
     *  @param {string} target 
     */
    constructor(ctx, target, ...args) {
        super(ctx);
        this.target = target;
    }

    /**
     * 
     * @remarks RAM cost: 0.45 GB
     * 
     * @param {int} portsRequired [optional]
     * @returns {boolean} Success on open ports in target
     */
    openPorts(portsRequired = undefined) {
        if (portsRequired === undefined) {
            portsRequired = this.ns.getServerNumPortsRequired(this.target);
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
            this.ns.sqlinject(this.target);
        }
        if (portsRequired >= 4) {
            if (!this.ns.fileExists("HTTPWorm.exe", "home")) {
                return false;
            }
            this.ns.httpworm(this.target);
        }
        if (portsRequired >= 3) {
            if (!this.ns.fileExists("relaySMTP.exe", "home")) {
                return false;
            }
            this.ns.relaysmtp(this.target);
        }
        if (portsRequired >= 2) {
            if (!this.ns.fileExists("FTPCrack.exe", "home")) {
                return false;
            }
            this.ns.ftpcrack(this.target);
        }
        if (portsRequired >= 1) {
            if (!this.ns.fileExists("BruteSSH.exe", "home")) {
                return false;
            }
            this.ns.brutessh(this.target);
        }

        return true;
    }

    /**
     * @remarks RAM cost: 0.05 GB
     */
    gainRootAccess() {
        this.ns.nuke(this.target);
    }

    backdoor() {
        throw 'Not implemented yet.';
        // this.ns.singularity.installBackdoor()
    }

    /**
     * @remarks RAM cost 0.4 GB
     * @returns {boolean} 
     */
    get canBeHacked() {
        const moneyAvailable = this.ns.getServerMaxMoney(this.target) > 0;
        const rootAccess = this.ns.hasRootAccess(this.target);
        const hackLevel = this.ns.getServerRequiredHackingLevel(this.target) <= this.ns.getHackingLevel();

        const reasons = [];
        if (!moneyAvailable) reasons.push("no money");
        if (!rootAccess) reasons.push("no root access");
        if (!hackLevel) reasons.push("player hack level too low");

        if (reasons.length > 0) this.ctx.log.info(`Cannot hack ${this.target}: ${reasons.join(' / ')}`);

        return moneyAvailable && rootAccess && hackLevel;
    }

}