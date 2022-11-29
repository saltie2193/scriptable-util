declare enum DataStatus {
    OK = "OK",
    OFFLINE = "offline",
    CACHED = "cached",
    ERROR = "error",
    NOT_FOUND = "not found",
    API_ERROR = "api error"
}
interface DataResponseInterface<T> {
    data: T;
    status: DataStatus;
    succeeded: () => boolean;
    msg?: string;
}
/**
 * _Convenient data status handling_
 */
declare class DataResponse<T> implements DataResponseInterface<T> {
    data: T;
    status: DataStatus;
    msg?: string;
    /**
     * Creates new {@link DataResponse} from an old instance with new {@link DataStatus}.
     * Data and message will be copied from the old instance to the new instance.
     *
     * @param {DataResponse<T>} resp - Old  {@link DataResponse} instance.
     * @param {DataStatus} status - New {@link DataStatus} to use.
     * @returns {DataResponse<T>} New {@link DataResponse} instance.
     */
    static fromDataResponse<T>(resp: DataResponse<T>, status: DataStatus): DataResponse<T>;
    /**
     * Creates a new EmptyResponse without data, with given status and msg.
     * If a message is provided it will be logged as a warning.
     *
     * @param {DataStatus} status - Status of the {@link EmptyResponse}. By default DataStatus.OK.
     * @param {string | undefined} msg - Message of the {@link EmptyResponse}.
     * @returns {EmptyResponse} New {@link EmptyResponse}.
     */
    static empty(status?: DataStatus, msg?: string): EmptyResponse;
    /**
     * Creates new {@link EmptyResponse} with {@link DataStatus.NOT_FOUND}.
     *
     * @param {string} msg - Message of the created {@link EmptyResponse}.
     * @returns {EmptyResponse} New {@link EmptyResponse}.
     */
    static notFound(msg?: string): EmptyResponse;
    /**
     * Creates new {@link EmptyResponse} with {@link DataStatus.Error}.
     *
     * @param {string} msg - Message of the created {@link EmptyResponse}.
     * @returns {EmptyResponse} New {@link EmptyResponse}.
     */
    static error(msg?: string): EmptyResponse;
    /**
     * Creates new {@link EmptyResponse} with {@link DataStatus.API_ERROR}.
     *
     * @param {string} msg - Message of the created {@link EmptyResponse}.
     * @returns {EmptyResponse} New {@link EmptyResponse}.
     */
    static apiError(msg?: string): EmptyResponse;
    /**
     * Creates a new {@link DataResponse} with status {@link DataStatus.OK}.
     *
     * @param data - Data of the created {@link DataResponse}.
     * @param {string} msg - Message of the created {@link DataResponse}.
     * @returns {DataResponse} New {@link DataResponse}.
     */
    static ok<T>(data: T, msg?: string): DataResponse<T>;
    /**
     * Creates new {@link DataResponse} with status {@link DataStatus.CACHED}.
     * If the passed data is already a {@link DataResponse} a new {@link DataResponse} will be created.
     * (Data and message from the old instance will be copied to the new instance.)
     *
     * @param data - Data of the created {@link DataResponse}.
     * @returns
     */
    static cached<T>(data: T): DataResponse<T>;
    constructor(data: T, status?: DataStatus, msg?: string);
    succeeded(): boolean;
    /**
     * Checks if the {@link DataResponse} is empty.
     * If the field `data` is `null` or `undefined` the object is an instance of {@link EmptyResponse}.
     * Otherwise its an instance of {@link DataResponse}.
     */
    isEmpty(): this is DataResponse<null>;
    /**
     * Check if given {@link DataStatus} is interpreted as a successful response.
     * @param {DataStatus} status
     * @returns {boolean}
     */
    static isSuccess(status: DataStatus): boolean;
    /**
     * Checks if the {@link DataResponse} is Empty.
     * If the field `data` is `null` or `undefined` the object is an instance of {@link EmptyResponse}.
     * Otherwise its an instance of {@link DataResponse}.
     */
    static isEmpty<T>(resp: DataResponse<T> | EmptyResponse): resp is EmptyResponse;
}
type EmptyResponse = DataResponse<null>;
export { DataResponse, DataStatus };
export type { EmptyResponse };
