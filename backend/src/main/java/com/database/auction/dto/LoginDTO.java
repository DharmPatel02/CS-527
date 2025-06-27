package com.database.auction.dto;


import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Data
public class LoginDTO {
    private String username;
    private String password_hash;

    public LoginDTO(String username, String password_hash) {
        this.username = username;
        this.password_hash = password_hash;
    }
}
