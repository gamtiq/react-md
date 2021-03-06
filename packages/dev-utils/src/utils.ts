import { ExecOptions, execSync } from "child_process";
import filesize from "filesize";
import fs from "fs-extra";
import nodeGlob from "glob";
import gzipSize from "gzip-size";
import log from "loglevel";
import path from "path";
import now from "performance-now";
import prettier from "prettier";
import prettyMS from "pretty-ms";
import { promisify } from "util";

import { GZIP, UMD } from "./flags";
import {
  dist,
  es,
  lib,
  packageJson,
  packagesRoot,
  src,
  tsConfigCommonJS,
  tsConfigESModule,
  tsConfigVariables,
  types,
} from "./paths";

const prettierConfig = prettier.resolveConfig.sync(
  path.join(packagesRoot, "button", "src", "index.ts")
);

export const glob = promisify(nodeGlob);

export function upperFirst(s: string): string {
  return s.substring(0, 1).toUpperCase() + s.substring(1);
}

/**
 * Converts a string to "title" cased by splitting on all hyphens,
 * capitializing the first letter of each split, and then joining
 * back together.
 */
export function toTitle(s: string, joinWith: string = ""): string {
  return s
    .split("-")
    .map(upperFirst)
    .join(joinWith);
}

export interface CopyFilesOptions {
  message?: string | null;
  prefix?: string;
  replace?: (src: string) => string;
}

/**
 * A quick util that can copy a list of files with some nice logging.
 */
export async function copyFiles(
  files: string[],
  dest: string,
  options: CopyFilesOptions = {}
): Promise<void> {
  const { message, prefix = `src${path.sep}`, replace } = options;
  if (message !== null) {
    log.debug(message || "Copying the following files:");
  }

  await Promise.all(
    files.map(src => {
      const destSrc = replace ? replace(src) : src.substring(prefix.length);
      const currDest = path.join(dest, destSrc);
      log.debug(`- ${src} -> ${currDest}`);

      return fs.copy(src, currDest);
    })
  );
  log.debug();
}

export interface PackageJson {
  name: string;
  version: string;
  scripts?: JSON;
  dependencies?: JSON;
  devDependencies?: JSON;
}

/**
 * Gets the package.json file for the current working directory of
 * this script.
 */
export function getPackageJson(): Promise<PackageJson> {
  return fs.readJson(path.join(process.cwd(), packageJson));
}

/**
 * Gets the packge name for the current working directory of this script.
 * The package name can either be prefixed with @react-md or not.
 */
