IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag mail-service:latest registry.aptero.co/mail-service:latest
docker push registry.aptero.co/mail-service:latest

docker tag mail-service:latest registry.aptero.co/mail-service:%1
docker push registry.aptero.co/mail-service:%1


GOTO :EOF
:error
ECHO incorrect_parameters