# 制作一个鬼屋 :ghost:

<p>
  <img src=".\images\image-20221108092445571.png" style="margin:0 auto;border-radius:8px;">
</p>

## 准备

**步骤1**：实例化一个房子，将房子用正方体**组**来代替

```ts
const house = new t.Group()
scene.add(house)
```

**步骤2**：实例化墙并添加进屋子中

```ts
const wall = new t.Mesh(
    new t.BoxGeometry(2, 1, 2),
    new t.MeshStandardMaterial({ color: 0xAC8E82 }),
)
house.add(wall)
```

**步骤3**：实例化屋顶并添加进屋子中

```ts
const roof = new t.Mesh(
    new t.ConeGeometry(2, 1, 4),
    new t.MeshStandardMaterial({ color: 0xB35F45 }),
)
roof.position.y = 1
roof.rotation.y = Math.PI * 0.25
house.add(roof)
```

**步骤4**：实例化门并添加进屋子中

```ts
const door = new t.Mesh(
    new t.PlaneGeometry(2, 1),
    new t.MeshStandardMaterial({ map: doorMaterial }),
)
door.position.z = 1.01 // 防止z fight
house.add(door)
```

**步骤5**：实例化灌木丛并添加进房子

```ts
const bushGeometry = new t.SphereGeometry(1, 6, 6)
const bushMaterial = new t.MeshStandardMaterial({ color: 0x89C854 })

const bush1 = new t.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.3, 0.3, 0.3)
bush1.position.set(1.8, -0.4, -2)
const bush2 = new t.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.5, -0.4, 2)
const bush3 = new t.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(1.4, -0.2, 1.5)
const bush4 = new t.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.5, 0.5, 0.5)
bush4.position.set(-1.8, -0.3, 2.2)
house.add(bush1, bush2, bush3, bush4)
```

**步骤6**：实例化墓碑并添加进坟墓里

```ts
const grave = new t.Group()
scene.add(grave) // 添加墓碑到场景中

const tombStoneGeometry = new t.BoxGeometry(0.4, 0.6, 0.15)
const tombStoneMaterial = new t.MeshStandardMaterial({ color: 0xB2B6B1 })
for (let i = 0; i <= 50; i++) {
    const angle = Math.random() * Math.PI * 2  // 角度为0到365°
    const radius = 2 + Math.random() * 3 // 半径为[2, 5)
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius
    const tombStone = new t.Mesh(tombStoneGeometry, tombStoneMaterial)
    // 在半径为2,5的范围内生成墓碑
    tombStone.position.set(x, -0.3, z)
    // 让墓碑颠倒
    tombStone.rotation.y = (Math.random() - 0.5) * 0.4
    tombStone.rotation.z = (Math.random() - 0.5) * 0.4
    tombStone.rotation.x = (Math.random() - 0.5) * 0.2
    grave.add(tombStone)
}
```

## 初始化

修改些光让他更有氛围

```ts
const ambientLight = new t.AmbientLight(0xB9D5FF, 0.12) // 环境光
scene.add(ambientLight)
const directLight = new t.DirectionalLight(0xB9D5FF, 0.12) // 太阳平行光
directLight.position.set(1, 2, 0)
scene.add(directLight)
const directLightHelper = new t.DirectionalLightHelper(directLight)  // 灯光助手
directLightHelper.visible = true
scene.add(directLightHelper)
```

在门上添加一盏灯增加氛围感

```ts
const doorLight = new t.PointLight(0xFF7D46, 1, 7)
doorLight.position.set(0, 0.5, 1.5)
scene.add(doorLight)
```

增加一些雾使整体看起来更有感觉

```ts
const fog = new t.Fog('#262837', 1, 5)
scene.fog = fog
```

将整个空间塞满的颜色近似于雾的颜色

```ts
renderer.setClearColor(0x262837)
```

给门加一些纹理让他更真实

```ts:line-numbers
const textLoader = new t.TextureLoader()
const doorMaterial = textLoader.load(
    new URL('../assets/textures/door/color.jpg', import.meta.url).href)
const doorAlphaMaterial = textLoader.load(
    new URL('../assets/textures/door/alpha.jpg', import.meta.url).href)
const doorAmbientMaterial = textLoader.load(
    new URL('../assets/textures/door/ambientOcclusion.jpg', import.meta.url).href)
const doorHeightMaterial = textLoader.load(
    new URL('../assets/textures/door/height.jpg', import.meta.url).href)
const doorNormalMaterial = textLoader.load(
    new URL('../assets/textures/door/normal.jpg', import.meta.url).href)
const doorRoughnessMaterial = textLoader.load(
    new URL('../assets/textures/door/roughness', import.meta.url).href)

const door = new t.Mesh(
    new t.PlaneGeometry(1, 1, 100, 100),
    new t.MeshStandardMaterial({
    map: doorMaterial,
    transparent: true,
    alphaMap: doorAlphaMaterial,
    aoMap: doorAmbientMaterial,
    displacementMap: doorHeightMaterial,
    displacementScale: 0.1,
    normalMap: doorNormalMaterial,
    metalnessMap: doorMaterial,
    roughnessMap: doorRoughnessMaterial,
    }),
)
door.geometry.setAttribute(
    'uv2',
    new t.Float32BufferAttribute(door.geometry.attributes.uv.array, 2),
)
```

