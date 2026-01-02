"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, ArrowRight, CalendarDays, Clock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { add, addMonths, format } from "date-fns";
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
import { getDoctorName } from "@/lib/getDoctorName";

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
  const tDoctors = useTranslations("DoctorsPage");
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

  const after6Month = addMonths(new Date(), 6);
  const isDateDisabled = (date: Date) => {
    const today = add(new Date(), { days: 1 });
    today.setHours(0, 0, 0, 0);
    return date < today || date > after6Month;
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
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 dark:bg-bnoon-teal/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -left-40 w-60 h-60 bg-bnoon-navy/5 dark:bg-bnoon-teal/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-6xl pb-32">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-bold text-bnoon-navy dark:text-white mb-4">{t("title")}</h1>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-6">{t("description")}</p>

          {/* Doctor Info Card with Visit Type */}
          {selectedDoctor && (
            <div className="flex justify-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-gray-800 px-5 py-4 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
                {/* Doctor Section */}
                <div className="flex items-center gap-4">
                  {/* Doctor Photo */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-bnoon-teal to-bnoon-navy p-[2px]">
                      <div className="w-full h-full rounded-full overflow-hidden bg-white">
                        <Image
                          src={selectedDoctor.photo}
                          alt={getDoctorName(selectedDoctor, locale)}
                          fill
                          className={cn("object-cover", selectedDoctor.imageClassName)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="text-start rtl:text-right">
                    <h3 className="font-bold text-bnoon-navy dark:text-white text-base sm:text-lg">
                      {getDoctorName(selectedDoctor, locale)}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px] sm:max-w-[280px] line-clamp-2">
                      {tDoctors(`doctors.${selectedDoctor.id}.specialty`) || selectedDoctor.specialty}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                {selectedVisitType && (
                  <>
                    <div className="hidden sm:block w-px h-12 bg-gray-200 dark:bg-gray-700" />
                    <div className="sm:hidden w-full h-px bg-gray-200 dark:bg-gray-700" />
                  </>
                )}

                {/* Visit Type Badge */}
                {selectedVisitType && (
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium",
                      selectedVisitType === "clinic"
                        ? "bg-bnoon-teal/10 text-bnoon-teal"
                        : "bg-bnoon-navy/10 text-bnoon-navy dark:bg-bnoon-navy/20 dark:text-cyan-400"
                    )}
                  >
                    {selectedVisitType === "clinic" ? (
                      <>
                        <Image src={`/icons/Location1.png`} alt="Clinic Visit" width={20} height={20} />
                        <span>{t("visitTypes.clinic")}</span>
                      </>
                    ) : (
                      <>
                        <Image src={`/icons/Virtualvisit.png`} alt="Virtual Visit" width={20} height={20} />
                        <span>{t("visitTypes.virtual")}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up animation-delay-200">
          {/* Date Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-xl flex items-center justify-center">
                <Image src={`/icons/Calender.png`} alt="Select Date" width={20} height={20} />
              </div>
              <h2 className="text-lg font-bold text-bnoon-navy dark:text-white">{t("selectDate")}</h2>
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
                className="rounded-xl border border-gray-100 dark:border-gray-700"
                formatters={{
                  formatWeekdayName: weekdayFormatter,
                }}
                classNames={{
                  weekdays: "gap-3",
                  weekday: "text-[10px] px-2 text-gray-500",
                  week: "gap-2 mt-3",
                  day: "hover:bg-bnoon-teal/10 rounded-lg p-1 transition-colors",
                  day_selected: "bg-bnoon-teal text-white hover:bg-bnoon-teal/90 rounded-lg",
                  day_today: "bg-bnoon-teal/10 text-bnoon-teal font-semibold rounded-lg",
                  button_next: "bg-bnoon-teal cursor-pointer text-white p-1.5 rounded-lg hover:bg-bnoon-teal/90 transition-colors",
                  button_previous: "bg-bnoon-teal cursor-pointer text-white p-1.5 rounded-lg hover:bg-bnoon-teal/90 transition-colors",
                }}
              />
            </div>
          </div>

          {/* Time Selection */}
          <div className="bg-white dark:bg-gray-800 flex flex-col rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-bnoon-teal" />
              </div>
              <h2 className="text-lg font-bold text-bnoon-navy dark:text-white">{t("selectTime")}</h2>
            </div>

            {!selectedDate ? (
              <div className="text-center py-12 flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">{t("messages.selectDateFirst")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 flex-1 overflow-y-auto p-1">
                {loadingTimeslots || loadingResources || loadingCurrentUser ? (
                  <div className="col-span-full flex flex-col justify-center items-center py-12">
                    <Spinner className="w-8 h-8 text-bnoon-teal" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
                      {locale === "ar" ? "جاري تحميل المواعيد..." : "Loading available times..."}
                    </p>
                  </div>
                ) : (availabilityData?.length ?? 0) > 0 ? (
                  availabilityData?.map((slot) => (
                    <button
                      key={slot.start}
                      onClick={() => handleTimeSlotSelect(slot.start ?? "")}
                      className={cn(
                        "p-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 cursor-pointer",
                        selectedTimeSlot === slot.start
                          ? "bg-bnoon-teal text-white border-bnoon-teal shadow-lg shadow-bnoon-teal/20"
                          : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-bnoon-navy dark:text-white hover:border-bnoon-teal/50 hover:bg-bnoon-teal/5 dark:hover:bg-bnoon-teal/10"
                      )}
                    >
                      {format(slot.start ?? new Date().toISOString(), "hh:mm aa", { locale: dateFnsLocale })}
                    </button>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CalendarDays className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      {t("messages.noAvailability", {
                        date: selectedDate ? format(selectedDate, "dd-MM-yyyy") : t("messages.notSelected"),
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}

            {selectedTimeSlot && (availabilityData?.length ?? 0) > 0 && (
              <div className="mt-4 p-4 bg-bnoon-teal/10 dark:bg-bnoon-teal/20 rounded-xl border border-bnoon-teal/20 dark:border-bnoon-teal/30">
                <p className="text-sm text-bnoon-navy dark:text-white font-medium">
                  {t("messages.selected")}{" "}
                  <span className="font-bold">
                    {format(
                      availabilityData?.find((slot) => slot.start === selectedTimeSlot)?.start ?? new Date().toISOString(),
                      locale === "ar" ? "dd MMMM yyyy hh:mm aa" : "EEEE, MMMM do, yyyy hh:mm aa",
                      { locale: dateFnsLocale }
                    )}
                  </span>
                </p>
                {!isKSA && (
                  <p className="text-xs text-gray-500 mt-1">
                    {`${formatInTimeZone(
                      availabilityData?.find((slot) => slot.start === selectedTimeSlot)?.start ?? new Date().toISOString(),
                      KSA_TIMEZONE,
                      "hh:mm aa",
                      { locale: dateFnsLocale }
                    )} ${t("summary.ksaTime")}`}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {(selectedDate || selectedTimeSlot) && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 animate-fade-in-up animation-delay-300">
            <h3 className="text-lg font-bold text-bnoon-navy dark:text-white mb-4">{t("summary.title")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedVisitType && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("summary.visitType")}</p>
                  <div className="flex items-center gap-2">
                    {selectedVisitType === "clinic" ? (
                      <>
                        <Image src={`/icons/Location1.png`} alt="Clinic Visit" width={20} height={20} />
                        <p className="font-semibold text-bnoon-navy dark:text-white">{t("visitTypes.clinic")}</p>
                      </>
                    ) : (
                      <>
                        <Image src={`/icons/Virtualvisit.png`} alt="Virtual Visit" width={20} height={20} />
                        <p className="font-semibold text-bnoon-navy dark:text-white">{t("visitTypes.virtual")}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("summary.date")}</p>
                <p className="font-semibold text-bnoon-navy dark:text-white">
                  {selectedDate
                    ? format(selectedDate, locale === "ar" ? "dd MMMM yyyy" : "EEEE, MMMM do, yyyy", { locale: dateFnsLocale })
                    : t("messages.notSelected")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("summary.time")}</p>
                <p className="font-semibold text-bnoon-navy dark:text-white">
                  {selectedTimeSlot && (availabilityData?.length ?? 0) > 0
                    ? format(
                        availabilityData?.find((slot) => slot.start === selectedTimeSlot)?.start ?? new Date().toISOString(),
                        "hh:mm aa",
                        { locale: dateFnsLocale }
                      )
                    : t("messages.notSelected")}
                </p>
                {selectedTimeSlot && (availabilityData?.length ?? 0) > 0 && !isKSA && (
                  <p className="text-xs text-gray-400 mt-1">
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
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 border-t border-gray-100 dark:border-gray-800 shadow-lg">
          <div className="flex flex-col-reverse md:flex-row gap-4 justify-between max-w-6xl mx-auto">
            <Button onClick={handleBack} variant="outline" size="lg" className="w-full md:w-auto dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
              <ArrowLeft className="rtl:scale-x-[-1]" /> {t("buttons.back")}
            </Button>
            <Link href={getNextPageUrl()} className="w-full md:w-auto">
              <Button
                disabled={!selectedDate || !selectedTimeSlot}
                size="lg"
                className="w-full"
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
