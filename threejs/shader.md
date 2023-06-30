# Shader着色器 :art:

- **Shader**着色器是一种用`GLSL`写的程序
- 在GPU上计算渲染
- 可用于定位几何图形的每个顶点
- 能够渲染几何图形上的每个像素
- 我们需要传递给`shader`的数据
  1. 向量的坐标
  2. 几何物体的网格信息
  3. 相机的信息
  4. 物体的颜色
  5. 物体的材质
  6. 灯光
  7. 雾
  8. 等等...

## 着色器的类型

### Vertex shader顶点着色器

- ​顶点着色器的目的是定位几何体的顶点，其核心是发送几何物体顶点位置、网格变换（如其位置、旋转和缩放）、相机信息（如其角度、旋转和视野）。然后，GPU将按照顶点着色器中的指示处理所有这些信息，以便将顶点投影到2D空间（画布）上完成渲染。

- ​使用顶点着色器时，其代码将应用于几何体的每个顶点，但某些数据（如顶点位置）会在每个顶点之间发生变化。这种类型的数据（在顶点之间变化的数据）称为**属性**。而有些数据不需要在每个顶点之间切换，比如网格的位置。网格的位置将以相同的方式影响所有顶点。这种类型的数据（在顶点之间不改变的数据）被称为**统一数据**。

- ​顶点着色器首先运行。一旦放置了顶点，GPU就知道几何体的哪些像素是可见的，并之后可以继续到**片段着色器（Fragment shader）**。

### Fragment shader片段着色器

- 片段着色器的目的是为几何体的每个可见的几何片段进行上色

- 相同的片段着色器将用于几何体的每个可见片段。我们可以通过使用**统一数据**的形式发现像颜色这样的数据，就像使用顶点着色器那样，或者我们可以将数据从顶点着色器发送到片段着色器。我们称这种类型的数据（从顶点着色器到片段着色器的数据）是变化**varying**。

- 片段着色器中最直接的指令可以是用相同的颜色为所有片段着色。如果我们只设置了颜色属性，我们就得到了使用`MeshBasicMaterial`网格材质的几何物体。或者我们可以向着色器发送更多数据，例如，灯光位置。然后，我们可以根据几何体的面在光源前面的位置为片段上色。如果场景中有一个灯光，我们就获得了利用`MeshPhongMaterial`材质渲染的物体。

### 总结

1. **顶点着色器**在渲染器上定位顶点的位置
2. **片段着色器**给几何体每个可见的片段或像素进行上色
3. 片段着色器在顶点着色器之后执行
4. 在每个顶点之间改变的数据（如他们的位置）被叫做（**attribute**）**属性**，只能被用在顶点着色器中
5. 在每个顶点之间未改变的数据（如网格的位置或是一种颜色）被叫做（**uniform**）**统一数据**，他能够在顶点着色器和片段着色器之间使用
6. 我们可以使用变化（**varying**）来将数据从顶点着色器发送至片段着色器

<p>
  <img src=".\images\image-20221128161539603.png" style="margin:0 auto;border-radius:8px">
</p>

::: tip
为什么我们不使用`Threejs`自带的`Material`？

- `Threejs`基础的材质不够使用
- `Shader`可以提高渲染的性能
- `Shader`可以添加自定义的处理
  
:::

## 着色器材质

1. `ShaderMaterial`：该材质会自动添加一些代码到着色器中
2. `RawShaderMaterial`：没有任何东西

### RawShaderMaterial

**步骤1**：首先我们声明一个着色器材质

