module.exports = {
  i18n: {
    defaultLocale: 'lt',
    locales: ['lt', 'en'],
    localeDetection: true,
  },
};
const { i18n } = require('./next-i18next.config');

module.exports = {
  i18n,
  reactStrictMode: true,
};
