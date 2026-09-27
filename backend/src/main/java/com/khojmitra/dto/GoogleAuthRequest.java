package com.khojmitra.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {
    private String email;
    private String name;
    private String avatarUrl;
    private String googleId;
    private String idToken;
}
