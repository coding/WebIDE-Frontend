var serverConfig = {
  BACKEND_URL: 'http://test.legend.fiibeacon.com/cs/backend',
  WS_URL: 'http://ide-ws.dev.coding.ide',
  STATIC_SERVING_URL: 'http://{space-key}-static-{access-token}.dev.coding.ide',
  HTML_BASE_URL: 'http://test.legend.fiibeacon.com/cs/backend',
  PACKAGE_DEV: false,
  CODING_URL: 'https://coding.net',
  HDD_ADJUST_ENABLE: true,
  WS_REG: 'ws',
  DASHBOARD_URL: '/dashboard',
  STATIC_PATH: 'rs2'
}

if (typeof module !== 'undefined') {
  module.exports = serverConfig
} else {
  window.serverConfig = serverConfig;
}
