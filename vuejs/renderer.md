# 渲染器

![image-20240109173901591](.\images\image-20240109173901591.png)

- 渲染器的作用就是将 **h函数** 生成的虚拟DOM渲染成真实的**DOM**而这一过程叫做挂载，不论是最开始的初始化渲染还是后期根据差异更新**DOM**的打补丁其都称为挂载。
- 同样，渲染器中也有许多工具函数，如：`hydrate`、`createApp`等他们都用来实现渲染。
- 渲染器是**Vue**框架的核心，而且可以抽离**API**提供可配置的接口来实现渲染器的跨平台能力，如既能在浏览器上实现渲染也能在**Node**平台上实现渲染

## createRenderer函数

```js
function createRenderer(options) {
    // 通过 options 得到操作 DOM 的 API
    const {
        createElement,
        insert,
        setElementText
    } = options

    // 渲染函数
    function render(vnode, container) {
        if(vnode) {
            // 新vnode存在，将其与旧vnode一起传递给patch函数，进行打补丁
            patch(container._vnode, vnode, container)
        } else {
            if(container._vnode) {
                // 如果旧的的vnode存在,且新的vnode不存在，说明是卸载(unmount)操作
                // 只需要清空container中的DOM即可
                container.innerHTML = ''
            }
        }
        // 把vnode存储到container._vnode下
        // 即后续渲染中的旧vnode中
        container._vnode = vnode
    }
    // 打补丁函数
    function patch(n1, n2, container, anchor) {
        // 如果n1不存在，意味着挂载，则调用 mountElement 来完成初次的挂载
        if(!n1) {
            mountElement(n2, container, anchor)
        } else {
            // TODO n1 存在意味着打补丁
        }
    }
    // 挂载函数
    function mountElement(vnode, container, anchor) {
        // ...
    }
    function hydrate(vnode, container) {
        // ...
    }
    return {
        render,
        hydrate,
        patch,
        mountElement
    }
}


// 创建一个渲染器,抽离API
const renderer = createRenderer({
    // 用于创建节点
    createElement(tag) {
        return document.createElement(tag)
    },
    // 用于设置文字节点
    setElementText(el, text) {
        el.textContent = text
    },
    // 用于插入到节点中
    insert(el, parent, anchor = null) {
        parent.insertBefore(el, anchor)
    },
    // 用于创建文本节点
    createText(text) {
        return document.createTextNode(text)
    },
    // 用于设置文本与注释节点
    setText(el, text) {
        el.nodeValue = text
    }
})
// 调用 render 函数渲染该 vnode
renderer.render(vnode, document.querySelector('#app'))
```

## 虚拟DOM

```js
const vnode = {
    type: 'div',  // html标签名称
    // 该标签的属性对象，用来描述标签的属性、内容、事件等
    props: {
        id: 'jojo',
        class: 'yas',
        onClick: () => alert('hello')
    },
    // 该标签的节点
    children: [
        {
            type: 'p',
            props: {
                id: 'y',
                class: 's'
            },
            chidren :'hello'
        }
    ]
}
```

在生成虚拟DOM的过程中，标签中的属性会被工具函数编译进一个对象，在这里我们将标签的属性都存放进名为`props`的对象中，以便我们在后面将虚拟DOM渲染为真实DOM的过程中能够对其进行一系列特殊的操作。在这里我们要重点注意 **HTML Attribute** 和 **DOM Properties** 两个概念。

```html
<input id="my-input" type="text" value="foo" />
```

**HTML Attributes** 指的就是定义在 HTML 标签上的属性 `id="my-input"`、`type="text"` 和 `value="foo"` 这类，我们可以通过 **Web API** 去获取相应的 **DOM对象** ，该获取到的 **DOM** 对象会包含许多属性，而这些属性就是所谓的 **DOM Properties** ，大多数的 **HTML Attributes**都会有相对应的 **DOM Properties** ，但有些是没有的就比如：**HTML Attributes** `class` 所对应的 **DOM Properties** 为`className` 那样，并且我们还要记住一个核心的原则：**HTML Attributes** 的作用是设置与之对应的 **DOM Properties** 的初始值。

> 对象用：`for...in`
>
> 数组用：`for...of`或者`Array.prototype.forEach()`

## MountElement函数

