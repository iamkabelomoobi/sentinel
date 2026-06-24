sudo cp infra/nginx/api.conf \
/etc/nginx/sites-available/sentinel-api

sudo ln -s \
/etc/nginx/sites-available/sentinel-api \
/etc/nginx/sites-enabled/