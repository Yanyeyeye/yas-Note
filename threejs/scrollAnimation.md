# 滚动动画 :scroll:

滚动动画用于将`WebGL`与`Html`结合，让页面中既有内容又有模型

## 准备

**步骤1**：首先我们做一个初始化

1. 在项目中去掉鼠标控制页面的操作，并只放置一个正方体
2. 将照相机的位置设置从Z轴正方向看向物体
3. 配合使用`HTML`

```ts:line-numbers
/**
 * Object
*/
const cube = new t.Mesh(
  new t.BoxGeometry(1, 1, 1),
  new t.MeshBasicMaterial({ color: '#ff0000' }),
)

const renderer = new t.WebGLRenderer({
  alpha: true, // 如果出现下拉时出现底部有白色泛起就可以调整这个参数
})
scene.add(cube)
```

```html:line-numbers
<template>
  <div id="three" class="webgl" />
  <section class="section">
    <h1>Hello</h1>
  </section>
  <section class="section">
    <h2>My projects</h2>
  </section>
  <section class="section">
    <h2>Contact me</h2>
  </section>
</template>
```

```scss:line-numbers
// 记得自定义样式
.section {
  display: flex;
  align-items: center;
  height: 100vh;
  position: relative;
  font-family: 'Cabin', sans-serif;
  color: #ffeded;
  text-transform: uppercase;
  font-size: 7vmin;
  padding-left: 10%;
  padding-right: 10%;
}

section:nth-child(odd) {
  justify-content: flex-end;
}

.webgl {
  position: fixed;
  outline: none;
}

```

**步骤2**：将正方形替换为3个立体几何并使用卡通材质

```ts:line-numbers
const parameters = {
  materialColor: '#ffeded',
}

const textureLoader = new t.TextureLoader()
const gradientTexture = textureLoader.load(
  new URL('../assets/textures/gradients/3.jpg', import.meta.url).href
)
// 用的是3个像素的材质需要明显的区分三个像素之间的差异而不是融合
gradientTexture.magFilter = t.NearestFilter

const material = new t.MeshToonMaterial({ color: parameters.materialColor })
const torus = new t.Mesh(
  new t.TorusGeometry(1, 0.4, 16, 60),
  material
)

const cone = new t.Mesh(
  new t.ConeGeometry(1, 2, 32),
  material
)

const cube = new t.Mesh(
  new t.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material
)
scene.add(torus, cone, cube)
```

- 因为卡通材质是光感材质所以要添加灯光

```ts:line-numbers
const directLight = new t.DirectionalLight(0xFFFCCC, 0.5)
directLight.position.x = 2
directLight.position.y = 3
directLight.position.z = 2
scene.add(directLight)
```

## 设置位置

因为照相机是从Z轴正半轴看向物体且视野的范围是从上到下的而不是从左到右

```ts:line-numbers
const objectDistance = 4
torus.position.y = -objectDistance * 0 // 第一个的距离
cone.position.y = -objectDistance * 1 // 第二个距离相对于第一个是向下的
cube.position.y = -objectDistance * 2

// ... scene.add(torus, cone, cube)
```

## 旋转几何

```ts:line-numbers
// ...
const sectionMeshes = [torus, cone, cube]

const clock = new t.Clock() // 从初始化时就开始运行
const animate = () => {
  const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
  for (const mesh of sectionMeshes) {
    mesh.rotation.x = elapsedTime * 0.1
    mesh.rotation.y = elapsedTime * 0.1
  }
  // ...
}
```

让页面中的几何体随着滚动条滚动起来

```ts:line-numbers
let scrollY = window.scrollY

window.addEventListener('scroll', () => {
  scrollY = window.scrollY
})

const animate = () => {
  // ...
  // 让几何体随着滚动向下移动
  camera.position.y = -scrollY
  // ...
}
```

但我们会发现这样移动的有些快，因为在`scrollY`的时候变化的很快立刻就上白了，如下图所示：

<p>
  <img src=".\images\image-20221116110109845.png" style="margin:0 auto;border-radius:8px">
</p>

所以我们缩小它的移动距离

```ts
// 除以整个渲染屏幕的高度将其转换为合适的移动距离
camera.position.y = -scrollY / SIZE.height * objectDistance
```

给几何体加个位置以至于其在合适的位置

```ts:line-numbers
torus.position.y = -objectDistance * 0
cone.position.y = -objectDistance * 1
cube.position.y = -objectDistance * 2

torus.position.x = 1.3
cone.position.x = -1.3
cube.position.x = 1.3
```

### 增加视差

