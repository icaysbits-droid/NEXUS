# ==========================================
# Etapa 1: Compilación con Maven y JDK 21
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copiamos la configuración de Maven primero (aprovecha la caché de Docker)
COPY pom.xml mvnw ./
COPY .mvn .mvn/
RUN chmod +x ./mvnw && ./mvnw dependency:go-offline -B

# Copiamos el código fuente y generamos el .jar
COPY src src/
RUN ./mvnw clean package -DskipTests

# ==========================================
# Etapa 2: Imagen final ligera (JRE 21) sin privilegios root
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Crear usuario dedicado sin privilegios root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiamos solo el ejecutable JAR compilado con permisos del usuario dedicado
COPY --from=builder --chown=appuser:appgroup /app/target/*.jar app.jar

USER appuser

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]