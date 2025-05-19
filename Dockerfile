FROM eclipse-temurin:17-jre
WORKDIR /app
COPY spring/target/fred-data-backend-1.0.0.jar app.jar
ENTRYPOINT ["java","-jar","/app/app.jar"]
