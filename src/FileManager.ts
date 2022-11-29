import { DataResponse, EmptyResponse } from "./DataResponse";

export enum FileType {
  TEXT = "txt",
  JSON = "json",
  JSON_DICT = "json_dict",
  OTHER = "",
  LOG = "log",
}

interface FileManagerInterface<D> {
  fm: FileManager;
  basedir: string;
  basepath: string;
  copy: (from: string, to: string) => void;
  write: (data: D, file: string, type?: FileType) => void;
  read: (
    file: string,
    type?: FileType
  ) => Promise<DataResponse<D> | EmptyResponse>;
}

class CustomFileManager
  implements FileManagerInterface<Record<string, unknown> | string>
{
  basedir: string;
  basepath: string;
  scriptableDir: string;
  filestub: string;
  fm: FileManager;

  constructor(basedir: string, filestub: string) {
    try {
      this.fm = FileManager.iCloud();
      this.fm.documentsDirectory();
    } catch (e) {
      console.warn(e);
      this.fm = FileManager.local();
    }
    this.basedir = basedir;
    this.scriptableDir = this.fm.documentsDirectory();
    this.basepath = this.fm.joinPath(
      this.fm.documentsDirectory(),
      this.basedir
    );
    this.filestub = filestub;

    if (!this.fm.isDirectory(this.basepath))
      this.fm.createDirectory(this.basepath);
  }

  private getAbsolutePath(relFilePath: string, configDir = true): string {
    return this.fm.joinPath(
      configDir ? this.basepath : this.scriptableDir,
      relFilePath
    );
  }

  fileExists(filePath: string, configDir = true): boolean {
    return this.fm.fileExists(this.getAbsolutePath(filePath, configDir));
  }

  copy(from: string, to: string, configDir = true): void {
    const pathFrom = this.getAbsolutePath(from, configDir);
    const pathTo = this.getAbsolutePath(to, configDir);
    this.fm.copy(pathFrom, pathTo);
  }

  async read(file: string): Promise<DataResponse<string> | EmptyResponse>;
  async read(
    file: string,
    type: FileType.JSON,
    configDir?: boolean
  ): Promise<
    | DataResponse<Record<string, unknown> | unknown[] | number | string | null>
    | EmptyResponse
  >;
  async read(
    file: string,
    type: FileType.JSON_DICT,
    configDir?: boolean
  ): Promise<DataResponse<Record<string, unknown>> | EmptyResponse>;
  async read(
    file: string,
    type: FileType.TEXT,
    configDir?: boolean
  ): Promise<DataResponse<string> | EmptyResponse>;
  async read(
    file: string,
    type: FileType = FileType.TEXT,
    configDir = true
  ): Promise<
    | DataResponse<Record<string, unknown> | unknown[] | number | string | null>
    | EmptyResponse
  > {
    const ext = CustomFileManager.extensionByType(type);
    const path = this.getAbsolutePath(
      file.endsWith(ext) ? file : file + ext,
      configDir
    );

    if (this.fm.isFileStoredIniCloud(path) && !this.fm.isFileDownloaded(path)) {
      await this.fm.downloadFileFromiCloud(path);
    }

    if (this.fm.fileExists(path)) {
      try {
        const resStr = this.fm.readString(path);

        if (type === FileType.JSON) {
          return new DataResponse<Record<string, string>>(
            JSON.parse(resStr) as Record<string, string>
          );
        } else if (type === FileType.JSON_DICT) {
          const dict = JSON.parse(resStr) as Record<string, unknown>;
          if (
            typeof dict !== "object" ||
            Array.isArray(dict) ||
            dict === null
          ) {
            console.warn("read: parsed data not a dictionary.");
            return DataResponse.error();
          } else {
            return new DataResponse<Record<string, unknown>>(dict);
          }
        } else {
          return new DataResponse<string>(resStr);
        }
      } catch (e) {
        console.error(e);
        return DataResponse.error();
      }
    } else {
      console.warn(`File ${path} does not exist.`);
      return DataResponse.notFound();
    }
  }

  write(
    data: Record<string, unknown> | string,
    file: string = this.filestub,
    type: FileType = FileType.TEXT,
    configDir = true
  ): void {
    let dataStr: string;
    if (
      type === FileType.JSON ||
      type === FileType.JSON_DICT ||
      typeof data === "object"
    ) {
      dataStr = JSON.stringify(data);
    } else if (type === FileType.TEXT) {
      dataStr = data;
    } else {
      dataStr = data;
    }
    const ext = CustomFileManager.extensionByType(type);
    const path = this.getAbsolutePath(
      file.endsWith(ext) ? file : file + ext,
      configDir
    );
    this.fm.writeString(path, dataStr);
  }

  remove(filePath: string, baseDir = true): void {
    this.fm.remove(this.getAbsolutePath(filePath, baseDir));
  }

  modificationDate(filePath: string, baseDir = true): Date | null {
    return this.fm.modificationDate(this.getAbsolutePath(filePath, baseDir));
  }

  listContents(filePath: string, configDir = true): string[] {
    return this.fm.listContents(this.getAbsolutePath(filePath, configDir));
  }

  static extensionByType(type: FileType, omitDot = false): string {
    const dot = omitDot ? "" : ".";
    switch (type) {
      case FileType.TEXT:
        return dot + "txt";
      case FileType.JSON_DICT:
      case FileType.JSON:
        return dot + "json";
      case FileType.LOG:
        return dot + "log";
      default:
        return "";
    }
  }

  static typeByExtension(extension: string): FileType {
    switch (extension) {
      case "txt":
        return FileType.TEXT;
      case "json":
        return FileType.JSON;
      case "log":
        return FileType.LOG;
      default:
        throw new Error(`Unknown extension ${extension}.`);
    }
  }
}

