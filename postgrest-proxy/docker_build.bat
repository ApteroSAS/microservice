rem install node js
rem install docker

call npm outdated

rem RUN DOCKER
docker build -t aptero-service-postgrest-proxy .