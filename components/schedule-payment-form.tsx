'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Calendar, Phone, DollarSign } from 'lucide-react';

interface SchedulePaymentFormProps {
    onSubmit: (payment: {
        recipient: string;
        amount: number;
        description: string;
        scheduledDate: string;
    }) => void;
    onCancel?: () => void;
}

export function SchedulePaymentForm({ onSubmit, onCancel }: SchedulePaymentFormProps) {
    const [formData, setFormData] = useState({
        recipient: '',
        amount: '',
        description: '',
        scheduledDate: '',
        scheduledTime: '',
        frequency: 'once',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.recipient) {
            newErrors.recipient = 'Phone number is required';
        } else if (!/^(254|0)[17]\d{8}$/.test(formData.recipient.replace(/\s+/g, ''))) {
            newErrors.recipient = 'Please enter a valid Kenyan phone number';
        }

        if (!formData.amount || Number(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        } else if (Number(formData.amount) < 1) {
            newErrors.amount = 'Minimum amount is KES 1';
        } else if (Number(formData.amount) > 300000) {
            newErrors.amount = 'Maximum amount is KES 300,000';
        }

        if (!formData.description) {
            newErrors.description = 'Description is required';
        }

        if (!formData.scheduledDate) {
            newErrors.scheduledDate = 'Scheduled date is required';
        } else {
            const selectedDate = new Date(formData.scheduledDate + 'T' + (formData.scheduledTime || '12:00'));
            if (selectedDate <= new Date()) {
                newErrors.scheduledDate = 'Scheduled date must be in the future';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const scheduledDateTime = new Date(formData.scheduledDate + 'T' + (formData.scheduledTime || '12:00'));

        onSubmit({
            recipient: formData.recipient,
            amount: Number(formData.amount),
            description: formData.description,
            scheduledDate: scheduledDateTime.toISOString(),
        });

        // Reset form
        setFormData({
            recipient: '',
            amount: '',
            description: '',
            scheduledDate: '',
            scheduledTime: '',
            frequency: 'once',
        });
        setErrors({});
    };

    const formatPhoneNumber = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');

        // Format as Kenyan phone number
        if (digits.startsWith('254')) {
            return digits.replace(/(\d{3})(\d{1})(\d{8})/, '$1 $2 $3');
        } else if (digits.startsWith('0')) {
            return digits.replace(/(\d{1})(\d{1})(\d{8})/, '$1$2 $3');
        }

        return digits;
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <Card className="w-full">
            <CardHeader className="relative">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Schedule M-Pesa Payment
                        </CardTitle>
                        <CardDescription>
                            Set up automatic payments to be sent at your preferred time
                        </CardDescription>
                    </div>
                    {onCancel && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            className="absolute top-4 right-4"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="recipient" className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Recipient Phone Number
                        </Label>
                        <Input
                            id="recipient"
                            type="tel"
                            placeholder="e.g., 0712 345678 or 254712345678"
                            value={formData.recipient}
                            onChange={(e) => {
                                const formatted = formatPhoneNumber(e.target.value);
                                setFormData(prev => ({ ...prev, recipient: formatted }));
                                if (errors.recipient) {
                                    setErrors(prev => ({ ...prev, recipient: '' }));
                                }
                            }}
                            className={errors.recipient ? 'border-red-500' : ''}
                        />
                        {errors.recipient && (
                            <p className="text-sm text-red-500">{errors.recipient}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount (KES)</Label>
                        <Input
                            id="amount"
                            type="number"
                            min="1"
                            max="300000"
                            placeholder="Enter amount"
                            value={formData.amount}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, amount: e.target.value }));
                                if (errors.amount) {
                                    setErrors(prev => ({ ...prev, amount: '' }));
                                }
                            }}
                            className={errors.amount ? 'border-red-500' : ''}
                        />
                        {errors.amount && (
                            <p className="text-sm text-red-500">{errors.amount}</p>
                        )}
                        <p className="text-xs text-gray-500">
                            Transaction limit: KES 1 - KES 300,000
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="e.g., Rent payment, School fees, etc."
                            value={formData.description}
                            onChange={(e) => {
                                setFormData(prev => ({ ...prev, description: e.target.value }));
                                if (errors.description) {
                                    setErrors(prev => ({ ...prev, description: '' }));
                                }
                            }}
                            className={errors.description ? 'border-red-500' : ''}
                        />
                        {errors.description && (
                            <p className="text-sm text-red-500">{errors.description}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="scheduledDate" className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Scheduled Date
                            </Label>
                            <Input
                                id="scheduledDate"
                                type="date"
                                min={today}
                                value={formData.scheduledDate}
                                onChange={(e) => {
                                    setFormData(prev => ({ ...prev, scheduledDate: e.target.value }));
                                    if (errors.scheduledDate) {
                                        setErrors(prev => ({ ...prev, scheduledDate: '' }));
                                    }
                                }}
                                className={errors.scheduledDate ? 'border-red-500' : ''}
                            />
                            {errors.scheduledDate && (
                                <p className="text-sm text-red-500">{errors.scheduledDate}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduledTime">Scheduled Time</Label>
                            <Input
                                id="scheduledTime"
                                type="time"
                                value={formData.scheduledTime}
                                onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                            />
                            <p className="text-xs text-gray-500">
                                Optional - defaults to 12:00 PM
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="frequency">Payment Frequency</Label>
                        <Select
                            value={formData.frequency}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="once">One-time payment</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                            Schedule Payment
                        </Button>
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
