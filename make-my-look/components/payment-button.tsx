'use client'

import {Button} from "@/components/ui/Button"
import api from "@/services/api";
import { useState } from "react";
import { CreditCard } from "lucide-react-native";

export default function PaymentButton({amount, currency, receipt, name, email, phone, userType, setHasEmailPaid}: {amount: number, currency: string, receipt: string, name: string, email: string, phone: string, userType: string, setHasEmailPaid: (hasEmailPaid: boolean) => void}) {
    const [isLoading, setIsLoading] = useState(false);
    console.log("userType", userType)

    const handlePayment = async() => {
        setIsLoading(true);
        const res = await api.post("/api/payments", {
                amount: amount,
                currency: currency,
                receipt: receipt,
                email: email,
                userType: userType,
        });
        const order = res.data;
        console.log(order);
        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            name: "Techmorphers",
            description: "Payment for project",
            image: "/logo.png",
            handler: async (response: any) => {
                const verifyResponse = await api.post ("/api/payments/verify", {
                    orderId: order.id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                });
                const json = verifyResponse.data;
                console.log(json);
                setHasEmailPaid(true);
            },
            prefill: {
                name: name,
                email: email,
                phone: phone,
            },
            theme: {
                color: "#000000",
            }
        }
        new (window as any).Razorpay(options).open();
        setIsLoading(false);
    }

    return (
        <Button
          onPress={handlePayment}
          title="Pay onboarding fee"
          variant="primary"
          size="large"
          disabled={isLoading}
          loading={isLoading}
          icon={<CreditCard size={20} color="white" />}
          iconPosition="right"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c1.104 0 2-.672 2-1.5S13.104 5 12 5s-2 .672-2 1.5S10.896 8 12 8zM6 10v10h12V10H6zm0 0V8a6 6 0 0112 0v2"
                />
              </svg>
              <span>Pay onboarding fee {currency} {amount} Securely and get started</span>
            </>
          )}
        </Button>

    )
}