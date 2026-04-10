'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, DollarSign } from 'lucide-react';
import type { ScheduledPayment, PaymentCategory } from '@/types';

interface AnalyticsDashboardProps {
    payments: ScheduledPayment[];
    categories: PaymentCategory[];
}

export function AnalyticsDashboard({ payments, categories }: AnalyticsDashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate category spending
    const categorySpending = categories.map(category => {
        const categoryPayments = payments.filter(p => p.category.id === category.id);
        const amount = categoryPayments.reduce((sum, p) => sum + p.amount, 0);
        const count = categoryPayments.length;
        return { category, amount, count };
    }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

    const totalSpent = categorySpending.reduce((sum, c) => sum + c.amount, 0);

    // Calculate monthly trends
    const getMonthlyData = () => {
        const monthlyMap: { [key: string]: { amount: number; count: number } } = {};

        payments.forEach(payment => {
            const date = new Date(payment.scheduledDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyMap[monthKey]) {
                monthlyMap[monthKey] = { amount: 0, count: 0 };
            }

            monthlyMap[monthKey].amount += payment.amount;
            monthlyMap[monthKey].count += 1;
        });

        return Object.entries(monthlyMap)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .slice(-6) // Last 6 months
            .map(([month, data]) => ({
                month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                ...data
            }));
    };

    const monthlyData = getMonthlyData();
    const maxMonthlyAmount = Math.max(...monthlyData.map(d => d.amount), 1);

    // Calculate success rate
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;
    const successRate = payments.length > 0
        ? Math.round((completedPayments / (completedPayments + failedPayments || 1)) * 100)
        : 0;

    // Get top recipients
    const getTopRecipients = () => {
        const recipientMap: { [key: string]: { count: number; amount: number; name: string } } = {};

        payments.forEach(payment => {
            payment.recipients.forEach(recipient => {
                const key = recipient.phone;
                if (!recipientMap[key]) {
                    recipientMap[key] = {
                        count: 0,
                        amount: 0,
                        name: recipient.name || recipient.phone
                    };
                }
                recipientMap[key].count += 1;
                recipientMap[key].amount += recipient.amount || payment.amount / payment.recipients.length;
            });
        });

        return Object.entries(recipientMap)
            .map(([phone, data]) => ({ phone, ...data }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    };

    const topRecipients = getTopRecipients();

    // Calculate trend
    const currentMonthAmount = monthlyData[monthlyData.length - 1]?.amount || 0;
    const previousMonthAmount = monthlyData[monthlyData.length - 2]?.amount || 0;
    const trend = previousMonthAmount > 0
        ? ((currentMonthAmount - previousMonthAmount) / previousMonthAmount) * 100
        : 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {payments.length} payment{payments.length !== 1 ? 's' : ''}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{successRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {completedPayments} successful, {failedPayments} failed
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
                        {trend >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            vs last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Payment</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(payments.length > 0 ? totalSpent / payments.length : 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per transaction
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Category Spending */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5 text-green-600" />
                            Spending by Category
                        </CardTitle>
                        <CardDescription>Top spending categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categorySpending.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No spending data available</p>
                        ) : (
                            <div className="space-y-4">
                                {categorySpending.slice(0, 6).map((item) => {
                                    const percentage = (item.amount / totalSpent) * 100;
                                    return (
                                        <div key={item.category.id} className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{item.category.icon}</span>
                                                    <span className="font-medium">{item.category.name}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.count}
                                                    </Badge>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold">{formatCurrency(item.amount)}</div>
                                                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${item.category.color.replace('bg-', 'bg-opacity-70 bg-')}`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Monthly Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-green-600" />
                            Monthly Trends
                        </CardTitle>
                        <CardDescription>Spending over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {monthlyData.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No trend data available</p>
                        ) : (
                            <div className="space-y-4">
                                {monthlyData.map((data) => {
                                    const heightPercentage = (data.amount / maxMonthlyAmount) * 100;
                                    return (
                                        <div key={data.month} className="space-y-1">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-medium">{data.month}</span>
                                                <div className="text-right">
                                                    <div className="font-semibold">{formatCurrency(data.amount)}</div>
                                                    <div className="text-xs text-gray-500">{data.count} payments</div>
                                                </div>
                                            </div>
                                            <div className="flex items-end h-12">
                                                <div
                                                    className="w-full bg-green-500 rounded-t"
                                                    style={{ height: `${heightPercentage}%`, minHeight: '4px' }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Top Recipients */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Top Recipients
                    </CardTitle>
                    <CardDescription>Most frequent payment recipients</CardDescription>
                </CardHeader>
                <CardContent>
                    {topRecipients.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No recipient data available</p>
                    ) : (
                        <div className="space-y-3">
                            {topRecipients.map((recipient, index) => (
                                <div key={recipient.phone} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{recipient.name}</p>
                                            <p className="text-sm text-gray-500">{recipient.phone}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-600">{formatCurrency(recipient.amount)}</p>
                                        <p className="text-xs text-gray-500">{recipient.count} payment{recipient.count !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
