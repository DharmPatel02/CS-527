package com.database.auction.service.impl;

import com.database.auction.dto.LoginDTO;
import com.database.auction.dto.ProfileDTO;
import com.database.auction.dto.UsersDTO;
import com.database.auction.entity.UserDetails;
import com.database.auction.entity.Users;
import com.database.auction.enums.RoleType;
import com.database.auction.exception.UserNotFound;
import com.database.auction.mapper.ProfileMapper;
import com.database.auction.mapper.UsersMapper;
import com.database.auction.repository.UserDetailsRepository;
import com.database.auction.repository.UsersRepository;
import com.database.auction.service.UsersService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
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
        Users users = UsersMapper.mapToUsers(usersDTO);
        System.out.println(users.toString());
        Users savedUsers = usersRepository.save(users);

        return UsersMapper.mapToUsersDto(savedUsers);
    }

    @Override
    public UsersDTO getUsers(Integer user_id) {
        Users users = usersRepository.findById(user_id)
                .orElseThrow(() -> new UserNotFound("User Does not exist " + user_id));
        return UsersMapper.mapToUsersDto(users);
    }

    @Override
    public UsersDTO loginUser(LoginDTO loginDTO) {
        Users users = usersRepository.findByUsername(loginDTO.getUsername()).orElseThrow();
        System.out.println("Finding Username for " + loginDTO.getUsername() + " And " + loginDTO.getPassword_hash());
        if (users.getPassword_hash().equals(loginDTO.getPassword_hash())) {
            log.info("Username & Password is matching");
        } else {
            throw new UserNotFound("Password is not matching for " + loginDTO.getUsername());
        }
        return UsersMapper.mapToUsersDto(users);
    }

    @Override
    public ProfileDTO getProfileByUsername(String username) {
        // JDBC-based fetching as before...
        String sql = """
                SELECT 
                  u.user_id         AS userId,
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
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
        // reuse your JDBC-based loader
        return getProfileByUsername(user.getUsername());
    }

    @Override
    public ProfileDTO updateProfileByUserId(int userId, ProfileDTO dto) {
        // fetch the username for this userId
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        // delegate to your existing username-based updater
        return updateProfile(user.getUsername(), dto);
    }

    public int pwd_Change(int userId, String password_hash) {
        System.out.println("In Service Implementation");
        // fetch the username for this userId
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
        // reuse your JDBC-based loader
        System.out.println(password_hash);
        String sql = """
                
                    UPDATE users u
                    SET  u.password_hash = ?
                    WHERE u.user_id = ?;
                """;

        int rows = jdbc.update(
                sql,
                password_hash, userId

        );
        System.out.println("Rows updated: " + rows);

        if (rows != 1) {

            throw new EntityNotFoundException("User not found: " + userId);
        }

        return rows;

    }

    public int setPasswordToNull(int userId) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));


        System.out.println(user.getUserId());
        String sql = """
                
                   update users u
                   set password_hash=null
                    WHERE u.user_id=?;
                """;

        int rows = jdbc.update(
                sql, userId
        );

        System.out.println("Rows updated: " + rows);

        if (rows != 1) {

            throw new EntityNotFoundException("UserId not found: " + userId);
        }

        return rows;
    }

    public List<UsersDTO> getAllNullPassword() {
        String sql = """
                SELECT user_id, username, password_hash, email
                  FROM users
                 WHERE password_hash IS NULL
                """;

        List<UsersDTO> list = jdbc.query(
                sql,
                (rs, rowNum) -> {
                    UsersDTO p = new UsersDTO();
                    p.setUser_id(rs.getInt("user_id"));
                    p.setUsername(rs.getString("username"));
                    p.setPassword_hash(rs.getString("password_hash"));
                    p.setEmail(rs.getString("email"));
                    return p;
                }
        );

        return list;
    }
}




