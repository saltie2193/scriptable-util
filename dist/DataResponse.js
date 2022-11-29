var DataStatus;
(function (DataStatus) {
    DataStatus["OK"] = "OK";
    DataStatus["OFFLINE"] = "offline";
    DataStatus["CACHED"] = "cached";
    DataStatus["ERROR"] = "error";
    DataStatus["NOT_FOUND"] = "not found";
    DataStatus["API_ERROR"] = "api error";
})(DataStatus || (DataStatus = {}));
class DataResponse {
    data;
    status;
    msg;
    /**
     * Creates new {@link DataResponse} from an old instance with new {@link DataStatus}.
     * Data and message will be coppied from the old instance to the new instance.
     *
     * @param {DataResponse<T>} resp - Old  {@link DataResponse} instance.
     * @param {DataStatus} status - New {@link DataStatus} to use.
     * @returns {DataResponse<T>} New {@link DataResponse} instance.
     */
    static fromDataResponse(resp, status) {
        return new DataResponse(resp.data, status, resp.msg);
    }
    constructor(data, status = DataStatus.OK, msg) {
        this.data = data;
        this.status = status;
        if (msg)
            this.msg = msg;
    }
    succeeded() {
        return DataResponse.isSuccess(this.status);
    }
    /**
     * Checks if the {@link DataResponse} is empty.
     * If the field `data` is `null` or `undefined` the object is an instance of {@link EmptyResponse}.
     * Otherwise its an instance of {@link DataResponse}.
     */
    isEmpty() {
        return DataResponse.isEmpty(this);
    }
    /**
     * Creates a new EmptyResponse without data, with given status and msg.
     * If a message is provided it will be logged as a warning.
     *
     * @param {DataStatus} status - Status of the {@link EmptyResponse}. By default DataStatus.OK.
     * @param {string | undefined} msg - Message of the {@link EmptyResponse}.
     * @returns {EmptyResponse} New {@link EmptyResponse}.
     */
    static empty(status = DataStatus.OK, msg) {
        if (msg)
            console.warn(msg);
        return new DataResponse(null, status, msg);
    }
    /**
     * Creates a new {@link DataResponse} with status {@link DataStatus.OK}.
     *
     * @param data - Data of the created {@link DataResponse}.
     * @param {string} msg - Message of the created {@link DataResponse}.
     * @returns {DataResponse} New {@link DataResponse}.
     */
    static ok(data, msg) {
        return new DataResponse(data, DataStatus.OK, msg);
    }
    /**
     * Creates new {@link EmptyResponse} with {@link DataStatus.Error}.
     *
     * @param {string} msg - Message of the created {@link EmptyResponse}.
     * @returns {EmptyResponse} New {@link EmptyResponse}.
     */
    static error(msg) {
        return DataResponse.empty(DataStatus.ERROR, msg);
    }
    /**
     * Creates new {@link EmptyResponse} with {@link DataStatus.NOT_FOUND}.
     *
     * @param {string} msg - Messag of the created {@link EmptyResponse}.
     * @returns {EmptyResponse} New {@link EmptyResponse}.
     */
    static notFound(msg) {
        return DataResponse.empty(DataStatus.NOT_FOUND, msg);
    }
    /**
     * Creates new {@link EmptyResponse} with {@link DataStatus.API_ERROR}.
     *
     * @param {string} msg - Messag of the created {@link EmptyResponse}.
     * @returns {EmptyResponse} New {@link EmptyResponse}.
     */
    static apiError(msg) {
        return DataResponse.empty(DataStatus.API_ERROR, msg);
    }
    /**
     * Creates new {@link DataResponse} with status {@link DataStatus.CACHED}.
     * If the passed data is already a {@link DataResponse} a new {@link DataResponse} will be created.
     * (Data and message from the old instance will be copied to the new instance.)
     *
     * @param data - Data of the created {@link DataResponse}.
     * @returns
     */
    static cached(data) {
        if (data instanceof DataResponse) {
            return DataResponse.fromDataResponse(data, DataStatus.CACHED);
        }
        return new DataResponse(data, DataStatus.CACHED);
    }
    /**
     * Check if given {@link DataStatus} is interpreted as a successfull response.
     * @param {DataStatus} status
     * @returns {boolean}
     */
    static isSuccess(status) {
        return status === DataStatus.OK || status === DataStatus.CACHED;
    }
    /**
     * Checks if the {@link DataResponse} is Empty.
     * If the field `data` is `null` or `undefined` the object is an instance of {@link EmptyResponse}.
     * Otherwise its an instance of {@link DataResponse}.
     */
    static isEmpty(resp) {
        return resp.data == null;
    }
}
export { DataResponse, DataStatus };
