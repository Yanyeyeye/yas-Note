---
outline: deep
---
# 粒子效果Particle :stars:

::: info
我们可以使用粒子效果来创造星星、烟雾、雨、灰尘、火等等。尽管会有上千的粒子在屏幕中但性能的损耗还是会相对的比较小。
:::

## PointsMaterial

尝试使用`PointsMaterial`和`Points`创建一个球

```ts:line-numbers {2-6}
const particleGeometry = new t.SphereGeometry(1, 32, 32)
const particleMaterial = new t.PointsMaterial({
  size: 0.02,
  sizeAttenuation: true, // 粒子衰减离摄像头近的就大远的就小
})
const particles = new t.Points(particleGeometry, particleMaterial)
scene.add(particles)
```

我们也利用`t.BufferGeometry()`创建里的几何图形

```ts:line-numbers
const particleGeometry = new t.BufferGeometry()
const count = 5000 // 5000个粒子

// 数组中的每一位是4个字节，每个字节8位，一共32位
const position = new Float32Array(count * 3)

// 每个数有x,y,z三个顶点，共有count * 3个顶点
for (let i = 0; i < count * 3; i++)
  position[i] = (Math.random() - 0.5) * 10

// 给 particleGeometry 的 position属性添加在内存中以 x,y,z 3个为单位的顶点
// 第一个参数的选择可以参考Object3D类中所存在的属性
particleGeometry.setAttribute('position', new t.BufferAttribute(position, 3))

const particleMaterial = new t.PointsMaterial({
  size: 0.02,
  sizeAttenuation: true, // 粒子衰减离摄像头近的就大远的就小
})
const particles = new t.Points(particleGeometry, particleMaterial)
scene.add(particles)
```

- 可以使用`new t.Color()`更改粒子的颜色

  ```ts
  particleMaterial.color = new t.Color('#ff88cc')
  ```

- 也可以使用纹理来改变粒子

  ```ts
  const textLoader = new t.TextureLoader()
  const particleTexture = textLoader.load(
    new URL('../assets/textures/particles/2.png', import.meta.url).href,
  )
  // ...
  particleMaterial.map = particleTexture
  // ...
  ```

<p>
  <img src=".\images\image-20221109110610003.png" style="margin:0 auto;border-radius:8px">
</p>

::: tip
`.map`的方法好像不太奏效,他好像是只是贴了一张图在上面会把后面的粒子遮住,我们得换成`.alphaMap`
:::

```ts
particleMaterial.transparent = true // 别忘了加上透明度
particleMaterial.alphaMap = particleTexture
```

<p>
  <img src=".\images\image-20221109110844572.png" style="width:50%;border-top-left-radius:8px;border-bottom-left-radius:8px;float:left">
  <img src=".\images\image-20221109110915572.png" style="width:50%;border-top-right-radius:8px;border-bottom-right-radius:8px"/>
</p>

有些粒子似乎能够很好的透光效果看到后面的其它粒子,而有且却直接将后面的其它粒子遮了起来,这是由于CPU在渲染的时候将粒子一次性渲染出来有些后面有东西就渲染成透明,有些后面没东西就没渲染成透明,所以在移动的视角的时候会发现有些粒子不透明

### alphaTest

我们可以使用`.alphaTest`来解决上述的材质遮挡的问题,`alphaTest`是根据纹理的`alpha`值来确认它是否该被渲染

```ts
particleMaterial.alphaTest = 0.001
```

<p>
  <img src=".\images\image-20221109112015152.png" style="border-radius:8px;margin:0 auto">
</p>

但似乎你也发现了这个方法有效但并不完美,因为你发现有些粒子的边缘会出现黑色的光晕

### depthTest

我们也可以使用`.depthTest`来让`GPU`无论在什么时候,不管哪个粒子在前,哪个粒子在后都给他渲染出来

**所谓深度测试**：深度缓冲区和颜色缓冲区是一一对应的，颜色缓冲区存储像素的颜色信息。而深度缓冲区储存像素的深度信息，在决定是否绘制一个物体表面时，首先要将表面对应的像素的深度值与当前的深度缓冲区的值进行比较。如果大于深度缓冲区的值，说明是离得比较远的，则丢弃这部分，否则利用这个像素对应的深度只和颜色值，分别更新深度缓冲区和颜色缓冲区。这个过程叫深度测试

