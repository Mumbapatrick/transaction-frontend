// Core Payment Types
export interface ScheduledPayment {
    id: string;
    recipients: PaymentRecipient[]; // Support for multiple recipients
    amount: number;
    description: string;
    category: PaymentCategory;
    currency: Currency;
    scheduledDate: string;
    status: 'pending' | 'completed' | 'failed' | 'processing';
    createdAt: string;
    isRecurring: boolean;
    recurringConfig?: RecurringConfig;
    templateId?: string;
    batchId?: string; // For grouping batch payments
    transactionIds?: string[]; // Multiple transaction IDs for batch
    notes?: string;
}

export interface PaymentRecipient {
    id: string;
    phone: string;
    name?: string;
    amount?: number; // Individual amount for batch payments
    status?: 'pending' | 'completed' | 'failed' | 'processing';
    transactionId?: string;
}

// Contact Management
export interface Contact {
    id: string;
    name: string;
    phone: string;
    category: ContactCategory;
    notes?: string;
    createdAt: string;
    lastUsed?: string;
    totalPayments: number;
    totalAmount: number;
}

export interface ContactCategory {
    id: string;
    name: string;
    color: string;
    icon: string;
}

// Payment Categories & Budgeting
export interface PaymentCategory {
    id: string;
    name: string;
    color: string;
    icon: string;
    budget?: number;
    spent: number;
    description?: string;
}

export interface Budget {
    id: string;
    categoryId: string;
    amount: number;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    endDate: string;
    spent: number;
    alerts: BudgetAlert[];
}

export interface BudgetAlert {
    percentage: number; // Alert when spent percentage reached
    triggered: boolean;
    triggeredAt?: string;
}

// Recurring Payments
export interface RecurringConfig {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval: number; // Every X days/weeks/months
    endDate?: string;
    maxOccurrences?: number;
    occurrences: number;
    lastExecuted?: string;
    nextExecution: string;
    isActive: boolean;
}

// Payment Templates
export interface PaymentTemplate {
    id: string;
    name: string;
    description?: string;
    recipients: PaymentRecipient[];
    amount: number;
    category: PaymentCategory;
    currency: Currency;
    isRecurring: boolean;
    recurringConfig?: RecurringConfig;
    icon: string;
    color: string;
    createdAt: string;
    lastUsed?: string;
    usageCount: number;
}

// Multi-currency Support
export interface Currency {
    code: string; // KES, USD, EUR, etc.
    symbol: string; // KSh, $, €, etc.
    name: string;
    rate: number; // Exchange rate to base currency (KES)
}

export interface ExchangeRate {
    from: string;
    to: string;
    rate: number;
    timestamp: string;
}

// Analytics & Reporting
export interface PaymentAnalytics {
    totalPayments: number;
    totalAmount: number;
    successRate: number;
    averageAmount: number;
    topCategories: CategorySpending[];
    monthlyTrends: MonthlyTrend[];
    dailyActivity: DailyActivity[];
    topRecipients: RecipientActivity[];
}

export interface CategorySpending {
    category: PaymentCategory;
    amount: number;
    count: number;
    percentage: number;
}

export interface MonthlyTrend {
    month: string;
    year: number;
    amount: number;
    count: number;
    categories: { [categoryId: string]: number };
}

export interface DailyActivity {
    date: string;
    amount: number;
    count: number;
}

export interface RecipientActivity {
    contact: Contact;
    amount: number;
    count: number;
    lastPayment: string;
}

// Notifications
export interface Notification {
    id: string;
    type: 'payment_success' | 'payment_failed' | 'budget_alert' | 'recurring_reminder' | 'low_balance';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    data?: unknown; // Additional data specific to notification type
}

export interface NotificationSettings {
    email: boolean;
    sms: boolean;
    push: boolean;
    paymentSuccess: boolean;
    paymentFailure: boolean;
    budgetAlerts: boolean;
    recurringReminders: boolean;
    lowBalance: boolean;
}

// Export/Import
export interface ExportOptions {
    format: 'csv' | 'pdf' | 'excel';
    dateRange: {
        start: string;
        end: string;
    };
    categories?: string[];
    status?: ('pending' | 'completed' | 'failed')[];
    includeAnalytics: boolean;
}

// App State
export interface AppState {
    payments: ScheduledPayment[];
    contacts: Contact[];
    categories: PaymentCategory[];
    templates: PaymentTemplate[];
    budgets: Budget[];
    currencies: Currency[];
    notifications: Notification[];
    settings: {
        defaultCurrency: string;
        notifications: NotificationSettings;
        theme: 'light' | 'dark';
        language: string;
    };
}

// Form Types
export interface BatchPaymentForm {
    recipients: { phone: string; name?: string; amount?: number }[];
    totalAmount: number;
    description: string;
    category: string;
    currency: string;
    scheduledDate: string;
    scheduledTime: string;
    splitType: 'equal' | 'individual';
}

export interface RecurringPaymentForm extends Omit<ScheduledPayment, 'id' | 'status' | 'createdAt'> {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    interval: number;
    endDate?: string;
    maxOccurrences?: number;
}

// API Response Types
export interface BatchMpesaResponse {
    batchId: string;
    success: boolean;
    message: string;
    results: {
        recipient: string;
        success: boolean;
        transactionId?: string;
        message: string;
        errorCode?: string;
    }[];
}
