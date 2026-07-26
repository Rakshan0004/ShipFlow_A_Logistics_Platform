package com.zippy.backend.repository;

import com.zippy.backend.model.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

    Optional<Shipment> findByOrderId(Long orderId);

    Optional<Shipment> findByTrackingNumber(String trackingNumber);

    Optional<Shipment> findByCarrierShipmentId(String carrierShipmentId);

    Optional<Shipment> findByOrder_ZippyOrderId(String zippyOrderId);
}
