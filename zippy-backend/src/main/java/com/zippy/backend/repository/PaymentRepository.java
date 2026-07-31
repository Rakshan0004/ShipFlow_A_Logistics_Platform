package com.zippy.backend.repository;

import com.zippy.backend.model.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrder_ZippyOrderId(String zippyOrderId);

    Optional<Payment> findByOrder_Id(Long orderId);

    Page<Payment> findByPaymentStatus(String paymentStatus, Pageable pageable);

    Page<Payment> findBySettlementStatus(String settlementStatus, Pageable pageable);

    Page<Payment> findByPaymentStatusAndSettlementStatus(String paymentStatus, String settlementStatus, Pageable pageable);

    boolean existsByOrder_Id(Long orderId);
}
