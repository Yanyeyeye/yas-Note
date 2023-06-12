# 物理效果 :exploding_head:

## 选择物理库

一般我们选择`2D`的物理库因为那样能够减少性能的开支，一切取决于你开发的物理场景

有如下几种好用的`3D`物理库：

1. `AmmoJs`
2. `CannonJs`
3. `OimoJs`

<p>
  <img src=".\images\image-20221119155107727.png" style="margin:0 auto;border-radius:8px">
</p>

也有如下`2D`物理引擎库：

1. `MatterJs`
2. `P2Js`
3. `PlanckJs`
4. `Box2dJs`

<p>
  <img src=".\images\image-20221119155323553.png" style="margin:0 auto;border-radius:8px">
</p>

## 使用`3D`引擎库

**步骤1**：安装

```bash
i -S cannon-es
i -D @types/cannon
```

**步骤2**：导入

```ts
import * as c from 'cannon-es'
```

**步骤3**：使用

```ts
const world = new c.World()
// 设置物理世界的重力加速度，沿y轴向上-9.8米每平方秒
world.gravity.set(0, -9.82, 0) 
```

**步骤4**：我们需要在现实世界中创建一个球体和一个平面

```ts:line-numbers
// sphere
const material = new t.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
})
const geometry = new t.SphereGeometry(0.5, 32, 32)
const sphere = new t.Mesh(geometry, material)
sphere.castShadow = true

// plane
const planeGeometry = new t.PlaneGeometry(15, 15)
const plabeMaterial = new t.MeshStandardMaterial({
  color: '#777777',
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
})
const plane = new t.Mesh(planeGeometry, plabeMaterial)
plane.rotateX(-Math.PI * 0.5)
plane.receiveShadow = true

scene.add(sphere, plane)
```

**步骤5**：我们在物理世界中创建一个球体

```ts
const sphereShape = new c.Sphere(1)
const sphereBody = new c.Body({
  mass: 1, // 刚体的质量
  position: new c.Vec3(0, 3, 0), // 刚体的初始位置，单位是米
  shape: sphereShape, // 刚体的形状
})
world.addBody(sphereBody)
```

**步骤6**：将球体放入场景中渲染

```ts:line-numbers
let previousTime = 0 // 记录先前的时间
const clock = new t.Clock() // 从初始化时就开始运行
const animate = () => {
  // ...
  const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime
  // TODO
  world.step(1 / 60, deltaTime, 3) // 以固定的步长更新世界
  sphere.position.copy(sphereBody.position) // 应用到实际的球体上
  // ...
}
animate() // 调用动画函数*
```

> 使用`step( dt, [timeSinceLastCalled], [maxSubSteps=10] )`来更新时间步长

- `dt`：固定的时间帧在这里是我们的屏幕的刷新率
- `timeSinceLastCalled`：自上次调用以来的时间

