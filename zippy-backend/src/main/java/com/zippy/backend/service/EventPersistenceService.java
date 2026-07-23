package com.zippy.backend.service;

import com.zippy.backend.model.ShipmentEvent;
import com.zippy.backend.repository.ShipmentEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EventPersistenceService {

    private static final Logger log = LoggerFactory.getLogger(EventPersistenceService.class);

    private final ShipmentEventRepository shipmentEventRepository;

    public EventPersistenceService(ShipmentEventRepository shipmentEventRepository) {
        this.shipmentEventRepository = shipmentEventRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean saveEventIdempotently(ShipmentEvent event) {
        if (event.getCarrierEventId() != null &&
                shipmentEventRepository.existsByShipmentIdAndCarrierEventId(event.getShipment().getId(), event.getCarrierEventId())) {
            log.info("Duplicate event key detected prior to save: {}", event.getCarrierEventId());
            return false;
        }

        try {
            shipmentEventRepository.saveAndFlush(event);
            return true;
        } catch (DataIntegrityViolationException e) {
            log.info("Duplicate event key caught by database constraint: {}", event.getCarrierEventId());
            return false;
        }
    }
}
