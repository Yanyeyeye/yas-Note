# 光线投射 :bow_and_arrow:

- 光线投射用于进行鼠标拾取（在三维空间中计算出鼠标移过了什么物体）。
- 检测玩家前方是否有墙
- 检测射击游戏是否击中了什么物体

## Raycaster

先创建三个物体，并将他们加入场景中

```ts:line-numbers
const object1 = new t.Mesh(
  new t.SphereGeometry(0.5, 16, 16),
  new t.MeshBasicMaterial({ color: 0xFF0000 }),
)

object1.position.x = 2
const object2 = new t.Mesh(
  new t.SphereGeometry(0.5, 16, 16),
  new t.MeshBasicMaterial({ color: 0xFF0000 }),
)
const object3 = new t.Mesh(
  new t.SphereGeometry(0.5, 16, 16),
  new t.MeshBasicMaterial({ color: 0xFF0000 }),
)
object3.position.x = -2

scene.add(object1, object2, object3)
```

声明一个光线投射的类

```ts
const raycaster = new t.Raycaster()
```

- `Raycaster( origin: Vector3, direction: Vector3, near: Float, far: Float )`
  - `origin`：光线投射的原点向量。
  - `direction`：向射线提供方向的方向向量，应当被标准化（`.normalize()`）。
  - `near`、`far`：要在这两个距离之间

声明光线的光源与照亮的方向

```ts
const rayOrigin = new t.Vector3(-3, 0, 0)  // 光源
const rayDirection = new t.Vector3(10, 0, 0)  // 光线射向的方向
rayDirection.normalize()  // 将向量单位化

raycaster.set(rayOrigin, rayDirection)  // 设置光线投射
```

- `.set ( origin: Vector3, direction: Vector3 ) : undefined`
  - `origin`：光的源点向量
  - `direction`：为光线提供方向的标准化方向向量

### arrowHelper

我们可以利用`arrowHelper`来可视化这个光线

```ts
const arrowHelper = new t.ArrowHelper(
rayCaster.ray.direction,
    raycaster.ray.origin,
    10,  // 辅助光线的长度
    0xff0000,  // 辅助光线的颜色
    1,  // 辅助光线箭头的长度
    0.5  // 辅助光线箭头的宽度
)
scene.add(arrowHelper)
```

### .intersectObject 与 .intersectObjects

我们可以使用`.intersectObject()`与`.intersectObjects()`来检测所有在射线与物体之间，包括或不包括后代的相交部分。返回结果时，相交部分将按距离进行排序，最近的位于第一个。我们来看一下他输出的是什么

```ts
const interSector = rayCaster.intersectObject(object1)
console.log(interSector)
```

<p>
  <img src=".\images\image-20221113150617334.png" style="margin:0 auto;border-radius:8px">
</p>

- `distance`：射线投射原点和相交部分之间的距离。
- `face`：相交的面
- `object`：相交的物体
- `point`：相交部分的点（世界坐标）
- `uv`：相交部分的点的UV坐标。（图片的顶点坐标）

```ts
const interSectors = rayCaster.intersectObjects([object1, object2, object3])
console.log(interSectors)
```

<p>
  <img src=".\images\image-20221113151354292.png" style="margin:0 auto;border-radius:8px">
</p>

## 动态检测

**步骤1**：让物体运动起来

```ts:line-numbers
const clock = new t.Clock() // 从初始化时就开始运行
const animate = () => {
  // ...
  const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
  // TODO
  object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
  object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
  object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5
  // ...
}
animate() // 调用动画函数
```

**步骤2**：在每一帧里添加光线

```ts:line-numbers
const animate = () => {
  // ...
  const rayOrigin = new t.Vector3(-3, 0, 0)  // 设置光源
  const rayDirection = new t.Vector3(1, 0, 0)  // 设置方向
  rayDirection.normalize()  // 标准化

  rayCaster.set(rayOrigin, rayDirection)  // 生成射线

  const objects = [object1, object2, object3]  // 与射线相交的物体
  const intersects: t.Intersection<t.Mesh<t.SphereGeometry, t.MeshBasicMaterial>>[] = rayCaster.intersectObjects(objects)  // 交点信息
  // ...
}
animate() // 调用动画函数
```

