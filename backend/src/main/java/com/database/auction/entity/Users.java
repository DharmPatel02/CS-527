package com.database.auction.entity;

import com.database.auction.enums.RoleType;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@ToString
@Entity
@NoArgsConstructor
//@AllArgsConstructor
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

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private RoleType role;

    public Users(Long id, String username, String password_hash, String email, RoleType role) {
        this.id = id;
        this.username = username;
        this.password_hash = password_hash;
        this.email = email;
        this.role = role;
    }
}
