/// <reference types="scriptable-ios" />
import { DataResponse, EmptyResponse } from "./DataResponse";
export declare enum FileType {
    TEXT = "txt",
    JSON = "json",
    JSON_DICT = "json_dict",
    OTHER = "",
    LOG = "log"
}
interface FileManagerInterface<D> {
    fm: FileManager;
    basedir: string;
    basepath: string;
    copy: (from: string, to: string) => void;
    write: (data: D, file: string, type?: FileType) => void;
    read: (file: string, type?: FileType) => Promise<DataResponse<D> | EmptyResponse>;
}
declare class CustomFileManager implements FileManagerInterface<Record<string, unknown> | string> {
    basedir: string;
    basepath: string;
    scriptableDir: string;
    filestub: string;
    fm: FileManager;
    constructor(basedir: string, filestub: string);
    private getAbsolutePath;
    fileExists(filePath: string, configDir?: boolean): boolean;
    copy(from: string, to: string, configDir?: boolean): void;
    read(file: string): Promise<DataResponse<string> | EmptyResponse>;
    read(file: string, type: FileType.JSON, configDir?: boolean): Promise<DataResponse<Record<string, unknown> | unknown[] | number | string | null> | EmptyResponse>;
    read(file: string, type: FileType.JSON_DICT, configDir?: boolean): Promise<DataResponse<Record<string, unknown>> | EmptyResponse>;
    read(file: string, type: FileType.TEXT, configDir?: boolean): Promise<DataResponse<string> | EmptyResponse>;
    write(data: Record<string, unknown> | string, file?: string, type?: FileType, configDir?: boolean): void;
    remove(filePath: string, baseDir?: boolean): void;
    modificationDate(filePath: string, baseDir?: boolean): Date | null;
    listContents(filePath: string, configDir?: boolean): string[];
    static extensionByType(type: FileType, omitDot?: boolean): string;
    static typeByExtension(extension: string): FileType;
}
/**
 * _Read and write files on disk._
 *
 * Wrapper around {@link FileManager} of scriptable-ios.
 */
