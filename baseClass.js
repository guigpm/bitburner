export class BaseClass {
  /** @type {import("./NameSpace").NS} nameSpace */
  nameSpace = null;

  /** @param {import("./NameSpace").NS} nameSpace */
  constructor(nameSpace) {
    this.nameSpace = nameSpace;
  }
}
