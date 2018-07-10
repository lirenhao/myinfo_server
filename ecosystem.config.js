module.exports = {
  apps: [{
    name: 'myinfo',
    script: 'app.js',
    instances: "max",
    exec_mode: "cluster",
    watch: [
      "clients.json",
      "template.json"
    ],
    error_file: "err.log",
    out_file: "out.log",
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm",
  }]
};