```ts:line-numbers
const material = new t.RawShaderMaterial({
  vertexShader: `
    uniform mat4 projectionMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 modelMaterix;

    attribute vec3 position;
    
    void main()
    {
      gl_Position = projectionMatrix * viewMatrix * modelMaterix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;

    void main()
    {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `,
})
```

像这样写代码对程序员来说并不怎么友好，我们无法知道到底是哪个地方出现了问题，我们可以将这个拆分到两个以`.glsl`结尾的文件中，我们在VSCode中可以使用`Shader languages support`和`Lint`插件来提高开发效率。

接下来我们将其拆分为两个文件并导入：

```ts
import testVertexShader from '../shaders/test/vertex.glsl'
import testFragmentShader from '../shaders/test/fragment.glsl'

const material = new t.RawShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
})
```

### ShaderMaterial

`ShaderMaterial`与`RawShaderMaterial`的工作原理其实是一样的，只不过其有内置`attributes`和`uniforms`，精度也会自动设置。我们可以移除之前定义的`uniform`代码与`attribute`代码，编译器照样正常运行

## GLSL语言

`GLSL`的语言类似C语言，数据类型有：

- `int`：整型

- `float`：当整数与浮点数相乘时需要用`float()`来转换，

  例如：

  ```glsl
  float a = 1.0;
  int b = 2;
  float c = a * float(b);
  ```

- `boolean`：包含`true`,`false`

- `vec2`：用来存储二维坐标`(x, y)`,

  例如：

  ```glsl
  vec2 foo = vec2(1.0, 2.0);
  // 或
  vec2 foo = vec2();
  foo.x = 1.0;
  foo.y = 2.0;
  // 或
  vec2 foo = vec2(1.0, 2.0);
  foo *= 2.0;
  ```

- `vec3`：用来存储三维坐标

  例如：

  ```glsl
  vec3 foo = vec3(0.0);
  vec3 bar = vec3(1.0, 2.0, 3.0);
  // 或使用vec3来定义颜色
  vec3 purpleColor = vec3(0.0);
  purpleColor.r = 0.5;
  purpleColor.g = 0.5;
  purpleColor.b = 1.0;
  // 或使用vec2来创建vec3
  vec2 foo = vec2(1.0, 2.0);
  vec3 bar = vec3(foo, 3.0);
  // 或者使用vec3的一部分来创建vec2
  vec3 foo = vec3(1.0, 2.0, 3.0)
  vec2 bar = foo.xy // 把x，y赋值给bar
  ```

- `vec4`：与`vec2`与`vec3`类似，但第四个值命名为`w`或`a`(颜色alpha)

  例如：

  ```glsl
  // 可以与vec2、vec3类似拆分赋值
  vec4 foo = vec4(1.0, 2.0, 3.0, 4.0);
  vec4 bar = vec4(foo.zw, vec2(5.0, 6.0));
  ```

- 在着色器内，一般命名以`gl_`开头的变量是着色器的内置变量，除此之外`webgl_`和`_webgl`还是着色器保留字，自定义变量不能以`webgl_`或`_webgl`开头。

- 变量声明一般包含`<存储限定符> <数据类型> <变量名称>`，

- 以`attribute vec4 a_Position`为例，**attribute**（每个顶点之间改变的数据）表示存储限定符，**vec**是数据类型，a_Position为变量名称。

### GLSL内置的函数

- GLSL有许多内置的经典函数
  - 如sin、cos、max、min、pow、exp、mod、clamp，
- 也有非常实用的函数
  - 如cross、dot、mix、step、smoothstep、length、distance、reflect、refract、normalize。
- 许多参数可以参考 [OpenGL 4.x Reference Pages](https://registry.khronos.org/OpenGL-Refpages/gl4/html/indexflat.php) 或 [The Book of Shaders](https://thebookofshaders.com/)

### `main()`函数

自动调用,不会返回任何数据

### `gl_Position`内置变量

`gl_Position`是已经声明好的一个内置的变量，不过我们需要重新分配它。

该变量有4个值，它主要位于`Clip Space`裁剪空间之内，裁剪空间是指在`-1`到`+1`范围内的所有3个方向`(x, y, z)`。这就像把所有东西都放在3D盒子里一样，任何超出此范围的内容都将被裁剪掉，而另外第四个值用于透视

```glsl
void main()
{
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
  gl_Position.x += 0.5;
  gl_Position.y += 0.5;
}
```

在这段代码里该变量接收一个4维的值，我们可以通过更改它的x与y来改变它的位置，但这样很危险，因为这并不是在三维空间中移动他而是在二维的平面上

### `Position`和`attributes`

我们使用`attribute vec3 position;`来定义顶点的位置

- 属性变量**attribute**是顶点之间唯一会发生变化的变量。
- 相同的顶点着色器将应用于每个顶点，**position**属性将包含该特定顶点的**x**、**y**和**z**坐标。
- 利用`gl_Position = /* ... */ vec4(position, 1.0);`来定义`gl_Position`属性

### `Matrices`和`uniforms`

- **uniforms**用于维护在每个顶点之间未改变的数据

- 使用乘法来应用矩阵

- 每一个**Matrix**都会做一个变换，并且**Matrix**的计算必须使用相同维度的矩阵

我们来看下边这些声明，他们的先后顺序并不怎么重要

```glsl
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
```

**modelMatrix**：应用于网格相关的所有变换，比如：position、scale、rotation

**viewMatrix**：应用于照相机的所有变换，比如：position、rotation、field of view、near、far

**projectionMatrix**：将坐标转换为**clip space**中的坐标

::: tip
可以阅读[Coordinate Systems](https://learnopengl.com/Getting-started/Coordinate-Systems)来了解更多关于矩阵和坐标之间的关系
:::

我们也可以将`view`和`model`组合成`modelview`，但这样可控制的内容就会减少

```glsl
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

attribute vec3 position;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

我们也可以将上面`gl_Position`这段长代码拆分以获得更好的理解

```glsl
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;

void main()
{
  vec4 modelPosition = modelMatrix * vec4(position, 1.0); // 控制几何体的位置
  vec4 viewPosition = viewMatrix * modelPosition; // 控制照相机的位置
  vec4 projectedPosition = projectionMatrix * viewPosition; // 控制几何体在裁剪空间的中位置
  
  gl_Position = projectedPosition;
}
```

这样我们就可以分别控制几何体的状态

```glsl
void main()
{
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  // 比如向上移动
  modelPosition.y += 1.0;

  // ...
}
```

```glsl
void main()
{
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  // 或是变成波浪形
  modelPosition.z += sin(modelPosition.x * 10.0) * 0.1;

  // ...
}
```

我们有时会遇到一个问题会发现我们的平面并不会出现波浪，这是由于我们在声明平面时没有声明宽度和高度的分段数，分段数越多，波浪越平滑，但也会影响到渲染时的性能

```js
const planeGeometry = new t.PlaneGeometry(3, 3, 160, 160)
```

<p>
  <img src=".\images\image-20221129173157490.png" style="margin:0 auto;border-radius:8px">
</p>

:::tip 注意
若旋转平面则相应的坐标就要发生变化
:::

### Fragment

我们使用`precision mediump float;`

有如下精度：

- `highp`：高精度会导致性能下降
- `mediump`：默认
- `lowp`：低精度会导致想要渲染的位置不够庞大

这一部分在`Threejs`的`ShaderMaterial`中被处理

### gl_FragColor

这是一个vec4，前三个值是红色、绿色和蓝色通道（r、g、b），第四个值是alpha（a），如果要在改动alpha之后看出差异，需要设置透明度

```ts
const material = new t.RawShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  transparent: true, ←这里设置透明度为true
})
```

并且在这里更改**r、g、b**中的一些值

```glsl
gl_FragColor = vec4(5.0, 0.0, 1.0, 1.0);
```

<p>
  <img src=".\images\image-20221129173058288.png" style="margin:0 auto;border-radius:8px">
</p>

### Attributes

根据上述可知，**Attributes**为在每个顶点之间改变的数据，我们可以更改几何体上相应的属性来改变整个平面的状态

```js
const planeGeometry = new t.PlaneGeometry(3, 3, 160, 160)

// 拿到平面上顶点的个数
const count = planeGeometry.attributes.position.count
const randoms = new Float32Array(count)
for (let i = 0; i < count; i++)
    randoms[i] = Math.random()

planeGeometry.setAttribute('aRandom', new t.BufferAttribute(randoms, 1))
```

`aRandom`是我们设置的`attribute`的名称，主要用于后续的颜色赋值

`new t.BufferAttribute(randoms, 1)`用于给每个顶点赋值，这里是数字1是因为一个顶点只需要一个随机的值，而以前数字3是因为一个顶点需要x、y、z三个坐标

```glsl
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;
attribute float aRandom; // 接收aRandom这个浮点型的值

void main()
{
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.z += aRandom * 0.1; // 缩小aRandom的范围
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}
```

<p>
  <img src=".\images\image-20221129172844110.png" style="margin:0 auto;border-radius:8px">
</p>

### Varyings

正如之前所学的那样我们要利用 **Varyings** 从 **Vertex** 向 **Fragment** 传值

**步骤1**：首先我们在**Vertex**里声明一个变量

```glsl
varying float vRandom
```

**步骤2**：之后在`main()`给他赋值

```glsl
void main(){
// ...
  vRandom = aRandom
}
```

**步骤3**：我们在**Fragment**中定义与他相同的变量来接受他

```glsl
varying float vRandom
```

**步骤4**：之后在**Fragment**中使用它

```glsl
precision mediump float;

varying float vRandom;

void main()
{
  gl_FragColor = vec4(1.0, vRandom, 0.0, 1.0);
}
```

<p>
  <img src=".\images\image-20221129182244344.png" style="margin:0 auto;border-radius:8px">
</p>
  
这些顶点之间的值是线性插值的，以此实现平滑渐变。如果GPU正在两个顶点之间绘制一个fragment，一个顶点的变量为1.0，另一个顶点的变量为0.0，那么`fragment`值将为0.5。最后重新回归最初的普通平面。

### uniforms

在每个顶点之间未改变的数据（如网格的位置或是一种颜色）被叫做（**uniform**）**统一数据**，在顶点着色器和片段着色器之间可以使用相同的**uniform**

1. 可以用相同的着色器渲染出不同的结果
2. 能够轻微调整值
3. 可以产生动画的效果

**步骤1**:我们添加**uniform**到`material`中用于向`.glsl`文件传值

```ts
const material = new t.RawShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    uFrequency: {
        value: new t.Vector2(10, 5),
    },
  },
})
```

**步骤2**：在顶点的`.glsl`中声明**uniform**并使用相同的名称

```glsl
uniform vec2 uFrequency; // 声明的是Vector2，所以接收要用Vec2二维

