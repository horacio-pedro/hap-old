# devependecies
FROM node:alpine AS dependencies

RUN apk --update add bash && \
    apk add --no-cache dos2unix g++ git make python vips-dev

RUN mkdir /srv/hap && chown -R node:node /srv/hap

COPY wait .deploy/api/entrypoint /
RUN chmod +x /wait /entrypoint

RUN dos2unix /entrypoint

USER node:node

WORKDIR /srv/hap

COPY --chown=node:node apps/desktop/package.json ./apps/desktop/
COPY --chown=node:node apps/api/package.json ./apps/api/
COPY --chown=node:node package.json yarn.lock ./

RUN yarn install

# development
FROM node:alpine AS development

USER node:node

WORKDIR /srv/hap

COPY --chown=node:node --from=dependencies /wait /entrypoint /
COPY --chown=node:node --from=dependencies /srv/hap .
COPY . .

# build
FROM node:alpine AS build

WORKDIR /srv/hap

RUN mkdir dist

COPY --chown=node:node --from=development /srv/hap .

ARG NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_ENV production

RUN yarn build:api:prod

# production
FROM node:alpine AS production

WORKDIR /srv/hap

COPY --chown=node:node --from=dependencies /wait ./wait
COPY --chown=node:node --from=dependencies /entrypoint .
COPY --chown=node:node --from=dependencies /srv/hap/node_modules ./node_modules/
COPY --chown=node:node apps/api/src/app/core/seeds/data/default-email-templates apps/api/src/app/core/seeds/data/default-email-templates
COPY --chown=node:node --from=build /srv/hap/dist/apps/api .

RUN npm install pm2 -g && mkdir /import && chown node:node /import
RUN touch ormlogs.log && chown node:node ormlogs.log
RUN chown node:node wait && chmod +x wait && chown -R node:node apps/
USER node:node

ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NODE_ENV production
ENV DB_NAME postgres
ENV API_PORT 3000
ENV DB_PORT 5432

EXPOSE ${API_PORT:-3000}
CMD [ "pm2-runtime", "main.js" ]
