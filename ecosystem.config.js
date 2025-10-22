module.exports = {
  apps: [{
    name: 'plugg-bot-1',
    script: 'npm',
    args: 'run dev',
    cwd: 'D:\\Plugg hemsida\\plugg-bot-1',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
