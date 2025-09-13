'use client';
import { PaymentForm } from "@/components/dashboard/payments/payment-form";
import { useCheckRole } from "@/hooks/use-check-role";

export default function NewPaymentPage() {
    useCheckRole(['Admin']);
    return <PaymentForm />;
}
