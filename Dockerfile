FROM node:20-slim
RUN apt-get update && apt-get install -y g++ make python3 && rm -rf /var/lib/apt/lists/*
RUN useradd -m -s /bin/bash runner
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p /tmp/executions && chown -R runner:runner /app /tmp/executions
USER runner
EXPOSE 3000
CMD ["npm", "start"]