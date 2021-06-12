#!/usr/bin/env python3
FROM python:3
ADD helloworld.py /
RUN pip install flask
RUN pip install flask_restful
EXPOSE 3333
CMD [ "python", "./helloworld.py"]

print('Hello World!')
print('This is my task which asks me to test any python app in a docker image')
