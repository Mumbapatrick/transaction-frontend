'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Wallet, Users, Download, BarChart3, BookUser, FileText, TrendingUp } from 'lucide-react';
import { BatchPaymentForm } from '@/components/batch-payment-form';
import { ContactBook } from '@/components/contact-book';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { DashboardStats } from '@/components/dashboard-stats';
import { PaymentHistory } from '@/components/payment-history';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import type { ScheduledPayment, Contact, PaymentRecipient, AppState } from '@/types';
import { dataStore, DEFAULT_CATEGORIES, DEFAULT_CURRENCIES, DEFAULT_CONTACT_CATEGORIES } from '@/utils/data-store';
import { processBatchMpesaPayment } from '@/utils/mpesa-api';
import { exportToCSV, exportToPDF, generateReceipt } from '@/utils/export-utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Home() {
    const [appData, setAppData] = useState<AppState>(dataStore.loadData());
    const [showBatchForm, setShowBatchForm] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const { toast } = useToast();

    // Save data whenever it changes
    useEffect(() => {
        dataStore.saveData(appData);
    }, [appData]);

    // Load demo data
    const loadDemoData = () => {
        const demoData = dataStore.createDemoData();
        setAppData(demoData);
        toast({
            title: 'Demo Data Loaded',
            description: 'Sample payments and contacts have been added',
        });
    };

    // Clear all data
    const clearAllData = () => {
        const clearedData = dataStore.clearData();
        setAppData(clearedData);
        toast({
            title: 'Data Cleared',
            description: 'All payments and contacts have been removed',
            variant: 'destructive',
        });
    };

    // Add payment (batch or single)
    const addPayment = (data: {
        recipients: PaymentRecipient[];
        amount: number;
        description: string;
        category: string;
        currency: string;
        scheduledDate: string;
    }) => {
        const category = DEFAULT_CATEGORIES.find(c => c.id === data.category) || DEFAULT_CATEGORIES[0];
        const currency = DEFAULT_CURRENCIES.find(c => c.code === data.currency) || DEFAULT_CURRENCIES[0];

        const newPayment: ScheduledPayment = {
            id: Math.random().toString(36).substr(2, 9),
            recipients: data.recipients.map(r => ({
                ...r,
                id: r.id || Math.random().toString(36).substr(2, 9)
            })),
            amount: data.amount,
            description: data.description,
            category,
            currency,
            scheduledDate: data.scheduledDate,
            status: 'pending',
            createdAt: new Date().toISOString(),
            isRecurring: false,
            batchId: data.recipients.length > 1 ? `batch-${Date.now()}` : undefined
        };

        const updatedData = dataStore.addPayment(appData, newPayment);
        setAppData(updatedData);
        setShowBatchForm(false);

        // Update contact usage stats
        data.recipients.forEach(recipient => {
            const existingContact = appData.contacts.find(c => c.phone === recipient.phone);
            if (existingContact) {
                const updatedContact = {
                    ...existingContact,
                    totalPayments: existingContact.totalPayments + 1,
                    totalAmount: existingContact.totalAmount + (recipient.amount || data.amount / data.recipients.length),
                    lastUsed: new Date().toISOString()
                };
                setAppData(dataStore.updateContact(appData, existingContact.id, updatedContact));
            }
        });

        toast({
            title: 'Payment Scheduled',
            description: data.recipients.length > 1
                ? `Batch payment to ${data.recipients.length} recipients scheduled successfully`
                : `Payment to ${data.recipients[0].name || data.recipients[0].phone} scheduled successfully`,
        });
    };

    // Update payment status
    const updatePaymentStatus = (id: string, status: ScheduledPayment['status']) => {
        const updatedData = dataStore.updatePayment(appData, id, { status });
        setAppData(updatedData);
    };

    // Delete payment
    const deletePayment = (id: string) => {
        const updatedData = dataStore.deletePayment(appData, id);
        setAppData(updatedData);
        toast({
            title: 'Payment Deleted',
            description: 'The scheduled payment has been removed',
        });
    };

    // Process batch payment manually
    const manualProcessPayment = async (paymentId: string) => {
        const payment = appData.payments.find(p => p.id === paymentId);
        if (!payment || payment.status !== 'pending') return;

        updatePaymentStatus(paymentId, 'processing');

        toast({
            title: 'Processing Payment',
            description: `Processing payment to ${payment.recipients.length} recipient(s)...`,
        });

        try {
            const response = await processBatchMpesaPayment({
                recipients: payment.recipients,
                description: payment.description,
                currency: payment.currency.code
            });

            const updatedPayment: Partial<ScheduledPayment> = {
                status: response.success ? 'completed' : 'failed',
                transactionIds: response.results.filter(r => r.transactionId).map(r => r.transactionId!),
                recipients: payment.recipients.map(recipient => {
                    const result = response.results.find(r => r.recipient === recipient.phone);
                    return {
                        ...recipient,
                        status: result?.success ? 'completed' : 'failed',
                        transactionId: result?.transactionId
                    };
                })
            };

            const finalData = dataStore.updatePayment(appData, paymentId, updatedPayment);
            setAppData(finalData);

            toast({
                title: response.success ? 'Payment Successful' : 'Payment Completed with Issues',
                description: response.message,
                variant: response.success ? 'default' : 'destructive',
            });
        } catch (error) {
            updatePaymentStatus(paymentId, 'failed');
            toast({
                title: 'Payment Error',
                description: 'An unexpected error occurred while processing the payment',
                variant: 'destructive',
            });
        }
    };

    // Contact management
    const addContact = (contact: Omit<Contact, 'id' | 'createdAt' | 'totalPayments' | 'totalAmount'>) => {
        const newContact: Contact = {
            ...contact,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            totalPayments: 0,
            totalAmount: 0
        };
        const updatedData = dataStore.addContact(appData, newContact);
        setAppData(updatedData);
        toast({
            title: 'Contact Added',
            description: `${contact.name} has been added to your contact book`,
        });
    };

    const updateContact = (id: string, updates: Partial<Contact>) => {
        const updatedData = dataStore.updateContact(appData, id, updates);
        setAppData(updatedData);
        toast({
            title: 'Contact Updated',
            description: 'Contact information has been updated',
        });
    };

    const deleteContact = (id: string) => {
        const updatedData = dataStore.deleteContact(appData, id);
        setAppData(updatedData);
        toast({
            title: 'Contact Deleted',
            description: 'The contact has been removed',
        });
    };

    // Export functions
    const handleExportCSV = () => {
        exportToCSV(appData.payments);
        toast({
            title: 'Export Successful',
            description: 'Payment history exported to CSV',
        });
    };

    const handleExportPDF = () => {
        exportToPDF(appData.payments);
        toast({
            title: 'Export Successful',
            description: 'Payment report generated',
        });
    };

    const handleGenerateReceipt = (payment: ScheduledPayment) => {
        generateReceipt(payment);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
            <div className="container mx-auto p-6">
                <div className="flex flex-col space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-green-800">M-Pesa Scheduler Pro</h1>
                            <p className="text-green-600 mt-1">Advanced payment scheduling with batch processing</p>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="text-green-600 border-green-600">
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={handleExportCSV}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Export to CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExportPDF}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Export to PDF
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="outline"
                                onClick={loadDemoData}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                                Load Demo
                            </Button>

                            <Button
                                onClick={() => setShowBatchForm(true)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <PlusCircle className="w-4 h-4 mr-2" />
                                New Payment
                            </Button>
                        </div>
                    </div>

                    {/* Dashboard Stats */}
                    <DashboardStats payments={appData.payments} />

                    {/* Welcome Message for Empty State */}
                    {appData.payments.length === 0 && (
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="text-center py-8">
                                <div className="max-w-md mx-auto">
                                    <Wallet className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                                        Welcome to M-Pesa Scheduler Pro!
                                    </h3>
                                    <p className="text-green-600 mb-4">
                                        Schedule payments, manage contacts, track analytics, and send batch payments to multiple recipients.
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <Button onClick={loadDemoData} variant="outline">
                                            Try Demo Data
                                        </Button>
                                        <Button onClick={() => setShowBatchForm(true)}>
                                            Schedule First Payment
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Main Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
                            <TabsTrigger value="dashboard">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Dashboard
                            </TabsTrigger>
                            <TabsTrigger value="payments">
                                <Wallet className="w-4 h-4 mr-2" />
                                Payments
                            </TabsTrigger>
                            <TabsTrigger value="contacts">
                                <BookUser className="w-4 h-4 mr-2" />
                                Contacts
                            </TabsTrigger>
                            <TabsTrigger value="analytics">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Analytics
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="dashboard" className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-3">
                                <Card className="md:col-span-2">
                                    <CardContent className="pt-6">
                                        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-blue-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Total Payments</p>
                                                <p className="text-2xl font-bold text-blue-600">{appData.payments.length}</p>
                                            </div>
                                            <div className="p-4 bg-green-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Contacts</p>
                                                <p className="text-2xl font-bold text-green-600">{appData.contacts.length}</p>
                                            </div>
                                            <div className="p-4 bg-yellow-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Pending</p>
                                                <p className="text-2xl font-bold text-yellow-600">
                                                    {appData.payments.filter(p => p.status === 'pending').length}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-purple-50 rounded-lg">
                                                <p className="text-sm text-gray-600">Batch Payments</p>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {appData.payments.filter(p => p.batchId).length}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                        <div className="space-y-2">
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() => setShowBatchForm(true)}
                                            >
                                                <Users className="w-4 h-4 mr-2" />
                                                Batch Payment
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() => setActiveTab('contacts')}
                                            >
                                                <BookUser className="w-4 h-4 mr-2" />
                                                Manage Contacts
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start"
                                                onClick={() => setActiveTab('analytics')}
                                            >
                                                <BarChart3 className="w-4 h-4 mr-2" />
                                                View Analytics
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="payments">
                            <PaymentHistory
                                payments={appData.payments}
                                onUpdateStatus={updatePaymentStatus}
                                onDelete={deletePayment}
                            />
                        </TabsContent>

                        <TabsContent value="contacts">
                            <ContactBook
                                contacts={appData.contacts}
                                onAddContact={addContact}
                                onUpdateContact={updateContact}
                                onDeleteContact={deleteContact}
                            />
                        </TabsContent>

                        <TabsContent value="analytics">
                            <AnalyticsDashboard
                                payments={appData.payments}
                                categories={appData.categories}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Batch Payment Dialog */}
            {showBatchForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg w-full max-w-3xl my-8">
                        <BatchPaymentForm
                            onSubmit={addPayment}
                            onCancel={() => setShowBatchForm(false)}
                            contacts={appData.contacts}
                        />
                    </div>
                </div>
            )}

            <Toaster />
        </div>
    );
}