void main()
{
  // ...
  modelPosition.z += sin(modelPosition.x * uFrequency.x) * 0.1;
  modelPosition.z += sin(modelPosition.x * uFrequency.y) * 0.1;
  // ...
}
```

**步骤3**：我们可以添加GUI来进行调试

```ts
gui.add(material.uniforms.uFrequency.value, 'x')
  .min(0)
  .max(20)
  .step(0.01)
  .name('frequencyX')
gui.add(material.uniforms.uFrequency.value, 'y')
  .min(0)
  .max(20)
  .step(0.01)
  .name('frequencyY')
```

<p>
  <img src=".\images\image-20221130110308594.png" style="margin:0 auto;border-radius:8px">
</p>

同样，我们可以为它添加动画

**步骤1**：我们现在`material`中定义时间用来控制相应的变化

```ts
const material = new t.RawShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    // ...
    uTime: {
        value: 0,
    },
  },
})
```

**步骤2**：在动画函数中给它赋值

```ts
const clock = new t.Clock() // 从初始化时就开始运行
// animate()
const animate = () => {
  // ...
  const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
  // TODO
  material.uniforms.uTime.value = elapsedTime
  // ...
}
animate() // 调用动画函数
```

**步骤3**：在顶点的`.glsl`中接收并使用

```glsl
uniform vec2 uFrequency; // 声明的是Vector2，所以接收要用Vec2二维

