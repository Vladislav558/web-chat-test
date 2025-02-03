package com.example.chat.web_chat_test.service.auth;

import org.springframework.http.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.core.endpoint.OAuth2AccessTokenResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class VkAccessTokenResponseClient implements OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> {

    private static final Logger logger = LoggerFactory.getLogger(VkAccessTokenResponseClient.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public OAuth2AccessTokenResponse getTokenResponse(OAuth2AuthorizationCodeGrantRequest request) {
        logger.info("[VkAccessTokenResponseClient] Requesting OAuth2 token from VK API");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", request.getClientRegistration().getClientId());
        body.add("client_secret", request.getClientRegistration().getClientSecret());
        body.add("code", request.getAuthorizationExchange().getAuthorizationResponse().getCode());
        body.add("redirect_uri", request.getClientRegistration().getRedirectUri());
        body.add("grant_type", "authorization_code");
        body.add("v", "5.131");

        logger.info("[VkAccessTokenResponseClient] Sending request with body: {}", body);

        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<Map<String, Object>> responseEntity = restTemplate.exchange(
                request.getClientRegistration().getProviderDetails().getTokenUri(),
                HttpMethod.POST,
                requestEntity,
                new org.springframework.core.ParameterizedTypeReference<>() {}
        );

        Map<String, Object> responseBody = responseEntity.getBody();
        logger.info("[VkAccessTokenResponseClient] VK API response: {}", responseBody);

        if (responseBody == null || !responseBody.containsKey("access_token")) {
            throw new RuntimeException("[VkAccessTokenResponseClient] VK OAuth token response is invalid: " + responseBody);
        }

        String accessToken = (String) responseBody.get("access_token");
        String userId = String.valueOf(responseBody.get("user_id"));

        logger.info("[VkAccessTokenResponseClient] Received accessToken: {}", accessToken);
        logger.info("[VkAccessTokenResponseClient] Received userId: {}", userId);

        return OAuth2AccessTokenResponse.withToken(accessToken)
                .tokenType(org.springframework.security.oauth2.core.OAuth2AccessToken.TokenType.BEARER)
                .expiresIn(((Number) responseBody.getOrDefault("expires_in", 3600)).longValue())
                .additionalParameters(Map.of( "user_id", userId))
                .scopes(request.getClientRegistration().getScopes())
                .build();
    }
}
