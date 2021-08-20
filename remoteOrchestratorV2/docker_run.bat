call docker_build.bat
docker rm aptero-service-remote-orchestrator -f
docker run -d -e HEARTBEATMS=10000000 -p 8081:80 -p 3443:3443 -v /var/run/docker.sock:/var/run/docker.sock --name aptero-service-remote-orchestrator aptero-service-remote-orchestrator-v2:latest
docker network connect web_renderer_network aptero-service-remote-orchestrator