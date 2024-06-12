# 编译器

编译器其实只是一段程序，它用来<u>将“一种语言 A”翻译成“另外一种语言 B”</u>。其中，语言 A 通常叫作**源代码**（source code），语言 B 通 常叫作**目标代码**（object code 或 target code）。编译器将源代码翻译为目标代码的过程叫作**编译**（compile）。完整的编译过程通常包含词法分析、语法分析、语义分析、中间代码生成、优化、目标代码生成等。

![image-20240221095449461](.\images\image-20240221095449461.png)

**Vue.js** 的模板和 **JSX** 属于特定领域的语言(DSL)，其中对于 **Vue.js** 的模板来说<u>源代码就是组件的模板</u>，而目标代码是能够运行在浏览器上的 **JavaScript** 代码或其他拥有 **JavaScript** 运行时的平台代码。

<img src=".\images\image-20240221101904013.png" alt="image-20240221101904013" style="zoom:80%;margin:0 auto" />

从上图可以看出 **Vue.js** 的目标代码就是渲染函数，源代码在模板编译器的作用下会先对模板编译器进行词法分析与语法分析，得到 **模板AST (Abstract syntax tree) 抽象语法树**，之后会将 **模板AST** 转换为 **JavaScriptAST** 最后根据 **JavaScriptAST** 生成 **JavaScript代码**，即渲染代码。

<img src=".\images\image-20240221102520960.png" alt="image-20240221102520960" style="zoom:80%;margin:0 auto" />

## 词法与语法分析

**模板** 转换为 **模板AST**也就是对模板进行词法分析和语法分析的过程可以用封装 **parse函数** 的方式来实现。

<img src=".\images\image-20240221104905106.png" alt="image-20240221104905106" style="zoom:80%;margin:0 auto" />

我们将如下这段模板：

```html
<div>
    <h1 v-if="ok">
        Vue Template
    </h1>
</div>
```

编译为如下模板AST：

```js
const ast = {
    type: 'Root',
    // 子节点
    children: [
        // 不同节点的类型用type区分
        // div标签
        type: 'Element',
        tag: 'div',
        children: [
            // h1 标签
            {
                type: 'Element',
                tag: 'h1',
                // 属性节点和指令节点存储的地方
                props: [
                    // v-if 指令节点
                    {
                        type: 'Directive', // 类型为指令
                        // 指令节点有 name 属性
                        name: 'if', // 指令名称为if
                        exp: {
                            // 表达式节点
                            type: 'Expression',
                            // 表达节点有content节点
                            content: 'ok'
                        }
                    }
                ]
            }
        ]
    ]
}
```

每一棵 AST 都有一个逻辑上的根节点，其类型为 Root，而模板上真正的根节点则为 Root 节点的 children。

我们用以下代码来表达模板的解析过程：

```js
const template = `
    <div>
        <h1 v-if="ok">Vue Template</h1>
    </div>
`

const templateAST = parse(template)
```

解析器parse函数接收字符串模板作为参数，解析后得到模板AST作为返回值返回。

## 有限状态自动机

在解析器中字符串模板中的字符会被逐个读取，并按照一定的规则切割为一个个token，假设我们有如下这样一段模板：

```html
<p>Vue</p>
```

解析器会先将该模板切割为三个token：

1. 开始标签：`<p>`
2. 文本节点：`Vue`
3. 结束标签：`</p>`

解析器中负责切割的函数为有限状态自动机，他会自动的在不同状态间迁移，对每个逐个读取到的字符进行分析，并完成对模板的**标记化**，以便后续AST的构造

<img src=".\images\image-20240221144345139.png" alt="image-20240221144345139" style="zoom: 67%;margin:0 auto" />

我们对上述的模板用自然语言来描述它的迁移过程：

1. 状态机始于初始状态1
2. 读取 `<` ，状态机进入标签开始状态2
3. 读取 `p` 为字母，进入标签名称状态3
4. 读取 `>` ，状态机迁移回初始状态1，**并记录标签名称状态下产生的标签名称 `p`**
5. 读取 `v` 为字母，状态机进入文本状态4
6. 读取 `u` 为字母，状态机仍在文本状态4，知道读取 `<` 状态机进入标签开始状态2，**并记录下文本状态下产生的文本 `Vue`**
7. 读取 `/` ，状态机进入结束标签状态5
8. 读取 `p` 为字母，状态机进入结束标签名称状态 6
9. 读取 `>` ，状态机迁移回初始状态1，**并记录下结束标签名称状态下产生的标签名称 `p`**

