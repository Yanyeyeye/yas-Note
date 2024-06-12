import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "YasNote", // Logo旁的标题
  description: "侬好 (｡･∀･)ﾉﾞ嗨",
  head: [
    [
      'link',
      { rel: 'icon', href: '/yas.png' }
    ]
  ],
  lastUpdated: true,
  themeConfig: {
    // siteTitle: 'Yas' // logo旁的标题

    logo: {
      src: '/vola.png',
      alt: 'hi'
    },

    outline: {
      level: [2, 3],
      label: '在此页面上'
    },

    // https://vitepress.dev/reference/default-theme-config
    sidebar: {
      '/threejs/': [
      {
        text: '介绍',
          items: [
          { text: '前言', link: '/threejs/profile.md' },
          { text: '初始化配置', link: '/threejs/initialConfig.md' }
        ]
      },
      {
        text: '基础',
          items: [
          { text: '几何体Geometry', link: '/threejs/geometry.md' },
          { text: '几何体基础操作', link: '/threejs/basisControl.md' },
          { text: '全屏与改变大小', link: '/threejs/screen.md' },
          { text: '相机Camera', link: '/threejs/camera.md' },
          { text: '可视化调试Debug', link: '/threejs/debug.md' },
          { text: '纹理Texture', link: '/threejs/texture.md' },
          { text: '材质Material', link: '/threejs/material.md' },
          { text: '字体Fonts', link: '/threejs/fonts.md' },
          { text: '光Lights', link: '/threejs/lights.md' },
          { text: '阴影Shadow', link: '/threejs/shadow.md' },
          { text: '辅助器', link: '/threejs/subsidiary.md' }
        ]
      },
      {
        text: '进阶',
        items: [
          { text: '粒子Particle', link: '/threejs/particle.md' },
          { text: '光线投射Raycaster', link: '/threejs/raycaster.md' },
          { text: '滚动动画', link: '/threejs/scrollAnimation.md' },
          { text: '物理效果', link: '/threejs/physics.md' },
          { text: '导入模型', link: '/threejs/gltf.md' },
          { text: '着色器Shader', link: '/threejs/shader.md' },
          { text: '调整内置材质', link: '/threejs/adjustMaterial.md' },
          { text: '后期处理', link: '/threejs/postprocessing.md' },
          { text: '加载进度', link: '/threejs/processing.md' },
        ],
      },
      {
        text:'实践',
        items:[
          { text: '鬼屋', link: '/threejs/ghostHouse.md' },
          { text: '海洋', link: '/threejs/ocean.md' },
          { text: '银河系', link: '/threejs/galaxy.md' },
          { text: '银河系进阶', link: '/threejs/galaxyAdvance.md' },
          { text: '混合HTML与WebGL', link: '/threejs/mixHtmlWebGL.md' },
          { text: '导入模型并使用UV贴图', link: '/threejs/modelImport.md' }
        ],
      },
      {
        text: '其他',
        items: [
          { text: '性能优化', link: '/threejs/performance.md' },
          { text: '问题解决', link: '/threejs/others.md' },
        ],
      }
      ],
      '/vuejs/': [
        {
          text: '前言', 
          items: [
              { text: '框架设计概览', link: '/vuejs/profile.md' },
          ]
        },
        {
          text: '框架设计', 
          items: [
              { text: '核心要素', link: '/vuejs/coreElement.md' },
              { text: '构建产物', link: '/vuejs/buildup.md' },
          ]
        },
        {
          text: '设计思路',
            items: [
              { text: '声明式地描述UI', link: '/vuejs/descriptedUI.md' },
              { text: '渲染器', link: '/vuejs/renderer.md' },
              { text: 'Diff算法', link: '/vuejs/Diff.md' },
              { text: '组件化', link: '/vuejs/component.md' },
              { text: '编译器', link: '/vuejs/compiler.md' },
          ]
        },
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Yanyeyeye/Learning-Note' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present Yanyeyeyes'
    },

    search: {
      provider: 'local'
    },

    nav: [
      { text: 'Threejs', link: '/threejs/profile.md', activeMatch:'/threejs/' },
      { text: 'Vuejs', link: '/vuejs/profile.md', activeMatch:'/vuejs/' },
    ],
  }
})
