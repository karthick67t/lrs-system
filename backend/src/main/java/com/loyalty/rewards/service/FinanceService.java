package com.loyalty.rewards.service;

import com.loyalty.rewards.model.Finance;
import com.loyalty.rewards.repository.FinanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class FinanceService {

    @Autowired
    private FinanceRepository financeRepository;

    public List<Finance> getAllFinanceRecords() {
        return financeRepository.findAll();
    }

    public Finance getFinanceById(Long id) {
        return financeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Finance record not found with ID: " + id));
    }

    public Finance createFinanceRecord(Finance finance) {
        if (finance.getAmount() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount is required");
        }
        return financeRepository.save(finance);
    }

    public Finance updateFinanceRecord(Long id, Finance details) {
        Finance record = getFinanceById(id);
        if (details.getType() != null) record.setType(details.getType());
        if (details.getDescription() != null) record.setDescription(details.getDescription());
        if (details.getAmount() != null) record.setAmount(details.getAmount());
        if (details.getPoints() != null) record.setPoints(details.getPoints());
        if (details.getStatus() != null) record.setStatus(details.getStatus());
        return financeRepository.save(record);
    }

    public void deleteFinanceRecord(Long id) {
        Finance record = getFinanceById(id);
        financeRepository.delete(record);
    }

    public List<Finance> searchByDescription(String desc) {
        return financeRepository.findByDescriptionContainingIgnoreCase(desc);
    }

    public List<Finance> getByType(String type) {
        return financeRepository.findByType(type);
    }

    public List<Finance> getByStatus(String status) {
        return financeRepository.findByStatus(status);
    }
}
