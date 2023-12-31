import { defineConfig } from 'vitepress';
import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default defineConfig(withMermaid({
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
              {
                text: '基础', items: [
                  { text: '站点', link: '/reference/site' },
                  { text: 'RPC', link: '/reference/rpc' },
                  { text: '代理', link: '/reference/agent' },
                  { text: '设置', link: '/reference/setting' },
                ]
              },
              {
                text: '实体', items: [
                  { text: '评论', link: '/reference/comment' },
                  { text: '连接', link: '/reference/connection' },
                  { text: '用户', link: '/reference/user' },
                ]
              }
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
  },
  mermaid: {
    // refer https://mermaid.js.org/config/setup/modules/mermaidAPI.html#mermaidapi-configuration-defaults for options
  },
}))
