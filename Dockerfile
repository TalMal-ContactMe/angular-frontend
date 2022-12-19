FROM node:16-alpine

RUN mkdir /app
WORKDIR /app

COPY package.json /app/package.json

RUN npm install -g @angular/cli
RUN npm install

COPY . /app

CMD ng serve --host 0.0.0.0 --disable-host-check

