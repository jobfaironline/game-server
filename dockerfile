FROM node:16

# Create app directory
WORKDIR /usr/src/app
EXPOSE 0-60000/tcp
EXPOSE 0-60000/udp
ENV MIN_PORT 10000
ENV MAX_PORT 10100
ENV LISTEN_PORT 3001
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

COPY . .

# CMD /bin/bash
CMD ["npm", "run", "start"]
