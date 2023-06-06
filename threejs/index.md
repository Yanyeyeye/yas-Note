---
outline: deep
---

# 几何体基础操作

## 几何体变换

- `scale`：缩放
  1. `mesh.scale.x = ...`、`mesh.scale.y = ...`、`mesh.scale.z = ...`单独改变大小
  2. `mesh.scale.set(x, y, z)`一次性改变大小

- `position`：改变位置
  
  1. `mesh.position.x = ...`、`mesh.position.y = ...`、`mesh.position.z = ...`单独改变位置属性
  2. `mesh.position.set(x, y, z)`一次性改变位置
  
- `rotation`：旋转，**以轴为圆心逆时针转动**
  
  1. `mesh.rotation.x = ...`、`mesh.rotation.y = ...`、`mesh.rotation.z = ...` 单独沿一个轴旋转
  - 要注意旋转的时候坐标轴也跟着旋转

   1. 需要使用`mesh.rotation.reorder('YXZ')`来使它跟着动，即：先根据**y轴**旋转再根据**x轴**旋转
  
```js
// 辅助坐标系
const axesHelper = new t.AxesHelper(300)
scene.add(axesHelper)

// 照相机朝向物体
camera.lookAt(mesh.position)
```

## 组

  使用组来将物体分组操作并可以进行整体的变化操作

```js
// 声明一个组
const group = new t.Group() 

// 声明第一个立方体
const cube1 = new t.Mesh(
  new t.BoxGeometry(30, 30, 30),
  new t.MeshBasicMaterial({ color: '#f6bd1d' }),
)

// 声明第二个立方体
const cube2 = new t.Mesh(
  new t.BoxGeometry(30, 30, 30),
  new t.MeshBasicMaterial({ color: '#21d86d' }),
)
cube2.position.x = 50

// 声明第三个立方体
const cube3 = new t.Mesh(
  new t.BoxGeometry(30, 30, 30),
  new t.MeshBasicMaterial({ color: '#e44033' }),
)
cube3.position.x = -50

// 将三个立方体组成一组
group.add(cube1, cube2, cube3)
// 下面的所有操作都是对组种所有物体的操作，要注意坐标系是同一个
group.position.y = 10
group.scale.y = 2
group.rotation.y = 1
scene.add(group)
```

## 帧动画

### 让物体动起来

```js
// 动画函数内部
group.rotation.y += 0.01
renderer.render(scene, camera)  // 重新渲染渲染器也就是让渲染器拍照记录物体新的位置
```

### 使用标准时间让物体在不同电脑上的动画速度相同

```js
// 动画函数外部
let time = new Date().getTime() // 动画之前的时间
// 动画函数内部
const currentTime = new Date().getTime() // 动画执行时的时间
const deltaTime = currentTime - time // 得到两个时间之间最适合动画的差值
time = currentTime // 重新赋值给之前的时间
```

::: tip
  `Three.js`内置了一个Clock时钟库效果等同上述代码作用
:::

```js
const clock = new t.Clock() // 从初始化时就开始运行
// 动画函数内
const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
```

## GSAP动画库

`GSAP`动画库，可以提供许多动画函数它拥有自己的**时钟**

### 安装

```cmd
npm install gsap
```

### 使用

```js
// 在函数外
// 第一个参数为物体
// 第二个参数为对象
gsap.to(mesh.rotation, { duration: 1, y: 45*(Math.PI/180) })
```

### 所有代码

```js
// animate()
const clock = new t.Clock() // 从初始化时就开始运行
const animate = () => {
    stats.begin() // 帧率显示器
    controls.update() // 鼠标控制
const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒    
group.rotation.y = elapsedTime
renderer.render(scene, camera)  // 重新渲染渲染器也就是让渲染器拍照记录物体新的位置
    stats.end() // 帧率显示器
    requestAnimationFrame(animate) // 调用动画渲染60帧/s的显示屏
}
animate() // 调用动画函数
```