**步骤3**：给每一个遇到光线的物体设置颜色

```ts
const animate = () => {
  // ...
  for (const intersect of intersects)
      intersect.object.material.color.set('#00ff00')
  // ...
}
animate() // 调用动画函数
```

<p>
  <img src=".\images\image-20221113154535128.png" style="margin:0 auto;border-radius:8px">
</p>

但这好像出了些问题，这些球一直会是绿色的我们得要让他再每一帧离开光线后恢复成原来的颜色

```ts
const animate = () => {
  // ...
  for (const objectsToTest of objectsToTests)
    objectsToTest.material.color.set('#ff0000')

  for (const intersect of intersects)
    intersect.object.material.color.set('#00ff00')
  // ...
}
animate() // 调用动画函数
```

<p>
  <img src=".\images\image-20221113154924344.png" style="margin:0 auto;border-radius:8px">
</p>

### 所有代码

```ts:line-numbers
// ...
const rayCaster = new t.Raycaster()
const rayOrigin = new t.Vector3(-3, 0, 0)
const rayDirection = new t.Vector3(10, 0, 0)
rayDirection.normalize()

rayCaster.set(rayOrigin, rayDirection)
const arrowHelper = new t.ArrowHelper(
  rayCaster.ray.direction,
  rayCaster.ray.origin,
  10, // 辅助光线的长度
  0xFF0000, // 辅助光线的颜色
  1, // 辅助光线箭头的长度
  0.5, // 辅助光线箭头的宽度
)
scene.add(arrowHelper)

// ...
const clock = new t.Clock() // 从初始化时就开始运行
const animate = () => {
  stats.begin() // 帧率显示器
  controls.update() // 鼠标控制
  const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
  // TODO
  object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
  object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
  object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

  const objects = [object1, object2, object3]
  const intersects: t.Intersection<t.Mesh<t.SphereGeometry, t.MeshBasicMaterial>>[] = rayCaster.intersectObjects(objects)

  for (const objectsToTest of objectsToTests)
    objectsToTest.material.color.set('#ff0000')

  for (const intersect of intersects)
    intersect.object.material.color.set('#00ff00')
  renderer.render(scene, camera) // 重新渲染渲染器也就是让渲染器拍照记录物体新的位置
  stats.end()// 帧率显示器
  requestAnimationFrame(animate)// 调用动画渲染60帧/s的显示屏
}
animate() // 调用动画函数
```

<p>
  <img src=".\images\image-20221113162425163.png" style="margin:0 auto;border-radius:8px">
</p>