- `maxSubSteps`：利用适合的补偿来追赶上物理世界的延迟（需要调）参考[fix_your_timestep](https://gafferongames.com/post/fix_your_timestep)

**步骤7**：为球体增加碰撞地板的效果

```ts
const floorShape = new c.Plane()
const floorBody = new c.Body()
floorBody.mass = 0 // 意味着静止
floorBody.addShape(floorShape)
world.addBody(floorBody)
```

但好像出了些问题，球并没有落在地板上，好像是斜着跑丢的。这是因为，我们没有给物理世界的地板旋转方向

<p>
  <img src=".\images\image-20221119182321331.png" style="margin:0 auto;border-radius:8px">
</p>

```ts:line-numbers
// 给物理世界的地板旋转方向
const floorShape = new c.Plane() // 物理世界的平面是没有边界的
const floorBody = new c.Body()
floorBody.mass = 0 // 意味着静止
floorBody.addShape(floorShape)
// 第一个参数是轴线，确定好轴线这很重要，因为物体将绕着这个轴线旋转(....待研究)
floorBody.quaternion.setFromAxisAngle(new c.Vec3(-1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)
```

**步骤8**：给小球在碰撞到地板时加上些效果。让它能够弹跳

```ts:line-numbers
const defaultMaterial = new c.Material('default')
const defaultContactMaterial = new c.ContactMaterial(
  defaultMaterial, // 两个相互碰撞的材料其中之一
  defaultMaterial,  // 两个相互碰撞的材料其中之一
  {
      friction: 0.1, // 摩擦力
      restitution: 0.7, // 衰减程度，数值越大越Q弹
  },
)
world.addContactMaterial(defaultContactMaterial)

const sphereShape = new c.Sphere(1)
const sphereBody = new c.Body({
  mass: 1,
  position: new c.Vec3(0, 5, 0),
  shape: sphereShape,
  material: defaultMaterial, // 给球使用物理材质
})
world.addBody(sphereBody)

floorBody.material = defaultMaterial // 给地面使用物理材质
```

或者我们也可以直接就给物理世界添加上物理材质

```ts:line-numbers
const defaultMaterial = new c.Material('default')
const defaultContactMaterial = new c.ContactMaterial(
  defaultMaterial, // 两个相互碰撞的材料其中之一
  defaultMaterial,  // 两个相互碰撞的材料其中之一
  {
    friction: 0.1, // 摩擦力
    restitution: 0.7, // 衰减程度，数值越大越Q弹
  },
)
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial // 给世界添加物理材质
```

## 对物体使用外加的力

- `applyForce` ：施加作用力。可以用作风吹动树叶，或推倒多米诺骨牌或愤怒的小鸟的受力
- `applyImpulse`： 施加冲量。这个冲量是瞬间的，例如射出去的子弹。
- `applyLocalForce` 同 `applyForce`：不过是在物体的内部施力，对刚体的局部点施力。
- `applyLocalImpulse` 同 `applyImpulse`：不过是在物体的内部施加冲量，对刚体的局部点施加冲量

现在我们增加一些外力来推动小球

```ts
sphereBody.applyLocalForce(new c.Vec3(150, 0, 0), new c.Vec3(0, 0, 0))
```

- 第一个参数：在一个向量的方向施加力
- 第二个参数：物体的中心开始施加力

我们也可以在小球滚落后施加风的作用力

```ts
const animate = () => {
  // ...
  sphereBody.applyForce(new c.Vec3(-0.5, 0, 0), sphereBody.position)
  world.fixedStep(1 / 60, 3)
  // ...
}
animate()
```

## 实现多物体

### 初始化球体

```ts:line-numbers
const createSphere = (radius: number, position: t.Vector3 | c.Vec3) => {
  // real
  const sphereGeometry = new t.SphereGeometry(radius, 32, 32)
  const sphereMaterial = new t.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  })

  const sphere = new t.Mesh(sphereGeometry, sphereMaterial)
  sphere.castShadow = true
  sphere.position.copy(position as t.Vector3)
  scene.add(sphere)

  // physical
  const shape = new c.Sphere(radius)
  const body = new c.Body({
    mass: 1,
    shape,
    material: defaultMaterial,
  })
  body.position.copy(position as c.Vec3)
  world.addBody(body)
}
createSphere(1, new t.Vector3(0, 1, 5))
```

### 更新物体

```ts:line-numbers
const objectsToUpdate: Array<{ mesh: t.Mesh; body: c.Body }> = []

const createSphere = (radius: number, position: t.Vector3 | c.Vec3) => {
  objectsToUpdate.push({
    mesh,
    body,
  })
}
```

### 新增物体

```ts:line-numbers
const debugObject = {
  createSphere: () => {},
}

debugObject.createSphere = () => {
  createSphere(
    Math.random(),
    new t.Vector3((Math.random() - 1) * 3, 5, (Math.random() - 1) * 3),
  )
}

gui.add(debugObject, 'createSphere')
```

### 在场景中新增内容

在动画里实现生成物体

```ts
const animate = () => {
  // ...
  for (const object of objectsToUpdate)
    object.mesh.position.copy(object.body.position as unknown as t.Vector3)
  // ...
}
```

再在场景中添加正方体

```ts:line-numbers
const debugObject = {
    // ...
    createBox: () => {},
}

const boxGeometry = new t.BoxGeometry(1, 1, 1)
const createBox = (height: number, width: number, depth: number, position: t.Vector3 | c.Vec3) => {
  const mesh = new t.Mesh(boxGeometry, Material) // 使用相同的材质以减小性能损耗
  mesh.scale.set(height, width, depth)
  mesh.castShadow = true
  mesh.position.copy(position as t.Vector3)
  scene.add(mesh)

  // physical
  // 在物理空间中生成一个正方体需要将坐标放到这个正方体的中央
  const shape = new c.Box(new c.Vec3(height * 0.5, width * 0.5, depth * 0.5))
  const body = new c.Body({
    mass: 1,
    shape,
    material: defaultMaterial,
  })
  body.position.copy(position as c.Vec3)
  world.addBody(body)

  objectsToUpdate.push({
    mesh,
    body,
  })
}

// 创建生成立方体的代码
debugObject.createBox = () => {
  createBox(
    Math.random(),
    Math.random(),
    Math.random(),
    new t.Vector3((Math.random() - 1) * 3, 5, (Math.random() - 1) * 3),
  )
}

// 调试中实现点击产生立方体
gui.add(debugObject, 'createBox')
```

但这有个很奇怪的现象，对于立方体之间的碰撞我们希望是在碰撞我发生侧翻、旋转之类的而不是像球那样弹跳

```ts
const animate = () => {
  // ...
  for (const object of objectsToUpdate) {
    // ...
    object.mesh.quaternion.copy(object.body.quaternion as unknown as t.Quaternion)
  }
  // ...
}
```

## 性能优化

我们可以将`geometry`和`material`移到函数之外去执行，并且只在生成函数里调用他们，这样就可以减少几何体被重新创建的次数

```ts:line-numbers
const sphereGeometry = new t.SphereGeometry(1, 32, 32)
const sphereMaterial = new t.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  envMap: environmentMapTexture,
  envMapIntensity: 0.5,
})

const createSphere = (radius: number, position: t.Vector3 | c.Vec3) => {
  const mesh = new t.Mesh(sphereGeometry, sphereMaterial)
  // 使用.scale.set来更改球体的大小，使之与物理的球体大小一致
  mesh.scale.set(radius, radius, radius)
  mesh.castShadow = true
  mesh.position.copy(position as t.Vector3)
  scene.add(mesh)
  // ...
}
```

### 碰撞检测中的宽相

计算机只在两个距离相近的物体上才会检测碰撞效果，且对于场景中的任何物体只要距离在一定的范围之内它就会每隔一段时间来检测，这非常消耗性能。且有时后会出现一个`bug`，如：如果一个物体运动的非常的快时没有在计算碰撞的检测间隔之内，则不会产生碰撞的检测。

- 有如下三种碰撞的检测：
  1. [`NaiveBroadphase`](https://pmndrs.github.io/cannon-es/docs/classes/NaiveBroadphase.html) Cannon 默认的算法。检测物体碰撞时，一个基础的方式是检测每个物体是否与其他每个物体发生了碰撞
  2. [`GridBroadphase`](https://pmndrs.github.io/cannon-es/docs/classes/GridBroadphase.html)网格检测。轴对齐的均匀网格`Broadphase`。将空间划分为网格，网格内进行检测。
  3. [`SAPBroadphase(Sweep-and-Prune)`](https://pmndrs.github.io/cannon-es/docs/classes/SAPBroadphase.html) 扫描-剪枝算法，性能最好。背后算法太过复杂，后续如果我有时间和精力，会单独写一篇关于碰撞检测的专题文章

首先我们将默认的碰撞检测算法替换成性能最好的

```ts
world.broadphase = new c.SAPBroadphase(world)
```

### Sleep

就像当一个物体不再移动的时候，我们可以认为他处于休眠状态让我们的碰撞检测算法不对他进行计算，以大大减少性能的损耗，当他被碰撞时再开始计算碰撞

  ```ts
  world.allowSleep = true
  ```

## 为物体增加碰撞声音

**步骤1**：先导入声音

```ts:line-numbers
const sound = new Audio(new URL('../assets/sounds/hit.mp3', import.meta.url).href)
const playSound = (collision: { contact: c.ContactEquation }) => {
  // 得到声音的强度
  const impactStrength = collision.contact.getImpactVelocityAlongNormal()
  // 如果强度大于1.5就播放以及自定义声音的强度
  if (impactStrength > 1.5) {
    sound.volume = Math.random()
    sound.currentTime = 0
    sound.play()
  }
}
```

**步骤2**：使用声音

```ts:line-numbers
const createSphere = (radius: number, position: t.Vector3 | c.Vec3) => {
  // ...
  body.addEventListener('collide', playSound)
  // ...
}

const createBox = (height: number, width: number, depth: number, position: t.Vector3 | c.Vec3) => {
  // ...
  body.addEventListener('collide', playSound)
  // ...
}
```

## 移除物体

**步骤1**：在`debugObject`中定义`reset`属性

```ts
const debugObject = {
  // ...
  reset: () => {},
}
```

**步骤2**：在`debugObject`中赋值

```ts:line-numbers
debugObject.reset = () => {
  for (const object of objectsToUpdate) {
    object.body.removeEventListener('collide', playSound)
    world.removeBody(object.body)
    scene.remove(object.mesh)
  }
}
```

**步骤3**：在`gui`中调试

```ts
gui.add(debugObject, 'reset')
```

## 其它

- 物理是由`cpu`计算来完成的
- 当要提升性能时，要考虑是否要使用线程来优化
- `Ammots`拥有更好的物理库
- 在这个网站里有很多 [demo](https://pmndrs.github.io/cannon-es/) 可以参考
