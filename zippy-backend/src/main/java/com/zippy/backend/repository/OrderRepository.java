package com.zippy.backend.repository;

import com.zippy.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByZippyOrderId(String zippyOrderId);

    boolean existsByMerchantOrderId(String merchantOrderId);

    Optional<Order> findTopByOrderByIdDesc();
}