我们经过这样一系列状态的迁移过程后，就能得到相应的 **Token**，状态机迁移图中的双线代表了一个合法的 **Token**

状态机1.0逻辑代码实现

```js
// 定义状态机的状态
const State = {
    initial: 1,     // 初始状态1
    tagOpen: 2,     // 标签开始状态2
    tagName: 3,     // 标签名称状态3
    text: 4,        // 文本状态4
    tagEnd: 5,      // 结束标签状态5
    tagEndName: 6   // 结束标签名称状态6
}

// 辅助函数用于判断是否是字母
function isAlpha(char) {
    return char >= 'a' && char <= 'z' || char >= 'A' && char <= 'Z'
}

// 接收字符串为参数，并将模板切割为 Token 返回
function tokenize(str) {
    // 状态机的初始状态
    let currentState = State.initial
    // 用于缓存字符，逐个读入的字母，主要用于存储标签
    const chars = []
    // 生成 Token 存储到 tokens 数组中，并作为函数的返回值返回
    const tokens = []
    // 使用 while 开启自动机，只要字符串没有被消费完，状态机就一直运行
    while(str) {
        // 逐个查看每一个字母元素
        const char = str[0]
        // switch 匹配当前的状态
        switch(currentState) {
            // 状态机当前处于初始状态
            case State.initial:
                // 遇到字符 <
                if(char === '<'){
                    // 状态机切换到标签初始状态2
                    currentState = State.tagOpen
                    // 消费字符 <
                    str = str.slice(1)
                }else if(isAlpha(char)){
                    // 如果是字母，切换到文本状态3
                    currentState = State.text
                    // 将当前字母缓存到 chars 数组
                    chars.push(char)
                    // 消费掉当前字母
                    str = str.slice(1)
                }
            break
            // 状态机当前处于标签开始状态2
            case State.tagOpen:
                if(isAlpha(char)){
                    // 如果是字母，切换到标签名称状态3
                    currentState = State.tagName
                    // 将当前字母缓存到 chars 数组
                    chars.push(char)
                    // 消费掉当前字母
                    str = str.slice(1)
                }else if(char === '/') {
                    // 如果是 '/'，状态机进去结束标签状态5
                    currentState = State.tagEnd
                    // 消费掉当前字母
                    str = str.slice(1)
                }
            break
            // 状态机处于标签名称状态3
            case State.tagName:
                if(isAlpha(char)){
                    // 如果一直读到的是字母，则将当前字符缓存到 chars 数组中
                    chars.push(char)
                    // 消费掉当前的字符
                    str = str.slice(1)
                }else if(char === '>') {
                    // 如果与到字符 >,则将状态机切换回初始状态
                    currentState = State.initial
                    // 记录下标签名称状态下产生的标签名称p，并添加到token数组中
                    tokens.push({
                        type: 'tag',
                        name: chars.join('')
                    })
                    // 将chars数组的内容消费并清空
                    chars.length = 0
                    // 并消费掉当前字符 >
                    str = str.slice(1)
                }
            break
            // 状态机处于文本状态4
            case State.text:
                if(isAlpha(char)){
                    // 如果一直读到的是字母，则将当前字符缓存到 chars 数组中
                    chars.push(char)
                    // 消费掉当前的字符
                    str = str.slice(1)
                }else if(char === '<'){
                    // 将状态机切换为标签开始状态2
                   currentState =  State.tagOpen
                    // 记录下标签开始状态下产生的文本，并添加到token数组中
                    tokens.push({
                        type: 'text',
                        content: chars.join('')
                    })
                    // 将chars数组的内容消费并清空
                    chars.length = 0
                    // 并消费掉当前字符 >
                    str = str.slice(1)
                }
            break
            // 状态机处于结束标签状态5
            case State.tagEnd:
                if(isAlpha(char)){
                    // 如果读到字母，则将状态机的状态改为结束标签名称状态6
                    currentState =  State.tagEndName
                    // 将当前字符缓存到chars中
                    chars.push(char)
                    str = str.slice(1)
                }
            break
            // 状态机处于结束标签名称状态6
            case State.tagEndName:
                if(isAlpha(char)){
                    // 如果读到字母，则不改变状态机的状态，并将字符缓存进chars数组中
                    chars.push(char)
                    str = str.slice(1)
                }else if(char === '>'){
                    // 遇到字符 > ，将状态机切换回初始状态
                    currentState =  State.initial
                    // 并记录下结束标签名称状态下产生的标签名称
                    tokens.push({
                        type: 'tagEnd',
                        name: chars.join('')
                    })
                    // 将chars数组的内容消费并清空
                    chars.length = 0
                    // 并消费掉当前字符 >
                    str = str.slice(1)
                }
            break
        }
    }
    // 返回tokens
    return tokens
}
```

