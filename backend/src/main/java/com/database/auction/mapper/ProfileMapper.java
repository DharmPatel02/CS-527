package com.database.auction.mapper;

import com.database.auction.dto.ProfileDTO;
import com.database.auction.entity.Users;
import com.database.auction.entity.UserDetails;

public class ProfileMapper {
    public static ProfileDTO toProfileDto(Users user, UserDetails details) {
        ProfileDTO dto = new ProfileDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());

        if (details != null) {
            dto.setFirstName(details.getFirstName());
            dto.setLastName(details.getLastName());
            dto.setAddress(details.getAddress());
            dto.setPhoneNumber(details.getPhoneNumber());
        }
        return dto;
    }
}