void main()
{
  // ...
  modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
  modelPosition.z += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;
  // ...
}
```

我们想让他更像旗帜，我们得在`Mesh`中更改它，这样不会影响到整体的动画效果

```ts
plane.scale.y = 2 / 3
```

我们也可以用**uniform**来向片段着色器(**Fragment**)发送颜色的数据，因为片段着色器(**Fragment**)可以用来渲染颜色

```ts
const material = new t.RawShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    // ...
    uColor: {
        value: new t.Color('orange'),
    },
  },
})
```

我们在片段的`.glsl`中接受这个变量

```glsl
precision mediump float;

uniform vec3 uColor; // threejs 的color是三维的向量

void main()
{
  gl_FragColor = vec4(uColor, 1.0);
}
```

<p>
  <img src=".\images\image-20221130112034268.png" style="margin:0 auto;border-radius:8px">
</p>

我们也可以使用自定义的`Texture`

```ts
// 声明图片文件
const Texture = textureLoader.load(new URL('../assets/textures/door/color.jpg', import.meta.url).href)

// 定义材质
const material = new t.RawShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    // ...
    uTexture: {
        value: Texture,
    },
  },
})
```

我们在顶点的`.glsl`中利用`uv`来获得`geometry`中的`UV`坐标(顶点的二维坐标)

```glsl
// ...
attribute vec2 uv;
varying vec2 vUv; // 用于向fragment传递数值

void main(){
  // ...
  vUv = uv;
  // ...
}
```

我们在片段的`.glsl`文件中接收从顶点的`.glsl`中传递过来的`UV`坐标，并用`texture2D()`来为`UV`的每个顶点赋值，该方法第一个参数就是应用的纹理，第二个参数是由在纹理上拾取的颜色的坐标组成，我们还没有这些坐标，而这听起来很熟悉，我们正在寻找可以帮助我们在几何体上投射纹理的坐标，也就是`UV`坐标。`THREEJS`的`geometry`会自动生成这些`UV`坐标。

```glsl
precision mediump float;

uniform vec3 uColor;
uniform sampler2D uTexture;

varying vec2 vUv;


void main()
{
  vec4 textureColor = texture2D(uTexture, vUv);
  gl_FragColor = textureColor;
}

```

我们可以给它加些阴影，根据其`sin()`的取值范围来决定，负的部分渲染些阴影上去，所以我们得重构顶点`.glsl`中的代码

```glsl
varying float vElevation; // 向fragment中传递数据

void main()
{
  // ...

  float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
  elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;

  modelPosition.z +=elevation;
  
  // ...
  vElevation = elevation;
}
```

在片段`.glsl`中拿到数据并赋值

```glsl
varying float vElevation; // 接收来自顶点glsl中的值

