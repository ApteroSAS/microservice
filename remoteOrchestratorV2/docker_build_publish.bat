IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag aptero-service-remote-orchestrator-v2:latest registry.aptero.co/aptero-service-remote-orchestrator-v2:latest
docker push registry.aptero.co/aptero-service-remote-orchestrator-v2:latest

docker tag aptero-service-remote-orchestrator-v2:latest registry.aptero.co/aptero-service-remote-orchestrator-v2:%1
docker push registry.aptero.co/aptero-service-remote-orchestrator-v2:%1


GOTO :EOF
:error
ECHO incorrect_parameters