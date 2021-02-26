IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag mail-service-data:latest registry.aptero.co/mail-service-data:latest
docker push registry.aptero.co/mail-service-data:latest

docker tag mail-service-data:latest registry.aptero.co/mail-service-data:%1
docker push registry.aptero.co/mail-service-data:%1


GOTO :EOF
:error
ECHO incorrect_parameters