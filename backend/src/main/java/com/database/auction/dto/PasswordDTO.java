package com.database.auction.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PasswordDTO {

    // Accept both snake_case and camelCase JSON keys
    @JsonProperty("password_hash")
    private String passwordHash;

    // Backwards-compatible accessors used elsewhere in code
    public String getPassword_hash() { return passwordHash; }
    public void setPassword_hash(String v) { this.passwordHash = v; }
}
