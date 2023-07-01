# 后期处理 :wrench:

后期处理是指在最终图像（渲染）上添加效果。人们大多在电影制作中使用这种技术，但我们也可以在WebGL中使用。

:::tip 参考
后期处理可以是略微改善图像或者产生巨大影响效果。
下面链接是**Three.js**官方文档中一些关于后期处理的示例：

- [EffectComposer](https://threejs.org/docs/index.html?q=po#examples/en/postprocessing/EffectComposer)
:::

## 准备

我们做好前期的准备工作

```ts:line-numbers
/**
* texture loader
*/
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new t.CubeTextureLoader()

/**
* Update all materials
*/
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof t.Mesh && child.material instanceof t.MeshStandardMaterial) {
            child.material.envMapIntensity = 2.5
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
* Environment map
*/
const environmentMap = cubeTextureLoader.load([
    new URL('../assets/textures/environmentMaps/5/px.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/5/nx.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/5/py.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/5/ny.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/5/pz.jpg', import.meta.url).href,
    new URL('../assets/textures/environmentMaps/5/nz.jpg', import.meta.url).href,
])

scene.background = environmentMap
scene.environment = environmentMap

/**
* Models
*/
gltfLoader.load(
    new URL('../assets/models/DamagedHelmet/glTF/DamagedHelmet.gltf', import.meta.url).href,
    (gltf) => {
        // Model
        gltf.scene.scale.set(2, 2, 2)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        // Update materials
        updateAllMaterials()
    },
)

/**
* Lights
*/
const directionalLight = new t.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, -2.25)
scene.add(directionalLight)
```

## 处理方式

### Render target渲染目标

我们要在称之为**Render target**渲染目标的地方进行渲染而不是在画布**canvas**中渲染，这个**Render target**会给我们一个与寻常纹理非常相似的纹理。简而言之，我们是在屏幕上在纹理中进行渲染而不是在画布上。
:::tip
术语**Render target**为**Three.js**特定用词，其他地方大多是使用**buffer**一词。
:::
该纹理会应用到面向摄影机并覆盖整个视图的平面，该平面使用具有特殊片元着色器的材质，该材质将实现后期处理效果。如后处理效果包括使图像变红，则它将仅乘以该片元着色器中像素的红色值。大多数的后期处理效果只要你有灵感，不仅仅只是调整颜色值而已。在Three.js中这些效果称为**passes**通道。

### Ping-pong buffering乒乓缓冲

在后期处理中，我们可以有多个通道。一个用于运动模糊，一个用于颜色变化，另一个执行景深，等等。正因为我们有多个通道，后期处理需要两个Render target，原因在于我们无法在绘制渲染目标的同时获取其贴图纹理。因此，需要在从第二个渲染目标获取纹理的同时绘制第一个渲染目标，然后在下一个通道，交换这俩个渲染目标，在第二步获取纹理，第一步绘制，然后又到下一个通道，再次交换渲染目标，如此反复。这便是称为乒乓缓冲，两者交替地被读和被写。

:::tip

- 最终的效果不会位于目标中，而是位于画布上，相当于在看向物体的摄像机上放了块蒙版。
- 但这些处理方式都非常消耗电脑的性能。
:::

## EffectComposer效果合成器

`EffectComposer`[效果合成器类](https://threejs.org/docs/index.html?q=eff#examples/zh/postprocessing/EffectComposer)会处理效果目标，进行乒乓缓冲将上个通道的纹理发送到当前通道，在画布上绘制最终效果等全部过程。

<p>
  <img src=".\images\image-20221208143754412.png" style="margin:0 auto;border-radius:8px">
</p>

**步骤1**：导入效果合成器：

```ts
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
```

**步骤2**：我们还需要一个`RenderPass`的通道类，这个通道负责场景的第一次渲染，它会在`EffectComposer`内部创建的渲染目标中进行渲染，而非画布上

```ts
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
```

**步骤3**：我们用`render`实例化`EffectComposer`，并设置与渲染机相同大小的渲染区域

```ts
/**
* Post processing
*/
const effectComposer = new EffectComposer(renderer)
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(sizes.width, sizes.height)
```

**步骤4**：利用相机和场景实例化第一个通道,并将通道添加入`effectComposer`渲染器中

```ts
const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)
```

**步骤5**：在动画渲染函数中使用`effectComposer`来渲染每一帧

```ts
const animate = () => {
    // ...
    // TODO
    renderer.render(scene, camera)
    effectComposer.render()
    // ...
}
animate() // 调用动画函数
```

## 通道

我们可以在`effectComposer`中添加新的[通道](https://threejs.org/docs/index.html?q=eff#examples/zh/postprocessing/EffectComposer)来实现不同的效果

### DotScreenPass黑白光栅效果

```ts
// 导入DotScreenPass通道
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js'

// ... 在renderPass之后加载
const dotScreenPass = new DotScreenPass()
// dotScreenPass.enabled = false 《-- 禁用通道
effectComposer.addPass(dotScreenPass)
```

<p>
  <img src=".\images\image-20221208152038938.png" style="margin:0 auto;border-radius:8px">
</p>

### GlitchPass故障效果

```ts
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'
// ...

const glitchPass = new GlitchPass()
glitchPass.enabled = true
effectComposer.addPass(glitchPass)
```

<p>
  <img src=".\images\image-20221208152138773.png" style="margin:0 auto;border-radius:8px">
</p>

电脑好像被黑客攻击了那样闪烁，我们可以添加`goWild`属性来实现不间断的闪烁

```ts
glitchPass.goWild = true
```

### ShaderPass着色器效果

`ShaderPass`该通道是用于着色器效果,同时需要引入着色器`RGBShiftShader`来实现

```ts
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'

// ...
const rgbShiftPass = new ShaderPass(RGBShiftShader)
effectComposer.addPass(rgbShiftPass)
```

<p>
  <img src=".\images\image-20221208153600472.png" style="margin:0 auto;border-radius:8px">
</p>

我们会发现颜色出现了问题，颜色变暗了许多，这是因为我们之前写的`renderer.outputEncoding = t.sRGBEncoding`这段代码不起作用了,是因为在使用`EffectComposer`他不再使用`sRGBEncoding`，在这个`/node_modules/three/examples/jsm/postprocessing/EffectComposer.js`路径中，有这样一段代码：

```ts
renderTarget = new WebGLRenderTarget( 
    this._width * this._pixelRatio, 
    this._height * this._pixelRatio 
);
```

其中的`WebGLRenderTarget`他的`encoding`默认是`LinearEncoding`并不是`sRGBEncoding`，所以在乒乓缓冲的时候会被剥夺色彩。不过，我们可以通过重设`WebGLRenderTarget`来修复这个问题，并加入到`EffectComposer`渲染器中

```ts
const renderTarget = new t.WebGLRenderTarget(
    800,
    600,
    {
        encoding: t.sRGBEncoding,
    },
)

const effectComposer = new EffectComposer(renderer, renderTarget)
```

在这里我们不需要设置`width`和`height`因为`setSize()`会自动更新渲染区域的大小

我们还会遇到一个问题就是在调整屏幕大小的时候颜色的渲染也会出问题，这时候需要我们在调整屏幕大小时也设置像素大小

```ts
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
effectComposer.setSize(SIZE.width, SIZE.height)
```

### UnrealBloomPass光剑特效

`UnrealBloomPass`这个通道会添加`Bloom`敷霜辉光效果到渲染中，它对重现光热、激光、光剑或放射性物质非常有用

```ts
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'

// ...

const unrealBloomPass = new UnrealBloomPass(new t.Vector2(SIZE.width, SIZE.height), 1.5, 0.4, 0.85)
effectComposer.addPass(unrealBloomPass)
```

<p>
  <img src=".\images\image-20221209153439918.png" style="margin:0 auto;border-radius:8px">
</p>

我们可以使用以下参数来调节画面的亮度：

- `strength`：光的强度
- `radius`：亮度的发散半径
- `threshold`：限制物体开始发光的亮度值

```ts
gui.add(unrealBloomPass, 'enabled')
gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001)
gui.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001)
```

### 修复抗锯齿

<p>
  <img src=".\images\image-20221209145453109.png" style="margin:0 auto;border-radius:8px">
</p>

我们会发现头盔边缘出现锯齿状，我们需要修复这个问题，我们有三种方法来消除锯齿：

  1. 使用一种特定类型的渲染目标`renderTarget`来管理抗锯齿，但这并不适用于所有现代浏览器。
  2. 使用一个通道来做抗锯齿，但是性能较差
  3. 结合前两种选择，看浏览器是否支持那个特定类型的渲染目标，不支持则使用通道去做抗锯齿

#### 抗锯齿通道

- `FXAA`：性能良好，但结果也只是良好，可能会导致模糊
- `SMAA`：效果比FXAA好，但同时性能也消耗大（不要与MSAA搞混了）
- `SSAA`：质量最好，但性能最差
- `TAA`：性能良好但结果有限

```ts
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'

// ...

const smaaPass = new SMAAPass(SIZE.width, SIZE.height)
effectComposer.addPass(smaaPass)
```

<p>
  <img src=".\images\image-20221209145749014.png" style="margin:0 auto;border-radius:8px">
</p>

我们可以看到大部分锯齿被很好的消除掉了

#### 使用多种方式来兼容抗锯齿

- 如果屏幕像素比大于1，我们将使用`WebGLRenderTarget`，不使用抗锯齿通道
- 如果屏幕像素比为1，并且浏览器支持`WebGL 2`，使用`WebGLMultisampleRenderTarget`(现代浏览器已移除)
- 如果屏幕像素比为1，并且浏览器不支持`WebGL 2`，使用`WebGLRenderTarget`并且采用 `SMAAPass`

```ts:line-numbers
let RenderTargetClass = null

// 用.getPixelRatio()方法来活得像素大小，用isWebGL2来判断浏览器是否支持WebGL2
if(renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2)
{
    RenderTargetClass = t.WebGLMultisampleRenderTarget
}
else
{
    RenderTargetClass = t.WebGLRenderTarget
}

const renderTarget = new RenderTargetClass(
    800,
    600,
    {
        minFilter: t.LinearFilter,
        magFilter: t.LinearFilter,
        format: t.RGBAFormat,
        encoding: t.sRGBEncoding,
    },
)
// ...
// const rgbShiftPass = new ShaderPass(RGBShiftShader)
// rgbShiftPass.enabled = true
// effectComposer.addPass(rgbShiftPass)

if(renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2)
{
    const smaaPass = new SMAAPass()
    effectComposer.addPass(smaaPass)
}
```

### 自定义通道

我们可以创建自定义的通道，需要三个属性：

  1. `uniforms`
  2. `vertexShader`：这个顶点着色器几乎总是有相同的代码，会把平面放在视图的前面
  3. `fragmentShader`：主要为后期的效果

**步骤1**：首先我们创建着色器

```ts:line-numbers
const TintShader = {
    uniforms: {
    },
    vertexShader: `
        void main()
        {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        void main()
        {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    `,
}
```

**步骤2**：我们创建着色器通道并应用它

```ts
const tintPass = new ShaderPass(TintShader)
effectComposer.addPass(tintPass)
```

从上一个通道中获得贴图纹理，这个纹理自动存储在名为 `tDiffuse`的`unifom`中。我们必须将这个`unifom`的值设为`null`，效果合成器会更新它，然后在片段着色器中检索该`uniform`

```ts
const TintShader = {
uniforms:
{
    tDiffuse: { value: null }
},

// ...

fragmentShader: `
    uniform sampler2D tDiffuse;

    void main()
    {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }`
}
```

**步骤3**：之后我们去获取模型的`uv`坐标，并用`varying`去传递他，在片段着色器中我们使用`sampler2D`（一个贴图纹理）中获取像素，需要用 `texture2D(...)`方法，它接收贴图纹理作为第一个参数，UV坐标作为第二个参数。

```ts:line-numbers
const TintShader = {

// ...

vertexShader: `
    varying vec2 vUv;

    void main()
    {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        vUv = uv;
    }
`,
fragmentShader: `
    uniform sampler2D tDiffuse;

    varying vec2 vUv;

    void main()
    {
        vec4 color = texture2D(tDiffuse, vUv);
        gl_FragColor = color;
    }`
}
```

<p>
  <img src=".\images\image-20221209161734099.png" style="margin:0 auto;border-radius:8px">
</p>

在这里你会看到一些齿距，不过你在其后面使用`SMAAPASS`通道就可以抗齿距

```ts
// ...const tintPass = new ShaderPass(TintShader)
// ...effectComposer.addPass(tintPass)

const smaaPass = new SMAAPass(SIZE.width, SIZE.height)
effectComposer.addPass(smaaPass)
```

接下来我们就可以修改他的颜色，整个屏幕都会变成红色

```ts:line-numbers
const TintShader = {
    uniforms: {
        tDiffuse: { value: null },
    },
    vertexShader: `
        varying vec2 vUv;
        void main()
        {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            vUv = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;

        varying vec2 vUv;

        void main()
        {
            vec4 color = texture2D(tDiffuse, vUv);
            color.r += 0.1;// [!code focus]
            gl_FragColor = color;
        }
    `,
}
```

<p>
  <img src=".\images\image-20221209162455884.png" style="margin:0 auto;border-radius:8px">
</p>

我们可以使用一个`uniform`参数来控制颜色的变换，并在函数外控制其参数

```ts:line-numbers
const TintShader = {
// ...
uniforms: {
    tDiffuse: { value: null },
    uTint: { value: null }// [!code focus]
},
// ...

fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 uTint;

    varying vec2 vUv;

    void main()
    {
        vec4 color = texture2D(tDiffuse, vUv);
        color.rgb += uTint;// [!code focus]
        
        gl_FragColor = color;
    }`,
}

const tintPass = new ShaderPass(TintShader)
tintPass.material.uniforms.uTint.value = new t.Vector3()
```

我们也可以更改整个页面来产生位移效果

```ts:line-numbers
const DisplacementShader = {
    uniforms:
    {
        tDiffuse: { value: null },
    },
    vertexShader: `
        varying vec2 vUv;

        void main()
        {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

            vUv = uv;
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;

        varying vec2 vUv;

        void main()
        {
            vec4 color = texture2D(tDiffuse, vUv);

            gl_FragColor = color;
        }
    `,
}

const displacementPass = new ShaderPass(DisplacementShader)
effectComposer.addPass(displacementPass)
```

我们是使用`sin()`函数来实现扭曲效果

```ts
const DisplacementShader = {
// ...
fragmentShader: `
    uniform sampler2D tDiffuse;

    varying vec2 vUv;

    void main()
    {
    vec2 newUv = vec2(
        vUv.x,
        vUv.y + sin(vUv.x * 10.0) * 0.1
    );
    vec4 color = texture2D(tDiffuse, newUv);

    gl_FragColor = color;
    }`,
}
```

<p>
  <img src=".\images\image-20221209165435563.png" style="margin:0 auto;border-radius:8px">
</p>

我们也可以给它加点动画效果，比如设置`uTime`

```ts:line-numbers
const DisplacementShader = {
    uniforms:
    {
        tDiffuse: { value: null },
        uTime: { value: null }
    },
    // ...
    fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;

    varying vec2 vUv;

    void main()
    {
        vec2 newUv = vec2(
            vUv.x,
            vUv.y + sin(vUv.x * 10.0) * 0.1
        );
        vec4 color = texture2D(tDiffuse, newUv);

        gl_FragColor = color;
    }`,
}

const displacementPass = new ShaderPass(DisplacementShader)
// 设置属性
displacementPass.material.uniforms.uTime.value = 0
effectComposer.addPass(displacementPass)

// 在渲染函数中调用
const clock = new THREE.Clock()
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update passes
    displacementPass.material.uniforms.uTime.value = elapsedTime

    // ...
}
```

<p>
  <img src=".\images\image-20221209170000131.png" style="margin:0 auto;border-radius:8px">
</p>

### 蜂巢

我们还可以使用贴图

<p>
  <img src=".\images\interfaceNormalMap.png" style="margin:0 auto;border-radius:8px">
</p>

**步骤1**：导入法线贴图

```ts:line-numbers
const TintShader = {
uniforms: {
    tDiffuse: { value: null },
    uNormalMap: { value: null },
},
vertexShader: `
    varying vec2 vUv;
    void main()
    {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

        vUv = uv;
    }`,
fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D uNormalMap;

    varying vec2 vUv;

    void main()
    {
    vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
    vec2 newUv = vUv + normalColor.xy * 0.1;
    vec4 color = texture2D(tDiffuse, newUv);

    gl_FragColor = color;
    }`,
}

const tintPass = new ShaderPass(TintShader)
tintPass.material.uniforms.uNormalMap.value = textureLoader.load(new URL('../assets/textures/interfaceNormalMap.png', import.meta.url).href)
effectComposer.addPass(tintPass)
```

<p>
  <img src=".\images\image-20221209171452768.png" style="margin:0 auto;border-radius:8px">
</p>

**步骤2**：他会有玻璃的质感我们可以在添加上光线以更好的展示

```ts:line-numbers
fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D uNormalMap;

    varying vec2 vUv;

    void main()
    {
    vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
    vec2 newUv = vUv + normalColor.xy * 0.1;
    vec4 color = texture2D(tDiffuse, newUv);

    vec3 lightDirection = normalize(vec3(- 1.0, 1.0, 0.0));
    float lightness = clamp(dot(normalColor, lightDirection), 0.0, 1.0);
    color.rgb += lightness * 2.0;

    gl_FragColor = color;
    }`,
```

<p>
  <img src=".\images\image-20221209171604410.png" style="margin:0 auto;border-radius:8px">
</p>