```js
function mountElement(vnode, container){
    // 使用 vnode.tag 作为标签名称创建 DOM 元素
    const el = document.createElement(vnode.tag)
    // 遍历 vnode.props 将属性、事件等添加到DOM元素
    if(vnode.props) {
        for(const key in vnode.props) {
            // 处理属性如id、class等
            const value = vnode.props[key]
            // 判断该HTML标签中的属性是否有对应的DOM Properties
            if(shouldSetAsProps(el, key, value)){
                // 获取该 DOM Properties 的类型
                const type = typeof el[key]
                // 在设置HTML标签的时候会出现一个问题
                // 就是当设置为布尔类型时需要做值的矫正
                // 详见 https://developer.mozilla.org/zh-CN/docs/Web/API/Element/setAttribute#javascript
                if(type === 'boolean' && value === ''){
                    el[key] = true
                }else{
                    el[key] = value
                }
            }else{
                // 如果标签上要设置的属性没有对应的 DOM Properties 
                // 则用 setAttribute 函数设置属性
                el.setAttribute(key, vnode.props[key])
            }
        }
    }
    // 处理子节点的情况
    if(typeof vnode.children === 'string'){
        // 如果子节点是文本字符串，说明它是元素的文本子节点,直接将其挂到标签上
        el.appendChild(document.createTextNode(vnode.children))
    }else if(Array.isArray(vnode.children)){
        // 如果不是，则递归的调用 renderer 函数渲染子节点
        // 并使用当前元素 el 作为挂载点
        // chilren节点中可能有多个同级的子节点，
        // 便利这些子节点组成的数组时需要使用 forEach 或 for...of
        vnode.children.forEach(child => {
            patch(null, child, el)  // 第一次渲染直接挂载
        })
    }
    
    container.insertBefore(el, null)
}
```

```js
function shouldSetAsProps(el, key, value){
    // 特殊处理
    if(key === 'form' && el.tagName === 'INPUT') return false
    // 对于其他的情况则判断该标签的属性是否存在在 DOM Properties里没有的话直接返回false
    return key in el
}
```

对于像`input`的 `form`属性它对应的 **DOM Properties** 是 `el.form`，但`el.form` 是只读的，因此我们只能通过**setAttribute** 函数来设置它。并且，对于有相对应**HTML**属性的**DOM Properties**来说使用`el[key] = value`可以直接赋值，而对于没有的属性来说需要使用**setAttribute** 函数来赋值。

## 抽离API

我们可以将对上述的代码抽取WebAPI通用接口，把属性设置的相关操作提取到渲染器的参数选项中

```js
// 渲染器
const renderer = createRenderer({
    createElement(tag) {
        return document.createElement(tag)
    },
    setElementText(el, text) {
        el.textContent = text
    },
    insert(el, parent, anchor = null) {
        parent.insertBefore(el, anchor)
    },
    // 将设置属性的相关操作封装进 patchProps 中，并作为渲染器选项传递
    // el为要创建的节点;key为属性名;nextValue为属性值
    patchProps(el, key, prevValue, nextValue) {
        // 判断属性名是否有class,如果有则用className来处理
        // 因为className在性能方面比classList与setAttribute要好
        if(key === 'class') {
            el.className = nextValue || ''
        }else if(shouldSetAsProps(el, key, value)){
            const type = typeof el[key]
            if (type === 'boolean' && value === ''){
                el[key] = true
            } else {
                el[key] = nextValue
            }
        } else {
            el.setAttribute(key, nextValue)
        }
    }
})
```

```js
function mountElement(vnode, container, anchor){
    // 在创建真实DOM的时候
    // 我们使用vnode虚拟节点来与其建立连接以便后续的卸载与节点更新的操作
    const el = vnode.el = document.createElement(vnode.tag)
    // 处理子节点的情况
    if(typeof vnode.children === 'string'){
        setElementText(el, vnode.children)
    }else if(Array.isArray(vnode.children)){
        vnode.children.forEach(child => {
            patch(null, child, el)
        })
    }
    if(vnode.props) {
        for(const key in vnode.props) {
            patchProps(el, key, null, vnode.props[key])
        }
    }
    insert(el, container, anchor)
}
```

## Render函数

在之前的`createRenderer`函数中，我们初次见到了`render`函数，它不仅要能实现挂载的操作也要实现更新与卸载的操作。

```js
// 初次挂载
renderer.render(vnode, document.querySelector('#app'))
// 再次挂载，触发跟新操作
renderer.render(newVnode, document.querySelector('#app'))
// 卸载
renderer.render(null, document.querySelector('#app'))
```

