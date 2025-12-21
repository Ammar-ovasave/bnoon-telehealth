"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, ArrowRight, MapPin, Video } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { add, format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { VISIT_DURATION_IN_MINUTES } from "@/constants";
import { Spinner } from "@/components/ui/spinner";
import { doctors } from "@/models/DoctorModel";
import Link from "next/link";
import useFertiSmartResources from "@/hooks/useFertiSmartResources";
import useFertiSmartResourceAvailability from "@/hooks/useFertiSmartResourceAvailability";
import useCurrentUser from "@/hooks/useCurrentUser";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

const formatArabicWeekDayName: { [name: string]: string } = {
  سبت: "السبت",
  أحد: "الأحد",
  اثنين: "الاثنين",
  ثلاثاء: "الثلاثاء",
  أربعاء: "الأربعاء",
  خميس: "الخميس",
  جمعة: "الجمعة",
};

export default function SelectDateAndTimePage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>();
  const router = useRouter();
  const t = useTranslations("SelectDateAndTimePage");
  const locale = useLocale();

  const dateFnsLocale = useMemo(() => {
    return locale === "ar" ? ar : enUS;
  }, [locale]);

  const weekdayFormatter = useMemo(() => {
    return (date: Date) => {
      const value = format(date, "EEE", { locale: dateFnsLocale });
      return formatArabicWeekDayName[value] ?? value;
    };
  }, [dateFnsLocale]);

  const searchParams = useSearchParams();
  const selectedDoctorId = searchParams.get("selectedDoctor");
  const selectedVisitType = searchParams.get("selectedVisitType") as "clinic" | "virtual" | null;

  const selectedDoctor = useMemo(() => {
    return doctors.find((doc) => {
      return doc.id === selectedDoctorId;
    });
  }, [selectedDoctorId]);

  const { data: resourcesData, isLoading: loadingResources } = useFertiSmartResources();

  const selectedResource = useMemo(() => {
    return resourcesData?.find((item) =>
      item.linkedUserFullName?.toLocaleLowerCase().includes(selectedDoctor?.name.toLocaleLowerCase() ?? "")
    );
  }, [resourcesData, selectedDoctor?.name]);

  const { data: availabilityData, isLoading: loadingTimeslots } = useFertiSmartResourceAvailability({
    resourceId: selectedResource?.id?.toString(),
    date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined,
    serviceDuration: VISIT_DURATION_IN_MINUTES,
  });

  const handleBack = () => {
    router.back();
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    setSelectedTimeSlot(timeSlotId);
  };

  const isDateDisabled = (date: Date) => {
    const today = add(new Date(), { days: 1 });
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const newUrlSearchParams = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedDate) params.set("selectedDate", format(selectedDate, "yyyy-MM-dd"));
    if (selectedTimeSlot) params.set("selectedTimeSlot", selectedTimeSlot);
    return params.toString();
  }, [selectedDate, selectedTimeSlot, searchParams]);

  const { data: currentUserData, isLoading: loadingCurrentUser } = useCurrentUser();

  const userTimezone = useMemo(() => {
    if (typeof window !== "undefined") {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return "UTC";
  }, []);

  const isKSA = userTimezone === "Asia/Riyadh";
  const KSA_TIMEZONE = "Asia/Riyadh";

  const getNextPageUrl = () => {
    if (!selectedDate || !selectedTimeSlot) return "#";
    if (currentUserData?.mrn) {
      if (selectedVisitType === "clinic") {
        return `/in-person-appointment-info?${newUrlSearchParams}`;
      } else {
        return `/virtual-visit-info?${newUrlSearchParams}`;
      }
    } else {
      return `/verify-phone?${newUrlSearchParams.toString()}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl pb-40">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 rtl:text-3xl dark:text-white mb-4">{t("title")}</h1>
          {selectedVisitType && (
            <div className="flex justify-center mb-4">
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm",
                  selectedVisitType === "clinic" ? "bg-primary/10 text-primary" : "bg-primary/10 text-primary"
                )}
              >
                {selectedVisitType === "clinic" ? (
                  <>
                    <Image src={`/icons/Location1.png`} alt="Clinic Visit" width={25} height={20} />
                    <span>{t("visitTypes.clinic")}</span>
                  </>
                ) : (
                  <>
                    <Image src={`/icons/Virtualvisit.png`} alt="Virtual Visit" width={25} height={20} />
                    <span>{t("visitTypes.virtual")}</span>
                  </>
                )}
              </div>
            </div>
          )}
          <p className="ltr:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">{t("description")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Date Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Image src={`/icons/Calender.png`} alt="Select Date" width={25} height={20} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("selectDate")}</h2>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(value) => {
                  setSelectedDate(value);
                  setSelectedTimeSlot(undefined);
                }}
                disabled={isDateDisabled}
                locale={dateFnsLocale}
                className="rounded-md border"
                formatters={{
                  formatWeekdayName: weekdayFormatter,
                }}
                classNames={{
                  weekdays: "gap-3",
                  weekday: "text-[10px] px-2",
                  week: "gap-2 mt-3",
                  day: "hover:bg-green-50 dark:hover:bg-green-900/20 p-1",
                  day_selected: "bg-green-600 text-white hover:bg-green-700",
                  day_today: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
                  button_next: "bg-primary cursor-pointer text-white p-1 rounded-sm",
                  button_previous: "bg-primary cursor-pointer text-white p-1 rounded-sm",
                }}
              />
            </div>
            {/* {selectedDate && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                <p className="text-sm text-green-800 dark:text-green-200">
                  {t("messages.selected")} <span className="font-medium">{format(selectedDate, "EEEE, MMMM do, yyyy")}</span>
                </p>
              </div>
            )} */}
          </div>

          {/* Time Selection */}
          <div className="bg-white flex flex-col dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Image src={`/icons/Clock.png`} alt="Select Time" width={25} height={20} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("selectTime")}</h2>
            </div>

            {!selectedDate ? (
              <div className="text-center py-8">
                <div className="flex justify-center">
                  <Image src={`/icons/Clock.png`} alt="Select Time" width={70} height={70} />
                </div>
                <p className="text-gray-500 dark:text-gray-400">{t("messages.selectDateFirst")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-96 flex-1 overflow-y-auto p-4">
                {loadingTimeslots || loadingResources || loadingCurrentUser ? (
                  <div className="col-span-2 flex justify-center">
                    <Spinner className="size-8" />
                  </div>
                ) : (availabilityData?.length ?? 0) > 0 ? (
                  availabilityData?.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => handleTimeSlotSelect(slot.start ?? "")}
                      className={cn(
                        "p-3 rounded-md max-h-[48px] relative border text-sm font-medium transition-all duration-200 cursor-pointer",
                        selectedTimeSlot === slot.start
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-primary/10 hover:border-primary"
                      )}
                    >
                      {format(slot.start ?? new Date().toISOString(), "hh:mm aa", { locale: dateFnsLocale })}
                      <div className="absolute top-[-6px] rounded-full p-1 right-[-6px] bg-primary text-white">
                        {selectedVisitType === "clinic" ? <MapPin className="h-3 w-3" /> : <Video className="h-3 w-3" />}
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center col-span-2">
                    {t("messages.noAvailability", {
                      date: selectedDate ? format(selectedDate, "dd-MM-yyyy") : t("messages.notSelected"),
                    })}
                  </p>
                )}
              </div>
            )}

            {selectedTimeSlot && (availabilityData?.length ?? 0) > 0 && (
              <div className="mt-4 p-3 bg-primary/10 dark:bg-primary/20 rounded-md">
                <p className="text-sm text-primary dark:text-primary-200">
                  {t("messages.selected")}{" "}
                  <span className="font-medium">
                    {format(
                      availabilityData?.find((slot) => slot.start === selectedTimeSlot)?.start ?? new Date().toISOString(),
                      locale === "ar" ? "dd MMMM yyyy hh:mm aa" : "EEEE, MMMM do, yyyy hh:mm aa",
                      { locale: dateFnsLocale }
                    )}
                  </span>{" "}
                </p>
                {!isKSA && (
                  <span className="text-xs opacity-75">
                    {`${formatInTimeZone(
                      availabilityData?.find((slot) => slot.start === selectedTimeSlot)?.start ?? new Date().toISOString(),
                      KSA_TIMEZONE,
                      "hh:mm aa",
                      { locale: dateFnsLocale }
                    )} ${t("summary.ksaTime")}`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {(selectedDate || selectedTimeSlot) && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("summary.title")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedVisitType && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t("summary.visitType")}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedVisitType === "clinic" ? (
                      <>
                        <Image src={`/icons/Location1.png`} alt="Clinic Visit" width={25} height={20} />
                        <p className="font-medium text-gray-900 dark:text-white">{t("visitTypes.clinic")}</p>
                      </>
                    ) : (
                      <>
                        <Image src={`/icons/Virtualvisit.png`} alt="Virtual Visit" width={25} height={20} />
                        <p className="font-medium text-gray-900 dark:text-white">{t("visitTypes.virtual")}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("summary.date")}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedDate
                    ? format(selectedDate, locale === "ar" ? "dd MMMM yyyy" : "EEEE, MMMM do, yyyy", { locale: dateFnsLocale })
                    : t("messages.notSelected")}
                </p>
                {/* {selectedDate && !isKSA && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    KSA:{" "}
                    {selectedTimeSlot && (availabilityData?.length ?? 0) > 0
                      ? formatInTimeZone(
                          availabilityData?.find((slot) => slot.start === selectedTimeSlot)?.start ?? new Date().toISOString(),
                          KSA_TIMEZONE,
                          "EEEE, MMMM do, yyyy"
                        )
                      : formatInTimeZone(selectedDate, KSA_TIMEZONE, "EEEE, MMMM do, yyyy")}
                  </p>
                )} */}
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("summary.time")}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedTimeSlot && (availabilityData?.length ?? 0) > 0
                    ? format(
                        availabilityData?.find((slot) => slot.start === selectedTimeSlot)?.start ?? new Date().toISOString(),
                        "hh:mm aa",
                        { locale: dateFnsLocale }
                      )
                    : t("messages.notSelected")}
                </p>
                {selectedTimeSlot && (availabilityData?.length ?? 0) > 0 && !isKSA && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t("summary.ksaTime")}:{" "}
                    {formatInTimeZone(
                      availabilityData?.find((slot) => slot.start === selectedTimeSlot)?.start ?? new Date().toISOString(),
                      KSA_TIMEZONE,
                      "hh:mm aa",
                      { locale: dateFnsLocale }
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col-reverse md:flex-row gap-6 justify-between container">
            <Button onClick={handleBack} variant="outline" size="lg" className="px-6 py-3 w-full md:w-auto">
              <ArrowLeft className="rtl:scale-x-[-1]" /> {t("buttons.back")}
            </Button>
            <Link href={getNextPageUrl()}>
              <Button
                disabled={!selectedDate || !selectedTimeSlot}
                size="lg"
                className="px-8 py-3 text-lg font-semibold w-full md:w-auto"
              >
                {t("buttons.continue")} <ArrowRight className="rtl:scale-x-[-1]" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