我们使用**tokenize函数**来解析开始的模板

```js
const tokens = tokenize(`<p>Vue</p>`)
```

输出：

![image-20240222152329512](.\images\image-20240222152329512.png)

### 构造AST

对于AST来说他其实就是一颗用于描述HTML的树，假设我们有如下模板

```html
<div>
    <p>Vue</p>
    <p>Template</p>
</div>
```

我们可以将对应的模板AST设计为：

```JS
const ast = {
    // AST 的逻辑根节点
    type: 'Root',
    children: [
        // 模板的 div 根节点
        type: 'Element',
        tag: 'div',
        children: [
            // div 节点的第一个子节点 p
            {
                type: 'Element',
                tag: 'p',
                // p节点的文本节点
                children: [
                    type: 'Text',
                    content: 'Vue'
                ]
            },
            // div 节点的第二个子节点 p
            {
                type: 'Element',
                tag: 'p',
                // p节点的文本节点
                children: [
                    type: 'Text',
                    content: 'Template'
                ]
            }
        ]
    ]
}
```

模板与模板AST其实是“同构”的，他们具有相同的树型结构

<img src=".\images\image-20240221172823214.png" alt="image-20240221172823214" style="zoom: 67%;margin:0 auto" />

我们将该模板先进行**标记化**，得到如下内容

```js
const tokens = [
    {type: 'tag', name: 'div'},
    {type: 'tag', name: 'p'},
    {type: 'text', name: 'Vue'},
    {type: 'tagEnd', name: 'p'},
    {type: 'tag', name: 'p'},
    {type: 'text', name: 'Template'},
    {type: 'tagEnd', name: 'p'},
    {type: 'tagEnd', name: 'div'}
]
```

而生成模板AST的方法则是需要对整个Token列表进行扫描。那如何将Token列表变成树型结构的模板呢？就需要栈来辅助，每遇到一个开始标签节点就构造一个AST节点并压入栈，遇到普通节点就直接挂载到栈顶元素的children属性下，遇到结束标签节点就把栈顶元素节点弹出。

<img src=".\images\image-20240222101841641.png" alt="image-20240222101841641" style="zoom: 80%;margin:0 auto" />

我们拿上图例子来模拟一边过程：

1. 初始状态下Root根节点就在栈的底端

2. 从上到下扫描Token列表，读取'**开始标签(div)**'，由于是开始标签则把他压入栈中，并创建div子节点挂载到AST上

   <img src=".\images\image-20240222102725863.png" alt="image-20240222102725863" style="zoom:67%;margin:0 auto" />

3. 再次往下扫描读取'**开始标签(p)**'，由于也是开始标签则把它压入栈中，并创建p元素子节点挂载到栈顶元素div上

   <img src=".\images\image-20240222102924689.png" alt="image-20240222102924689" style="zoom:67%;margin:0 auto" />

4. 再次往下扫描到'**文本(Vue)**'，由于是普通节点所以不把它压入栈中而是直接挂载到栈顶元素p的节点上

   <img src=".\images\image-20240222103125158.png" alt="image-20240222103125158" style="zoom:67%;margin:0 auto" />

5. 再次往下扫描到'**结束标签(p)**'，将栈顶元素弹出栈

   <img src=".\images\image-20240222103817789.png" alt="image-20240222103817789" style="zoom:67%;margin:0 auto" />

6. 再次往下扫描到’**开始标签(p)**'，将其压入栈中并创建AST节点挂载到栈顶元素div上

   <img src=".\images\image-20240222104009561.png" alt="image-20240222104009561" style="zoom:67%;margin:0 auto" />