```js
function render(vnode, container) {
    if(vnode) {
        // 新vnode存在，将其与旧vnode一起传递给patch函数，进行打补丁
        patch(container._vnode, vnode, container)
    } else {
        if(container._vnode) {
            unmount(container._vnode)
        }
    }
    // 把vnode存储到container._vnode下,即后续渲染中的旧vnode中
    container._vnode = vnode
}

// 卸载函数
// 根据之前在mountElement函数中与真实DOM建立联系的vnode来获取真实要卸载掉的DOM元素
function unmount(vnode) {
    // 获取el的父元素
    const parent = vnode.el.parentNode
    // 调用removeChild卸载掉该元素
    if(parent) parent.removeChild(el)
}
```

## Patch函数

在**patch函数**中，我们需要完成卸载类型不同的标签的操作、挂载标签的操作以及对相同标签的元素的打补丁操作

```js
// n1为老的节点
// n2为新的节点
function patch(n1, n2, container, anchor) {
    // 如果n1存在，并且n1的标签类型不等于n2的标签类型时，我们需要把n1卸载掉
    // 这种情况是两个节点不相同的情况，新的节点的标签类型与之前老的节点的标签类型不一致
    // 需要把老的直接剔除掉换成新的
    if (n1 && n1.type !== n2.type) {
        // 卸载掉n1
        unmount(n1)
        // 并把n1赋值为空，以便重新挂载
        n1 = null
    }
    // 这里有两种情况:
    // 1、相同时要提供不同的打补丁的方法
    // 2、不同时则判断新旧节点的类型，根据节点标签的类型来选择不同的处理方法
    // 用解构赋值将新传入的vnode中的标签类型提取出来
    const { type } = n2
    // 如果为普通标签类型,如: p标签、div标签之类的
    if (typeof type === 'string') {
        // 如果n1不存在意味着挂载（或者是初次渲染的情况）
        // 则调用 mountElement 来完成挂载
        if (!n1) {
            mountElement(n2, container, anchor)
        } else {
            // n1 和 n2 的标签类型相同,那就根据他们的不同的地方打补丁
            patchElement(n1, n2)
        }
    } else if (typeof type === 'Object') {
        // 组件的处理方法
        if (!n1) {
            mountComponent(n2, container, anchor)
        } else {
            // n1 和 n2 的标签类型相同,那就根据他们的不同的地方打补丁
            patchComponent(n1, n2, anchor)
        }
    } else if(typeof type === Text) {
        // 文本节点的处理方法
    } else if(typeof type === Comment) {
        // 注释节点的处理方法
    }
}
```

- 处理**文本节点与注释节点**

  我们在`.vue`文件中经常会写到如下的标签形式：

  ```html
  <div><!-- 注释节点 -->我是文本节点</div>
  ```

  将上面的`HTML`标签转换为虚拟DOM节点就是：

  ```js
  const Text = Symbol()
  const newVNode = {
      // 描述文本节点
      type: Text,
      children: '文本节点内容'
  }
  
  const Comment = Symbol()
  const newVNode = {
      // 描述注释节点
      type: Comment,
      children: '注释节点内容'
  }
  ```

  所以我们要在处理标签类型的时候去处理它：

  ```js
  const { type } = n2
  if (typeof type === 'string') {
    // 如果为普通标签类型,如: p标签、div标签之类的
  } else if (typeof type === 'Object') {
      // 组件的处理方法
  } else if(typeof type === Text) {
      // 文本节点的处理方法
      // 如果没有旧节点，则进行挂载
      if (!n1) {
         // 使用 createTextNode 创建文本节点
         const el = n2.el = document.createTextNode(n2.children)
         insert(el, container)
      } else {
          // 如果有旧节点就用新节点的children来覆盖旧文本的节点
          const el = n2.el = n1.el // 关联新旧节点
          if (n2.children !== n1.children) {
              el.nodeValue = n2.children
          }
      }
  } else if(typeof type === Comment) {
      // 注释节点的处理方法
      if (!n1) {
         // 使用 createTextNode 创建文本节点
         const el = n2.el = document.createTextNode(n2.children)
         insert(el, container)
      } else {
          // 如果有旧节点就用新节点的 children 来覆盖旧文本节点中的值
          const el = n2.el = n1.el // 关联新旧节点
          if (n2.children !== n1.children) {
              el.nodeValue = n2.children
          }
      }
  }
  ```

