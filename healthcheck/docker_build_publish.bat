IF [%1] == [] GOTO error


docker login

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag health-checker:latest registry.aptero.co/health-checker:latest
docker push registry.aptero.co/health-checker:latest

docker tag health-checker:latest registry.aptero.co/health-checker:%1
docker push registry.aptero.co/health-checker:%1


GOTO :EOF
:error
ECHO incorrect_parameters