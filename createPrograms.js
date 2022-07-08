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

    const createdPrograms = ctx.ns.ls("home")
    for (const program of programs) {
        if (createdPrograms.includes(program.file)) continue;

        while (ctx.ns.getHackingLevel() < program.hackLevel) {
            await ctx.ns.sleep(20 * 1000);
        }

        const started = ctx.ns.singularity.createProgram(program.file, false);
        if (started) {
            while (ctx.ns.singularity.isBusy()) {
                await ctx.ns.sleep(20 * 1000);
            }
        }
        ctx.ns.tprint(`Program ${program.file} created!`);
    }
    return 0;
}
