"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron/preload.ts
var preload_exports = {};
module.exports = __toCommonJS(preload_exports);
var import_electron = require("electron");
var import_path = __toESM(require("path"));
var api = {
  platform: process.platform,
  webviewPreloadPath: `file://${import_path.default.join(__dirname, "webview-preload.cjs")}`,
  getSystemMemory: () => import_electron.ipcRenderer.invoke("chatty:get-system-memory"),
  setBadgeCount: (count) => import_electron.ipcRenderer.invoke("chatty:set-badge-count", count),
  openExternal: (url) => import_electron.ipcRenderer.invoke("chatty:open-external", url),
  clearPartitionData: (partition) => import_electron.ipcRenderer.invoke("chatty:clear-partition-data", partition),
  getUserDataPath: () => import_electron.ipcRenderer.invoke("chatty:get-user-data-path"),
  windowControl: (action) => import_electron.ipcRenderer.invoke("chatty:window-control", action)
};
import_electron.contextBridge.exposeInMainWorld("chattyAPI", api);
//# sourceMappingURL=preload.cjs.map
