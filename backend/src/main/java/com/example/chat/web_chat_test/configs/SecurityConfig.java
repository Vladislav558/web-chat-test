package com.example.chat.web_chat_test.configs;

import com.example.chat.web_chat_test.security.JwtAuthenticationFilter;
import com.example.chat.web_chat_test.service.auth.AuthService;
import com.example.chat.web_chat_test.service.auth.VkOAuth2UserService;
import com.example.chat.web_chat_test.service.auth.VkAccessTokenResponseClient;
import com.example.chat.web_chat_test.utils.JwtUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Map;
import java.util.List;


@Configuration
public class SecurityConfig {

    private final VkOAuth2UserService vkOAuth2UserService;
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public SecurityConfig(VkOAuth2UserService vkOAuth2UserService, AuthService authService, JwtUtil jwtUtil) {
        this.vkOAuth2UserService = vkOAuth2UserService;
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, VkAccessTokenResponseClient vkAccessTokenResponseClient) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )

            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                })
            )

            .oauth2Login(oauth2 -> oauth2
                .tokenEndpoint(token -> token.accessTokenResponseClient(vkAccessTokenResponseClient))
                .userInfoEndpoint(u -> u.userService(vkOAuth2UserService))
                .successHandler((request, response, authentication) -> {
                    var principal = (OAuth2User) authentication.getPrincipal();
                    String email = (String) principal.getAttributes().get("email");
                    if (email == null) {
                        throw new RuntimeException("No email found in OAuth2User attributes!");
                    }
                    
                    Map<String, String> tokens = authService.oauthLoginUser(email);
                    String accessToken = tokens.get("access_token");
                    String refreshToken = tokens.get("refresh_token");

                    Cookie accessCookie = new Cookie("access_token", accessToken);
                    accessCookie.setPath("/");
                    accessCookie.setHttpOnly(true);

                    Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
                    refreshCookie.setPath("/");
                    refreshCookie.setHttpOnly(true);

                    response.addCookie(accessCookie);
                    response.addCookie(refreshCookie);

                    SecurityContextHolder.clearContext();

                    response.sendRedirect("/api/hello");
                })
                .failureHandler((request, response, exception) -> {
                    response.sendRedirect("/");
                })
            );

        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
}
}
