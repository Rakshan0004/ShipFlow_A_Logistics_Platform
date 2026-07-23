FROM eclipse-temurin:21-jdk-alpine as builder
WORKDIR /workspace
COPY . .
RUN ./gradlew :zippy-backend:bootJar -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /workspace/zippy-backend/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