7. 再次往下扫描‘**文本(Template)**'，由于是普通节点直接创建AST节点并挂载到栈顶元素p上

   <img src=".\images\image-20240222104122642.png" alt="image-20240222104122642" style="zoom:67%;margin:0 auto" />

8. 往下扫描到’**结束标签(p)**‘，将栈顶元素p弹出栈

   <img src=".\images\image-20240222104218277.png" alt="image-20240222104218277" style="zoom:67%;margin:0 auto" />

9. 往下扫描到’**结束标签(div)**‘，将栈顶元素div弹出栈

   <img src=".\images\image-20240222104259099.png" alt="image-20240222104259099" style="zoom:67%;margin:0 auto" />

10. 剩下Root根节点，遍历结束生成，一颗AST构建完成

    <img src=".\images\image-20240222104357847.png" alt="image-20240222104357847" style="zoom:67%;margin:0 auto" />

代码(1.0)逻辑实现如下

```js
function parse(str) {
    // 首先对模板进行标记，得到tokens
    const tokens = tokenize(str)
    // 创建Root节点
    const root = {
        type: 'Root',
        children: []
    }
    // 创建elementStack栈用于辅助创建AST并压入初始节点Root
    const elementStack = [root]
    
    // 开启循环扫描tokens
    while(tokens.length) {
        // 获取当前栈顶元素作为父节点parent
        const parent = elementStack[elementStack.length - 1]
        // 获取当前token
        const t = tokens[0]
        switch(t.type) {
            case 'tag':
                // 如果当前的Token为开始标签，则创建Element类型的节点作为AST节点
                const elementNode = {
                    type: 'Element',
                    tag: t.name,
                    children: []
                }
                // 将其添加到父级节点的children中
                parent.children.push(elementNode)
                // 将当前节点压入栈中
                elementStack.push(elementNode)
                break
            case 'text':
                // 如果当前节点为文本节点，则创建Text类型的节点作为AST节点
                const textNode = {
                    type: 'Text',
                    content: t.content
                }
                // 将普通节点挂载到当前栈顶节点的children上
                parent.children.push(textNode)
                break
            case 'tagEnd':
                // 遇到结束标签，将栈顶节点弹出
                elementStack.pop()
                break
        }
        // 消费已经过扫描的 token，shift() 是数组（Array）对象的一个方法
        // 用于删除并返回数组的第一个元素
        tokens.shift()
    }
    // 最后返回 AST
    return root
}
```

运行测试一下

```js
const ast = parse(`<div><p>Vue</p><p>Template</p></div>`)
```

结果与一开始构造的AST模板一致：

<img src=".\images\image-20240222152505039.png" alt="image-20240222152505039" style="zoom: 80%;margin:0 auto" />

<img src=".\images\image-20240222161930909.png" alt="image-20240222161930909" style="zoom:80%;margin:0 auto" />

### AST的转换与插件化

要对AST节点进行转换我们就需要遍历AST中的每个节点，那么我们使用深度优先算法来实现对AST的遍历。

我们用dump函数来打印AST树中每个节点的信息

```js
function dump(node, indent = 0) {
    // 节点类型
    const type = node.type
    // 节点的描述，如果是根节点，则没有描述
    // 如果是 Element 类型的节点，则使用 node.tag 作为节点的描述
    // 如果是 Text 类型的节点，则使用 node.content 作为节点的描述
    const desc = node.type === 'Root' ? '' : node.type === 'Element' ? node.tag : node.content
    
    // 打印节点的类型和描述信息
    console.log(`${'-'.repeat(indent)}${type}: ${desc}`)

    // 递归的打印子节点，深度遍历先遍历左子节点再遍历右子节点
    if(node.children) {
        node.children.forEach(n => dump(n, indent + 2))
    }
}
```

对之前初步处理的模板AST进行深度遍历获取每个节点的信息

```js
const ast = parse(`<div><p>Vue</p><p>Template</p></div>`);
dump(ast);
```

得到的信息为

<img src=".\images\image-20240222160804933.png" alt="image-20240222160804933" style="zoom:80%;margin:0 auto" />

接下来我们编写一个工具函数用来遍历AST函数并用来完成对节点的转换

