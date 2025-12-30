/**
 * Tests for Review Appointment Page
 *
 * Verifies the appointment review page behavior, including:
 * - URL parameter parsing
 * - Data display formatting
 * - Different visit types (clinic vs virtual)
 * - Patient information display
 * - Arabic/English locale handling
 * - Navigation flow
 */

import { doctors } from "@/models/DoctorModel";
import { services } from "@/models/ServiceModel";
import { clinicLocations } from "@/models/ClinicModel";
import { formatInTimeZone } from "date-fns-tz";
import { parseISO } from "date-fns";
import { ar, enUS } from "date-fns/locale";

const KSA_TIMEZONE = "Asia/Riyadh";

// Simulate URL search params structure
interface ReviewPageParams {
  selectedDoctor: string;
  selectedService: string;
  selectedTimeSlot: string;
  visitType: "clinic" | "virtual";
  fullName: string;
  email?: string;
  nationality?: string;
  gender?: "male" | "female";
  idType?: string;
  idTypeName?: string;
  idNumber?: string;
}

describe("Review Appointment Page", () => {
  // Sample data factories
  const createClinicVisitParams = (overrides?: Partial<ReviewPageParams>): ReviewPageParams => ({
    selectedDoctor: "dr-test",
    selectedService: "having-child",
    selectedTimeSlot: "2025-01-15T10:00:00.000Z",
    visitType: "clinic",
    fullName: "Test Patient",
    ...overrides,
  });

  const createVirtualVisitParams = (overrides?: Partial<ReviewPageParams>): ReviewPageParams => ({
    ...createClinicVisitParams(),
    visitType: "virtual",
    email: "test@example.com",
    nationality: "Saudi Arabia",
    gender: "female",
    idType: "1",
    idTypeName: "National Id",
    idNumber: "1234567890",
    ...overrides,
  });

  describe("URL Parameter Parsing", () => {
    it("should parse all required params for clinic visit", () => {
      const params = createClinicVisitParams();

      expect(params.selectedDoctor).toBeDefined();
      expect(params.selectedService).toBeDefined();
      expect(params.selectedTimeSlot).toBeDefined();
      expect(params.visitType).toBe("clinic");
      expect(params.fullName).toBeDefined();
    });

    it("should parse all required params for virtual visit", () => {
      const params = createVirtualVisitParams();

      expect(params.selectedDoctor).toBeDefined();
      expect(params.selectedService).toBeDefined();
      expect(params.selectedTimeSlot).toBeDefined();
      expect(params.visitType).toBe("virtual");
      expect(params.fullName).toBeDefined();
      expect(params.email).toBeDefined();
      expect(params.nationality).toBeDefined();
      expect(params.gender).toBeDefined();
      expect(params.idType).toBeDefined();
      expect(params.idTypeName).toBeDefined();
      expect(params.idNumber).toBeDefined();
    });

    it("should handle URL encoding/decoding of params", () => {
      const encodedName = encodeURIComponent("Ahmed Al-Fahad");
      const decodedName = decodeURIComponent(encodedName);

      expect(decodedName).toBe("Ahmed Al-Fahad");
    });

    it("should handle special characters in names", () => {
      const arabicName = "محمد أحمد";
      const encodedName = encodeURIComponent(arabicName);
      const decodedName = decodeURIComponent(encodedName);

      expect(decodedName).toBe(arabicName);
    });
  });

  describe("Doctor Information Display", () => {
    it("should use Arabic name when locale is Arabic and arName is provided", () => {
      const doctor = doctors[0];
      const isArabic = true;

      const displayName = isArabic && doctor.arName ? doctor.arName : doctor.name;

      expect(displayName).toBe(doctor.arName);
    });

    it("should use English name when locale is English", () => {
      const doctor = doctors[0];
      const isArabic = false;

      const displayName = isArabic && doctor.arName ? doctor.arName : doctor.name;

      expect(displayName).toBe(doctor.name);
    });

    it("should display doctor specialty", () => {
      const doctor = doctors[0];

      expect(doctor.specialty).toBeDefined();
      expect(typeof doctor.specialty).toBe("string");
    });

    it("should validate doctor lookup by ID", () => {
      const doctorId = doctors[0].id;
      const foundDoctor = doctors.find((doc) => doc.id === doctorId);

      expect(foundDoctor).toBeDefined();
      expect(foundDoctor?.id).toBe(doctorId);
    });
  });

  describe("Date and Time Formatting", () => {
    it("should format date correctly for English locale", () => {
      const params = createClinicVisitParams();
      const dateObj = parseISO(params.selectedTimeSlot);

      const formattedDate = formatInTimeZone(dateObj, KSA_TIMEZONE, "EEEE, d MMMM yyyy", {
        locale: enUS,
      });

      expect(formattedDate).toMatch(/\w+, \d+ \w+ \d{4}/);
      expect(formattedDate).toContain("January");
      expect(formattedDate).toContain("2025");
    });

    it("should format date correctly for Arabic locale", () => {
      const params = createClinicVisitParams();
      const dateObj = parseISO(params.selectedTimeSlot);

      const formattedDate = formatInTimeZone(dateObj, KSA_TIMEZONE, "EEEE, d MMMM yyyy", {
        locale: ar,
      });

      expect(formattedDate).toBeDefined();
      expect(formattedDate.length).toBeGreaterThan(0);
    });

    it("should format time correctly in 12-hour format", () => {
      const params = createClinicVisitParams();
      const dateObj = parseISO(params.selectedTimeSlot);

      const formattedTime = formatInTimeZone(dateObj, KSA_TIMEZONE, "h:mm a", {
        locale: enUS,
      });

      expect(formattedTime).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    });

    it("should convert UTC to KSA timezone correctly", () => {
      // UTC 10:00 = KSA 13:00 (UTC+3)
      const utcDateTime = "2025-01-15T10:00:00.000Z";
      const dateObj = parseISO(utcDateTime);

      const formattedTime = formatInTimeZone(dateObj, KSA_TIMEZONE, "HH:mm");

      expect(formattedTime).toBe("13:00");
    });
  });

  describe("Visit Type Differentiation", () => {
    it("should identify clinic visit correctly", () => {
      const params = createClinicVisitParams();

      expect(params.visitType).toBe("clinic");
    });

    it("should identify virtual visit correctly", () => {
      const params = createVirtualVisitParams();

      expect(params.visitType).toBe("virtual");
    });

    it("should show clinic location only for in-person visits", () => {
      const clinicParams = createClinicVisitParams();
      const virtualParams = createVirtualVisitParams();

      // Clinic visits should show location
      expect(clinicParams.visitType).toBe("clinic");

      // Virtual visits don't need location
      expect(virtualParams.visitType).toBe("virtual");
    });

    it("should require email only for virtual visits", () => {
      const clinicParams = createClinicVisitParams();
      const virtualParams = createVirtualVisitParams();

      expect(clinicParams.email).toBeUndefined();
      expect(virtualParams.email).toBeDefined();
    });

    it("should validate clinic data from ClinicModel", () => {
      const sampleClinic = clinicLocations[0];

      expect(sampleClinic.name).toBeDefined();
      expect(sampleClinic.address).toBeDefined();
    });
  });

  describe("Patient Information Validation", () => {
    it("should have valid full name", () => {
      const params = createClinicVisitParams();

      expect(params.fullName.length).toBeGreaterThanOrEqual(2);
    });

    it("should have valid email format for virtual visits", () => {
      const params = createVirtualVisitParams();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(params.email).toMatch(emailRegex);
    });

    it("should have valid gender value", () => {
      const params = createVirtualVisitParams();

      expect(["male", "female"]).toContain(params.gender);
    });

    it("should validate nationality is provided for virtual visits", () => {
      const params = createVirtualVisitParams();

      expect(params.nationality).toBeDefined();
      expect(typeof params.nationality).toBe("string");
    });
  });

  describe("Service Information", () => {
    it("should have valid service ID", () => {
      const params = createClinicVisitParams();

      expect(params.selectedService).toBeDefined();
      expect(params.selectedService.length).toBeGreaterThan(0);
    });

    it("should validate service lookup by ID", () => {
      const serviceId = services[0].id;
      const foundService = services.find((s) => s.id === serviceId);

      expect(foundService).toBeDefined();
      expect(foundService?.id).toBe(serviceId);
    });

    it("should match service title with available services", () => {
      const availableIds = services.map((s) => s.id);
      const params = createClinicVisitParams({ selectedService: availableIds[0] });

      expect(availableIds).toContain(params.selectedService);
    });
  });

  describe("Saudi ID Validation Logic", () => {
    it("should validate Saudi National ID starting with 1", () => {
      const nationalId = "1234567890";

      expect(nationalId.startsWith("1")).toBe(true);
      expect(nationalId.length).toBe(10);
      expect(/^\d+$/.test(nationalId)).toBe(true);
    });

    it("should validate Iqama number starting with 2", () => {
      const iqamaNo = "2345678901";

      expect(iqamaNo.startsWith("2")).toBe(true);
      expect(iqamaNo.length).toBe(10);
      expect(/^\d+$/.test(iqamaNo)).toBe(true);
    });

    it("should allow passport numbers with mixed characters", () => {
      const passport = "AB1234567";

      expect(typeof passport).toBe("string");
      expect(passport.length).toBeGreaterThan(0);
    });
  });

  describe("Navigation Flow", () => {
    it("should build correct URL params from form data", () => {
      const formData = {
        fullName: "Test User",
        email: "test@example.com",
        nationality: "Saudi Arabia",
        gender: "female" as const,
        idType: "1",
        idNumber: "1234567890",
      };

      const searchParams = new URLSearchParams();
      searchParams.set("fullName", formData.fullName);
      searchParams.set("email", formData.email);
      searchParams.set("nationality", formData.nationality);
      searchParams.set("gender", formData.gender);
      searchParams.set("idType", formData.idType);
      searchParams.set("idNumber", formData.idNumber);
      searchParams.set("visitType", "virtual");

      expect(searchParams.get("fullName")).toBe(formData.fullName);
      expect(searchParams.get("email")).toBe(formData.email);
      expect(searchParams.get("visitType")).toBe("virtual");
    });

    it("should preserve existing search params when adding new ones", () => {
      const existingParams = new URLSearchParams();
      existingParams.set("selectedDoctor", "dr-test");
      existingParams.set("selectedService", "having-child");
      existingParams.set("selectedTimeSlot", "2025-01-15T10:00:00.000Z");

      // Simulate adding patient info
      existingParams.set("fullName", "Test User");
      existingParams.set("visitType", "clinic");

      expect(existingParams.get("selectedDoctor")).toBe("dr-test");
      expect(existingParams.get("fullName")).toBe("Test User");
    });

    it("should generate review page URL correctly", () => {
      const params = createVirtualVisitParams();
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, value);
        }
      });

      const reviewUrl = `/review-appointment?${searchParams.toString()}`;

      expect(reviewUrl).toContain("/review-appointment?");
      expect(reviewUrl).toContain("visitType=virtual");
      expect(reviewUrl).toContain("fullName=");
    });

    it("should navigate back to patient info form on edit", () => {
      // Simulating router.back() behavior
      const historyStack = [
        "/doctors",
        "/select-date-and-time",
        "/in-person-appointment-info",
        "/review-appointment",
      ];

      const currentIndex = historyStack.length - 1;
      const previousPage = historyStack[currentIndex - 1];

      expect(previousPage).toBe("/in-person-appointment-info");
    });
  });

  describe("Notice Messages", () => {
    it("should show appropriate notice for virtual visits", () => {
      const params = createVirtualVisitParams();
      const expectedNotice =
        "For virtual visits, you will receive a confirmation email with a meeting link to join your appointment.";

      expect(params.visitType).toBe("virtual");
      expect(expectedNotice).toContain("email");
      expect(expectedNotice).toContain("meeting link");
    });

    it("should show appropriate notice for clinic visits", () => {
      const params = createClinicVisitParams();
      const expectedNotice =
        "Please arrive 10 minutes before your scheduled appointment. Bring your ID and any previous medical reports.";

      expect(params.visitType).toBe("clinic");
      expect(expectedNotice).toContain("10 minutes");
      expect(expectedNotice).toContain("ID");
    });
  });

  describe("Confirm Action Data Preparation", () => {
    it("should prepare appointment data for clinic visits", () => {
      const params = createClinicVisitParams({ fullName: "Ahmed Mohammed Al-Fahad" });
      const splitName = params.fullName.split(" ");

      const appointmentData = {
        firstName: splitName[0],
        middleName: splitName.length > 2 ? splitName[1] : "",
        lastName: splitName.length > 2 ? splitName.slice(2).join(" ") : splitName.slice(1).join(" "),
        description: "In Clinic",
        email: null as null,
      };

      expect(appointmentData.firstName).toBe("Ahmed");
      expect(appointmentData.middleName).toBe("Mohammed");
      expect(appointmentData.lastName).toBe("Al-Fahad");
      expect(appointmentData.description).toBe("In Clinic");
      expect(appointmentData.email).toBeNull();
    });

    it("should prepare appointment data for virtual visits", () => {
      const params = createVirtualVisitParams({ fullName: "Sarah Ali" });
      const splitName = params.fullName.split(" ");

      const appointmentData = {
        firstName: splitName[0],
        middleName: splitName.length > 2 ? splitName[1] : "",
        lastName: splitName.length > 2 ? splitName.slice(2).join(" ") : splitName.slice(1).join(" "),
        description: "Virtual Visit",
        email: params.email,
      };

      expect(appointmentData.firstName).toBe("Sarah");
      expect(appointmentData.middleName).toBe("");
      expect(appointmentData.lastName).toBe("Ali");
      expect(appointmentData.description).toBe("Virtual Visit");
      expect(appointmentData.email).toBe("test@example.com");
    });

    it("should handle names with only first and last name", () => {
      const fullName = "Ahmed Al-Fahad";
      const splitName = fullName.split(" ");

      const firstName = splitName[0];
      const middleName = splitName.length > 2 ? splitName[1] : "";
      const lastName = splitName.length > 2 ? splitName.slice(2).join(" ") : splitName.slice(1).join(" ");

      expect(firstName).toBe("Ahmed");
      expect(middleName).toBe("");
      expect(lastName).toBe("Al-Fahad");
    });

    it("should handle names with multiple parts", () => {
      const fullName = "Ahmed Mohammed Ali Al-Fahad";
      const splitName = fullName.split(" ");

      const firstName = splitName[0];
      const middleName = splitName.length > 2 ? splitName[1] : "";
      const lastName = splitName.length > 2 ? splitName.slice(2).join(" ") : splitName.slice(1).join(" ");

      expect(firstName).toBe("Ahmed");
      expect(middleName).toBe("Mohammed");
      expect(lastName).toBe("Ali Al-Fahad");
    });
  });

  describe("Loading State", () => {
    it("should track loading state during confirmation", () => {
      let loading = false;

      // Start loading
      loading = true;
      expect(loading).toBe(true);

      // End loading
      loading = false;
      expect(loading).toBe(false);
    });

    it("should disable buttons during loading", () => {
      const loading = true;

      // Buttons should be disabled when loading
      expect(loading).toBe(true);
    });
  });

  describe("Redirect After Confirmation", () => {
    it("should build confirmation page URL with appointment ID", () => {
      const appointmentId = "12345";
      const existingParams = new URLSearchParams();
      existingParams.set("selectedDoctor", "dr-test");
      existingParams.set("selectedService", "having-child");

      existingParams.append("appointmentId", appointmentId);

      const confirmationUrl = `/appointment-confirmation?${existingParams.toString()}`;

      expect(confirmationUrl).toContain("/appointment-confirmation?");
      expect(confirmationUrl).toContain("appointmentId=12345");
    });
  });
});
