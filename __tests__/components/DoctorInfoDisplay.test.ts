/**
 * Tests for Doctor Info Display on Select Date & Time Page
 *
 * Verifies that doctor information (name, specialty, photo) is correctly
 * displayed based on the selected doctor from URL params.
 */

import { doctors } from "@/models/DoctorModel";

describe("Doctor Info Display on Select Date & Time Page", () => {
  // Helper to simulate getDoctorName logic
  const getDoctorName = (
    doctor: { name: string; arName: string } | undefined,
    locale: string
  ): string => {
    if (!doctor) return "";
    if (locale === "ar" && doctor.arName) {
      return doctor.arName;
    }
    return doctor.name;
  };

  // Helper to simulate finding doctor from URL param
  const findDoctorById = (doctorId: string | null) => {
    return doctors.find((doc) => doc.id === doctorId);
  };

  describe("Doctor selection from URL params", () => {
    it("should find doctor when valid ID is provided", () => {
      const doctorId = "dr-abdalaziz-al-shahrani";
      const doctor = findDoctorById(doctorId);

      expect(doctor).toBeDefined();
      expect(doctor?.id).toBe(doctorId);
    });

    it("should return undefined for invalid doctor ID", () => {
      const doctor = findDoctorById("invalid-doctor-id");
      expect(doctor).toBeUndefined();
    });

    it("should return undefined for null doctor ID", () => {
      const doctor = findDoctorById(null);
      expect(doctor).toBeUndefined();
    });

    it("should return undefined for empty string doctor ID", () => {
      const doctor = findDoctorById("");
      expect(doctor).toBeUndefined();
    });
  });

  describe("getDoctorName localization", () => {
    const mockDoctor = {
      name: "Dr. Test Doctor",
      arName: "الدكتور تجربة",
    };

    it("should return English name for 'en' locale", () => {
      expect(getDoctorName(mockDoctor, "en")).toBe("Dr. Test Doctor");
    });

    it("should return Arabic name for 'ar' locale", () => {
      expect(getDoctorName(mockDoctor, "ar")).toBe("الدكتور تجربة");
    });

    it("should return English name for unknown locale", () => {
      expect(getDoctorName(mockDoctor, "fr")).toBe("Dr. Test Doctor");
    });

    it("should return empty string for undefined doctor", () => {
      expect(getDoctorName(undefined, "en")).toBe("");
    });

    it("should return English name if arName is empty", () => {
      const doctorNoArabic = { name: "Dr. English Only", arName: "" };
      expect(getDoctorName(doctorNoArabic, "ar")).toBe("Dr. English Only");
    });
  });

  describe("Doctor info card visibility", () => {
    const shouldShowDoctorCard = (doctorId: string | null): boolean => {
      const doctor = findDoctorById(doctorId);
      return !!doctor;
    };

    it("should show card when valid doctor is selected", () => {
      expect(shouldShowDoctorCard("dr-abdalaziz-al-shahrani")).toBe(true);
    });

    it("should NOT show card when no doctor is selected", () => {
      expect(shouldShowDoctorCard(null)).toBe(false);
    });

    it("should NOT show card for invalid doctor ID", () => {
      expect(shouldShowDoctorCard("non-existent-doctor")).toBe(false);
    });
  });

  describe("Doctor data completeness", () => {
    it("all doctors should have required display fields", () => {
      doctors.forEach((doctor) => {
        expect(doctor.id).toBeTruthy();
        expect(doctor.name).toBeTruthy();
        expect(doctor.arName).toBeTruthy();
        expect(doctor.specialty).toBeTruthy();
        expect(doctor.photo).toBeTruthy();
      });
    });

    it("all doctor photos should have valid path format", () => {
      doctors.forEach((doctor) => {
        expect(doctor.photo).toMatch(/^\/images\/.+\.(jpg|jpeg|png|webp)$/i);
      });
    });

    it("all doctors should have both English and Arabic names", () => {
      doctors.forEach((doctor) => {
        expect(doctor.name.length).toBeGreaterThan(0);
        expect(doctor.arName.length).toBeGreaterThan(0);
        // Arabic name should contain Arabic characters
        expect(/[\u0600-\u06FF]/.test(doctor.arName)).toBe(true);
      });
    });
  });

  describe("Doctor specialty display", () => {
    it("should have specialty for each doctor", () => {
      doctors.forEach((doctor) => {
        expect(doctor.specialty).toBeTruthy();
        expect(doctor.specialty.length).toBeGreaterThan(10); // Specialty should be descriptive
      });
    });

    it("specialty translation key format should be correct", () => {
      doctors.forEach((doctor) => {
        const translationKey = `doctors.${doctor.id}.specialty`;
        expect(translationKey).toMatch(/^doctors\.[\w-]+\.specialty$/);
      });
    });
  });

  describe("Integration: URL params to doctor display", () => {
    interface DisplayData {
      showCard: boolean;
      doctorName: string;
      specialty: string;
      photoSrc: string;
    }

    const getDisplayData = (
      doctorId: string | null,
      locale: string
    ): DisplayData => {
      const doctor = findDoctorById(doctorId);

      if (!doctor) {
        return {
          showCard: false,
          doctorName: "",
          specialty: "",
          photoSrc: "",
        };
      }

      return {
        showCard: true,
        doctorName: getDoctorName(doctor, locale),
        specialty: doctor.specialty,
        photoSrc: doctor.photo,
      };
    };

    it("should return complete display data for valid doctor (English)", () => {
      const data = getDisplayData("dr-abdalaziz-al-shahrani", "en");

      expect(data.showCard).toBe(true);
      expect(data.doctorName).toBe("Dr. Abdulaziz Alshahrani");
      expect(data.specialty).toContain("Consultant");
      expect(data.photoSrc).toMatch(/\.jpg$/i);
    });

    it("should return complete display data for valid doctor (Arabic)", () => {
      const data = getDisplayData("dr-abdalaziz-al-shahrani", "ar");

      expect(data.showCard).toBe(true);
      expect(data.doctorName).toBe("الدكتور عبد العزيز الشهراني");
      expect(data.specialty).toBeTruthy();
      expect(data.photoSrc).toBeTruthy();
    });

    it("should return empty data for invalid doctor", () => {
      const data = getDisplayData("invalid-id", "en");

      expect(data.showCard).toBe(false);
      expect(data.doctorName).toBe("");
      expect(data.specialty).toBe("");
      expect(data.photoSrc).toBe("");
    });

    it("should handle all doctors in the system", () => {
      doctors.forEach((doctor) => {
        const dataEn = getDisplayData(doctor.id, "en");
        const dataAr = getDisplayData(doctor.id, "ar");

        // English
        expect(dataEn.showCard).toBe(true);
        expect(dataEn.doctorName).toBe(doctor.name);

        // Arabic
        expect(dataAr.showCard).toBe(true);
        expect(dataAr.doctorName).toBe(doctor.arName);
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle doctor ID with special characters", () => {
      // All doctor IDs use kebab-case
      doctors.forEach((doctor) => {
        expect(doctor.id).toMatch(/^[a-z0-9-]+$/);
      });
    });

    it("should handle whitespace in doctor ID param", () => {
      const doctor = findDoctorById("  dr-abdalaziz-al-shahrani  ");
      // Current implementation doesn't trim - documenting behavior
      expect(doctor).toBeUndefined();
    });

    it("should be case-sensitive for doctor ID", () => {
      const doctor = findDoctorById("DR-ABDALAZIZ-AL-SHAHRANI");
      // IDs are lowercase, uppercase won't match
      expect(doctor).toBeUndefined();
    });
  });

  describe("Photo display properties", () => {
    it("doctors with imageClassName should have valid CSS class", () => {
      doctors.forEach((doctor) => {
        if (doctor.imageClassName) {
          // imageClassName is used for object-position adjustments
          expect(typeof doctor.imageClassName).toBe("string");
          expect(doctor.imageClassName.length).toBeGreaterThan(0);
        }
      });
    });

    it("photo paths should be absolute (start with /)", () => {
      doctors.forEach((doctor) => {
        expect(doctor.photo.startsWith("/")).toBe(true);
      });
    });
  });
});
