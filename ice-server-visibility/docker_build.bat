rem install node js
rem install docker

rem RUN NPM
call npm install
rem call npm run build
call npm outdated
rem call yarn run test

rem RUN DOCKER
docker build -t aptero-service-ice-server-visibility .