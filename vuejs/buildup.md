# 构建产物

- [一文搞懂 script 标签 - 掘金](https://juejin.cn/post/6917898288481959943#heading-8)

## 使用IIFE格式资源

- [JavaScript系列之立即执行函数IIFE](https://zhuanlan.zhihu.com/p/74440468)

当我们想在HTML标签中直接使用`<script>`来引入框架并使用时，我们就可以使用**IIFE**格式（Immediately Invoked Function Expression）的资源，即立即调用函数来使用**Vue**，并且他可以形成独立的块级作用域防止出现数据的全局污染

```html
<body>
    <script src='./vue.js'></script> <!-- 外联脚本读取Vue全局变量 -->
    <script>
        const { createApp } = Vue // 内联代码结构得到createApp对象
    </script>
</body>
```

```js
// vue.js
// 使用立即执行函数导出Vue对象，其内部形成了一个独立的块状域能够防止内部与外部的属性相同而造成全局污染
var Vue = (function(exports) {
    // ...
    exports.createApp = createApp
    // ...
    return exports
}({}))
```

`<script>`标签的执行顺序无论是内联还是外部脚本（除了defer和async外）都是从上到下串行执行，并且在执行期间可以获取到`<html>`根元素标签中所有`Javascript`的全局变量和DOM元素

我们可以在**rollup.js**中，通过配置`format: 'iife'`来输出指定模块的**IIFE**格式资源

```js
// rollup.config.js
const config = {
    input: 'input.js',
    output: {
        file: 'output.js',
        format: 'iife' // 指定模块形式
    }
}

export default config
```

### 使用ESM资源文件

- [在浏览器中使用 ECMAScript Modules](https://juejin.cn/post/6943233321765715976)
- [ES6 入门教程 - ECMAScript 6入门](https://es6.ruanyifeng.com/#README)
- [JavaScript modules · V8](https://v8.dev/features/modules#performance)

在早期`JavaScript`脚本只用于浏览器页面的交互一般代码量很少，但是随着技术的发展与业务处理逻辑的复杂化，`JavaScript`代码量越来越庞大，并且开始运用于其他环境（如：Node.js），所以在2015年6月**Ecma International**发布ES6（ES2015）用来提供模块化的解决方案，<u>即将 JavaScript 程序拆分为可按需导入的单独模块的机制</u>

现代的浏览器大多数原生支持模块功能，这可以减少传统外联脚本所带来的全局数据污染的问题，并且浏览器能够最优化加载模块，使它比使用库更有效率（使用库通常需要做额外的客户端处理），另外，ESM的块级作用域很大程度上减少了IIFE的使用。如要在传统的`<script>`标签使用模块化的方案，得在`<script>`标签中指定`type = "module"`，否则浏览器无法识别`import`

![image-20231128144050983](.\images\image-20231128144050983.png)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <script type="module" src="./vue-esm-import.js"></script>
</body>
</html>
```

```js
// vue.esm-export.js
export const Vue =  {
    createApp: 'ESM'
}
```

```js
// vue.esm-import.js
import { Vue } from './vue.esm-export.js'

const { createApp } = Vue

console.log(createApp); // 'ESM'
```

但对于老的浏览器来说（如：IE），他们并不能支持模块化的加载，那我们可以设置`nomodule`来指定浏览器要执行的文件。

```html
<scrip type="module" src="vue.esm-browser.js"></scrip>
<scrip nomodule src="vue.esm-bundler.js"></scrip>
```

当老的浏览器识别到`type = "module"`时，其不支持模块化的加载机制就选择执行带有`nomodule`标签的代码。**-bundler**结尾的代码可以由打包工具（如：**webpack**、**rollup.js**等）打包生成，该文件将所有模块中所使用到的代码整合到一起并使用`Tree-Shaking`来轻量化代码使得老的浏览器能够更好的识别与执行。

在网站开发中我们也可以完全使用原生`JavaScript`模块而不使用打包工具来实现相应的业务，但那也只适合：

1. 本地开发
2. 依赖模块总数小于100且最大相对依赖关联小于5层的简单应用程序

当遇到业务量负责、代码量巨大的情况时，原生使用`JavaScript`模块的方式会使得应用程序显得臃肿且有损性能，而使用**webpack**、**rollup.js**等打包工具能够对ES模块的静态`export`和`import`进行`Tree-Shaking`分析，优化掉不会被执行的代码，提升加载速度。

> Rollup.js默认导出es格式以适用其他的打包工具
>

### 使用CommonJS格式资源

- [为什么 ES 模块比 CommonJS 模块更好？ | Rollup 中文文档](https://cn.rollupjs.org/faqs/#why-are-es-modules-better-than-commonjs-modules)
- [Node.js 和浏览器之间的区别](https://dev.nodejs.cn/learn/differences-between-nodejs-and-the-browser/)

当我们在服务端渲染时，Vue.js的代码是在Node.js环境中运行的，而不是浏览器的环境，在Node.js的环境中，资源模块的格式应该为CommonJS的格式，即要能够输出cjs模块的资源。

我们通过修改`rollup.config.js`的配置来实现输出改格式的资源

```js
01 // rollup.config.js
const config = {
    input: 'input.js',
    output: {
        file: 'output.js',
        format: 'cjs' // 指定模块形式
    }
}

export default config
```

## 错误处理

- [你不知道的前端异常处理](https://mp.weixin.qq.com/s/St5szyXiT20StNURTaxMcg)
- [Vue3 如何实现全局异常处理？](https://juejin.cn/post/7071982812668100616)

像在编写**Vue**的`utils`工具时，可以在工具类中为使用者封装错误处理的函数，并提供函数用于注册

```js
// utils.js
let handleError = null // 定义全局的错误处理函数
export default {
    // 用户可以调用registerErrorHandler来注册自定义的错误处理函数
    registerErrorHandler(e){
        handleError = e;
    },
    // 将字符串转换为数组，在外套一层错误处理函数来处理错误
    string2Array(fileList) {
        return errorHandler(() => {
            if (!fileList) return [];
            const _arrayData = JSON.parse(fileList);
            let arrayList = [];
            for (const { name, score } of _arrayData) {
                arrayList.push({ name, score });
            }
            return arrayList;
        }, fileList);
    },
    bar(fn) {
        errorHandler(fn);
    },
}

// 错误处理函数
const errorHandler = (fn, args) => {
    let result;
    try {
        result = args ? fn(...args) : fn();
    } catch (e) {
        // 使用用户自定义的处理函数
        handleError(e);
    }
    return result;
};
```

使用`utils.js`中的函数

```js
import utils from "./utils.js";
// 注册自定义错误处理函数
utils.registerErrorHandler((e) => {
    console.log(e);
});

const res = utils.string2Array(
    '[{"name": "jack","score": 42,"sex": "male"},{"name": "lulu","score": 62,"sex": "female"}]'
);

utils.bar(() => {
    console.log(123);
});

// 输出：
// 通过：
123
[
    { name: 'yas', score: 42 },
    { name: 'yuki', score: 62 }
]
// 失败：
SyntaxError: Expected property name or '}' in JSON at position 2 (line 1 column 3)
    at JSON.parse (<anonymous>)
    at utils.js:13:31
    at errorHandler (utils.js:29:21)
    at Object.string2Array (utils.js:11:12)
    at module-output.js:7:19
```