```ts:line-numbers
const cursor: {
  x: number | null
  y: number | null
} = { x: 0, y: 0 }

// x与y的坐标在(-0.5, 0.5)之间
window.addEventListener('mousemove', (e) => {
  cursor.x = e.clientX / SIZE.width - 0.5
  cursor.y = e.clientY / SIZE.height - 0.5
})

const animate = () => {
  const parallaxX = cursor.x
  const parallaxY = cursor.y
  camera.position.x = parallaxX!
  camera.position.y = parallaxY!
}
```

但这会出现两个问题：

1. 在页面滚动的时候物体不会跟着页面进行滚动

    ::: tip 解决方法
    将照相机放入一个组中，然后对照相机经行视差的移动
    :::

    ```ts:line-numbers
    const cameraGroup = new t.Group()
    scene.add(cameraGroup)

    const camera = new t.PerspectiveCamera(75, PROPOTION)
    camera.position.z = 3
    cameraGroup.add(camera)

    // animate()
    const animate = () => {
      // ...
      cameraGroup.position.x = parallaxX!
      cameraGroup.position.y = parallaxY!
    }
    animate() // 调用动画函数
    ```

2. 在鼠标向上下移动式几何体的移动方向反了

    ::: tip 解决方法
    改变照相机的在y轴上的移动方向
    :::

    ```ts
    const parallaxY = -cursor.y!
    ```

## 阻尼

我们让这个视差带有阻尼感且为了更好的体验移动的视差距离不能太大

```ts
const parallaxX = cursor.x! * 0.5
const parallaxY = -cursor.y! * 0.5
// 获得每次鼠标在移动过后的0.1的距离让他无限接近鼠标所移动的距离
cameraGroup.position.x += (parallaxX! - cameraGroup.position.x) * 0.1
cameraGroup.position.y += (parallaxY! - cameraGroup.position.y) * 0.1
```

我们再进一步，让这个阻尼感在每台电脑上都相同

```ts:line-numbers
let previousTime = 0 // 定义现在的时间

const animate = () => {
   // ...
   const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
   const deltaTime = elapsedTime - previousTime // 获得两帧之间的时间差
   previousTime = elapsedTime // 重新赋值现在的时间

   cameraGroup.position.x += (parallaxX! - cameraGroup.position.x) * 5 * deltaTime
   cameraGroup.position.y += (parallaxY! - cameraGroup.position.y) * 5 * deltaTime
}
```

## 增加粒子装饰

我们可以为整个空间加一些粒子效果，像之前那样生成粒子

```ts:line-numbers
const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)
for (let i = 0; i < particlesCount; i++) {
  // 铺满y轴与z轴
  positions[i * 3] = (Math.random() - 0.5) * 10
  // 在y轴上铺满整个屏幕整体的长度
  positions[i * 3 + 1] = objectDistance * 0.5 - Math.random() * objectDistance * sectionMeshes.length
  // 铺满y轴与z轴
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}
const particlesGemetry = new t.BufferGeometry()
particlesGemetry.setAttribute('position', new t.BufferAttribute(positions, 3))
const particlesMaterial = new t.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true, // 有大小的区别
  size: 0.03,
})
const particles = new t.Points(particlesGemetry, particlesMaterial)
scene.add(particles)
```

给粒子在改变几何体颜色时也改变

```ts
gui.addColor(parameters, 'materialColor').onChange(() => {
  material.color.set(parameters.materialColor)
  particlesMaterial.color.set(parameters.materialColor)
})
```

## 交互

我们给几何体加一些动画，当我们到达他所在的界面是旋转一下它

```ts
// 得到当前的物体
let currentSection = 0
// 再页面移动中添加动画，利用gsap快速生成动画并应用到几何体上
window.addEventListener('scroll', () => {
  scrollY = window.scrollY
  const newSection = Math.round(scrollY / SIZE.height)

  if (newSection !== currentSection) {
    currentSection = newSection
    gsap.to(
      sectionMeshes[currentSection].rotation,
      {
        duration: 1.5,
        ease: 'power2.inOut', // 动画
        x: '+=6', // 在原来几何体旋转的基础上再进行一定程度的旋转
        y: '+=3', // 在原来几何体旋转的基础上再进行一定程度的旋转
        z: '+=1.5', // 在原来几何体旋转的基础上再进行一定程度的旋转
      },
    )
  }
})

// ...
const animate = () => {
  // 修改集合体的动画效果的产生，以添加值的方式来模拟动画而不是直接重新赋值
  for (const mesh of sectionMeshes) {
    // X mesh.rotation.x += deltaTime * 0.1
    // X mesh.rotation.y += deltaTime * 0.12
    mesh.rotation.x += deltaTime * 0.1
    mesh.rotation.y += deltaTime * 0.12
  }
}
animate() // 调用动画函数
```

## 所有代码

