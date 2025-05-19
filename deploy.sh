#!/usr/bin/env bash
# deploy.sh
# ---------
# 1) mvn package → build the JAR
# 2) write Dockerfile
# 3) docker build & push to GHCR

set -euo pipefail

# 0) allow GH_TOKEN fallback
if [ -z "${GITHUB_TOKEN:-}" ] && [ -n "${GH_TOKEN:-}" ]; then
  export GITHUB_TOKEN="$GH_TOKEN"
fi

# 1) check auth
if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "❌ Please export GITHUB_TOKEN (or GH_TOKEN) with write:packages scope."
  exit 1
fi

# 2) build JAR
cd spring
mvn clean package -DskipTests
JAR=$(ls target/*.jar)
if [ ! -f "$JAR" ]; then
  echo "❌ JAR not found in target/"
  exit 1
fi
cd ..

# 3) write Dockerfile
cat > Dockerfile <<EOF
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY spring/target/$(basename "$JAR") app.jar
ENTRYPOINT ["java","-jar","/app/app.jar"]
EOF

# 4) define image name & tag
IMAGE="ghcr.io/hoangsonww/banking-predictor"
TAG="${VERSION:-1.0.0}"

# 5) build & tag
docker build -f Dockerfile -t "${IMAGE}:latest" -t "${IMAGE}:${TAG}" .

# 6) login & push
echo "${GITHUB_TOKEN}" | docker login ghcr.io -u hoangsonww --password-stdin
docker push "${IMAGE}:${TAG}"
docker push "${IMAGE}:latest"

echo "✅ Docker image pushed: ${IMAGE}:${TAG} and ${IMAGE}:latest"
