module.exports = {
  apps: [
    {
      name: "sentinel-api",

      script: "./apps/api/dist/src/main.js",
      cwd: "/app",

      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      watch: false,

      max_memory_restart: "500M",
      restart_delay: 5000,
      min_uptime: "10s",
      max_restarts: 10,

      kill_timeout: 5000,
      listen_timeout: 10000,

      time: true,

      out_file: "./logs/api-out.log",
      error_file: "./logs/api-error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
