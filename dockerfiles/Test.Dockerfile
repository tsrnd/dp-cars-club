FROM node:10.15.3-alpine

RUN mkdir -p node/dp-cars-club

ENV DIR node/dp-cars-club

ADD ./ node/dp-cars-club

WORKDIR ${DIR}

RUN npm install -g tslint typescript

CMD /bin/sh ./unittest.sh
