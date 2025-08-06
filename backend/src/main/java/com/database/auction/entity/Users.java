package com.database.auction.entity;

import com.database.auction.converter.RoleTypeConverter;
import com.database.auction.enums.RoleType;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@ToString
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "username",unique = true, nullable = false)
    private String username;

    @Column(name = "password_hash",nullable = false)
    private String password_hash;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Convert(converter = RoleTypeConverter.class)
    @Column(name = "role", columnDefinition = "user_role")
    private RoleType role;
}