/**
 * _Read and write files on disk._
 *
 * Wrapper around {@link FileManager} of scriptable-ios.
 */
class NewFileManager implements FileManager {
  protected fm: FileManager;
  protected basepath: string;
  filestub?: string;

  constructor(basedir?: string, filestub?: string) {
    try {
      this.fm = FileManager.iCloud();
      this.fm.documentsDirectory();
    } catch (e) {
      console.warn(e);
      this.fm = FileManager.local();
    }
    this.filestub = filestub;
    if (!basedir) {
      this.basepath = this.fm.documentsDirectory();
    } else {
      this.basepath = this.fm.joinPath(this.fm.documentsDirectory(), basedir);
      if (!this.fm.isDirectory(this.basepath)) {
        this.fm.createDirectory(this.basepath);
      }
    }
  }

  /**
   * Gets the absolute path to a given filepath.
   * Takes basedir of the {@link CustomFileManager} in to account.
   *
   * @param {string} filePath - Relative path to a file.
   * @returns {string} Absolute path .
   */
  protected mapPath(filePath: string): string {
    return this.joinPath(this.basepath, filePath);
  }

  /**
   * Wrapper to safely read files on device or in the iCloud.
   *
   * 1. Checks if the given filepath relatively to the basedir of the {@link NewFileManager} exists.
   * 2. Checks if the given file is stored in the iCloud and downloads it if necessary.
   * 3. Uses the given function to read the file and returns the result.
   *
   * @param {string} filePath - Path to file, relative to the basedir of the {@link NewFileManager}.
   * @param {(path: string) => T} fn - Function to read the given file.
   * @returns {DataResponse<T>}
   */
  protected async readSmartWrapper<T>(
    filePath: string,
    fn: (filePath: string) => T
  ): Promise<DataResponse<T> | EmptyResponse> {
    if (!this.fileExists(filePath)) {
      console.warn(`readSmartWrapper: File '${filePath}' does not exist.`);
      return DataResponse.notFound();
    }
    if (
      this.isFileStoredIniCloud(filePath) &&
      !this.isFileDownloaded(filePath)
    ) {
      await this.downloadFileFromiCloud(filePath);
    }
    return DataResponse.ok<T>(fn(filePath));
  }

  /**
   * _Read contents of a file as {@link Data}._
   *
   * Reads the contents of the file specified by the file path as raw data.
   * To read the file as a string see `readString(filePath)`,
   * to read the file as JSON see `readJSON(filePath)` or `readJSON_DICT(filePath)` and
   * to read it as an image see `readImage(filePath)`.
   *
   * The function will error if the file does not exist or if it exists in iCloud but has not been download. Use `fileExists(filePath)` to check if a file exists and
   * `downloadFileFromiCloud(filePath)` to download the file. Note that it is always safe to call `downloadFileFromiCloud(filePath)`, even if the file is stored locally on the device.
   *
   * To safely read files that might not exist or might be stored in the iCloud see `readS(filePath)`.
   *
   * @param filePath - Path of the file to read, relatively to the basedir of the {@link NewFileManager}.
   * @returns {Data}
   */
  read(filePath: string): Data {
    return this.fm.read(this.mapPath(filePath));
  }

