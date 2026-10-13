import { expect, it, vi } from "vitest";
vi.mock("@/configs/axios.config", () => ({ axios: {} }));
import { transformToPieChartData } from "./useFetchProjectStatusData";
it("keeps real project counts instead of labelling percentages as projects", () => {
  const data = transformToPieChartData({ongoing: 3, delayed: 1, finished: 2, total: 8});
  expect(data.map(row => row.value)).toEqual([3, 1, 2, 2]);
  expect(data.reduce((total, row) => total + row.value, 0)).toBe(8);
});
