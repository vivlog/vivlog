import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Vivlog",
  description: "Where vitality thrives through interconnected blogs",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' },
      { text: 'Reference', link: '/reference/' }
    ],

    sidebar: {
      '/markdown-examples': [{
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
          { text: 'Reference', link: '/reference' }
        ]
      }],
      '/reference': [{
        text: 'Reference',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
        ]
      }]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/pluveto/vivlog' }
    ]
  },
  locales: {
    root: {
      label: '中文',
      lang: 'zh',
      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
          { text: '首页', link: '/' },
          { text: '示例', link: '/markdown-examples' },
          { text: '参考手册', link: '/reference/' }
        ],

        sidebar: {
          '/markdown-examples': [{
            text: '示例',
            items: [
              { text: 'Markdown Examples', link: '/markdown-examples' },
              { text: 'Runtime API Examples', link: '/api-examples' },
              { text: 'Reference', link: '/reference' }
            ]
          }],
          '/reference': [{
            text: '参考手册',
            items: [
              { text: '站点', link: '/reference/site' },
              { text: '能动体', link: '/reference/agent' },
              { text: '连接', link: '/reference/connection' },
              { text: 'Markdown Examples', link: '/markdown-examples' },
            ]
          }]
        },

        socialLinks: [
          { icon: 'github', link: 'https://github.com/pluveto/vivlog' }
        ]
      },
    },
    en: {
      label: 'English',
      lang: 'en',
    },
  }
})
