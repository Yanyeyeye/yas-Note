
# 权衡的艺术

## 命令式与声明式的区别

- 命令式：

  1. 关注**过程**
  2. 性能极致
  3. 巨大的心智负担

  ```js
  const div = document.querySelector('#app') // 获取 div
  div.innerText = 'hello world' // 设置文本内容
  div.addEventListener('click', () => { alert('ok') }) // 绑定点击事
  ```

- 声明式：

  1. 关注**结果**
  2. 性能损耗
  3. 较小的心智负担

  ```vue
  <div @click="() => alert('ok')">hello world</div>
  ```

> 命令式代码的更新性能消耗 = A
> 声明式代码的更新性能消耗 = B + A

## 虚拟DOM

> Notes：声明式代码的更新性能消耗 = 找出差异的性能消耗+直接修改的性能消耗，因此，如果我们能够最小化找出差异的性能消耗，就可以让声明式代码的性能无限接近命令式代码的性能。
>
> 而所谓的虚拟 DOM，就是为了最小化找出差异这一步的性能消耗而出现的。

- `innerHTML`操作页面：

```js
const html = `
<div><span>...</span></div>
`
div.innerHTML = html
```

我们需要把字符串解析成`DOM`树，而对于`DOM`树的操作性能的开销与纯`JavaScript`层面不在同一个数量级上

对比虚拟 `DOM` 和`innerHTML`两者在不同场景下的性能差异：

1. **在创建页面时：**![image-20231113170704624](.\images\image-20231113170704624.png)
   - `innerHTML`性能消耗：`HTML` 字符串拼接的计算量 + `innerHTML` 的 `DOM` 计算量
   - 虚拟 `DOM` 性能消耗：创建 `JavaScript` 对象的计算量 + 创建真实 `DOM` 的计算量

2. **在更新页面时：**![image-20231113174209567](.\images\image-20231113174209567.png)
   - `innerHTML`性能消耗：重新拼接`HTML` 字符串的计算量 + 重新设置`innerHTML`的 `DOM` 计算量
   - 虚拟 `DOM` 性能消耗：创建新的 `JavaScript` 对象的计算量 + 比较新旧 `JavaScript` 对象(虚拟`DOM`) + 更新变化的`DOM`

在页面的更新方面虚拟`DOM`的性能开销虽然有比较新旧`DOM` 树的操作，但这一部分的操作是纯`JavaScript`层面开销相比于`innerHTML`的性能开销远远小的多，他们之间的性能差异如下所示：![image-20231113175133602](.\images\image-20231113175133602.png)

所以，相比较于这三者之间的差异以及不同维度的平衡，选择对虚拟`DOM`的操作为`Vue`的框架核心![image-20231113175540813](.\images\image-20231113175540813.png)

## 运行时与编译时

1. 纯运行时：

   有一个**Render**函数（1.0）专门用来将 <u>树形结构</u> 的对象（类似**虚拟DOM**）渲染为真实**DOM**元素

   ```js
   function Render(obj, root) {
       const el = document.createElement(obj.tag)
       if(typeof obj.children === 'string') {
           const text = document.createTextNode(obj.children)
           el.appendChild(text)
       }else if(obj.children) {
           // 数组，递归调用 Render，使用 el 作为 root 参数
           obj.children.forEach(child => Render(child, el))
       }
       // 将元素添加到root
       root.appendChild(el)
   }
   ```

   使用**Render**函数渲染相应结构的对象如下：

   ```js
   const obj = {
       tag: 'div',
       children: [
           { tag: 'span', children: 'hello world' }
       ]
   }
   // 渲染到 body 下
   Render(obj, document.body)
   ```

2. 运行时 + 编译时

   所谓运行时 + 编译时就是当用户有一个需求，喜欢直接写 <u>HTML标签</u> ，那我们就需要一个**Compiler**函数将 <u>HTML标签</u> 编译为 <u>树形结构</u> 的对象，再使用**Render**函数来渲染

   <img src=".\images\image-20231120111544065.png" alt="image-20231120111544065" style="zoom: 67%;margin: 0 auto" />

   ```js
   const html = `
    <div>
    <span>hello world</span>
    </div>
   `
   // 调用 Compiler 编译得到树型结构的数据对象
   const obj = Compiler(html)
   // 再调用 Render 进行渲染
   Render(obj, document.body)
   ```

3. 纯编译时

   其实我们也可以进一步改造**Complier**函数，让他能够将 <u>HTML标签</u> 直接编译为**虚拟DOM**

   <img src=".\images\image-20231120111909206.png" alt="image-20231120111909206" style="zoom:67%;margin: 0 auto" />

**Vue3框架**采用了运行时 + 编译时的架构，其编译用户所提供的内容并用**Render**函数进行相应的优化，提高灵活性的同时保证了性能。
