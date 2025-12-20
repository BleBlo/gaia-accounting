'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { format } from 'date-fns'

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number }
  }
}

interface ExportColumn {
  header: string
  key: string
  width?: number
}

interface VATReportData {
  period: string
  salesTotal: number
  salesVat: number
  salesCount: number
  businessName: string
  trnNumber: string
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-AE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// ============ PDF EXPORTS ============

export function exportSalesToPDF(
  sales: any[],
  dateRange: string,
  totals: { total: number; vat: number }
) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('GAIA Fashion House', 105, 20, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Sales Report', 105, 30, { align: 'center' })

  doc.setFontSize(10)
  doc.text(`Period: ${dateRange}`, 105, 38, { align: 'center' })
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 105, 44, { align: 'center' })

  // Table
  const tableData = sales.map((sale) => [
    format(new Date(sale.sale_date), 'dd/MM/yyyy'),
    sale.service?.name_en || sale.custom_description || 'Custom',
    sale.customer?.name || 'Walk-in',
    sale.payment_method.replace('_', ' '),
    sale.payment_status,
    `AED ${formatCurrency(sale.subtotal)}`,
    `AED ${formatCurrency(sale.vat_amount)}`,
    `AED ${formatCurrency(sale.total_amount)}`,
  ])

  autoTable(doc, {
    startY: 52,
    head: [['Date', 'Service', 'Customer', 'Payment', 'Status', 'Subtotal', 'VAT', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    styles: { fontSize: 8 },
    columnStyles: {
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right' },
    },
  })

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total Sales: AED ${formatCurrency(totals.total)}`, 14, finalY)
  doc.text(`Total VAT: AED ${formatCurrency(totals.vat)}`, 14, finalY + 6)
  doc.text(`Transactions: ${sales.length}`, 14, finalY + 12)

  doc.save(`sales-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

export function exportExpensesToPDF(
  expenses: any[],
  dateRange: string,
  total: number
) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('GAIA Fashion House', 105, 20, { align: 'center' })

  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('Expenses Report', 105, 30, { align: 'center' })

  doc.setFontSize(10)
  doc.text(`Period: ${dateRange}`, 105, 38, { align: 'center' })
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 105, 44, { align: 'center' })

  // Table
  const tableData = expenses.map((expense) => [
    format(new Date(expense.expense_date), 'dd/MM/yyyy'),
    expense.category?.name_en || 'Other',
    expense.description || '-',
    expense.supplier?.name || '-',
    expense.payment_method.replace('_', ' '),
    `AED ${formatCurrency(expense.amount)}`,
  ])

  autoTable(doc, {
    startY: 52,
    head: [['Date', 'Category', 'Description', 'Supplier', 'Payment', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    styles: { fontSize: 8 },
    columnStyles: {
      5: { halign: 'right' },
    },
  })

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total Expenses: AED ${formatCurrency(total)}`, 14, finalY)
  doc.text(`Transactions: ${expenses.length}`, 14, finalY + 6)

  doc.save(`expenses-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
}

export function exportVATReportToPDF(data: VATReportData) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('VAT RETURN', 105, 20, { align: 'center' })

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Federal Tax Authority - UAE', 105, 28, { align: 'center' })

  // Business Info Box
  doc.setDrawColor(0)
  doc.setLineWidth(0.5)
  doc.rect(14, 40, 182, 30)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Business Information', 18, 48)
  doc.setFont('helvetica', 'normal')
  doc.text(`Business Name: ${data.businessName}`, 18, 56)
  doc.text(`TRN: ${data.trnNumber || 'Not Registered'}`, 18, 64)
  doc.text(`Tax Period: ${data.period}`, 120, 56)
  doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy')}`, 120, 64)

  // VAT Summary Table
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('VAT Summary', 14, 85)

  autoTable(doc, {
    startY: 90,
    head: [['Description', 'Amount (AED)', 'VAT Amount (AED)']],
    body: [
      ['Standard Rated Sales (5%)', formatCurrency(data.salesTotal - data.salesVat), formatCurrency(data.salesVat)],
      ['Zero Rated Sales', '0.00', '0.00'],
      ['Exempt Sales', '0.00', '0.00'],
      ['Total Sales', formatCurrency(data.salesTotal - data.salesVat), formatCurrency(data.salesVat)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    styles: { fontSize: 10 },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
    },
  })

  // VAT Calculation
  const finalY = doc.lastAutoTable.finalY + 15
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('VAT Calculation', 14, finalY)

  autoTable(doc, {
    startY: finalY + 5,
    body: [
      ['Output VAT (VAT on Sales)', `AED ${formatCurrency(data.salesVat)}`],
      ['Input VAT (VAT on Purchases)', 'AED 0.00'],
      ['', ''],
      ['Net VAT Payable', `AED ${formatCurrency(data.salesVat)}`],
    ],
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right', cellWidth: 80 },
    },
  })

  // Footer
  const footerY = doc.lastAutoTable.finalY + 20
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('This is a computer-generated document. Please consult with your accountant before filing.', 105, footerY, { align: 'center' })
  doc.text(`Number of transactions: ${data.salesCount}`, 105, footerY + 5, { align: 'center' })

  doc.save(`vat-return-${data.period.replace(' ', '-')}.pdf`)
}

// ============ EXCEL EXPORTS ============

export function exportSalesToExcel(sales: any[], dateRange: string) {
  const data = sales.map((sale) => ({
    'Date': format(new Date(sale.sale_date), 'dd/MM/yyyy'),
    'Service': sale.service?.name_en || sale.custom_description || 'Custom',
    'Customer': sale.customer?.name || 'Walk-in',
    'Payment Method': sale.payment_method.replace('_', ' '),
    'Status': sale.payment_status,
    'Subtotal (AED)': sale.subtotal,
    'VAT (AED)': sale.vat_amount,
    'Total (AED)': sale.total_amount,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sales')

  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 15 },
    { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
  ]

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `sales-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}

export function exportExpensesToExcel(expenses: any[], dateRange: string) {
  const data = expenses.map((expense) => ({
    'Date': format(new Date(expense.expense_date), 'dd/MM/yyyy'),
    'Category': expense.category?.name_en || 'Other',
    'Description': expense.description || '-',
    'Supplier': expense.supplier?.name || '-',
    'Payment Method': expense.payment_method.replace('_', ' '),
    'Reference': expense.reference_number || '-',
    'Amount (AED)': expense.amount,
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses')

  ws['!cols'] = [
    { wch: 12 }, { wch: 18 }, { wch: 30 }, { wch: 20 },
    { wch: 15 }, { wch: 15 }, { wch: 15 },
  ]

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `expenses-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}

export function exportVATReportToExcel(data: VATReportData) {
  const summaryData = [
    { 'Field': 'Business Name', 'Value': data.businessName },
    { 'Field': 'TRN', 'Value': data.trnNumber || 'Not Registered' },
    { 'Field': 'Tax Period', 'Value': data.period },
    { 'Field': '', 'Value': '' },
    { 'Field': 'Total Sales (excl. VAT)', 'Value': data.salesTotal - data.salesVat },
    { 'Field': 'Output VAT (5%)', 'Value': data.salesVat },
    { 'Field': 'Total Sales (incl. VAT)', 'Value': data.salesTotal },
    { 'Field': '', 'Value': '' },
    { 'Field': 'Input VAT', 'Value': 0 },
    { 'Field': 'Net VAT Payable', 'Value': data.salesVat },
    { 'Field': '', 'Value': '' },
    { 'Field': 'Number of Transactions', 'Value': data.salesCount },
  ]

  const ws = XLSX.utils.json_to_sheet(summaryData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'VAT Return')

  ws['!cols'] = [{ wch: 25 }, { wch: 30 }]

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `vat-return-${data.period.replace(' ', '-')}.xlsx`)
}

export function exportAllDataToExcel(
  sales: any[],
  expenses: any[],
  employees: any[],
  customers: any[]
) {
  const wb = XLSX.utils.book_new()

  // Sales sheet
  const salesData = sales.map((sale) => ({
    'Date': format(new Date(sale.sale_date), 'dd/MM/yyyy'),
    'Service': sale.service?.name_en || sale.custom_description || 'Custom',
    'Customer': sale.customer?.name || 'Walk-in',
    'Subtotal': sale.subtotal,
    'VAT': sale.vat_amount,
    'Total': sale.total_amount,
    'Payment': sale.payment_method,
    'Status': sale.payment_status,
  }))
  const salesWs = XLSX.utils.json_to_sheet(salesData)
  XLSX.utils.book_append_sheet(wb, salesWs, 'Sales')

  // Expenses sheet
  const expensesData = expenses.map((expense) => ({
    'Date': format(new Date(expense.expense_date), 'dd/MM/yyyy'),
    'Category': expense.category?.name_en || 'Other',
    'Description': expense.description || '-',
    'Amount': expense.amount,
    'Payment': expense.payment_method,
  }))
  const expensesWs = XLSX.utils.json_to_sheet(expensesData)
  XLSX.utils.book_append_sheet(wb, expensesWs, 'Expenses')

  // Employees sheet
  const employeesData = employees.map((emp) => ({
    'Name': emp.name,
    'Job Title': emp.job_title,
    'Phone': emp.phone || '-',
    'Salary': emp.salary_amount,
    'Payday': emp.salary_day,
    'Visa Expiry': emp.visa_expiry_date || '-',
  }))
  const employeesWs = XLSX.utils.json_to_sheet(employeesData)
  XLSX.utils.book_append_sheet(wb, employeesWs, 'Employees')

  // Customers sheet
  const customersData = customers.map((cust) => ({
    'Name': cust.name,
    'Phone': cust.phone || '-',
    'Email': cust.email || '-',
    'Notes': cust.notes || '-',
  }))
  const customersWs = XLSX.utils.json_to_sheet(customersData)
  XLSX.utils.book_append_sheet(wb, customersWs, 'Customers')

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `gaia-data-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
}
