import {
    type ScheduledPayment,
    type Contact,
    type PaymentCategory,
    type PaymentTemplate,
    type Budget,
    type Currency,
    type Notification,
    type AppState,
    type ContactCategory,
    RecurringConfig
} from '@/types';

// Default categories
export const DEFAULT_CATEGORIES: PaymentCategory[] = [
    { id: 'rent', name: 'Rent & Housing', color: 'bg-blue-500', icon: '🏠', budget: 0, spent: 0 },
    { id: 'utilities', name: 'Utilities', color: 'bg-yellow-500', icon: '⚡', budget: 0, spent: 0 },
    { id: 'food', name: 'Food & Dining', color: 'bg-green-500', icon: '🍽️', budget: 0, spent: 0 },
    { id: 'transport', name: 'Transport', color: 'bg-purple-500', icon: '🚗', budget: 0, spent: 0 },
    { id: 'health', name: 'Healthcare', color: 'bg-red-500', icon: '🏥', budget: 0, spent: 0 },
    { id: 'education', name: 'Education', color: 'bg-indigo-500', icon: '📚', budget: 0, spent: 0 },
    { id: 'entertainment', name: 'Entertainment', color: 'bg-pink-500', icon: '🎬', budget: 0, spent: 0 },
    { id: 'shopping', name: 'Shopping', color: 'bg-orange-500', icon: '🛍️', budget: 0, spent: 0 },
    { id: 'family', name: 'Family & Friends', color: 'bg-teal-500', icon: '👨‍👩‍👧‍👦', budget: 0, spent: 0 },
    { id: 'business', name: 'Business', color: 'bg-gray-500', icon: '💼', budget: 0, spent: 0 },
    { id: 'savings', name: 'Savings & Investment', color: 'bg-emerald-500', icon: '💰', budget: 0, spent: 0 },
    { id: 'other', name: 'Other', color: 'bg-slate-500', icon: '📝', budget: 0, spent: 0 },
];

// Default contact categories
export const DEFAULT_CONTACT_CATEGORIES: ContactCategory[] = [
    { id: 'family', name: 'Family', color: 'bg-pink-500', icon: '👨‍👩‍👧‍👦' },
    { id: 'friends', name: 'Friends', color: 'bg-blue-500', icon: '👥' },
    { id: 'business', name: 'Business', color: 'bg-gray-500', icon: '💼' },
    { id: 'services', name: 'Services', color: 'bg-green-500', icon: '🔧' },
    { id: 'vendors', name: 'Vendors', color: 'bg-orange-500', icon: '🏪' },
    { id: 'other', name: 'Other', color: 'bg-slate-500', icon: '📞' },
];

