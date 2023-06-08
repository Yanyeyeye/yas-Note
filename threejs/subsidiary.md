# 辅助器 :raised_hands:

## 帧率显示器

**步骤1**：安装帧率显示器

```bash
npm install stats.js
```

**步骤2**：实现代码

```js
import Stats from 'stats.js'

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
// 放置位置
stats.dom.style.position = 'absolute'
stats.dom.style.top = '53px'
stats.dom.style.left = '0px'
// 放到DOM树中
document.getElementById('crown')!.appendChild(stats.dom)
```

### 效果

<p>
  <img src=".\images\Snipaste_2023-06-08_14-21-50.png" style="margin:0 auto;border-radius:8px">
</p>

::: tip

- 访问 [stats.js](http://mrdoob.github.io/stats.js/) 以获取更多内容
:::

## 坐标辅助器

```js
const axesHelper = new t.AxesHelper(300)
scene.add(axesHelper)
```

## 屏幕控制器

```js:line-numbers
// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true // 是否有阻尼
controls.zoomSpeed = 0.3 // 放大放小的速度
controls.enableRotate = false // 是否旋转
controls.autoRotateSpeed = 1 // 转速
controls.autoRotate = true // 是否能够自选
```

## 性能监视器

### 使用Spector来监控并优化性能

**步骤1**：安装`Spectorjs`
  
```bash
npm i spectorjs
```
  
**步骤2**：文件开头引入

```js
const SPECTOR = require("spectorjs");

const spector = new SPECTOR.Spector();
spector.displayUI();
```

<p>
  <img src=".\images\image-20230321171847926.png" style="margin:0 auto;border-radius:8px">
</p>

点击红色的开始运行

::: tip

- 访问 [Spector.js](https://github.com/BabylonJS/Spector.js/tree/v0.9.9#table-of-content) 以获取更多内容
:::
