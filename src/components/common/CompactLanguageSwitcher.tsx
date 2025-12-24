import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "he", name: "עברית", flag: "🇮🇱" },
];

export const CompactLanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem("i18nextLng", languageCode);

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
    <div className="flex items-center gap-2">
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[110px] h-8 rounded-full bg-white border-gray-200 text-sm">
          <SelectValue>
            <div className="flex items-center gap-1.5">
              <span className="text-base">{currentLanguage.flag}</span>
              <span className="text-xs">{currentLanguage.name}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
