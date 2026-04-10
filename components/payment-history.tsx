'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Play, Pause, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import type { ScheduledPayment } from '@/types';

interface PaymentHistoryProps {
    payments: ScheduledPayment[];
    onUpdateStatus: (id: string, status: ScheduledPayment['status']) => void;
    onDelete: (id: string) => void;
}

export function PaymentHistory({ payments, onUpdateStatus, onDelete }: PaymentHistoryProps) {
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('scheduledDate');

    const filteredPayments = payments
        .filter(payment => filterStatus === 'all' || payment.status === filterStatus)
        .sort((a, b) => {
            if (sortBy === 'scheduledDate') {
                return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
            } else if (sortBy === 'amount') {
                return b.amount - a.amount;
            } else if (sortBy === 'createdAt') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
        });

    const getStatusBadge = (status: ScheduledPayment['status']) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'completed':
                return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
            case 'failed':
                return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleMarkAsCompleted = (id: string) => {
        onUpdateStatus(id, 'completed');
    };

    const handleMarkAsFailed = (id: string) => {
        onUpdateStatus(id, 'failed');
    };

    const handleMarkAsPending = (id: string) => {
        onUpdateStatus(id, 'pending');
    };

    const isScheduledDatePassed = (scheduledDate: string) => {
        return new Date(scheduledDate) <= new Date();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatPhoneNumber = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('254')) {
            return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
        } else if (cleaned.startsWith('0')) {
            return `${cleaned.slice(0, 1)}${cleaned.slice(1, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
        }
        return phone;
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-600" />
                            Payment History
                        </CardTitle>
                        <CardDescription>
                            View and manage all your scheduled payments
                        </CardDescription>
                    </div>

                    <div className="flex gap-2">
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[140px]">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="scheduledDate">By Date</SelectItem>
                                <SelectItem value="amount">By Amount</SelectItem>
                                <SelectItem value="createdAt">By Created</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {filteredPayments.length === 0 ? (
                    <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                        <p className="text-gray-500">
                            {filterStatus === 'all'
                                ? 'No payments have been scheduled yet.'
                                : `No ${filterStatus} payments found.`}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Recipient</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Scheduled Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.map((payment) => (
                                    <TableRow key={payment.id} className={isScheduledDatePassed(payment.scheduledDate) && payment.status === 'pending' ? 'bg-yellow-50' : ''}>
                                        <TableCell className="font-medium">
                                            <div>
                                                {payment.recipients.length === 1 ? (
                                                    <p>{payment.recipients[0].name || formatPhoneNumber(payment.recipients[0].phone)}</p>
                                                ) : (
                                                    <p>{payment.recipients.length} recipients</p>
                                                )}
                                                {isScheduledDatePassed(payment.scheduledDate) && payment.status === 'pending' && (
                                                    <p className="text-xs text-yellow-600">⚠️ Ready to process</p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono">
                                            {formatCurrency(payment.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[200px] truncate" title={payment.description}>
                                                {payment.description}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p>{new Date(payment.scheduledDate).toLocaleDateString()}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(payment.scheduledDate).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(payment.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {payment.status === 'pending' && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleMarkAsCompleted(payment.id)}>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                Mark as Completed
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleMarkAsFailed(payment.id)}>
                                                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                                                Mark as Failed
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {payment.status !== 'pending' && (
                                                        <DropdownMenuItem onClick={() => handleMarkAsPending(payment.id)}>
                                                            <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                                                            Mark as Pending
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() => onDelete(payment.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {filteredPayments.length > 0 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-500">
                            Showing {filteredPayments.length} of {payments.length} payments
                        </p>
                        <div className="flex gap-4 text-sm">
              <span className="text-yellow-600">
                Pending: {payments.filter(p => p.status === 'pending').length}
              </span>
                            <span className="text-green-600">
                Completed: {payments.filter(p => p.status === 'completed').length}
              </span>
                            <span className="text-red-600">
                Failed: {payments.filter(p => p.status === 'failed').length}
              </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