```js
function traverseNode(ast) {
    // 当前节点，ast本身就是Root节点
    const currentNode = ast
    
    // 转化操作
    if(currentNode.type === 'Element' && currentNode.tag === 'p'){
        // 将所有p标签转换为h1标签
        currentNode.tag = 'h1'
    }
    
    // 如果有子节点，则递归的调用 traverseNode 函数进行遍历
    const children = currentNode.children
    if(children) {
        for(let i = 0; i < children.length; i++) {
            traverseNode(children[i])
        }
    }
}
```

我们对它进行测试

```js
const ast = parse(`<div><p>Vue</p><p>Template</p></div>`);
traverseNode(ast);

// 打印 AST 信息
dump(ast);
```

<img src=".\images\image-20240222163150298.png" alt="image-20240222163150298" style="zoom:80%;margin:0 auto" />

我们可以看到所有的p标签变成了h1标签，我们对**traverseNode函数**进行改造，对内部处理节点的方法进行解耦

```js
function traverseNode(ast, Context) {
    // 当前节点，ast本身就是Root节点
    const currentNode = ast
    
    // 转化操作，解耦函数
    // context.nodeTransforms 是一个数组，其中每一个元素都是一个功能函数
    const tansforms = Context.nodeTransforms
    for(let i = 0; i < transforms.length; i++) {
        transforms[i](currentNode, Context)
    }
    
    // 如果有子节点，则递归的调用 traverseNode 函数进行遍历
    const children = currentNode.children
    if(children) {
        for(let i = 0; i < children.length; i++) {
            traverseNode(children[i], Context)
        }
    }
}
```

我们用**transform函数**来包装它

```js
function transform(ast) {
    // 在 transform 函数中内部创建 content 对象
    const Context = {
        // 注册 nodeTransforms 数组用来存储功能函数
        nodeTransforms: [
            transformElement // 用来转换标签节点
        ]
    }
    // 调用 traverseNode 函数来完成转换
    traverseNode(ast, content)
    dump(ast)
}

function transformElement(node) {
     if(currentNode.type === 'Element' && currentNode.tag === 'p'){
        // 将所有p标签转换为h1标签
        currentNode.tag = 'h1'
    }
}
```

<img src=".\images\image-20240222165944262.png" alt="image-20240222165944262" style="zoom:80%;margin:0 auto" />

在上述**transform代码**中我们利用**Context变量**来存储上下文所要访问的数据，除了转换函数之外我们还可以用它来存储当前转换的节点，当前转换节点的父节点以及当前转换节点是父节点的第几个节点等等你想要操作的数据，接着就可以使用这些存储的变量来操作AST中的节点，如果：替换当前节点、移除当前节点

利用上下文这一变量属性，我们扩展**transform函数**代码的功能

```js
function transform(ast) {
    const context = {
        // 1.增加 currentNode 用来存储当前正在转换的节点
        currentNode: null,
        // 2.用于存储当前节点在父节点 children 中的位置索引
        childrenIndex: 0,
        // 3.增加 parent，用来存储当前转换节点的节点
        parent: null,
        // 4.替换当前节点
        replaceNode(node) {
            // 找到当前节点在当前父节点children中的位置，然后将他替换
            context.parent.children[context.childIndex] = node
            // 并改变当前节点
            context.currentNode = node
        },
        // 5.移除当前节点
        removeNode(node) {
            // 先判断有没有父节点，以便于移除子节点
            if(context.parent) {
                // 调用splice方法，根据当前索引删除当前节点，不改变原有数组
                context.parent.children.splice(context.childrenIndex, 1)
                // 将 context.currentNode 当前的节点制空
                context.currentNode = null
            }
        },
        nodeTransforms: [
            transformElement,
            transformText,
            transformRoot
        ]
    }
    
    traverseNode(ast, context)
    dump(ast)
}

// 在遇到是文本节点的时候就将该节点替换为span元素标签
function transformText(ast, context) {
    if(node.type === 'Text') {
        // 1.如果当前节点是 Text 节点，则调用replaceNode节点将他替换
        context.replaceNode({
            type: 'Element',
            tag: 'span'
        })
        // 2.或者移除当前文本节点
        context.removeNode()
    }
}
```

相应的我们也在**traverseNode函数**中增加相应的功能

