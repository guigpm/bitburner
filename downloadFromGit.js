/** @param {import("./NameSpace").NS} ns */
export async function main(ns) {
  const fileName = 'gitList.txt';
  await ns.wget('https://api.github.com/repos/guigpm/bitburner/contents/', fileName);
  const gitList = ns.read(fileName);
  const gitData = JSON.parse(gitList);

  for (const file of gitData) {
    if (file.name.endsWith('.js')) {await ns.wget(file.download_url, file.name);}
  }

  ns.rm(fileName);
}
