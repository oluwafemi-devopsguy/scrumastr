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
RUN /bin/pip3.6 install channels==2.2.0
RUN /bin/pip3.6 install djangorestframework==3.10.2
RUN /bin/pip3.6 install django-cors-headers==3.1.0
RUN /bin/pip3.6 install mysqlclient
RUN /bin/pip3.6 install mysql-connector-python
RUN /bin/pip3.6 install djangorestframework-jwt==1.11.0
RUN /bin/pip3.6 install Pillow channels_redis==2.4.0 slackclient==1.3.0 pymysql
RUN /bin/pip3.6 install boto3==1.11.0
RUN /bin/pip3.6 install django==2.1

RUN mkdir -p /web/
COPY www/ /web/www/
COPY nginx.conf /etc/nginx/
COPY start.sh /start.sh
COPY settings.py /web/www/Django/ScrumMaster/ScrumMaster/settings.py
COPY settings.ini /web/www/Django/ScrumMaster/settings.ini
COPY Chatscrum-Angular/ /web/Chatscrum-Angular/

RUN chmod +x /start.sh

RUN yum install -y uwsgi-logger-file uwsgi-plugin-python36u --skip-broken

RUN wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . $HOME/.nvm/nvm.sh && nvm install stable
RUN . $HOME/.nvm/nvm.sh && npm install -g @angular/cli@7.3.9
RUN git config --global user.email "prosper.sopuruchi@gmail.com"
RUN git config --global user.name "Prosper Ndubueze"

RUN cd /web/Chatscrum-Angular && . $HOME/.nvm/nvm.sh && npm install
RUN cd /web/Chatscrum-Angular && . $HOME/.nvm/nvm.sh && ng build --prod --aot

RUN mkdir -p /web/Chatscrum-Angular/dist/chatscrum/src/assets/
RUN yes | cp -r /web/Chatscrum-Angular/dist/chatscrum/assets/ /web/Chatscrum-Angular/dist/chatscrum/src/
RUN mkdir -p /usr/share/nginx/web/Chatscrum-Angular
RUN yes | cp -r /web/Chatscrum-Angular/dist/chatscrum/* /usr/share/nginx/web/Chatscrum-Angular

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