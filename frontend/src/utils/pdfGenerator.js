import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to format currency
const formatMoney = (amount) => `Rs. ${Number(amount).toLocaleString('en-IN')}`;

const createBaseDoc = (title) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(23, 37, 84); // Navy blue
  doc.text('UNITY A LIVE GROUP', 105, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(217, 119, 6); // Amber/Gold
  doc.text('Ganesh Chaturthi 2026', 105, 28, { align: 'center' });
  
  // Title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 105, 40, { align: 'center' });
  
  // Timestamp
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 105, 48, { align: 'center' });
  
  return doc;
};

const addFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount} | Unity A Live Group - Fund Management System`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
  }
};

export const generateDaanPDF = (contributions, totalAmount) => {
  const doc = createBaseDoc('DAAN / CONTRIBUTION REPORT');

  const tableData = contributions.map(c => [
    c.contributorName,
    formatMoney(c.amount),
    new Date(c.date).toLocaleDateString(),
    c.paymentMode,
    c.note || '-'
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['Name', 'Amount', 'Date', 'Mode', 'Note']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [23, 37, 84] },
    margin: { top: 55 }
  });

  const finalY = doc.lastAutoTable?.finalY || 55;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Daan: ${formatMoney(totalAmount)}`, 14, finalY + 15);
  doc.text(`Total Contributors: ${contributions.length}`, 14, finalY + 25);

  addFooter(doc);
  doc.save('Unity_A_Live_Group_Daan_Report.pdf');
};

export const generateExpensesPDF = (expenses, totalSpent) => {
  const doc = createBaseDoc('EXPENSE / SPENT FUND REPORT');

  const tableData = expenses.map(e => [
    e.expenseName,
    e.category,
    formatMoney(e.amount),
    new Date(e.date).toLocaleDateString(),
    e.paidTo || '-',
    e.description || '-'
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['Expense', 'Category', 'Amount', 'Date', 'Paid To', 'Description']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [23, 37, 84] },
    margin: { top: 55 }
  });

  const finalY = doc.lastAutoTable?.finalY || 55;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Spent: ${formatMoney(totalSpent)}`, 14, finalY + 15);
  doc.text(`Total Expenses: ${expenses.length}`, 14, finalY + 25);

  addFooter(doc);
  doc.save('Unity_A_Live_Group_Expenses_Report.pdf');
};

export const generateSummaryPDF = (summary) => {
  const doc = createBaseDoc('FUND SUMMARY REPORT');

  const spentPercentage = summary.totalCollected > 0 
    ? ((summary.totalSpent / summary.totalCollected) * 100).toFixed(1)
    : 0;

  const tableData = [
    ['Total Collection (Daan)', formatMoney(summary.totalCollected)],
    ['Total Spent (Expenses)', formatMoney(summary.totalSpent)],
    ['Remaining Balance', formatMoney(summary.remainingBalance)],
    ['Total Contributors', summary.totalContributors.toString()],
    ['Total Expense Records', summary.totalExpenses.toString()],
    ['Fund Utilization', `${spentPercentage}% utilized`]
  ];

  autoTable(doc, {
    startY: 55,
    body: tableData,
    theme: 'grid',
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [240, 240, 240] },
      1: { halign: 'right' }
    }
  });

  addFooter(doc);
  doc.save('Unity_A_Live_Group_Fund_Summary.pdf');
};

export const shareFile = async (title, text, file, filename) => {
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title,
        text
      });
      return true;
    } catch (err) {
      console.log('Share canceled or failed', err);
      return false;
    }
  } else {
    alert("Web Share API is not supported on this device/browser for files. Please use the download button instead.");
    return false;
  }
};
