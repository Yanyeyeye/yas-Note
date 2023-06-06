import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "YasNote",
  description: "侬好 (｡･∀･)ﾉﾞ嗨",
  head: [
    [
      'link',
      { rel: 'icon', href: '/yas.png' }
    ]
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Note Menu',
        items: [
          { text: 'Threejs', link: '/threejs/index.md' },
          { text: 'Blender', link: '/blender/index.md' },
          { text: 'JavaScript', link: '/javascript/index.md' },
          { text: 'Nodejs', link: '/nodejs/index.md' },
          { text: 'Python', link: '/python/index.md' },
          { text: 'Other', link: '/others/index.md' }
        ]}
    ],

    sidebar: {
      '/threejs/':[
      {
        text: '基础',
        items: [
          { text: '几何体基础操作', link: '/threejs/index.md' },
          { text: '全屏与改变大小', link: '/threejs/screen.md' },
          { text: '相机Camera', link: '/threejs/camera.md' },
          { text: '几何Geometry', link: '/threejs/geometry.md' },
          { text: '可视化调试DEBUG', link: '/threejs/debug.md' },
          { text: '纹理Texture', link: '/threejs/texture.md' },
          { text: '材质Material', link: '/threejs/material.md' },
          { text: '字体Fonts', link: '/threejs/fonts.md' },
          { text: '光Lights', link: '/threejs/lights.md' },
          { text: '阴影Shadow', link: '/threejs/shadow.md' },
          { text: '辅助器', link: '/threejs' }
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
          { text: '制作一个鬼屋', link: '/threejs/project1.md' },
          { text: '混合HTML与WebGL', link: '/threejs/mixHtmlWebGL.md' },
          { text: '导入模型并使用UV贴图', link: '/threejs/modelImport.md' }
        ],
      },
      {
        text: '其他',
        items: [
          { text: '性能优化', link: '/threejs/performance.md' },
          { text: '问题解决', link: '/api-examples' },
        ],
      }
    ]
  },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Yanyeyeye' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2023-present Yanyeyeyes'
    },

    logo: {
      src: '/vola.png',
      alt: 'hi'
    },

    search: {
      provider: 'local'
    }
  }
})
