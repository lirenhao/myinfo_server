FROM node:8-alpine

COPY ./ /opt/myinfo

WORKDIR /opt/myinfo

VOLUME /opt/myinfo/log

RUN npm install -g pm2 && pm2 install pm2-logrotate && npm install

EXPOSE 3001

CMD [ "pm2-runtime", "start", "pm2.json" ]