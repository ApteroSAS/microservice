IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag remote-renderer:latest registry.aptero.co/remote-renderer:latest
docker push registry.aptero.co/remote-renderer:latest

docker tag remote-renderer:latest registry.aptero.co/remote-renderer:%1
docker push registry.aptero.co/remote-renderer:%1


GOTO :EOF
:error
ECHO incorrect_parameters