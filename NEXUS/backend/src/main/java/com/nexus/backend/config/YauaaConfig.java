package com.nexus.backend.config;

import nl.basjes.parse.useragent.UserAgentAnalyzer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración del analizador de User-Agent Yauaa.
 * Define el analizador como un Bean Singleton de Spring para que sus reglas
 * se carguen en memoria una única vez al iniciar la aplicación.
 */
@Configuration
public class YauaaConfig {

    @Bean
    public UserAgentAnalyzer userAgentAnalyzer() {
        return UserAgentAnalyzer
                .newBuilder()
                .hideMatcherLoadStats()
                .withCache(1000)
                .withFields(
                        "DeviceClass",
                        "OperatingSystemNameVersion",
                        "AgentNameVersion"
                )
                .build();
    }
}
