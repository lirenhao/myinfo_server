module.exports = {
  apps: [{
    name: 'myinfo',
    script: 'app.js',
    instances: "max",
    log_date_format: "YYYY-MM-DD HH:mm",
    exec_mode: "cluster",
    watch: [
      "clients.json"
    ]
  }]
};