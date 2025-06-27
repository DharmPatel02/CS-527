package com.database.auction.service;


import com.database.auction.dto.LoginDTO;
import com.database.auction.dto.ProfileDTO;
import com.database.auction.dto.UsersDTO;
import com.database.auction.entity.Users;

import java.util.List;

public interface UsersService {
    UsersDTO createUsers(UsersDTO usersDTO);

    UsersDTO getUsers(Integer user_id);

    UsersDTO loginUser(LoginDTO loginDTO);
    ProfileDTO getProfileByUsername(String username);
    ProfileDTO updateProfile(String username, ProfileDTO profileDto);

    ProfileDTO getProfileByUserId(int userId);
    ProfileDTO updateProfileByUserId(int userId, ProfileDTO profileDto);
    int pwd_Change(int userId,String password_hash);
    int setPasswordToNull(int userId);
    List<UsersDTO> getAllNullPassword();

    //UsersDTO loginUsers()

}
