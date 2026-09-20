package com.loyalty.rewards.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "export_audits")
public class ExportAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long exportId;

    private Long performedByUserId;

    private String performedByName;

    @Enumerated(EnumType.STRING)
    private Role performedByRole;

    @Column(nullable = false)
    private String format;

    @Column(length = 2000)
    private String filtersUsed;

    private Integer recordCount;

    @Column(nullable = false)
    private LocalDateTime exportedAt = LocalDateTime.now();

    public ExportAudit() {}

    public ExportAudit(Long performedByUserId, String performedByName, Role performedByRole,
                       String format, String filtersUsed, Integer recordCount) {
        this.performedByUserId = performedByUserId;
        this.performedByName = performedByName;
        this.performedByRole = performedByRole;
        this.format = format;
        this.filtersUsed = filtersUsed;
        this.recordCount = recordCount;
        this.exportedAt = LocalDateTime.now();
    }

    public Long getExportId() {
        return exportId;
    }

    public void setExportId(Long exportId) {
        this.exportId = exportId;
    }

    public Long getPerformedByUserId() {
        return performedByUserId;
    }

    public void setPerformedByUserId(Long performedByUserId) {
        this.performedByUserId = performedByUserId;
    }

    public String getPerformedByName() {
        return performedByName;
    }

    public void setPerformedByName(String performedByName) {
        this.performedByName = performedByName;
    }

    public Role getPerformedByRole() {
        return performedByRole;
    }

    public void setPerformedByRole(Role performedByRole) {
        this.performedByRole = performedByRole;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getFiltersUsed() {
        return filtersUsed;
    }

    public void setFiltersUsed(String filtersUsed) {
        this.filtersUsed = filtersUsed;
    }

    public Integer getRecordCount() {
        return recordCount;
    }

    public void setRecordCount(Integer recordCount) {
        this.recordCount = recordCount;
    }

    public LocalDateTime getExportedAt() {
        return exportedAt;
    }

    public void setExportedAt(LocalDateTime exportedAt) {
        this.exportedAt = exportedAt;
    }
}
