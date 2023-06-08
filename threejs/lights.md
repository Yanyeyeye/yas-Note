# 光Light :flashlight:

## `AmbientLight`环境光源

环境光是从场景的四面八方射来的，是一定会照亮物体的每一个死角的

```js
const ambientLight = new t.AmbientLight(0xFFF, 0.5)
// 或
const ambientLight = new t.AmbientLight()
ambientLight.color = new t.Color(0xFFF)
ambientLight.intensity = 0.5
```

<p>
  <img src=".\images\image-20221106144950383.png" style="margin:0 auto;border-radius:8px">
</p>

<p>
  <img src=".\images\image-20221106145920416.png" style="margin:0 auto;border-radius:8px">
</p>

## `DirectionalLight`平行光

平行光是沿着特定方向发射的光。这种光的表现像是无限远,从它发出的光线都是平行的。常常用平行光来模拟太阳光 的效果; 太阳足够远，因此我们可以认为太阳的位置是无限远，所以我们认为从太阳发出的光线也都是平行的。

```js
const directLight = new t.DirectionalLight(0xFFFCCC, 0.5)
scene.add(directLight)
```

<p>
  <img src=".\images\image-20221106145315717.png" style="margin:0 auto;border-radius:8px">
</p>

<p>
  <img src=".\images\image-20221106145958233.png" style="margin:0 auto;border-radius:8px">
</p>

我们可以改变平行光光源的方向，但要注意的是平行光**永远照向场景的中央**

```js
directLight.position.set(1, 0.25, 0)
```

## `HemisphereLight`半球光

光源直接放置于场景之上，光照颜色从天空光线颜色渐变到地面光线颜色。可以用于草地与天空之间类似的场景

  ```js
  const hemisphereLight = new t.HemisphereLight(0xFF0000, 0x0000FF, 0.5)
  scene.add(hemisphereLight)
  ```

<p>
  <img src=".\images\image-20221106151415183.png" style="margin:0 auto;border-radius:8px">
</p>

<p>
  <img src=".\images\image-20221106151136842.png" style="margin:0 auto;border-radius:8px">
</p>

<p>
  <img src=".\images\image-20221106151215428.png" style="margin:0 auto;border-radius:8px">
</p>

<p>
  <img src=".\images\image-20221106151243853.png" style="margin:0 auto;border-radius:8px">
</p>

## `PointLight`点光源

从一个点向**各个方向发射**的光源。一个常见的例子是模拟一个灯泡发出的光。

```js
// 第一个参数是灯光的颜色
// 第二个参数是灯光的强度
// 第三个参数是照射的距离
// 第四个参数是衰减的程度，如果没有这个参数则任何距离的光照强度都一样
const pointLight = new t.PointLight(0xFF9000, 0.5, 10, 2)
scene.add(pointLight)
```
  
<p>
  <img src=".\images\image-20221106153728806.png" style="margin:0 auto;border-radius:8px">
</p>

## `RectAreaLight`平面光源

平面光光源从**一个矩形平面**上均匀地发射光线。这种光源可以用来模拟像明亮的窗户或者条状灯光光源。他就像一个补光器

::: tip

- 平面光源不支持阴影。
- 只支持 `MeshStandardMaterial`和` MeshPhysicalMaterial `两种材质。
:::

```js
// 第一个参数灯光的颜色
// 第二个参数灯光的强度
// 第三个参数灯光的宽度
// 第四个参数灯光的高度
const rectAreaLight = new t.RectAreaLight(0x4E00FF, 5, 1, 1)
scene.add(rectAreaLight)
```

```js
rectAreaLight.lookAt(new t.Vector3()) // 使用朝向来控制其看的方向
```

<p>
  <img src=".\images\image-20221106153837689.png" style="margin:0 auto;border-radius:8px">
</p>

<p>
  <img src=".\images\image-20221106153507579.png" style="margin:0 auto;border-radius:8px">
</p>

## `SpotLight`聚光灯

光线从一个点沿一个方向射出，随着光线照射的变远，光线圆锥体的尺寸也逐渐增大。就拿手电筒来举个例子

```js
// 第一个参数是光照颜色
// 第二个参数是光照强度
// 第三个参数是从光源发出光的最大距离，其强度根据光源的距离线性衰减。
// 第四个参数是光照出去时的圆的半径，最大为最大为Math.PI/2。
// 第五个参数是光照出去时的圆的边缘模糊程度
// 第六个参数是
const spotLight = new t.SpotLight(0xFF9000, 1, 10, Math.PI * 0.1, 0, 1)
spotLight.position.set(0, 3, 5)
scene.add(spotLight)
```

<p>
  <img src=".\images\image-20221106154039926.png" style="margin:0 auto;border-radius:8px">
</p>

<p>
  <img src=".\images\image-20221106160109670.png" style="margin:0 auto;border-radius:8px">
</p>

可以更改聚光灯所照的方向，但是与其他灯的方向设置有一些不同

```js
spotLight.target.position.x = -0.75
scene.add(spotLight.target)
```

<p>
  <img src=".\images\image-20221106160325547.png" style="margin:0 auto;border-radius:8px">
</p>

## 性能问题

- 最小性能损耗灯光为：
  1. `AmbientLight`：环境光源
  2. `HemisphereLight`：半球光源
- 中度性能损耗灯光为：
  1. `DirectionLight`：平行光源
  2. `PointLight`：点光源
- 高性能损耗灯光为：
  1. `SpotLight`：聚光灯源
  2. `RectAreaLight`：矩形区域光源

## 灯光的辅助手

以下是灯光的可视化

```js
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'
const directLightHelper = new t.DirectionalLightHelper(directLight, 0.2)
const hemisphereLightHelper = new t.HemisphereLightHelper(hemisphereLight, 0.2)
const pointLightHelper = new t.PointLightHelper(pointLight, 0.2)
const spotLightHelper = new t.SpotLightHelper(spotLight, 0.2)
nextTick(() => {
    // 当聚光灯照的方向发生变化时，需要在下次渲染时跟新DOM
    spotLightHelper.update()
})
// 或
window.requestAnimationFrame(() => {
    spotLightHelper.update()
})
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight, 0.2)
scene.add(
  directLightHelper, 
  hemisphereLightHelper, 
  pointLightHelper, 
  spotLightHelper, 
  rectAreaLightHelper
)
```

<p>
  <img src=".\images\image-20221106164540721.png" style="margin:0 auto;border-radius:8px">
</p>

## 光源使用组合

### 环境光和平行光

```js
/**
 * ambientLight and directLight
 */
const ambientLight = new t.AmbientLight(0xFFFFFF, 0.5)// 环境光源
const directLight = new t.DirectionalLight(0xFFFCCC, 0.5)
directLight.position.x = 2
directLight.position.y = 3
directLight.position.z = 2
const directLightHelper = new t.DirectionalLightHelper(directLight, 0.5)
scene.add(ambientLight, directLight, directLightHelper)
```
