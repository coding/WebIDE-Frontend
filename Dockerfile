FROM nginx:1.11.9-alpine

ADD build/ /usr/share/nginx/html/
ADD nginx.conf /etc/nginx/conf.d/default.conf
