package com.database.auction.service.impl;

import com.database.auction.dto.LoginDTO;
import com.database.auction.dto.ProfileDTO;
import com.database.auction.dto.UsersDTO;
import com.database.auction.entity.Users;
import com.database.auction.enums.RoleType;
import com.database.auction.exception.UserNotFound;
import com.database.auction.mapper.UsersMapper;
import com.database.auction.repository.UserDetailsRepository;
import com.database.auction.repository.UsersRepository;
import com.database.auction.service.UsersService;
import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class UsersServiceImpl implements UsersService {

    private UsersRepository usersRepository;
    private UserDetailsRepository userDetailsRepository;
    private final JdbcTemplate jdbc;

    @Autowired
    public UsersServiceImpl(UsersRepository usersRepository,
                            UserDetailsRepository userDetailsRepository,
                            JdbcTemplate jdbc) {
        this.usersRepository = usersRepository;
        this.userDetailsRepository = userDetailsRepository;
        this.jdbc = jdbc;
    }

    @Override
    public UsersDTO createUsers(UsersDTO usersDTO) {
        try {
            log.info("=== USERSERVICE CREATEUSERS START ===");
            log.info("Creating user with username: {}, email: {}, role: {}", 
                    usersDTO.getUsername(), usersDTO.getEmail(), usersDTO.getRole());
            
            // Additional validation
            if (usersDTO.getUsername() == null || usersDTO.getUsername().trim().isEmpty()) {
                throw new IllegalArgumentException("Username cannot be null or empty");
            }
            
            if (usersDTO.getEmail() == null || usersDTO.getEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Email cannot be null or empty");
            }
            
            if (usersDTO.getPassword_hash() == null || usersDTO.getPassword_hash().trim().isEmpty()) {
                throw new IllegalArgumentException("Password cannot be null or empty");
            }
            
            if (usersDTO.getRole() == null) {
                throw new IllegalArgumentException("Role cannot be null");
            }
            
            log.info("Validation passed, mapping DTO to entity...");
            
            // Map DTO to entity; store password as provided (no hashing per requirement)
            Users users = UsersMapper.mapToUsers(usersDTO);
            log.info("Mapped user entity: {}", users.toString());
            
            // Check if user already exists
            log.info("Checking if user already exists...");
            Optional<Users> existingUser = usersRepository.findByUsername(usersDTO.getUsername());
            if (existingUser.isPresent()) {
                log.error("User with username '{}' already exists", usersDTO.getUsername());
                throw new RuntimeException("User with username '" + usersDTO.getUsername() + "' already exists");
            }
            
            Optional<Users> existingEmail = usersRepository.findByEmail(usersDTO.getEmail());
            if (existingEmail.isPresent()) {
                log.error("User with email '{}' already exists", usersDTO.getEmail());
                throw new RuntimeException("User with email '" + usersDTO.getEmail() + "' already exists");
            }
            
            log.info("No existing user found, attempting to save...");
            
            // Save user
            Users savedUsers = usersRepository.save(users);
            log.info("User saved successfully with ID: {}", savedUsers.getId());
            
            // Map back to DTO
            UsersDTO result = UsersMapper.mapToUsersDto(savedUsers);
            log.info("Mapped back to DTO: {}", result.toString());
            
            log.info("=== USERSERVICE CREATEUSERS SUCCESS ===");
            return result;
            
        } catch (Exception e) {
            log.error("=== USERSERVICE CREATEUSERS FAILED ===");
            log.error("Error creating user: {}", e.getMessage(), e);
            
            if (e instanceof IllegalArgumentException) {
                throw e; // Re-throw validation errors
            } else if (e instanceof RuntimeException) {
                throw e; // Re-throw business logic errors
            } else {
                throw new RuntimeException("Failed to create user: " + e.getMessage(), e);
            }
        }
    }

    @Override
    public UsersDTO getUsers(Integer user_id) {
        Users users = usersRepository.findById((long) user_id)
                .orElseThrow(() -> new UserNotFound("User Does not exist " + user_id));
        return UsersMapper.mapToUsersDto(users);
    }

    @Override
    public UsersDTO loginUser(LoginDTO loginDTO) {
        Users users = usersRepository.findByUsername(loginDTO.getUsername()).orElse(null);
        if (users == null && loginDTO.getUsername() != null && loginDTO.getUsername().contains("@")) {
            users = usersRepository.findByEmail(loginDTO.getUsername()).orElse(null);
        }
        if (users == null) {
            throw new UserNotFound("Invalid credentials for " + loginDTO.getUsername());
        }

        String storedHash = users.getPassword_hash();
        String candidate  = loginDTO.getPassword_hash();

        if (storedHash == null || candidate == null || candidate.isBlank()) {
            throw new UserNotFound("Invalid credentials for " + loginDTO.getUsername());
        }

        boolean matches = false;
        // Accept existing hashed users (backward compatibility)
        if (storedHash.startsWith("$2")) {
            try {
                matches = org.springframework.security.crypto.bcrypt.BCrypt.checkpw(candidate, storedHash);
            } catch (Exception ignore) { /* fall through */ }
        }
        // Plain-text comparison (new requirement)
        if (!matches) {
            matches = storedHash.equals(candidate);
        }

        if (!matches) {
            throw new UserNotFound("Invalid credentials for " + loginDTO.getUsername());
        }
        return UsersMapper.mapToUsersDto(users);
    }

    @Override
    public ProfileDTO getProfileByUsername(String username) {
        // JDBC-based fetching as before...
        String sql = """
                SELECT 
                  u.id              AS userId,
                  u.username        AS username,
                  u.password_hash   AS passwordHash,
                  u.email           AS email,
                  u.role            AS role,
                  d.first_name      AS firstName,
                  d.last_name       AS lastName,
                  d.address         AS address,
                  d.phone_number    AS phoneNumber
                FROM Users u
                LEFT JOIN user_details d ON u.username = d.username
                WHERE u.username = ?
                """;

        return jdbc.queryForObject(
                sql,
                new Object[]{username},
                (rs, rowNum) -> {
                    ProfileDTO p = new ProfileDTO();
                    p.setUserId(rs.getInt("userId"));
                    p.setUsername(rs.getString("username"));
                    //p.setPasswordHash(rs.getString ("passwordHash"));
                    p.setEmail(rs.getString("email"));
                    p.setRole(RoleType.valueOf(rs.getString("role")));
                    p.setFirstName(rs.getString("firstName"));
                    p.setLastName(rs.getString("lastName"));
                    p.setAddress(rs.getString("address"));
                    p.setPhoneNumber(rs.getString("phoneNumber"));
                    return p;
                }
        );
    }

    @Override
    public ProfileDTO updateProfile(String username, ProfileDTO dto) {
        // 1) ensure user exists
        Users user = usersRepository.findByUsername(username).orElseThrow();
        if (user == null) {
            throw new EntityNotFoundException("User not found: " + username);
        }

        // 2) update or insert details
        int updated = userDetailsRepository.updateDetails(
                username,
                dto.getFirstName(),
                dto.getLastName(),
                dto.getAddress(),
                dto.getPhoneNumber()
        );
        if (updated == 0) {
            userDetailsRepository.insertDetails(
                    username,
                    dto.getFirstName(),
                    dto.getLastName(),
                    dto.getAddress(),
                    dto.getPhoneNumber()
            );
        }

        // 3) fetch back updated profile via JDBC
        return getProfileByUsername(username);
    }

    @Override
    public ProfileDTO getProfileByUserId(int userId) {
        // fetch the username for this userId
        Users user = usersRepository.findById((long) userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
        // reuse your JDBC-based loader
        return getProfileByUsername(user.getUsername());
    }

    @Override
    public ProfileDTO updateProfileByUserId(int userId, ProfileDTO dto) {
        // fetch the username for this userId
        Users user = usersRepository.findById((long) userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        // delegate to your existing username-based updater
        return updateProfile(user.getUsername(), dto);
    }

    public int pwd_Change(int userId, String password_hash) {
        System.out.println("In Service Implementation");
        // fetch the username for this userId
        Users user = usersRepository.findById((long) userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
        // reuse your JDBC-based loader
        System.out.println(password_hash);
        String sql = """
                    UPDATE users u
                    SET  u.password_hash = ?
                    WHERE u.id = ?;
                """;

        int rows = jdbc.update(
                sql,
                password_hash, (long) userId

        );
        System.out.println("Rows updated: " + rows);

        if (rows != 1) {

            throw new EntityNotFoundException("User not found: " + userId);
        }

        return rows;

    }

    public int setPasswordToNull(int userId) {
        Users user = usersRepository.findById((long) userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));


        System.out.println(user.getId());
        String sql = """
                
                   update users u
                   set password_hash=null
                    WHERE u.id=?;
                """;

        int rows = jdbc.update(
                sql, (long) userId
        );

        System.out.println("Rows updated: " + rows);

        if (rows != 1) {

            throw new EntityNotFoundException("UserId not found: " + userId);
        }

        return rows;
    }

    public List<UsersDTO> getAllNullPassword() {
        String sql = """
                SELECT id, username, password_hash, email
                  FROM users
                 WHERE password_hash IS NULL
                """;

        List<UsersDTO> list = jdbc.query(
                sql,
                (rs, rowNum) -> {
                    UsersDTO p = new UsersDTO();
                    p.setUser_id(rs.getInt("id"));
                    p.setUsername(rs.getString("username"));
                    p.setPassword_hash(rs.getString("password_hash"));
                    p.setEmail(rs.getString("email"));
                    return p;
                }
        );

        return list;
    }

    @Override
    public UsersDTO createAdminUser(String username, String email, String passwordHash) {
        log.info("Creating admin user with username: {}, email: {}", username, email);
        
        // Check if user already exists
        Optional<Users> existingUser = usersRepository.findByUsername(username);
        if (existingUser.isPresent()) {
            throw new RuntimeException("User with username '" + username + "' already exists");
        }
        
        // Create new admin user (store password as provided)
        Users adminUser = new Users();
        adminUser.setUsername(username);
        adminUser.setEmail(email);
        adminUser.setPassword_hash(passwordHash);
        adminUser.setRole(RoleType.ADMIN);
        
        Users savedUser = usersRepository.save(adminUser);
        log.info("Admin user created successfully with ID: {}", savedUser.getId());
        
        return UsersMapper.mapToUsersDto(savedUser);
    }
}




