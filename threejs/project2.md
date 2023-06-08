---
outline: deep
---
# 制作一个银河系 :milky_way:

## 准备

### 定义参数

定义银河系中的相关参数，方便GUI的调试

```ts
const paramter = {
  count: 10000, // 定义10000个粒子
  size: 0.02 // 定义每个粒子的大小
}
```

### 定义粒子类型

``` ts
let geometry: t.BufferGeometry | null
let material: t.PointsMaterial | null
let points: t.Points<t.BufferGeometry, t.PointsMaterial> | null
```

### 定义恒星几何粒子

```ts:line-numbers
const geometry = new t.BufferGeometry()
const positions = new Float32Array(parameters.count * 3)

for(let i = 0; i < parameters.count; i++){
  // 获得指定位置的 x，y，z，因为是以顶点坐标每三位为一个单位进行取的
  const i3 = i * 3 

  positions[i3 + 0] = (Math.random() - 0.5) * 3 // 定义x的位置在[-1.5, 1.5)之间
  positions[i3 + 1] = (Math.random() - 0.5) * 3 // 定义y的位置在[-1.5, 1.5)之间
  positions[i3 + 3] = (Math.random() - 0.5) * 3 // 定义z的位置在[-1.5, 1.5)之间
}

geometry.setAttribute(
  'position', // 设置geometry几何粒子的位置
  new t.BufferAttribute(position, 3) // 顶点位置以x，y，z三位为一个单位
)
```

### 定义恒星粒子材质

``` ts
const material = new t.PointsMaterial({
  // 定义大小
  size: paramter.size,
  // 指定点的大小是否因相机深度而衰减。（仅限透视摄像头。）默认为true。
  sizeAttenuation: true, 
  depthWrite: false, // 不写入深度缓存中，使其保持有前后位置的参数
  blending: t.AdditiveBlending, // 使用additive混合模式
})
```

### 生成恒星粒子

``` ts
const points = new t.Points(geometry, material)
scene.add(points)
```

### 优化银河性能

我们需要在每次生成粒子后消除之前的粒子来释放能存提高性能

```ts
if (points) {
  geometry!.dispose() // 从内存中销毁对象
  material!.dispose() // 从内存中销毁对象
  scene.remove(points) // 移除场景中的粒子
}
```

<p>
  <img src=".\images\image-20221110135307685.png" style="margin:0 auto;border-radius:8px">
</p>

### GUI调试

我们可以添加`GUI`来调试实时调试粒子的状态

```ts
// .onFinishChange(generateGalaxy)在鼠标停止操作后生效
// 改变粒子数量
gui.add(parameters, 'count')
  .min(100)
  .max(100000)
  .step(100)
  .onFinishChange(generateGalaxy)
// 改变粒子大小
gui.add(parameters, 'size')
  .min(0.001)
  .max(0.1)
  .step(0.01)
  .onFinishChange(generateGalaxy)
```

## 拉成线

我们将这些粒子压成一条线，来做出银河中的一条星河

```ts:line-numbers
const parameters = {
  // ...
  radius: 5, // 在银河的参数中定义银河的半径 // [!code focus]
}

const generateGalaxy = () => {
  // ...
  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3
    // 定义半径的范围为[0, parameters.radius) // [!code focus]
    const radius = Math.random() * parameters.radius // [!code focus]
    positions[i3] = radius // 将半径赋给粒子的x轴 // [!code focus]
    positions[i3 + 1] = 0 // 将粒子在y轴上的位置变为0 // [!code focus]
    positions[i3 + 2] = 0 // 将粒子在z轴上的位置变为0 // [!code focus]
  }
  // ...
}

// 实现银河半径debug调试 // [!code focus]
gui.add(parameters, 'radius') // [!code focus]
    .min(0.01) // [!code focus]
    .max(20) // [!code focus]
    .step(0.01) // [!code focus]
    .onFinishChange(generateGalaxy) // [!code focus]
```

<p>
  <img src=".\images\image-20221110140704620.png" style="margin:0 auto;border-radius:8px">
</p>

## 新增分支

我们给银河增加一些分支使它看起来像许多星系交织在一起的样子

