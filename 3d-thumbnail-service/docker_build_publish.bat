IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag 3d-preview:latest registry.aptero.co/3d-preview:latest
docker push registry.aptero.co/3d-preview:latest

docker tag 3d-preview:latest registry.aptero.co/3d-preview:%1
docker push registry.aptero.co/3d-preview:%1


GOTO :EOF
:error
ECHO incorrect_parameters