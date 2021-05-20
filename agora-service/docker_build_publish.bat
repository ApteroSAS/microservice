IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag agora-service:latest registry.aptero.co/agora-service:latest
docker push registry.aptero.co/agora-service:latest

docker tag agora-service:latest registry.aptero.co/agora-service:%1
docker push registry.aptero.co/agora-service:%1


GOTO :EOF
:error
ECHO incorrect_parameters