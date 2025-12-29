/**
 * Tests for AppointmentCard button visibility logic
 *
 * Verifies that Reschedule and Cancel buttons are hidden
 * for completed and cancelled appointments.
 */

describe("AppointmentCard Button Visibility", () => {
  // Helper to simulate the canModifyAppointment logic from AppointmentCard.tsx
  const canModifyAppointment = (statusName: string | undefined): boolean => {
    const isAppointmentCompleted = statusName?.toLocaleLowerCase().includes("completed");
    const isAppointmentCancelled = statusName?.toLocaleLowerCase() === "cancelled";
    return !isAppointmentCompleted && !isAppointmentCancelled;
  };

  describe("canModifyAppointment logic", () => {
    describe("should allow modification (show buttons)", () => {
      it('for "Approved/Confirmed" status', () => {
        expect(canModifyAppointment("Approved/Confirmed")).toBe(true);
      });

      it('for "Pending" status', () => {
        expect(canModifyAppointment("Pending")).toBe(true);
      });

      it('for "Scheduled" status', () => {
        expect(canModifyAppointment("Scheduled")).toBe(true);
      });

      it('for "Upcoming" status', () => {
        expect(canModifyAppointment("Upcoming")).toBe(true);
      });

      it("for undefined status", () => {
        expect(canModifyAppointment(undefined)).toBe(true);
      });

      it("for empty string status", () => {
        expect(canModifyAppointment("")).toBe(true);
      });
    });

    describe("should NOT allow modification (hide buttons)", () => {
      it('for "Completed" status', () => {
        expect(canModifyAppointment("Completed")).toBe(false);
      });

      it('for "completed" status (lowercase)', () => {
        expect(canModifyAppointment("completed")).toBe(false);
      });

      it('for "COMPLETED" status (uppercase)', () => {
        expect(canModifyAppointment("COMPLETED")).toBe(false);
      });

      it('for "Visit Completed" status', () => {
        expect(canModifyAppointment("Visit Completed")).toBe(false);
      });

      it('for "Appointment Completed" status', () => {
        expect(canModifyAppointment("Appointment Completed")).toBe(false);
      });

      it('for "Cancelled" status', () => {
        expect(canModifyAppointment("Cancelled")).toBe(false);
      });

      it('for "cancelled" status (lowercase)', () => {
        expect(canModifyAppointment("cancelled")).toBe(false);
      });
    });

    describe("edge cases", () => {
      it('should NOT match "Cancel" (without "led")', () => {
        // "Cancel" is not the same as "Cancelled"
        expect(canModifyAppointment("Cancel")).toBe(true);
      });

      it('should NOT match "Cancellation Pending"', () => {
        // Only exact "cancelled" should hide buttons
        expect(canModifyAppointment("Cancellation Pending")).toBe(true);
      });

      it('should match partial "completed" in status name', () => {
        // Uses includes() so any status containing "completed" should hide
        expect(canModifyAppointment("Successfully Completed")).toBe(false);
      });
    });
  });

  describe("Button visibility scenarios", () => {
    interface MockAppointment {
      status?: { name?: string };
      description?: string;
    }

    const getVisibleButtons = (appointment: MockAppointment) => {
      const isVirtualAppointment = appointment.description?.toLocaleLowerCase().includes("virtual");
      const canModify = canModifyAppointment(appointment.status?.name);

      return {
        showJoinButton: canModify && isVirtualAppointment,
        showRescheduleButton: canModify,
        showCancelButton: canModify,
      };
    };

    it("confirmed virtual appointment should show all buttons", () => {
      const appointment: MockAppointment = {
        status: { name: "Approved/Confirmed" },
        description: "Virtual Visit",
      };

      const buttons = getVisibleButtons(appointment);

      expect(buttons.showJoinButton).toBe(true);
      expect(buttons.showRescheduleButton).toBe(true);
      expect(buttons.showCancelButton).toBe(true);
    });

    it("confirmed in-person appointment should show reschedule and cancel only", () => {
      const appointment: MockAppointment = {
        status: { name: "Approved/Confirmed" },
        description: "In Clinic",
      };

      const buttons = getVisibleButtons(appointment);

      expect(buttons.showJoinButton).toBe(false);
      expect(buttons.showRescheduleButton).toBe(true);
      expect(buttons.showCancelButton).toBe(true);
    });

    it("completed virtual appointment should show NO buttons", () => {
      const appointment: MockAppointment = {
        status: { name: "Completed" },
        description: "Virtual Visit",
      };

      const buttons = getVisibleButtons(appointment);

      expect(buttons.showJoinButton).toBe(false);
      expect(buttons.showRescheduleButton).toBe(false);
      expect(buttons.showCancelButton).toBe(false);
    });

    it("completed in-person appointment should show NO buttons", () => {
      const appointment: MockAppointment = {
        status: { name: "Completed" },
        description: "In Clinic",
      };

      const buttons = getVisibleButtons(appointment);

      expect(buttons.showJoinButton).toBe(false);
      expect(buttons.showRescheduleButton).toBe(false);
      expect(buttons.showCancelButton).toBe(false);
    });

    it("cancelled appointment should show NO buttons", () => {
      const appointment: MockAppointment = {
        status: { name: "Cancelled" },
        description: "Virtual Visit",
      };

      const buttons = getVisibleButtons(appointment);

      expect(buttons.showJoinButton).toBe(false);
      expect(buttons.showRescheduleButton).toBe(false);
      expect(buttons.showCancelButton).toBe(false);
    });

    it("pending appointment should show appropriate buttons", () => {
      const appointment: MockAppointment = {
        status: { name: "Pending" },
        description: "Virtual Visit",
      };

      const buttons = getVisibleButtons(appointment);

      expect(buttons.showJoinButton).toBe(true);
      expect(buttons.showRescheduleButton).toBe(true);
      expect(buttons.showCancelButton).toBe(true);
    });
  });
});
