package com.database.auction.mapper;

import com.database.auction.dto.UsersDTO;
import com.database.auction.entity.Users;

public class UsersMapper {

    public static UsersDTO mapToUsersDto(Users users){
        UsersDTO dto = new UsersDTO();
        dto.setUser_id(users.getId().intValue());
        dto.setUsername(users.getUsername());
        dto.setEmail(users.getEmail());
        dto.setRole(users.getRole());
        return dto;
    }

    public static Users mapToUsers(UsersDTO usersDTO){
        Users u = new Users();
        // **do not** set userId here—DB will generate it
        u.setUsername(usersDTO.getUsername());
        u.setPassword_hash(usersDTO.getPassword_hash());
        u.setEmail(usersDTO.getEmail());
        u.setRole(usersDTO.getRole());
        return u;
    }


}
