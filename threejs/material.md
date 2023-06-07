# 材质Material :roll_of_paper:

## 基础材质`MeshBasicMaterial`

### map

`map`属性可以在实例化材质时传递参数，也可以在创建后再来更改这些属性

```js
const material = new t.MeshBasicMaterial({ map: colorTexture })
// 也可以作为属性来更改
const material = new t.MeshBasicMaterial()
material.map = colorTexture
```

<p>
  <img src=".\images\image-20221104152537243.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

### color

`color`颜色属性将在几何体上的表面上设置统一的颜色。

```js
material.color = new.Color('#ff0000')
material.color = new.Color('#f00')
material.color = new.Color('red')
material.color = new.Color('rgb(255, 0, 0)')
material.color = new.Color(0xff0000)
```

<p>
  <img src=".\images\image-20221104152652145.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

将`map`和`color`属性连用

```js
material.map = colorTexture
material.color = new Color('#ff0000')
```

<p>
  <img src=".\images\image-20221104152835689.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

### wireframe

可以显示几何图形的网格`wireframe`，无论摄像机的距离是多少网格线都是1像素宽

```js
material.wireframe = true
```

<p>
  <img src=".\images\image-20221104153128076.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

### opcity

`opcity`透明度属性必须和`transparency`属性同时使用，用于设置材质的透明度，取值0-1，0表示完全透明，1表示不透明

```js
material.transparent = true
material.opacity = 0.5
```

<p>
  <img src=".\images\image-20221104153531313.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

### alphaMap

除了`opacity`属性整体设置材质的透明度外，我们还可以使用`alphaMap`透明度贴图让材质的个别部分透明，也就是小于一定`alpha`值的贴图部分是透明的

```js
material.transparent = true
material.alphaMap = doorAlphaTexture
```

<p>
  <img src=".\images\image-20221104154310979.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

### side

三维世界中的几何体是由面组成的，而一个面也分为正面和反面，默认情况下，`ThreeJS`只渲染**正面**（注意：并非面向摄像机的面为正面）我们可以设置`side`面渲染属性来绝对到底是正面渲染还是背面渲染

```js
// 默认渲染的是正面
material.side = t.DoubleSide // 双面渲染
material.side = t.BackSide  // 背面渲染
```

## 法线材质`MeshNormalMaterial`

`MeshNormalMaterial`法线材质可以显示出漂亮的紫色，蓝色，绿色，看起来像我们在上一节纹理贴图小节中看到的法线纹理贴图一样。这不是巧合，因为两者都与我们所说的法线有关：

  ```js
  const material = new t.MeshNormalMaterial()
  ```

<p>
  <img src=".\images\image-20221104155146768.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

**法线**就是始终垂直于平面的一根线，也就代表了面的朝向。而在三维引擎中，每个顶点都有法线信息.

<p>
  <img src=".\images\image-20221104155739631.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

- 法线既代表了顶点的朝向，那自然就可以用于计算机如何反射光线和折射光线
- 当使用`MeshNormalMaterial`时，*颜色只会显示照相机看向的那个方向*

::: tip
除了`wireframe`、`opcity`等基础属性，`MeshBasicMaterical`还可以使用`flatShading`平面着色
:::

```js
material.flatShading = true
```

<p>
  <img src=".\images\image-20221104160741588.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

## 材质捕捉`MeshMatcapMaterial`

这个名字有点绕口，但`Matcap`的确是由`Material`和`Capture`两个单词组合而成，其意思就是材质捕捉，它是一种很棒的材质，效果很不错的同时在性能非常好。

渲染通常需要几何体、光源、材质、shader 的共同参与。而`matcap` 是将光源、材质信息在**3D**建模软件中直接**烘焙**到一张纹理贴图上，渲染时直接拿来用即可，计算量自然大大减少，性能提升明显。我们还可以很方便的在不同的 `matcap` 纹理之间切换，看上去就和切换材质一样。

- 使用`MeshMatcapMaterial`材质时必须使用一个看起来像球体的参考纹理贴图。材质将根据相对于相机的法线方向在纹理贴图上提取颜色。

<p>
  <img src=".\images\image-20221104161300807.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

```js
const material = new t.MeshMatcapMaterial()
material.matcap = matcapTexture
```

<p>
  <img src=".\images\image-20221104161700180.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

看上去有一些面好像被光照亮了，但其实并不需要任何的光照计算，不过有一个问题，由于光照和材质信息是预先烘焙到纹理贴图上的，所以无论相机方向如何改变，灯光如何调整角度，它看上去的效果是一样的。

