package com.zippy.backend.repository;

import com.zippy.backend.model.ShippingQuote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShippingQuoteRepository extends JpaRepository<ShippingQuote, Long> {

    List<ShippingQuote> findByOrderId(Long orderId);

    void deleteByOrderId(Long orderId);
}