```js
function traverseNode(ast, context) {
    // 设置当前转换的节点信息
    context.currentNode = ast
    
    const transforms = context.nodeTransforms
    // 使用解耦的函数
    for(let i = 0; i < transforms.length; i++) {
        transforms[i](context.currentNode, context)
        // 1.因为每个函数在执行时都可能调用removeNode函数来移除当前的节点
        // 所以每次函数致谢结束后都要判断当前节点是否还存在
        if(!context.currentNode) return
    }
    
    const children = context.currentNode.children
    if(children) {
        // 遍历函数 children 中的子节点
        for(let i = 0; i < children.length; i++) {
            // 2.递归的调用 traverseNode 转换子节点之前，将当前节点设置为父节点
            context.parent = context.currentNode
            // 3.设置当前子节点的在父节点中的索引
            context.childrenIndex = i
            // 4.递归地调用
            traverseNode(children[i], context)
        }
    }
}
```

在对AST进行模板转换的时候，往往会要根据子节点的情况来决定对当前节点的转换，而在对AST进行深度遍历的时候，会先遍历父节点再遍历子节点，这就会遇到一个问题父节点无法被重新处理，我们需要重写改写**traverseNode函数**

```js
function traverseNode(ast, context) {
    // 设置当前转换的节点信息
    context.currentNode = ast
    // 1.获取推出阶段的回调函数数组
    const exitFns = []
    const transforms = context.nodeTransforms
    // 使用解耦的函数
    for(let i = 0; i < transforms.length; i++) {
        // 2.在每次运行节点的转换函数后，来获取回调函数返回的内容
        const onExit = transforms[i](context.currentNode, context)
        // 3.如果有返回值则将该内容添加到 exitFns 数组中
        if(onExit) {
            exitFns.push(onExit)
        }
        if(!context.currentNode) return
    }
    
    const children = context.currentNode.children
    if(children) {
        // 遍历函数 children 中的子节点
        for(let i = 0; i < children.length; i++) {
            // 递归的调用 traverseNode 转换子节点之前，将当前节点设置为父节点
            context.parent = context.currentNode
            // 设置当前子节点的在父节点中的索引
            context.childrenIndex = i
            // 递归地调用
            traverseNode(children[i], context)
        }
    }
    
    // 4.从后往前反向执行 exitFns 中的函数
    // 以便根据子节点的状态来决定如何工作
    let i = exitFns.length
    while(i--) {
        exitFns[i]()
    }
}

// 5.类似的转换函数写法
function transformElement(node, context) {
    // 进入节点
    ...
    // 退出节点，返回一个在退出节点时执行的回调函数
    return() => {
        // 在这里编写退出节点的逻辑，当这里的代码运行时，当前转换节点的子节点一定处理完毕了
    }
}
```

### 模板AST转换为JavaScriptAST

<img src=".\images\image-20240223141458067.png" alt="image-20240223141458067" style="zoom:80%;margin:0 auto" />

我们在将模板编译为模板AST后还需要将其转换为 **JavaScriptAST**，因为模板最终要在编译器的帮助下生成渲染函数，而渲染函数是通过**JavaScript代码** 来描述的，如下所示模板与其最终的渲染函数

```html
<div>
    <p>Vue</p>
    <p>Template</p>
</div>
```

```js
function render() {
    return h('div', [
        h('p', 'Vue'),
        h('p', 'Template')
    ])
}
```

上面这段 **JavaScript代码** 就是渲染函数，也是我们要实现的 **JavaScript代码**，它是由 **JavaScriptAST** 转换而成的，所以我们需要构造一套 **JavaScriptAST** 代码来表述这个渲染函数，我们可以设计一个基本的数据结构来描述函数声明语句

