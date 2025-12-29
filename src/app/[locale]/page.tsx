"use client";
import { Suspense, useMemo } from "react";
import { groupClinicsByCity } from "@/models/ClinicModel";
import ClinicCard from "@/components/ClinicCard";
import LoadingPage from "./loading";
import { useTranslations, useLocale } from "next-intl";
import { MapPin, Heart, Users, Shield } from "lucide-react";

export default function Home() {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const clinicsByCity = useMemo(() => groupClinicsByCity(), []);

  const getTranslatedCity = (city: string) => {
    return t(`cities.${city}`) || city;
  };

  // Flatten all clinics into a single array
  const allClinics = useMemo(() => {
    return Object.values(clinicsByCity).flat();
  }, [clinicsByCity]);

  const features = [
    {
      icon: Heart,
      title: locale === "ar" ? "رعاية متخصصة" : "Expert Care",
      description: locale === "ar" ? "فريق من أفضل الأطباء المتخصصين" : "Team of top specialized doctors",
    },
    {
      icon: Users,
      title: locale === "ar" ? "دعم متكامل" : "Complete Support",
      description: locale === "ar" ? "نرافقكم في كل خطوة" : "We accompany you every step",
    },
    {
      icon: Shield,
      title: locale === "ar" ? "خصوصية تامة" : "Complete Privacy",
      description: locale === "ar" ? "سرية وأمان معلوماتكم" : "Your information is secure",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-bnoon-light to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-bnoon-teal/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-bnoon-navy/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          {/* Header Content */}
          <div className="text-center mb-12 md:mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-bnoon-teal/10 text-bnoon-teal px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              <span>{locale === "ar" ? "اختر مركزك" : "Choose Your Center"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-bnoon-navy mb-6 leading-tight">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* Features Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in-up animation-delay-${(index + 1) * 100}`}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-bnoon-teal/10 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-bnoon-teal" />
                </div>
                <div>
                  <h3 className="font-semibold text-bnoon-navy text-sm md:text-base">{feature.title}</h3>
                  <p className="text-gray-500 text-xs md:text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinics Section - Fixed Grid Layout */}
      <section className="relative pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-bnoon-navy mb-3">
              {locale === "ar" ? "مراكزنا" : "Our Centers"}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {locale === "ar" 
                ? "اختر المركز الأقرب إليك لبدء رحلتك نحو تحقيق حلم الأبوة والأمومة"
                : "Choose the center closest to you to start your journey towards parenthood"}
            </p>
          </div>

          {/* Fixed Grid - All Clinics */}
          <Suspense fallback={<LoadingPage />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allClinics.map((clinic, index) => (
                <div
                  key={clinic.id}
                  className={`animate-fade-in-up animation-delay-${(index % 4) * 100}`}
                >
                  <ClinicCard clinic={clinic} />
                </div>
              ))}
            </div>
          </Suspense>

          {/* City Labels */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            {Object.entries(clinicsByCity).map(([city, clinics]) => (
              <div
                key={city}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100"
              >
                <div className="w-2 h-2 bg-bnoon-teal rounded-full" />
                <span className="text-sm font-medium text-bnoon-navy">{getTranslatedCity(city)}</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {clinics.length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-gradient-to-r from-bnoon-teal to-cyan-600 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {locale === "ar" ? "نحن هنا لمساعدتك" : "We're Here to Help"}
          </h2>
          <p className="text-white/90 text-base md:text-lg mb-8">
            {locale === "ar"
              ? "فريقنا المتخصص جاهز للإجابة على جميع استفساراتكم"
              : "Our specialized team is ready to answer all your questions"}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+966114448080"
              className="inline-flex items-center gap-2 bg-white text-bnoon-teal px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <span dir="ltr">+966 11 444 8080</span>
            </a>
            <a
              href="mailto:info@bnoon.sa"
              className="inline-flex items-center gap-2 bg-white/20 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-300"
            >
              info@bnoon.sa
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