declare class NewFileManager implements FileManager {
    protected fm: FileManager;
    protected basepath: string;
    filestub?: string;
    constructor(basedir?: string, filestub?: string);
    /**
     * Gets the absolute path to a given filepath.
     * Takes basedir of the {@link CustomFileManager} in to account.
     *
     * @param {string} filePath - Relative path to a file.
     * @returns {string} Absolute path .
     */
    protected mapPath(filePath: string): string;
    /**
     * Wrapper to safely read files on device or in the iCloud.
     *
     * 1. Checks if the given filepath relatively to the basedir of the {@link NewFileManager} exists.
     * 2. Checks if the given file is stored in the iCloud and downloads it if necessary.
     * 3. Uses the given function to read the file and returns the result.
     *
     * @param {string} filePath - Path to file, relative to the basedor of the {@link NewFileManager}.
     * @param {(path: string) => T} fn - Function to read the given file.
     * @returns {DataResponse<T>}
     */
    protected readSmartWrapper<T>(filePath: string, fn: (filePath: string) => T): Promise<DataResponse<T> | EmptyResponse>;
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
    read(filePath: string): Data;
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
    readS(filePath: string): Promise<EmptyResponse | DataResponse<Data>>;
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
    readString(filePath: string): string;
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
    readStringS(filePath: string): Promise<EmptyResponse | DataResponse<string>>;
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
     * @param autoExtension - Automatcally add '.json' extension to the file path.
     * @returns
     */
    readJSON(filePath: string, autoExtension?: boolean): Record<string, unknown> | unknown[] | number | string | null;
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
     * @param autoExtension - Automatcally add '.json' extension to the file path.
     * @returns
     */
    readJSONS(filePath: string, autoExtension?: boolean): Promise<EmptyResponse | DataResponse<Record<string, unknown> | unknown[] | number | string | null>>;
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
     * If the content of the file is not a JSON dictonary `null` will be returned.
     *
     * @param filePath - Path of the file to read, relatively to the basedir of the {@link NewFileManager}.
     * @param autoExtension - Automatcally add '.json' extension to the file path.
     * @returns
     */
    readJSONDict(filePath: string, autoExtension?: boolean): Record<string, unknown> | null;
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
     * @param autoExtension - Automatcally add '.json' extension to the file path.
     * @returns A {@link DataResponse} containing the content of the file as {@link Record}. An {@link EmptyResponse} if the file does not exist or the content cannot be read as JSON dictionary.
     */
    readJSONDictS(filePath: string, autoExtension?: boolean): Promise<EmptyResponse | DataResponse<Record<string, unknown>>>;
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
    readImage(filePath: string): Image;
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
    readImageS(filePath: string): Promise<EmptyResponse | DataResponse<Image>>;
    /**
     * _Write data to a file._
     * @param filePath - Path of file to write to, relative to the basedir of the {@link NewFileManager}.
     * @param content - Data to write to disk, relative to the basedir of the {@link NewFileManager}.
     */
    write(filePath: string, content: Data): void;
    /**
     * _Write a string to a file._
     *
     * Writes the content to the specified file path on disk.
     * If the file does not already exist, it will be created.
     * If the file already exists the contents of the file will beoverwritten with the new content.
     * @param filePath - Path of file to write to, relative to the basedir of the {@link NewFileManager}.
     * @param content - Content to write to disk, relative to the basedir of the {@link NewFileManager}.
     */
    writeString(filePath: string, content: string): void;
    /**
     * _Write a JSON object to a file._
     *
     * Writes the content to the specified file path on disk.
     * If the file does not already exist, it will be created.
     * If the file already exists the contents of the file will be overwritten with the new content.
     * @param filePath - Path of file to write to, relative to the basedir of the {@link NewFileManager}.
     * @param content - Content to write to disk, relative to the basedir of the {@link NewFileManager}.
     */
    writeJSON(filePath: string, content: Record<string, unknown>): void;
    /**
     * _Write an Image to a file._
     *
     * Writes the content to the specified file path on disk.
     * If the file does not already exist, it will be created.
     * If the file already exists the contents of the file will be overwritten with the new content.
     * @param filePath - Path of file to write to, relative to the basedir of the {@link NewFileManager}.
     * @param content - Content to write to disk, relative to the basedir of the {@link NewFileManager}.
     */
    writeImage(filePath: string, image: Image): void;
    /**
     * _Removes a file._
     *
     * Removes the file at the specified path. Use with caution. Removed files cannot be restored.
     * @param filePath - Path of file to remove, relative to the basedir of the {@link NewFileManager}.
     */
    remove(filePath: string): void;
    /**
     * _Moves a file._
     *
     * Moves the file from the source path to the destination path.
     * Caution: This operation will replace any existing file at the the destination.
     * @param sourceFilePath - Path of the file to move, relative to the basedir of the {@link NewFileManager}.
     * @param destinationFilePath - Path to move the file to, relative to the basedir of the {@link NewFileManager}.
     */
    move(sourceFilePath: string, destinationFilePath: string): void;
    /**
     * _Copies a file._
     *
     * Copies the file from the source path to the destination path.
     * If a file already exists at the destination file path, the operation will fail and the file will not be copied.
     * @param sourceFilePath - Path of the file to copy, relative to the basedir of the {@link NewFileManager}.
     * @param destinationFilePath - Path to copy the file to, relative to the basedir of the {@link NewFileManager}.
     */
    copy(sourceFilePath: string, destinationFilePath: string): void;
    /**
     * _Checks if the file exists._
     *
     * Checks if the file exists at the specified file path.
     * Checking this before moving or copying to a destination can be a good idea as those operations will replace any existing file at the destination file path.
     * @param filePath - File path to examine, relative to the basedir of the {@link NewFileManager}.
     */
    fileExists(filePath: string): boolean;
    /**
     * _Checks if a path points to a directory._
     * @param path - Path to examine, relative to the basedir of the {@link NewFileManager}.
     */
    isDirectory(path: string): boolean;
    /**
     * _Creates a directory at the specified path._
     *
     * You can optionally create all intermediate directories.
     * @param path - Path of directory to create, relative to the basedir of the {@link NewFileManager}.
     * @param intermediateDirectories - Whether to create all intermediate directories. Defaults to false.
     */
    createDirectory(path: string, intermediateDirectories?: boolean | undefined): void;
    /**
     * _Path of temporary directory._
     *
     * Used to retrieve the path of a temporary directory on disk. Data persisted in a temporary directory will generally live shorter than data persisted in the cache directory.
     *
     * The operating system may at any time delete files stored in this directory and therefore you should not rely on it for long time storage.
     * If you need long time storage, see {@link documentsDirectory()} or {@link libraryDirectory()}.
     * This directory is not shared between the app, the action extension and Siri.
     */
    temporaryDirectory(): string;
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
    cacheDirectory(): string;
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
    documentsDirectory(): string;
    /**
     * _Path of library directory._
     *
     * Used to retrieve the path to the library directory.
     * The directory can be used for long time storage.
     * Documents stored in this directory cannot be accessed using the Files app.
     */
    libraryDirectory(): string;
    joinPath(lhsPath: string, rhsPath: string): string;
    allTags(filePath: string): string[];
    addTag(filePath: string, tag: string): void;
    removeTag(filePath: string, tag: string): void;
    readExtendedAttribute(filePath: string, name: string): string;
    writeExtendedAttribute(filePath: string, value: string, name: string): void;
    removeExtendedAttribute(filePath: string, name: string): void;
    allExtendedAttributes(filePath: string): string[];
    getUTI(filePath: string): string;
    listContents(directoryPath: string): string[];
    fileName(filePath: string, includeFileExtension?: boolean): string;
    fileExtension(filePath: string): string;
    bookmarkedPath(name: string): string;
    bookmarkExists(name: string): boolean;
    downloadFileFromiCloud(filePath: string): Promise<void>;
    isFileStoredIniCloud(filePath: string): boolean;
    isFileDownloaded(filePath: string): boolean;
    creationDate(filePath: string): Date;
    modificationDate(filePath: string): Date;
    fileSize(filePath: string): number;
    allFileBookmarks(): FileManager.AllFileBookmarks[];
}
export default CustomFileManager;
export { CustomFileManager, NewFileManager as FileManager };