  /**
   * _Safely read contents of a file as {@link Data}._
   *
   * Reads the contents of the file specified by the file path as raw data.
   * To read the file as a string see `readStringS(filePath)`,
   * to read the file as JSON see `readJSONS(filePath)` or `readJSON_DICTS(filePath)` and
   * to read it as an image see `readImageS(filePath)`.
   *
   * The function will check if the file exists and will download the file if it is stored in the iCloud.
   *
   * @param filePath - Path of the file to read, relatively to the basedir of the {@link NewFileManager}.
   * @returns {DataResponse<Data> | EmptyResponse }
   */
  async readS(filePath: string): Promise<EmptyResponse | DataResponse<Data>> {
    const fn = (path: string) => {
      return this.read(path);
    };
    return this.readSmartWrapper(filePath, fn);
  }

  /**
   * _Read contents of a file as string._
   *
   * Reads the contents of the file specified by the file path as `string`.
   *
   * The function will error if the file does not exist or if it exists in iCloud but has not been download.
   * Use `fileExists(filePath)` to check if a file exists and `downloadFileFromiCloud(filePath)` to download the file.
   * Note that it is always safe to call `downloadFileFromiCloud(filePath)`, even if the file is stored locally on the device.
   *
   * @param {string} filePath - Path of the file to read, relatively to the basedir of the {@link NewFileManager}.
   * @return {string} Content of the file as string.
   */
  readString(filePath: string): string {
    return this.fm.readString(this.mapPath(filePath));
  }

  /**
   * _Safely read contents of a file as string._
   *
   * Reads the contents of the file specified by the file path as `string`.
   *
   * The function will check if the file exists or if it exists in iCloud it will download it.
   * If the file does not exists or downloading fails, an {@link EmptyResponse} will be returned.
   *
   * @param {string} filePath - Path of the file to read, relatively to the basedir of the {@link NewFileManager}.
   * @return {DataResponse<string> | EmptyResponse} {@link DataResponse} containing the content of the file as `string` or an {@link EmptyResponse}.
   */
  async readStringS(
    filePath: string
  ): Promise<EmptyResponse | DataResponse<string>> {
    const fn = (path: string) => {
      return this.readString(path);
    };
    return this.readSmartWrapper(filePath, fn);
  }

  /**
   * _Read content of a file as JSON._
   *
   * Reads the contents of the file specified by the file path as JSON.
   * By default the '.json' extension will be added to the filepath, if its not present.
   *
   * The function will error if the file does not exist or if it exists in iCloud but has not been download.
   * Use `fileExists(filePath)` to check if a file exists and `downloadFileFromiCloud(filePath)` to download the file.
   * Note that it is always safe to call `downloadFileFromiCloud(filePath)`, even if the file is stored locally on the device.
   *
   * @param filePath - Path of the file to read, relatively to the basedir of the {@link NewFileManager}.
   * @param autoExtension - Wether to automatically add '.json' extension to the file path.
   * @returns
   */
  readJSON(
    filePath: string,
    autoExtension = true
  ): Record<string, unknown> | unknown[] | number | string | null {
    const path =
      autoExtension && !filePath.endsWith(".json")
        ? filePath + ".json"
        : filePath;
    const data = this.readString(path);
    return JSON.parse(data) as
      | Record<string, unknown>
      | unknown[]
      | number
      | string
      | null;
  }

  /**
   * _Safely read content of a file as JSON._
   *
   * Reads the contents of the file specified by the file path as JSON.
   * By default the '.json' extension will be added to the filepath, if its not present.
   *
   * The function will check if the file exists or if it exists in iCloud it will download it.
   * If the file does not exists or downloading fails, an {@link EmptyResponse} will be returned.
   *
   * @param filePath - Path of the file to read, relatively to the basedir of the {@link NewFileManager}.
   * @param autoExtension - Wether to automatically add '.json' extension to the file path.
   * @returns
   */
  async readJSONS(
    filePath: string,
    autoExtension = true
  ): Promise<
    | EmptyResponse
    | DataResponse<Record<string, unknown> | unknown[] | number | string | null>
  > {
    const fn = (path: string) => {
      return this.readJSON(path, false);
    };
    const path =
      autoExtension && !filePath.endsWith(".json")
        ? filePath + ".json"
        : filePath;
    return this.readSmartWrapper(path, fn);
  }

