# 相机Camera :film_projector:

## 相机种类

- `ArrayCamera`阵列计算机：在同一屏幕上可以有多个视角，类似监控室效果
- `StereoCamera`立体照相机：`VR`效果
- `CubeCamera`立方体相机：将场景渲染为六面图
- `OrthographicCamera`正交相机：不遵循近大原小的规则
- `PerspectiveCamera`透视相机：遵循近大远小的规则，主要使用

### `PerspectiveCamera`透视相机

构造器

```js
PerspectiveCamera(fov: Number,aspect: Number,near: Number,far: Number)
```

- `fov`：相机的视角，也就是相机的可视区域，一般数值为45或75比较合适
- `aspect`：长宽比，也就是canvas渲染区域的长除宽
- `near`：相机的近端面也就是开始看场景的最近距离
  - 要注意这会产生`z-fighting`也就是渲染冲突，文章参考`https://zhuanlan.zhihu.com/p/78769570、https://blog.csdn.net/aoxuestudy/article/details/123084480`
- `far`：相机的远端面也就是相机最远看到的地方
- 注意需要将物体放在近视端和远视端物体才不会被裁减

### `OrthographicCamera`正交相机

构造器

```js
OrthographicCamera(left: Number,right: Number,top: Number,bottom: Number,near: Number,far: Number )
```

- `left`: 摄像机的左侧面的距离
- `right`：摄像机的右侧面的距离
- `top`：摄像机的上侧面的距离
- `bottom`：摄像机下侧面的距离
- `near`：摄像机的近视端
- `far`：摄像机的远视端
- 正交摄像机是以平行的视角看一个物体

```js
const aspectRatio = sizes.width / sizes.height // 获得画布的的比例
const camera = new t.OrthographicCamera(- 1 * aspectRatio, 1 * aspectRatio, 1, - 1, 0.1, 100)
```

## 相机控制器

- `DeviceOrientationControls`陀螺仪控制器：相当于利用手机来控制视角
- `FlyControls`和`FirstPersonControls`飞行器和第一人称控制器：相当于第一人称开飞机能飞来飞去的感觉
- `PointerLockControls`指针锁定控制器：敌人人称射击游戏，鼠标隐藏屏幕指向鼠标看的方向
- `OrbitControls`控制器：相当于将物体拿在手上那样观察，但不能颠倒世界有一定的视角限制，左键模拟旋转，右键实现拖动
- `TrackballControls`：轨道求控制器，即允许`OrbitControls`控制器中世界颠倒

### 实现代码

- **步骤1**：导入库

```js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
```

- **步骤2**：声明鼠标操作对象

```js
// 参数一为相机
// 参数二为画布，renderer.domElement为当前渲染物体的dom元素也就是画布
const controls = new OrbitControls(camera, renderer.domElement)
```

- **步骤3**：在动画函数中更新相机的位置

```js
const animate = () => {
  stats.begin() // 帧率显示器
  controls.update() // [!code focus] // 鼠标控制
  renderer.render(scene, camera) // 重新渲染渲染器也就是让渲染器拍照记录物体新的位置
  effectComposer.render()
  stats.end()// 帧率显示器
  requestAnimationFrame(animate)// 调用动画渲染60帧/s的显示屏
}
animate() // 调用动画函数
```

### 相机视角

环轨控制器也就是初始状态下照相机会看向场景的中心点，我们可以通过改变 `target` 属性来改变初始视角的位置。

  ```js
  controls.target = mesh.position
  ```

### 阻尼效果

  ```js
  controls.enableDamping = true
  ```

::: warning 注意
当相机控制器`Controls`使用时，相机的`camera.lookAt()`会无效
:::
