module.exports = {
  apps: [{
    name: 'my-nest-app',
    script: 'dist/main.js',
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000,
    env: {
      NODE_ENV: 'production',
    },
  }]
};