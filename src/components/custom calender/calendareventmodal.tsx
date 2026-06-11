import React, { useEffect } from "react";
import { CalendarEvent as CustomEvent } from "./calendarUtils";
import { GeneralModalReturnTypeProps } from "../common/generalmodal";
import { Input } from "../ui/input";
import { Flex } from "../ui/flex";
import { ArrowRight, Clock, X } from "lucide-react";
import { Center } from "../ui/center";
import GoogleMeetIcon from "/dashboard/google-meet.svg";
import WhatsappIcon from "/dashboard/whatsapp-icon.svg";
import OutlookIcon from "/dashboard/google-drive.svg";
import { Box } from "../ui/box";
import { Button } from "../ui/button";
import { useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { getStartOfWeek, formatHour as utilsFormatHour } from "./calendarUtils";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "../customeIcons";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

interface EventModalProps {
  modalProps: GeneralModalReturnTypeProps;
  onSave: (e: CustomEvent) => void;
  onClose: () => void;
  eventToEdit?: CustomEvent | null;
}

interface EventFormData {
  title: string;
  description: string;
  date: Date;
  startHour: number;
  endHour: number;
  calendarType: "work" | "education" | "personal" | "meeting";
  platform: "google_meet" | "whatsapp" | "outlook" | "zoom" | "none";
  meetLink: string;
  whatsappNumber: string;
  outlookEvent: string;
}

const hours = Array.from({ length: 24 }, (_, i) => i);

interface TimeDropdownProps {
  value: number;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
  label: string;
}

const TimeDropdown = ({ value, onChange, options }: TimeDropdownProps) => {
  const [open, setOpen] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <Box className="relative flex-1" ref={ref}>
      <Center
        className="justify-between w-full px-3 py-2 rounded-lg border border-border cursor-pointer hover:border-[#1797B9] transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-3.5 text-[#1797B9]" />
          {options.find((o) => o.value === value)?.label || t("common.select")}
        </span>
        <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Center>

      {open && (
        <ul className="absolute z-[1002] mt-1 w-full bg-card rounded-lg shadow-lg border border-border max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm transition-colors hover:bg-muted ${
                value === opt.value ? "bg-muted font-semibold text-[#1797B9]" : "text-foreground"
              }`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </Box>
  );
};

const CALENDAR_TYPES = [
  { id: "work" as const, labelKey: "eventModal.work", color: "#5B60FE" },
  { id: "education" as const, labelKey: "eventModal.education", color: "#FFA632" },
  { id: "personal" as const, labelKey: "eventModal.personal", color: "#4DCDC9" },
  { id: "meeting" as const, labelKey: "eventModal.meeting", color: "#5B60FE" },
];

const PLATFORMS = [
  { id: "google_meet" as const, labelKey: "eventModal.googleMeet", icon: GoogleMeetIcon },
  { id: "whatsapp" as const, labelKey: "eventModal.whatsApp", icon: WhatsappIcon },
  { id: "outlook" as const, labelKey: "eventModal.outlook", icon: OutlookIcon },
];

export const EventModal: React.FC<EventModalProps> = ({
  onSave,
  onClose,
  eventToEdit,
  modalProps,
}) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const currentLocale = currentLanguage === "es" ? es : enUS;

  const getDuration = (startHour: number, endHour: number) => {
    const duration = endHour - startHour;
    if (duration <= 0) return "";
    const unit = duration > 1 ? t("eventModal.hours") : t("eventModal.hour");
    return `${duration} ${unit}`;
  };

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<EventFormData>({
    defaultValues: {
      title: eventToEdit?.title || "",
      description: eventToEdit?.description || "",
      date: eventToEdit ? new Date(eventToEdit.date) : new Date(),
      startHour: eventToEdit?.startHour ?? 8,
      endHour: eventToEdit?.endHour ?? 13,
      calendarType: eventToEdit?.calendarType || "education",
      platform: eventToEdit?.platform || "none",
      meetLink: eventToEdit?.meetLink || "",
      whatsappNumber: eventToEdit?.whatsappNumber || "",
      outlookEvent: eventToEdit?.outlookEvent || "",
    },
  });

  const title = watch("title");
  const date = watch("date");
  const startHour = watch("startHour");
  const endHour = watch("endHour");
  const calendarType = watch("calendarType");
  const platform = watch("platform");
  const isValid = startHour < endHour && !!date && !!title;

  useEffect(() => {
    if (eventToEdit) {
      reset({
        ...eventToEdit,
        description: eventToEdit.description || "",
        date: eventToEdit.date ? new Date(eventToEdit.date) : new Date(),
        startHour: typeof eventToEdit.startHour === "number" ? eventToEdit.startHour : 8,
        endHour: typeof eventToEdit.endHour === "number" ? eventToEdit.endHour : 13,
      });
    } else {
      reset({
        title: "",
        description: "",
        date: new Date(),
        startHour: 8,
        endHour: 13,
        calendarType: "education",
        platform: "none",
        meetLink: "",
        whatsappNumber: "",
        outlookEvent: "",
      });
    }
  }, [eventToEdit, reset, modalProps.open]);

  if (!modalProps.open) return null;

  const hourOptions = hours.map((h) => ({
    value: h,
    label: utilsFormatHour(h, currentLanguage),
  }));

  return (
    <Center
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <Box
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          className="p-6 max-h-[90vh] overflow-y-auto"
          onSubmit={handleSubmit((data) => {
            if (!(data.startHour < data.endHour && data.title && data.date)) return;
            const localDate = new Date(data.date);
            localDate.setHours(0, 0, 0, 0);
            onSave({
              title: data.title,
              description: data.description || "",
              date: localDate.toISOString(),
              day: localDate.getDay(),
              startHour: Number(data.startHour),
              endHour: Number(data.endHour),
              weekStart: getStartOfWeek(localDate).toISOString(),
              calendarType: data.calendarType as "work" | "education" | "personal" | "meeting",
              platform: data.platform,
              meetLink: data.platform === "google_meet" ? data.meetLink : undefined,
              whatsappNumber: data.platform === "whatsapp" ? data.whatsappNumber : undefined,
              outlookEvent: data.platform === "outlook" ? data.outlookEvent : undefined,
            });
            onClose();
          })}
        >
          {/* Header */}
          <Flex className="items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground">
              {eventToEdit ? t("eventModal.editEvent") : t("eventModal.newEvent")}
            </h2>
            <Button
              className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              variant="ghost"
              size="icon"
              type="button"
            >
              <X className="size-4" />
            </Button>
          </Flex>

          {/* Title */}
          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
              {t("eventModal.eventTitle")}
            </label>
            <Input
              {...register("title", { required: true })}
              placeholder={t("eventModal.enterTitle")}
              className="bg-background rounded-lg h-10 text-sm placeholder:text-muted-foreground"
            />
            {errors.title && (
              <span className="text-red-500 text-xs mt-1 block">{t("eventModal.titleRequired")}</span>
            )}
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
              {t("eventModal.pickDate")}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-background rounded-lg h-10 border border-border text-sm"
                  type="button"
                >
                  <CalendarIcon className="size-4 fill-[#1797B9] mr-2 shrink-0" />
                  {date ? (
                    format(new Date(date), "EEEE, MMMM d", { locale: currentLocale })
                  ) : (
                    <span className="text-muted-foreground">{t("eventModal.pickDate")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]">
                <Calendar
                  className="w-72 p-2"
                  mode="single"
                  selected={date instanceof Date ? date : new Date(date)}
                  onSelect={(d) => setValue("date", d ?? new Date())}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time */}
          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">
              {t("eventModal.platform") === "Platform" ? "Time" : t("calendar.time") || "Time"}
            </label>
            <Flex className="items-center gap-2">
              <TimeDropdown value={startHour} onChange={(v) => setValue("startHour", v)} options={hourOptions} label="" />
              <ArrowRight className="size-4 text-muted-foreground shrink-0" />
              <TimeDropdown value={endHour} onChange={(v) => setValue("endHour", v)} options={hourOptions} label="" />
            </Flex>
            {Number(startHour) >= Number(endHour) ? (
              <p className="text-red-500 text-xs mt-1">{t("eventModal.timeError")}</p>
            ) : (
              <p className="text-[#1797B9] text-xs mt-1 font-medium">
                {getDuration(Number(startHour), Number(endHour))}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <Input
              {...register("description")}
              placeholder={t("eventModal.description")}
              className="bg-background rounded-lg h-10 text-sm placeholder:text-muted-foreground font-normal"
            />
          </div>

          {/* Calendar type */}
          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              {t("eventModal.calendar")}
            </label>
            <Flex className="gap-1.5 flex-wrap">
              {CALENDAR_TYPES.map((type) => {
                const isActive = calendarType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setValue("calendarType", type.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                      isActive
                        ? "border-transparent text-white shadow-sm"
                        : "border-border text-muted-foreground hover:border-border/80 bg-transparent"
                    )}
                    style={isActive ? { backgroundColor: type.color } : {}}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: isActive ? "rgba(255,255,255,0.7)" : type.color }}
                    />
                    {t(type.labelKey)}
                  </button>
                );
              })}
            </Flex>
          </div>

          {/* Platform */}
          <div className="mb-5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
              {t("eventModal.platform")}
              <span className="normal-case ml-1 text-muted-foreground/60">({t("eventModal.optional")})</span>
            </label>
            <Flex className="gap-1.5 flex-wrap">
              {PLATFORMS.map((p) => {
                const isActive = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setValue("platform", isActive ? "none" : p.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      isActive
                        ? "border-[#1797B9] bg-[#1797B9]/10 text-[#1797B9]"
                        : "border-border text-muted-foreground hover:border-border/80 bg-transparent"
                    )}
                  >
                    <img src={p.icon} className="size-3.5 shrink-0" alt="" />
                    {t(p.labelKey)}
                  </button>
                );
              })}
            </Flex>

            {platform === "google_meet" && (
              <Input
                {...register("meetLink")}
                placeholder={t("eventModal.googleMeetLink")}
                className="mt-2 bg-background rounded-lg h-10 text-sm placeholder:text-muted-foreground"
              />
            )}
            {platform === "whatsapp" && (
              <Input
                {...register("whatsappNumber")}
                placeholder={t("eventModal.whatsAppNumber")}
                className="mt-2 bg-background rounded-lg h-10 text-sm placeholder:text-muted-foreground"
              />
            )}
            {platform === "outlook" && (
              <Input
                {...register("outlookEvent")}
                placeholder={t("eventModal.outlookEvent")}
                className="mt-2 bg-background rounded-lg h-10 text-sm placeholder:text-muted-foreground"
              />
            )}
          </div>

          {/* Actions */}
          <Flex className="justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="px-4 h-9 text-sm rounded-lg font-normal"
            >
              {t("eventModal.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={!isValid}
              className="px-4 h-9 text-sm rounded-lg font-normal text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#1797B9" }}
            >
              {eventToEdit ? t("eventModal.save") : t("eventModal.create")}
            </Button>
          </Flex>
        </form>
      </Box>
    </Center>
  );
};
