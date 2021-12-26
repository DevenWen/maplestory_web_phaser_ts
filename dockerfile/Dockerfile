FROM nginx
COPY default.conf /etc/nginx/conf.d
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]

# docker run -v /Users/wenkangqiang/qpm/project/game/phaser-maplestory/wz_resource/assert:/usr/share/wz -p 80:80  -d --name wz_resource_http wz_resource:dev