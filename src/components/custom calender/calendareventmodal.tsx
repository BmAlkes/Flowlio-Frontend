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
import WhatsAppCheckBoxIcon from "/dashboard/whatsappcheckbox.svg";
import EducationCheckBoxIcon from "/dashboard/educationcheckbox.svg";
import PersolCheckBoxIcon from "/dashboard/personalicon.svg";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { getStartOfWeek, formatHour as utilsFormatHour } from "./calendarUtils";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "../customeIcons";
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

const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23 (24 hours)

interface TimeDropdownOption {
  value: number;
  label: string;
}

interface TimeDropdownProps {
  value: number;
  onChange: (value: number) => void;
  options: TimeDropdownOption[];
  label: string;
}

const TimeDropdown = ({ value, onChange, options }: TimeDropdownProps) => {
  const [open, setOpen] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <Box className="relative w-40" ref={ref}>
      <Center
        className="justify-between w-full p-3 rounded-full border border-border text-cyan-900 font-semibold cursor-pointer"
        onClick={() => setOpen((o: boolean) => !o)}
      >
        <span className="flex items-center gap-2 font-normal text-muted-foreground">
          <Clock className="size-4 text-[#1797B9]" />
          {options.find((o) => o.value === value)?.label || t("common.select")}
        </span>

        <svg
          className="ml-2 w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Center>

      {open && (
        <ul className="absolute z-[1002] mt-2 w-full bg-card rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-cyan-100 text-cyan-900 ${
                value === opt.value ? "bg-cyan-100 font-bold" : ""
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </Box>
  );
};

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

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<EventFormData>({
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
        startHour:
          typeof eventToEdit.startHour === "number" ? eventToEdit.startHour : 8,
        endHour:
          typeof eventToEdit.endHour === "number" ? eventToEdit.endHour : 13,
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

  return (
    <Center
      className="fixed inset-0 z-50 bg-[#4D5B6259]"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
    >
      <Box
        className={
          modalProps.contentProps?.className +
          " bg-card rounded-xl p-0 min-w-[340px] min-h-[100px] z-[1001] relative box-shadow-[0_4px_32px_rgba(0,0,0,0.12)]"
        }
        onClick={(e) => e.stopPropagation()}
      >
        <form
          className="bg-card p-6 rounded-xl min-w-[340px] shadow-lg max-h-[620px] overflow-y-auto"
          onSubmit={handleSubmit((data) => {
            if (!(data.startHour < data.endHour && data.title && data.date))
              return;
            const localDate = new Date(data.date);
            localDate.setHours(0, 0, 0, 0);
            const weekStart = getStartOfWeek(localDate).toISOString();
            onSave({
              title: data.title,
              description: data.description || "",
              date: localDate.toISOString(),
              day: localDate.getDay(),
              startHour: Number(data.startHour),
              endHour: Number(data.endHour),
              weekStart,
              calendarType: data.calendarType as
                | "work"
                | "education"
                | "personal"
                | "meeting",
              platform: data.platform,
              meetLink:
                data.platform === "google_meet" ? data.meetLink : undefined,
              whatsappNumber:
                data.platform === "whatsapp" ? data.whatsappNumber : undefined,
              outlookEvent:
                data.platform === "outlook" ? data.outlookEvent : undefined,
            });
            onClose();
          })}
        >
          <Button
            className="absolute top-4 right-4 text-foreground border-none font-normal shadow-none cursor-pointer"
            onClick={onClose}
            variant="outline"
            size="icon"
            aria-label={t("common.close")}
            type="button"
          >
            <X className="size-4" />
          </Button>
          <h1 className="mb-4 font-normal text-[20px]">
            {eventToEdit ? t("eventModal.editEvent") : t("eventModal.newEvent")}
          </h1>
          <Flex className="flex-col gap-2 items-start">
            <label className="font-medium text-sm">{t("eventModal.eventTitle")}</label>
            <Input
              size="lg"
              {...register("title", { required: true })}
              placeholder={t("eventModal.enterTitle")}
              className="bg-background rounded-full placeholder:text-muted-foreground"
            />
            {errors.title && (
              <span className="text-red-500 text-xs">{t("eventModal.titleRequired")}</span>
            )}
          </Flex>

          <Flex className="relative mt-3 flex-col items-start">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-background rounded-full h-12 border border-border relative"
                  type="button"
                >
                  <CalendarIcon className="size-4.5 fill-[#1797B9] absolute left-3 top-1/2 -translate-y-1/2" />

                  <Box className="ml-8">
                    {date ? (
                      format(new Date(date), "EEEE, MMMM d", { locale: currentLocale })
                    ) : (
                      <span className="text-muted-foreground">{t("eventModal.pickDate")}</span>
                    )}
                  </Box>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999] cursor-pointer">
                <Calendar
                  className="w-72 p-2"
                  mode="single"
                  selected={date instanceof Date ? date : new Date(date)}
                  onSelect={(d) => setValue("date", d ?? new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.date && (
              <span className="text-red-500 text-xs">{t("eventModal.dateRequired")}</span>
            )}
          </Flex>
          <Box className="my-3">
            <Center className="justify-between gap-2 mt-1">
              {(() => {
                const hourOptions = hours.map((h) => ({
                  value: h,
                  label: utilsFormatHour(h, currentLanguage),
                }));
                return (
                  <>
                    <TimeDropdown
                      value={startHour}
                      onChange={(v: number) => setValue("startHour", v)}
                      options={hourOptions}
                      label=""
                    />
                    <ArrowRight className="size-6 text-muted-foreground" />
                    <TimeDropdown
                      value={endHour}
                      onChange={(v: number) => setValue("endHour", v)}
                      options={hourOptions}
                      label=""
                    />
                  </>
                );
              })()}
            </Center>
            {Number(startHour) >= Number(endHour) && (
              <div className="text-red-500 mt-1 text-xs">
                {t("eventModal.timeError")}
              </div>
            )}
            {Number(startHour) < Number(endHour) && (
              <div className="text-green-600 mt-1 text-xs font-medium">
                {t("eventModal.duration")} {getDuration(Number(startHour), Number(endHour))}
              </div>
            )}
          </Box>
          {date && (
            <Flex className="rounded-full bg-background text-center p-2 w-full h-12 border border-border mt-1 text-sm text-muted-foreground">
              {format(new Date(date), "EEEE, MMMM d", { locale: currentLocale })}
            </Flex>
          )}
          <Input
            size="lg"
            {...register("description")}
            placeholder={t("eventModal.description")}
            className="bg-background rounded-full placeholder:text-muted-foreground mt-3 font-light"
          />
          <Box className="my-2">
            <label className="font-medium text-sm">
              {t("eventModal.platform")}
              <span className="text-muted-foreground text-xs ml-2">{t("eventModal.optional")}</span>
            </label>
            <Flex>
              <button
                type="button"
                onClick={() => setValue("platform", "google_meet")}
                className={`flex items-center gap-1.5 text-sm border-none rounded-md px-3 py-1.5 cursor-pointer font-light ${
                  platform === "google_meet" ? "bg-cyan-100" : "bg-transparent"
                }`}
              >
                <img
                  src={GoogleMeetIcon}
                  alt="Google Meet"
                  className="size-3"
                />{" "}
                {t("eventModal.googleMeet")}
              </button>
              <button
                type="button"
                onClick={() => setValue("platform", "whatsapp")}
                className={`flex items-center gap-1.5 text-sm border-none rounded-md px-3 py-1.5 cursor-pointer font-light ${
                  platform === "whatsapp" ? "bg-cyan-100" : "bg-transparent"
                }`}
              >
                <img src={WhatsappIcon} alt="WhatsApp" className="size-3" />{" "}
                {t("eventModal.whatsApp")}
              </button>
              <button
                type="button"
                onClick={() => setValue("platform", "outlook")}
                className={`flex items-center gap-1.5 text-sm border-none rounded-md px-3 py-1.5 cursor-pointer font-light ${
                  platform === "outlook" ? "bg-cyan-100" : "bg-transparent"
                }`}
              >
                <img src={OutlookIcon} alt="Outlook" className="size-3" />{" "}
                {t("eventModal.outlook")}
              </button>
            </Flex>
            {platform === "google_meet" ? (
              <div className="mt-2">
                <Input
                  {...register("meetLink")}
                  name="meetLink"
                  placeholder={t("eventModal.googleMeetLink")}
                  required={platform === "google_meet"}
                  className="w-full p-2 rounded-full border border-border placeholder:text-muted-foreground bg-card h-12"
                />
              </div>
            ) : platform === "whatsapp" ? (
              <div className="mt-2">
                <input
                  {...register("whatsappNumber")}
                  name="whatsappNumber"
                  placeholder={t("eventModal.whatsAppNumber")}
                  required={platform === "whatsapp"}
                  className="w-full p-2 rounded-full border border-border placeholder:text-muted-foreground bg-card h-12 text-sm"
                />
              </div>
            ) : platform === "outlook" ? (
              <div className="mt-2">
                <input
                  {...register("outlookEvent")}
                  name="outlookEvent"
                  placeholder={t("eventModal.outlookEvent")}
                  required={platform === "outlook"}
                  className="w-full p-2 rounded-full border border-border placeholder:text-muted-foreground bg-card h-12 text-sm"
                />
              </div>
            ) : null}
          </Box>
          <Box className="mb-3.5">
            <label className="font-normal text-sm">{t("eventModal.calendar")}</label>
            <Flex className="gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => setValue("calendarType", "work")}
                className={`flex items-center gap-1.5 text-sm border-none rounded-md px-3 py-1.5 cursor-pointer font-light ${
                  calendarType === "work" ? "bg-cyan-100" : "bg-transparent"
                }`}
              >
                {calendarType === "work" ? (
                  <img
                    src={WhatsAppCheckBoxIcon}
                    alt="Work"
                    className="size-4"
                  />
                ) : null}
                {t("eventModal.work")}
              </button>
              <button
                type="button"
                onClick={() => setValue("calendarType", "education")}
                className={`flex items-center gap-1.5 text-sm border-none rounded-md px-3 py-1.5 cursor-pointer font-light ${
                  calendarType === "education"
                    ? "bg-indigo-100"
                    : "bg-transparent"
                }`}
              >
                {calendarType === "education" ? (
                  <img
                    src={EducationCheckBoxIcon}
                    alt="Education"
                    className="size-4"
                  />
                ) : null}
                {t("eventModal.education")}
              </button>
              <button
                type="button"
                onClick={() => setValue("calendarType", "personal")}
                className={`flex items-center gap-1.5 text-sm border-none rounded-md px-3 py-1.5 cursor-pointer font-light ${
                  calendarType === "personal" ? "bg-pink-100" : "bg-transparent"
                }`}
              >
                {calendarType === "personal" ? (
                  <img
                    src={PersolCheckBoxIcon}
                    alt="Personal"
                    className="size-4"
                  />
                ) : null}
                {t("eventModal.personal")}
              </button>
              <button
                type="button"
                onClick={() => setValue("calendarType", "meeting")}
                className={`flex items-center gap-1.5 text-sm border-none rounded-md px-3 py-1.5 cursor-pointer font-light ${
                  calendarType === "meeting"
                    ? "bg-indigo-100"
                    : "bg-transparent"
                }`}
              >
                {calendarType === "meeting" ? (
                  <img
                    src={EducationCheckBoxIcon}
                    alt="Meeting"
                    className="size-4"
                  />
                ) : null}
                {t("eventModal.meeting")}
              </button>
            </Flex>
          </Box>
          <Flex className="justify-end mt-4 gap-2">
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-border bg-[#1797B9]/30 font-normal cursor-pointer text-foreground hover:bg-[#1797B9]/40"
            >
              {t("eventModal.cancel")}
            </Button>
            <Button
              type="submit"
              className={`px-4 py-2 rounded-full font-normal text-white border-none ${
                isValid
                  ? "bg-[#1797B9] hover:bg-[#1797B9]/80 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!isValid}
            >
              {eventToEdit ? t("eventModal.save") : t("eventModal.create")}
            </Button>
          </Flex>
        </form>
      </Box>
    </Center>
  );
};