- 处理 **Fragment(片段)**

  Vue3 新增了一个功能，也就是可以存在多个根节点

  ```html
  <!-- List.vue -->
  <template>
    <ul>
        <slot></slot>
    </ul>
  </template>
  ```

  ```html
  <!-- Items.vue -->
  <template>
    <li>1</li>
    <li>2</li>
    <li>3</li>
  </template>
  ```

   在 Vue2 中是无法实现存在多个根节点的情况，所以新增的 Fragment 是用来处理多个模板的情况

    ```html
    <List>
        <Items></Items>
    </List>
    ```

  上方的标签组对应的虚拟节点为

  ```js
  const vnode = {
      type: 'ul',
      children: [
          {
              type: Fragment,
              children: [
                  { type: 'li', children: '1' },
                  { type: 'li', children: '2' },
                  { type: 'li', children: '3' },
              ]
          }
      ]
  }
  ```

  我们也进行差不多的操作：

  ```js
  const { type } = n2
  if (typeof type === 'string') {
      // 如果为普通标签类型,如: p标签、div标签之类的
  } else if (typeof type === 'Object') {
      // 组件的处理方法
  } else if(typeof type === Text) {
      // 文本节点的处理方法
  } else if(typeof type === Comment) {
      // 注释节点的处理方法
  } else if(typeof type === Fragment) {
      // 处理 Fragment 类型的vnode
      // 如果旧的虚拟节点不存在，则只需要将 Fragment 的 children 逐个挂载即可
      if (!n1) {
         n2.children.forEach(c => patch(null, c, container)) 
      } else {
         // 如果旧的节点存在，则只需要更新 Fragment 的 children 即可
         patchChildren(n1, n2, container)
      }
  }
  ```

  不过我们也要注意卸载的操作

  ```js
  function unmounted(vnode) {
      // 在卸载时，如果卸载的 vnode 类型为 Fragment,则只需要卸载掉其 children
      if (vnode.type === Fragment) {
          vnode.children.forEach(c => unmount(c))
          return   
      }
      // 之后再把该节点删除
      const parent = vnode.el.parentNode
      if (parent) {
         parent.removeChild(vnode.el) 
      }
  }
  ```

- n1 和 n2 的标签类型相同，根据不同的地方打补丁：

    ```js
    function patchElement(n1, n2) {
        // n1.el 与 n2.el 中的.el是在mountElement函数执行时与真实的DOM相互建立了链接所设置的
        // const el = vnode.el = document.createElement(vnode.tag)这个的时候设置的.el
        // 当进入patchElement()函数的时候说明n1与n2两个节点的类型都是一样的，这里给他们两个节点做关联
        const el = n2.el = n1.el
        const oldProps = n1.props
        const newProps = n2.props
        // 将新的 props 中的属性值与旧的 props 中的属性值相比较
        for(const key in newProps) {
            // 新的属性值与旧的不同就跟新覆盖
            if(newProps[key] !== oldProps[key]) {
                patchProps(el, key, oldProps[key], newProps[key])
            }
        }
        // 对于旧的节点的属性值在新的节点中没有的情况时要清空这些属性值
        for(const key in oldProps) {
            if(!(key in newProps)){
                patchProps(el, key, oldProps[key], null) 
            }
        }
        // 更新 children
        patchChildren(n1, n2, el)
    }
    ```

  - 对于新旧两个节点的类型会有9种情况：

    <img src=".\images\image-20240124163953295.png" alt="image-20240124163953295" style="zoom:67%;margin:0 auto" />

    ```js
    const patchChildren(n1, n2, container) {
        // 如果新的节点的类型是字符串类型，即文本节点
        if(typeof n2.children === 'string') {
            // 如果老的节点是数组类型，即一组子节点的类型，则要移除所有的其下挂载的节点
            if(Array.isArray(n1.children)) {
                n1.chilren.forEach((c) => unmount(c))
            }
            // 如果是其他没有子节点与文本节点的情况的话，则直接赋值
            // 最后将新的文本节点内容设置给容器元素
            setElementText(container, n2.children)
        // 如果新节点是数组结构，即一组子节点的情况
        } else if (Array.isArray(n2.children)) {
            // 如果旧节点是数组类型，则需要使用Diff算法来设置新的节点
            if(Array.isArray(n1.children)) {
                // TODO diff算法
            } else {
                // 如果旧节点是文本节点或者空节点，则先清空该需要更新的节点下的数据
                setElementText(container, '')
                // 再将新节点中所有的子节点挂再上去
                // 旧节点为空，c为新的节点，container为要挂载的地方
                n2.children.forEach(c => patch(null, c, container))
            }
        // 如果新节点是空，则清空旧节点逐个卸载
        } else {
            // 如果旧节点是数组，则逐个卸载
            if(Array.isArray(n1.children)) {
                n1.children.forEach(c => unmount(c))
            // 如果旧节点是字符串类型就直接清空内容
            }else if(typeof n1.children === 'string') {
                setElementText(container, '')
            }
            // 如果旧节点是空，则什么都不做
        }
    }
    ```
