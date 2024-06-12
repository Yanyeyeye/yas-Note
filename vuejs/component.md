# 组件化

**渲染器** 主要负责将虚拟 DOM 渲染为真实 DOM，我们只需要使用虚拟 DOM 来描述最终呈现的内容即可。而但当我们编写比较复杂的页面时，用来描述页面结构的虚拟 DOM 的代码量会变得越来越多，或者说页面模板 会变得越来越大。这时，我们就需要组件化的能力。有了组件，我们就可以将一个大的页面拆分为多个部分，每一个部分都可以作为单独的组件，这些组件共同组成完整的页面。组件化的实现同样需要渲染器的支持。

## 渲染组件

一个有状态的组件就是一个选项对象，如下代码

```js
const MyComponent = {
    name: 'MyComponent',
    data() {
        return { foo: 1 }
    }
}
```

组件也可以看作一个特殊类型的对象

```js
const CompVNode = {
    // type属性中存储组件的选项对象
    type: MyComponent,
    // ...
}
```

我们用渲染器中的[patch函数](renderer.html#Patch函数)来处理

```js
// n1为老的节点
// n2为新的节点
function patch(n1, n2, container, anchor) {
    if (n1 && n1.type !== n2.type) {
        unmount(n1)
        n1 = null
    }
    const { type } = n2
    // 如果为普通标签类型,如: p标签、div标签之类的
    if (typeof type === 'string') {
        // 处理字符串类型
    } else if (typeof type === 'Object') {
        // 组件的处理方法
        if (!n1) {
            mountComponent(n2, container, anchor)
        } else {
            patchComponent(n1, n2, anchor)
        }
    } else if(typeof type === Text) {
        // 文本节点的处理方法
    } else if(typeof type === Comment) {
        // 注释节点的处理方法
    }
}
```

实际上组件本身是对页面内容的封装，用于描述页面内容的一部分。因此，一个组件必须包含一个渲染函数，即：[render函数](renderer.html#Render函数)，并且渲染函数的返回值应该是虚拟DOM，组件的渲染函数就是用来描述组件所渲染内容的接口。

```js
const MyComponent = {
    // 组件名称
    name: 'MyComponent',
    // 组件的渲染函数
    // 返回值必须为虚拟DOM
    render() {
        return {
            type: 'div',
            children: `文本内容`
        }
    }
}

const CompVNode = {
    type: MyComponent
}
// 调用渲染器来渲染函数
renderer.render(CompVNode, document.querySelector('#app'))
```

我们编写 **mountComponent函数** 来完成组件的渲染操作

```js
function mountComponent(vnode, container, anchor) {
    // 通过 vnode 获取组件的选项对象，即 vnode.type
    const componentOptions = vnode.type
    // 解构获取函数中的 render
    const { render } = componentOptions
    // 执行渲染函数，获取组件要渲染的内容
    // 即 render 函数返回的虚拟DOM
    const subTree = render()
    // 将虚拟DOM用patch函数来挂载
    patch(null, subTree, container, anchor)
}
```

### 组件状态与自更新

我们有如下组件的状态

```js
const MyComponent = {
    name: 'MyComponent',
    data() {
        return {
            foo: 'hello world'
        }
    },
    render() {
        return {
            type: 'div',
            children: `foo 的值是：${ this.foo }`
        }
    }
}
```

我们继续实现挂载组件的函数

```js
function mountComponent (vnode, container, anchor) {
    const componentOptions = vnode.type
    const { render, data } = componentOptions

    // 调用 data 函数得到原始数据，并使用 reactive 函数将其包装为响应式数据
    const state = reactive(data())
    // 使用 effect 函数将其包装成响应式
    // 即当data中的数据发生变化时，就重新渲染组件
    effect(()=>{
        // call()函数的作用，是改变render的 this 指向 state 的作用域
        // 并将state作为参数传入
        const subTree = render.call(state, state)
        patch(null, subTree, container, anchor)
    },{
        // 设置调度器，在需要的时候调用避免多次执行副作用函数带来的性能开销
        scheduler: queueJob
    })
}

// 任务缓存队列，用一个 Set 数据结构来表示，这样就可以自动对任务进行去重
const queue = new Set()
// 标志防止重复刷新任务队列
let isFlushing = false
// 创建一个立即 resolve 的 Promise 实例
const p = Promise.resolve()
// 调度器的主要函数，用来将一个任务添加到缓冲队列中，并开始刷新队列
function queueJob(job) {
    // 将 job 添加到任务队列 queue 中
    queue.add(job)
    // 如果还没有刷新队列，则刷新
    if(!isFlushing) {
        isFlushing = false
        p.then(()=>{ 
            try{
                // 执行任务队列中的任务
                queue.forEach(job => job())
            }finally{
                // 重置状态
                isFlushing = false
                queue.clear = 0
            }
        })
    }
}
```
