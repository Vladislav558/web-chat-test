package com.example.chat.web_chat_test.service.auth;

import com.example.chat.web_chat_test.models.dto.OnlineUserRequest;
import com.example.chat.web_chat_test.models.AuthProvider;
import com.example.chat.web_chat_test.models.User;
import com.example.chat.web_chat_test.repositories.UserRepository;
import com.example.chat.web_chat_test.service.mail.EmailService;
import com.example.chat.web_chat_test.utils.JwtUtil;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Map;
import java.util.List;
import java.util.Set;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil, EmailService emailService) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    @Transactional
    public User registerUser(String email, String password, String firstName, String lastName) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            throw new RuntimeException("This email is already registered!");
        }

        String verificationCode = generateVerificationCode();

        User user = new User();
        user.setEmail(email);
        user.setAuthProvider(AuthProvider.EMAIL);
        user.setVerificationCode(verificationCode);
        user.setVerified(false);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setProfilePicture(generateAvatar(firstName, lastName));

        userRepository.save(user);

        emailService.sendVerificationEmail(email, verificationCode);

        return user;
    }

    @Transactional
    public Map<String, String> verifyUser(String email, String code, boolean rememberMe) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (!user.getVerificationCode().equals(code)) {
            throw new RuntimeException("Invalid verification code!");
        }

        user.setVerified(true);
        user.setVerificationCode(null);
        userRepository.save(user);

        return generateTokens(user, rememberMe);
    }

    @Transactional
    public Map<String, String> loginUser(String email, String password, boolean rememberMe) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password!");
        }

        if (!user.isVerified()) {
            throw new RuntimeException("Email is not verified!");
        }

        return generateTokens(user, rememberMe);
    }

    @Transactional(readOnly = true)
    public Optional<User> checkAuth(String accessToken) {
        if (accessToken == null || !jwtUtil.validateToken(accessToken)) {
            return Optional.empty();
        }
    
        String email = jwtUtil.getEmailFromToken(accessToken);
        return userRepository.findByEmail(email);
    }
    
    @Transactional
    public Map<String, String> oauthLoginUser(String email) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isEmpty()) {
            throw new RuntimeException("User not found in database after VK OAuth!");
        }

        return generateTokens(existingUser.get(), true);
    }

    public String refreshAccessToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token!");
        }

        String email = jwtUtil.getEmailFromToken(refreshToken);
        return jwtUtil.generateAccessToken(email);
    }

    @Transactional(readOnly = true)
    public List<OnlineUserRequest> findUsersByIds(Set<Long> userIds) {
        return userRepository.findByIdIn(userIds.stream().toList())
                .stream()
                .map(user -> new OnlineUserRequest(user.getId(), user.getFirstName(), user.getLastName(), user.getProfilePicture()))
                .collect(Collectors.toList());
    }

    private Map<String, String> generateTokens(User user, boolean rememberMe) {
        long refreshExpiry = rememberMe ? -1 : 60 * 60 * 24;

        return Map.of(
            "access_token", jwtUtil.generateAccessToken(user.getEmail()),
            "refresh_token", jwtUtil.generateRefreshToken(user.getEmail(), refreshExpiry)
        );
    }

    private String generateAvatar(String firstName, String lastName) {
        String initials = firstName.charAt(0) + (lastName != null && !lastName.isEmpty() ? lastName.substring(0, 1) : "");
        return "https://ui-avatars.com/api/?name=" + initials + "&background=random&color=fff&bold=true";
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}
