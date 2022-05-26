import { BaseClass, BaseContext } from "./base";
import { Log } from "./log";
import { Process } from "./process"

export class Context extends BaseClass {
    /** @type {Log} log */
    log = undefined;

    constructor(ns) {
        super(ns);
        this.log = this.factory(Log);
    }

    /** @returns {BaseContext} */
    factory(class_, ...args) {
        return new class_(this, ...args);
    }

    /** @returns {Process} */
    Process(...args) {
        return this.factory(Process, ...args);
    }
}
