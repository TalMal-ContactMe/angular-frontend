FROM node:16-alpine

RUN mkdir /app
WORKDIR /app

#ENV PATH /app/node_modules/.bin:$PATH

COPY package.json /app/package.json

RUN npm install -g @angular/cli
RUN npm install

COPY . /app

#EXPOSE 4200

#CMD ng serve --host 0.0.0.0 --configuration=production
CMD ng serve --host 0.0.0.0 --disable-host-check
#CMD ng serve --host 0.0.0.0 --configuration=local

#docker run -d -v /app/node_modules -p 4200:4200 --name angularFrontend talmal/angular_frontend:0.0.1