void main()
{
  vec4 textureColor = texture2D(uTexture, vUv);
  textureColor.rgb *= vElevation *2.0 + 0.5;
  gl_FragColor = textureColor;
}
```

<p>
  <img src=".\images\image-20221130123928107.png" style="margin:0 auto;border-radius:8px">
</p>

## Glslify

- GLSLify是一个node module模块，它改进了我们对glsl文件的处理。通过glslify，我们可以像模块一样导入和导出glsl代码。

## 其他参考

下面是学习着色器的一些网站和油管频道：

- [The Book of Shaders](https://thebookofshaders.com/)
- [ShaderToy]( https://www.shadertoy.com/)
- [The Art of Code Youtube Channel]( https://www.youtube.com/channel/UCcAlTqd9zID6aNX3TzwxJXg)
- [Lewis Lepton Youtube Channel]( https://www.youtube.com/channel/UC8Wzk_R1GoPkPqLo-obU_kQ)

## Shader pattern着色器方案

**UV**坐标是一个(0, 0)到(1, 1)的网格

<p>
  <img src=".\images\image-20221130171832270.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

在这里我们使用`ShaderMaterial`来创建自定义的材质

```ts
const material = new t.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  side: t.DoubleSide,
})
```

我们在顶点的`.glsl`文件中声明`uv`坐标并将它传递给片段着色器，因为使用`ShaderMaterial`，所以`geometry`中的相关属性都自动的导入`shader`着色器中包括`uv`坐标

```glsl
// 向片段着色器传递vUv坐标
varying vec2 vUv;

void main()
{
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
  
  vUv = uv; //  将geometry的uv坐标赋给顶点着色器以便于传递给片段着色器
}
```

在片段着色器中接收`Vuv`坐标，并取值赋值

```glsl
varying vec2 vUv;

void main()
{
  gl_FragColor = vec4(vUv, 1.0, 1.0);
  // 或者可以这么写 
  gl_FragColor = vec4(vUv.x, vUv.y, 1.0, 1.0);
}
```

<p>
  <img src=".\images\image-20221202100711058.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们也可以修改rgb的值来改变这一颜色

```glsl
varying vec2 vUv;

void main()
{
  gl_FragColor = vec4(vUv, 0.5, 1.0);
}
```

<p>
  <img src=".\images\image-20221202101005162.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

因为在上述网格中uv的坐标是从`(0, 0)`到`(1, 1)`，所以我们可以根据`uv`坐标的变化来定义颜色，会出现一种渐变的效果

```glsl
varying vec2 vUv;

void main()
{
  gl_FragColor = vec4(vUv.x, vUv.x, vUv.x, 1.0);
}

// 或是重构代码
varying vec2 vUv;

