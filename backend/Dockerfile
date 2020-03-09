FROM node:lts-alpine AS builder

RUN apk add python3 build-base git

COPY . /app
WORKDIR /app

RUN npm install
RUN npm run build

FROM node:lts-alpine

COPY --from=builder /app /app
WORKDIR /app

EXPOSE $PORT

ENTRYPOINT [ "npm", "run" ]
CMD [ "start:prod" ]
