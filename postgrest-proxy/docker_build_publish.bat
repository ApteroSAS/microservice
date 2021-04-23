IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag aptero-service-postgrest-proxy:latest registry.aptero.co/aptero-service-postgrest-proxy:latest
docker push registry.aptero.co/aptero-service-postgrest-proxy:latest

docker tag aptero-service-postgrest-proxy:latest registry.aptero.co/aptero-service-postgrest-proxy:%1
docker push registry.aptero.co/aptero-service-postgrest-proxy:%1


GOTO :EOF
:error
ECHO incorrect_parameters