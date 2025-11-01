import * as jwt from "jsonwebtoken";

export function verifyToken({ secret, token }: { token: string; secret: string }) {
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string") return null;
    return payload as {
      mrn: string;
      firstName: string;
      lastName: string;
      contactNumber: string;
      emailAddress: string;
      branchId: number;
      iat: number;
      exp: number;
    };
  } catch (error) {
    console.log("verify token error", error);
    return null;
  }
}
