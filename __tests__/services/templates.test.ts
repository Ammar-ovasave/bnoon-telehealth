import { getConfirmAppointmentEmail } from "@/services/templates";

describe("getConfirmAppointmentEmail", () => {
  const baseParams = {
    appointmentDate: "15-01-2025",
    appointmentTime: "10:00 AM",
    doctorName: "Dr. Test Doctor",
    location: "Virtual Visit",
    serviceName: "General Consultation",
    patientName: "John Doe",
    patientEmail: "john@example.com",
    patientGender: "male",
    appointmentLink: "https://example.com/video-call/123/prepare",
    manageAppointmentsLink: "https://example.com/manage-appointments",
    clinicName: "Bnoon Test Clinic",
    isVirtual: true,
  };

  describe("manageAppointmentsLink placeholder", () => {
    it("should replace {{manageAppointmentsLink}} with the correct URL", async () => {
      const html = await getConfirmAppointmentEmail(baseParams);

      expect(html).not.toBeNull();
      expect(html).toContain("https://example.com/manage-appointments");
    });

    it("should use manageAppointmentsLink for Manage Appointments button, not appointmentLink", async () => {
      const html = await getConfirmAppointmentEmail(baseParams);

      expect(html).not.toBeNull();
      // The Manage Appointments button should link to manage-appointments page
      expect(html).toContain('href="https://example.com/manage-appointments"');
      // The Join Call section should use the appointmentLink
      expect(html).toContain('href="https://example.com/video-call/123/prepare"');
    });

    it("should have different URLs for appointmentLink and manageAppointmentsLink", async () => {
      const params = {
        ...baseParams,
        appointmentLink: "https://example.com/video-call/456/prepare",
        manageAppointmentsLink: "https://example.com/manage-appointments",
      };

      const html = await getConfirmAppointmentEmail(params);

      expect(html).not.toBeNull();
      // Both links should be present and different
      expect(html).toContain("https://example.com/video-call/456/prepare");
      expect(html).toContain("https://example.com/manage-appointments");
    });

    it("should not contain unreplaced {{manageAppointmentsLink}} placeholder", async () => {
      const html = await getConfirmAppointmentEmail(baseParams);

      expect(html).not.toBeNull();
      expect(html).not.toContain("{{manageAppointmentsLink}}");
    });
  });

  describe("other placeholders", () => {
    it("should replace all standard placeholders", async () => {
      const html = await getConfirmAppointmentEmail(baseParams);

      expect(html).not.toBeNull();
      expect(html).toContain("15-01-2025");
      expect(html).toContain("10:00 AM");
      expect(html).toContain("Dr. Test Doctor");
      expect(html).toContain("John Doe");
      expect(html).not.toContain("{{appointmentDate}}");
      expect(html).not.toContain("{{appointmentTime}}");
      expect(html).not.toContain("{{doctorName}}");
      expect(html).not.toContain("{{patientName}}");
    });

    it("should not contain any unreplaced placeholders", async () => {
      const html = await getConfirmAppointmentEmail(baseParams);

      expect(html).not.toBeNull();
      // Check for any remaining {{ }} patterns (except locationLink which is optional)
      const remainingPlaceholders = html!.match(/{{(?!locationLink)[^}]+}}/g);
      expect(remainingPlaceholders).toBeNull();
    });
  });

  describe("Arabic template", () => {
    it("should use Arabic template when locale is ar", async () => {
      const params = {
        ...baseParams,
        locale: "ar",
      };

      const html = await getConfirmAppointmentEmail(params);

      expect(html).not.toBeNull();
      // Arabic template has dir="rtl"
      expect(html).toContain('dir="rtl"');
    });

    it("should replace manageAppointmentsLink in Arabic template", async () => {
      const params = {
        ...baseParams,
        locale: "ar",
      };

      const html = await getConfirmAppointmentEmail(params);

      expect(html).not.toBeNull();
      expect(html).toContain("https://example.com/manage-appointments");
      expect(html).not.toContain("{{manageAppointmentsLink}}");
    });
  });
});
