FROM node:10
RUN mkdir -p /usr/src/master-data
WORKDIR /usr/src/master-data
COPY package.json /usr/src/master-data
COPY package-lock.json /usr/src/master-data
RUN npm install
COPY .  /usr/src/master-data
EXPOSE 3001
CMD [ "node", "server.js"  ]
