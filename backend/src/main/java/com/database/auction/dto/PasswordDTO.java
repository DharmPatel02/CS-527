package com.database.auction.dto;

import com.database.auction.enums.RoleType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
//@AllArgsConstructor
public class PasswordDTO {


    private String password_hash;



//    public UsersDTO(Integer user_id, String username, String password_hash, String email, RoleType role) {
//        this.user_id = user_id;
//        this.username = username;
//        this.password_hash = password_hash;
//        this.email = email;
//        this.role = role;
//    }
}
