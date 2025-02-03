package com.example.chat.web_chat_test.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    private static final String SECRET_KEY = "SuperSecretKeyForJWTGenerationThatIsVerySecure123SuperSecretKeyForJWTGenerationThatIsVerySecure123"; // Это лишь пример, на проде поменять!
    private static final long ACCESS_EXPIRATION = 1000 * 60 * 60 * 24;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ACCESS_EXPIRATION))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String email, long expiry) {
        Date expirationDate = expiry == -1 ? null : new Date(System.currentTimeMillis() + expiry);

        var jwtBuilder = Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .signWith(getSigningKey());

        if (expirationDate != null) {
            jwtBuilder.expiration(expirationDate);
        }

        return jwtBuilder.compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }
}