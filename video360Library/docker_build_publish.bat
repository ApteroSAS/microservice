IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag live-stream-library:latest registry.aptero.co/live-stream-library:latest
docker push registry.aptero.co/live-stream-library:latest

docker tag live-stream-library:latest registry.aptero.co/live-stream-library:%1
docker push registry.aptero.co/live-stream-library:%1


GOTO :EOF
:error
ECHO incorrect_parameters