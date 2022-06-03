import { BaseClass } from "./base";
import { Log } from "./log";

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
}
