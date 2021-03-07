rem install node js
rem install docker

rem RUN NPM
call npm outdated

rem RUN DOCKER
docker build -t aptero-service-remote-orchestrator-v2 .