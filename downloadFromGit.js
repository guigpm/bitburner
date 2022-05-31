/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
  const fileName = 'gitList.txt';
  await ns.wget('https://api.github.com/repos/guigpm/bitburner/contents/', fileName);
  const gitList = ns.read(fileName);
  const gitData = JSON.parse(gitList);

  for (const file of gitData) {
    if (file.name.endsWith('.js')) {
      ns.tprint(file.name);
      await ns.wget(file.download_url, file.name);
      await ns.sleep(100);
    }
  }

  ns.rm(fileName);
}
