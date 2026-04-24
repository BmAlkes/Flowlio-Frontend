import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Stack } from "@/components/ui/stack";
import { Box } from "@/components/ui/box";
import { Globe } from "lucide-react";
import { toast } from "sonner";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "he", name: "עברית", flag: "🇮🇱" },
];

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem("i18nextLng", languageCode);
    toast.success(t("settings.languageChanged"));

    // Update HTML lang attribute for accessibility
    document.documentElement.lang = languageCode;

    // Update HTML dir attribute for RTL languages (Hebrew)
    // Only set dir for Hebrew, let other languages use default LTR
    if (languageCode === "he") {
      document.documentElement.setAttribute("dir", "rtl");
      document.body.setAttribute("dir", "rtl");
    } else {
      document.documentElement.setAttribute("dir", "ltr");
      document.body.setAttribute("dir", "ltr");
    }

    // Force a small delay to ensure DOM updates
    setTimeout(() => {
      window.dispatchEvent(new Event("languagechange"));
    }, 100);
  };

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <Box className="w-full bg-card border-1 border-border p-8 rounded-xl max-md:px-3 flex-1 flex">
      <Stack className="gap-4">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-muted-foreground" />
          <h1 className="text-xl font-medium">
            {t("settings.languageSettings")}
          </h1>
        </div>

        <p className="text-sm text-muted-foreground mb-2">
          {t("settings.selectLanguage")}
        </p>

        <Select value={i18n.language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-full max-w-md rounded-full bg-background border-border">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-xl">{currentLanguage.flag}</span>
                <span>{currentLanguage.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Box className="bg-blue-900/20 border border-blue-700 p-4 rounded-md mt-4">
          <p className="text-sm text-blue-500">
            <strong>💡 {t("settings.tip")}:</strong>{" "}
            {t("settings.languageChanged")}
          </p>
        </Box>
      </Stack>
    </Box>
  );
};
