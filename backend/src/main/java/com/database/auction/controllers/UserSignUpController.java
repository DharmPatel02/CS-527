package com.database.auction.controllers;

import com.database.auction.dto.LoginDTO;
import com.database.auction.dto.PasswordDTO;
import com.database.auction.dto.ProfileDTO;
import com.database.auction.dto.UsersDTO;
import com.database.auction.entity.Users;
import com.database.auction.service.UsersService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class UserSignUpController {

    @Autowired
    private UsersService usersService;

    @PostMapping("/signup")
    public ResponseEntity<?> createUsers(@RequestBody UsersDTO usersDTO) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("=== SIGNUP REQUEST START ===");
            log.info("Received signup request for Username: {}, Email: {}, Role: {}", 
                    usersDTO.getUsername(), usersDTO.getEmail(), usersDTO.getRole());
            
            // Comprehensive validation
            if (usersDTO.getUsername() == null || usersDTO.getUsername().trim().isEmpty()) {
                response.put("error", "Username is required");
                response.put("field", "username");
                log.error("Validation failed: Username is null or empty");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (usersDTO.getEmail() == null || usersDTO.getEmail().trim().isEmpty()) {
                response.put("error", "Email is required");
                response.put("field", "email");
                log.error("Validation failed: Email is null or empty");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (usersDTO.getPassword_hash() == null || usersDTO.getPassword_hash().trim().isEmpty()) {
                response.put("error", "Password is required");
                response.put("field", "password");
                log.error("Validation failed: Password is null or empty");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (usersDTO.getRole() == null) {
                response.put("error", "Role is required");
                response.put("field", "role");
                log.error("Validation failed: Role is null");
                return ResponseEntity.badRequest().body(response);
            }
            
            log.info("Validation passed, attempting to create user...");
            
            // Attempt to create user
            UsersDTO createdUser = usersService.createUsers(usersDTO);
            
            log.info("User created successfully with ID: {}", createdUser.getUser_id());
            
            response.put("success", true);
            response.put("message", "User created successfully");
            response.put("user", createdUser);
            
            log.info("=== SIGNUP REQUEST SUCCESS ===");
            return new ResponseEntity<>(response, HttpStatus.CREATED);
            
        } catch (Exception e) {
            log.error("=== SIGNUP REQUEST FAILED ===");
            log.error("Error creating user: {}", e.getMessage(), e);
            
            response.put("success", false);
            response.put("error", "Failed to create user: " + e.getMessage());
            response.put("error_type", e.getClass().getSimpleName());
            
            // Return detailed error for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("{user_id}")
    public ResponseEntity<UsersDTO> getUserbyId(@PathVariable("user_id") Integer id) {
        try {
            UsersDTO usersDTO = usersService.getUsers(id);
            log.info("Retrieved user with ID: {}", usersDTO.getUser_id());
            return ResponseEntity.ok(usersDTO);
        } catch (Exception e) {
            log.error("Error retrieving user with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<UsersDTO> loginUser(@RequestBody @Valid LoginDTO loginDTO) {
        try {
            log.info("Login attempt for username: {}", loginDTO.getUsername());
            UsersDTO user = usersService.loginUser(loginDTO);
            log.info("Login successful for user: {}", user.getUsername());
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Login failed for username {}: {}", loginDTO.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<ProfileDTO> getProfile(@PathVariable int userId) {
        try {
            ProfileDTO profile = usersService.getProfileByUserId(userId);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("Error retrieving profile for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/editprofile/{userId}")
    public ResponseEntity<ProfileDTO> editProfile(@PathVariable int userId, @RequestBody ProfileDTO profileDto) {
        try {
            ProfileDTO updated = usersService.updateProfileByUserId(userId, profileDto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error updating profile for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping(value = "/pwd_change/{userId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> pwd_Change(@PathVariable int userId, @RequestBody PasswordDTO password_hash) {
        try {
            log.info("Password change request for user ID: {}", userId);
            int rows = usersService.pwd_Change(userId, password_hash.getPassword_hash());
            
            if (rows > 0) {
                log.info("Password changed successfully for user ID: {}", userId);
                return ResponseEntity.status(HttpStatus.CREATED).build();
            } else {
                log.warn("No rows updated for password change, user ID: {}", userId);
                return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).build();
            }
        } catch (Exception e) {
            log.error("Error changing password for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/nullify-password/{userId}")
    public ResponseEntity<Void> pwd_Nullify(@PathVariable int userId) {
        try {
            log.info("Nullifying password for user ID: {}", userId);
            int rows = usersService.setPasswordToNull(userId);
            
            if (rows > 0) {
                log.info("Password nullified successfully for user ID: {}", userId);
                return ResponseEntity.status(HttpStatus.CREATED).build();
            } else {
                log.warn("No rows updated for password nullification, user ID: {}", userId);
                return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).build();
            }
        } catch (Exception e) {
            log.error("Error nullifying password for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/null-passwords")
    public ResponseEntity<List<UsersDTO>> getAllNullPasswords() {
        try {
            List<UsersDTO> users = usersService.getAllNullPassword();
            if (users.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error retrieving users with null passwords: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/admin/create")
    public ResponseEntity<?> createAdminUser(@RequestBody Map<String, String> requestBody) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            log.info("Admin user creation request: {}", requestBody);
            
            String username = requestBody.get("username");
            String email = requestBody.get("email");
            String passwordHash = requestBody.get("passwordHash");
            
            if (username == null || email == null || passwordHash == null) {
                response.put("error", "Missing required fields: username, email, passwordHash");
                return ResponseEntity.badRequest().body(response);
            }
            
            UsersDTO adminUser = usersService.createAdminUser(username, email, passwordHash);
            log.info("Admin user created successfully: {}", adminUser.getUsername());
            
            response.put("success", true);
            response.put("message", "Admin user created successfully");
            response.put("user", adminUser);
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
            
        } catch (RuntimeException e) {
            log.error("Error creating admin user: {}", e.getMessage());
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        } catch (Exception e) {
            log.error("Unexpected error creating admin user: {}", e.getMessage());
            response.put("success", false);
            response.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}





