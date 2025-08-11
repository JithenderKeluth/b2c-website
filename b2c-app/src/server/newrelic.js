'use strict'

exports.config = {
  app_name: ['TS B2C SSR'],
  license_key: '5f16ebbc234ec8afcd4891ae17e572eaFFFFNRAL',
  logging: {
    level: 'info',
    filepath: 'stdout'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  },
  browser_monitoring: {
    enable: true
  },
  distributed_tracing: {
    enabled: true
  }
}
