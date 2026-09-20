import type { ZodTypeAny } from "zod";

export class ApiContractError extends Error {
  readonly code = "API_RESPONSE_INVALID";
  constructor(readonly paths: string[]) {
    super("The server returned an incompatible response. Please try again or contact support.");
    this.name = "ApiContractError";
  }
}

export function parseResponse<T>(schema: ZodTypeAny, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) throw new ApiContractError(result.error.issues.map(issue => issue.path.join(".")));
  return result.data as T;
}