```ts:line-numbers
import * as t from 'three'
import * as dat from 'dat.gui'
import gsap from 'gsap'

const parameters = {
  materialColor: '#ffeded',
}

/**
 * gui
 */
const gui = new dat.GUI({ closed: true }) // 设置关闭与宽度

const scene = new t.Scene()

/**
 * Objects
 */
const textureLoader = new t.TextureLoader()
const gradientTexture = textureLoader.load(
  new URL('../assets/textures/gradients/3.jpg', import.meta.url).href
)
gradientTexture.magFilter = t.NearestFilter

const material = new t.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
})

const objectDistance = 4

const torus = new t.Mesh(
  new t.TorusGeometry(1, 0.4, 16, 60),
  material,
)

const cone = new t.Mesh(
  new t.ConeGeometry(1, 2, 32),
  material,
)

const cube = new t.Mesh(
  new t.TorusKnotGeometry(0.8, 0.35, 100, 16),
  material,
)

torus.position.y = -objectDistance * 0
cone.position.y = -objectDistance * 1
cube.position.y = -objectDistance * 2

torus.position.x = 1.5
cone.position.x = -1.5
cube.position.x = 1.5

const sectionMeshes = [torus, cone, cube]
scene.add(torus, cone, cube)

/**
 * Partiles
 */
const particlesCount = 500
const positions = new Float32Array(particlesCount * 3)
for (let i = 0; i < particlesCount; i++) {
  positions[i * 3] = (Math.random() - 0.5) * 10
  positions[i * 3 + 1] = objectDistance * 0.5 - Math.random() * objectDistance * sectionMeshes.length
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}
const particlesGemetry = new t.BufferGeometry()
particlesGemetry.setAttribute('position', new t.BufferAttribute(positions, 3))
const particlesMaterial = new t.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true, // 有大小的区别
  size: 0.03,
})
const particles = new t.Points(particlesGemetry, particlesMaterial)
scene.add(particles)

const ambientLight = new t.AmbientLight(0xFFFFFF, 0.5)// 环境光源
const directLight = new t.DirectionalLight(0xFFFFFF, 0.5)
directLight.position.set(1, 1, 0)
scene.add(ambientLight, directLight)

/**
 * gui
 */
gui.addColor(parameters, 'materialColor').onChange(() => {
  material.color.set(parameters.materialColor)
  particlesMaterial.color.set(parameters.materialColor)
})

const SIZE = {
  width: window.innerWidth,
  height: window.innerHeight - 130,
}
const PROPOTION = SIZE.width / SIZE.height

const cameraGroup = new t.Group()
scene.add(cameraGroup)

const camera = new t.PerspectiveCamera(75, PROPOTION)
camera.position.z = 3
cameraGroup.add(camera)

const renderer = new t.WebGLRenderer()
renderer.setSize(SIZE.width, SIZE.height)
renderer.setClearColor(0x000, 1)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
onMounted(() => {
  const canvas = document.getElementById('three')!
  canvas.appendChild(renderer.domElement)
})

/**
 * 页面滚动
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () => {
  scrollY = window.scrollY
  const newSection = Math.round(scrollY / SIZE.height)

  if (newSection !== currentSection) {
    currentSection = newSection
    gsap.to(
      sectionMeshes[currentSection].rotation,
      {
        duration: 1.5,
        ease: 'power2.inOut', // 动画
        x: '+=6', // 在原来几何体旋转的基础上再进行一定程度的旋转
        y: '+=3', // 在原来几何体旋转的基础上再进行一定程度的旋转
        z: '+=1.5', // 在原来几何体旋转的基础上再进行一定程度的旋转
      },
    )
  }
})

/**
 * Cursor
 */
const cursor: {
  x: number | null
  y: number | null
} = { x: 0, y: 0 }

window.addEventListener('mousemove', (e) => {
  cursor.x = e.clientX / SIZE.width - 0.5
  cursor.y = e.clientY / SIZE.height - 0.5
})

let previousTime = 0

const clock = new t.Clock() // 从初始化时就开始运行
// animate()
const animate = () => {
  const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime
  // TODO
  // animate camera
  camera.position.y = -scrollY / SIZE.height * objectDistance
  const parallaxX = cursor.x! * 0.5
  const parallaxY = -cursor.y! * 0.5
  cameraGroup.position.x += (parallaxX! - cameraGroup.position.x) * 5 * deltaTime
  cameraGroup.position.y += (parallaxY! - cameraGroup.position.y) * 5 * deltaTime
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1
    mesh.rotation.y += deltaTime * 0.12
  }
  renderer.render(scene, camera) // 重新渲染渲染器也就是让渲染器拍照记录物体新的位置
  requestAnimationFrame(animate)// 调用动画渲染60帧/s的显示屏
}
animate() // 调用动画函数
```
