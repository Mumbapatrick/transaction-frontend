'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { processMpesaPayment } from '@/utils/mpesa-api';

interface ScheduledPayment {
    id: string;
    recipient: string;
    amount: number;
    description: string;
    scheduledDate: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
}

interface PaymentSchedulerProps {
    payments: ScheduledPayment[];
    onUpdateStatus: (id: string, status: ScheduledPayment['status']) => void;
}

export function PaymentScheduler({ payments, onUpdateStatus }: PaymentSchedulerProps) {
    const { toast } = useToast();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const processedPayments = useRef<Set<string>>(new Set());

    const processPayment = async (payment: ScheduledPayment) => {
        if (processedPayments.current.has(payment.id)) {
            return; // Already processed
        }

        processedPayments.current.add(payment.id);

        toast({
            title: 'Processing Payment',
            description: `Sending KES ${payment.amount.toLocaleString()} to ${payment.recipient}...`,
        });

        try {
            const response = await processMpesaPayment({
                recipient: payment.recipient,
                amount: payment.amount,
                description: payment.description,
            });

            if (response.success) {
                onUpdateStatus(payment.id, 'completed');
                toast({
                    title: 'Payment Successful',
                    description: `${response.message} (ID: ${response.transactionId})`,
                    variant: 'default',
                });
            } else {
                onUpdateStatus(payment.id, 'failed');
                toast({
                    title: 'Payment Failed',
                    description: response.message,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            onUpdateStatus(payment.id, 'failed');
            toast({
                title: 'Payment Error',
                description: `An unexpected error occurred while processing payment to ${payment.recipient}`,
                variant: 'destructive',
            });
        }
    };

    const checkDuePayments = () => {
        const now = new Date();
        const duePayments = payments.filter(payment => {
            const scheduledDate = new Date(payment.scheduledDate);
            return (
                payment.status === 'pending' &&
                scheduledDate <= now &&
                !processedPayments.current.has(payment.id)
            );
        });

        for (const payment of duePayments) {
            processPayment(payment);
        }
    };

    useEffect(() => {
        // Check for due payments every 30 seconds
        intervalRef.current = setInterval(checkDuePayments, 30000);

        // Initial check
        checkDuePayments();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [payments]);

    // Reset processed payments when payments array changes significantly
    useEffect(() => {
        const currentPaymentIds = new Set(payments.map(p => p.id));
        const processedIds = Array.from(processedPayments.current);

        // Remove processed IDs that no longer exist in payments
        for (const id of processedIds) {
            if (!currentPaymentIds.has(id)) {
                processedPayments.current.delete(id);
            }
        }
    }, [payments]);

    return null; // This component doesn't render anything
}
