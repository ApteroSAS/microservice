IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag web-renderer-v2:latest registry.aptero.co/web-renderer-v2:latest
docker push registry.aptero.co/web-renderer-v2:latest

docker tag web-renderer-v2:latest registry.aptero.co/web-renderer-v2:%1
docker push registry.aptero.co/web-renderer-v2:%1


GOTO :EOF
:error
ECHO incorrect_parameters