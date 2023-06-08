# 阴影Shadow :desert:

## 平行光的阴影

每一种灯光都有一个摄像头，都会产生一个`shadow map`来绘制阴影

### 使用

**步骤1**：在`renderer`中激活阴影效果

```js
renderer.shadowMap.enabled = true
```

**步骤2**：使物体能产生阴影

```js
sphere.castShadow = true
```

**步骤3**：使物体能激活阴影

```js
plan.receiveShadow = true
```

**步骤4**：让光产生阴影

```js
directLight.castShadow = true
//或
pointLight.castShadow = true
// 或
spotLight.castShadow = true
```

::: tip
成产生阴影的灯光为：

- `PointLight`
- `DirectionLight`
- `SpotLight`
:::

### .mapSize

我们可以用`.mapSize`来定义阴影贴图的宽度和高度，较高的值会以计算时间为代价提供更好的阴影质量值必须是2的幂，直到给定设备的`WebGLRenderer.capabilities.maxTextureSize`， 虽然宽度和高度不必相同（例如，（512,1024）有效）。 默认值为*（512,512）*。

```js
directLight.shadow.mapSize.width = 1024
directLight.shadow.mapSize.height = 1024
```

### CameraHelper

我们也可以使用`CameraHelper`来可视化灯光的阴影照相机方便我们的调试

```js
const directLightHelper = new t.CameraHelper(directLight.shadow.camera)
scene.add(directLightHelper)
```

### 相机距离

我们也可以通过修改灯光阴影相机的距离来调试阴影产生的大小

```js
directLight.shadow.camera.near = 1 // 与物体近的距离
directLight.shadow.camera.far = 6 // 与物体远的距离
const directLightHelper = new t.CameraHelper(directLight.shadow.camera)
scene.add(directLightHelper)
```

<p>
  <img src=".\images\image-20221107110611902.png" style="border-top-left-radius: 0.5rem;border-bottom-left-radius: 0.5rem;width:50%;float:left">
  <img src=".\images\image-20221107110823644.png" style="border-top-right-radius: 0.5rem;border-bottom-right-radius: 0.5rem;width:50%">
</p>

### 侧面大小

我们也可以更改灯光照相机的侧面大小来提高阴影渲染效果

```js:line-numbers
directLight.shadow.camera.left = -1 // 需要正负来对称
directLight.shadow.camera.right = 1
directLight.shadow.camera.top = 0
directLight.shadow.camera.bottom = -1
// left、right、top、bottom需要写在near、far的上面
directLight.shadow.camera.near = 2
directLight.shadow.camera.far = 8
const directLightHelper = new t.CameraHelper(directLight.shadow.camera)
scene.add(directLightHelper)
```

<p>
  <img src=".\images\image-20221107111543648.png" style="margin:0 auto;border-radius:8px;width:100%">
</p>

当我们调试好后可以使用`.visible = false`来隐藏相机辅助

```js
const directLightHelper = new t.CameraHelper(directLight.shadow.camera)
directLightHelper.visible = false
```

我们也可以使用`.radius`来进行简单的低性能损耗的模糊阴影

```js
directLight.shadow.radius = 10
```

<p>
  <img src=".\images\image-20221107112009759.png" style="margin:0 auto;border-radius:8px;width:100%">
</p>

## 聚光灯的阴影

### 使用

**步骤1**：实例化聚光灯

```js:line-numbers
const spotLight = new t.SpotLight(0xFFFFFF, 0.3, 10, Math.PI * 0.1)
spotLight.position.set(0, 3.5, 4) // 根据实际调整位置
spotLight.castShadow = true
spotLight.shadow.mapSize.width = 1024 // 调整阴影的质量
spotLight.shadow.mapSize.height = 1024 // 调整阴影的质量
spotLight.shadow.camera.near = 1 // 调整摄像机的近视端
spotLight.shadow.camera.far = 6  // 调增摄像机的远视端
const spotLightHelper = new t.CameraHelper(spotLight.shadow.camera)
spotLightHelper.visible = false
scene.add(spotLight, spotLightHelper)
```

**步骤2**：我们可以通过修改`.fov`来调整聚光灯的视野，因为聚光灯的相机为透视相机

```js
spotLight.shadow.camera.fov = 30
const spotLightHelper = new t.CameraHelper(spotLight.shadow.camera)
scene.add(spotLight, spotLightHelper)
```

