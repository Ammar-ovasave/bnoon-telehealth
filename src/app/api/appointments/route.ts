import { createAppointment as createAppointmentBnoonApi } from "@/services/bnoon-api";
import { getAuthToken } from "@/lib/getAuthToken";
import { NextResponse } from "next/server";

interface CreateAppointmentRequest {
  branchId: string;
  serviceId: number;
  resourceId: number;
  startTime: string;
  endTime: string;
  visitType: "virtual" | "in-person";
  fullName?: string;
  email?: string;
  sex?: 0 | 1;
  dob?: string;
  nationalityId?: number;
  identityIdType?: number;
  identityId?: string;
}

/**
 * POST /api/appointments
 * Create a new appointment via bnoon-api
 */
export async function POST(request: Request) {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload: CreateAppointmentRequest = await request.json();

    // Validate required fields
    if (!payload.branchId || !payload.serviceId || !payload.resourceId || !payload.startTime || !payload.endTime) {
      return NextResponse.json(
        { error: "Missing required fields: branchId, serviceId, resourceId, startTime, endTime" },
        { status: 400 }
      );
    }

    // Call bnoon-api to create appointment
    const result = await createAppointmentBnoonApi(
      {
        branchId: payload.branchId,
        serviceId: payload.serviceId,
        resourceId: payload.resourceId,
        startTime: payload.startTime,
        endTime: payload.endTime,
        visitType: payload.visitType ?? "in-person",
        fullName: payload.fullName,
        email: payload.email,
        sex: payload.sex,
        dob: payload.dob,
        nationalityId: payload.nationalityId,
        identityIdType: payload.identityIdType,
        identityId: payload.identityId,
      },
      token
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("--- create appointment error", error);

    // Handle axios error responses
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      const status = axiosError.response?.status || 500;
      const message = axiosError.response?.data?.message || "Failed to create appointment";
      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
