import * as path from 'node:path'
import { defineConfig } from '@rspress/core'

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'wy-react-helper',
  icon: '/rspress-icon.png',
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/wy2010344/wy-react-helper',
      },
    ],
  },
})
