# 导入模型 :t-rex:

3D 模型有各种各样的格式，详情可参考维基百科[List_of_file_formats#3D_graphics](https://en.wikipedia.org/wiki/List_of_file_formats#3D_graphics)。这些格式各有特点。接下来我们列举一些比较常见和流行的。

- OBJ
- FBX
- STL
- PLY
- COLLADA
- 3DS
- GLTF

::: tip
我们不用关心所有的模型。因为 `GLTF` 模型已经逐渐变为标准，并且能应对绝大部分你遇到的场景。
:::

## GLTF格式

- GLTF 是 GL Transmission Format 的缩写。由 Khronos Group 创造（他们还创造了 OpenGL, WebGL, Vulkan, Collada 并且有很多成员在 AMD / ATI, Nvidia, Apple, id Software, Google, Nintendo, etc 公司 ）。
- GLTF 在近些年已经变得越来越流行。它可以支持各种数据集，你可以在其格式中使用几何体和材质，同时也可以包含相机、光照、场景、动画、骨骼等。同时支持各种文件格式，例如 json、二进制 binary、embed texture 嵌入纹理等。
- GLTF 已经成为了实时渲染的标准，并且也正在成为大部分3D软件、游戏引擎和库的标准模型。这意味着你可以轻松的在各个环境中熟练使用它。
- 但这并不是说 GLTF 可以覆盖所有场景，如果你仅仅是需要一个几何体，那么可以选择
<u>OBJ、FBX、STL 或 PLY 格式</u>。

## GLTF formats

GTLF是一种格式，但里面还包括了其它格式的文件

<p>
  <img src=".\images\image-20221121104622740.png" style="margin:0 auto;border-radius:8px">
</p>

1. glTF

    glTF 是默认格式。`Duck.gltf` 是一个 JSON 文件。包含了各种信息，包含相机、光照、场景、材质等，但没有几何体或纹理贴图。`Duck0.bin` 是一个二进制文件。通常包含了几何体和UV贴图坐标、法线坐标等。`DuckCM.png` 是鸭子的纹理贴图。当我们载入 `Duck.gltf` 时，它会自动载入其他两个文件。

2. glTF-Binary

    包含了所有上述的数据，是个二进制文件，不能直接打开。这个文件格式会更轻量化一些，只有一个文件，也易于载入。但不太方便修改内部的数据。例如你想修改纹理贴图，换一张更压缩的贴图时，就会比较麻烦，因为这些数据都是被集合在了一起，同一个二进制文件中。

3. glTF-Draco

    有点像说的第一个格式，不过使用了 [Draco algorithm](https://github.com/google/draco) 来压缩几何体的数据。如果你对比 `.bin` 文件的大小，你就会发现这个会更小一点。

    <p>
      <img src=".\images\image-20221121105204721.png" style="width:50%;border-top-left-radius:8px;border-bottom-left-radius:8px;float:left">
      <img src=".\images\image-20221121105301620.png" style="width:50%;border-top-right-radius:8px;border-bottom-right-radius:8px"/>
    </p>

4. glTF-Embedded

    这个格式有点像 `glTF-Binary` 因为也是只有一个文件。但这个文件是一个 JSON 因此你可以在编辑器里打开。

::: tip

根据不同场景做出不同的选择才是最优方案。

- 如果你想修改 textures 或导出的光线坐标，最好选择第一个默认的 `glTF`。它还具有分别加载不同文件的优势，从而提高了加载速度。

- 如果想要每个模型一个文件，并且不关心模型内的素材修改，那么二进制 `glTF-Binary` 更适合。

或在性能提升方面您都必须决定是否要使用 Draco 压缩
:::

## 使用模型

- 可以在[glTF-Sample-Models](https://github.com/KhronosGroup/glTF-Sample-Models)中找到开源的模型进行测试

### GLTFLoader

我们使用**GLTFLoader**来导入模型，并在每个回调函数中进行相关的操作

**步骤1**：导入模型

```ts:line-numbers
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const gltfLoader = new GLTFLoader()
gltfLoader.load(
  new URL('../assets/models/Duck/glTF/Duck.gltf', import.meta.url).href,
  (gltf) => {
    console.log('success')
    console.log(gltf)
  },
  (progress) => {
    console.log('progress')
    console.log(progress)
  },
  (error) => {
    console.log('error')
    console.log(error)
  },
)
```

<p>
  <img src=".\images\image-20221121112420077.png" style="margin:0 auto;border-radius:8px">
</p>
<p>
  <img src=".\images\image-20221121112510061.png" style="margin:0 auto;border-radius:8px">
</p>

**步骤2**：添加模型到场景中

<p>
  <img src=".\images\image-20221121131834587.png" style="margin:0 auto;border-radius:8px">
</p>

我们主要使用一下几种方式将模型添加进场景中

1. 将模型的整个 scene 添加到我们的场景里。虽然它的名字是 scene，实际上是一个 Three.Group
2. 将 scene 下的 children 添加到我们自己的 scene 中，并忽略用不到的 PerspectiveCamera
3. 过滤 children 的内容，移除掉不需要的对象，如 PerspectiveCamera
4. 仅添加 Mesh 到场景里，但有可能会有错误的缩放、位置、角度等问题
5. 打开 3D 软件将 PerspectiveCamera 移除，再重新导出模型

 在这里我们使用第二种方法，因为小黄鸭的模型很简单

```ts:line-numbers
const gltfLoader = new GLTFLoader()
gltfLoader.load(
  // new URL('../assets/models/Duck/glTF/Duck.gltf', import.meta.url).href,
  // new URL('../assets/models/Duck/glTF-Binary/Duck.glb', import.meta.url).href,
  new URL('../assets/models/Duck/glTF-Embedded/Duck.gltf', 
  import.meta.url).href,

  (gltf) => {
    scene.add(gltf.scene.children[0])
  }
)
```

<p>
  <img src=".\images\image-20221121132829339.png" style="margin:0 auto;border-radius:8px">
</p>

我们尝试其它的格式来渲染小黄鸭，除了 Draco 压缩格式外，其他都生效了，效果如上图。Draco 我们后续会说的，它需要一个特殊的 loader

我们再试试其它的模型，比如飞行员的头盔

```ts:line-numbers
const gltfLoader = new GLTFLoader()
gltfLoader.load(
    new URL('../assets/models/FlightHelmet/glTF/FlightHelmet.gltf', 
    import.meta.url).href,

    (gltf) => {
      scene.add(gltf.scene.children[0])
    },
)
```

<p>
  <img src=".\images\image-20221121133342225.png" style="margin:0 auto;border-radius:8px">
</p>

他好像出了点问题，只渲染了眼镜...

<p>
  <img src=".\images\image-20221121134011799.png" style="margin:0 auto;border-radius:8px">
</p>

我们发现他的 children 中有6个网格，我们只添加了一个网格模型，所以我们需要遍历这个网格模型以得到所有的模型原件

```ts
const gltfLoader = new GLTFLoader()
gltfLoader.load(
  new URL('../assets/models/FlightHelmet/glTF/FlightHelmet.gltf', 
  import.meta.url).href,

  (gltf) => {
    for (const child of gltf.scene.children)
      scene.add(child)
  },
)
```

<p>
  <img src=".\images\image-20221121134515589.png" style="margin:0 auto;border-radius:8px">
</p>

这里好像还是有些问题，这个模型只加载一部分，这是因为当使用`scene.add(child)`时，`gltf.scene.children`中的`Mesh`会被取出来添加进`scene`中，导致循环到第三次是就结束了，所以我们换种写法

```ts
const gltfLoader = new GLTFLoader()
gltfLoader.load(
  new URL('../assets/models/FlightHelmet/glTF/FlightHelmet.gltf', 
  import.meta.url).href,

  (gltf) => {
    const children = [...gltf.scene.children] // 浅拷贝
    for (const child of children)
      scene.add(child)
  },
)
```

<p>
  <img src=".\images\image-20221121140759033.png" style="margin:0 auto;border-radius:8px">
</p>

或者我们有更简单的方法

```ts
const gltfLoader = new GLTFLoader()
gltfLoader.load(
  new URL('../assets/models/FlightHelmet/glTF/FlightHelmet.gltf', 
  import.meta.url).href,

  (gltf) => {
    scene.add(gltf.scene) // 直接将整个模型场景添加进场景中
  },
)
```

### DRACOLoader

当我们想要使用`glTF-Draco`压缩的模型时，我们得使用 DRACOLoader 来解压，Draco 压缩有如下这些特点：

1. Draco 压缩可以比默认的模型 size 更小
2. 压缩被应用在了 buffer data 中，尤其是几何体部分
3. Draco 不是 glTF 特有的，但是 glTF 和 Draco 同时流行起来，所以 glTF 导出器实现了 Draco 的导出
4. Google 创造的开源压缩算法
5. Draco 的解压器也有 Web Assembly 的实现版本，这意味着可以多线程解压 Draco 模型（worker 线程中完成），得到更好的性能

**步骤1**：导入 DRACOLoader 来使用

在使用前我们需要先使用`DRACO`解压器这个已经被封装在`THREEJS`当中，其的路径如下：`node_modules/three/examples/js/libs/draco`我们把这个文件**放到根路径中及静态资源文件夹中**，他能多线程的解压模型

```ts:line-numbers
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
// 实例化解码器
const dracoLoader = new DRACOLoader()
// 指定包含WASM/JS解码库的文件夹的路径
dracoLoader.setDecoderPath('/draco/')
// 预取Draco WASM/JS模块
dracoLoader.preload()
const gltfLoader = new GLTFLoader()
// 挂载dracoLoader
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load(
  new URL('../assets/models/Duck/glTF-Draco/Duck.gltf', 
  import.meta.url).href,

  (gltf) => {
    scene.add(gltf.scene)
  },
)
```

什么时候该使用`Draco`来压缩模型？

  虽然看起来 Draco 压缩是双赢的局面，但事实并非如此。确实，它会让几何图形更轻轻量化，但首先必须加载 DRACOLoader 类和解码器。其次，计算机需要花费时间和资源来解码压缩文件，这可能会导致体验开始时出现短暂的冻结，即使我们使用的是 worker 和 Web Assembly 代码。

所以必须适应并决定最佳解决方案是什么。如果你只有一个几何尺寸为 100kB 的模型，可能不需要 Draco。但是，如果你有许多 MB 的模型要加载并且不关心体验开始时的一些冻结，你可能需要 Draco 压缩。

### MeshoptDecoder

使用`MeshoptDecoder`解码**EXT_meshopt_compression**

**步骤1**：导入`MeshoptDecoder`解码器

```ts
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
```

**步骤2**：配合`gltfLoader`使用

```ts
const gltfLoader = new GLTFLoader()
gltfLoader.setMeshoptDecoder(MeshoptDecoder)
gltfLoader.load('/modules/plane_pack_opt.glb',
  (gltf) => {
    console.log('success')
    console.log(gltf)
    scene.add(gltf.scene)
})
```

#### 使用KTX2Loader

> Basis Universal is a "[supercompressed](http://gamma.cs.unc.edu/GST/gst.pdf)" GPU texture and texture video compression system that outputs a highly compressed intermediate file format (.basis) that can be quickly transcoded to a wide variety of GPU texture compression formats.
>
> Basis Universal texture data may be used in two different file formats: `.basis` and `.ktx2`, where `ktx2` is a standardized wrapper around basis texture data.

上面的应用来自[basis_universal](https://github.com/BinomialLLC/basis_universal)的官方，`.ktx2` 与 `.basis` 纹理存储格式是一种GPU非常喜欢的编码形式，而**Basis Universal**是一种压缩技术，他能根据你本机上不同的GPU来解压`.ktx2`与`.basis`的格式的图片以最大程度的适用当前的GPU

整体的思路是我们使用`gltfpack`来压缩模型与贴图，之后使用`KTX2Loader`来解压贴图

**步骤1**：压缩模型(采用Opt格式，采用ktx纹理)

```bash
gltfpack -i jd_elecMudule.glb -o jd-vpvtcctc.glb -vp 16 -vt 12 -cc -tc
```

我们各个参数的用法：

```bash

> -c:生成压缩的gltf/glb文件(-cc以获得更高的压缩比)
> 材质:
> -tc :使用BasisU超压缩将所有纹理转换为KTX2(使用BasisU / toktx可执行文件)
> -tu:当编码纹理时使用UASTC(更高的质量和更大的尺寸)
> -tq N:设置纹理编码质量(默认值:8;N应该在1到10之间
> -ts R:根据比例R缩放纹理尺寸(默认为1;R应该在0和1之间)
> -tp:调整纹理大小到最接近2的幂，以符合WebGL1的限制
> 简化:
> -si R:简化网格以达到比例R(默认为1;R应该在0和1之间)
> -sa:不计质量，积极简化目标比率
> 顶点:
> -vp N:使用N位量化的位置(默认:14;N应该在1到16之间)
> -vt N:使用N位量化纹理坐标(默认:12;N应该在1到16之间)
> -vn N:使用N位量化法线和切线(默认:8;N应该在1到16之间)
> -vc N:使用N位量化颜色(默认:8;N应该在1到16之间)
> 动画:
> -at N:使用N位量化转换(默认值:16;N应该在1到24之间)
> -ar N:使用N位量化旋转(默认:12;N应该在4到16之间)
> -as N:使用N位量化的规模(默认值:16;N应该在1到24之间)@iñ tEâ1iX
> -af N:以N Hz重采样动画(默认值:30)#压缩glb
> -cc 表示Opt压缩 ,
> -tc 表示贴图压缩KTX格式
```

**步骤2**：使用`KTX2Loader`来解压纹理

1. 引入相关的代码库

    ```ts
    // 用于传输模型
    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
    // 用于解压模型
    import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
    // 用于解压纹理
    import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js'
    ```

2. 在使用**Basis Universal texture**之前先要将`Threejs`自带的解压文件，该路径如下`\node_modules\three\examples\jsm\libs\basis`，将其拿出来放到静态资源文件夹下

使用`KTX2Loader`解析压缩的图片以及使用`MeshoptDecoder`来解压模型

```ts
// 使用KTX2Loader并设置使用basis文件夹下的工具来解压贴图
const ktx2Loader = new KTX2Loader().setTranscoderPath('/basis/').detectSupport(renderer)
// 使用gltfLoader来加载模型
const gltfLoader = new GLTFLoader()
// 挂载用于解压贴图的KTX2Loader
gltfLoader.setKTX2Loader(ktx2Loader)
// 挂载用于解压模型的MeshoptDecoder
gltfLoader.setMeshoptDecoder(MeshoptDecoder)
gltfLoader.load(
  '/modules/jd_compress/jd-vpvtcctc.glb',
  // 模型加载完成
  (gltf) => {
    console.log(gltf)
    // 直接加载模型
    scene.add(gltf.scene)
  },
  // 模型加载
  (xhr) => {
    console.log(xhr)
  },
  // 模型加载出错
  (error) => {
    console.log(error)
  })
```

- [threejs关于模型的格式介绍,模型转换,模型压缩,模型加载的相关总结](https://blog.csdn.net/qq_42987283/article/details/122728409?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_baidulandingword~default-0-122728409-blog-126737554.235^v31^pc_relevant_default_base3&amp;spm=1001.2101.3001.4242.1&amp;utm_relevant_index=3)

## 使用动画

**步骤1**：首先我们导入模型，并控制下比例

```ts
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
const gltfLoader = new GLTFLoader()
gltfLoader.load(
    new URL('../assets/models/Fox/glTF/Fox.gltf', import.meta.url).href,
    (gltf) => {
        gltf.scene.scale.set(0.03, 0.03, 0.03)
        scene.add(gltf.scene)
    },
)
```

<p>
  <img src=".\images\image-20221121181037579.png" style="margin:0 auto;border-radius:8px">
</p>

我们可以使用[`AnimationMixer`](https://threejs.org/docs/#api/zh/animation/AnimationMixer)来用于场景中特定对象的动画的播放，当场景中的多个对象独立动画时，每个对象都可以使用同一个动画混合器。

```ts:line-numbers
let mixer: t.AnimationMixer | null = null
const gltfLoader = new GLTFLoader()
gltfLoader.load(
  new URL('../assets/models/Fox/glTF/Fox.gltf', import.meta.url).href,
  (gltf) => {
      gltf.scene.scale.set(0.03, 0.03, 0.03)
      scene.add(gltf.scene)
      mixer = new t.AnimationMixer(gltf.scene)
      const action = mixer.clipAction(gltf.animations[2])
      action.play()
  },
)
// ...
let previousTime = 0
const clock = new t.Clock() // 从初始化时就开始运行
// animate()
const animate = () => {
  // ...
  const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime
  // TODO
  mixer?.update(deltaTime) // 需要在帧里更新动画
  // ...
}
animate() // 调用动画函数
```

## 线上调试

::: tip
我们可以使用[`ThreeJs Editor`](https://threejs.org/editor/)进行线上调试
:::

## 模型粒子化

**步骤1**：导入模型

1. 导入`GLTF`加载器

    ```ts
    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
    ```

2. 使用`GLTF`加载器

    ```ts
    const gltfLoader = new GLTFLoader()
    ```

3. 使用`gltfLoader.load()`导入模型

    ```ts
    gltfLoader.load(
      new URL('../assets/models/LeePerrySmith/LeePerrySmith.glb', 
      import.meta.url).href,

      (gltf) => {
        console.log(gltf)
      },
    )
    ```

    其顶点的数据在`scene`之下的`children`中的`attributes`的`position`中
    <p>
      <img src=".\images\image-20230127215954533.png" style="margin:0 auto;border-radius:8px">
    </p>

**步骤2**：利用`gltf.scene.traverse`遍历场景中的属性，并获得顶点数组存储在一个通用的数组里

```ts:line-numbers
const arrays: number[] = []
gltfLoader.load(
new URL('../assets/models/LeePerrySmith/LeePerrySmith.glb', 
import.meta.url).href,

  (gltf) => {
    gltf.scene.traverse((child) => {
      if (child instanceof t.Mesh) {
        const { array } = child.geometry.attributes.position
        console.log(array)
      }
    })
  },
)
```

**步骤3**：使用加载管理器

因为加载是异步的，所以需要一个管理器来统一加载，并将管理器放入加载器中

```ts
const manager = new t.LoadingManager()

// ...
const gltfLoader = new GLTFLoader(manager)
```
