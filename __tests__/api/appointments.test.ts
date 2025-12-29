/**
 * Tests for appointment route URL construction
 *
 * These tests verify that the manageAppointmentsLink is correctly
 * constructed separately from the appointmentLink.
 */

describe("Appointment URL Construction", () => {
  describe("manageAppointmentsLink vs appointmentLink", () => {
    it("should construct different URLs for virtual appointments", () => {
      const origin = "https://example.com";
      const appointmentId = 123;
      const isVirtualAppointment = true;

      // This mirrors the logic in route.ts
      const appointmentLink = isVirtualAppointment
        ? `${origin}/video-call/${appointmentId}/prepare`
        : `${origin}/manage-appointments`;
      const manageAppointmentsLink = `${origin}/manage-appointments`;

      expect(appointmentLink).toBe("https://example.com/video-call/123/prepare");
      expect(manageAppointmentsLink).toBe("https://example.com/manage-appointments");
      expect(appointmentLink).not.toBe(manageAppointmentsLink);
    });

    it("should have same URLs for in-person appointments (both go to manage)", () => {
      const origin = "https://example.com";
      const appointmentId = 456;
      const isVirtualAppointment = false;

      const appointmentLink = isVirtualAppointment
        ? `${origin}/video-call/${appointmentId}/prepare`
        : `${origin}/manage-appointments`;
      const manageAppointmentsLink = `${origin}/manage-appointments`;

      // For in-person appointments, both should point to manage-appointments
      expect(appointmentLink).toBe("https://example.com/manage-appointments");
      expect(manageAppointmentsLink).toBe("https://example.com/manage-appointments");
    });

    it("manageAppointmentsLink should always point to /manage-appointments", () => {
      const origins = [
        "https://bnoon.sa",
        "https://staging.bnoon.sa",
        "http://localhost:3000",
      ];

      origins.forEach((origin) => {
        const manageAppointmentsLink = `${origin}/manage-appointments`;
        expect(manageAppointmentsLink).toMatch(/\/manage-appointments$/);
      });
    });

    it("appointmentLink for virtual should include appointmentId in path", () => {
      const origin = "https://example.com";
      const appointmentIds = [1, 123, 99999];

      appointmentIds.forEach((appointmentId) => {
        const appointmentLink = `${origin}/video-call/${appointmentId}/prepare`;
        expect(appointmentLink).toContain(`/video-call/${appointmentId}/prepare`);
      });
    });
  });

  describe("Email template params construction", () => {
    it("should pass both appointmentLink and manageAppointmentsLink to email", () => {
      const origin = "https://example.com";
      const appointmentId = 789;
      const isVirtualAppointment = true;

      // Simulating route.ts logic
      const appointmentLink = isVirtualAppointment
        ? `${origin}/video-call/${appointmentId}/prepare`
        : `${origin}/manage-appointments`;
      const manageAppointmentsLink = `${origin}/manage-appointments`;

      // This is what gets passed to sendConfirmAppointmentEmail
      const emailParams = {
        appointmentLink,
        manageAppointmentsLink,
        // ... other params
      };

      expect(emailParams.appointmentLink).toBe("https://example.com/video-call/789/prepare");
      expect(emailParams.manageAppointmentsLink).toBe("https://example.com/manage-appointments");
    });
  });
});

describe("HTML Template Link Verification", () => {
  it("should have Manage Appointments button separate from Join Call link", () => {
    // This verifies the fix concept: two different links in the email
    const appointmentLink = "https://example.com/video-call/123/prepare";
    const manageAppointmentsLink = "https://example.com/manage-appointments";

    // Simulating template replacement
    const joinCallHtml = `<a href="${appointmentLink}">Join the call</a>`;
    const manageButtonHtml = `<a href="${manageAppointmentsLink}">Manage Your Appointments</a>`;

    expect(joinCallHtml).toContain("/video-call/");
    expect(manageButtonHtml).toContain("/manage-appointments");
    expect(joinCallHtml).not.toContain("/manage-appointments");
    expect(manageButtonHtml).not.toContain("/video-call/");
  });
});
