# 性能优化 :rocket:

## 禁用浏览器FPS限制

1. 关闭chrome

2. 打开终端

3. 输入下列代码

```bash
# Unix(Terminal)
open -a "Google Chrome" --args --disable-gpu-vsync --disable-frame-rate-limit

# Windows(command prompt)
start chrome --args --disable-gpu-vsync --disable-frame-rate-limit
```

:::tip
注意这会影响性能
:::

## 监控Draw-calls

下载谷歌的扩展[Spector.js](https://github.com/BabylonJS/Spector.js/tree/v0.9.9#table-of-content)

<p>
  <img src=".\images\image-20221212104733924.png" style="margin:0 auto;border-radius:8px">
</p>

如果谷歌插件使用不了时：

**步骤1**：安装`Spectorjs`
  
```bash
npm i spectorjs
```
  
**步骤2**：文件开头引入
  
```ts
const SPECTOR = require("spectorjs");

const spector = new SPECTOR.Spector();
spector.displayUI();
```

<p>
  <img src=".\images\image-20230321171847926.png" style="margin:0 auto;border-radius:8px">
</p>

点击红色的开始运行

## 渲染器的信息

打印`render`中的渲染信息

```ts
console.log(renderer.info)
```

## 清除不必要的东西

废除掉你不需要的东西，比如在销毁页面或销毁模型时要把它消除干净，可以参考[这篇文章](https://threejs.org/docs/#manual/zh/introduction/How-to-dispose-of-objects)

```ts
scene.remove(cube)
cube.geometry.dispose()
cube.material.dispose()
```

## 灯光

尽可能少用灯光，如果实在需要灯光可以使用平行光或者环境光
避免动态增加和移除灯光，因为灯光是是需要重新编译的

## Shadows阴影

1. 尽量避免使用`Shadows`，使用`baking`来代替他们

2. 使用`CamerHelper`来缩小阴影渲染的范围

3. 使用低分辨率尺寸的贴图

   ```ts
   directionalLight.shadow.mapSize.set(1024, 1024)
   ```

4. 合理使用`castShadow`和`receiveShadow`，比如有些几何体不需要使用阴影或者接收阴影

   ```ts
   几何体.castShadow = true
   几何体.receiveShadow = false
   ```

5. 一些几何体有时候只需要第一次渲染场景时渲染就够了

   ```ts
   renderer.shadowMap.autoUpdate = false // 停止自动更新
   renderer.shadowMap.needsUpdate = true // 在下次渲染时更新
   ```

## Texture纹理贴图

1. 纹理贴图非常吃内存，分辨率会影响渲染的性能
2. 保证图片的大小是2的幂次方，可以计算所带来的性能消耗
3. 使用`.jpg`、`.png`来控制图像和压缩程度，或者使用[TinyPNG](https://tinypng.com/)来压缩图片大小
4. 或者我们可以使用`basis`文件的格式，他的压缩性能更强，GPU也更容易读取，但图片也会很难看可以参考这个[库](https://github.com/BinomialLLC/basis_universal)

## Geometry几何体

1. 使用`buffer geometry`而不是经典的几何体。使用`BufferGeometry`可以有效减少向GPU传输上述数据所需的开销
2. 更新几何体的顶点会影响性能。创建几何图形时可以执行一次，但避免在动画函数中执行。
   如果需要为顶点设置动画，请使用顶点着色器。
3. 创建几何体时可以只创建一个`geometry`然后多次使用他

   ```ts
   const geometry = new t.BoxBufferGeometry(0.5, 0.5, 0.5)
   
   for(let i = 0; i < 50; i++)
   {
       const material = new t.MeshNormalMaterial()
   
       const mesh = new t.Mesh(geometry, material)
       mesh.position.x = (Math.random() - 0.5) * 10
       mesh.position.y = (Math.random() - 0.5) * 10
       mesh.position.z = (Math.random() - 0.5) * 10
       mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2
       mesh.rotation.z = (Math.random() - 0.5) * Math.PI * 2
   
       scene.add(mesh)
   }
   ```

4. 但3还是会消耗很多的性能，我们可以使用`BufferGeometryUtils`，可以一次性创建所有相同的几何体

   ```ts
   const geometries = []
   for(let i = 0; i < 50; i++)
   {
       const geometry = new t.BoxBufferGeometry(0.5, 0.5, 0.5)
   
       geometry.rotateX((Math.random() - 0.5) * Math.PI * 2)
       geometry.rotateY((Math.random() - 0.5) * Math.PI * 2)
   
       geometry.translate(
           (Math.random() - 0.5) * 10,
           (Math.random() - 0.5) * 10,
           (Math.random() - 0.5) * 10
       )
   
       geometries.push(geometry)
   }
   
   const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
   console.log(mergedGeometry)
   
   const material = new t.MeshNormalMaterial()
   
   const mesh = new t.Mesh(mergedGeometry, material)
   scene.add(mesh)
   ```

## Material材质

当有多个几何体时使用相同的材质可以指创建一次`material`

  ```ts
  const geometry = new THREE.BoxBufferGeometry(0.5, 0.5, 0.5)
  
  const material = new THREE.MeshNormalMaterial()
  
  for(let i = 0; i < 50; i++)
  {
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.x = (Math.random() - 0.5) * 10
      mesh.position.y = (Math.random() - 0.5) * 10
      mesh.position.z = (Math.random() - 0.5) * 10
      mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
      mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2
  
      scene.add(mesh)
  }
  ```

也可以使用开销小的材质：MeshBasicMaterial、MeshLambertMaterial、MeshPhongMaterial

## Mesh网格

如果有许多相同的但又需要独立的网格就可以使用`instanceMesh`，一种具有实例化渲染支持的特殊版本的`Mesh`。你可以使用 `InstancedMesh`来渲染大量具有相同几何体与材质、但具有不同世界变换的物体。 使用`InstancedMesh`将帮助你减少`draw call`的数量，从而提升你应用程序的整体渲染性能。例子可以参考**涂鸦立方体**，也可以参考如下代码

  ```ts
  const geometry = new t.BoxBufferGeometry(0.5, 0.5, 0.5)
  
  const material = new t.MeshNormalMaterial()
  
  // 声明实例化网格
  const mesh = new t.InstancedMesh(geometry, material, 50)
  scene.add(mesh)
  
  for(let i = 0; i < 50; i++)
  {
      // 声明位置信息
      const position = new t.Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
      )
  
      // 声明位置状态
      const quaternion = new t.Quaternion()
      quaternion.setFromEuler(new t.Euler((Math.random() - 0.5) * Math.PI * 2, (Math.random() - 0.5) * Math.PI * 2, 0))
  
      // 利用矩阵计算状态
      const matrix = new THREE.Matrix4()
      matrix.makeRotationFromQuaternion(quaternion)
      matrix.setPosition(position)
  
      // 设置网格
      mesh.setMatrixAt(i, matrix)
  }
  ```

如需要在动画函数中修改矩阵需要添加以下代码

  ```ts
  mesh.instanceMatrix.setUsage(t.DynamicDrawUsage)
  ```

## Model模型

1. 使用少面的多边形，多边形越少，帧的速率越好。如果需要更多小细节可以使用法线贴图

2. 如果模型有很多细节和非常复杂的几何图案，请使用**Draco**压缩，它可以大大减少文件体积。缺点在于解压几何体时可能会页面卡住，并且还必须加载Draco库

3. **Gzip**是发生在服务端的压缩。大多数服务器不支持gzip文件，如.glb、.gltf、.obj等。根据自身的服务器寻找合适方案。

## Camera相机

1. 控制相机的视野范围

    当对象不在视野中时，它们将不会被渲染，这叫做视锥体剔除**Frustum Culling**。虽然感觉有点low，但是缩小相机的视野，让屏幕中显示的对象越少个，我们要渲染的三角形个数也就越少

2. 近端面和远端面

    像相机视野一样，可以减少相机的`near`近端面属性和`far`远端面属性。比如有一个非常广阔的世界，有山有水，那我们可能会看不到远在山后的小房子，将far值降到合适的值，让这些房子甚至不会被渲染

## Renderer渲染器

1. 像素比：一些设备有非常高的像素比，但要知道，渲染的像素越多，消耗的性能越巨大，帧率也越差。因此最好尝试将渲染器的像素比限制为2:

   ```ts
   renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
   ```

2. 配置偏好：一些设备可能能够在不同GPU使用之间切换。我们可以通过指定`powerPreference`属性来提示用户代理怎样的配置更适用于当前WebGL环境：

   ```js
   const renderer = new THREE.WebGLRenderer({
       canvas: canvas,
       powerPreference: 'high-performance'
   })
   ```

   如果没有性能问题就使用默认的

3. 抗锯齿：只有在有可见的锯齿且不会导致性能问题的时候才去添加抗锯齿。

    默认的情况下是最好的，但如果有锯齿可以设置

     ```ts
     antialias: true
     ```

## Post-processing后期处理

每个后期处理过程都将使用与渲染器分辨率（包括像素比率）相同的像素进行渲染。如果分辨率为`1920*1080`，有4个通道，像素比为2，则需要渲染`1920*2*1080*2*4`=33177600像素。
  
**合理一点，可以的话将其整合为一个通道。**

## Shader着色器

指定精度：

我们在使用着色器时可以改变着色器的精度

```ts
const shaderMaterial = new t.ShaderMaterial({
    precision: 'lowp', // 低精度
    // ...
})
```

这对于`RawShaderMaterial`是无效的，必须自己添加精度。

- 在顶点`vertex`的顶点着色器中，使用`clamp()`之类的函数来代替`if`之类的原句

- 在片段`fragment`的着色其中，使用`mix()`来混和颜色

### 使用贴图纹理

使用**柏林噪声**函数很酷，但它会显著影响性能。有时，最好使用纹理来表示噪波。使用`texture2D()`比柏林噪声函数要廉价得多，并且可以使用photoshop等工具非常高效地生成这些纹理。

### 使用define

**uniform**是很有作用的，因为我们可以设置它们的值并且在动画函数中去调整值，但是**uniform**有性能成本。如果某个值不会改变，则可以使用**defines**。

我们有两种方法来定义他

  1. 直接在着色器代码中

     ```glsl
     #define uDisplacementStrength 1.5
     ```

  2. 在`ShaderMaterial`里定义它，直接在着色器中使用它

     ```ts
     const shaderMaterial = new THREE.ShaderMaterial({
     
         // ...
     
         defines:
         {
             uDisplacementStrength: 1.5
         },
     
         // ...
     }
     ```

### 在顶点着色器中计算

尽可能在顶点着色器中进行计算，并将结果发送到片段着色器。
