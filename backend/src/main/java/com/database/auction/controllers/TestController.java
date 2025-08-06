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

    @GetMapping("/check-users-schema")
    public ResponseEntity<Map<String, Object>> checkUsersSchema() {
        Map<String, Object> response = new HashMap<>();
        try {
            // Check users table schema
            String schemaQuery = """
                SELECT column_name, data_type, is_nullable, udt_name
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'users'
                ORDER BY ordinal_position
                """;
            
            var schemaResults = jdbcTemplate.queryForList(schemaQuery);
            response.put("users_schema", schemaResults);
            
            // Check user_role enum
            String enumQuery = """
                SELECT t.typname AS enum_type_name, e.enumlabel AS enum_value
                FROM pg_type t
                JOIN pg_enum e ON t.oid = e.enumtypid
                WHERE t.typname = 'user_role'
                ORDER BY e.enumsortorder
                """;
            
            var enumResults = jdbcTemplate.queryForList(enumQuery);
            response.put("user_role_enum", enumResults);
            
            response.put("success", true);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            log.error("Schema check failed", e);
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
            log.info("User entity details: id={}, username={}, email={}, role={}", 
                    testUser.getId(), testUser.getUsername(), testUser.getEmail(), testUser.getRole());
            
            Users savedUser = usersRepository.save(testUser);
            
            response.put("success", true);
            response.put("user_id", savedUser.getId());
            response.put("username", savedUser.getUsername());
            response.put("role", savedUser.getRole());
            response.put("message", "Test user created successfully");
            
            // Clean up the test user
            usersRepository.delete(savedUser);
            response.put("cleaned_up", true);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("error_type", e.getClass().getSimpleName());
            response.put("error_stack", e.getStackTrace());
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
            
            log.info("User entity before save: {}", users.toString());
            log.info("Role type: {}, Role value: {}", users.getRole().getClass().getName(), users.getRole());
            
            Users savedUsers = usersRepository.save(users);
            
            response.put("success", true);
            response.put("user_id", savedUsers.getId());
            response.put("username", savedUsers.getUsername());
            response.put("role", savedUsers.getRole());
            response.put("message", "User created successfully");
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("error_type", e.getClass().getSimpleName());
            response.put("error_stack", e.getStackTrace());
            log.error("Test signup failed", e);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/test-direct-sql")
    public ResponseEntity<Map<String, Object>> testDirectSql(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String username = request.get("username");
            String email = request.get("email");
            String password = request.get("password");
            String role = request.get("role");
            
            log.info("Testing direct SQL insertion: username={}, email={}, role={}", username, email, role);
            
            // Test direct SQL insertion
            String sql = "INSERT INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?::user_role)";
            jdbcTemplate.update(sql, username, password, email, role);
            
            // Verify the user was created
            String selectSql = "SELECT id, username, email, role FROM users WHERE username = ?";
            var user = jdbcTemplate.queryForMap(selectSql, username);
            
            response.put("success", true);
            response.put("user", user);
            response.put("message", "Direct SQL insertion successful");
            
            // Clean up
            jdbcTemplate.update("DELETE FROM users WHERE username = ?", username);
            response.put("cleaned_up", true);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("error_type", e.getClass().getSimpleName());
            log.error("Direct SQL test failed", e);
        }
        return ResponseEntity.ok(response);
    }
} 