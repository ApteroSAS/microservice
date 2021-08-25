rem http://localhost:3443/static/manage/vnc/vnc.html
rem ws://127.0.0.1:8081/reverse/172.18.0.2/8080/websockify
rem https://novnc.com/noVNC/vnc.html?host=127.0.0.1&port=8081&path=reverse/172.20.0.3/8080/websockify&password=aptero
rem https://novnc.com/noVNC/vnc.html?host=127.0.0.1&port=8081&path=reverse/172.20.0.3/8080/websockify&password=aptero
rem http://localhost:63342/remoteOrchestratorV2/public/manage/vnc/vnc.html?host=127.0.0.1&port=8081&path=reverse/172.20.0.2/8080/websockify&password=aptero
rem https://meet.aptero.co/service/remote/orchestrator/static/manage/vnc/vnc.html

call docker_build.bat
docker rm remote-renderer-test-v2 -f
docker run -d -l "com.docker.compose.project=web-renderer" -p 8080:8080 -e VNC_HOST=172.20.0.4 -e VNC_PORT=5900 --network=web_renderer_network --name remote-renderer-test-v2 remote-renderer:latest