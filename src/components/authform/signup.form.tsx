import {
  Form,
  FormItem,
  FormLabel,
  FormField,
  FormMessage,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormWrapper } from "./formwrapper";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useEffect, useMemo, useState } from "react";
import { authClient, useUser } from "@/providers/user.provider";
import type { FC } from "react";
import { z } from "zod";
import { Box } from "../ui/box";
import { toast } from "sonner";
import { Anchor } from "../ui/anchor";
import { Flex } from "../ui/flex";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { usePlanSelectionStore } from "@/store/planSelection.store";
import { Checkbox } from "../ui/checkbox";
import { LEGAL_VERSION } from "@/configs/legal.config";
import { useTranslation } from "react-i18next";
import { useFetchPublicPlans } from "@/hooks/usefetchplans";
import { useActivateFreePlan, useStartTrial } from "@/hooks/usesubscription";
import { chooseStart, countryFromLocale, type StartPath } from "@/features/signup/start-plan";

const inputClass =
  "bg-background rounded-full border border-border placeholder:text-muted-foreground focus:border-gray-400 placeholder:text-sm";

/** What the chosen plan means for the person signing up, shown above the form. */
function planNote(start: StartPath, t: (key: string, options?: Record<string, unknown>) => string) {
  if (start.kind === "free") return t("conversion.signup.planFree", { name: start.plan.name });
  if (start.kind === "trial") return t("conversion.signup.planTrial", { name: start.plan.name, count: start.trialDays });
  if (start.kind === "checkout") return t("conversion.signup.planCheckout", { name: start.plan.name });
  return null;
}

