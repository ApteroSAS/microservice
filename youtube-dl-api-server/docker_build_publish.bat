IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag youtube-dl-api-server:latest registry.aptero.co/youtube-dl-api-server:latest
docker push registry.aptero.co/youtube-dl-api-server:latest

docker tag youtube-dl-api-server:latest registry.aptero.co/youtube-dl-api-server:%1
docker push registry.aptero.co/youtube-dl-api-server:%1


GOTO :EOF
:error
ECHO incorrect_parameters