```ts

particleMaterial.depthTest = false
```

<p>
  <img src=".\images\image-20221109112842516.png" style="border-radius:8px;margin:0 auto">
</p>

这个效果很棒但是他有个`bug`,当空间中有其它物体时它并不会管这些物体是否遮着背后的粒子

<p>
  <img src=".\images\image-20221109113152703.png" style="border-radius:8px;margin:0 auto">
</p>

### depthWrite

我们可以使用`.depthWrite`来控制是否根据距离不同来显示不同的物体。`webGL`有一个深度缓存区里面保存了物体与物体之间的前后关系用来区分颜色所在的层次，防止把被遮挡住的颜色显示出来，他每次在渲染的时候都会检查深度并把离摄像机更近的物体写进去远距离的丢弃。

```ts
particleMaterial.depthWrite = false
```

<p>
  <img src=".\images\image-20221109123523851.png" style="border-radius:8px;margin:0 auto">
</p>

### blending

我们可以结合使用`blending`来使重叠部分的图形闪亮,重叠的部分会变成白色,但如果粒子很多会掉帧率

 ```ts
 particleMaterial.depthWrite = false
particleMaterial.blending = t.AdditiveBlending
 ```

<p>
  <img src=".\images\image-20221109134031182.png" style="border-radius:8px;margin:0 auto">
</p>

## 更进一步

我们还可以给每个粒子不同的颜色

```ts:line-numbers
// 每个颜色由R、G、B三个值来组成，共有count * 3个顶点
const colors = new Float32Array(count * 3) 
for (let i = 0; i < count * 3; i++) {
  // ...
  colors[i] = Math.random()
}

// 基础颜色会影响到生成颜色的效果
particleGeometry.setAttribute('color', new t.BufferAttribute(colors, 3)) 
// particleMaterial.color = new t.Color('#ff88cc')
particleMaterial.transparent = true
particleMaterial.alphaMap = particleTexture
particleMaterial.depthWrite = false
particleMaterial.blending = t.AdditiveBlending
particleMaterial.vertexColors = true // 激活顶点的颜色
```

<p>
  <img src=".\images\image-20221109135348782.png" style="border-radius:8px;margin:0 auto">
</p>

我们也可以改变粒子的状态,我们可以旋转它或者缩放在或是改变它的位置,因为粒子继承于`Object3D`类

```ts:line-numbers {7}
const clock = new t.Clock() // 从初始化时就开始运行
const animate = () => {
  stats.begin() // 帧率显示器
  controls.update() // 鼠标控制
  const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
  // TODO物体的动画效果应在renderer.render之上
  particles.rotation.y = elapsedTime * 0.1
  // 重新渲染渲染器也就是让渲染器拍照记录物体新的位置
  renderer.render(scene, camera)
  stats.end()// 帧率显示器
  requestAnimationFrame(animate)// 调用动画渲染60帧/s的显示屏
}
animate() // 调用动画函数
```

我们也可以控制其中的每一个粒子

```ts:line-numbers
const clock = new t.Clock() // 从初始化时就开始运行
const animate = () => {
  stats.begin() // 帧率显示器
  controls.update() // 鼠标控制
  const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
  for (let i = 0; i < count; i++) { // [!code focus]
    const i3 = i * 3 // [!code focus]
    // 获取Attributes中的每一个粒子x的位置 // [!code focus]
    const x = particleGeometry.attributes.position.array[i3]  // [!code focus]
    // 让里面所有粒子的y轴根据x的不同而改变 // [!code focus]
    particleGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)  // [!code focus]
  } // [!code focus]
  // 一定要在位子改变后更新 // [!code focus]
  particleGeometry.attributes.position.needsUpdate = true // [!code focus]
  particles.rotation.y = elapsedTime * 0.1
  // 重新渲染渲染器也就是让渲染器拍照记录物体新的位置
  renderer.render(scene, camera)
  stats.end()// 帧率显示器
  requestAnimationFrame(animate)// 调用动画渲染60帧/s的显示屏
}
animate() // 调用动画函数
```

<p>
  <img src=".\images\image-20221109141421212.png" style="border-radius:8px;margin:0 auto">
</p>

::: warning
我们要注意当粒子量上万时,这样子很影响性能,因为我们在对每一个粒子的位置进行计算,所以当要改变上万个粒子的状态时我们需要使用自己创建的`Material`
:::
