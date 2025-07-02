# ----------- STAGE 1: Build the JAR -----------
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# ----------- STAGE 2: Run the JAR -------------
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=builder /app/target/auction-system-0.0.1-SNAPSHOT.jar app.jar
# Port is dynamically configured via environment variable in application.properties
ENTRYPOINT ["java", "-jar", "app.jar"]