void main()
{
  //  float strength = vUv.x; 
  //  float strength = vUv.y;  方向不一样阴影的效果就不一样
  //  float strength =1 - vUv.y;   或是反着方向来
  //  float strength = vUv.y * 10.0; 或是让他的过度更剧烈些
  //  float strength = mod(vUv.y * 10.0, 1.0);  我们也可以让他在指定的范围内变化，mod()相当于取余
  //  

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<div style="display:flex;flex-wrap: wrap;justify-content:space-between">
  <p>
    <img src=".\images\image-20221202101332465.png" style="border-radius:8px;height:245px;">
  </p>
  <p>
    <img src=".\images\image-20221202101828190.png" style="border-radius:8px;height:245px;">
  </p>
  <p>
    <img src=".\images\image-20221202102801347.png" style="border-radius:8px;height:245px;">
  </p>
  <p>
    <img src=".\images\image-20221202102108551.png" style="border-radius:8px;height:245px;">
  </p>
</div>

我们可以来点难的让其出现分段

```glsl
varying vec2 vUv;

void main()
{
  // 我们也可以让他在指定的范围内变化，mod()相当于取余
  float strength = mod(vUv.y * 10.0, 1.0);  

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202103220181.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以用三元运算符搞点斑马纹

```glsl
varying vec2 vUv;

void main()
{
  float strength = mod(vUv.y * 10.0, 1.0);

  strength = strength < 0.5 ? 0.0 : 1.0;
  // 或者我们可以用step()来，
  // strength = step(0.5, strength),该函数的作用是判断0.5与strength的关系
  // ，小于0.5为0，大于0.5为1

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202104226784.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以更改白色和黑色的间距

```glsl
varying vec2 vUv;

void main()
{
  float strength = mod(vUv.y * 10.0, 1.0);
  // float strength = mod(vUv.x * 10.0, 1.0); 我们可以根据vUv的坐标来实现方向的改变

  strength = step(0.8, strength);

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202104935955.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以用加法将两种样式合并起来

```glsl
varying vec2 vUv;

void main()
{
  float strength = step(0.8, mod(vUv.y * 10.0, 1.0));
  strength += step(0.8, mod(vUv.x * 10.0, 1.0));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202105503307.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以用乘法让图形相交的地方变成点

```glsl
varying vec2 vUv;

void main()
{
  float strength = step(0.8, mod(vUv.y * 10.0, 1.0));
  strength *= step(0.8, mod(vUv.x * 10.0, 1.0));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202105739209.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以调整一边的长度，改变那一边的值

```glsl
varying vec2 vUv;

void main()
{
  float strength = step(0.4, mod(vUv.x * 10.0, 1.0));
  strength *= step(0.8, mod(vUv.y * 10.0, 1.0));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202110219872.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以在上一个的基础上在添加一组形成交叉

```glsl
varying vec2 vUv;

void main()
{
  float BarX = step(0.4, mod(vUv.x * 10.0, 1.0));
  BarX *= step(0.8, mod(vUv.y * 10.0, 1.0));

  float BarY = step(0.8, mod(vUv.x * 10.0, 1.0));
  BarY *= step(0.4, mod(vUv.y * 10.0, 1.0));

  float strength = BarX + BarY;
  
  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202110455957.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们也可以移动他们形成十字架

```glsl
varying vec2 vUv;

void main()
{
  float BarX = step(0.4, mod(vUv.x * 10.0, 1.0));
  BarX *= step(0.8, mod(vUv.y * 10.0 + 0.2, 1.0)); // 在X中移动他y的坐标，这个坐标是它X轴上长度的一半

  float BarY = step(0.8, mod(vUv.x * 10.0 + 0.2, 1.0)); // 在Y中移动他x的坐标，这个坐标是它Y轴上长度的一半
  BarY *= step(0.4, mod(vUv.y * 10.0, 1.0));

  float strength = BarX + BarY;

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202111045264.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以回到最初的那个方案，让阴影渲染在图像的正中间

```glsl
varying vec2 vUv;

void main()
{
  float strength = abs(vUv.x - 0.5); // 相当于将(-0.5, 0.5)变成(0.5, 0.5)

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202111506081.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以取X轴，Y轴上的最小值让他们根据坐标融合起来

```glsl
varying vec2 vUv;

void main()
{
  float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202112603898.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们相反去他们的最大值

```glsl
varying vec2 vUv;

void main()
{
  float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202112718039.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们也可以更具之前学的让他中间变黑，像用`step()`和三元表达符那样

```glsl
varying vec2 vUv;

void main()
{
  float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202112924193.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们也可以通过叠加两个图形来形成更大的中空

```glsl
varying vec2 vUv;

void main()
{
  float square1 = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
  float square2 = 1.0 - step(0.25, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
  
  float strength = square1 * square2; // 将叠加的地方变白没叠加的地方变黑 

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<div style="display:flex;justify-content:space-between">
  <p>
    <img src=".\images\image-20221202115808101.png" style="margin:0 auto;border-radius:8px;height:200px">
  </p>
  <p>
    <img src=".\images\image-20221202115829064.png" style="margin:0 auto;border-radius:8px;height:200px">
  </p>
  <p>
    <img src=".\images\image-20221202115941110.png" style="margin:0 auto;border-radius:8px;height:200px">
  </p>
</div>

或者我们可以创建一个灰度的渐变表，我们可以用4舍5入的方法将他们划分为10个不同的种类

```glsl
varying vec2 vUv;

void main()
{
  float strength = floor(vUv.x * 10.0) / 10.0;

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202142718898.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们也可以把整张表变成取色盘，方法X轴向和Y轴向的交叉差不多

```glsl
varying vec2 vUv;

void main()
{
  float strength = floor(vUv.x * 10.0) / 10.0;
  strength *= floor(vUv.y * 10.0) / 10.0;

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202142915164.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们用`random()`函数来生成一片雪花，在GLSL语言中没有`random()`的函数需要自己定义

```glsl
varying vec2 vUv;


float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main()
{
  float strength = random(vUv);

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202144935143.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以根据取色盘的代码来定义新的二位向量，并根据`random()`函数来对组内的向量赋予新值

```glsl
varying vec2 vUv;


float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main()
{
  vec2 gridUv = vec2(
    floor(vUv.x * 10.0) / 10.0,
    floor(vUv.y * 10.0) / 10.0,
  )
  float strength = random(gridUv);

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202150751580.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

或许我们可以在这个的基础上移动Y轴移动X轴向上的距离

```glsl
varying vec2 vUv;


float random(vec2 st)
{
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main()
{
  vec2 gridUv = vec2(
    floor(vUv.x * 10.0) / 10.0,
    floor(vUv.y * 10.0 + vUv.x) / 10.0
  );

  float strength = random(gridUv);

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202151725477.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

或者我们可以创造一个光晕圈，`strength()`能获得向量的长度，因为uv坐标轴的左下脚为`(0, 0)`右上角为`(1, 1)`在此之间为线性变换的

```glsl
varying vec2 vUv;

void main()
{
  float strength = length(vUv);

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202152035218.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以改变uv坐标的圆心来改变黑圆的中心

```glsl
varying vec2 vUv;

void main()
{
  float strength = length(vUv - 0.5);

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202152408837.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

或者我们可以用`distance()`来改变uv坐标轴的圆心

```glsl
varying vec2 vUv;

void main()
{
  float strength = distance(vUv, vec2(0.5, 0.5));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

我们可以反转这个值来形成中间亮四周暗的样子

```glsl
varying vec2 vUv;

void main()
{
  float strength = 1.0 - distance(vUv, vec2(0.5, 0.5));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202153320488.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们也可以把灯光光晕的范围聚焦，取倒数相当于离圆心远的地方越暗

```glsl
varying vec2 vUv;

void main()
{
  float strength = 0.02 / distance(vUv, vec2(0.5, 0.5));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202155740213.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们也可以单独给圆心一个二维坐标作为压缩其的变量

```glsl
varying vec2 vUv;

void main()
{
  vec2 lightUv = vec2(
    vUv.x * 0.1 - 0.05, // 减法向右移动，加法向左移动，乘大于0的数向上下拉长，乘小于0的数左右拉长，且呈现线性趋势
    vUv.y - 0.5 // 减法向上移动，加法向下移动
  );

  float strength = 0.015 / distance(lightUv, vec2(0));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202161455263.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以在创建一个竖向的图形与这个图形两两结合

```glsl
varying vec2 vUv;

void main()
{
  vec2 lightUvX = vec2(
    vUv.x * 0.1 - 0.05,
    vUv.y * 0.5 - 0.25
  );

  float lightX = 0.015 / distance(lightUvX, vec2(0));

  vec2 lightUvY = vec2(
    vUv.y * 0.1 - 0.05,
    vUv.x * 0.5 - 0.25
  );

  float lightY = 0.015 / distance(lightUvY, vec2(0));


  float strength = lightX * lightY;

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202162202257.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以用一个函数来定义旋转并用于几何体上

```glsl
varying vec2 vUv;
#define PI 3.1415926535897932384626433832795 // 定义PI

// 旋转函数
vec2 rotate(vec2 uv, float rotation, vec2 mid)
{
    return vec2(
      cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
      cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
    );
}

void main()
{

  vec2 rotatedUv = rotate(vUv, PI * 0.25, vec2(0.5));

  vec2 lightUvX = vec2(
    rotatedUv.x * 0.1 - 0.05,
    rotatedUv.y * 0.5 - 0.25
  );

  float lightX = 0.015 / distance(lightUvX, vec2(0));

  vec2 lightUvY = vec2(
    rotatedUv.y * 0.1 - 0.05,
    rotatedUv.x * 0.5 - 0.25
  );

  float lightY = 0.015 / distance(lightUvY, vec2(0));


  float strength = lightX * lightY;

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202163650074.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们也可以生成中间有个黑圆的几何体，运用之前所学的`step()`方法来控制区域内的颜色

```glsl
varying vec2 vUv;

void main()
{
  float strength = step(0.25, distance(vUv, vec2(0.5)));
  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202163844754.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以扩大中心圆的辐射范围然后取绝对值让中心处亮起来

```glsl
varying vec2 vUv;

void main()
{
  float strength = abs(distance(vUv, vec2(0.5)) - 0.5);
  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202164636945.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以反转一下让黑的变白白的变黑

```glsl
varying vec2 vUv;

void main()
{
  float strength = step(0.01, abs(distance(vUv, vec2(0.5)) - 0.5));
  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202165003570.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以再反转一下

```glsl
varying vec2 vUv;

void main()
{
  float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - 0.5));
  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202165125383.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以用一些函数来呈现抖动状态

```glsl
varying vec2 vUv;

void main()
{
  vec2 waveUv = vec2(
    vUv.x,
    vUv.y + sin(vUv.x * 30.0) * 0.1
  );

  float strength = 1.0 - step(0.01, abs(distance(waveUv, vec2(0.5)) - 0.25));
  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202165823669.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

在对x轴向也加一些函数

```glsl
varying vec2 vUv;

void main()
{
  vec2 waveUv = vec2(
    vUv.x + sin(vUv.y * 30.0) * 0.1,
    vUv.y + sin(vUv.x * 30.0) * 0.1
  );

  float strength = 1.0 - step(0.01, abs(distance(waveUv, vec2(0.5)) - 0.25));
  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202170048577.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以修改一下频率

```glsl
varying vec2 vUv;

void main()
{
  vec2 waveUv = vec2(
    vUv.x + sin(vUv.y *100.0) * 0.1,
    vUv.y + sin(vUv.x *100.0) * 0.1
  );

  float strength = 1.0 - step(0.01, abs(distance(waveUv, vec2(0.5)) - 0.25));
  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202170409471.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以通过`atan()`来获得X轴与Y轴之间的角度

```glsl
varying vec2 vUv;

void main()
{
  float angle = atan(vUv.x, vUv.y);
  
  float strength = angle;

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202170744660.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以移动其的位置

```glsl
varying vec2 vUv;

void main()
{
  float angle = atan(vUv.x - 0.5, vUv.y - 0.5);

  float strength = angle;

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202171027513.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以让`angle`从0到1开始转

```glsl
varying vec2 vUv;
#define PI 3.1415926535897932384626433832795 // 定义PI

void main()
{
  float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
  angle /= PI * 2.0;
  angle += 0.5;
  float strength = angle;

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202171838583.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

或者我们可以让他旋转起来

```glsl
varying vec2 vUv;
#define PI 3.1415926535897932384626433832795 // 定义PI

void main()
{
  float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
  angle /= PI * 2.0;
  angle += 0.5;  
  angle *= 20.0; // 20瓣
  angle = mod(angle, 1.0); // 每到1，就从新来一瓣
  float strength = angle;

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202172255334.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以让他出现散射状

```glsl
varying vec2 vUv;
#define PI 3.1415926535897932384626433832795 // 定义PI

void main()
{
  float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
  angle /= PI * 2.0;
  angle += 0.5;
  angle *= 20.0;
  float strength = sin(angle * 4.0);

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202173104776.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以在之前圆的基础上使用自己定义的半径

```glsl
varying vec2 vUv;
#define PI 3.1415926535897932384626433832795 // 定义PI

void main()
{
  float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
  angle /= PI * 2.0;
  angle += 0.5;

  float radius = 0.25 + sin(angle * 100.0) * 0.02;
  float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - radius));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221202175602091.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

### perlin noise

柏林噪声有助于重建如云、水、火、地形等自然形状，但它同时也可以用于设置草或雪在风中移动的动画。有许多柏林噪声算法具有不同的结果、不同的维度（2D、3D甚至4D），有些算法可以重复，有些算法性能更高等等。

我们可以使用经典的柏林噪声

```glsl:line-numbers
//  Classic Perlin 2D Noise 
//  by Stefan Gustavson
//
vec4 permute(vec4 x)
{
  return mod(((x*34.0)+1.0)*x, 289.0);
}

vec2 fade(vec2 t)
{
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}
```

在代码中使用

```glsl
void main()
{
  float strength = cnoise(vUv * 10.0);

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221203231249160.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

或者我们设置一个取值范围，小于`0`的部分直接`0`，大于`0`的部分为`1`

```glsl
void main()
{
  float strength = step(0.0, cnoise(vUv * 10.0));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221203231552823.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

或者我们可以使用绝对值

```glsl
void main()
{
  float strength = abs(cnoise(vUv * 10.0));

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221203231746671.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

或者我们可以加入三角函数，控制一定范围之内的`y`值

```glsl
void main()
{
  float strength = sin(cnoise(vUv * 10.0) * 10.0);

  gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221203232105423.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以用`mix()`函数来混合这些颜色与图形

```glsl
void main()
{
  vec3 blackColor = vec3(0.0);
  vec3 uvColor = vec3(vUv, 1.0);
  float strength = sin(cnoise(vUv * 10.0) * 10.0);
  
  // mix()函数，值为0时取第一个参数，值为1时取第二个参数，值介于0和1之间时用算法混合颜色
  vec3 mixedColor = mix(blackColor, uvColor, strength);

  gl_FragColor = vec4(mixedColor, 1.0);
}
```

<p>
  <img src=".\images\image-20221203232922662.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

但这个算法有个问题，当有几何体有焦点时会出现这种状况，这些焦点会很亮

<p>
  <img src=".\images\image-20221203233403936.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>

我们可以用`clamp()`函数来使焦点上的值控制在0和1之间

```glsl
void main()
{
  // ...
  
  strength = clamp(strength, 0.0, 1.0);
  
  // ...
}
```

<p>
  <img src=".\images\image-20221203233752757.png" style="margin:0 auto;border-radius:8px;width:300px">
</p>
