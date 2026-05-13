import { type BatchMpesaResponse, type PaymentRecipient, Currency } from '@/types';

// M-Pesa API Simulation with Batch Payment Support
// In a real application, this would interact with the actual M-Pesa API

export interface MpesaResponse {
    success: boolean;
    transactionId?: string;
    message: string;
    errorCode?: string;
}

export interface PaymentRequest {
    recipient: string;
    amount: number;
    description: string;
    currency?: string;
}

export interface BatchPaymentRequest {
    recipients: PaymentRecipient[];
    description: string;
    currency?: string;
}

// Simulate common M-Pesa error scenarios
const errorScenarios = [
    { code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds in your M-Pesa account', probability: 0.05 },
    { code: 'INVALID_RECIPIENT', message: 'Invalid recipient phone number', probability: 0.02 },
    { code: 'NETWORK_ERROR', message: 'Network error. Please try again later', probability: 0.02 },
    { code: 'DAILY_LIMIT_EXCEEDED', message: 'Daily transaction limit exceeded', probability: 0.01 },
    { code: 'RECIPIENT_LIMIT_EXCEEDED', message: 'Recipient daily limit exceeded', probability: 0.01 },
];

// Simulate realistic transaction processing times
const getProcessingDelay = (amount: number): number => {
    // Larger amounts take longer to process
    const baseDelay = 1500; // 1.5 seconds
    const amountDelay = Math.min(amount / 15000, 2000); // Up to 2 extra seconds for large amounts
    const randomDelay = Math.random() * 1500; // 0-1.5 seconds random

    return baseDelay + amountDelay + randomDelay;
};

// Generate realistic transaction ID
const generateTransactionId = (): string => {
    const prefix = 'QE';
    const numbers = Math.floor(Math.random() * 900000000) + 100000000;
    return `${prefix}${numbers}`;
};

// Generate batch ID
const generateBatchId = (): string => {
    const prefix = 'BT';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
};

// Validate Kenyan phone number
const isValidKenyanPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\s+/g, '');
    return /^(254|0)[17]\d{8}$/.test(cleaned);
};

// Currency conversion (simplified)
const convertCurrency = (amount: number, fromCurrency: string, toCurrency = 'KES'): number => {
    if (fromCurrency === toCurrency) return amount;

    // Simplified exchange rates (in a real app, fetch from API)
    const rates: { [key: string]: number } = {
        'KES': 1,
        'USD': 150, // 1 USD = 150 KES
        'EUR': 165, // 1 EUR = 165 KES
        'GBP': 190, // 1 GBP = 190 KES
    };

    if (fromCurrency === 'KES') {
        return amount / (rates[toCurrency] || 1);
    }

    // Convert to KES first, then to target currency
    const kesAmount = amount * (rates[fromCurrency] || 1);
    return toCurrency === 'KES' ? kesAmount : kesAmount / (rates[toCurrency] || 1);
};

// Main payment processing function
export const processMpesaPayment = async (paymentRequest: PaymentRequest): Promise<MpesaResponse> => {
    const { recipient, amount, description, currency = 'KES' } = paymentRequest;

    // Convert amount to KES for processing
    const kesAmount = convertCurrency(amount, currency, 'KES');

    // Validate input
    if (!isValidKenyanPhone(recipient)) {
        return {
            success: false,
            message: 'Invalid recipient phone number format',
            errorCode: 'INVALID_RECIPIENT'
        };
    }

    if (kesAmount < 1 || kesAmount > 300000) {
        return {
            success: false,
            message: 'Amount must be between KES 1 and KES 300,000',
            errorCode: 'INVALID_AMOUNT'
        };
    }

    // Simulate processing delay
    const delay = getProcessingDelay(kesAmount);
    await new Promise(resolve => setTimeout(resolve, delay));

    // Check for error scenarios
    for (const scenario of errorScenarios) {
        if (Math.random() < scenario.probability) {
            return {
                success: false,
                message: scenario.message,
                errorCode: scenario.code
            };
        }
    }

    // Success case (85% success rate overall)
    if (Math.random() < 0.85) {
        return {
            success: true,
            transactionId: generateTransactionId(),
            message: `Payment of ${currency} ${amount.toLocaleString()} sent successfully to ${recipient}`
        };
    }

    // Generic failure (remaining 15%)
    return {
        success: false,
        message: 'Transaction failed. Please try again.',
        errorCode: 'TRANSACTION_FAILED'
    };
};

