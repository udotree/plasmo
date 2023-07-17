import { resolve } from "path"

import { getEnvFileNames } from "~features/env/env-config"
import type { SupportedUiExt } from "~features/manifest-factory/ui-library"

import type { CommonPath } from "./common-path"

export enum WatchReason {
  None,

  EnvFile,

  PackageJson,
  AssetsDirectory,

  TabsDirectory,

  BackgroundIndex,
  BackgroundDirectory,

  ContentScriptIndex,
  ContentScriptsDirectory,

  NewtabIndex,
  NewtabHtml,

  SidePanelIndex,
  SidePanelHtml,

  DevtoolsIndex,
  DevtoolsHtml,

  PopupIndex,
  PopupHtml,

  OptionsIndex,
  OptionsHtml,

  SandboxIndex,
  SandboxesDirectory
}

type DirectoryWatchTuple = [WatchReason, string]

const getWatchReasonMap = (paths: string[], reason: WatchReason) =>
  paths.reduce(
    (output, path) => {
      output[path] = reason
      return output
    },
    {} as Record<string, WatchReason>
  )

export const getProjectPath = (
  { sourceDirectory, packageFilePath, assetsDirectory }: CommonPath,
  browserTarget: string,
  uiExts: SupportedUiExt[]
) => {
  /**
   * only pointing to 1 particular file path
   */
  const getModuleList = (moduleName: string) =>
    [".ts", ...uiExts, ".js"].flatMap((ext) => [
      resolve(sourceDirectory, `${moduleName}.${browserTarget}${ext}`),
      resolve(sourceDirectory, `${moduleName}.${process.env.NODE_ENV}${ext}`),
      resolve(sourceDirectory, `${moduleName}${ext}`)
    ])

  /**
   * crawl index, and only care about one extension
   */
  const getIndexList = (moduleName: string, exts = [".ts", ".js"]) =>
    exts.flatMap((ext) => [
      resolve(sourceDirectory, `${moduleName}.${browserTarget}${ext}`),
      resolve(sourceDirectory, moduleName, `index.${browserTarget}${ext}`),

      resolve(sourceDirectory, `${moduleName}.${process.env.NODE_ENV}${ext}`),
      resolve(
        sourceDirectory,
        moduleName,
        `index.${process.env.NODE_ENV}${ext}`
      ),

      resolve(sourceDirectory, `${moduleName}${ext}`),
      resolve(sourceDirectory, moduleName, `index${ext}`)
    ])

  const popupIndexList = getIndexList("popup", uiExts)
  const optionsIndexList = getIndexList("options", uiExts)
  const devtoolsIndexList = getIndexList("devtools", uiExts)
  const newtabIndexList = getIndexList("newtab", uiExts)
  const sidepanelIndexList = getIndexList("sidepanel", uiExts)

  const popupHtmlList = getIndexList("popup", [".html"])
  const optionsHtmlList = getIndexList("options", [".html"])
  const devtoolsHtmlList = getIndexList("devtools", [".html"])
  const newtabHtmlList = getIndexList("newtab", [".html"])
  const sidepanelHtmlList = getIndexList("sidepanel", [".html"])

  const envFileList = getEnvFileNames().map((f) => resolve(sourceDirectory, f))

  const backgroundIndexList = getIndexList("background")

  const contentIndexList = getModuleList("content")
  const sandboxIndexList = getModuleList("sandbox")

  const watchPathReasonMap = {
    [packageFilePath]: WatchReason.PackageJson,

    ...getWatchReasonMap(envFileList, WatchReason.EnvFile),

    ...getWatchReasonMap(contentIndexList, WatchReason.ContentScriptIndex),
    ...getWatchReasonMap(sandboxIndexList, WatchReason.SandboxIndex),

    ...getWatchReasonMap(backgroundIndexList, WatchReason.BackgroundIndex),

    ...getWatchReasonMap(popupIndexList, WatchReason.PopupIndex),
    ...getWatchReasonMap(optionsIndexList, WatchReason.OptionsIndex),
    ...getWatchReasonMap(devtoolsIndexList, WatchReason.DevtoolsIndex),
    ...getWatchReasonMap(newtabIndexList, WatchReason.NewtabIndex),
    ...getWatchReasonMap(sidepanelIndexList, WatchReason.SidePanelIndex),

    ...getWatchReasonMap(popupHtmlList, WatchReason.PopupHtml),
    ...getWatchReasonMap(optionsHtmlList, WatchReason.OptionsHtml),
    ...getWatchReasonMap(devtoolsHtmlList, WatchReason.DevtoolsHtml),
    ...getWatchReasonMap(newtabHtmlList, WatchReason.NewtabHtml),
    ...getWatchReasonMap(sidepanelHtmlList, WatchReason.SidePanelHtml)
  }

  const contentsDirectory = resolve(sourceDirectory, "contents")
  const sandboxesDirectory = resolve(sourceDirectory, "sandboxes")
  const tabsDirectory = resolve(sourceDirectory, "tabs")
  const backgroundDirectory = resolve(sourceDirectory, "background")
  const watchDirectoryEntries = [
    [WatchReason.SandboxesDirectory, sandboxesDirectory],
    [WatchReason.TabsDirectory, tabsDirectory],
    [WatchReason.ContentScriptsDirectory, contentsDirectory],
    [WatchReason.BackgroundDirectory, backgroundDirectory],
    [WatchReason.AssetsDirectory, assetsDirectory]
  ] as Array<DirectoryWatchTuple>

  const knownPathSet = new Set(Object.keys(watchPathReasonMap))

  const entryFileSet = new Set([
    ...backgroundIndexList,
    ...contentIndexList,
    ...sandboxIndexList,
    ...popupIndexList,
    ...optionsIndexList,
    ...devtoolsIndexList,
    ...newtabIndexList,
    ...sidepanelIndexList
  ])

  const isEntryPath = (path: string) => entryFileSet.has(path)

  return {
    popupIndexList,
    popupHtmlList,

    optionsIndexList,
    optionsHtmlList,

    devtoolsIndexList,
    devtoolsHtmlList,

    newtabIndexList,
    newtabHtmlList,

    backgroundIndexList,
    backgroundDirectory,

    contentIndexList,
    contentsDirectory,

    sidepanelIndexList,
    sidepanelHtmlList,

    sandboxIndexList,
    sandboxesDirectory,

    tabsDirectory,

    watchPathReasonMap,
    watchDirectoryEntries,

    isEntryPath,
    knownPathSet
  }
}

export type ProjectPath = ReturnType<typeof getProjectPath>