  /**
   * _Read content of a file as JSON dictionary._
   *
   * Reads the contents of the file specified by the file path as JSON dictionary.
   * By default the '.json' extension will be added to the filepath, if its not present.
   *
   * The function will error if the file does not exist or if it exists in iCloud but has not been download.
   * Use `fileExists(filePath)` to check if a file exists and `downloadFileFromiCloud(filePath)` to download the file.
   * Note that it is always safe to call `downloadFileFromiCloud(filePath)`, even if the file is stored locally on the device.
   *
   * If the content of the file is not a JSON dictionary `null` will be returned.
   *
   * @param filePath - Path of the file to read, relatively to the basedir of the {@link NewFileManager}.
   * @param autoExtension - Wether to automatically add '.json' extension to the file path.
   * @returns
   */
  readJSONDict(
    filePath: string,
    autoExtension = true
  ): Record<string, unknown> | null {
    const data = this.readJSON(filePath, autoExtension);
    if (typeof data !== "object" || Array.isArray(data) || data === null) {
      console.warn(`readJSONDict: data not a dictionary.(${typeof data})`);
      return null;
    }
    return data;
  }

  /**
   * _Safely read content of a file as JSON dictionary._
   *
   * Reads the contents of the file specified by the file path as JSON dictionary.
   * By default the '.json' extension will be added to the filepath, if its not present.
   *
   * The function will check if the file exists or if it exists in iCloud it will download it.
   * If the file does not exists or downloading fails, an {@link EmptyResponse} will be returned.
   *
   * If the content of the file cannot be read as a JSON dictionary an {@link EmptyResponse} will be returned.
   *
   * @param filePath - Path of the file to read, relatively to the basedir of the {@link NewFileManager}.
   * @param autoExtension - Wether to automatically add '.json' extension to the file path.
   * @returns A {@link DataResponse} containing the content of the file as {@link Record}. An {@link EmptyResponse} if the file does not exist or the content cannot be read as JSON dictionary.
   */
  async readJSONDictS(
    filePath: string,
    autoExtension = true
  ): Promise<EmptyResponse | DataResponse<Record<string, unknown>>> {
    const fn = (path: string) => {
      return this.readJSONDict(path, false);
    };
    const path =
      autoExtension && !filePath.endsWith(".json")
        ? filePath + ".json"
        : filePath;
    const res = this.readSmartWrapper(path, fn);
    return res != null ? res : DataResponse.empty();
  }

  /**
   * _Read contents of a file as image._
   *
   * Reads the contents of the file specified by the file path as `string`.
   *
   * The function will error if the file does not exist or if it exists in iCloud but has not been download.
   * Use `fileExists(filePath)` to check if a file exists and `downloadFileFromiCloud(filePath)` to download the file.
   * Note that it is always safe to call `downloadFileFromiCloud(filePath)`, even if the file is stored locally on the device.
   *
   * @param {string} filePath - Path of the file to read, relatively to the basedir of the {@link NewFileManager}.
   * @return {Image} Content of the file as {@link Image}.
   */
  readImage(filePath: string): Image {
    return this.fm.readImage(this.mapPath(filePath));
  }

  /**
   * _Safely read content of a file as Image._
   *
   * Reads the contents of the file specified by the file path as {@link Image}.
   *
   * The function will check if the file exists or if it exists in iCloud it will download it.
   * If the file does not exists or downloading fails, an {@link EmptyResponse} will be returned.
   *
   * @param filePath - Path of the file to read, relatively to the basedir of the {@link NewFileManager}.
   * @returns A {@link DataResponse<Image>} containing the content of the file as `Image`. {@link EmptyResponse} if the file does not exist.
   */
  async readImageS(
    filePath: string
  ): Promise<EmptyResponse | DataResponse<Image>> {
    const fn = (path: string) => {
      return this.readImage(path);
    };
    return this.readSmartWrapper(filePath, fn);
  }

  /**
   * _Write data to a file._
   * @param filePath - Path of file to write to, relative to the basedir of the {@link NewFileManager}.
   * @param content - Data to write to disk, relative to the basedir of the {@link NewFileManager}.
   */
  write(filePath: string, content: Data): void {
    this.fm.write(this.mapPath(filePath), content);
  }

