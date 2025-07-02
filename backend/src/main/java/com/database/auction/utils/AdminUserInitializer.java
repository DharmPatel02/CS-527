package com.database.auction.utils;

import com.database.auction.service.UsersService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Utility class to create initial admin users when the application starts.
 * This is useful for setting up default admin accounts.
 * 
 * Usage: Set spring.profiles.active=init-admin to enable this component
 */
@Slf4j
@Component
@Profile("init-admin") // Only runs when 'init-admin' profile is active
public class AdminUserInitializer implements CommandLineRunner {

    @Autowired
    private UsersService usersService;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing admin users...");
        
        try {
            // Create default admin user
            // Note: In production, use a secure password hash
            String defaultAdminUsername = "admin";
            String defaultAdminEmail = "admin@auction.com";
            String defaultAdminPassword = "admin123"; // This should be hashed in real implementation
            
            usersService.createAdminUser(defaultAdminUsername, defaultAdminEmail, defaultAdminPassword);
            log.info("Default admin user created successfully!");
            
        } catch (RuntimeException e) {
            if (e.getMessage().contains("already exists")) {
                log.info("Admin user already exists, skipping creation.");
            } else {
                log.error("Error creating admin user: {}", e.getMessage());
            }
        }
    }
} 