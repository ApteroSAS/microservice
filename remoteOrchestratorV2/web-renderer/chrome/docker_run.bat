rem http://localhost:3443/static/manage/vnc/vnc.html
rem ws://127.0.0.1:8081/reverse/172.18.0.2/8080/websockify
rem https://novnc.com/noVNC/vnc.html?host=127.0.0.1&port=8081&path=reverse/172.20.0.3/8080/websockify&password=aptero
rem https://novnc.com/noVNC/vnc.html?host=127.0.0.1&port=8081&path=reverse/172.20.0.3/8080/websockify&password=aptero
rem http://localhost:63342/remoteOrchestratorV2/public/manage/vnc/vnc.html?host=127.0.0.1&port=8081&path=reverse/172.20.0.2/8080/websockify&password=aptero
rem https://meet.aptero.co/service/remote/orchestrator/static/manage/vnc/vnc.html


rem
rem open http://localhost:8080/vnc_lite.html to test
rem

call docker_build.bat
docker network create web_renderer_network
docker rm web-renderer-test-v2 -f
rem docker run -d -l "com.docker.compose.project=web-renderer" -p 8080:8080 -e LANGUAGE=fr_FR.UTF-8 -e LANG=fr_FR.UTF-8 -e DISPLAY_WIDTH=1366 -e DISPLAY_HEIGHT=768 -e KIOSK_BTN=true -e PASSWORD=aptero -e MODE=kiosk -e URL=https://www.google.com --network=web_renderer_network --name web-renderer-test-v2 chrome-renderer:latest
docker run -d -l "com.docker.compose.project=web-renderer" -p 8080:8080 -e LANGUAGE=fr_FR.UTF-8 -e LANG=fr_FR.UTF-8 -e DISPLAY_WIDTH=1366 -e DISPLAY_HEIGHT=768 -e KIOSK_BTN=false -e PASSWORD=aptero -e MODE=kiosk -e URL=https://192.168.1.23:53000/ --network=web_renderer_network --name web-renderer-test-v2 chrome-renderer:latest