```ts:line-numbers
const parameters = {
  // ...
  branch: 5, // 在银河的参数中定义银河中的分支数 // [!code focus]
}

const generateGalaxy = () => {
  // ...
  for (let i = 0; i < parameters.count; i++) {
  const i3 = i * 3

  // 定义半径的范围为[0, parameters.radius) // [!code focus]
  const radius = Math.random() * parameters.radius // [!code focus]

  // 将所有粒子分成parameters.branch堆， // [!code focus]
  // 将整个圆分成parameters.branch个部分，两个相乘就是个粒子所在的角度 // [!code focus]
  const branchAngle = (i % parameters.branch) / parameters.branch * Math.PI * 2 // [!code focus]
  positions[i3] = Math.cos(branchAngle) // 将角度转换为在x轴上的值 // [!code focus]
  positions[i3 + 1] = 0 // 将粒子在y轴上的位置变为0 // [!code focus]
  positions[i3 + 2] = Math.sin(branchAngle) // 将角度转换为在z轴上的值 // [!code focus]
  }
  // ...
}

// 给银河的分支debug调试 // [!code focus]
gui.add(parameters, 'branch') // [!code focus]
  .min(1) // [!code focus]
  .max(10) // [!code focus]
  .step(1) // [!code focus]
  .onFinishChange(generateGalaxy) // [!code focus]
```

<p>
  <img src=".\images\image-20221110144050694.png" style="margin:0 auto;border-radius:8px">
</p>

## 旋转

```ts:line-numbers
const parameters = {
  // ...
  spin: 5, // 在银河的参数中定义银河中旋转的程度 // [!code focus]
}

const generateGalaxy = () => {
  // ...
  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3

    // 定义半径的范围为[0, parameters.radius)
    const radius = Math.random() * parameters.radius 

    // 定义每一个粒子偏离的角度，距离中心越近的粒子偏离的角度越小，越远的越大 // [!code focus]
    const spinAngle = radius * parameters.spin // [!code focus]

    // 将所有粒子分成parameters.branch堆，
    // 将整个圆分成parameters.branch个部分，两个相乘就是个粒子所在的角度
    const branchAngle = (i % parameters.branch) / parameters.branch * Math.PI * 2
    // 将角度转换为在x轴上的值 // [!code focus]
    positions[i3] = Math.cos(branchAngle + spinAngle) * radius  // [!code focus]
    positions[i3 + 1] = 0 // 将粒子在y轴上的位置变为0 // [!code focus]
    // 将角度转换为在z轴上的值 // [!code focus]
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle)  * radius // [!code focus]
  }
  // ...
}

// 给星系添加偏移的角度的debug // [!code focus]
gui.add(parameters, 'spin') // [!code focus]
  .min(-5) // [!code focus]
  .max(5) // [!code focus]
  .step(0.001) // [!code focus]
  .onFinishChange(generateGalaxy) // [!code focus]
```

<p>
  <img src=".\images\image-20221110144908561.png" style="margin:0 auto;border-radius:8px">
</p>

## 散射

让每一个分支上的粒子成散射状态

```ts:line-numbers
const parameters = {
    // ... 
    randomness: 0.2, // 在银河的参数中定义银河中旋转的程度 // [!code focus]
}

const generateGalaxy = () => {
  // ...
  for (let i = 0; i < parameters.count; i++) {
    // ...
        
    // 让每一个粒子的x，y，z都拥有自己的位置，// [!code focus]
    // 越靠近中心的散射能力越小，// [!code focus]
    // 越远离中心的散射能力越强// [!code focus]
    const randomX = (Math.random() - 0.5) * parameters.randomness * radius// [!code focus]
    const randomY = (Math.random() - 0.5) * parameters.randomness * radius// [!code focus]
    const randomZ = (Math.random() - 0.5) * parameters.randomness * radius// [!code focus]

    // 将角度转换为在x轴上散射 // [!code focus]
    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX // [!code focus]
    // 将粒子在y轴上散射// [!code focus]
    positions[i3 + 1] = randomY  // [!code focus]
    // 将角度转换为在z轴上散射 // [!code focus]
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle)  * radius + randomZ // [!code focus]
  }
  // ...
}

// 调试分支上粒子的散射状态// [!code focus]
gui.add(parameters, 'randomness')// [!code focus]
  .min(0)// [!code focus]
  .max(2)// [!code focus]
  .step(0.001)// [!code focus]
  .onFinishChange(generateGalaxy)// [!code focus]
```

<p>
  <img src=".\images\image-20221110150726407.png" style="margin:0 auto;border-radius:8px">
</p>

## 引力

为了让银河更真实一点，越靠近中心的粒子越多越紧密，越远离的越少越散射