export async function getPackageName(
  prefixed: boolean = false
): Promise<string> {
  const packageJson = await getPackageJson();
  const { name } = packageJson;

  return prefixed ? name : name.replace(/.+\//, "");
}

const NO_STYLES_PACKAGES = /material-icons|portal/;
const NO_TYPESCRIPT_PACKAGES = /elevation/;
type ScopedPackageFilter = (name: string) => boolean;
interface ScopedPackageOptions {
  prefixed?: boolean;
  filter?: "ts" | "scss" | ScopedPackageFilter;
}

/**
 * Gets all the react-md scoped package names. The packages can either be
 * prefixed with @react-md/ or not. They will not be prefixed by default.
 */
export async function geScopedPackageNames({
  prefixed = false,
  filter,
}: ScopedPackageOptions = {}): Promise<string[]> {
  const directories = await fs.readdir(packagesRoot);
  let customFilter: ScopedPackageFilter;
  if (filter === "ts") {
    customFilter = name => !NO_TYPESCRIPT_PACKAGES.test(name);
  } else if (filter === "scss") {
    customFilter = name => !NO_STYLES_PACKAGES.test(name);
  } else if (filter) {
    customFilter = filter;
  } else {
    customFilter = () => true;
  }

  return directories
    .filter(
      name =>
        !/dev-utils|documentation|react-md/.test(name) && customFilter(name)
    )
    .map(name => (prefixed ? `@react-md/${name}` : name));
}

export type TsConfigType = "commonjs" | "module" | "variables" | "check";

interface TsConfigOptions {
  extends: string;
  compilerOptions: {
    outDir: string;
    rootDir: string;
    incremental: boolean;
    declaration: boolean;
    declarationDir: string;
  };
  include: string[];
  exclude: string[] | undefined;
}

/**
 * I dislike maintaining multiple config files, so each time I try to build
 * a package, i'll re-create the tsconfig.json files required. These tsconfig
 * files will extend their "root" versions at the project base, but the extend
 * functionality isn't 100% what I need so additional settings are added.
 */
export function createTsConfig(tsConfigType: TsConfigType): TsConfigOptions {
  const isCommonJS = tsConfigType === "commonjs";
  const isESModule = tsConfigType === "module";
  const isVariables = tsConfigType === "variables";

  let outDir: undefined | string;
  if (isESModule) {
    outDir = `./${es}`;
  } else if (isCommonJS) {
    outDir = `./${lib}`;
  } else if (isVariables) {
    outDir = `./${dist}`;
  }

  let extendsPrefix = ".base";
  if (isVariables || isCommonJS) {
    extendsPrefix = ".cjs";
  }

  const exclude = [
    "**/__tests__/*",
    !isVariables && "**/scssVariables.ts",
  ].filter(Boolean);

  return {
    extends: `../../tsconfig${extendsPrefix}.json`,
    compilerOptions: {
      outDir,
      rootDir: src,
      incremental: !isVariables || undefined,
      declaration: isESModule || isVariables || undefined,
      declarationDir: isESModule ? types : undefined,
    },
    include: [isVariables ? path.join(src, "scssVariables.ts") : src],
    exclude: exclude.length ? exclude : undefined,
  };
}

export async function checkForTypescriptFiles(): Promise<
  TypescriptFilesResult
> {
  const allTsFiles = await glob(`${src}/**/*.+(ts|tsx)`);
  const filtered = allTsFiles.filter(
    filePath => !filePath.includes("__tests__")
  );
  const variables = filtered.some(filePath =>
    filePath.includes("scssVariables")
  );

  return {
    found: filtered.length > 0,
    variables,
    variablesOnly: filtered.length === 1 && variables,
  };
}

export async function createTsConfigFiles(): Promise<void> {
  const { found, variables, variablesOnly } = await checkForTypescriptFiles();
  if (!found) {
    return;
  }

  const config = { spaces: 2 };
  if (!variablesOnly) {
    log.info(`Creating \`${tsConfigESModule}\`...`);
    await fs.writeJson(tsConfigESModule, createTsConfig("module"), config);

    log.info(`Creating \`${tsConfigCommonJS}\`...`);
    await fs.writeJson(tsConfigCommonJS, createTsConfig("commonjs"), config);
  }

  if (variables) {
    log.info(`Creating the \`${tsConfigVariables}\` file...`);
    await fs.writeJson(tsConfigVariables, createTsConfig("variables"), config);
  }
}

interface TypescriptFilesResult {
  found: boolean;
  variables: boolean;
  variablesOnly: boolean;
}

/**
 * This will time any async function and log the duration. Requires verbose
 * mode for any logging though.
 */
export async function time(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: () => Promise<any>,
  command: string
): Promise<void> {
  log.debug(`Running "${command}"...`);
  const startTime = now();
  await fn();

  log.info(`Completed "${command}" in ${prettyMS(now() - startTime)}`);
}

/**
 * A wrapper for execSync that will ensure that the cwd is set,
 * IO can be shown, and the current environment varaibles are
 * passed down.
 */
export function exec(command: string, options: ExecOptions = {}): void {
  execSync(command, {
    cwd: process.cwd(),
    stdio: "inherit",
    ...options,
    env: {
      ...process.env,
      ...options.env,
    },
  });
}

/**
 * A simple function that will convert a list of things into a "prettified"
 * console.log-able version for debugging.
 */
export function list(things: (string | boolean | null | undefined)[]): string {
  return things
    .filter(Boolean)
    .map(thing => `- ${thing}`)
    .join("\n");
}

/**
 * Creates a string of the provided file path as well as the gzipped
 * file size of the file path.
 */
export function getFileSize(filePath: string, noPath: boolean = false): string {
  const size = filesize(gzipSize.sync(filePath));
  if (noPath) {
    return size;
  }

  return `${filePath} ${size}`;
}

/**
 * Prints the gzip sizes for the provided file paths.
 */
export function printSizes(
  filePaths: string | string[],
  message: string = `The gzipped file size${
    filePaths.length > 1 ? "s are" : " is"
  }:`
): void {
  if (typeof filePaths === "string") {
    filePaths = [filePaths];
  }

  if (!filePaths.length) {
    return;
  }

  const logger =
    process.argv.includes(GZIP) || process.argv.includes(UMD)
      ? log.info
      : log.debug;

  logger(message);
  logger(list(filePaths.map(fp => getFileSize(fp))));
  logger("");
}

/**
 * A nice util that will list all the filesizes for the `*.min` files
 * within a package.
 */
export async function printMinifiedSizes(exclude?: RegExp): Promise<void> {
  let minified = await glob(`${dist}/**/*.min*`);
  if (exclude) {
    minified = minified.filter(name => !exclude.test(name));
  }

  printSizes(minified);
}

/**
 * Formats any code provided with prettier.
 *
 * @param code The code to format
 * @param filePath A filepath to use to resolve prettier config.
 * @param parser An optional parser to apply when the file being formatted
 * is not typescript or javascript.
 */
export function format(
  code: string,
  parser?: prettier.BuiltInParserName
): string {
  return prettier.format(code, {
    ...prettierConfig,
    parser: parser || prettierConfig.parser || "babel",
  });
}

/**
 * Cleans and removes all the files provided.
 */
export function clean(files: string[]): Promise<void[]> {
  log.info("Cleaning the following directories and files:");
  log.info(list(files));
  log.info("");

  return Promise.all(files.map(path => fs.remove(path)));
}
