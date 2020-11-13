const fs = require("fs");
const path = require("path");
const File = require("!io/File");
const CompilerError = require("!errors/CompilerError");
const logger = require("!logger");
const mod = require("!mod");
const { io } = require("!lang/mc");
require("ts-node").register();
let _sandstoneInstance = require("sandstone");
mod.add("sandstone", "sandstone", (_, id) => require("^" + id), true);
module.exports = function MC_EXTRA(registry) {
  registry.set(".ts", function (file) {
    for (let key in require.cache) {
      if (key.endsWith(".ts") || /node_modules[\/\\]sandstorm/.test(key)) {
        delete require.cache[key];
      }
    }
    _sandstoneInstance = require("sandstone");
    const { datapack } = require("sandstone/_internals");
    const {
      ResourcesTree,
    } = require("sandstone/_internals/datapack/resourcesTree");
    const core = require("sandstone/core");
    datapack.resources = new ResourcesTree();
    datapack.defaultNamespace = path.parse(file).name;
    try {
      require(file);
    } catch (e) {
      console.log(e);
    }
    io.TickTag.reset(file);
    io.LoadTag.reset(file);
    core.savePack("mcb", {
      customFileHandler(info) {
        if (info.type === "tags") {
          if (info.relativePath.endsWith("tick.json")) {
            io.TickTag.set(file, info.resource.values);
          } else if (info.relativePath.endsWith("load.json")) {
            io.LoadTag.set(file, info.resource.values);
          } else {
            const file = new File();
            file.setPath(path.resolve(process.cwd(), info.relativePath));
            file.setContents(info.content);
            file.confirm();
          }
        } else if (info.relativePath != "pack.mcmeta") {
          const file = new File();
          file.setPath(path.resolve(process.cwd(), info.relativePath));
          file.setContents(info.content);
          file.confirm();
        }
      },
    });
  });
  logger.info(`registered handler or extension for '.ts'`);
  return {
    exported: {},
  };
};
