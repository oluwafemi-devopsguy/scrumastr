##Search for ciapi.chatscrum.com and change to your ip address with port 5000.
##Save the file
##Build a new docker image using this dockerfile
##Run the docker image with ports 5000 and 5100 linked also to the redis container and database container.



FROM centos:7

MAINTAINER The CentOS Project <cloud-ops@centos.org>

LABEL Vendor="CentOS" \
      License=GPLv2 \
      Version=2.4.6-40

RUN yum -y install wget epel-release
RUN yum -y --setopt=tsflags=nodocs update && \
    yum -y --setopt=tsflags=nodocs install httpd && \
    yum clean all

RUN yum -y update && yum -y install git


RUN yum -y install httpd-devel \
                   zlib-devel \
                   bzip2-devel \
                   openssl-devel \
                   ncurses-devel \
                   sqlite-devel \
                   readline \
                   https://centos7.iuscommunity.org/ius-release.rpm \
                   python36u \
                   python36u-pip \
                   python36u-devel \
                   uwsgi \
                   uwsgi-plugin-python36u \
                   nginx \
                   python-pip \
                   mysql-devel

RUN yum -y group install "Development Tools"

RUN  yum clean all;

RUN yum -y install gcc

RUN pip install --upgrade pip && pip install boto && pip install boto3
RUN yum -y install https://centos7.iuscommunity.org/ius-release.rpm python36u python36u-devel python36u-pip
RUN pip install pathlib
RUN /bin/pip3.6 install django==2.1
RUN /bin/pip3.6 install channels
RUN /bin/pip3.6 install djangorestframework
RUN /bin/pip3.6 install django-cors-headers
RUN /bin/pip3.6 install mysqlclient
RUN /bin/pip3.6 install mysql-connector-python
RUN /bin/pip3.6 install djangorestframework-jwt
RUN /bin/pip3.6 install Pillow channels_redis slackclient==1.3.0 pymysql

RUN mkdir -p /web/
COPY www/ /web/www/
COPY nginx.conf /etc/nginx/
COPY start.sh /start.sh
COPY settings.py /web/www/Django/ScrumMaster/ScrumMaster/settings.py
RUN chmod +x /start.sh

RUN yum install -y uwsgi-logger-file uwsgi-plugin-python36u

RUN wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . $HOME/.nvm/nvm.sh && nvm install stable
RUN . $HOME/.nvm/nvm.sh && npm install -g @angular/cli@7.0.7
RUN git config --global user.email "joseph.showunmi@linuxjobber.com"
RUN git config --global user.name "joseph.showunmi"
RUN cd /web && . $HOME/.nvm/nvm.sh && ng new Chatscrum-Angular --routing

RUN . $HOME/.nvm/nvm.sh && yes | cp -r /web/www/Angular/* /web/Chatscrum-Angular/src
RUN cd /web/Chatscrum-Angular/ && sed -i '26s/.*/"src\/styles.css","node_modules\/materialize-css\/dist\/css\/materialize.min.css"/' angular.json;
RUN cd /web/Chatscrum-Angular/ && sed -i '28s/.*/"scripts": ["node_modules\/jquery\/dist\/jquery.min.js","node_modules\/materialize-css\/dist\/js\/materialize.min.js"]/' angular.json; sed -i '19s/.*/],"types": ["jquery","materialize-css"]/' tsconfig.json;
RUN cd /web/Chatscrum-Angular/ && sed -i 's/127.0.0.1:8000/3.94.233.216:5000/g' src/app/data.service.ts;


RUN cd /web/Chatscrum-Angular && . $HOME/.nvm/nvm.sh && npm install ngx-materialize materialize-css@next ng2-dragula rxjs && ng build --prod --aot
RUN mkdir -p /web/Chatscrum-Angular/dist/Chatscrum-Angular/src/assets/
RUN yes | cp -r /web/Chatscrum-Angular/dist/Chatscrum-Angular/assets/ /web/Chatscrum-Angular/dist/Chatscrum-Angular/src/
RUN mkdir -p /usr/share/nginx/web/Chatscrum-Angular
RUN yes | cp -r /web/Chatscrum-Angular/dist/Chatscrum-Angular/* /usr/share/nginx/web/Chatscrum-Angular

RUN touch /etc/uwsgi.d/chatscrum.ini
RUN echo "[uwsgi]" > /etc/uwsgi.d/chatscrum.ini
RUN echo "socket = /run/chatscrumuwsgi/uwsgi.sock" >> /etc/uwsgi.d/chatscrum.ini
RUN echo "chmod-socket = 775" >> /etc/uwsgi.d/chatscrum.ini
RUN echo "chdir = /web/www/Django/ScrumMaster" >> /etc/uwsgi.d/chatscrum.ini
RUN echo "master = true" >> /etc/uwsgi.d/chatscrum.ini
RUN echo "module = ScrumMaster.wsgi:application" >> /etc/uwsgi.d/chatscrum.ini
RUN echo "uid = uwsgi" >> /etc/uwsgi.d/chatscrum.ini
RUN echo "gid = uwsgi" >> /etc/uwsgi.d/chatscrum.ini
RUN echo "processes = 1" >> /etc/uwsgi.d/chatscrum.ini
RUN echo "threads = 1" >> /etc/uwsgi.d/chatscrum.ini
RUN echo "plugins = python36u,logfile" >> /etc/uwsgi.d/chatscrum.ini

RUN mkdir -p /run/chatscrumuwsgi/
RUN chgrp nginx /run/chatscrumuwsgi
RUN chmod 2775 /run/chatscrumuwsgi
RUN touch /run/chatscrumuwsgi/uwsgi.sock

#RUN rm -rf /web/www/Django/ScrumMaster/Scrum/migrations/00*

RUN chgrp -R 0 /web/www/Django/ScrumMaster/* /start.sh /run /run/chatscrumuwsgi/* /etc /usr/share/nginx /var/lib /var/log /usr/sbin/uwsgi \
    && chmod -R g=u /web/www/Django/ScrumMaster/* /start.sh /run /run/chatscrumuwsgi/* /etc /usr/share/nginx /usr/sbin/uwsgi  /var/lib /var/log

EXPOSE 5000 5100

CMD ["/start.sh"]