  /**
   * _Write a string to a file._
   *
   * Writes the content to the specified file path on disk.
   * If the file does not already exist, it will be created.
   * If the file already exists the contents of the file will be overwritten with the new content.
   * @param filePath - Path of file to write to, relative to the basedir of the {@link NewFileManager}.
   * @param content - Content to write to disk, relative to the basedir of the {@link NewFileManager}.
   */
  writeString(filePath: string, content: string): void {
    this.fm.writeString(this.mapPath(filePath), content);
  }

  /**
   * _Write a JSON object to a file._
   *
   * Writes the content to the specified file path on disk.
   * If the file does not already exist, it will be created.
   * If the file already exists the contents of the file will be overwritten with the new content.
   * @param filePath - Path of file to write to, relative to the basedir of the {@link NewFileManager}.
   * @param content - Content to write to disk, relative to the basedir of the {@link NewFileManager}.
   */
  writeJSON(filePath: string, content: Record<string, unknown>): void {
    const ext = ".json";
    const dataStr = JSON.stringify(content);
    const path = filePath.endsWith(ext) ? filePath : filePath + ext;
    this.writeString(path, dataStr);
  }

  /**
   * _Write an Image to a file._
   *
   * Writes the content to the specified file path on disk.
   * If the file does not already exist, it will be created.
   * If the file already exists the contents of the file will be overwritten with the new content.
   * @param filePath - Path of file to write to, relative to the basedir of the {@link NewFileManager}.
   * @param content - Content to write to disk, relative to the basedir of the {@link NewFileManager}.
   */
  writeImage(filePath: string, image: Image): void {
    this.fm.writeImage(this.mapPath(filePath), image);
  }

  /**
   * _Removes a file._
   *
   * Removes the file at the specified path. Use with caution. Removed files cannot be restored.
   * @param filePath - Path of file to remove, relative to the basedir of the {@link NewFileManager}.
   */
  remove(filePath: string): void {
    this.fm.remove(this.mapPath(filePath));
  }

  /**
   * _Moves a file._
   *
   * Moves the file from the source path to the destination path.
   * Caution: This operation will replace any existing file at the the destination.
   * @param sourceFilePath - Path of the file to move, relative to the basedir of the {@link NewFileManager}.
   * @param destinationFilePath - Path to move the file to, relative to the basedir of the {@link NewFileManager}.
   */
  move(sourceFilePath: string, destinationFilePath: string): void {
    const source = this.mapPath(sourceFilePath);
    const destination = this.mapPath(destinationFilePath);
    this.fm.move(source, destination);
  }

  /**
   * _Copies a file._
   *
   * Copies the file from the source path to the destination path.
   * If a file already exists at the destination file path, the operation will fail and the file will not be copied.
   * @param sourceFilePath - Path of the file to copy, relative to the basedir of the {@link NewFileManager}.
   * @param destinationFilePath - Path to copy the file to, relative to the basedir of the {@link NewFileManager}.
   */
  copy(sourceFilePath: string, destinationFilePath: string): void {
    //TODO force copy even when destination file exists?
    const source = this.mapPath(sourceFilePath);
    const destination = this.mapPath(destinationFilePath);
    this.fm.copy(source, destination);
  }

  /**
   * _Checks if the file exists._
   *
   * Checks if the file exists at the specified file path.
   * Checking this before moving or copying to a destination can be a good idea as those operations will replace any existing file at the destination file path.
   * @param filePath - File path to examine, relative to the basedir of the {@link NewFileManager}.
   */
  fileExists(filePath: string): boolean {
    return this.fm.fileExists(this.mapPath(filePath));
  }

  /**
   * _Checks if a path points to a directory._
   * @param path - Path to examine, relative to the basedir of the {@link NewFileManager}.
   */
  isDirectory(path: string): boolean {
    return this.fm.isDirectory(this.mapPath(path));
  }

  /**
   * _Creates a directory at the specified path._
   *
   * You can optionally create all intermediate directories.
   * @param path - Path of directory to create, relative to the basedir of the {@link NewFileManager}.
   * @param intermediateDirectories - Whether to create all intermediate directories. Defaults to false.
   */
  createDirectory(
    path: string,
    intermediateDirectories?: boolean | undefined
  ): void {
    this.fm.createDirectory(this.mapPath(path), intermediateDirectories);
  }