// Batch payment processing
export const processBatchMpesaPayment = async (batchRequest: BatchPaymentRequest): Promise<BatchMpesaResponse> => {
    const { recipients, description, currency = 'KES' } = batchRequest;
    const batchId = generateBatchId();

    // Validate batch size
    if (recipients.length === 0) {
        return {
            batchId,
            success: false,
            message: 'No recipients specified',
            results: []
        };
    }

    if (recipients.length > 100) {
        return {
            batchId,
            success: false,
            message: 'Maximum 100 recipients allowed per batch',
            results: []
        };
    }

    // Process each payment with a small delay between them
    const results = [];
    let successCount = 0;

    for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        const amount = recipient.amount || 0;

        // Small delay between batch payments
        if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        try {
            const result = await processMpesaPayment({
                recipient: recipient.phone,
                amount,
                description,
                currency
            });

            results.push({
                recipient: recipient.phone,
                success: result.success,
                transactionId: result.transactionId,
                message: result.message,
                errorCode: result.errorCode
            });

            if (result.success) {
                successCount++;
            }
        } catch (error) {
            results.push({
                recipient: recipient.phone,
                success: false,
                message: 'Processing error occurred',
                errorCode: 'PROCESSING_ERROR'
            });
        }
    }

    const overallSuccess = successCount === recipients.length;
    const partialSuccess = successCount > 0 && successCount < recipients.length;

    return {
        batchId,
        success: overallSuccess,
        message: overallSuccess
            ? `All ${recipients.length} payments processed successfully`
            : partialSuccess
                ? `${successCount} of ${recipients.length} payments processed successfully`
                : `Batch payment failed - ${recipients.length - successCount} payments failed`,
        results
    };
};

// Get account balance simulation with multi-currency support
export const getMpesaBalance = async (currency = 'KES'): Promise<number> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate a random KES balance between 5000 and 150000
    const kesBalance = Math.floor(Math.random() * 145000) + 5000;

    // Convert to requested currency
    return convertCurrency(kesBalance, 'KES', currency);
};

// Check transaction status
export const checkTransactionStatus = async (transactionId: string): Promise<{
    status: 'pending' | 'completed' | 'failed';
    message: string;
}> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Most transactions complete successfully
    if (Math.random() < 0.95) {
        return {
            status: 'completed',
            message: 'Transaction completed successfully'
        };
    }

    return {
        status: 'failed',
        message: 'Transaction failed during processing'
    };
};

// Get exchange rates (simplified simulation)
export const getExchangeRates = async (): Promise<{ [key: string]: number }> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate slight fluctuations in exchange rates
    const baseRates = {
        'KES': 1,
        'USD': 150 + (Math.random() - 0.5) * 5, // ±2.5 fluctuation
        'EUR': 165 + (Math.random() - 0.5) * 6, // ±3 fluctuation
        'GBP': 190 + (Math.random() - 0.5) * 8, // ±4 fluctuation
        'UGX': 0.04 + (Math.random() - 0.5) * 0.002, // Ugandan Shilling
        'TZS': 0.063 + (Math.random() - 0.5) * 0.003, // Tanzanian Shilling
    };

    return baseRates;
};

// Validate batch payment recipients
export const validateBatchRecipients = (recipients: PaymentRecipient[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (recipients.length === 0) {
        errors.push('At least one recipient is required');
    }

    if (recipients.length > 100) {
        errors.push('Maximum 100 recipients allowed per batch');
    }

    recipients.forEach((recipient, index) => {
        if (!recipient.phone) {
            errors.push(`Recipient ${index + 1}: Phone number is required`);
        } else if (!isValidKenyanPhone(recipient.phone)) {
            errors.push(`Recipient ${index + 1}: Invalid phone number format`);
        }

        if (recipient.amount && (recipient.amount < 1 || recipient.amount > 300000)) {
            errors.push(`Recipient ${index + 1}: Amount must be between 1 and 300,000`);
        }
    });

    // Check for duplicate phone numbers
    const phoneNumbers = recipients.map(r => r.phone).filter(Boolean);
    const duplicates = phoneNumbers.filter((phone, index) => phoneNumbers.indexOf(phone) !== index);
    if (duplicates.length > 0) {
        errors.push(`Duplicate phone numbers found: ${[...new Set(duplicates)].join(', ')}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Calculate batch payment total
export const calculateBatchTotal = (recipients: PaymentRecipient[], defaultAmount?: number): number => {
    return recipients.reduce((total, recipient) => {
        const amount = recipient.amount || defaultAmount || 0;
        return total + amount;
    }, 0);
};
