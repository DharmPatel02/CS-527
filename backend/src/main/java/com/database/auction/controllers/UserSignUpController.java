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

import java.util.List;
import java.util.Map;


@Slf4j
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
@AllArgsConstructor
public class UserSignUpController {

    @Autowired
    private UsersService usersService;

    @PostMapping("/signup")
    public ResponseEntity<UsersDTO> createUsers(@RequestBody UsersDTO usersDTO){
        System.out.println("Sign up for Username : "+usersDTO.getUsername());
        System.out.println("The role of User "+usersDTO.getRole());
        return new ResponseEntity<>(usersService.createUsers(usersDTO), HttpStatus.CREATED);
    }

    @GetMapping("{user_id}")
    public ResponseEntity<UsersDTO> getUserbyId(@PathVariable("user_id") Integer id){
       UsersDTO usersDTO = usersService.getUsers(id);
       System.out.println("Searching for the ID  "+usersDTO.getUser_id());
       return ResponseEntity.ok(usersDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<UsersDTO> loginUser(@RequestBody @Valid LoginDTO loginDTO){
        System.out.println("User is logging in");
        return new ResponseEntity<>(usersService.loginUser(loginDTO), HttpStatus.OK);
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<ProfileDTO> getProfile(
            @PathVariable int userId) {

        ProfileDTO profile = usersService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }

    /**
     * PUT /auth/editprofile/{userId}
     */
    @PutMapping("/editprofile/{userId}")
    public ResponseEntity<ProfileDTO> editProfile(
            @PathVariable int userId,
            @RequestBody ProfileDTO profileDto) {

        ProfileDTO updated = usersService.updateProfileByUserId(userId, profileDto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value="/pwd_change/{userId}",consumes=MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> pwd_Change(
            @PathVariable int userId,
            @RequestBody PasswordDTO password_hash)
    {
        System.out.println("In Controller");
        log.info("pass" + password_hash);
        int rows= usersService.pwd_Change(userId, password_hash.getPassword_hash());
        //return  usersService.pwd_Change(userId, password_hash);

        if(rows>0)
            return ResponseEntity.status(HttpStatus.CREATED).build();

        return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).build();



    }



    @PostMapping("/nullify-password/{userId}")
    public ResponseEntity<Void> pwd_Nullify(
            @PathVariable int userId) {
        System.out.println("In Controller – nullify password");
        log.info("Nullifying password for userId=" + userId);

        int rows = usersService.setPasswordToNull(userId);
        // service returns number of rows updated

        if (rows > 0) {
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } else {
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).build();
        }
    }

    @GetMapping("/null-passwords")
    public ResponseEntity<List<UsersDTO>> getAllNullPasswords() {
        List<UsersDTO> users = usersService.getAllNullPassword();
        if (users.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(users);
    }

    @PostMapping("/admin/create")
    public ResponseEntity<UsersDTO> createAdminUser(@RequestBody Map<String, String> requestBody) {
        try {
            String username = requestBody.get("username");
            String email = requestBody.get("email");
            String passwordHash = requestBody.get("passwordHash");
            
            if (username == null || email == null || passwordHash == null) {
                return ResponseEntity.badRequest().build();
            }
            
            UsersDTO adminUser = usersService.createAdminUser(username, email, passwordHash);
            log.info("Admin user created via REST endpoint: {}", adminUser.getUsername());
            
            return new ResponseEntity<>(adminUser, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            log.error("Error creating admin user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

}





