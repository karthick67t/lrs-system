# Stage 1: Build stage using Maven and Java 17
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy Maven descriptor and source files
COPY pom.xml .
COPY src ./src

# Build production executable JAR skipping tests
RUN mvn clean package -DskipTests

# Stage 2: Minimal Java 17 runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy compiled JAR from build stage
COPY --from=build /app/target/rewards-backend-1.0.0.jar app.jar

# Expose default port
EXPOSE 8081

# Set entrypoint to run Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