```js
const FunctionDeclNode = {
    // 该节点是函数声明
    type: 'FunctionDecl',
    // 函数的名称是一个标识符，标识符也是一个节点
    id: {
        type: 'Identifier',
        name: 'render' // name 用来存储标识符的名称，在这里他就是渲染函数的名称 render
    },
    params: [], // 目前渲染函数还不需要参数，所以是个空数组
    // 渲染函数的函数体只有一个语句，即 return 语句，里面返回 h 函数渲染的标签
    body: [{
            type: 'ReturnStatement',
            // 最外层是 h 函数调用
            return: {
                // 该节点是函数的调用，调用 h 函数
                type: 'CallExpression',
                // 用来描述被调用函数的名称
                callee: { type: 'Identifier', name: 'h' },
                // 被调用函数的形式参数
                arguments: [
                    // 第一个参数是字面量 'div'
                    { type: 'StringLiteral', value: 'div' },
                    // 第二个参数是一个数组
                    {
                        type: 'ArrayExpression',
                        // 数组中的元素
                        elements: [{
                                // 该节点也是函数的调用，调用 h 函数
                                type: 'CallExpression',
                                callee: { type: 'Identifier', name: 'h' },
                                arguments: [
                                    // 第一个参数是字符串字面量 'p'
                                    { type: 'StringLiteral', value: 'p' },
                                    // 第二个参数也是字符串字面量 'Vue'
                                    { type: 'StringLiteral', value: 'Vue' }
                                ]
                            },{
                                // 数组第二个元素也是函数的调用，调用 h 函数
                                type: 'CallExpression',
                                callee: { type: 'Identifier', name: 'h' },
                                arguments: [
                                    // 第一个参数是字符串字面量 'p'
                                    { type: 'StringLiteral', value: 'p' },
                                    // 第二个参数也是字符串字面量 'Vue'
                                    { type: 'StringLiteral', value: 'Template'}
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    ]
}
```

为了将模板AST转换为上述 **JavaScriptAST** ，我们需要编写一些辅助函数来转换AST

<img src=".\images\image-20240222161930909.png" alt="image-20240222161930909" style="zoom:80%;margin:0 auto" />

```js
// 用来创建 StringLiteral 字符串字面量节点
function createStringLiteral(value) {
    return {
        type: 'StringListeral',
        value
    }
}

// 用来创建 Identifier 函数标识符节点
function createIdentifier(name) {
    return {
        type: 'Identifier',
        name
    }
}

// 用来创建 ArrayExpression 数组节点
function createArrayExpression(elements) {
    return {
        type: 'ArrayExpression',
        elements
    }
}

// 用来创建 CallExpression 函数调用节点
function createCallExpression(callee, arguments) {
    return {
        type: 'CallExpression',
        callee: createIdentifier(callee),
        arguments
    }
}

// 转换文本节点
function transformText(node) {
    // 如果不是文本节点，则什么都不做
    if(node.type !== 'Text') {
        return
    }
    // 文本节点对应的 JavaScript AST 节点其实就是一个字符串字面量,
    // 因此只需要使用 node.content 创建一个 StringLiteral 类型的节点即可
    // 最后将文本节点对应的 JavaScript AST 节点添加到 node.jsNode 属性下
    // 且无论是文本节点还是标签节点
    // 它们转换后的 JavaScript AST 节点都存储在节点的 node.jsNode 属性下
    node.jsNode = createStringLiteral(node.content)
}

// 标签转换节点
function transformElement(node) {
    // 将转换代码编写在退出阶段的回调函数中
    // 这样可以保证该标签节点的子节点全部被处理完毕
    return () => {
        // 如果被转换的节点不是元素节点，则什么都不做
        if(node.type !== 'Element') {
            return
        }
        // 1.创建h函数调用语句，h函数调用的第一个参数是标签名称
        // 因此我们以node.tag来创建一个字面量
        const callExp = createCallExpression('h', [
            createStringLiteral(node.tag)
        ])
        // 2.处理 h 函数调用的参数
        node.children.length === 1 ?
        // 如果当前标签节点只有一个子节点
        // 则直接使用子节点的 jsNode 作为参数,
        // jsNode 是在转换文本节点时生成的
        callExp.arguments.push(node.children[0].jsNode) :
        // 如果当前标签节点有多个子节点
        // 则创建一个 ArrayExpression 节点作为参数
        callExp.arguments.push(createArrayExpression(node.children.map(c => c.jsNode)))
        // 3. 将当前标签节点对应的 JavaScript AST 添加到 jsNode 属性下
        node.jsNode = callExp
    }
}

// 转换Root根节点
function transformRoot(node) {
    // 编写回调函数，保证子节点处理完成
    return () => {
        // 如果不是根节点，则什么都不做
        if(node.type !== 'Root') {
            return
        }
        // node 是根节点，根节点的第一个子节点就是模板的根节点
        // 在这里不考虑模板存在多个根节点的情况
        const vnodeJSAST = node.children[0].jsNode
        
        // 创建 render 函数的声明语句节点
        // 将 vnodeJSAST 作为 render 函数体的返回语句
        node.jsNode = {
            type: 'FunctionDecl',
            id: { type: 'Identifier', name: 'render' },
            params: [],
            body: [{
                type: 'ReturnStatement',
                return: vnodeJSAST
            }]
        }
    }
}
```

