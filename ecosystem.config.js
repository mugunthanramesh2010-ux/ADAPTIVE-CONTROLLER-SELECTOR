module.exports = {
  apps: [
    {
      name: 'acep-platform-prod',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
        HOST: '0.0.0.0'
      }
    }
  ]
};
