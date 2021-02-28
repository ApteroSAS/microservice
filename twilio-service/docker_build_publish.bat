IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag twilio-service:latest registry.aptero.co/twilio-service:latest
docker push registry.aptero.co/twilio-service:latest

docker tag twilio-service:latest registry.aptero.co/twilio-service:%1
docker push registry.aptero.co/twilio-service:%1


GOTO :EOF
:error
ECHO incorrect_parameters