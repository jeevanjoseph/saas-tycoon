#!/bin/sh

cat <<EOF > /usr/share/nginx/html/config.js
window._env_ = {
  API_URL: '${API_URL:-http://localhost:3000/api/game}'
};
EOF

exec "$@" 