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
# Etapa 2: Imagen final ligera (JRE 21)
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copiamos solo el ejecutable JAR compilado
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]