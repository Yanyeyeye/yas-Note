// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import Theme from 'vitepress/theme'
import threeModel from './components/threeModel.vue'
import './style.css'

export default {
  ...Theme,
  // Layout: () => {
  //   return h(Theme.Layout, null, {
  //     // https://vitepress.dev/guide/extending-default-theme#layout-slots
  //     'home-hero-image': ()=>{
  //       h(threeModel)
  //     }
  //   })
  // },
  // override the Layout with a wrapper component that
  // injects the slots
  Layout: threeModel,
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}
