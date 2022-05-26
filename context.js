import { BaseClass } from "./baseClass";
import { Log } from "./log";

export class Context extends BaseClass {
    /** @type {Log} log */
    log = null;

    constructor(ns) {
        super(ns);
        this.log = this.factory(Log);
    }

    factory(class_, ...args) {
        return new class_(this.ns, ...args);
    }
}