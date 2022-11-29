import { FileType } from "./CustomFileManager";
class CustomData {
    id;
    meta;
    data;
    fm;
    constructor(id, data, meta, fm) {
        this.id = id;
        this.meta = meta;
        this.data = data;
        this.fm = fm;
    }
    static fromResponse(response) {
        throw new Error("'fromResponse' must be implemented.");
    }
    getMaxFromDataObjectByIndex(index) {
        return CustomData.getMaxFromArrayOfObjectsByKey(this.data, index);
    }
    static getMaxFromArrayOfObjectsByKey(data, index) {
        return Math.max(...data.map((value) => typeof value[index] === "number" ? value[index] : 0));
    }
    get storageFileName() {
        return `${(this.fm?.filestub ?? "") + this.id}.json`;
    }
    save() {
        if (this.fm === undefined) {
            console.warn("No FileManager registered");
            return;
        }
        this.fm?.write(this.getStorageObject(), this.storageFileName, FileType.JSON);
    }
}
export default CustomData;
export { CustomData };
