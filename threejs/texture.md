# 纹理Texture :bricks:

## 纹理贴图分类

- **Map**：即将图片上的每一个像素应用到几何体上
- **Emissive Map**：自发光纹理贴图，使用一种有不同色阶灰色的图（灰度图），用于描述材质上哪些像素具有自发光特性。需要配合材质的`emissive`属性使用![image-20221102145332545](.\images\image-20221102145332545.png)
- **Alpha Map**：透明纹理贴图也是使用灰度图，越白则透明度越低，越黑则透明度越高。需配合材质`transparent`使用
- **Bump Map、Normal Map、Displace Map**：*Bump Map* 凹凸贴图，*Normal Map* 法线贴图，*Displacement Map* 置换贴图都是用于创建更丰富细节的一种技术。**凹凸贴图**几乎已被淘汰，取代它的正是法线贴图，因为**法线贴图**可以存储比凹凸贴图更多的信息。但法线贴图并不会真正的改变模型，它只是和光发生反应，形成虚假的立体感细节，所以法线贴图在强化细节的同时不会产生额外的性能负担。**置换贴图**则会通过改变模型结构来创建真正的细节，不过，这种方式会产生额外的性能消耗。
- **Rough. Map**：*粗糙度纹理贴图*也是使用灰度图，它用于标识材质表面的粗糙度，颜色越白则越粗糙，越黑则越光滑。
- **Metal. Map**：*金属度纹理贴图*也是使用灰度图，它将标识材质的哪个部分是金属 (白色) 和非金属 (黑色)。这些信息有助于创造反射。
- **Env Map**：*环境反射贴图*，用于创建在材质表面反射环境细节的效果。比如金属球可以像镜子一样反射出周围环境的细节。
- **Light Map**：*光照贴图*，用于来模拟物体和灯光均处于静止状态下的光照的效果。比如不会运动的墙面和吊灯射灯。
- **AO Map**：全称是*Ambient Occlusion环境闭塞贴图*也是使用灰度图，但它用来模拟更加真实的阴影效果。

::: tip
这些纹理 (尤其是金属度和粗糙度) 遵循我们所说的`PBR`原理。`PBR（Physically Based Rendering）`是一种着色和渲染技术，它基于真实世界的物理特性来渲染三维场景，能够更精确的描述光如何与物体表面互动。
:::

## 加载纹理

- 使用原生加载纹理`JS`

```js
// 原生JS
const image = new Image()
image.onload = () =>
{
  const texture = new t.Texture(image) // 使用new Texture()创建纹理
}
image.src = '/textures/door/color.jpg'
const material = new t.MeshBasicMaterial({ map: texture }) // 使用纹理
```

- 有的时候，我们可能不等加载结束，需要先创建`Texture`对象并赋值，这样的话就需要在加载完成之后将`needsUpdate`属性设置为`true`来通知纹理刷新变量。

```js
const image = new Image()
const texture = new t.Texture(image)
image.addEventListener('load', () =>
{
    texture.needsUpdate = true
})
image.src = '/textures/door/color.jpg'
```

## 纹理加载器TextureLoader

使用`TextureLoader`加载图片，并使用其`load(...)`方法加载纹理图片

```js
const textureLoader = new t.TextureLoader()
// 使用vite加载静态资源时
const colorTexture = textureLoader.load(
  new URL('../assets/textures/door/color.jpg', import.meta.url).href
)
const material = new t.MeshBasicMaterial({ map: colorTexture }) // 使用纹理
```

- `load`方法还可以添加三个回调函数作为参数，
  1. `onload`：当图片加载完成时
  2. `onprogress`：当图片加载中，可以拿到加载进度
  3. `onerror`：当图片加载遇到问题时

  ```js
  const textureLoader = new t.TextureLoader()
  const texture = textureLoader.load(
      texture_color,
      () => {
          console.log('loading finished')
      },
      () => {
          console.log('loading progressing')
      },
      () => {
          console.log('loading error')
      }
  )
  ```

## 加载器管理LoadingManager

在商业项目中，我们经常需要加载很多纹理图片，**3D**模型等等。我们需要建立一个整体的加载管理器，以确保用户加载完了所有必要资源后才使用我们的网站。

::: tip

