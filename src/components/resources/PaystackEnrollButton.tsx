"use client";

import { useState, useTransition } from "react";
import { usePaystackPayment } from "react-paystack";
import { verifyAndEnroll } from "@/lib/actions/payments";
import { Loader2, Lock } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  levelId: string;
  levelName: string;
  amount: number; // In Naira
  email: string;
}

export default function PaystackEnrollButton({
  levelId,
  levelName,
  amount,
  email,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [isVerifying, setIsVerifying] = useState(false);

  // Configure Paystack
  const config = {
    reference: `KRL_${new Date().getTime()}_${Math.floor(Math.random() * 1000000)}`,
    email: email,
    amount: amount * 100, // Convert Naira to Kobo!
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
  };

  const initializePayment = usePaystackPayment(config);

  const handleSuccess = (reference: any) => {
    setIsVerifying(true);
    startTransition(async () => {
      const res = await verifyAndEnroll(reference.reference, levelId);
      if (res.success) {
        toast.success("Payment successful! Level unlocked.");
      } else {
        toast.error(res.error || "Verification failed. Contact support.");
      }
      setIsVerifying(false);
    });
  };

  const handleClose = () => {
    toast.error("Payment cancelled.");
  };

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);

  return (
    <button
      onClick={() =>
        initializePayment({ onSuccess: handleSuccess, onClose: handleClose })
      }
      disabled={isVerifying || isPending}
      className="w-full sm:w-auto px-8 py-3.5 bg-ink hover:bg-blue-800 text-white font-bold rounded-xl flex flex-col justify-center items-center shadow-md transition disabled:opacity-50 cursor-pointer"
    >
      {isVerifying || isPending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Unlocking...
        </span>
      ) : (
        <>
          <span className="text-sm flex items-center gap-1.5">
            <Lock className="w-4 h-4" /> Enroll in {levelName}!
          </span>
          <span className="text-xs text-blue-200">{formattedPrice}</span>
        </>
      )}
    </button>
  );
}
