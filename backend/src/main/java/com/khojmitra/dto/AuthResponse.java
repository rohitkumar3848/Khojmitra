package com.khojmitra.dto;

import com.khojmitra.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String id;
    private String name;
    private String email;
    private Set<Role> roles;
    private String department;
    private String officeLocation;
    private String avatarUrl;
    private Integer karmaPoints;
    private Double walletBalance;
}
