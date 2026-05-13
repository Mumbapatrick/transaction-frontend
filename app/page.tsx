'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import {
    PlusCircle,
    Wallet,
    Users,
    Download,
    BarChart3,
    BookUser,
    TrendingUp,
    FileText,
    Bell,
    LayoutTemplate,
    PiggyBank,
} from 'lucide-react';

import { BatchPaymentForm } from '@/components/batch-payment-form';
import { ContactBook } from '@/components/contact-book';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { DashboardStats } from '@/components/dashboard-stats';
import { PaymentHistory } from '@/components/payment-history';
import { Toaster } from '@/components/ui/toaster';

import { useToast } from '@/hooks/use-toast';

import type {
    ScheduledPayment,
    Contact,
    PaymentRecipient,
    AppState,
} from '@/types';

import {
    dataStore,
    DEFAULT_CATEGORIES,
    DEFAULT_CURRENCIES,
} from '@/utils/data-store';

import { exportToCSV, exportToPDF } from '@/utils/export-utils';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================
// INITIAL STATE
// ============================================

const initialState: AppState =
    typeof window !== 'undefined'
        ? dataStore.loadData()
        : {
            payments: [],
            contacts: [],
            categories: DEFAULT_CATEGORIES,
            templates: [],
            budgets: [],
            currencies: DEFAULT_CURRENCIES,
            notifications: [],
            settings: {
                defaultCurrency: 'KES',
                notifications: {
                    email: true,
                    sms: true,
                    push: true,
                    paymentSuccess: true,
                    paymentFailure: true,
                    budgetAlerts: true,
                    recurringReminders: true,
                    lowBalance: true,
                },
                theme: 'light',
                language: 'en',
            },
        };

type ActiveTab =
    | 'dashboard'
    | 'payments'
    | 'contacts'
    | 'analytics';

