package com.loyalty.rewards.service;

import com.loyalty.rewards.model.ExportAudit;
import com.loyalty.rewards.model.Member;
import com.loyalty.rewards.model.Role;
import com.loyalty.rewards.model.Transaction;
import com.loyalty.rewards.model.TransactionType;
import com.loyalty.rewards.repository.ExportAuditRepository;
import com.loyalty.rewards.repository.TransactionRepository;
import com.loyalty.rewards.repository.TransactionSpecification;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionExportService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ExportAuditRepository exportAuditRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public List<Transaction> getFilteredTransactions(
            Long customerId,
            String customerName,
            Long performedBy,
            Role performedByRole,
            TransactionType transactionType,
            LocalDate startDate,
            LocalDate endDate,
            Integer minPoints,
            Integer maxPoints) {

        Specification<Transaction> spec = TransactionSpecification.filterTransactions(
                customerId, customerName, performedBy, performedByRole,
                transactionType, startDate, endDate, minPoints, maxPoints);

        return transactionRepository.findAll(spec);
    }

    public String buildFiltersSummary(
            Long customerId,
            String customerName,
            Long performedBy,
            Role performedByRole,
            TransactionType transactionType,
            LocalDate startDate,
            LocalDate endDate,
            Integer minPoints,
            Integer maxPoints) {

        List<String> filters = new ArrayList<>();
        if (customerId != null) filters.add("Customer ID: " + customerId);
        if (customerName != null && !customerName.trim().isEmpty()) filters.add("Customer Name: " + customerName.trim());
        if (performedBy != null) filters.add("Performed By ID: " + performedBy);
        if (performedByRole != null) filters.add("Performed By Role: " + performedByRole);
        if (transactionType != null) filters.add("Type: " + transactionType);
        if (startDate != null) filters.add("Start Date: " + startDate);
        if (endDate != null) filters.add("End Date: " + endDate);
        if (minPoints != null) filters.add("Min Points: " + minPoints);
        if (maxPoints != null) filters.add("Max Points: " + maxPoints);

        return filters.isEmpty() ? "All Records (No Filters)" : String.join(", ", filters);
    }

    public byte[] generateCsvExport(List<Transaction> transactions, Member performer, String filtersSummary) {
        StringBuilder csv = new StringBuilder();

        // Standard 13 Columns Header
        csv.append("Transaction ID,Customer ID,Customer Name,Performed By User ID,Performed By Name,Performed By Role,Transaction Type,Bill Amount,Points,Previous Balance,New Balance,Description,Transaction Date\n");

        for (Transaction tx : transactions) {
            csv.append(escapeCsv(tx.getTransactionId())).append(",");
            csv.append(escapeCsv(tx.getCustomerId())).append(",");
            csv.append(escapeCsv(tx.getCustomerName())).append(",");
            csv.append(escapeCsv(tx.getPerformedByUserId())).append(",");
            csv.append(escapeCsv(tx.getPerformedByName())).append(",");
            csv.append(escapeCsv(tx.getPerformedByRole())).append(",");
            csv.append(escapeCsv(tx.getTransactionType())).append(",");
            csv.append(escapeCsv(tx.getBillAmount() != null ? String.format("%.2f", tx.getBillAmount()) : "")).append(",");
            csv.append(escapeCsv(tx.getPoints())).append(",");
            csv.append(escapeCsv(tx.getPreviousBalance())).append(",");
            csv.append(escapeCsv(tx.getNewBalance())).append(",");
            csv.append(escapeCsv(tx.getDescription())).append(",");
            csv.append(escapeCsv(tx.getTransactionDate() != null ? tx.getTransactionDate().format(DATE_FORMATTER) : "")).append("\n");
        }

        // Record audit
        saveAuditLog(performer, "CSV", filtersSummary, transactions.size());

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] generatePdfExport(List<Transaction> transactions, Member performer, String filtersSummary) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.RED.darker());
            Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
            Font metaFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
            Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.BLACK);
            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.DARK_GRAY);

            // Title
            Paragraph title = new Paragraph("LOYALTY REWARDS SYSTEM - TRANSACTION HISTORY AUDIT REPORT", titleFont);
            title.setAlignment(Element.ALIGN_LEFT);
            title.setSpacingAfter(4);
            document.add(title);

            Paragraph line = new Paragraph("Official Administrative Audit Export | Strict Role Enforcement: SUPER_ADMIN", subTitleFont);
            line.setSpacingAfter(12);
            document.add(line);

            // Metadata Block
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(12);

            PdfPCell c1 = new PdfPCell(new Phrase("Generated Date: " + LocalDateTime.now().format(DATE_FORMATTER) + "\nGenerated By: " + performer.getFullName() + " (ID: " + performer.getMemberId() + " | " + performer.getRole() + ")", cellFont));
            c1.setBorder(PdfPCell.BOX);
            c1.setPadding(6);
            c1.setBackgroundColor(new Color(248, 249, 250));

            PdfPCell c2 = new PdfPCell(new Phrase("Applied Filters:\n" + filtersSummary, cellFont));
            c2.setBorder(PdfPCell.BOX);
            c2.setPadding(6);
            c2.setBackgroundColor(new Color(248, 249, 250));

            metaTable.addCell(c1);
            metaTable.addCell(c2);
            document.add(metaTable);

            // Data Table - 13 columns
            float[] columnWidths = {0.8f, 0.8f, 1.6f, 0.8f, 1.4f, 1.0f, 1.0f, 1.0f, 0.9f, 1.0f, 1.0f, 2.2f, 1.5f};
            PdfPTable table = new PdfPTable(13);
            table.setWidthPercentage(100);
            table.setWidths(columnWidths);
            table.setHeaderRows(1);

            String[] headers = {
                    "Tx ID", "Cust ID", "Customer Name", "Op ID", "Operator Name", "Role",
                    "Type", "Bill Amt", "Points", "Prev Bal", "New Bal", "Description", "Date"
            };

            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(new Color(185, 28, 28)); // Shiny red theme
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5);
                table.addCell(cell);
            }

            long totalEarn = 0;
            long totalDeduct = 0;
            long totalRedeem = 0;
            long totalExpired = 0;

            boolean alternate = false;
            for (Transaction tx : transactions) {
                Color rowBg = alternate ? new Color(245, 245, 245) : Color.WHITE;
                alternate = !alternate;

                addTableCell(table, String.valueOf(tx.getTransactionId()), cellFont, Element.ALIGN_CENTER, rowBg);
                addTableCell(table, String.valueOf(tx.getCustomerId()), cellFont, Element.ALIGN_CENTER, rowBg);
                addTableCell(table, tx.getCustomerName() != null ? tx.getCustomerName() : "-", cellFont, Element.ALIGN_LEFT, rowBg);
                addTableCell(table, tx.getPerformedByUserId() != null ? String.valueOf(tx.getPerformedByUserId()) : "-", cellFont, Element.ALIGN_CENTER, rowBg);
                addTableCell(table, tx.getPerformedByName() != null ? tx.getPerformedByName() : "System", cellFont, Element.ALIGN_LEFT, rowBg);
                addTableCell(table, tx.getPerformedByRole() != null ? tx.getPerformedByRole().name() : "SYSTEM", cellFont, Element.ALIGN_CENTER, rowBg);
                addTableCell(table, tx.getTransactionType() != null ? tx.getTransactionType().name() : "-", cellFont, Element.ALIGN_CENTER, rowBg);
                addTableCell(table, tx.getBillAmount() != null ? String.format("₹%.2f", tx.getBillAmount()) : "-", cellFont, Element.ALIGN_RIGHT, rowBg);
                addTableCell(table, String.valueOf(tx.getPoints()), cellFont, Element.ALIGN_RIGHT, rowBg);
                addTableCell(table, tx.getPreviousBalance() != null ? String.valueOf(tx.getPreviousBalance()) : "-", cellFont, Element.ALIGN_RIGHT, rowBg);
                addTableCell(table, tx.getNewBalance() != null ? String.valueOf(tx.getNewBalance()) : "-", cellFont, Element.ALIGN_RIGHT, rowBg);
                addTableCell(table, tx.getDescription() != null ? tx.getDescription() : "", cellFont, Element.ALIGN_LEFT, rowBg);
                addTableCell(table, tx.getTransactionDate() != null ? tx.getTransactionDate().format(DATE_FORMATTER) : "", cellFont, Element.ALIGN_CENTER, rowBg);

                if (tx.getTransactionType() == TransactionType.EARN) {
                    totalEarn += tx.getPoints();
                } else if (tx.getTransactionType() == TransactionType.DEDUCT) {
                    totalDeduct += tx.getPoints();
                } else if (tx.getTransactionType() == TransactionType.REDEEM) {
                    totalRedeem += tx.getPoints();
                } else if (tx.getTransactionType() == TransactionType.EXPIRED) {
                    totalExpired += tx.getPoints();
                }
            }

            if (transactions.isEmpty()) {
                PdfPCell emptyCell = new PdfPCell(new Phrase("No transactions found matching the applied filter criteria.", cellFont));
                emptyCell.setColspan(13);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                emptyCell.setPadding(12);
                table.addCell(emptyCell);
            }

            document.add(table);

            // Report Totals Section
            Paragraph totalsHeader = new Paragraph("EXPORT SUMMARY & TOTALS", titleFont);
            totalsHeader.setSpacingBefore(12);
            totalsHeader.setSpacingAfter(6);
            document.add(totalsHeader);

            PdfPTable totalsTable = new PdfPTable(5);
            totalsTable.setWidthPercentage(100);
            
            addSummaryCell(totalsTable, "Total Records", String.valueOf(transactions.size()), totalFont);
            addSummaryCell(totalsTable, "Total EARN Points", totalEarn + " pts", totalFont);
            addSummaryCell(totalsTable, "Total DEDUCT Points", totalDeduct + " pts", totalFont);
            addSummaryCell(totalsTable, "Total REDEEM Points", totalRedeem + " pts", totalFont);
            addSummaryCell(totalsTable, "Total EXPIRED Points", totalExpired + " pts", totalFont);

            document.add(totalsTable);

            document.close();

            // Record audit
            saveAuditLog(performer, "PDF", filtersSummary, transactions.size());

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF transaction report: " + e.getMessage(), e);
        }

        return out.toByteArray();
    }

    private void addTableCell(PdfPTable table, String text, Font font, int alignment, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setHorizontalAlignment(alignment);
        cell.setBackgroundColor(bg);
        cell.setPadding(4);
        table.addCell(cell);
    }

    private void addSummaryCell(PdfPTable table, String label, String value, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(label + "\n" + value, font));
        cell.setBackgroundColor(new Color(240, 240, 240));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private String escapeCsv(Object val) {
        if (val == null) return "";
        String s = val.toString();
        if (s.contains(",") || s.contains("\"") || s.contains("\n") || s.contains("\r")) {
            s = s.replace("\"", "\"\"");
            return "\"" + s + "\"";
        }
        return s;
    }

    private void saveAuditLog(Member performer, String format, String filtersUsed, int recordCount) {
        try {
            ExportAudit audit = new ExportAudit(
                    performer != null ? performer.getMemberId() : null,
                    performer != null ? performer.getFullName() : "SYSTEM",
                    performer != null ? performer.getRole() : Role.SUPER_ADMIN,
                    format,
                    filtersUsed,
                    recordCount
            );
            exportAuditRepository.save(audit);
        } catch (Exception e) {
            // Log warning if audit save fails but do not disrupt export stream
            System.err.println("Failed to persist ExportAudit record: " + e.getMessage());
        }
    }
}