export const SignUpForm: FC = () => {
  const { t } = useTranslation();
  useEffect(() => {
    scrollTo(0, 0);
    document.title = `${t("conversion.signup.title")} - Flowlio`;
  }, [t]);
  const navigate = useNavigate();
  const { refetchUser } = useUser();
  const { selectedPlanId, setOrganizationData, clearPlanSelection } = usePlanSelectionStore();
  const { data: plansResponse } = useFetchPublicPlans();
  const activateFree = useActivateFreePlan();
  const startTrial = useStartTrial();
  const start = useMemo(() => chooseStart(plansResponse?.data ?? [], selectedPlanId), [plansResponse?.data, selectedPlanId]);

  const [stage, setStage] = useState<"idle" | "creating" | "starting">("idle");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const formSchema = useMemo(
    () =>
      z.object({
        username: z.string().trim().min(1, { message: t("conversion.signup.errors.required") }),
        organizationName: z.string().trim().min(1, { message: t("conversion.signup.errors.required") }).max(120),
        createpassword: z
          .string()
          .min(8, t("conversion.signup.errors.passwordMin"))
          .regex(/[A-Z]/, t("conversion.signup.errors.passwordUpper"))
          .regex(/[^A-Za-z0-9]/, t("conversion.signup.errors.passwordSymbol")),
        email: z
          .string()
          .min(1, { message: t("conversion.signup.errors.required") })
          .email({ message: t("conversion.signup.errors.email") })
          .max(50, { message: t("conversion.signup.errors.emailMax") }),
        rememberMe: z.boolean(),
        // LGPD: explicit acceptance of the Terms and Privacy Policy before creating the account.
        acceptTerms: z.boolean().refine((value) => value, { message: t("conversion.signup.errors.terms") }),
      }),
    [t],
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { rememberMe: true, acceptTerms: false, createpassword: "", email: "", username: "", organizationName: "" },
  });

  /** After the account exists: start the free plan or the trial right away, or continue to checkout. */
  const startPlan = async (organizationName: string) => {
    const country = countryFromLocale();
    try {
      if (start.kind === "free" || start.kind === "trial") {
        setStage("starting");
        const input = { planId: start.plan.id, organizationName, country };
        if (start.kind === "free") await activateFree.mutateAsync(input);
        else await startTrial.mutateAsync(input);
        clearPlanSelection();
        await refetchUser().catch(() => undefined);
        toast.success(t("conversion.signup.created"));
        navigate("/dashboard", { replace: true });
        return;
      }
      setOrganizationData({ organizationName });
      toast.success(t("conversion.signup.created"));
      if (start.kind === "checkout") {
        navigate("/checkout", { replace: true, state: { fromSignup: true, createOrganization: true, selectedPlanId: start.plan.id } });
      } else {
        navigate("/pricing", { replace: true, state: { fromSignup: true, pendingAccount: true } });
      }
    } catch {
      setOrganizationData({ organizationName });
      toast.error(t("conversion.signup.startFailed"));
      navigate("/pricing", { replace: true, state: { fromSignup: true, pendingAccount: true } });
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setStage("creating");
    setError(null);
    try {
      await authClient.signUp.email(
        {
          name: data.username.trim(),
          email: data.email,
          password: data.createpassword,
          termsVersion: LEGAL_VERSION,
        } as Parameters<typeof authClient.signUp.email>[0],
        {
          onSuccess: async () => {
            // Give Better Auth a moment to set the session cookie, then load the new user.
            await new Promise((resolve) => setTimeout(resolve, 1500));
            await refetchUser().catch(() => undefined);
            await startPlan(data.organizationName.trim());
            setStage("idle");
          },
          onError: (ctx: { error?: { message?: string } }) => {
            const message = ctx?.error?.message || t("conversion.signup.failed");
            toast.error(message);
            setError(message);
            setStage("idle");
          },
        },
      );
    } catch {
      setError(t("conversion.signup.failed"));
      setStage("idle");
    }
  };

  const busy = stage !== "idle";
  const note = planNote(start, t);

  return (
    <FormWrapper description={t("conversion.signup.description")} logoSource="/logo/logowithtext.png" label={t("conversion.signup.title")}>
      <Form {...form}>
        <form className="flex flex-col gap-3" onSubmit={form.handleSubmit(onSubmit)}>
          {note && (
            <Flex className="mt-3 items-center justify-between gap-2 rounded-xl border border-[#1797B9]/30 bg-[#1797B9]/5 px-4 py-2 text-sm">
              <span>{note}</span>
              <Link to="/pricing" className="shrink-0 text-[#11718c] underline dark:text-[#55bdd9]">
                {t("conversion.signup.changePlan")}
              </Link>
            </Flex>
          )}

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel className="font-normal">{t("conversion.signup.name")}</FormLabel>
                <FormControl>
                  <Input size="lg" autoComplete="name" placeholder={t("conversion.signup.namePlaceholder")} {...field} className={inputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">{t("conversion.signup.organization")}</FormLabel>
                <FormControl>
                  <Input size="lg" autoComplete="organization" placeholder={t("conversion.signup.organizationPlaceholder")} {...field} className={inputClass} />
                </FormControl>
                <FormDescription className="text-xs">{t("conversion.signup.organizationHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">{t("conversion.signup.email")}</FormLabel>
                <FormControl>
                  <Input size="lg" type="email" autoComplete="email" placeholder={t("conversion.signup.emailPlaceholder")} {...field} className={inputClass} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="createpassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">{t("conversion.signup.password")}</FormLabel>
                <Box className="relative">
                  <FormControl>
                    <Input
                      size="lg"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={t("conversion.signup.passwordPlaceholder")}
                      className={`${inputClass} pe-12`}
                      {...field}
                    />
                  </FormControl>
                  <button
                      type="button"
                      aria-label={t("conversion.signup.password")}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                    </button>
                </Box>
                <FormDescription className="text-xs">{t("conversion.signup.passwordHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem>
                <Flex className="items-start gap-2">
                  <FormControl>
                    <Checkbox id="accept-terms" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} className="mt-0.5" />
                  </FormControl>
                  <label htmlFor="accept-terms" className="text-sm text-foreground/90 leading-snug cursor-pointer">
                    {t("conversion.signup.termsBefore")}{" "}
                    <a href="/terms-of-service" target="_blank" rel="noreferrer" className="underline text-blue-500">
                      {t("conversion.signup.terms")}
                    </a>{" "}
                    {t("conversion.signup.and")}{" "}
                    <a href="/privacy-policy" target="_blank" rel="noreferrer" className="underline text-blue-500">
                      {t("conversion.signup.privacy")}
                    </a>
                    .
                  </label>
                </Flex>
                <FormMessage />
              </FormItem>
            )}
          />

          <Flex className="justify-end gap-0">
            <Anchor to="/auth/signin" className="text-sm text-blue-500">
              {t("conversion.signup.haveAccount")}
            </Anchor>
          </Flex>

          {error && (
            <Box role="alert" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/40 dark:border-red-900">
              <p className="text-red-600 text-sm dark:text-red-300">{error}</p>
            </Box>
          )}

          <Button
            size="xl"
            disabled={busy}
            className="bg-[#1797B9] text-white rounded-full cursor-pointer hover:bg-[#1797B9]/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stage === "creating" ? t("conversion.signup.submitting") : stage === "starting" ? t("conversion.signup.starting") : t("conversion.signup.submit")}
          </Button>
        </form>
      </Form>
    </FormWrapper>
  );
};
