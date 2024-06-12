# 核心要素

## Devtools

打开"Console" → "Enable custom formatters"选项可以使控制台输出的信息更加直观

<img src=".\images\image-20231122093419954.png" alt="image-20231122093419954" style="zoom:50%;" />

打开前：

<img src=".\images\image-20231122093531009.png" alt="image-20231122093531009" style="zoom:67%;" />

打开后：

<img src=".\images\image-20231122093619939.png" alt="image-20231122093619939" style="zoom:67%;" />

## 控制代码体积

> 代码量越少，打包的体积越小，在浏览器上加载资源的时间也就越少

比如如下代码，利有`_DEV_`常量来控制输出的文件中是否包含相关的代码

```js
if (__DEV__ && !res) {
 warn(
     `Failed to mount app: mount target selector "${container}"
    returned null.`
 )
}
```

**Vue.js**使用 <u>rollup.js</u> 来对项目进行构建，常量`_DEV_`就是通过 <u>rollup.js</u> 的插件来预定义配置的，其功能类似于**webpack**中DefinePlugin插件，能够在打包输出资源时配置需要的功能

## Tree-Shaking

要**Tree-Shaking**得满足模块必须是 <u>ESM（ES Module）</u> ，因为**Tree-Shaking**依赖ESM的静态结构。

我们有如下目录结构：

```bash
|——demo
|   |-- package.json
|   |-- input.js
|   ∟-- utils.js
```

1. 首先安装rollup.js：

   ```bash
   yarn add rollup -D
   # 或者 
   npm i rollup -D
   ```

2. 文件内容：

   - utils.js：

     ```js
     export function foo(obj) {
      obj && obj.foo
     }
     export function bar(obj) {
      bar && obj.bar
     }
     ```

   - input.js：

     ```js
     import { foo } from './utils.js'
     ```

3. 执行rollup.js命令：

   ```bash
   npx rollup input.js -f esm -o bundle.js
   ```

   以 input.js 文件为入口，输出 ESM，输出的文件叫作 bundle.js。

4. bundle.js内容：

    ```js
    function foo(obj) {
        obj && obj.foo
    }
    foo();
    ```

我们可以发现**bundle.js**中的函数**foo**好像也没有什么卵用，没有关联其他的副作用函数，那我们就可以使用`/*#__PURE__*/`来告诉<u>rollup.js</u> 该函数没有任何副作用，可以放心的将它shaking掉