// Supported currencies
export const DEFAULT_CURRENCIES: Currency[] = [
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rate: 1 },
    { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.0067 },
    { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.0061 },
    { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.0052 },
    { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', rate: 25.2 },
    { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', rate: 15.8 },
];

// Payment templates
export const DEFAULT_TEMPLATES: PaymentTemplate[] = [
    {
        id: 'rent-template',
        name: 'Monthly Rent Payment',
        description: 'Standard monthly rent payment to landlord',
        recipients: [],
        amount: 0,
        category: DEFAULT_CATEGORIES[0],
        currency: DEFAULT_CURRENCIES[0],
        isRecurring: true,
        recurringConfig: {
            frequency: 'monthly',
            interval: 1,
            occurrences: 0,
            nextExecution: '',
            isActive: true
        },
        icon: '🏠',
        color: 'bg-blue-500',
        createdAt: new Date().toISOString(),
        usageCount: 0
    },
    {
        id: 'electricity-template',
        name: 'Electricity Bill',
        description: 'Monthly electricity bill payment',
        recipients: [],
        amount: 0,
        category: DEFAULT_CATEGORIES[1],
        currency: DEFAULT_CURRENCIES[0],
        isRecurring: true,
        recurringConfig: {
            frequency: 'monthly',
            interval: 1,
            occurrences: 0,
            nextExecution: '',
            isActive: true
        },
        icon: '⚡',
        color: 'bg-yellow-500',
        createdAt: new Date().toISOString(),
        usageCount: 0
    },
    {
        id: 'school-fees-template',
        name: 'School Fees',
        description: 'Quarterly school fees payment',
        recipients: [],
        amount: 0,
        category: DEFAULT_CATEGORIES[5],
        currency: DEFAULT_CURRENCIES[0],
        isRecurring: true,
        recurringConfig: {
            frequency: 'quarterly',
            interval: 1,
            occurrences: 0,
            nextExecution: '',
            isActive: true
        },
        icon: '📚',
        color: 'bg-indigo-500',
        createdAt: new Date().toISOString(),
        usageCount: 0
    },
];

class DataStore {
    private storageKey = 'mpesa-scheduler-data';

    // Get default state
    private getDefaultState(): AppState {
        return {
            payments: [],
            contacts: [],
            categories: DEFAULT_CATEGORIES,
            templates: DEFAULT_TEMPLATES,
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
            }
        };
    }

    // Load all data from localStorage
    loadData(): AppState {
        // Check if running in browser
        if (typeof window === 'undefined') {
            return this.getDefaultState();
        }

        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                return {
                    payments: data.payments || [],
                    contacts: data.contacts || [],
                    categories: data.categories || DEFAULT_CATEGORIES,
                    templates: data.templates || DEFAULT_TEMPLATES,
                    budgets: data.budgets || [],
                    currencies: data.currencies || DEFAULT_CURRENCIES,
                    notifications: data.notifications || [],
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
                        ...data.settings
                    }
                };
            }
        } catch (error) {
            console.error('Failed to load data from localStorage:', error);
        }

        // Return default data if loading fails
        return this.getDefaultState();
    }

    // Save all data to localStorage
    saveData(data: AppState): void {
        // Check if running in browser
        if (typeof window === 'undefined') {
            return;
        }

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save data to localStorage:', error);
        }
    }

    // Payment operations
    addPayment(data: AppState, payment: ScheduledPayment): AppState {
        const newData = {
            ...data,
            payments: [payment, ...data.payments]
        };
        this.saveData(newData);
        return newData;
    }

    updatePayment(data: AppState, id: string, updates: Partial<ScheduledPayment>): AppState {
        const newData = {
            ...data,
            payments: data.payments.map(p => p.id === id ? { ...p, ...updates } : p)
        };
        this.saveData(newData);
        return newData;
    }

    deletePayment(data: AppState, id: string): AppState {
        const newData = {
            ...data,
            payments: data.payments.filter(p => p.id !== id)
        };
        this.saveData(newData);
        return newData;
    }

    // Contact operations
    addContact(data: AppState, contact: Contact): AppState {
        const newData = {
            ...data,
            contacts: [contact, ...data.contacts]
        };
        this.saveData(newData);
        return newData;
    }

    updateContact(data: AppState, id: string, updates: Partial<Contact>): AppState {
        const newData = {
            ...data,
            contacts: data.contacts.map(c => c.id === id ? { ...c, ...updates } : c)
        };
        this.saveData(newData);
        return newData;
    }

    deleteContact(data: AppState, id: string): AppState {
        const newData = {
            ...data,
            contacts: data.contacts.filter(c => c.id !== id)
        };
        this.saveData(newData);
        return newData;
    }

    // Template operations
    addTemplate(data: AppState, template: PaymentTemplate): AppState {
        const newData = {
            ...data,
            templates: [template, ...data.templates]
        };
        this.saveData(newData);
        return newData;
    }

    updateTemplate(data: AppState, id: string, updates: Partial<PaymentTemplate>): AppState {
        const newData = {
            ...data,
            templates: data.templates.map(t => t.id === id ? { ...t, ...updates } : t)
        };
        this.saveData(newData);
        return newData;
    }

    deleteTemplate(data: AppState, id: string): AppState {
        const newData = {
            ...data,
            templates: data.templates.filter(t => t.id !== id)
        };
        this.saveData(newData);
        return newData;
    }

    // Budget operations
    addBudget(data: AppState, budget: Budget): AppState {
        const newData = {
            ...data,
            budgets: [budget, ...data.budgets]
        };
        this.saveData(newData);
        return newData;
    }

    updateBudget(data: AppState, id: string, updates: Partial<Budget>): AppState {
        const newData = {
            ...data,
            budgets: data.budgets.map(b => b.id === id ? { ...b, ...updates } : b)
        };
        this.saveData(newData);
        return newData;
    }

    // Notification operations
    addNotification(data: AppState, notification: Notification): AppState {
        const newData = {
            ...data,
            notifications: [notification, ...data.notifications.slice(0, 49)] // Keep max 50 notifications
        };
        this.saveData(newData);
        return newData;
    }

    markNotificationRead(data: AppState, id: string): AppState {
        const newData = {
            ...data,
            notifications: data.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
        };
        this.saveData(newData);
        return newData;
    }

    // Demo data creation
    createDemoData(): AppState {
        const now = new Date();
        const oneMinuteFromNow = new Date(now.getTime() + 60 * 1000);
        const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000);

        const demoContacts: Contact[] = [
            {
                id: 'contact-1',
                name: 'John Landlord',
                phone: '0712345678',
                category: DEFAULT_CONTACT_CATEGORIES[3], // Services
                notes: 'Monthly rent payments',
                createdAt: now.toISOString(),
                totalPayments: 12,
                totalAmount: 300000
            },
            {
                id: 'contact-2',
                name: 'Kenya Power',
                phone: '0798765432',
                category: DEFAULT_CONTACT_CATEGORIES[3], // Services
                notes: 'Electricity bill payments',
                createdAt: now.toISOString(),
                totalPayments: 8,
                totalAmount: 12000
            }
        ];

        const demoPayments: ScheduledPayment[] = [
            {
                id: 'demo-1',
                recipients: [{ id: 'r1', phone: '0712345678', name: 'John Landlord' }],
                amount: 25000,
                description: 'Monthly rent payment',
                category: DEFAULT_CATEGORIES[0], // Rent
                currency: DEFAULT_CURRENCIES[0], // KES
                scheduledDate: oneMinuteFromNow.toISOString(),
                status: 'pending',
                createdAt: now.toISOString(),
                isRecurring: true,
                recurringConfig: {
                    frequency: 'monthly',
                    interval: 1,
                    occurrences: 1,
                    nextExecution: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    isActive: true
                }
            },
            {
                id: 'demo-2',
                recipients: [
                    { id: 'r2', phone: '0798765432', name: 'Kenya Power', amount: 800 },
                    { id: 'r3', phone: '0723456789', name: 'Nairobi Water', amount: 500 },
                    { id: 'r4', phone: '0734567890', name: 'Safaricom', amount: 1200 }
                ],
                amount: 2500,
                description: 'Monthly utility bills - Batch payment',
                category: DEFAULT_CATEGORIES[1], // Utilities
                currency: DEFAULT_CURRENCIES[0],
                scheduledDate: twoMinutesFromNow.toISOString(),
                status: 'pending',
                createdAt: now.toISOString(),
                isRecurring: false,
                batchId: 'batch-utilities-' + Date.now()
            }
        ];

        const demoNotifications: Notification[] = [
            {
                id: 'notif-1',
                type: 'recurring_reminder',
                title: 'Recurring Payment Due',
                message: 'Your monthly rent payment is scheduled for today',
                isRead: false,
                createdAt: now.toISOString()
            }
        ];

        return {
            payments: demoPayments,
            contacts: demoContacts,
            categories: DEFAULT_CATEGORIES,
            templates: DEFAULT_TEMPLATES,
            budgets: [],
            currencies: DEFAULT_CURRENCIES,
            notifications: demoNotifications,
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
            }
        };
    }

    // Clear all data
    clearData(): AppState {
        const defaultData = this.getDefaultState();
        this.saveData(defaultData);
        return defaultData;
    }
}

export const dataStore = new DataStore();