::: info
可以在 [GitHub matcaps](https://github.com/nidorx/matcaps) 里可以找到更多的纹理贴图
:::

## 深度材质`MeshDepthMaterial`

`MeshDepthMaterial`这种材质的外观不是由光照或者某个材质决定，而是由物体到相机的远近距离决定，当物体离相机较近时会呈现白色，较远时会呈现黑色。

```js
const material = new t.MeshDepthMaterial()
```

<p>
  <img src=".\images\image-20221104163151342.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

我们可以使用这种材质来观测几何体和相机的距离

## 光照材质`MeshLambertMaterial`

添加环境光源与点光源

```js
/**
 * Lights
 */
const ambientLight = new t.AmbientLight(0xFFFFFF, 0.5) // 环境光源
const pointLight = new t.PointLight(0xFFFFFF, 0.5) // 点光源
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(ambientLight, pointLight)
```

`MeshLambertMaterial`是对光产生的反应材质

```js
const material = new t.MeshLambertMaterial()
```

<p>
  <img src=".\images\image-20221104163836633.png" alt="screenshot center" style="border-radius:8px;margin:0 auto">
</p>

## Phong式材质`MeshPhongMaterial`

`Phong`是20世纪70年代被提出的一种渲染逼真光照效果的算法，以作者`Bui Tuong Phong`的姓氏命名。

`MeshPhongMaterial`则是应用这种算法的材质。效果和`MeshLambertMaterial`类似，但光影明暗过度更加自然，性能的消耗也略高于`MeshLambertMaterial`。

图一为`MeshLambertMaterial`材质，图二为`MeshPhongMaterial`材质，效果上图一比图二更润

<p>
  <img src=".\images\image-20221104165650471.png" style="border-top-left-radius: 0.5rem;border-bottom-left-radius: 0.5rem;width:50%;float:left">
  <img src=".\images\image-20221104165852036.png" style="border-top-right-radius: 0.5rem;border-bottom-right-radius: 0.5rem;width:50%;">
</p>

### shininess

可以使用`shininess`亮度属性来控制光的反射，值越大表面越亮

```js
material.shininess = 100
```

图一为默认亮度，图二为300亮度，图二更加有光泽

<p>
  <img src=".\images\image-20221104170312200.png" style="border-top-left-radius: 0.5rem;border-bottom-left-radius: 0.5rem;width:50%;float:left">
  <img src=".\images\image-20221104170437574.png" style="border-top-right-radius: 0.5rem;border-bottom-right-radius: 0.5rem;width:50%;">
</p>

### specular

可以使用`specular`来改变反射的颜色

```js
material.specular = new THREE.Color(0x1188ff)
```

<p>
  <img src=".\images\image-20221104170910225.png" style="border-top-left-radius: 0.5rem;border-bottom-left-radius: 0.5rem;width:50%;float:left">
  <img src=".\images\image-20221104170932320.png" style="border-top-right-radius: 0.5rem;border-bottom-right-radius: 0.5rem;width:50%;">
</p>

## 卡通材质`MeshToonMaterial`

`MeshToonMaterial`卡通材质的可以让我们的几何体表现出2次元卡通的风格，俗称3渲2：

```js
const material = new t.MeshToonMaterial()
```

<p>
  <img src=".\images\image-20221104171224796.png" style="border-radius:8px;">
</p>

### gradientMap

默认情况下，我们只能看到两种的颜色 (一个用于暗面，一个用于亮面)。如果想要更多的颜色过度，可以使用`gradientMap`属性并加载`gradientTexture`：

```js:line-numbers
const textureLoader = new t.TextureLoader()
// 使用贴图

// Vite
const colorTexture = textureLoader.load(
  new URL('../assets/textures/gradients/3.jpg', import.meta.url).href
)
// Vue
const colorTexture = textureLoader.load(
  require('../assets/textures/gradients/3.jpg')
)

const material = new t.MeshToonMaterial()
  material.gradientMap = colorTexture
```
  
<p>
  <img src=".\images\image-20221104171921823.png" style="border-radius:8px;">
</p>

如果我们直接设置`gradientMap`，会发现卡通效果失效了，明暗过度太丝滑了。这是因为我们使用的梯度纹理很小，这和我们在纹理贴图小节中了解过的`minFilter`，`magFilter`和`mipmapping`有关系。
  
  ```js
gradientTexture.minFilter = t.NearestFilter  // 设置最小过滤器
gradientTexture.magFilter = t.NearestFilter  // 设置最大过滤器
gradientTexture.generateMipmaps = false
```

<p>
  <img src=".\images\image-20221104172746386.png" style="border-radius:8px;">
</p>

  可以通过选择5种颜色过度的贴图

```js:line-numbers
const textureLoader = new t.TextureLoader()
const colorTexture = textureLoader.load(
  new URL('../assets/textures/gradients/5.jpg', import.meta.url).href
)
colorTexture.minFilter = t.NearestFilter// 设置最小过滤器
colorTexture.magFilter = t.NearestFilter// 设置最大过滤器
colorTexture.generateMipmaps = false
```

<p>
  <img src=".\images\image-20221104172953221.png" style="border-radius:8px;">
</p>

## 标准材质`MeshStandardMaterial`

`MeshStandardMaterial`标准材质使用**基于物理规则**的渲染原理，就是我们在纹理课中了解过的`PBR`。之所以被称之为标准，是因为`PBR`已经成为很多`3D`渲染引擎的标准，而无论你在任何软件，引擎中使用标准材质时，得到的结果都是一样的。

像`MeshLambertMaterial`和`MeshPhongMaterial`一样，标准材质必须有灯光参与，有更加逼真的光影明暗过度和更多的参数，比如粗糙度`roughness`和金属度`metalness`。

  ```js
  const material = new t.MeshStandardMaterial()
  ```

<p>
  <img src=".\images\image-20221104173319524.png" style="border-radius:8px;">
</p>

我们可以调节粗糙度`roughness`和金属度`metalness`来观察

```js
material.metalness = 0.45 // 金属度，值越大越黑
material.roughness = 0.65 // 粗糙度，值越小越光滑
```

<p>
  <img src=".\images\image-20221104173445652.png" style="border-radius:8px;">
</p>

## 物理材质`MeshPhysicalMaterial`

物理材质`MeshPhysicalMaterial`是`MeshStandardMaterial`的扩展或者说加强版，提供更高级的基于物理的渲染属性，比如：

### Clearcoat

清漆属性`Clearcoat`：有一些材料 (例如汽车油漆，碳纤维和潮湿的表面) 需要在另一层可能不规则或粗糙的表面上的透明反射层。`Clearcoat`可以实现近似的效果，而不需要单独的透明表面。基于物理的透明度、更优秀的反射

图一为`Clearcoat = 0`,图二为`Clearcoat = 1`的效果

<p>
  <img src=".\images\image-20221104180909749.png" style="border-top-left-radius: 0.5rem;border-bottom-left-radius: 0.5rem;width:50%;float:left">
  <img src=".\images\image-20221104180933865.png" style="border-top-right-radius: 0.5rem;border-bottom-right-radius: 0.5rem;width:50%">
</p>

## Point材质`PointMaterial`

粒子效果

## 着色器材质`ShaderMaterial`

着色器材质`ShaderMaterial`和原始着色器材质`RawShaderMaterial`都可以用来创建自己的材质。

## 环境贴图

环境贴图的作用就是在几何体的面上反射周围的环境，结合各种材质使用可以非常快速的构建“真实感”。

### envMap

要在材质中添加环境纹理贴图，必须使用`envMap`属性。`Three.js`目前只支持`cube`类型的环境纹理贴图，想象一下自己身在一个盒子里，要反射的就是盒子内部的六个面。

::: tip

- 要加载环境纹理贴图，必须使用`CubeTextureLoader`而不是`TextureLoader`。
- 注意，`cubeTextureLoader.load`的参数是一个数组。
:::

### 代码示例

```js:line-numbers
const material = new t.MeshStandardMaterial()
material.metalness = 0.7 // 设置金属度
material.roughness = 0.2 // 设置粗糙度
const gui = new dat.GUI({ closed: true, width: 400 }) // 设置关闭与宽度
gui.add(material, 'metalness').min(0).max(1).step(0.0001) // 添加debug
gui.add(material, 'roughness').min(0).max(1).step(0.0001)

const cubeTextureLoader = new t.CubeTextureLoader()  // 环境纹理贴图
// 需要包含前后左右上下有个方向，选择下4组中其一即可
const environmentMapTexture = cubeTextureLoader.load([
    new URL('../assets/textures/environmentMaps/0/px.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/0/nx.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/0/py.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/0/ny.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/0/pz.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/0/nz.jpg', import.meta.url).href,

    new URL('../assets/textures/environmentMaps/1/px.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/1/nx.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/1/py.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/1/ny.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/1/pz.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/1/nz.jpg', import.meta.url).href,

    new URL('../assets/textures/environmentMaps/2/px.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/2/nx.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/2/py.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/2/ny.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/2/pz.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/2/nz.jpg', import.meta.url).href,

    new URL('../assets/textures/environmentMaps/3/px.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/3/nx.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/3/py.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/3/ny.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/3/pz.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/3/nz.jpg', import.meta.url).href,
])
material.envMap = environmentMapTexture // 使用环境贴图
```

<p>
  <img src=".\images\image-20221104183558708.png" style="border-radius:8px;margin:0 auto">
</p>