### 代码生成

代码生成其实就是字符串的拼接，在代码生成的过程中我们需要访问 **JavaScript AST** 中的节点，为每一种类型的节点生成相符的 **JavaScript 代码**。

我们用 **generate代码**  来为实现代码的生成工作提供工具函数以及为函数提供上下文数据

```js
function generate(node) {
    const context = {
        code: '',
        push(code) {
            context.code += code
        },
        // 当前缩进距离，初始值为0，即没有缩进
        currentIndent: 0,
        // 该函数用来换行，即在代码字符串的后面追加 \n 字符，
        // 另外换行应该要保持缩进
        // 所以我们还要追加 currentIndent * 2 个空格字符串
        newline() {
            context.code += '\n' + `    `.repeat(context.currentIndent)
        },
        // 用来缩进
        indent() {
            context.currentIndent++
            context.newline()
        },
        // 用来取消缩进
        deIndent() {
            context.currentIndent--
            context.newline()
        }
    }
    
    // 代码生成函数
    genNode(node, context)
    return context.code
}
```

我们用 **genNode函数** 来匹配节点并生成函数

```js
function genNode(node, context) {
    switch(node.type) {
        // 处理声明函数的生成
        case 'FunctionDecl':
            genFunctionDecl(node, context)
            break
        // 处理渲染函数的生成
        case 'ReturnStatement':
            genReturnStatement(node, context)
            break
        // 处理 h 函数的生成
        case 'CallExpression':
            genCallExpression(node, context)
            break
        // 处理字符串字面量
        case 'StringLiteral':
            genStringLiteral(node, context)
            break
        // 处理函数数组
        case 'ArrayExpression':
            genArrayExpression(node, context)
            break
    }
}
```

我们先来编写 **genFunctionDecl函数** 来实现申明函数的实现

```js
function genFunctionDecl(node, context) {
    // 从 context 对象中取出工具函数
    const { push, indent, deIndent } = context
    // node.id 是一个标识符
    // 用来描述函数对象，即 node.id.name
    push(`function ${node.id.name} `)
    push(`(`)
    // 调用 genNodeList 为函数的参数生成代码
    genNodeList(node.params, context)
    push(`) `)
    push(`{`)
    indent()
    // 缩进
    node.body.forEach(n => genNode(n, context))
    // 取消缩进
    deIndent()
    push(`}`)
}

// 对相应的节点生成对应的代码
function genNodeList(nodes, context) {
    const { push } = context
    for(let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        genNode(node, context)
        if(i < nodes.length - 1) {
            push(', ')
        }
    }
}

// 生成数组的相应代码
function genArrayExpression(node, context) {
    const { push } = context
    // 追加方括号
    push('[')
    // 调用 genNodeList 为数组元素生成代码
    genNodeList(node.elements, context)
    // 补全方括号
    push(']')
}

// 生成渲染函数的代码 
function genReturnStatement(node, context) {
    const { push } = context
    // 追加 return 关键字和空格
    push(`return `)
    // 调用 genNode 函数递归生成返回值代码
    genNode(node.return, context)
}

// 生成字符串字面量
function genStringLiteral(node, context) {
    const { push } = context
    // 对于字符串字面量
    // 只需要追加 node.value 对应的字符串即可
    push(`'${node.value}'`)
}

// 生成 h 函数
function genCallExpression(node, context) {
    const { push } = context
    // 取得被调用函数名称和参数列表
    const { callee, arguments: args } = node
    // 生成函数调用代码
    push(`${callee.name}(`)
    // 调用 genNodeList 生成参数代码
    genNodeList(args, context)
    push(`)`)
}
```

最后成功转换输出：

<img src=".\images\image-20240227171230145.png" alt="image-20240227171230145" style="zoom:80%;margin:0 auto" />
