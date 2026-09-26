# Stage 1 for building
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build || true

# Stage 2 for production image
FROM node:20-slim AS production
WORKDIR /app

ARG KOTLIN_VERSION=2.1.10

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    unzip \
    gcc \
    g++ \
    make \
    python3 \
    rustc \
    default-jdk-headless \
    golang-go \
    mono-mcs \
    mono-runtime \
    php-cli \
    ruby \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL "https://github.com/JetBrains/kotlin/releases/download/v${KOTLIN_VERSION}/kotlin-compiler-${KOTLIN_VERSION}.zip" -o /tmp/kotlin.zip \
  && unzip -q /tmp/kotlin.zip -d /opt \
  && rm /tmp/kotlin.zip \
  && ln -sf /opt/kotlinc/bin/kotlinc /usr/local/bin/kotlinc \
  && ln -sf /opt/kotlinc/bin/kotlin /usr/local/bin/kotlin

RUN npm install -g typescript \
  && npm cache clean --force

# Swift is optional: the runtime is registered, but the official toolchain
# is too large for this image. Install `swiftc` on the host to enable it.

RUN useradd --create-home --shell /bin/bash runner
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app ./
RUN mkdir -p /tmp/executions && chown -R runner:runner /app /tmp/executions /home/runner

USER runner
ENV GO111MODULE=on \
    GOPATH=/home/runner/go \
    GOCACHE=/home/runner/.cache/go-build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
