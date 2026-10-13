"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function verifyAndEnroll(reference: string, levelId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in." };

  try {
    // 1. VERIFY PAYMENT SECURELY WITH PAYSTACK API
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      return { error: "Payment verification failed." };
    }

    // Amount comes back in Kobo, so we divide by 100 to get Naira
    const amountPaid = paystackData.data.amount / 100;

    // 2. INSERT ENROLLMENT RECORD
    const { error: dbError } = await supabase.from("enrollments").insert({
      user_id: user.id,
      level_id: levelId,
      amount_paid: amountPaid,
      payment_reference: reference,
      status: "active",
    });

    if (dbError) return { error: dbError.message };

    // 3. UNLOCK THE COURSE PAGE
    // revalidatePath(`/resources/subject/${subjectId}`);
    // revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    return { error: "Server error during verification." };
  }
}
