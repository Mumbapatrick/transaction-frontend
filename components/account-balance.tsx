'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, RefreshCw, Play, AlertTriangle } from 'lucide-react';
import { getMpesaBalance } from '@/utils/mpesa-api';
import { useToast } from '@/hooks/use-toast';

import type { ScheduledPayment } from '@/types';

interface AccountBalanceProps {
    payments: ScheduledPayment[];
    onProcessPayment?: (paymentId: string) => void;
}

export function AccountBalance({ payments, onProcessPayment }: AccountBalanceProps) {
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const loadBalance = async () => {
        setLoading(true);
        try {
            const newBalance = await getMpesaBalance();
            setBalance(newBalance);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load account balance',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBalance();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const pendingAmount = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, payment) => sum + payment.amount, 0);

    const overduePayments = payments.filter(p =>
        new Date(p.scheduledDate) < new Date() && p.status === 'pending'
    );

    const hasInsufficientFunds = balance !== null && balance < pendingAmount;

    return (
        <Card className={hasInsufficientFunds ? 'border-red-200 bg-red-50' : ''}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-green-600" />
                            M-Pesa Account
                        </CardTitle>
                        <CardDescription>
                            Current balance and payment status
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadBalance}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Available Balance:</span>
                        <span className="text-2xl font-bold">
              {balance !== null ? formatCurrency(balance) : '---'}
            </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pending Payments:</span>
                        <span className={`font-medium ${pendingAmount > 0 ? 'text-yellow-600' : 'text-gray-500'}`}>
              {formatCurrency(pendingAmount)}
            </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Available After:</span>
                        <span className={`font-medium ${balance !== null && balance - pendingAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {balance !== null ? formatCurrency(balance - pendingAmount) : '---'}
            </span>
                    </div>
                </div>

                {hasInsufficientFunds && (
                    <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-sm font-medium">Insufficient Funds</span>
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                            You need {formatCurrency(pendingAmount - (balance || 0))} more to cover all pending payments.
                        </p>
                    </div>
                )}

                {overduePayments.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-600">
                Overdue Payments ({overduePayments.length})
              </span>
                            <Badge variant="outline" className="text-red-600 border-red-600">
                                Action Required
                            </Badge>
                        </div>

                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {overduePayments.slice(0, 3).map(payment => (
                                <div key={payment.id} className="flex justify-between items-center p-2 bg-red-50 rounded text-xs">
                                    <div>
                                        <p className="font-medium">
                                            {payment.recipients.length === 1
                                                ? (payment.recipients[0].name || payment.recipients[0].phone)
                                                : `${payment.recipients.length} recipients`
                                            }
                                        </p>
                                        <p className="text-gray-600">{formatCurrency(payment.amount)}</p>
                                    </div>
                                    {onProcessPayment && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onProcessPayment(payment.id)}
                                            className="h-6 px-2 text-xs"
                                        >
                                            <Play className="w-3 h-3 mr-1" />
                                            Process
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Last updated:</span>
                        <span>{new Date().toLocaleTimeString()}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
