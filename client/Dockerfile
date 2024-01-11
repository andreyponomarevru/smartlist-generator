# node-sass doesn't support node versions after 14
# @typescript-eslint/eslint-plugin@6.18.1 required node versions between "^16.0.0 || >=18.0.0"
# copy-webpack-plugin@12.0.0 requires node version ">= 18.12.0"
FROM node:18

WORKDIR /client

COPY package*.json ./
RUN yarn

# Bundle app source 
COPY . .

CMD yarn run serve
