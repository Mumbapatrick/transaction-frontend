import type { ScheduledPayment } from '@/types';

// Export payments to CSV
export const exportToCSV = (payments: ScheduledPayment[], filename = 'mpesa-payments.csv') => {
    // Prepare CSV headers
    const headers = [
        'Date',
        'Time',
        'Recipients',
        'Amount',
        'Currency',
        'Category',
        'Description',
        'Status',
        'Transaction ID',
        'Created At'
    ];

    // Prepare CSV rows
    const rows = payments.map(payment => {
        const date = new Date(payment.scheduledDate);
        const recipients = payment.recipients.map(r => `${r.name || r.phone} (${r.phone})`).join('; ');
        const transactionIds = payment.transactionIds?.join(', ') || payment.recipients[0]?.transactionId || 'N/A';

        return [
            date.toLocaleDateString(),
            date.toLocaleTimeString(),
            recipients,
            payment.amount.toFixed(2),
            payment.currency.code,
            payment.category.name,
            payment.description,
            payment.status,
            transactionIds,
            new Date(payment.createdAt).toLocaleString()
        ];
    });

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Export payments to text-based PDF (simplified)
export const exportToPDF = (payments: ScheduledPayment[], filename = 'mpesa-payments.pdf') => {
    // Create a printable HTML document
    const formatCurrency = (amount: number, currency: string) => {
        return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>M-Pesa Payment Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #16a34a;
      padding-bottom: 20px;
    }
    .header h1 {
      color: #16a34a;
      margin: 0;
    }
    .header p {
      color: #666;
      margin: 5px 0;
    }
    .summary {
      background: #f0fdf4;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 30px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    .summary-item {
      text-align: center;
    }
    .summary-item strong {
      display: block;
      font-size: 24px;
      color: #16a34a;
    }
    .summary-item span {
      color: #666;
      font-size: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #16a34a;
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 10px 8px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    .status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      display: inline-block;
    }
    .status-completed {
      background: #dcfce7;
      color: #166534;
    }
    .status-pending {
      background: #fef3c7;
      color: #92400e;
    }
    .status-failed {
      background: #fee2e2;
      color: #991b1b;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #666;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
      padding-top: 15px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>M-Pesa Scheduler</h1>
    <p>Payment History Report</p>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>

  <div class="summary">
    <div class="summary-item">
      <strong>${payments.length}</strong>
      <span>Total Payments</span>
    </div>
    <div class="summary-item">
      <strong>${payments.filter(p => p.status === 'completed').length}</strong>
      <span>Completed</span>
    </div>
    <div class="summary-item">
      <strong>${payments.filter(p => p.status === 'pending').length}</strong>
      <span>Pending</span>
    </div>
    <div class="summary-item">
      <strong>${payments.filter(p => p.status === 'failed').length}</strong>
      <span>Failed</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Recipients</th>
        <th>Amount</th>
        <th>Category</th>
        <th>Description</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${payments.map(payment => {
        const date = new Date(payment.scheduledDate);
        const recipients = payment.recipients.map(r => r.name || r.phone).join(', ');
        return `
          <tr>
            <td>${date.toLocaleDateString()}<br/><small style="color: #666;">${date.toLocaleTimeString()}</small></td>
            <td>${recipients}</td>
            <td><strong>${formatCurrency(payment.amount, payment.currency.code)}</strong></td>
            <td>${payment.category.icon} ${payment.category.name}</td>
            <td>${payment.description}</td>
            <td><span class="status status-${payment.status}">${payment.status.toUpperCase()}</span></td>
          </tr>
        `;
    }).join('')}
    </tbody>
  </table>

  <div class="footer">
    <p>This is a computer-generated report from M-Pesa Scheduler Created by MUMBA</p>
    <p>Total Amount: ${formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0), payments[0]?.currency.code || 'KES')}</p>
  </div>

  <div class="no-print" style="margin-top: 20px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
      Print / Save as PDF
    </button>
  </div>
</body>
</html>
  `;

    // Open in new window for printing
    const printWindow = window.open('', '', 'width=1200,height=800');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();

        // Auto-print after a short delay to ensure content is loaded
        setTimeout(() => {
            printWindow.print();
        }, 250);
    }
};

// Export analytics data
export const exportAnalyticsToCSV = (
    payments: ScheduledPayment[],
    filename = 'mpesa-analytics.csv'
) => {
    const categoryStats: { [key: string]: { count: number; amount: number; category: string } } = {};

    payments.forEach(payment => {
        const catId = payment.category.id;
        if (!categoryStats[catId]) {
            categoryStats[catId] = {
                category: payment.category.name,
                count: 0,
                amount: 0
            };
        }
        categoryStats[catId].count++;
        categoryStats[catId].amount += payment.amount;
    });

    const headers = ['Category', 'Number of Payments', 'Total Amount', 'Average Amount', 'Percentage'];
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    const rows = Object.values(categoryStats).map(stat => {
        const percentage = (stat.amount / totalAmount) * 100;
        const average = stat.amount / stat.count;
        return [
            stat.category,
            stat.count.toString(),
            stat.amount.toFixed(2),
            average.toFixed(2),
            percentage.toFixed(2) + '%'
        ];
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Generate receipt for individual payment
export const generateReceipt = (payment: ScheduledPayment) => {
    const formatCurrency = (amount: number) => {
        return `${payment.currency.code} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Receipt - ${payment.id}</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      padding: 20px;
      max-width: 400px;
      margin: 0 auto;
      background: white;
    }
    .receipt {
      border: 2px solid #000;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 2px dashed #000;
      padding-bottom: 15px;
    }
    .header h2 {
      margin: 0;
      font-size: 20px;
    }
    .row {
      display: flex;
      justify-between;
      margin: 10px 0;
      padding: 5px 0;
    }
    .row.total {
      border-top: 2px solid #000;
      border-bottom: 2px double #000;
      font-weight: bold;
      font-size: 18px;
      margin-top: 15px;
      padding-top: 10px;
    }
    .label {
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px dashed #000;
      font-size: 12px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h2>M-PESA PAYMENT RECEIPT</h2>
      <p style="margin: 5px 0;">Payment Scheduler</p>
    </div>

    <div class="row">
      <span class="label">Receipt No:</span>
      <span>${payment.id.toUpperCase()}</span>
    </div>

    <div class="row">
      <span class="label">Date:</span>
      <span>${new Date(payment.scheduledDate).toLocaleString()}</span>
    </div>

    <div class="row">
      <span class="label">Status:</span>
      <span>${payment.status.toUpperCase()}</span>
    </div>

    <div class="row">
      <span class="label">Recipient(s):</span>
      <span>${payment.recipients.length}</span>
    </div>

    ${payment.recipients.map((r, i) => `
      <div class="row" style="margin-left: 20px; font-size: 14px;">
        <span>${i + 1}. ${r.name || r.phone}</span>
        <span>${r.phone}</span>
      </div>
    `).join('')}

    <div class="row">
      <span class="label">Category:</span>
      <span>${payment.category.name}</span>
    </div>

    <div class="row">
      <span class="label">Description:</span>
      <span>${payment.description}</span>
    </div>

    ${payment.transactionIds && payment.transactionIds.length > 0 ? `
      <div class="row">
        <span class="label">Transaction ID:</span>
        <span>${payment.transactionIds[0]}</span>
      </div>
    ` : ''}

    <div class="row total">
      <span>TOTAL AMOUNT:</span>
      <span>${formatCurrency(payment.amount)}</span>
    </div>

    <div class="footer">
      <p>Thank you for using M-Pesa Scheduler</p>
      <p style="margin-top: 10px; font-size: 10px;">
        Generated: ${new Date().toLocaleString()}
      </p>
    </div>
  </div>

  <div class="no-print" style="margin-top: 20px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 20px; background: #16a34a; color: white; border: none; border-radius: 6px; cursor: pointer;">
      Print Receipt
    </button>
  </div>
</body>
</html>
  `;

    const printWindow = window.open('', '', 'width=480,height=720');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => printWindow.print(), 250);
    }
};
