"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { doctors as fullDoctorsList } from "@/models/DoctorModel";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Filter, Stethoscope } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { AvailabilityFilter } from "@/models/VisitTypeModel";
import AvailabilityPicker, { AvailabilityOption } from "@/components/AvailabilityPicker";
import DoctorCard from "@/components/DoctorCard";
import useFertiSmartResources from "@/hooks/useFertiSmartResources";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

export default function DoctorsListPage() {
  const searchParams = useSearchParams();
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>();
  const router = useRouter();
  const t = useTranslations("DoctorsPage");
  const locale = useLocale();

  const handleSetAvailabilityFilter = (value: AvailabilityFilter) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("selectedVisitType", value);
    router.replace(`${window.location.pathname}?${newSearchParams.toString()}`, { scroll: false });
    setAvailabilityFilter(value);
  };

  const handleBack = () => {
    router.back();
  };

  const handleDoctorChange = (doctor: string) => {
    setSelectedDoctor(doctor);
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("selectedDoctor", doctor);
    router.push(`/select-date-and-time?${searchParams.toString()}`);
  };

  const { data: resourcesData, isLoading: isLoadingResources } = useFertiSmartResources();

  const doctors = useMemo(() => {
    return fullDoctorsList
      .filter((item) => {
        const matchBranch = item.branchId === searchParams.get("selectedClinicLocation");
        if (searchParams.get("selectedService")) {
          return matchBranch && item.services.some((service) => service === searchParams.get("selectedService"));
        }
        return matchBranch;
      })
      .filter((item) => {
        return resourcesData?.some((resource) =>
          resource.linkedUserFullName?.toLocaleLowerCase().includes(item.name.toLocaleLowerCase())
        );
      });
  }, [resourcesData, searchParams]);

  const filteredDoctors = useMemo(() => {
    if (!availabilityFilter) return [];
    return doctors.filter((doctor) => {
      switch (availabilityFilter) {
        case "clinic":
          return doctor.availability.clinic;
        case "virtual":
          return doctor.availability.virtual;
        default:
          return true;
      }
    });
  }, [availabilityFilter, doctors]);

  const availabilityOptions: AvailabilityOption[] = [
    {
      value: "clinic",
      title: t("visitType.clinic.title"),
      description: t("visitType.clinic.description"),
      icon: <Image src={`/icons/Location1.png`} alt="Clinic Visit" width={25} height={25} />,
    },
    {
      value: "virtual",
      title: t("visitType.virtual.title"),
      description: t("visitType.virtual.description"),
      icon: <Image src={`/icons/Virtualvisit.png`} alt="Virtual Visit" width={25} height={25} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light to-white">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-60 h-60 bg-bnoon-navy/5 rounded-full blur-3xl" />
      </div>

      {isLoadingResources ? (
        <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
          <div className="w-16 h-16 bg-bnoon-teal/10 rounded-full flex items-center justify-center">
            <Spinner className="w-8 h-8 text-bnoon-teal" />
          </div>
          <p className="text-gray-500 text-sm">
            {locale === "ar" ? "جاري تحميل الأطباء..." : "Loading doctors..."}
          </p>
        </div>
      ) : (
        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-6xl pb-24">
          {/* Header */}
          <div className="text-center mb-10 md:mb-12 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-bnoon-teal/10 text-bnoon-teal px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Stethoscope className="w-4 h-4" />
              <span>{locale === "ar" ? "اختر طبيبك" : "Choose Your Doctor"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-bnoon-navy mb-4 leading-tight">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* Content */}
          <div className="animate-fade-in-up animation-delay-200">
            {!availabilityFilter ? (
              <AvailabilityPicker
                options={availabilityOptions}
                onSelect={handleSetAvailabilityFilter}
                title={t("visitType.title")}
                description={t("visitType.description")}
              />
            ) : filteredDoctors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor, index) => (
                  <div
                    key={doctor.id}
                    className={`animate-fade-in-up animation-delay-${(index % 6) * 100}`}
                  >
                    <DoctorCard
                      doctor={doctor}
                      selectedDoctor={selectedDoctor}
                      setSelectedDoctor={handleDoctorChange}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Filter className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-bnoon-navy mb-3">{t("noDoctorsFound.title")}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{t("noDoctorsFound.description")}</p>
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-12 text-center animate-fade-in-up animation-delay-300">
            <Button onClick={handleBack} variant="outline" size="lg" className="px-8">
              <ArrowLeft className="rtl:scale-x-[-1]" />
              {t("buttons.backToServiceSelection")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
