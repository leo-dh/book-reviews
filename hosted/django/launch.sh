cd /home/ubuntu/server
source /home/ubuntu/server/env/bin/activate
gunicorn -b 127.0.0.1:8000 application.wsgi --daemon