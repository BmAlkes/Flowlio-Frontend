import { beforeEach, describe, expect, it, vi } from "vitest";
const client = vi.hoisted(() => ({
  twoFactor: { sendOtp: vi.fn(), verifyOtp: vi.fn() },
  emailOtp: { sendVerificationOtp: vi.fn() },
  signIn: { emailOtp: vi.fn() },
  getSession: vi.fn(),
}));
vi.mock("./auth-client", () => ({ authClient: client }));
import { sendSignInOTP, verifySignInOTP } from "./sign-in-otp";

describe("OTP and second-factor sign-in", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    client.twoFactor.sendOtp.mockResolvedValue({ data: { status: true } });
    client.twoFactor.verifyOtp.mockResolvedValue({ data: { status: true } });
    client.signIn.emailOtp.mockResolvedValue({ data: { status: true } });
    client.emailOtp.sendVerificationOtp.mockResolvedValue({
      data: { status: true },
    });
    client.getSession.mockResolvedValue({
      data: { user: { email: "alice@example.com" }, session: { id: "s1" } },
    });
  });
  it("sends the challenge-bound second-factor OTP without accepting a target identity", async () => {
    await sendSignInOTP("alice@example.com", true);
    expect(client.twoFactor.sendOtp).toHaveBeenCalledWith({});
    expect(client.emailOtp.sendVerificationOtp).not.toHaveBeenCalled();
  });
  it("uses the sign-in purpose for passwordless OTP", async () => {
    await sendSignInOTP("alice@example.com", false);
    expect(client.emailOtp.sendVerificationOtp).toHaveBeenCalledWith({
      email: "alice@example.com",
      type: "sign-in",
    });
  });
  it.each([true, false])(
    "requires a confirmed matching session after verification (2FA=%s)",
    async (secondFactor) => {
      const session = await verifySignInOTP(
        "alice@example.com",
        "123456",
        secondFactor,
      );
      expect(session.session.id).toBe("s1");
      expect(client.getSession).toHaveBeenCalledWith({
        query: { disableCookieCache: true },
      });
      if (secondFactor) {
        expect(client.twoFactor.verifyOtp).toHaveBeenCalledWith({
          code: "123456",
        });
        expect(client.signIn.emailOtp).not.toHaveBeenCalled();
      } else
        expect(client.signIn.emailOtp).toHaveBeenCalledWith({
          email: "alice@example.com",
          otp: "123456",
        });
    },
  );
  it.each([null, { user: { email: "bob@example.com" } }])(
    "does not report success with absent/foreign session",
    async (data) => {
      client.getSession.mockResolvedValue({ data });
      await expect(
        verifySignInOTP("alice@example.com", "123456", true),
      ).rejects.toThrow("could not be confirmed");
    },
  );
  it("propagates invalid OTP without attempting another login", async () => {
    client.twoFactor.verifyOtp.mockResolvedValue({
      error: { message: "Invalid OTP" },
    });
    await expect(
      verifySignInOTP("alice@example.com", "000000", true),
    ).rejects.toThrow("Invalid OTP");
    expect(client.getSession).not.toHaveBeenCalled();
    expect(client.signIn.emailOtp).not.toHaveBeenCalled();
  });
});
