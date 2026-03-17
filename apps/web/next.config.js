/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@hg/ui'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': 'react-native-web',
    }
    return config
  }
}