给墙加些纹理让它更真实

```ts:line-numbers
const bricksColorTexture = textLoader.load(
    new URL('../assets/textures/bricks/color.jpg', import.meta.url).href)
const bricksAmbientTexture = textLoader.load(
    new URL('../assets/textures/bricks/ambientOcclusion.jpg', import.meta.url).href)
const bricksNormalTexture = textLoader.load(
    new URL('../assets/textures/bricks/normal.jpg', import.meta.url).href)
const bricksRoughnessTexture = textLoader.load(
    new URL('../assets/textures/bricks/roughness.jpg', import.meta.url).href)

const wall = new t.Mesh(
    new t.BoxGeometry(2, 1, 2),
    new t.MeshStandardMaterial({
    map: bricksColorTexture,
    aoMap: bricksAmbientTexture,
    normalMap: bricksNormalTexture,
    roughnessMap: bricksRoughnessTexture,
    }),
)
wall.geometry.setAttribute(
    'uv2',
    new t.Float32BufferAttribute(wall.geometry.attributes.uv.array, 2),
)
```

给草加一些细节

```ts
const grassColorTexture = textLoader.load(
    new URL('../assets/textures/grass/color.jpg', import.meta.url).href)
const grassAmbientTexture = textLoader.load(
    new URL('../assets/textures/grass/ambientOcclusion.jpg', import.meta.url).href)
const grassNormalTexture = textLoader.load(
    new URL('../assets/textures/grass/normal.jpg', import.meta.url).href)
const grassRoughnessTexture = textLoader.load(
    new URL('../assets/textures/grass/roughness.jpg', import.meta.url).href)

grassColorTexture.repeat.set(8, 8)
grassAmbientTexture.repeat.set(8, 8)
grassNormalTexture.repeat.set(8, 8)
grassRoughnessTexture.repeat.set(8, 8)
grassColorTexture.wrapS = t.RepeatWrapping
grassAmbientTexture.wrapS = t.RepeatWrapping
grassNormalTexture.wrapS = t.RepeatWrapping
grassRoughnessTexture.wrapS = t.RepeatWrapping
grassColorTexture.wrapT = t.RepeatWrapping
grassAmbientTexture.wrapT = t.RepeatWrapping
grassNormalTexture.wrapT = t.RepeatWrapping
grassRoughnessTexture.wrapT = t.RepeatWrapping
const plan = new t.Mesh(
    new t.PlaneGeometry(10, 10),
    new t.MeshStandardMaterial({
    map: grassColorTexture,
    aoMap: grassAmbientTexture,
    normalMap: grassNormalTexture,
    roughnessMap: grassRoughnessTexture,
    }),
)
plan.geometry.setAttribute(
    'uv2',
    new t.Float32BufferAttribute(plan.geometry.attributes.uv.array, 2),
)
```

## 增加内容

加三个幽灵

```ts
const ghost1 = new t.PointLight(0xFF00FF, 0.5, 7)
const ghost2 = new t.PointLight(0x00FFFF, 0.3, 7)
const ghost3 = new t.PointLight(0xFFFFFF, 0.6, 7)
scene.add(ghost1, ghost2, ghost3)
```

让幽灵绕着房子巡逻

```ts:line-numbers
const clock = new t.Clock() // 从初始化时就开始运行
// animate()
const animate = () => {
    stats.begin() // 帧率显示器
    controls.update() // 鼠标控制
    const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒

    const ghost1Angle = elapsedTime * 0.5 // 把时间作为角度
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    ghost1.position.y = Math.sin(elapsedTime * 3)

    const ghost2Angle = -elapsedTime * 0.32
    ghost2.position.x = Math.cos(ghost2Angle) * 5
    ghost2.position.z = Math.sin(ghost2Angle) * 5
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

    const ghost3Angle = elapsedTime * 0.18
    ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
    ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
    ghost3.position.y = Math.sin(ghost3Angle * 5) + Math.sin(elapsedTime * 2)
    renderer.render(scene, camera) // 重新渲染渲染器也就是让渲染器拍照记录物体新的位置
    stats.end()// 帧率显示器
    requestAnimationFrame(animate)// 调用动画渲染60帧/s的显示屏
}
animate() // 调用动画函数
```

## 使用阴影

开启阴影

**步骤1**：开启渲染总开关

```ts
renderer.shadowMap.enabled = true // 开启阴影渲染
```

**步骤2**：开启所有灯的阴影

```ts
doorLight.castShadow = true
directLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true
```

**步骤3**：开启所有物体的阴影，包括墓碑、房子

```ts
wall.castShadow = true
bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
bush4.castShadow = true

for (let i = 0; i <= 50; i++) {
    // ...
    tombStone.castShadow = true
    // ...
}
```

**步骤4**：让地面能够接收阴影

```ts
plan.receiveShadow = true
```

调整整体的阴影效果

```ts
doorLight.shadow.mapSize.width = 256
doorLight.shadow.mapSize.height = 256
doorLight.shadow.camera.far = 7

ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.camera.far = 7

ghost2.shadow.mapSize.width = 256
ghost2.shadow.mapSize.height = 256
ghost2.shadow.camera.far = 7

ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256
ghost3.shadow.camera.far = 7
```
