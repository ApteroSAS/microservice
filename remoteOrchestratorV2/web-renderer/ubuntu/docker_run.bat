rem http://localhost:3443/static/manage/vnc/vnc.html
rem ws://127.0.0.1:8081/reverse/172.18.0.2/8080/websockify
call docker_build.bat
docker rm web-renderer-test-v2 -f
docker run -d -l "com.docker.compose.project=web-renderer" -p 8080:8080 -e DISPLAY_WIDTH=1024 -e DISPLAY_HEIGHT=768 --network=web_renderer_network --name web-renderer-test-v2 ubuntu-renderer:latest