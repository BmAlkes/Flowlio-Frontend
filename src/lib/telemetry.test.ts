import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { reportUiError, resetTelemetryScope, telemetryRoute } from "./telemetry";
const fetchMock=vi.fn();
beforeEach(()=>{resetTelemetryScope();fetchMock.mockReset();vi.stubGlobal("fetch",fetchMock);window.history.replaceState({},"","/dashboard/project/private-id?token=secret");});
afterEach(()=>{vi.unstubAllGlobals();window.history.replaceState({},"","/");});
it("reports only fixed metadata and reuses the reference for a repeated failure",async()=>{
  fetchMock.mockResolvedValue({ok:true,json:async()=>({correlationId:"reference"})});
  expect(await reportUiError("REACT_ERROR")).toBe("reference");
  expect(await reportUiError("REACT_ERROR")).toBe("reference");
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const body=JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(body).toEqual({code:"REACT_ERROR",route:"projects",release:expect.any(String)});
  expect(JSON.stringify(fetchMock.mock.calls)).not.toContain("private-id");
  expect(JSON.stringify(fetchMock.mock.calls)).not.toContain("secret");
});
it("does not throw or recursively report if telemetry storage is unavailable",async()=>{
 fetchMock.mockRejectedValue(new Error("Offline"));await expect(reportUiError("UI_ERROR")).resolves.toBeUndefined();expect(fetchMock).toHaveBeenCalledTimes(1);
});
it("resets deduplication at session/organization boundaries",async()=>{
 fetchMock.mockResolvedValue({ok:false});await reportUiError("UI_ERROR");resetTelemetryScope();await reportUiError("UI_ERROR");expect(fetchMock).toHaveBeenCalledTimes(2);
});
it("never retains public identifiers or unrecognized routes",()=>{
 expect(telemetryRoute("/payment/private-id")).toBe("public");expect(telemetryRoute("/dashboard/private-email@example.com")).toBe("dashboard");
});
