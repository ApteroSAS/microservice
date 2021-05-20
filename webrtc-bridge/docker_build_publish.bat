IF [%1] == [] GOTO error


docker login
RMDIR /s /q .\dist\

call docker_build.bat

rem RUN DOCKER TO PUBLISH
docker tag webrtc-bridge:latest registry.aptero.co/webrtc-bridge:latest
docker push registry.aptero.co/webrtc-bridge:latest

docker tag webrtc-bridge:latest registry.aptero.co/webrtc-bridge:%1
docker push registry.aptero.co/webrtc-bridge:%1


GOTO :EOF
:error
ECHO incorrect_parameters