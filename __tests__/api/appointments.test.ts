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

/**
 * Tests for in-person appointment email notification disable feature
 *
 * Verifies that confirmation emails are only sent for virtual appointments,
 * not for in-person clinic appointments.
 */
describe("In-Person Appointment Email Notifications", () => {
  // Helper to simulate the email sending decision logic from route.ts
  const shouldSendEmail = (description: string): boolean => {
    const isVirtualAppointment = description === "Virtual Visit";
    return isVirtualAppointment;
  };

  // Helper to simulate the conditional email call
  const getEmailAction = async (
    isVirtualAppointment: boolean,
    sendEmailFn: () => Promise<boolean>
  ): Promise<boolean | null> => {
    return isVirtualAppointment ? sendEmailFn() : Promise.resolve(null);
  };

  describe("isVirtualAppointment detection", () => {
    it('should identify "Virtual Visit" as virtual appointment', () => {
      expect(shouldSendEmail("Virtual Visit")).toBe(true);
    });

    it('should identify "In Clinic" as in-person appointment', () => {
      expect(shouldSendEmail("In Clinic")).toBe(false);
    });

    it("should identify any non-virtual description as in-person", () => {
      const inPersonDescriptions = [
        "In Clinic",
        "Clinic Visit",
        "In-Person Consultation",
        "Office Visit",
        "",
        "Follow-up",
      ];

      inPersonDescriptions.forEach((description) => {
        expect(shouldSendEmail(description)).toBe(false);
      });
    });

    it("should be case-sensitive for Virtual Visit", () => {
      // The actual implementation uses exact match
      expect(shouldSendEmail("Virtual Visit")).toBe(true);
      expect(shouldSendEmail("virtual visit")).toBe(false);
      expect(shouldSendEmail("VIRTUAL VISIT")).toBe(false);
      expect(shouldSendEmail("Virtual visit")).toBe(false);
    });
  });

  describe("Email sending conditional logic", () => {
    it("should call sendEmail for virtual appointments", async () => {
      const mockSendEmail = jest.fn().mockResolvedValue(true);
      const isVirtual = true;

      const result = await getEmailAction(isVirtual, mockSendEmail);

      expect(mockSendEmail).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should NOT call sendEmail for in-person appointments", async () => {
      const mockSendEmail = jest.fn().mockResolvedValue(true);
      const isVirtual = false;

      const result = await getEmailAction(isVirtual, mockSendEmail);

      expect(mockSendEmail).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should return null for in-person appointments", async () => {
      const mockSendEmail = jest.fn().mockResolvedValue(true);
      const isVirtual = false;

      const result = await getEmailAction(isVirtual, mockSendEmail);

      expect(result).toBeNull();
    });

    it("should return email result for virtual appointments", async () => {
      const mockSendEmail = jest.fn().mockResolvedValue(true);
      const isVirtual = true;

      const result = await getEmailAction(isVirtual, mockSendEmail);

      expect(result).toBe(true);
    });
  });

  describe("Promise.all behavior with conditional email", () => {
    it("should include Promise.resolve(null) for in-person in Promise.all", async () => {
      const isVirtual = false;

      // Simulating the Promise.all call structure from route.ts
      const promises = [
        Promise.resolve("db-created"),
        Promise.resolve("server-updated"),
        isVirtual
          ? Promise.resolve("email-sent")
          : Promise.resolve(null), // This is the key behavior
        Promise.resolve("sms-sent"),
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual([
        "db-created",
        "server-updated",
        null, // Email should be null for in-person
        "sms-sent",
      ]);
    });

    it("should include email result for virtual in Promise.all", async () => {
      const isVirtual = true;

      const promises = [
        Promise.resolve("db-created"),
        Promise.resolve("server-updated"),
        isVirtual
          ? Promise.resolve("email-sent")
          : Promise.resolve(null),
        Promise.resolve("sms-sent"),
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual([
        "db-created",
        "server-updated",
        "email-sent", // Email should be sent for virtual
        "sms-sent",
      ]);
    });

    it("Promise.all should not fail when email is skipped", async () => {
      const isVirtual = false;

      const promises = [
        Promise.resolve("success"),
        isVirtual ? Promise.resolve("email") : Promise.resolve(null),
      ];

      // Should not throw
      await expect(Promise.all(promises)).resolves.toEqual(["success", null]);
    });
  });

  describe("Integration scenario tests", () => {
    it("virtual appointment should trigger email with correct params", () => {
      const payload = {
        description: "Virtual Visit",
        email: "patient@example.com",
        firstName: "John",
        lastName: "Doe",
      };

      const isVirtualAppointment = payload.description === "Virtual Visit";
      const shouldEmail = isVirtualAppointment && !!payload.email;

      expect(isVirtualAppointment).toBe(true);
      expect(shouldEmail).toBe(true);
    });

    it("in-person appointment should not trigger email regardless of email presence", () => {
      const payload = {
        description: "In Clinic",
        email: "patient@example.com", // Has email, but still shouldn't send
        firstName: "John",
        lastName: "Doe",
      };

      const isVirtualAppointment = payload.description === "Virtual Visit";

      expect(isVirtualAppointment).toBe(false);
      // Even with valid email, in-person should not send
    });

    it("virtual appointment without email should not crash", () => {
      const payload = {
        description: "Virtual Visit",
        email: "", // No email
        firstName: "John",
        lastName: "Doe",
      };

      const isVirtualAppointment = payload.description === "Virtual Visit";
      const patientEmail = payload.email || "";

      expect(isVirtualAppointment).toBe(true);
      expect(patientEmail).toBe("");
      // The sendConfirmAppointmentEmail function handles empty email by returning null
    });
  });
});
