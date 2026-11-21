import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GeneralModal } from "@/components/common/generalmodal";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  getStoredConsent,
  acceptAllConsent,
  rejectNonEssentialConsent,
  savePartialConsent,
} from "@/utils/cookieConsent";
import { loadMetaPixel } from "@/utils/loadMetaPixel";

/** Fired by the "Cookie Settings" footer link to reopen the preferences
 * modal at any time, even after the visitor already made a choice. */
export const OPEN_COOKIE_PREFERENCES_EVENT = "open-cookie-preferences";

export function CookieConsentBanner() {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setAnalytics(stored.analytics);
      setMarketing(stored.marketing);
      if (stored.marketing) loadMetaPixel();
    } else {
      setShowBanner(true);
    }

    const openPreferences = () => {
      const current = getStoredConsent();
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setShowPreferences(true);
    };
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, openPreferences);
  }, []);

  const closeAll = () => {
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleAcceptAll = () => {
    acceptAllConsent();
    loadMetaPixel();
    closeAll();
  };

  const handleRejectNonEssential = () => {
    rejectNonEssentialConsent();
    closeAll();
  };

  const handleSavePreferences = () => {
    savePartialConsent({ analytics, marketing });
    if (marketing) loadMetaPixel();
    closeAll();
  };

  return (
    <>
      {showBanner && (
        <Box className="fixed bottom-0 inset-x-0 z-[100] border-t border-border bg-card shadow-2xl">
          <Flex className="max-w-6xl mx-auto p-4 md:p-5 items-start md:items-center gap-4 flex-col md:flex-row">
            <Flex className="items-start gap-3 flex-1 min-w-0">
              <Cookie className="h-5 w-5 text-[#1797B9] shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/90 leading-relaxed">
                {t("privacy.cookieBanner.text")}{" "}
                <Link to="/privacy-policy" className="underline hover:text-foreground">
                  {t("privacy.cookieBanner.policyLink")}
                </Link>
                . {t("privacy.cookieBanner.notSold")}
              </p>
            </Flex>
            <Flex className="items-center gap-2 shrink-0 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setShowPreferences(true)}>
                {t("privacy.cookieBanner.manage")}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRejectNonEssential}>
                {t("privacy.cookieBanner.reject")}
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="bg-[#1797B9] hover:bg-[#1797B9]/80 text-white"
              >
                {t("privacy.cookieBanner.acceptAll")}
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

      <GeneralModal open={showPreferences} onOpenChange={(open) => !open && setShowPreferences(false)}>
        <Stack className="gap-5">
          <Flex className="items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Cookie className="h-4 w-4" /> {t("privacy.cookieBanner.title")}
            </h2>
            <button
              onClick={() => setShowPreferences(false)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={t("privacy.cookieBanner.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </Flex>

          <p className="text-sm text-muted-foreground">
            {t("privacy.cookieBanner.intro")}
          </p>

          <Stack className="gap-4">
            <Flex className="items-start justify-between gap-4 border border-border rounded-lg p-3">
              <Box>
                <p className="text-sm font-medium text-foreground">{t("privacy.cookieBanner.necessary")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("privacy.cookieBanner.necessaryDesc")}
                </p>
              </Box>
              <Switch checked disabled />
            </Flex>

            <Flex className="items-start justify-between gap-4 border border-border rounded-lg p-3">
              <Box>
                <p className="text-sm font-medium text-foreground">{t("privacy.cookieBanner.analytics")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("privacy.cookieBanner.analyticsDesc")}
                </p>
              </Box>
              <Switch checked={analytics} onCheckedChange={setAnalytics} />
            </Flex>

            <Flex className="items-start justify-between gap-4 border border-border rounded-lg p-3">
              <Box>
                <p className="text-sm font-medium text-foreground">{t("privacy.cookieBanner.marketing")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t("privacy.cookieBanner.marketingDesc")}
                </p>
              </Box>
              <Switch checked={marketing} onCheckedChange={setMarketing} />
            </Flex>
          </Stack>

          <Flex className="justify-end gap-2 pt-1">
            <Button variant="outline" onClick={handleRejectNonEssential}>
              {t("privacy.cookieBanner.reject")}
            </Button>
            <Button
              onClick={handleSavePreferences}
              className="bg-[#1797B9] hover:bg-[#1797B9]/80 text-white"
            >
              {t("privacy.cookieBanner.save")}
            </Button>
          </Flex>
        </Stack>
      </GeneralModal>
    </>
  );
}
