import { Context } from "./context";

function program(file, hackLevel) {
    return { "file": file, "hackLevel": hackLevel }
}

export async function main(ns) {
    const ctx = new Context(ns);
    const programs = [
        program("AutoLink.exe", 25),
        program("BruteSSH.exe", 50),
        program("DeepscanV1.exe", 75),
        program("FTPCrack.exe", 100),
        program("relaySMTP.exe", 250),
        program("DeepscanV2.exe", 400),
        program("HTTPWorm.exe", 500),
        program("SQLInject.exe", 750),
        program("ServerProfiler.exe", 75)];

    for (const program of programs) {
        if (ctx.ns.fileExists(program.file)) continue;

        while (ctx.ns.getHackingLevel() < program.hackLevel) {
            await ctx.ns.sleep(20 * 1000);
        }

        ctx.ns.singularity.createProgram(program.file, true);
        ctx.ns.tprint(`Program ${program.file} created!`);
    }
    return 0;
}