export default function Home() {
    const [appData, setAppData] =
        useState<AppState>(initialState);

    const [showBatchForm, setShowBatchForm] =
        useState(false);

    const [activeTab, setActiveTab] =
        useState<ActiveTab>('dashboard');

    const { toast } = useToast();

    // ============================================
    // SAVE DATA
    // ============================================

    const updateAppData = (
        updater: (prev: AppState) => AppState
    ) => {
        setAppData((prev) => {
            const updated = updater(prev);

            dataStore.saveData(updated);

            return updated;
        });
    };

    // ============================================
    // COMPUTED VALUES
    // ============================================

    const pendingPayments = useMemo(() => {
        return appData.payments.filter(
            (payment) => payment.status === 'pending'
        ).length;
    }, [appData.payments]);

    const batchPayments = useMemo(() => {
        return appData.payments.filter(
            (payment) => payment.batchId
        ).length;
    }, [appData.payments]);

    const unreadNotifications = useMemo(() => {
        return appData.notifications.filter(
            (notification) => !notification.isRead
        ).length;
    }, [appData.notifications]);

    // ============================================
    // ACTIONS
    // ============================================

    const loadDemoData = () => {
        const demoData = dataStore.createDemoData();

        setAppData(demoData);

        dataStore.saveData(demoData);

        toast({
            title: 'Demo data loaded',
            description:
                'Sample payments and contacts added successfully.',
        });
    };

    const addPayment = (data: {
        recipients: PaymentRecipient[];
        amount: number;
        description: string;
        category: string;
        currency: string;
        scheduledDate: string;
    }) => {
        try {
            const selectedCategory =
                appData.categories.find(
                    (category) =>
                        category.id === data.category
                ) || DEFAULT_CATEGORIES[0];

            const selectedCurrency =
                appData.currencies.find(
                    (currency) =>
                        currency.code === data.currency
                ) || DEFAULT_CURRENCIES[0];

            const newPayment: ScheduledPayment = {
                id: crypto.randomUUID(),

                recipients: data.recipients.map(
                    (recipient) => ({
                        ...recipient,
                        id:
                            recipient.id ||
                            crypto.randomUUID(),
                    })
                ),

                amount: data.amount,

                description: data.description,

                category: selectedCategory,

                currency: selectedCurrency,

                scheduledDate: data.scheduledDate,

                status: 'pending',

                createdAt: new Date().toISOString(),

                isRecurring: false,

                batchId:
                    data.recipients.length > 1
                        ? `batch-${Date.now()}`
                        : undefined,
            };

            updateAppData((prev) =>
                dataStore.addPayment(prev, newPayment)
            );

            setShowBatchForm(false);

            toast({
                title: 'Payment created',
                description:
                    'Scheduled payment added successfully.',
            });
        } catch (error) {
            console.error(error);

            toast({
                title: 'Error',
                description:
                    'Failed to create payment.',
                variant: 'destructive',
            });
        }
    };

    const updatePaymentStatus = (
        id: string,
        status: ScheduledPayment['status']
    ) => {
        updateAppData((prev) =>
            dataStore.updatePayment(prev, id, {
                status,
            })
        );

        toast({
            title: 'Payment updated',
            description: `Payment marked as ${status}.`,
        });
    };

    const deletePayment = (id: string) => {
        updateAppData((prev) =>
            dataStore.deletePayment(prev, id)
        );

        toast({
            title: 'Payment deleted',
        });
    };

    const addContact = (
        contact: Omit<
            Contact,
            | 'id'
            | 'createdAt'
            | 'totalPayments'
            | 'totalAmount'
        >
    ) => {
        const newContact: Contact = {
            ...contact,

            id: crypto.randomUUID(),

            createdAt: new Date().toISOString(),

            totalPayments: 0,

            totalAmount: 0,
        };

        updateAppData((prev) =>
            dataStore.addContact(prev, newContact)
        );

        toast({
            title: 'Contact added',
        });
    };

    const updateContact = (
        id: string,
        updates: Partial<Contact>
    ) => {
        updateAppData((prev) =>
            dataStore.updateContact(
                prev,
                id,
                updates
            )
        );

        toast({
            title: 'Contact updated',
        });
    };

    const deleteContact = (id: string) => {
        updateAppData((prev) =>
            dataStore.deleteContact(prev, id)
        );

        toast({
            title: 'Contact deleted',
        });
    };

    // ============================================
    // UI
    // ============================================

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
                <div className="container mx-auto space-y-6 px-4 py-6">

                    {/* HEADER */}

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-green-800">
                                M-Pesa Scheduler Pro
                            </h1>

                            <p className="mt-1 text-sm text-green-700">
                                Smart payment scheduling, budgeting,
                                analytics & contact management
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">

                            {/* EXPORT */}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">

                                    <DropdownMenuItem
                                        onClick={() =>
                                            exportToCSV(
                                                appData.payments
                                            )
                                        }
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                        onClick={() =>
                                            exportToPDF(
                                                appData.payments
                                            )
                                        }
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Export PDF
                                    </DropdownMenuItem>

                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="outline"
                                onClick={loadDemoData}
                            >
                                Load Demo
                            </Button>

                            <Button
                                onClick={() =>
                                    setShowBatchForm(true)
                                }
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Payment
                            </Button>

                        </div>
                    </div>

                    {/* DASHBOARD STATS */}

                    <DashboardStats
                        payments={appData.payments}
                    />

                    {/* EMPTY STATE */}

                    {appData.payments.length === 0 && (
                        <Card className="border-green-200 bg-green-50/70">
                            <CardContent className="py-12 text-center">

                                <Wallet className="mx-auto mb-4 h-14 w-14 text-green-600" />

                                <h2 className="text-2xl font-bold text-green-800">
                                    Welcome to M-Pesa Scheduler Pro
                                </h2>

                                <p className="mx-auto mt-3 max-w-xl text-green-700">
                                    Manage scheduled payments,
                                    recurring transactions,
                                    budgeting and analytics from
                                    one centralized dashboard.
                                </p>

                                <div className="mt-6 flex flex-wrap justify-center gap-3">

                                    <Button
                                        variant="outline"
                                        onClick={
                                            loadDemoData
                                        }
                                    >
                                        Try Demo
                                    </Button>

                                    <Button
                                        onClick={() =>
                                            setShowBatchForm(
                                                true
                                            )
                                        }
                                    >
                                        Create Payment
                                    </Button>

                                </div>

                            </CardContent>
                        </Card>
                    )}

                    {/* NAVIGATION */}

                    <div className="flex justify-center">

                        <div className="flex flex-wrap items-center gap-2 rounded-2xl border bg-white p-2 shadow-sm">

                            {[
                                {
                                    id: 'dashboard',
                                    icon: BarChart3,
                                    label: 'Dashboard',
                                },
                                {
                                    id: 'payments',
                                    icon: Wallet,
                                    label: 'Payments',
                                },
                                {
                                    id: 'contacts',
                                    icon: BookUser,
                                    label: 'Contacts',
                                },
                                {
                                    id: 'analytics',
                                    icon: TrendingUp,
                                    label: 'Analytics',
                                },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() =>
                                        setActiveTab(
                                            tab.id as ActiveTab
                                        )
                                    }
                                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-green-600 text-white shadow'
                                            : 'text-green-700 hover:bg-green-50'
                                    }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}

                        </div>

                    </div>

                    {/* CONTENT */}

                    <div className="space-y-6">

                        {activeTab === 'dashboard' && (
                            <div className="space-y-6">

                                {/* QUICK ACTIONS */}

                                <Card>
                                    <CardContent className="p-6">

                                        <div className="mb-5 flex items-center justify-between">

                                            <h2 className="text-lg font-semibold">
                                                Quick Actions
                                            </h2>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">

                                                <Bell className="h-4 w-4" />

                                                <span>
                                                    {
                                                        unreadNotifications
                                                    }{' '}
                                                    unread notifications
                                                </span>

                                            </div>

                                        </div>

                                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setShowBatchForm(
                                                        true
                                                    )
                                                }
                                                className="justify-start"
                                            >
                                                <Users className="mr-2 h-4 w-4" />
                                                Batch Payment
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setActiveTab(
                                                        'payments'
                                                    )
                                                }
                                                className="justify-start"
                                            >
                                                <Wallet className="mr-2 h-4 w-4" />
                                                View Payments
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setActiveTab(
                                                        'contacts'
                                                    )
                                                }
                                                className="justify-start"
                                            >
                                                <BookUser className="mr-2 h-4 w-4" />
                                                Contacts
                                            </Button>

                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setActiveTab(
                                                        'analytics'
                                                    )
                                                }
                                                className="justify-start"
                                            >
                                                <TrendingUp className="mr-2 h-4 w-4" />
                                                Analytics
                                            </Button>

                                        </div>

                                    </CardContent>
                                </Card>

                                {/* OVERVIEW */}

                                <Card>
                                    <CardContent className="grid grid-cols-2 gap-4 p-6 text-center md:grid-cols-4">

                                        <div>
                                            <Wallet className="mx-auto mb-2 h-5 w-5 text-green-600" />

                                            <p className="text-sm text-muted-foreground">
                                                Total Payments
                                            </p>

                                            <h2 className="text-2xl font-bold text-green-700">
                                                {
                                                    appData
                                                        .payments
                                                        .length
                                                }
                                            </h2>
                                        </div>

                                        <div>
                                            <BookUser className="mx-auto mb-2 h-5 w-5 text-blue-600" />

                                            <p className="text-sm text-muted-foreground">
                                                Contacts
                                            </p>

                                            <h2 className="text-2xl font-bold text-blue-600">
                                                {
                                                    appData
                                                        .contacts
                                                        .length
                                                }
                                            </h2>
                                        </div>

                                        <div>
                                            <LayoutTemplate className="mx-auto mb-2 h-5 w-5 text-purple-600" />

                                            <p className="text-sm text-muted-foreground">
                                                Templates
                                            </p>

                                            <h2 className="text-2xl font-bold text-purple-600">
                                                {
                                                    appData
                                                        .templates
                                                        .length
                                                }
                                            </h2>
                                        </div>

                                        <div>
                                            <PiggyBank className="mx-auto mb-2 h-5 w-5 text-orange-600" />

                                            <p className="text-sm text-muted-foreground">
                                                Budgets
                                            </p>

                                            <h2 className="text-2xl font-bold text-orange-600">
                                                {
                                                    appData
                                                        .budgets
                                                        .length
                                                }
                                            </h2>
                                        </div>

                                    </CardContent>
                                </Card>

                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <PaymentHistory
                                payments={appData.payments}
                                onUpdateStatus={
                                    updatePaymentStatus
                                }
                                onDelete={deletePayment}
                            />
                        )}

                        {activeTab === 'contacts' && (
                            <ContactBook
                                contacts={appData.contacts}
                                onAddContact={addContact}
                                onUpdateContact={
                                    updateContact
                                }
                                onDeleteContact={
                                    deleteContact
                                }
                            />
                        )}

                        {activeTab === 'analytics' && (
                            <AnalyticsDashboard
                                payments={appData.payments}
                                categories={
                                    appData.categories
                                }
                            />
                        )}

                    </div>

                </div>

                {/* MODAL */}

                {showBatchForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

                        <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">

                            <BatchPaymentForm
                                onSubmit={addPayment}
                                onCancel={() =>
                                    setShowBatchForm(
                                        false
                                    )
                                }
                                contacts={
                                    appData.contacts
                                }
                            />

                        </div>

                    </div>
                )}
            </div>

            <Toaster />
        </>
    );
}