- **LoadingManager**可以用来管理所以对象的加载情况。
- 访问[Three LoadingManager](https://threejs.org/docs/index.html?q=LoadingManager#api/zh/loaders/managers/LoadingManager)来了解更多内容。
:::

### 声明对象

创建`LoadingManager`类的实例，并将其传递给`TextureLoader`：

```js
const loadingManager = new t.LoadingManager()
const textureLoader = new t.TextureLoader(loadingManager)
```

我们可以对`loadingManager`添加`onStart`, `onLoad`, `onProgress`和  `onError`的监听来了解全部资源的加载情况

```js
loadingManager.onStart = () =>
{
    console.log('loading started')
}
loadingManager.onLoad = () =>
{
    console.log('loading finished')
}
loadingManager.onProgress = () =>
{
    console.log('loading progressing')
}
loadingManager.onError = () =>
{
    console.log('loading error')
}
```

## UV展开

假如我们把`3D`立方体的面一一展开，立方体上每一个顶点其实都对应了图片上的一个二维坐标，为了和三维空间的`XYZ`区分，所以使用`UV`来代表`XY`。![image-20221102171831018](.\images\image-20221102171831018.png)

立方体比较好理解，但所有`3D`模型都是由面构成的，我们都可以将他们的面展开到一个平面上，通常情况下，是个矩形。![image-20221102172137711](.\images\image-20221102172137711.png)

这叫做`UV`展开。我们可以从几何体的`attributes.UV`属性中看到这些`2D`坐标：

```js
console.log(geometry.attributes.uv)
```

当我们使用**Three.js**中预置的几何体时，这些UV坐标由**Three.js**生成。如果我们要创建自己的**3D**模型并希望使用纹理，则必须对模型进行**UV**展开，指定**UV**坐标。不过不用担心，**3D**建模软件都有这个功能。
<p>
  <img src=".\images\image-20221102172608483.png" alt="uv screenshot" style="border-radius:8px">
</p>

## 纹理自定义设置

我们可以使用`repeat`属性来使贴图重复，`repeat`的`x，y`属性分别代表了在x轴和y轴上的重复次数。

::: tip
`repeat`为向量
:::

```js
const colorTexture = textureLoader.load(
  new URL('../assets/textures/door/color.jpg', import.meta.url).href
)
colorTexture.repeat.x = 2 // x轴上重复两次
colorTexture.repeat.y = 3 // y轴上重复三次
```

<p>
  <img src=".\images\image-20221102173232206.png" alt="screenshot repeat" style="border-radius:8px;margin:0 auto">
</p>

这看上去有点糟糕 :thinking:，但是我们可以用`wrapS` 和`wrapT` 来修复它

这是由于除了设置轴向上的重复次数外，我们还应该设置两个轴向上重复的模式

- `wrapS` 代表x轴上的重复模式
- `wrapT` 代表y轴上的重复模式

```js
// 重复
colorTexture.repeat.x = 2
colorTexture.repeat.y = 3
colorTexture.wrapS = t.RepeatWrapping
colorTexture.wrapT = t.RepeatWrapping
```

<p>
  <img src=".\images\image-20221102183858213.png" alt="screenshot wrap" style="border-radius:8px;margin:0 auto">
</p>

### 镜像

```js
// 镜像
colorTexture.repeat.x = 2
colorTexture.repeat.y = 3
colorTexture.wrapS = t.MirroredRepeatWrapping
colorTexture.wrapT = t.MirroredRepeatWrapping 
```

<p>
  <img src=".\images\image-20221102183937958.png" alt="screenshot Mirrored" style="border-radius:8px;margin:0 auto">
</p>

### 使用offset偏移

使用偏移属性可以改变纹理贴图的起始位置

```js
colorTexture.offset.x = 0.5
colorTexture.offset.y = 0.5
```

<p>
  <img src=".\images\image-20221102181132159.png" alt="screenshot offset" style="border-radius:8px;margin:0 auto">
</p>

### 使用rotation旋转

使用`rotation`属性来改变纹理的旋转角度

```js
colorTexture.rotation = Math.PI * 0.25
```

<p>
  <img src=".\images\image-20221102181400393.png" alt="screenshot rotation" style="border-radius:8px;margin:0 auto">
</p>

这起始就是UV坐标的原点`0,0`。我们可以使用`center`属性来改变旋转的圆心

```js
colorTexture.rotation = Math.PI * 0.25
colorTexture.center.x = 0.5
colorTexture.center.y = 0.5
```

<p style="text-align:center">
  <img src=".\images\image-20221102181533319.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

## 纹理过滤与分级细化

- 当我们把立方体旋转到几乎看不见立方体顶面的角度时，仔细看，此时顶面的纹理是非常模糊的。
- 这是由于我们显示纹理贴图的面的尺寸与纹理图片的尺寸并不一样导致的。在`Three.js`中已经预置好了纹理过滤器`（filter）`和纹理分级细化`（Mipmapping）`相关的算法来帮我们优化这个问题。
- **纹理分级细化**就是将一张纹理图不断以2的倍数缩小直到像素为1时不可再细分，在使用时，根据贴图的面的大小自动选择相近等级的纹理图。

### 缩小过滤器

当纹理图片对于立方体的面来说更大时候，则会启用缩小过滤器。

1. `THREE.NearestFilter`
2. `THREE.LinearFilter`
3. `THREE.NearestMipmapNearestFilter`
4. `THREE.NearestMipmapLinearFilter`
5. `THREE.LinearMipmapNearestFilter`
6. `THREE.LinearMipmapLinearFilter`

默认使用的是`THREE.LinearMipmapLinearFilter`

```js
colorTexture.minFilter = THREE.NearestFilter
```

### 放大过滤器

放大过滤器的工作原理和缩小过滤器是一样的，不同的是它处理的是纹理图片对于立方体的面的尺寸更小的情况。

```js
const textureLoader = new t.TextureLoader()
const colorTexture = textureLoader.load(
  new URL('../assets/textures/checkerboard-8x8.png', import.meta.url).href
)
```

<p style="text-align:center">
  <img src=".\images\image-20221102182710683.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

看上去很模糊，这是因为纹理图片的尺寸只有`8x8`像素，而立方体的一个面要比这个尺寸大很多。我们就可以改变放大过滤器`magFilter`的算法来优化显示效果：

1. `t.NearestFilter`
2. `t.LinearFilter`

```js
colorTexture.magFilter = t.NearestFilter
```

<p style="text-align:center">
  <img src=".\images\image-20221102182748597.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>
<p style="text-align:center">
  <img src=".\images\image-20221102182855620.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

::: warning 注意
当我们的缩小过滤器使用`THREE.NearestFilter`的时候，我们应该将纹理的`Generatempmaps`属性设置为false，这样可以稍微减轻一些`GPU`的负担。
:::

```JS
colorTexture.generateMipmaps = false
colorTexture.minFilter = t.NearestFilter
```

使用前：

<p style="text-align:center">
  <img src=".\images\image-20221102183222245.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

使用后：

<p style="text-align:center">
  <img src=".\images\image-20221102183302794.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

## 纹理图片的格式与优化

当我们需要准备纹理贴图的图片文件时，我们需要注意3个关键因素:

1. 文件大小
   - `jpg`：(有损压缩，但通常文件较小)
   - `png`： (无损压缩，但通常文件较大)
   - 有一些图片压缩的解决方案，可以帮我们在尽可能不降低品质的同时获得更小的文件量，比如`TinyPNG`。
2. 图片尺寸
   - 请尽可能减小图片的尺寸，还记得前面说的图像分级细化吗？`Three.js`将反复产生一半大小的纹理直到像素为1，所以我们常常看到贴图文件的尺寸是`512x512`，`1024x1024`或者`512x2048`....等这些图片尺寸的宽高都是2的倍数，我们可以一直除以2直到最后结果为1。
   - 如果我们使用的纹理图片的宽度或高度不等于2的倍数时，`Three.js`将尝试把它们拉伸到最接近一个2的倍数值。这种拉伸的方式自然是无法获得最佳效果，并且我们还会在控制台中收到警告信息。
3. 文件格式
   - 最好是使用`png`格式，这种格式虽然可能文件量较大，但它将非常完整的保留所有颜色值，包括透明度。但该处理方案不利于**GPU**记载，因为**GPU**还要将其转换为`texture`才能开始渲染
   - 将材质用`Basis Universal`压缩**GPU**纹理技术，该技术支持多种常用的压缩纹理格式，将 png 转换为 basis 文件后，大小与 jpg 格式差不多，但在 GPU 上比 png/jpg 小6-8倍。并且能够很大程度上加快**GPU**的渲染速度
   - 如果导入模型时不是通过导入白模和**UV**贴图的方法时，可以使用`EXT_meshopt_compression`将模型压缩并将纹理压缩为ktx格式

::: tip
**Basis Universal**相关方案可参考 [腾讯ISUS](https://isux.tencent.com/articles/isux-optimizing-3d-model.html) 获得更多的内容
:::
