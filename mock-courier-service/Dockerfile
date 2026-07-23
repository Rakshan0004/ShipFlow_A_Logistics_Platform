FROM eclipse-temurin:21-jdk-alpine as builder
WORKDIR /workspace
COPY . .
RUN ./gradlew :mock-courier-service:bootJar -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /workspace/mock-courier-service/build/libs/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
