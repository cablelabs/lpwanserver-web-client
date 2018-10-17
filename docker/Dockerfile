FROM node:10

WORKDIR /usr/src/app

COPY ./docker/configuration/web-client-server/ ./
COPY ./build ./build

RUN npm install 

ENV PORT=8080
ENV LPWANSERVER_PROTOCOL=http
ENV LPWANSERVER_HOST=
ENV LPWANSERVER_PORT=

EXPOSE 8080

CMD [ "node", "./index.js" ]