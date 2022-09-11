FROM node:16-alpine

RUN mkdir /app
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
ENV dockerMachineIp "192.168.99.100"

COPY package.json /app/package.json

RUN npm install
#RUN npm install -g @angular/cli@12.0.0
RUN npm install -D @angular-builders/custom-webpack

COPY . /app

#EXPOSE 4200

#CMD ng serve --host 0.0.0.0 --configuration=production
CMD ng serve --host 0.0.0.0
#CMD ng serve --host 0.0.0.0 --configuration=local

#docker run -d -v /app/node_modules -p 4200:4200 --name angularFrontend talmal/angular_frontend:0.0.1