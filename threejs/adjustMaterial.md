# 调整内置材质 :moyai:

我们可以对`THREEJS`的内置材质，如：`MeshStandardMaterial`经行处理，我们可以往里面添加顶点动画，有两种方法可以做到：

1. 通过在编译着色器前触发Three.js钩子，可以让我们处理着色器并注入自己的代码。
2. 重新创建一个全新材质，使用与Three.js写的代码相同的参数，然后再加上我们自己的参数。

## 准备

先做一个准备工作导入模型，导入场景

```ts:line-numbers
/**
 * texture loader
 */
const textLoader = new t.TextureLoader()
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new t.CubeTextureLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () => {
    scene.traverse((child) => {
        if (child instanceof t.Mesh && child.material instanceof t.MeshStandardMaterial) {
            child.material.envMapIntensity = 1
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
environmentMap.encoding = t.sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap

/**
 * Material
 */

// Textures
const mapTexture = textLoader.load(
    new URL('../assets/models/LeePerrySmith/color.jpg', import.meta.url).href
)
mapTexture.encoding = t.sRGBEncoding

const normalTexture = textLoader.load(
    new URL('../assets/models/LeePerrySmith/normal.jpg', import.meta.url).href
)

// Material
const material = new t.MeshStandardMaterial({
    map: mapTexture,
    normalMap: normalTexture,
})

/**
 * Models
 */
gltfLoader.load(
    new URL('../assets/models/LeePerrySmith/LeePerrySmith.glb', import.meta.url).href,
    (gltf) => {
        // Model
        const mesh = gltf.scene.children[0] as t.Mesh
        mesh.rotation.y = Math.PI * 0.5
        mesh.material = material
        scene.add(mesh)

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
directionalLight.position.set(0.25, 2, -2.25)
scene.add(directionalLight)

const renderer = new t.WebGLRenderer()
renderer.shadowMap.enabled = true
renderer.shadowMap.type = t.PCFShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = t.sRGBEncoding
renderer.toneMapping = t.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(SIZE.width, SIZE.height)
renderer.setClearColor(0x000, 1)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
```

<p>
  <img src=".\images\image-20221207110515816.png" style="margin:0 auto;border-radius:8px">
</p>

我们可以使用钩子函数在材质加载进行回调时取参或修改相应的值

```ts
material.onBeforeCompile = (shader) =>
{
    console.log(shader)
}
```

我们可以看到shader着色器中有许多参数，每个`#include ...`都会插入**Three.js**依赖包里边特定文件夹中的代码，所以我们可以使用`replace()`来替换其中的一些代码

## 上移变换

我们可以让整个模型向上移动`3`个单位

```ts
material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
        #include <begin_vertex>
        transformed.y += 3.0;
    `,
    )
}
```

<p>
  <img src=".\images\image-20221207141635475.png" style="margin:0 auto;border-radius:8px">
</p>

我们会发现该模型虽然向上移动了一段距离，但是他的阴影却没有移动

## 扭转

我们也可以扭转他，在`xy`平面上进行操作，我们使用矩阵变换来实现，我们将下面这段代码放到`<common>`声明的函数里，因为这个函数库主要来用作公用工具的使用

```glsl
mat2 get2dRotateMatrix(float _angle)
{
    return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
}
```

```ts
shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
        #include <common>

        mat2 get2dRotation(float _angle){
            return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
        }
    `,
    )
```

在另外的函数中调用它生成`rotateMatrix`变换举证来实现对材质的扭转，我们根据`y`轴的大小来实现不同程度的扭转

```ts
shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
        #include <begin_vertex>

        float angle = position.y * 0.2;
        mat2 rotateMatrix = get2dRotation(angle);

        transformed.xz = transformed.xz * rotateMatrix;
    `,
)
```

<p>
  <img src=".\images\image-20221207150111108.png" style="margin:0 auto;border-radius:8px">
</p>

这里还是会出现阴影的问题，我们之后来解决它

## 动画

我们现在hook钩子外声明与之前相同的`uTime`

```ts
const customUniforms = {
    uTime: { 
        value: 0 
    }
}

