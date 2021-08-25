rem http://localhost:3443/static/manage/vnc/vnc.html
rem ws://127.0.0.1:8081/reverse/172.18.0.2/8080/websockify
rem https://novnc.com/noVNC/vnc.html?host=127.0.0.1&port=8081&path=reverse/172.20.0.3/8080/websockify&password=aptero
rem https://novnc.com/noVNC/vnc.html?host=127.0.0.1&port=8081&path=reverse/172.20.0.3/8080/websockify&password=aptero
rem http://localhost:63342/remoteOrchestratorV2/public/manage/vnc/vnc.html?host=127.0.0.1&port=8081&path=reverse/172.20.0.2/8080/websockify&password=aptero
rem https://meet.aptero.co/service/remote/orchestrator/static/manage/vnc/vnc.html
call docker_build.bat
docker rm web-renderer-test-vnc -f
docker run -d -l "com.docker.compose.project=web-renderer" -p 5900:5900 -e DISPLAY_WIDTH=1366 -e DISPLAY_HEIGHT=768 -e KIOSK_BTN=true -e PASSWORD=aptero -e MODE=kiosk -e URL=https://www.google.com --network=web_renderer_network --name web-renderer-test-vnc chrome-renderer:latest