package com.zippy.backend.controller;

import com.zippy.backend.service.WebhookProcessingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
@CrossOrigin(origins = "*")
public class WebhookController {

    private final WebhookProcessingService webhookProcessingService;

    public WebhookController(WebhookProcessingService webhookProcessingService) {
        this.webhookProcessingService = webhookProcessingService;
    }

    @PostMapping("/fastship")
    public ResponseEntity<WebhookProcessingService.WebhookResult> handleFastShipWebhook(@RequestBody String payload) {
        WebhookProcessingService.WebhookResult result = webhookProcessingService.processFastShipWebhook(payload);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/quickexpress")
    public ResponseEntity<WebhookProcessingService.WebhookResult> handleQuickExpressWebhook(@RequestBody String payload) {
        WebhookProcessingService.WebhookResult result = webhookProcessingService.processQuickExpressWebhook(payload);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reliable")
    public ResponseEntity<WebhookProcessingService.WebhookResult> handleReliableWebhook(@RequestBody String payload) {
        WebhookProcessingService.WebhookResult result = webhookProcessingService.processReliableWebhook(payload);
        return ResponseEntity.ok(result);
    }
}
