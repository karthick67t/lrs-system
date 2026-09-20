package com.loyalty.rewards.service;

import com.loyalty.rewards.model.Partner;
import com.loyalty.rewards.model.Status;
import com.loyalty.rewards.repository.PartnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PartnerService {

    @Autowired
    private PartnerRepository partnerRepository;

    public List<Partner> getAllPartners() {
        return partnerRepository.findAll();
    }

    public Partner getPartnerById(Long id) {
        return partnerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Partner not found with ID: " + id));
    }

    public Partner createPartner(Partner partner) {
        if (partner.getName() == null || partner.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Partner name is required");
        }
        return partnerRepository.save(partner);
    }

    public Partner updatePartner(Long id, Partner details) {
        Partner partner = getPartnerById(id);
        if (details.getName() != null) partner.setName(details.getName());
        if (details.getDescription() != null) partner.setDescription(details.getDescription());
        if (details.getCategory() != null) partner.setCategory(details.getCategory());
        if (details.getStatus() != null) partner.setStatus(details.getStatus());
        return partnerRepository.save(partner);
    }

    public void deletePartner(Long id) {
        Partner partner = getPartnerById(id);
        partnerRepository.delete(partner);
    }

    public List<Partner> searchByName(String name) {
        return partnerRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Partner> getByCategory(String category) {
        return partnerRepository.findByCategory(category);
    }

    public List<Partner> getByStatus(Status status) {
        return partnerRepository.findByStatus(status);
    }
}
