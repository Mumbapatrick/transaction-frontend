'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Users, Trash2, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import type { PaymentRecipient } from '@/types';
import { DEFAULT_CATEGORIES, DEFAULT_CURRENCIES } from '@/utils/data-store';
import { validateBatchRecipients, calculateBatchTotal } from '@/utils/mpesa-api';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BatchPaymentFormProps {
    onSubmit: (data: {
        recipients: PaymentRecipient[];
        amount: number;
        description: string;
        category: string;
        currency: string;
        scheduledDate: string;
    }) => void;
    onCancel?: () => void;
    contacts?: { id: string; name: string; phone: string }[];
}

export function BatchPaymentForm({ onSubmit, onCancel, contacts = [] }: BatchPaymentFormProps) {
    const [recipients, setRecipients] = useState<PaymentRecipient[]>([
        { id: '1', phone: '', name: '', amount: 0 }
    ]);
    const [splitType, setSplitType] = useState<'equal' | 'individual'>('individual');
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(DEFAULT_CATEGORIES[0].id);
    const [currency, setCurrency] = useState(DEFAULT_CURRENCIES[0].code);
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [errors, setErrors] = useState<string[]>([]);

    const addRecipient = () => {
        setRecipients([...recipients, {
            id: Date.now().toString(),
            phone: '',
            name: '',
            amount: splitType === 'equal' ? totalAmount / (recipients.length + 1) : 0
        }]);
    };

    const removeRecipient = (id: string) => {
        if (recipients.length > 1) {
            setRecipients(recipients.filter(r => r.id !== id));
        }
    };

    const updateRecipient = (id: string, field: keyof PaymentRecipient, value: string | number) => {
        setRecipients(recipients.map(r =>
            r.id === id ? { ...r, [field]: value } : r
        ));
    };

    const handleSplitTypeChange = (type: 'equal' | 'individual') => {
        setSplitType(type);
        if (type === 'equal' && totalAmount > 0) {
            const amountPerRecipient = totalAmount / recipients.length;
            setRecipients(recipients.map(r => ({ ...r, amount: amountPerRecipient })));
        }
    };

    const handleTotalAmountChange = (amount: number) => {
        setTotalAmount(amount);
        if (splitType === 'equal' && amount > 0) {
            const amountPerRecipient = amount / recipients.length;
            setRecipients(recipients.map(r => ({ ...r, amount: amountPerRecipient })));
        }
    };

    const calculateTotal = () => {
        return splitType === 'equal'
            ? totalAmount
            : recipients.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate recipients
        const validation = validateBatchRecipients(recipients);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        // Validate other fields
        const newErrors: string[] = [];

        if (!description.trim()) {
            newErrors.push('Description is required');
        }

        if (!scheduledDate) {
            newErrors.push('Scheduled date is required');
        } else {
            const selectedDate = new Date(`${scheduledDate}T${scheduledTime || '12:00'}`);
            if (selectedDate <= new Date()) {
                newErrors.push('Scheduled date must be in the future');
            }
        }

        const total = calculateTotal();
        if (total <= 0) {
            newErrors.push('Total amount must be greater than 0');
        }

        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors([]);

        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime || '12:00'}`);

        onSubmit({
            recipients: recipients.map(r => ({
                ...r,
                amount: splitType === 'equal' ? totalAmount / recipients.length : Number(r.amount) || 0
            })),
            amount: total,
            description,
            category,
            currency,
            scheduledDate: scheduledDateTime.toISOString(),
        });
    };

    const today = new Date().toISOString().split('T')[0];
    const selectedCategory = DEFAULT_CATEGORIES.find(c => c.id === category);

    return (
        <Card className="w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="relative sticky top-0 bg-white z-10 border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-600" />
                            Batch Payment - Multiple Recipients
                        </CardTitle>
                        <CardDescription>
                            Send payments to multiple recipients at once
                        </CardDescription>
                    </div>
                    {onCancel && (
                        <Button variant="ghost" size="sm" onClick={onCancel}>
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Display */}
                    {errors.length > 0 && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <ul className="list-disc list-inside">
                                    {errors.map((error, i) => <li key={i}>{error}</li>)}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Split Type Selection */}
                    <div className="space-y-2">
                        <Label>Payment Distribution</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={splitType === 'equal' ? 'default' : 'outline'}
                                onClick={() => handleSplitTypeChange('equal')}
                                className={splitType === 'equal' ? 'bg-green-600' : ''}
                            >
                                Equal Split
                            </Button>
                            <Button
                                type="button"
                                variant={splitType === 'individual' ? 'default' : 'outline'}
                                onClick={() => handleSplitTypeChange('individual')}
                                className={splitType === 'individual' ? 'bg-green-600' : ''}
                            >
                                Individual Amounts
                            </Button>
                        </div>
                    </div>

                    {/* Total Amount (for equal split) */}
                    {splitType === 'equal' && (
                        <div className="space-y-2">
                            <Label htmlFor="totalAmount">Total Amount to Split</Label>
                            <Input
                                id="totalAmount"
                                type="number"
                                min="1"
                                placeholder="Enter total amount"
                                value={totalAmount || ''}
                                onChange={(e) => handleTotalAmountChange(Number(e.target.value))}
                            />
                            <p className="text-xs text-gray-500">
                                Will be split equally among {recipients.length} recipient(s)
                                {totalAmount > 0 && ` (${currency} ${(totalAmount / recipients.length).toFixed(2)} each)`}
                            </p>
                        </div>
                    )}

                    {/* Recipients */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <Label>Recipients ({recipients.length})</Label>
                            <Button type="button" size="sm" variant="outline" onClick={addRecipient}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add Recipient
                            </Button>
                        </div>

                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {recipients.map((recipient, index) => (
                                <div key={recipient.id} className="p-3 border rounded-lg space-y-2">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-medium">Recipient {index + 1}</span>
                                        {recipients.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeRecipient(recipient.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <Input
                                            placeholder="Phone number"
                                            value={recipient.phone}
                                            onChange={(e) => updateRecipient(recipient.id, 'phone', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Name (optional)"
                                            value={recipient.name || ''}
                                            onChange={(e) => updateRecipient(recipient.id, 'name', e.target.value)}
                                        />
                                    </div>

                                    {splitType === 'individual' && (
                                        <Input
                                            type="number"
                                            placeholder="Amount"
                                            min="1"
                                            value={recipient.amount || ''}
                                            onChange={(e) => updateRecipient(recipient.id, 'amount', Number(e.target.value))}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Total Amount:</span>
                            <span className="text-xl font-bold text-green-600">
                {currency} {calculateTotal().toLocaleString()}
              </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            {recipients.length} recipient(s) • Average: {currency} {(calculateTotal() / recipients.length).toFixed(2)}
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="e.g., Monthly utilities payment, Staff salaries, etc."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Category & Currency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEFAULT_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEFAULT_CURRENCIES.map((curr) => (
                                        <SelectItem key={curr.code} value={curr.code}>
                                            {curr.code} - {curr.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Schedule Date & Time */}
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
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduledTime">Scheduled Time</Label>
                            <Input
                                id="scheduledTime"
                                type="time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t">
                        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Schedule Batch Payment
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
