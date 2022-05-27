import { BaseClass, BaseContext } from "./base";
import { Log } from "./log";
import { Process } from "./process"
import { BredthFirstSearch } from "./traversal";

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

    /**
     * @param {script} script
     * @param {any[]} args
     * @returns {Process} */
    Process(script, ...args) {
        return this.factory(Process, script, ...args);
    }

    /**
     * @param {Function} visitFn
     * @param {string} start
     * @param {int} maxDistance
     * @returns {BredthFirstSearch} */
    BredthFirstSearch() {
        return this.factory(BredthFirstSearch);
    }
}
