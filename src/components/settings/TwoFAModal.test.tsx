import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import en from "@/locales/en.json";
import { TwoFAModal } from "./TwoFAModal";

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("sonner", () => ({ toast }));
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      key.split(".").reduce((value: any, part) => value?.[part], en) ?? key,
  }),
}));

describe("2FA inside the profile form", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);
  const setup = (enabled = false) => {
    const profileSubmit = vi.fn();
    const toggle = vi.fn().mockResolvedValue(undefined);
    const verify = vi.fn().mockResolvedValue(undefined);
    const disable = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            profileSubmit();
          }}
        >
          <TwoFAModal
            open
            isEnabled={enabled}
            onToggle={toggle}
            onVerifyOTP={verify}
            onDisable2FA={disable}
            onResendOTP={vi.fn()}
            onClose={vi.fn()}
            userEmail="alice@example.com"
          />
        </form>
      </MemoryRouter>,
    );
    return { profileSubmit, toggle, verify, disable, user: userEvent.setup() };
  };
  it("keeps a failed password attempt in the modal and allows successful password + OTP retry", async () => {
    const { profileSubmit, toggle, verify, user } = setup();
    toggle.mockRejectedValueOnce(new Error("Incorrect password"));
    const password = await screen.findByPlaceholderText(
      en.settings.enterYourPassword,
    );
    await user.type(password, "wrong-password");
    await user.click(
      screen.getByRole("button", { name: en.settings.verifyAndContinue }),
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Incorrect password"),
    );
    expect(profileSubmit).not.toHaveBeenCalled();
    expect(verify).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    await user.clear(password);
    await user.type(password, "correct-password");
    await user.click(
      screen.getByRole("button", { name: en.settings.verifyAndContinue }),
    );
    await user.type(await screen.findByPlaceholderText("000000"), "123456");
    await user.click(
      screen.getByRole("button", { name: en.settings.verifyAndEnable }),
    );
    await waitFor(() => expect(verify).toHaveBeenCalledWith("123456"));
    expect(toggle).toHaveBeenLastCalledWith(true, "correct-password");
    expect(
      await screen.findByText(en.settings.twoFactorAuthenticationEnabledDesc),
    ).toBeInTheDocument();
    expect(profileSubmit).not.toHaveBeenCalled();
  });
  it("does not label an email delivery failure as an incorrect password", async () => {
    const { toggle, user, profileSubmit } = setup();
    toggle.mockRejectedValueOnce(
      new Error("Unable to send verification email"),
    );
    await user.type(
      await screen.findByPlaceholderText(en.settings.enterYourPassword),
      "correct-password",
    );
    await user.click(
      screen.getByRole("button", { name: en.settings.verifyAndContinue }),
    );
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Unable to send verification email",
      ),
    );
    expect(profileSubmit).not.toHaveBeenCalled();
    expect(screen.queryByPlaceholderText("000000")).not.toBeInTheDocument();
  });
  it("does not submit the profile when disabling 2FA", async () => {
    const { disable, user, profileSubmit } = setup(true);
    await user.type(
      await screen.findByPlaceholderText(en.settings.enterYourPassword),
      "correct-password",
    );
    await user.click(
      screen.getByRole("button", { name: en.settings.disable2FA }),
    );
    await waitFor(() =>
      expect(disable).toHaveBeenCalledWith("correct-password"),
    );
    expect(profileSubmit).not.toHaveBeenCalled();
  });
});
