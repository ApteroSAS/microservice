IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag aptero-service-user-data:latest registry.aptero.co/aptero-service-remote-orchestrator:latest
docker push registry.aptero.co/aptero-service-remote-orchestrator:latest

docker tag aptero-service-user-data:latest registry.aptero.co/aptero-service-remote-orchestrator:%1
docker push registry.aptero.co/aptero-service-remote-orchestrator:%1


GOTO :EOF
:error
ECHO incorrect_parameters