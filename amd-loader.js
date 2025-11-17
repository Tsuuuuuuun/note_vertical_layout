(function () {
  const definitions = new Map();
  const executions = new Map();

  const resolve = (name) => {
    if (executions.has(name)) {
      return executions.get(name);
    }
    const def = definitions.get(name);
    if (!def) {
      throw new Error(`Module not found: ${name}`);
    }
    const { deps, factory } = def;
    const exports = {};
    const args = deps.map((dep) => {
      if (dep === "require") return require;
      if (dep === "exports") return exports;
      return resolve(dep);
    });
    const value = factory.apply(null, args);
    const result = value === undefined ? exports : value;
    executions.set(name, result);
    return result;
  };

  function define(name, deps, factory) {
    if (definitions.has(name)) return;
    definitions.set(name, { deps, factory });
  }

  function require(deps, callback) {
    const results = deps.map((dep) => resolve(dep));
    if (typeof callback === "function") {
      callback.apply(null, results);
    }
    return results.length === 1 ? results[0] : results;
  }

  // expose globally for AMD bundles
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  self.define = define;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  self.require = require;
})();
