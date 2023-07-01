# 初始化配置 :package:

:::tip 提示
在`Threejs`中，Z轴朝向我们，X轴朝向右侧，Y轴朝向上方
:::

## 帧率显示器

**步骤1**：安装帧率显示器

```bash
npm install stats.js
```

**步骤2**：实现代码

```ts
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

## 坐标辅助器

```ts
const axesHelper = new t.AxesHelper(300)
scene.add(axesHelper)
```

## 屏幕控制器

```ts
// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true // 是否有阻尼
controls.zoomSpeed = 0.3 // 放大放小的速度
controls.enableRotate = false // 是否旋转
controls.autoRotateSpeed = 1 // 转速
controls.autoRotate = true // 是否能够自选
```

## 渲染器初始化

```ts
const renderer = new t.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = t.PCFSoftShadowMap
renderer.useLegacyLights = true // 物理灯光照射
renderer.outputEncoding = t.sRGBEncoding // 当导入的材质是sRGB编码时
renderer.toneMapping = t.ACESFilmicToneMapping // 使用算法将HDR值转换为LDR值，使其介于0到1之间， 0 <---> 1
renderer.toneMappingExposure = 0.75 // 渲染器将允许多少光线进入
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
```

## 鼠标控制

```ts
// 鼠标操作
const controls = new OrbitControls(camera, renderer.domElement)
controls.listenToKeyEvents(window) // 监听页面上的鼠标操作
controls.screenSpacePanning = false

controls.minDistance = 100
controls.maxDistance = 500

controls.maxPolarAngle = Math.PI / 2 // 只能移动上下移动90度
controls.enableDamping = true
```

## 场景初始化

```vue:line-numbers
<script setup lang="ts">
import * as t from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const scene = new t.Scene()

const geometry = new t.BoxGeometry(1, 1, 1);
const material = new t.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new t.Mesh(geometry, material);
scene.add(cube);

const SIZE = {
    width: window.innerWidth, 
    height: window.innerHeight
}
const PROPOTION = SIZE.width / SIZE.height
const camera = new t.PerspectiveCamera(75, PROPOTION, 0.1, 1000)
camera.position.z = 1
camera.position.y = 1
camera.position.x = 1

const renderer = new t.WebGLRenderer({
    antialias: true
})
renderer.setSize(SIZE.width, SIZE.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
onMounted(() => {
    document.getElementById('box')!.appendChild(renderer.domElement)
})

// 鼠标操作
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// const clock = new t.Clock() // 从初始化时就开始运行
// animate()
const animate = () => {
    controls.update() // 鼠标控制
    // const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
    // TODO
    renderer.render(scene, camera) // 重新渲染渲染器也就是让渲染器拍照记录物体新的位置
    requestAnimationFrame(animate)// 调用动画渲染60帧/s的显示屏
}
animate() // 调用动画函数
</script>

<template>
    <div id="box"></div>
</template>
```

<div id="box" style="margin:0 auto;width:300px;height:300px"></div>

<script setup lang="ts">
import * as t from 'three'
import { onMounted } from 'vue'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const scene = new t.Scene()

const geometry = new t.BoxGeometry(1, 1, 1);
const material = new t.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new t.Mesh(geometry, material);
scene.add(cube);

const SIZE = {
    width: 300,
    height: 300,
}
const PROPOTION = SIZE.width / SIZE.height

const camera = new t.PerspectiveCamera(75, PROPOTION, 0.1, 1000)
camera.position.z = 1
camera.position.y = 1
camera.position.x = 1

const renderer = new t.WebGLRenderer({
    antialias: true
})
renderer.setSize(SIZE.width, SIZE.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

onMounted(() => {
    document.getElementById('box')!.appendChild(renderer.domElement)
})

// 鼠标操作
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// const clock = new t.Clock() // 从初始化时就开始运行
// animate()
const animate = () => {
    controls.update() // 鼠标控制
    // const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
    // TODO
    cube.rotateX(0.01)
    cube.rotateZ(0.01)
    renderer.render(scene, camera) // 重新渲染渲染器也就是让渲染器拍照记录物体新的位置
    requestAnimationFrame(animate)// 调用动画渲染60帧/s的显示屏
}
animate() // 调用动画函数
</script>
