import { BaseContext } from "./base";

export class Process extends BaseContext {
    constructor(ctx, script, ...args) {
        super(ctx);
        this.script = script;
        this.args = args;
        this.pid = undefined;
        this.target = undefined;
    }

    start(target, threads = undefined) {
        this.ctx.log.trace(`@start Starting script=${this.script} args=${this.args} target=${this.target}`);
        if (this.pid !== undefined) {
            this.ctx.log.error(`@start Process already executing with pid ${this.pid}`);
            return this;
        }
        if (threads < 1) {
            this.ctx.log.warning(`@start Threads < 1. Spawn failed for ${this.script} with args ${this.args} on ${target}`);
            return this;
        }
        this.target = target;
        this.pid = this.ns.exec(this.script, target, threads, ...this.args);
        if (this.pid == 0) {
            // this.ctx.log.error(`@start Spawn failed for ${this.script} with args ${this.args} on ${this.target}`);
        }
        else {
            this.ctx.log.trace(`@start script=${this.script} args=${this.args} target=${this.target} PID=${this.pid}`);
        }
        return this;
    }

    startLocal(threads) {
        this.ctx.log.trace(`@startLocal Starting script=${this.script} args=${this.args} target=${this.target}`);
        if (this.pid !== undefined) {
            this.ctx.log.error(`@startLocal Process already executing with pid ${this.pid}`);
            return this;
        }
        if (threads < 1) {
            this.ctx.log.warning(`@startLocal Threads < 1. Spawn failed for ${this.script} with args ${this.args} `);
            return this;
        }
        this.pid = this.ns.run(this.script, threads, ...this.args);
        this.target = this.ns.getHostname();
        if (this.pid == 0) {
            this.ctx.log.error(`@startLocal Spawn failed for ${this.script} with args ${this.args} `);
        }
        else {
            this.ctx.log.trace(`@startLocal script = ${this.script} args = ${this.args} target = ${this.target} PID = ${this.pid} `);
        }
        return this;
    }

    async wait() {
        if (this.pid === 0) return this;
        if (this.pid === undefined || this.target === undefined) {
            this.ctx.log.warning(`@wait Process not started yet.`);
            return this;
        }
        this.ctx.log.disableFunctionLog("sleep");
        while (this.ns.isRunning(this.pid, this.target)) {
            await this.ns.sleep(100);
        }
        this.pid = undefined;
        this.target = undefined;
        this.ctx.log.enableFunctionLog("sleep");
        return this;
    }

    get isRunning() {
        return this.pid !== undefined && this.pid !== 0;
    }
}