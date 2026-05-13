'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, CheckCircle, XCircle, TrendingUp, Calendar } from 'lucide-react';

import type { ScheduledPayment } from '@/types';

interface DashboardStatsProps {
    payments: ScheduledPayment[];
}

export function DashboardStats({ payments }: DashboardStatsProps) {
    const totalPayments = payments.length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;

    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, payment) => sum + payment.amount, 0);
    const completedAmount = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0);

    // Get payments scheduled for today
    const today = new Date().toDateString();
    const todayPayments = payments.filter(p =>
        new Date(p.scheduledDate).toDateString() === today && p.status === 'pending'
    ).length;

    // Get payments due (past due date but still pending)
    const overduePayments = payments.filter(p =>
        new Date(p.scheduledDate) < new Date() && p.status === 'pending'
    ).length;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const stats = [
        {
            title: 'Total Payments',
            value: totalPayments.toString(),
            description: 'All scheduled payments',
            icon: DollarSign,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Pending Amount',
            value: formatCurrency(pendingAmount),
            description: `${pendingPayments} payments pending`,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
        {
            title: 'Completed Amount',
            value: formatCurrency(completedAmount),
            description: `${completedPayments} payments completed`,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Failed Payments',
            value: failedPayments.toString(),
            description: 'Requires attention',
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Main Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-md ${stat.bgColor}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Alert Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Today's Payments */}
                <Card className={todayPayments > 0 ? 'border-orange-200 bg-orange-50' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-600" />
                            Today&#39;s Payments
                        </CardTitle>
                        {todayPayments > 0 && (
                            <Badge variant="outline" className="text-orange-600 border-orange-600">
                                {todayPayments}
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {todayPayments}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {todayPayments > 0
                                ? `${todayPayments} payment${todayPayments > 1 ? 's' : ''} scheduled for today`
                                : 'No payments scheduled for today'
                            }
                        </p>
                    </CardContent>
                </Card>

                {/* Overdue Payments */}
                <Card className={overduePayments > 0 ? 'border-red-200 bg-red-50' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-red-600" />
                            Overdue Payments
                        </CardTitle>
                        {overduePayments > 0 && (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                                {overduePayments}
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {overduePayments}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {overduePayments > 0
                                ? `${overduePayments} payment${overduePayments > 1 ? 's' : ''} past due date`
                                : 'All payments are on schedule'
                            }
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Summary Stats */}
            {totalPayments > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Value:</span>
                                <span className="font-bold">{formatCurrency(totalAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Success Rate:</span>
                                <span className="font-bold">
                  {totalPayments > 0
                      ? `${Math.round((completedPayments / (completedPayments + failedPayments || 1)) * 100)}%`
                      : '0%'
                  }
                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Average Payment:</span>
                                <span className="font-bold">
                  {formatCurrency(totalPayments > 0 ? totalAmount / totalPayments : 0)}
                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
