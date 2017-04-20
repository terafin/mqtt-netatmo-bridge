FROM node:6

RUN mkdir -p /usr/mqtt-transform
COPY . /usr/mqtt-transform
WORKDIR /usr/mqtt-transform
RUN npm install --production

CMD ["npm", "start"]