::: warning 警告
动态监测相当的消耗电脑性能，因为他在每一帧动画中都在计算光线与物体的碰撞，我们可以使用`BVH`技术来优化这个问题，详见 [BVH](#bvh) 内容
:::

## 事件检测

我们可以使用`raycaster`来检测一个物体是否在鼠标后面。其原理就是发射一束以摄像机为源点的，以鼠标为终点方向的射线。

### 监听事件

监听`mouse`鼠标事件

```ts
const mouse = new t.Vector2()
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX / SIZE.width * 2 - 1
  mouse.y = -(e.clientY / SIZE.height) * 2 + 1
})
```

但由于鼠标移动的速度有时候比每一帧要快就会出现问题，所以我们把鼠标的移动放入帧中，在帧中我们使用`.setFromCamera()`

```ts
rayCaster.setFromCamera(mouse, camera)
```

- `.setFromCamera( coords: Vector2, camera: Camera ) : undefined`
  - `coords`：在标准化设备坐标中鼠标的二维坐标 —— X分量与Y分量应当在-1到1之间。
  - `camera`：射线所来源的摄像机。

```ts:line-numbers
const rayCaster = new t.Raycaster()
// const rayOrigin = new t.Vector3(-3, 0, 0)
// const rayDirection = new t.Vector3(10, 0, 0)
// rayDirection.normalize()

const animate = () => {
  rayCaster.setFromCamera(mouse, camera)

  const objects = [object1, object2, object3]
  const intersects: t.Intersection< t.Mesh< t.SphereGeometry, t.MeshBasicMaterial>>[] = rayCaster.intersectObjects(objects)

  for (const object of objects)
    object.material.color.set('#ff0000')

  for (const intersect of intersects)
    intersect.object.material.color.set('#00ff00')
}
animate() // 调用动画函数
```

我们也可以控制鼠标移入或移出时的效果

```ts:line-numbers
let currentIntersect: t.Intersection< t.Mesh< t.SphereGeometry, t.MeshBasicMaterial >> | null = null

// ...
const animate = () => {
rayCaster.setFromCamera(mouse, camera)

const objects = [object1, object2, object3]
const intersects: t.Intersection< t.Mesh< t.SphereGeometry, t.MeshBasicMaterial>>[] = rayCaster.intersectObjects(objects)
// 先判断是否有相交
if (intersects.length) {
  if (!currentIntersect)
      console.log('鼠标移入');
  // 鼠标移入后标记
  [currentIntersect] = intersects
}
else {
  // 一开始没有相交就赋空值
  if (currentIntersect)
      console.log('鼠标移出')
  // 鼠标移出后清空
  currentIntersect = null
}

for (const object of objects)
  object.material.color.set('#ff0000')

for (const intersect of intersects)
  intersect.object.material.color.set('#00ff00')
}
animate() // 调用动画函数
```

我们也可以在这个基础上添加鼠标点击的效果并获取到哪一个物体被点击了

```ts:line-numbers
window.addEventListener('click', (e) => {
  if (currentIntersect) {
    switch (currentIntersect.object) {
      case object1:
        console.log('object1')
        break
      case object2:
        console.log('object2')
        break
      case object3:
        console.log('object3')
        break
      default:
        break
    }
  }
})
```

## 涂鸦立方体

**步骤1**：创建一个`3X3`的立方体

```ts:line-numbers
// amount x amount
const amount = 2
// 半径
const radius = 0.5
// 直径
const diameter = 2 * radius
// 渲染物体的总数
const count = amount ** 3
const sphereGeometry = new t.SphereGeometry(radius, 32, 32)
const sphereMaterial = new t.MeshStandardMaterial({ color: 0xFFFFFF })

// InstancedMesh 渲染大量具有相同几何体与材质
// 但具有不同世界变换的物体，提升整体渲染性能
const sphereMesh = new t.InstancedMesh(sphereGeometry, sphereMaterial, count)

// 获取一个4x4的单位矩阵用来存放物体坐标
const matrix = new t.Matrix4()

// 声明颜色用于初始化
const color = new t.Color()

// 记录物体的索引，这个值的最大为count的值也就是最终产生的物体的个数
let i = 0

/**
* 偏移量
* 默认中心在第一个球体的正中间
* amount为1时：不用偏离
* amount为2时：需要偏离半个球，也就是一个球的半径
* amount为3时：需要偏离到另外一个球的球心，也就是需要偏离两个球的半径
* ...
*/
const offset = (amount - 1) / 2
for (let x = 0; x < amount; x++) {
  for (let y = 0; y < amount; y++) {
    for (let z = 0; z < amount; z++) {
      // 设置本地变换矩阵的x、y、z坐标，并且需要对称
      matrix.setPosition((offset - x) * diameter, (offset - y) * diameter, (offset - z) * diameter)
      // 设置第i个物体的坐标
      sphereMesh.setMatrixAt(i, matrix)
      // 初始化第i个物体的颜色
      sphereMesh.setColorAt(i, color)
      i++
    }
  }
}
scene.add(sphereMesh)
```

**步骤2**：声明光线投影

```ts
const rayCaster = new t.Raycaster()
```

**步骤3**：获取鼠标位置

```ts
const mouse: {
  x: number | null
  y: number | null
} = { x: 1, y: 1 } // 初始化鼠标位置，防止刷新时射线的默认方向影响颜色渲染
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX / SIZE.width * 2 - 1
  mouse.y = -((e.clientY - 55) / SIZE.height) * 2 + 1
})
```

**步骤4**：在帧动画里检测与鼠标相交的球，并改变其颜色

```ts
const animate = () => {
  // ...
  if (mouse.x && mouse.y)
    rayCaster.setFromCamera({ x: mouse.x, y: mouse.y }, camera)
  // 定义交点使用.intersectObject
  const interSection: t.Intersection<t.InstancedMesh<t.SphereGeometry, t.MeshStandardMaterial>>[] = rayCaster.intersectObject(sphereMesh)
  if (interSection.length > 0) {
    // 返回结果时，相交部分将按距离进行排序，最近的位于第一个。
    const instanceId = interSection[0].instanceId!
    // 获得相交物体的颜色
    sphereMesh.getColorAt(instanceId, color)
    if (color.equals(white)) {
        // 设置颜色并控制在一定的范围之内
        sphereMesh.setColorAt(instanceId, color.setHex(Math.random() * 0xFFFFFF))
        // 在设置颜色之后需要.needsUpdate更新颜色
        sphereMesh.instanceColor!.needsUpdate = true
      }
  }
  // ...
}
animate() // 调用动画函数
```

### 问题分析

- 图一：

<p>
  <img src=".\images\image-20221115112552346.png" style="margin:0 auto;border-radius:8px">
</p>

- 图二：

<p>
  <img src=".\images\image-20221115112639971.png" style="margin:0 auto;border-radius:8px">
</p>

该问题是由于没有初始化鼠标的位置，导致使用了`raycaster`光线投影的默认值。图一中为光线投影的默认投影方向也就是`(0, 0, -1)`且从`(0, 0, 0)`发出，与物体相交于`(0, 0, -0.5)`,也就是图二中的`point`的值，0.5是因为球的半径为0.5

## BVH

::: tip
当我们的模型太大导致在使用光线投影相关技术时会出现卡顿的现象造成帧数的大幅度下降，这是因为我们在实时监测光线的数据，而且当光线穿过整个多边形的面时会造成对整个多边形的扫描计算，这导致了计算机在每一帧上需要处理许多数据，所以自然对整个电脑的性能就产生的极大的要求，但是为了能够满足大多数用户的使用体验，最后采用`BVH(Bounding Volume Hierarchy)`也就是包围层次技术，该技术将整个模型利用递归建树的方式进行拆分并用小的方体框包裹，官方提供了一个案例 [RayCastBVH](https://threejs.org/examples/?q=raycast#webgl_raycaster_bvh)， 这使得在大量使用光线投影的技术时也保持了60帧的频率。
:::

**步骤1**：安装npm包

```bash
npm i three-mesh-bvh
```

**步骤2**：导入包并在原型链上挂载相应的函数

```ts
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast, MeshBVHVisualizer } from 'three-mesh-bvh'
t.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
t.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
t.Mesh.prototype.raycast = acceleratedRaycast
```

**步骤3**：在加载模型时使用，当模型较大时需要遍历其中的每一个网格并设置其位置与大小

```ts
gltfLoader.load('yourModelPath',
  (gltf) => {
  const children = [...gltf.scene.children[0].children]
  for (const child of children) {
    const geometry = child.geometry
    // 根据自己的模型来调整位置
    child.position.set(-135.143402, 0, -98.3101959)
    geometry.computeBoundsTree()
    scene.add(child)
    // 根据自己的模型来调整大小
    child.scale.setScalar(0.004)
    // 可视化bvh树
    helper = new MeshBVHVisualizer(child)
    helper.color.set(0xE91E63)
    scene.add(helper)
  }
})
```

**步骤4**：使用光线投影并设置为`firstHitOnly`为`true`,这可以大幅度减小计算无用的数据

```ts
const rayCaster = new t.Raycaster()
rayCaster.firstHitOnly = true
```

::: tip
访问 [BVH](https://github.com/gkjohnson/three-mesh-bvh) 来获取更多有关**BVH**的内容
:::
