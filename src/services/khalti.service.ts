import {
  KHALTI_SECRET_KEY,
  KHALTI_BASE_URL,
  KHALTI_RETURN_URL,
  KHALTI_WEBSITE_URL,
} from "../config/constant";
import { HttpException } from "../exceptions/http-exception";

export interface KhaltiInitiateParams {
  amountPaisa: number;
  purchaseOrderId: string;
  purchaseOrderName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
}

export interface KhaltiLookupResponse {
  pidx: string;
  total_amount: number;
  status: "Completed" | "Pending" | "Expired" | "Initiated" | "Refunded" | "User canceled";
  transaction_id: string | null;
}

export class KhaltiService {
  private requireKey(): string {
    if (!KHALTI_SECRET_KEY) {
      throw new HttpException(500, "Khalti secret key is not configured");
    }
    return KHALTI_SECRET_KEY;
  }

  async initiatePayment(
    params: KhaltiInitiateParams,
  ): Promise<KhaltiInitiateResponse> {
    const key = this.requireKey();
    const response = await fetch(`${KHALTI_BASE_URL}/epayment/initiate/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        return_url: KHALTI_RETURN_URL,
        website_url: KHALTI_WEBSITE_URL,
        amount: params.amountPaisa,
        purchase_order_id: params.purchaseOrderId,
        purchase_order_name: params.purchaseOrderName,
        customer_info: {
          name: params.customerName,
          email: params.customerEmail,
          phone: params.customerPhone,
        },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new HttpException(
        response.status,
        data?.detail || "Failed to initiate Khalti payment",
      );
    }
    return data as KhaltiInitiateResponse;
  }

  async lookupPayment(pidx: string): Promise<KhaltiLookupResponse> {
    const key = this.requireKey();
    const response = await fetch(`${KHALTI_BASE_URL}/epayment/lookup/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new HttpException(
        response.status,
        data?.detail || "Failed to verify Khalti payment",
      );
    }
    return data as KhaltiLookupResponse;
  }
}