material.onBeforeCompile = (shader) => {
    // ...
}
```

在`<common>`函数库里声明`uTime`

```ts
`
#include <common>

uniform float uTime;

mat2 get2dRotateMatrix(float _angle)
{
return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}
`
```

在`<begin_vertex>`函数库里使用它

```ts
`
#include <begin_vertex>

float angle = (position.y + uTime)* 0.2;

mat2 rotateMatrix = get2dRotateMatrix(angle);

transformed.xz = transformed.xz * rotateMatrix;
`
```

在动画函数里给他赋时间值

```ts
const clock = new t.Clock() // 从初始化时就开始运行
// animate()
const animate = () => {
// ...
const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
// TODO
customUniforms.uTime.value = elapsedTime
// ...
}
animate() // 调用动画函数
```

<p>
  <img src=".\images\image-20221207153306474.png" style="margin:0 auto;border-radius:8px">
</p>

头在旋转但是他的阴影却没有跟着动

## 阴影

如同上一节所出现的问题那样，这是因为在灯光渲染下，网格材质将被深度网格材质`MeshDepthMaterial`所替代，阴影就是使用的是深度网格材料，所以我们得更改这个属性

**步骤1**:首先我们定义一个深度网格材质并设置其`depthPacking`属性值

```ts
const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking
})
```

**步骤2**：我们在加载模型时使用`customDepthMaterial`来使用自定义的深度网格材质

```ts
gltfLoader.load(
    new URL('../assets/models/LeePerrySmith/LeePerrySmith.glb', import.meta.url).href,
    (gltf) => {
    // Model
    const mesh = gltf.scene.children[0] as t.Mesh
    mesh.rotation.y = Math.PI * 0.5
    mesh.material = material
    mesh.customDepthMaterial = depthMaterial 《——— 就是这个
    scene.add(mesh)

    // Update materials
    updateAllMaterials()
    },
)
```

**步骤3**：我们在加载模型之前调用相同的代码来实现在平面上的阴影

```ts
depthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = customUniforms.uTime
    shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
        #include <common>

        uniform float uTime;

        mat2 get2dRotateMatrix(float _angle)
        {
            return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
        }
        `,
    )
    shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
        #include <begin_vertex>

        float angle = (position.y + uTime)* 0.2;

        mat2 rotateMatrix = get2dRotateMatrix(angle);

        transformed.xz = transformed.xz * rotateMatrix;
    `,
    )
}
```

<p>
  <img src=".\images\image-20221207160958217.png" style="margin:0 auto;border-radius:8px">
</p>

但我们会发现一个问题，在模型的太阳穴那边会出现重影并不是阴影，这是因为当我们旋转顶点时，我们只旋转了位置，但没有旋转法线，因此需要修改处理法线的块。处理法线的块称为`beginnormal_vertex`。让我们将其替换为`material`，记住不是`depthMaterial`，因为这阴影材质不需要法线

我们通过查看：

`/node_modules/three/src/renderers/shaders/ShaderChunks/beginnormal_vertex.glsl.js`

得知法线变量名为`objectNormal`，因此我们会对其进行扭曲旋转的相同操作：
   (记得移除`begin_vertex`中的`angle`和`rotateMatrix`以避免重复声明)

```ts
material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = customUniforms.uTime
    shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
        #include <common>

        uniform float uTime;

        mat2 get2dRotateMatrix(float _angle)
        {
            return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
        }
        `,
    )
    shader.vertexShader = shader.vertexShader.replace(
    '#include <beginnormal_vertex>',
    `
        #include <beginnormal_vertex>

        float angle = (position.y + uTime)* 0.2;

        mat2 rotateMatrix = get2dRotateMatrix(angle);

        objectNormal.xz = objectNormal.xz * rotateMatrix;
    `,
    )
    shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
        #include <begin_vertex>

        transformed.xz = transformed.xz * rotateMatrix;
    `,
    )
}
```

<p>
  <img src=".\images\image-20221207162202037.png" style="margin:0 auto;border-radius:8px">
</p>
