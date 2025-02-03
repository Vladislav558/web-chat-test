package com.example.chat.web_chat_test.service.auth;

import com.example.chat.web_chat_test.models.AuthProvider;
import com.example.chat.web_chat_test.models.User;
import com.example.chat.web_chat_test.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpMethod;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class VkOAuth2UserService extends DefaultOAuth2UserService {
    private static final Logger logger = LoggerFactory.getLogger(VkOAuth2UserService.class);

    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public VkOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        logger.info("Loading user from VK OAuth (custom)");
    
        String accessToken = userRequest.getAccessToken().getTokenValue();
        logger.info("Retrieved accessToken: {}", accessToken);
    
        Map<String, Object> additionalParams = userRequest.getAdditionalParameters();
        String email = (String) additionalParams.get("email");
        String userId = String.valueOf(additionalParams.get("user_id"));
        logger.info("Email from additionalParameters: {}", email);
        logger.info("User ID from additionalParameters: {}", userId);
    
        Map<String, String> profileInfo = fetchProfileInfoFromVk(accessToken);
        if ((email == null || email.isEmpty()) && profileInfo.containsKey("email")) {
            email = profileInfo.get("email");
        }
        String firstName = profileInfo.get("first_name");
        String lastName = profileInfo.get("last_name");
        String photo200 = profileInfo.get("photo_200");
        logger.info("Retrieved first_name={}, last_name={}, photo_200={}",
                firstName, lastName, photo200);
    
        if (email == null || email.isEmpty()) {
            email = "vk_" + userId + "@vk.com";
            logger.warn("Email is still null, using fake email: {}", email);
        }
    
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        User userEntity;
        if (existingUserOpt.isEmpty()) {
            userEntity = new User();
            userEntity.setEmail(email);
            userEntity.setAuthProvider(AuthProvider.VK);
            userEntity.setVerified(true);
            logger.info("New user created: {}", email);
        } else {
            userEntity = existingUserOpt.get();
            logger.info("User already exists: {}", email);
        }
    
        userEntity.setFirstName(firstName);
        userEntity.setLastName(lastName);
        userEntity.setProfilePicture(photo200);
        userRepository.save(userEntity);
    
        Map<String, Object> userAttributes = new HashMap<>();
        userAttributes.put("email", email);
        userAttributes.put("user_id", userId);
        userAttributes.put("first_name", firstName);
        userAttributes.put("last_name", lastName);
        userAttributes.put("profile_picture", photo200);
    
        return new DefaultOAuth2User(
            Collections.emptyList(),
            userAttributes,
            "user_id"
        );
    }
    
    private Map<String, String> fetchProfileInfoFromVk(String accessToken) {
        String url = "https://api.vk.com/method/account.getProfileInfo?access_token=" + accessToken + "&v=5.131";
        logger.info("Requesting profile info from VK API: {}", url);
    
        ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
            url,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<>() {}
        );
        Map<String, Object> response = responseEntity.getBody();
        logger.info("VK API response: {}", response);
    
        if (response == null || !response.containsKey("response")) {
            logger.error("Failed to fetch profile info from VK API: {}", response);
            return Map.of(
                "email", "",
                "first_name", "",
                "last_name", "",
                "photo_200", ""
            );
        }
    
        try {
            Map<String, Object> profileData = (Map<String, Object>) response.get("response");
            String email = (String) profileData.get("email");
            String firstName = (String) profileData.get("first_name");
            String lastName = (String) profileData.get("last_name");
            String photo200 = (String) profileData.get("photo_200");
    
            logger.info("Retrieved email={}, first_name={}, last_name={}, photo_200={}",
                    email, firstName, lastName, photo200);
    
            return Map.of(
                "email", email != null ? email : "",
                "first_name", firstName != null ? firstName : "",
                "last_name", lastName != null ? lastName : "",
                "photo_200", photo200 != null ? photo200 : ""
            );
        } catch (Exception e) {
            logger.error("Error parsing VK profile info response: {}", e.getMessage());
            return Map.of(
                "email", "",
                "first_name", "",
                "last_name", "",
                "photo_200", ""
            );
        }
    }
    
}
