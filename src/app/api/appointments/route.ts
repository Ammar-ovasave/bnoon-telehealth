import axios from "@/services/axios";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const createAppointmentResponse = await axios.post<{ id?: number }>("/appointments", payload);
    if (!createAppointmentResponse.data.id) {
      console.log("--- create appointment error", createAppointmentResponse.data);
      return Response.error();
    }
    return Response.json(createAppointmentResponse.data);
  } catch (error) {
    console.log("--- create appointment error", error);
    return Response.error();
  }
}