```ts:line-numbers
const parameters = {
    // ... 
    randomnessPower: 3, // 在银河的参数中定义银河中心吸引力的强度// [!code focus]
}

const generateGalaxy = () => {
  // ...
  for (let i = 0; i < parameters.count; i++) {
    // ...

    // 让每一个粒子的x，y，z都拥有自己的位置，// [!code focus]
    // 越靠近中心的散射能力越小，// [!code focus]
    // 越远离中心的散射能力越强，// [!code focus]
    // 这时候需要使用幂函数来实现这个效果，// [!code focus]
    // 也就是小于1时值越趋近于0，幂指数越小 // [!code focus]
    const randomX = Math.random() ** parameters.randomnessPower // [!code focus]
      * (Math.random() < 0.5 ? 1 : -1) // [!code focus]
      * parameters.randomness // [!code focus]
      * radius// [!code focus]

    const randomY = Math.random() ** parameters.randomnessPower // [!code focus]
      * (Math.random() < 0.5 ? 1 : -1) // [!code focus]
      * parameters.randomness // [!code focus]
      * radius// [!code focus]

    const randomZ = Math.random() ** parameters.randomnessPower // [!code focus]
      * (Math.random() < 0.5 ? 1 : -1) // [!code focus]
      * parameters.randomness // [!code focus]
      * radius// [!code focus]
    
    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX // [!code focus]
    positions[i3 + 1] = randomY // [!code focus]
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle)  * radius + randomZ // [!code focus]
  }
  // ...
}

// 调整粒子散射程度的debug // [!code focus]
gui.add(parameters, 'randomnessPower') // [!code focus]
  .min(1) // [!code focus]
  .max(10) // [!code focus]
  .step(0.001) // [!code focus]
  .onFinishChange(generateGalaxy) // [!code focus]
```

<p>
  <img src=".\images\image-20221110154001764.png" style="margin:0 auto;border-radius:8px">
</p>

左边的银河相比右边的银河更加的散射

## 上色

我们给银河添加一些色彩

```ts:line-numbers
const parameters = {
    // ... 
    insideColor: '#ff6030', // 银河向内的颜色
    outsideColor: '#1b3984', // 银河向外的颜色
}

const generateGalaxy = () => {
  // ...
  // 定义每个粒子的颜色
  const colors = new Float32Array(parameters.count * 3)

  // 定义银河向内的颜色
  const colorInside = new t.Color(parameters.insideColor)
  // 定义银河向外的颜色
  const colorOutside = new t.Color(parameters.outsideColor)

  for (let i = 0; i < parameters.count; i++) {
    // ...
    // 克隆内部颜色防止因一个粒子的颜色改变而影响到其它粒子
    const mixedColor = colorInside.clone()
    // 更根据半径来混和颜色，会出现过度的效果
    mixedColor.lerp(colorOutside, radius / parameters.radius)
    // 给每个粒子赋予颜色
    colors[i3] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b
}

  // 设置每个粒子的颜色
  geometry.setAttribute('color', new t.BufferAttribute(colors, 3))

  material = new t.PointsMaterial({
    // ...
    vertexColors: true, // 材质受颜色的影响
  })
  // ...
}

// 调整内圈颜色和外圈颜色的debug
gui.addColor(parameters, 'insideColor')
  .onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor')
  .onFinishChange(generateGalaxy)
```

<p>
  <img src=".\images\image-20221110161041632.png" style="margin:0 auto;border-radius:8px">
</p>

## 所有代码

```ts:line-numbers
import * as dat from 'dat.gui'

/**
 * gui
 */
const gui = new dat.GUI({ closed: true, width: 400 }) // 设置关闭与宽度

const scene = new t.Scene()

/**
 * Galaxy
 */
const parameters = {
  count: 10000,
  size: 0.01,
  radius: 5,
  branch: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984',
}

let geometry: t.BufferGeometry | null
let material: t.PointsMaterial | null
let points: t.Points<t.BufferGeometry, t.PointsMaterial> | null

const generateGalaxy = () => {
  // initial old galaxy
  if (points) {
    geometry!.dispose()
    material!.dispose()
    scene.remove(points)
  }
  /**
  * Geometry
  */
  geometry = new t.BufferGeometry()

  const positions = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)

  const colorInside = new t.Color(parameters.insideColor)
  const colorOutside = new t.Color(parameters.outsideColor)

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3

    const radius = Math.random() * parameters.radius
    const spinAngle = radius * parameters.spin
    const branchAngle = (i % parameters.branch) / parameters.branch * Math.PI * 2
    const randomX = Math.random() ** parameters.randomnessPower * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
    const randomY = Math.random() ** parameters.randomnessPower * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
    const randomZ = Math.random() ** parameters.randomnessPower * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX // x
    positions[i3 + 1] = randomY// y
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ// z

    const mixedColor = colorInside.clone()
    mixedColor.lerp(colorOutside, radius / parameters.radius)
    colors[i3] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b
  }

  geometry.setAttribute('position', new t.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new t.BufferAttribute(colors, 3))

  /**
  * Material
  */
  material = new t.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: t.AdditiveBlending,
    vertexColors: true,
  })

  /**
  * Points
  */
  points = new t.Points(geometry, material)
  scene.add(points)
}
generateGalaxy()

gui.add(parameters, 'count').min(100).max(100000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branch').min(1).max(10).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)
```
