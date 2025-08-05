package com.database.auction.controllers;

import com.database.auction.dto.UsersDTO;
import com.database.auction.entity.Users;
import com.database.auction.enums.RoleType;
import com.database.auction.repository.UsersRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/test")
public class TestController {

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Backend is running");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/db-connection")
    public ResponseEntity<Map<String, Object>> testDatabaseConnection() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Test basic database connection
            String result = jdbcTemplate.queryForObject("SELECT 'Database connected' as status", String.class);
            response.put("database_status", result);
            response.put("database_connected", true);
            
            // Test users table access
            Long userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Long.class);
            response.put("users_count", userCount);
            response.put("users_table_accessible", true);
            
        } catch (Exception e) {
            response.put("database_connected", false);
            response.put("error", e.getMessage());
            log.error("Database connection test failed", e);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/create-test-user")
    public ResponseEntity<Map<String, Object>> createTestUser() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Create a test user directly
            Users testUser = new Users();
            testUser.setUsername("test_user_" + System.currentTimeMillis());
            testUser.setEmail("test@test.com");
            testUser.setPassword_hash("test_hash");
            testUser.setRole(RoleType.BUYER);
            
            log.info("Attempting to save test user: {}", testUser.getUsername());
            Users savedUser = usersRepository.save(testUser);
            
            response.put("success", true);
            response.put("user_id", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("message", "Test user created successfully");
            
            // Clean up the test user
            usersRepository.delete(savedUser);
            response.put("cleaned_up", true);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("error_type", e.getClass().getSimpleName());
            log.error("Test user creation failed", e);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test-signup")
    public ResponseEntity<Map<String, Object>> testSignup(@RequestBody UsersDTO usersDTO) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("Testing signup with: username={}, email={}, role={}", 
                    usersDTO.getUsername(), usersDTO.getEmail(), usersDTO.getRole());
            
            // Test the same flow as the real signup
            Users users = new Users();
            users.setUsername(usersDTO.getUsername());
            users.setEmail(usersDTO.getEmail());
            users.setPassword_hash(usersDTO.getPassword_hash());
            users.setRole(usersDTO.getRole());
            
            log.info("Attempting to save user: {}", users.toString());
            Users savedUsers = usersRepository.save(users);
            
            response.put("success", true);
            response.put("user_id", savedUsers.getId());
            response.put("username", savedUsers.getUsername());
            response.put("message", "User created successfully");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("error_type", e.getClass().getSimpleName());
            log.error("Test signup failed", e);
        }
        return ResponseEntity.ok(response);
    }
} 