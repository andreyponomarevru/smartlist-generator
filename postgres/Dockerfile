FROM postgres:latest

WORKDIR /sql

# COPY ./docker-entrypoint-initdb.d/init-dev.sh /docker-entrypoint-initdb.d/init-dev.sh

CMD ["postgres", "-c", "log_statement=all"]