  /**
   * _Path of temporary directory._
   *
   * Used to retrieve the path of a temporary directory on disk. Data persisted in a temporary directory will generally live shorter than data persisted in the cache directory.
   *
   * The operating system may at any time delete files stored in this directory and therefore you should not rely on it for long time storage.
   * If you need long time storage, see {@link documentsDirectory()} or {@link libraryDirectory()}.
   * This directory is not shared between the app, the action extension and Siri.
   */
  temporaryDirectory(): string {
    return this.fm.temporaryDirectory();
  }

  /**
   * _Path of cache directory._
   *
   * Used to retrieve the path of a cache directory on disk.
   * The operating system may at any time delete files stored in this directory and therefore you should not rely on it for long time storage.
   *
   * Data persisted in the cache directory will generally live longer than data persisted in a temporary directory.
   *
   * If you need long time storage, see {@link documentsDirectory()} or {@link libraryDirectory()}.
   * This directory is not shared between the app, the action extension and Siri.
   */
  cacheDirectory(): string {
    return this.fm.cacheDirectory();
  }

  /**
   * _Path of cache directory._
   *
   * Used to retrieve the path of a cache directory on disk.
   * The operating system may at any time delete files stored in this directory and therefore you should not rely on it for long time storage.
   *
   * Data persisted in the cache directory will generally live longer than data persisted in a temporary directory.
   *
   * If you need long time storage, see {@link documentsDirectory()} or {@link libraryDirectory()}.
   * This directory is not shared between the app, the action extension and Siri.
   */
  documentsDirectory(): string {
    return this.fm.documentsDirectory();
  }

  /**
   * _Path of library directory._
   *
   * Used to retrieve the path to the library directory.
   * The directory can be used for long time storage.
   * Documents stored in this directory cannot be accessed using the Files app.
   */
  libraryDirectory(): string {
    return this.libraryDirectory();
  }
  joinPath(lhsPath: string, rhsPath: string): string {
    return this.fm.joinPath(lhsPath, rhsPath);
  }

  allTags(filePath: string): string[] {
    return this.fm.allTags(this.mapPath(filePath));
  }
  addTag(filePath: string, tag: string): void {
    this.fm.addTag(this.mapPath(filePath), tag);
  }
  removeTag(filePath: string, tag: string): void {
    this.fm.removeTag(this.mapPath(filePath), tag);
  }
  readExtendedAttribute(filePath: string, name: string): string {
    return this.fm.readExtendedAttribute(this.mapPath(filePath), name);
  }
  writeExtendedAttribute(filePath: string, value: string, name: string): void {
    this.fm.writeExtendedAttribute(this.mapPath(filePath), value, name);
  }
  removeExtendedAttribute(filePath: string, name: string): void {
    this.fm.removeExtendedAttribute(this.mapPath(filePath), name);
  }
  allExtendedAttributes(filePath: string): string[] {
    return this.fm.allExtendedAttributes(this.mapPath(filePath));
  }
  getUTI(filePath: string): string {
    return this.fm.getUTI(this.mapPath(filePath));
  }
  listContents(directoryPath: string): string[] {
    return this.fm.listContents(this.mapPath(directoryPath));
  }
  fileName(filePath: string, includeFileExtension?: boolean): string {
    return this.fileName(this.mapPath(filePath), includeFileExtension);
  }
  fileExtension(filePath: string): string {
    return this.fm.fileExtension(this.mapPath(filePath));
  }
  bookmarkedPath(name: string): string {
    return this.fm.bookmarkedPath(name);
  }
  bookmarkExists(name: string): boolean {
    return this.fm.bookmarkExists(name);
  }
  async downloadFileFromiCloud(filePath: string): Promise<void> {
    return this.fm.downloadFileFromiCloud(this.mapPath(filePath));
  }
  isFileStoredIniCloud(filePath: string): boolean {
    return this.fm.isFileStoredIniCloud(this.mapPath(filePath));
  }
  isFileDownloaded(filePath: string): boolean {
    return this.fm.isFileDownloaded(this.mapPath(filePath));
  }
  creationDate(filePath: string): Date {
    return this.fm.creationDate(this.mapPath(filePath));
  }
  modificationDate(filePath: string): Date {
    return this.fm.modificationDate(this.mapPath(filePath));
  }
  fileSize(filePath: string): number {
    return this.fm.fileSize(this.mapPath(filePath));
  }
  allFileBookmarks(): FileManager.AllFileBookmarks[] {
    return this.fm.allFileBookmarks();
  }
}

export default CustomFileManager;
export { CustomFileManager, NewFileManager as FileManager };
