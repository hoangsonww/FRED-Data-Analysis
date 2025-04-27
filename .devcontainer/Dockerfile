# Base dev image
FROM node:18-alpine

# install tools you like
RUN apk add --no-cache bash git openssh

# Create app directory
WORKDIR /workspace

# Expose your dev ports
EXPOSE 4000 3000

# Default to a shell to keep the container alive
CMD ["sleep", "infinity"]
