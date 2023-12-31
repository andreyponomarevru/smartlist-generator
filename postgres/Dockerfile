FROM postgres:latest

WORKDIR /sql

# Copy SQL files executed by init script(s)
# It copies the _content_ of ./schema/ into dir in image 
COPY ./schema/ ./schema
COPY ./seeds/ ./seeds
# Copy init script(s)
COPY ./docker-entrypoint-initdb.d/init-dev.sh /docker-entrypoint-initdb.d/init-dev.sh
