module.exports = {
  apps: [
    {
      name: 'sentinel-web',
      script: 'apps/web/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};