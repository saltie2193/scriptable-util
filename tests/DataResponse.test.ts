import { describe, test, expect } from "@jest/globals";
import { DataResponse, DataStatus } from "../src/DataResponse";

describe("EmptyResponse", () => {
  test("data is null and msg is undefined", () => {
    const empty = DataResponse.empty();
    expect(empty.data).toBeNull();
    expect(empty.status).toEqual(DataStatus.OK);
    expect(empty.msg).toBeUndefined();
  });

  test("msg is set", () => {
    const msg = "Whatever it takes!!!";
    const empty = DataResponse.empty(undefined, msg);
    expect(empty.msg).toEqual(msg);
    expect(empty.data).toBeNull();
  });

  test("status is set", () => {
    for (const s of Object.values(DataStatus)) {
      const empty = DataResponse.empty(s);
      expect(empty.msg).toBeUndefined();
      expect(empty.data).toBeNull();
      expect(empty.status).toEqual(s);
    }
  });
});

describe("isEmpty", () => {
  test("Response with null is empty", () => {
    const resp_null = new DataResponse(null);
    expect(resp_null.isEmpty()).toBe(true);
  });

  test("Response with undefined is empty", () => {
    const resp_undefined = new DataResponse(undefined);
    expect(resp_undefined.isEmpty()).toBe(true);
  });

  test("Non empty response is not empty", () => {
    const resp = new DataResponse("undefined");
    expect(resp.isEmpty()).toBe(false);
  });
});

describe("static generators", () => {
  describe("notFound", () => {
    test("type is NOT_FOUND and data is null (no msg)", () => {
      const notFound = DataResponse.notFound();

      expect(notFound.data).toBeNull();
      expect(notFound.status).toBe(DataStatus.NOT_FOUND);
      expect(notFound.msg).toBeUndefined();
    });

    test("type is NOT_FOUND and data is null (with msg)", () => {
      const msg = "A message";
      const notFound = DataResponse.notFound(msg);

      expect(notFound.data).toBeNull();
      expect(notFound.status).toBe(DataStatus.NOT_FOUND);
      expect(notFound.msg).toEqual(msg);
    });
  });

  describe("error", () => {
    test("type is ERROR and data is null (no msg)", () => {
      const error = DataResponse.error();
      expect(error.data).toBeNull();
      expect(error.status).toBe(DataStatus.ERROR);
      expect(error.msg).toBeUndefined();
    });

    test("type is ERROR and data is null (with msg)", () => {
      const msg = "A message";
      const error = DataResponse.error(msg);
      expect(error.data).toBeNull();
      expect(error.status).toBe(DataStatus.ERROR);
      expect(error.msg).toEqual(msg);
    });
  });

  describe("apiError", () => {
    test("type is API_ERROR and data is null (no msg)", () => {
      const resp = DataResponse.apiError();

      expect(resp.data).toBeNull();
      expect(resp.status).toBe(DataStatus.API_ERROR);
      expect(resp.msg).toBeUndefined();
    });

    test("type is API_ERROR and data is null (with msg)", () => {
      const msg = "A message";
      const resp = DataResponse.apiError(msg);

      expect(resp.data).toBeNull();
      expect(resp.status).toBe(DataStatus.API_ERROR);
      expect(resp.msg).toEqual(msg);
    });
  });

  describe("ok", () => {
    test("ok: type is OK (no msg)", () => {
      const data = "data";
      const ok = DataResponse.ok(data);

      expect(ok.status).toBe(DataStatus.OK);
      expect(ok.data).toEqual(data);
    });

    test("ok: type is OK (with msg)", () => {
      const msg = "A message";
      const data = "data";
      const ok = DataResponse.ok(data, msg);

      expect(ok.status).toBe(DataStatus.OK);
      expect(ok.data).toEqual(data);
      expect(ok.msg).toEqual(msg);
    });
  });
});

describe("static generators from existing response", () => {
  test("fromDataResponse: type is set (no msg)", () => {
    const data = "data";
    const tmp = new DataResponse(data);
    for (const s of Object.values(DataStatus)) {
      const resp = DataResponse.fromDataResponse(tmp, s);

      expect(resp.data).toBe(data);
      expect(resp.msg).toBeUndefined();
      expect(resp.status).toBe(s);
    }
  });

  test("fromDataResponse: type is set (with msg)", () => {
    const data = "data";
    const msg = "A message";
    const tmp = new DataResponse(data, undefined, msg);

    for (const s of Object.values(DataStatus)) {
      const resp = DataResponse.fromDataResponse(tmp, s);

      expect(resp.data).toBe(data);
      expect(resp.msg).toBe(msg);
      expect(resp.status).toBe(s);
    }
  });

  test("cached: sets status to CACHED", () => {
    const data = "data";
    const resp = DataResponse.ok(data);

    expect(resp.msg).toBeUndefined();
    expect(resp.data).toBe(data);
    expect(resp.status).toBe(DataStatus.OK);

    const resp_cached = DataResponse.cached(resp);
    expect(resp_cached.msg).toBe(resp.msg);
    expect(resp_cached.data).toBe(resp.data);
    expect(resp_cached.status).toBe(DataStatus.CACHED);
  });
});
