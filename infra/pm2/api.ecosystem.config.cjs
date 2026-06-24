module.exports = {
  apps: [
    {
      name: 'sentinel-api',
      script: 'apps/api/dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
    },
  ],
};