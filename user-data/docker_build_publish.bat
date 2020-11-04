IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag aptero-service-user-data:latest registry.aptero.co/aptero-service-user-data:latest
docker push registry.aptero.co/aptero-service-user-data:latest

docker tag aptero-service-user-data:latest registry.aptero.co/aptero-service-user-data:%1
docker push registry.aptero.co/aptero-service-user-data:%1


GOTO :EOF
:error
ECHO incorrect_parameters