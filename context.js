import { BaseClass, BaseContext } from "./base";
import { Invade } from "./invade";
import { Log } from "./log";
import { Process } from "./process"
import { BreadthFirstSearch, DepthFirstSearch } from "./traversal";

export class Context extends BaseClass {
    /** @type {Log} log */
    log = undefined;

    constructor(ns) {
        super(ns);
        this.log = this.factory(Log);
    }

    /** 
     * @param {BaseContext} class_
     * @param {any[]} args
     * @returns {BaseContext} 
     */
    factory(class_, ...args) {
        return new class_(this, ...args);
    }

    /**
     * @param {script} script
     * @param {any[]} args
     * @returns {Process}
     */
    Process(script, ...args) {
        return this.factory(Process, script, ...args);
    }

    /**
     * @param {Function} visitFn
     * @param {string} start
     * @param {int} maxDistance
     * @returns {BreadthFirstSearch}
     */
    BreadthFirstSearch() {
        return this.factory(BreadthFirstSearch);
    }

    DepthFirstSearch() {
        return this.factory(DepthFirstSearch);
    }

    /**
     * @param {string} target Defines the "target server"
     * @returns {Invade}
     */
    Invade(target) {
        return this.factory(Invade, target);
    }
}
