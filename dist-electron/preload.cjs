"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// electron/preload.ts
var preload_exports = {};
module.exports = __toCommonJS(preload_exports);
var import_electron = require("electron");
var api = {
  platform: process.platform,
  getSystemMemory: () => import_electron.ipcRenderer.invoke("chatty:get-system-memory"),
  setBadgeCount: (count) => import_electron.ipcRenderer.invoke("chatty:set-badge-count", count),
  openExternal: (url) => import_electron.ipcRenderer.invoke("chatty:open-external", url),
  clearPartitionData: (partition) => import_electron.ipcRenderer.invoke("chatty:clear-partition-data", partition),
  getUserDataPath: () => import_electron.ipcRenderer.invoke("chatty:get-user-data-path"),
  windowControl: (action) => import_electron.ipcRenderer.invoke("chatty:window-control", action)
};
import_electron.contextBridge.exposeInMainWorld("chattyAPI", api);
//# sourceMappingURL=preload.cjs.map
