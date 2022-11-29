import { CustomFileManager } from "./CustomFileManager";
import { DataResponse } from "./DataResponse";
interface Savable {
    id: string;
    fm?: CustomFileManager;
    getStorageObject: () => Record<string, unknown>;
    save: () => void;
}
interface DataInterface<S, T> {
    data: S;
    meta: T;
    getMaxFromDataObjectByIndex: (index: string) => number;
}
declare abstract class CustomData<S extends Record<string, unknown>, T extends Record<string, unknown>> implements DataInterface<S[], T>, Savable {
    id: string;
    meta: T;
    data: S[];
    fm?: CustomFileManager;
    protected constructor(id: string, data: S[], meta: T, fm?: CustomFileManager);
    static fromResponse<T>(response: DataResponse<T>): T;
    getMaxFromDataObjectByIndex(index: string): number;
    static getMaxFromArrayOfObjectsByKey(data: Record<string, unknown>[], index: string): number;
    abstract getStorageObject(): Record<string, unknown>;
    get storageFileName(): string;
    save(): void;
}
export default CustomData;
export { CustomData, Savable, DataInterface };
