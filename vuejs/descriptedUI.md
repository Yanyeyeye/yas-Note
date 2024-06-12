# 声明式地描述UI

- 编写前端页面需要涉及到内容有：
  1. DOM元素：如：`div`、`span`
  2. 属性：如： `a` 标签的 `href` 属性，再如 `id`、`class` 等通用属性
  3. 事件：如：`click`、`keydown`等
  4. 元素的层级：`DOM`元素的层级，其的子节点、父节点

- **Vue3** 描述上述内容为：
  
  1. 使用与`HTML`标签一致的方式来描述`DOM`元素，`<div></div>`
  2. 使用与`HTML`标签一致的方式来描述属性，`<div id='app'></div>`
  3. 使用 `:` 或 `v-bind` 来描述动态绑定的属性，`<div :id='dynamicId'></div>`
  4. 使用 `@` 或 `v-on` 来描述事件，`<div @click='handler'></div>`
  5. 使用与 `HTML` 标签一致的方式来描述层级结构，`<div><span></span></div>`
  
## JavaScript对象描述UI

**Vue3** 还支持使用 **JavaScript** 对象来描述 **UI**，如

  ```js
  const title = {
      // 标签名称
      tag: 'h1',
      // 标签属性
      props: {
          onClick: handler
      },
      // 子节点
      children: [
          { tag: 'span' }
      ]
  }
  ```

  相当于：

  ```html
  <h1 @click="handler"><span></span></h1>
  ```

使用 **JavaScript** 对象描述 **UI** 比使用模板描述 **UI** 要灵活的多，我们可以使用渲染函数`render()`来创建 **JavaScript** 对象也就是虚拟**DOM**

```JS
import { h } from 'vue'

export default {
    render() {
        return h('h1', { onClick: handler }) // 虚拟 DOM
    }
}
```

所谓`（h）`函数也就是辅助创建虚拟 **DOM** 的工具，上述代码相当于

```js
export default {
    render() {
        return {
            tag: 'h1',
            props: { onClick: handler }
        }
    }
}
```

**Vue**通过`render()`函数的返回值拿到虚拟 **DOM** 也就是 **DOM** 的 **JavaScript** 对象的表达来渲染组件
