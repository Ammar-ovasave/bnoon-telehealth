import { db } from ".";
import { PaymentRecord, PaymentStatus } from "@/models/PaymentModel";

const PAYMENTS_COLLECTION_NAME = "payments";

/**
 * Create a new payment record in Firestore
 */
export async function createPaymentRecord(
  payment: Omit<PaymentRecord, "id">
): Promise<string | null> {
  try {
    const docRef = db.collection(PAYMENTS_COLLECTION_NAME).doc();
    const paymentWithId: PaymentRecord = {
      ...payment,
      id: docRef.id,
    };
    await docRef.set(paymentWithId);
    return docRef.id;
  } catch (error) {
    console.log("--- createPaymentRecord error", error);
    return null;
  }
}

/**
 * Get payment record by merchant reference
 */
export async function getPaymentByMerchantReference(
  merchantReference: string
): Promise<PaymentRecord | null> {
  try {
    const snapshot = await db
      .collection(PAYMENTS_COLLECTION_NAME)
      .where("merchantReference", "==", merchantReference)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as PaymentRecord;
  } catch (error) {
    console.log("--- getPaymentByMerchantReference error", error);
    return null;
  }
}

/**
 * Get payment record by ID
 */
export async function getPaymentById(
  paymentId: string
): Promise<PaymentRecord | null> {
  try {
    const doc = await db
      .collection(PAYMENTS_COLLECTION_NAME)
      .doc(paymentId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as PaymentRecord;
  } catch (error) {
    console.log("--- getPaymentById error", error);
    return null;
  }
}

/**
 * Update payment status and related fields
 */
export async function updatePaymentStatus(
  merchantReference: string,
  updates: {
    status?: PaymentStatus;
    fortId?: string;
    appointmentId?: string;
    responseCode?: string;
    responseMessage?: string;
    apsResponse?: Record<string, string>;
  }
): Promise<boolean> {
  try {
    const snapshot = await db
      .collection(PAYMENTS_COLLECTION_NAME)
      .where("merchantReference", "==", merchantReference)
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.log("--- updatePaymentStatus: Payment not found", merchantReference);
      return false;
    }

    await snapshot.docs[0].ref.update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.log("--- updatePaymentStatus error", error);
    return false;
  }
}

/**
 * Get payments by status (for admin/reporting)
 */
export async function getPaymentsByStatus(
  status: PaymentStatus,
  limit: number = 100
): Promise<PaymentRecord[]> {
  try {
    const snapshot = await db
      .collection(PAYMENTS_COLLECTION_NAME)
      .where("status", "==", status)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const payments: PaymentRecord[] = [];
    snapshot.forEach((doc) => {
      payments.push(doc.data() as PaymentRecord);
    });

    return payments;
  } catch (error) {
    console.log("--- getPaymentsByStatus error", error);
    return [];
  }
}

/**
 * Get pending payments older than specified hours (for cleanup/retry)
 */
export async function getPendingPaymentsOlderThan(
  hours: number
): Promise<PaymentRecord[]> {
  try {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    const snapshot = await db
      .collection(PAYMENTS_COLLECTION_NAME)
      .where("status", "==", "pending")
      .where("createdAt", "<", cutoffTime.toISOString())
      .get();

    const payments: PaymentRecord[] = [];
    snapshot.forEach((doc) => {
      payments.push(doc.data() as PaymentRecord);
    });

    return payments;
  } catch (error) {
    console.log("--- getPendingPaymentsOlderThan error", error);
    return [];
  }
}