## 点光源的阴影

### 使用

**步骤1**：实例化点光源

```js:line-numbers
const pointLight = new t.PointLight(0xFFFFFF, 0.3)
pointLight.position.set(0, 2, 1)
pointLight.castShadow = true // 激活产生
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024
pointLight.shadow.camera.near = 1
pointLight.shadow.camera.far = 4
const pointLightHelper = new t.CameraHelper(pointLight.shadow.camera)
pointLightHelper.visible = false
scene.add(pointLight, pointLightHelper)
```

## baking阴影

**baking阴影**即事先将物体的阴影状态画在图上，然后再将图应用到物体上，这可以减小性能的消耗

### 使用

**步骤1**：将所有阴影的作用取消以及取消所有灯的阴影效果尤其使聚光灯的不然会报错

```js
renderer.shadowMap.enabled = false
spotLight.castShadow = false
```

**步骤2**：加载纹理

```js
const textLoader = new t.TextureLoader()
const bakedShadow = textLoader.load(
  new URL('../assets/textures/baking/bakedShadow.jpg', import.meta.url).href,
)
```

**步骤3**：在`plan`上使用纹理，该纹理取决于你的项目是否是一个静态的场景不需要动态的改变以及计算阴影

```js
const plan = new t.Mesh(
  new t.PlaneGeometry(5, 5),
  new t.MeshBasicMaterial({ map: bakedShadow }),
)
```

我们也可以换成其它的阴影并创建一个新的平面来接受阴影，该阴影可以根据调整`alpha`的值来实现阴影的调整

**步骤1**：加载纹理

```js
const textLoader = new t.TextureLoader()
const simpleShadow = textLoader.load(
  new URL('../assets/textures/baking/simpleShadow.jpg', import.meta.url).href,
)
```

<p>
  <img src=".\textures\baking\simpleShadow.jpg" style="margin:0 auto;border-radius:8px;width:200px">
</p>

**步骤2**：创建新的平面并置于原先的平面之上

```js:line-numbers
const shadowPlan = new t.Mesh(
  new t.PlaneGeometry(1, 1),
  new t.MeshBasicMaterial({
    color: 0x000000,
    transparent: true, // 使用alphaMap时必须设置transparent为透明
    alphaMap: simpleShadow,
  }),
)
shadowPlan.rotation.x = -Math.PI * 0.5
// 多出的0.01是为了防止z fight是因为GPU不知道渲染哪个页面
shadowPlan.position.y = plan.position.y + 0.01 
scene.add(shadowPlan)
```

### 测试阴影

使球动起来

```js:line-numbers
const clock = new t.Clock() // 从初始化时就开始运行
const animate = () => {
  stats.begin() // 帧率显示器
  controls.update() // 鼠标控制
  const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
  sphere.position.x = Math.cos(elapsedTime) * 1.5
  sphere.position.z = Math.sin(elapsedTime) * 1.5
  sphere.position.y = Math.abs(Math.sin(elapsedTime) * 1)
  // TODO 把球的位置赋给阴影
  // 重新渲染渲染器也就是让渲染器拍照记录物体新的位置
  renderer.render(scene, camera) 
  stats.end()// 帧率显示器
  requestAnimationFrame(animate)// 调用动画渲染60帧/s的显示屏
}
animate() // 调用动画函数
```

将球的位置赋给阴影

```js
// 插入到上方TODO代码的位置
shadowPlan.position.x = sphere.position.x
shadowPlan.position.z = sphere.position.z
// 需要将他的不透明度设置为随着球体高度变化的动态值
shadowPlan.material.opacity = (1 - sphere.position.y) * 0.6
```

## 阴影贴图算法

**shadow map algorithm**:

- `t.BasicShadowMap`：有更多的性能但失去贴图的品质
- `t.PCFShadowMap`：会损失性能但贴图品质一般，贴图的边缘会很光滑（默认）
- `t.PCFSoftShadowMap`：会损失性能但贴图的品质不会很差，贴图的边缘会柔软（常用）注意：`radius`在这个贴图中不生效
- `t.VSMShadowMap`：会损失性能、会有一定的限制，会产生意想不到的效果

```js
renderer.shadowMap.type = t.PCFSoftShadowMap
```
