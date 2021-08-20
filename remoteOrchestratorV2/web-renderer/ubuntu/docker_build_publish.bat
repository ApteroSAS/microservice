IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag ubuntu-renderer:latest registry.aptero.co/ubuntu-renderer:latest
docker push registry.aptero.co/ubuntu-renderer:latest

docker tag ubuntu-renderer:latest registry.aptero.co/ubuntu-renderer:%1
docker push registry.aptero.co/ubuntu-renderer:%1


GOTO :EOF
:error
ECHO incorrect_parameters