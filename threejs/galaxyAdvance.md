# 进阶银河系 :hole:

## 准备

我们对之前的银河系的`Material`进行修改成`ShaderMaterial`,并添加相应的`.glsl`文件进行初始化

```ts
import GalaxyVertexShader from '../glsl/vertex_galaxy.glsl'
import GalaxyFragmentShader from '../glsl/fragment_galaxy.glsl'

let material: t.ShaderMaterial | null

material = new t.ShaderMaterial({
    vertexShader: GalaxyVertexShader,
    fragmentShader: GalaxyFragmentShader,
    depthWrite: false,
    blending: t.AdditiveBlending,
    vertexColors: true,
})
```

### `vertex_galaxy.glsl`文件

```glsl
    void main(){

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition =  viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

    gl_PointSize = 2.0;
}
```

### `fragment_galaxy.glsl`文件

```glsl
void main(){
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
```

## 初始化

我们加入`uniform`来控制粒子的大小

```ts
material = new t.ShaderMaterial({
    // ...
    uniforms: {
        uSize: {
            value: parameters.size,
        },
    },
})
```

在顶点文件`vertex_galaxy.glsl`中

```glsl
uniform float uSize;

void main(){
    // ...
    gl_PointSize = uSize;
}
```

我们可以调整每个粒子的大小，让他变成随机的大小

```ts
const generateGalaxy = () => {
    // ...
    const scales = new Float32Array(parameters.count * 1)

    scales[i] = Math.random()
    // ...
}
geometry.setAttribute('aScale', new t.BufferAttribute(scales, 1))
```

并在`gl_PointSize`中使用它`aScale`

```glsl
uniform float uSize;

attribute float aScale;

void main(){
    // ...
    gl_PointSize = uSize * aScale;
}
```

我们可以通过`window.devicePixelRatio`来获得屏幕上像素的大小，使不同设配上的像素都显示一样大，不过我们使用`renderer.getPixelRatio()` 来获取屏幕上设置的像素大小，这是因为我们之前已经按照这个`renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`设定过了

```ts
material = new t.ShaderMaterial({
    // ...
    uniforms: {
        uSize: {
            value: parameters.size * renderer.getPixelRatio(),
        },
    },
})
```

但这会出一个bug，因为我们在`render`渲染之前来获取屏幕上像素的大小，我们需要将生成银河的代码放到`render`下面

```ts
const renderer = new t.WebGLRenderer()
generateGalaxy() ← 在renderer之后来生成银河
renderer.setSize(SIZE.width, SIZE.height)
renderer.setClearColor(0x000, 1)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
```

<p>
  <img src=".\images\image-20221206122010459.png" style="margin:0 auto;border-radius:8px">
</p>

对于粒子虽然大小不一样了但是视觉的变化还是不能让随着变化，远的粒子和近的粒子都不会有什么差别，这是因为我们没有设置`sizeAttenuation`属性，因为着色器材质不支持，因此我们会自行设置尺寸衰减来模拟透视。

在`ThreeJS`的包里有着色器的代码路径如下：
`/node_modules/three/src/renderers/shaders/ShaderLib/point_vert.glsl.js`

```glsl
#ifdef USE_SIZEATTENUATION

    bool isPerspective = isPerspectiveMatrix( projectionMatrix );

    if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );

#endif
```

想要获得尺寸衰减，需要用`gl_PointSize`去乘以`( scale / - mvPosition.z )`，而根据`Threejs`，这个`scale`是与渲染高度相关的值，此处为易于控制，我们会用1.0替代。而`mvPosition`其实就是`modelViewPosition`，也就是我们原本代码里边在应用`modelMatrix`和`viewMatrix`得到后的位置变量`viewPosition`，因此可以直接在顶点着色器中这样写

```glsl
gl_PointSize = uSize * aScale;
gl_PointSize *= (1.0 / - viewPosition.z);
```

<p>
  <img src=".\images\image-20221206143840373.png" style="margin:0 auto;border-radius:8px">
</p>

## 变形

我们可以把这些方平改成圆圈，就要使得圆的部分可见，圆外部分不可见

我们需要用`gl_PointCoord`来获得每个粒子的uv坐标

<p>
  <img src=".\images\image-20221206144619386.png" style="margin:0 auto;border-radius:8px">
</p>

```glsl
void main(){

    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = step(0.5, strength);
    strength = 1.0 - strength;
    
    gl_FragColor = vec4(vec3(strength), 1.0);
}
```

效果如下：
<p>
  <img src=".\images\image-20221206145533517.png" style="margin:0 auto;border-radius:8px">
</p>

但这个粒子的颜色在重叠后颜色会很亮，我们让他呈现出周围暗中间亮的特征

<p>
  <img src=".\images\image-20221206145951796.png" style="margin:0 auto;border-radius:8px">
</p>

```glsl
void main(){

    float strength = distance(gl_PointCoord, vec2(0.5));
    strength *= 2.0;
    strength = 1.0 - strength;

    gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221206150054198.png" style="margin:0 auto;border-radius:8px">
</p>

我们可以让中间更亮一些，周围暗一些呈现出与轴呈反比的趋势

在这里我们可以用`pow()`函数来处理，离中心越远的地方值会一下子变小，越近的地方值不会变的很小

<p>
  <img src=".\images\image-20221206151000585.png" style="margin:0 auto;border-radius:8px">
</p>

```glsl
void main(){

    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);

    gl_FragColor = vec4(vec3(strength), 1.0);
}
```

<p>
  <img src=".\images\image-20221206153053006.png" style="margin:0 auto;border-radius:8px">
</p>

## 上色

接下来我们给每个部分加上些颜色，因为之前我们在定义`ShaderMaterial`的时候已经定义了`vertexColors: true`，所以在`vertex`中已经声明了`attribute vec3 color`

我们将这个声明的`color`传送给`fragment`文件

```glsl
// ...
varying vec3 vColor;

void main(){
    // ...
    vColor = color;
}
```

在`fragment`文件中我们用`mix()`函数根据距离来渲染它

```glsl
varying vec3 vColor;

void main(){

    // ...
    vec3 color = mix(vec3(0.0), vColor, strength);
}
```

<p>
  <img src=".\images\image-20221206160135646.png" style="margin:0 auto;border-radius:8px">
</p>

## 动画

我们给这个星系加上动画

**步骤1**：首先声明`uTime`并给他赋值

```ts
material = new t.ShaderMaterial({
    // ...
    uniforms: {
        uTime: {
            value: 0,
        },
        // ...
    },
})

const clock = new t.Clock() // 从初始化时就开始运行
// animate()
const animate = () => {
// ...
// TODO
material!.uniforms.uTime.value = elapsedTime
// ...
}
animate() // 调用动画函数
```

我们对于整个星系上的每个粒子都是在同一个`x`与`y`的平面上

<p>
  <img src=".\images\image-20221206163944471.png" style="margin:0 auto;border-radius:8px">
</p>

当内部的粒子在旋转时，我们要注意到粒子相对于场景中心的距离，当旋转角度一致时距离越大，旋转的速度越快，但在这里我们需要让这个银河朝着中心扭曲，所以需要靠近场景中间的粒子旋转的角度大一些远处的小一些

**步骤2**：我们用`arctan`来获得两个值之间的角度变化量

```glsl
void main(){
    // ...
    float angle = atan(modelPosition.x, modelPosition.z);
    // ...
}
```

再获得每个粒子距离中心的距离

```glsl
void main(){
    // ...
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    // ...
}
```

计算偏转角度，随着时间变化，越靠近中心，偏转角度量就越大，反之离中心越远，偏转角度越小，乘以0.2是为了缓冲角度变化量

```glsl
void main(){
    // ...
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
    // ...
}
```

给粒子的基角度

```glsl
void main(){
    // ...
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
    angle += angleOffset;
    // ...
}
```

最后用`cos()`和`sin()`来更新位置`modelPosition`的x轴和y轴上边的值

```glsl
void main(){
    // ...
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
    angle += angleOffset;
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;
    // ...
}
```

我们会发现时间久了这个银河在一直向中间塌陷就会变成下图这个样子，中心地带会呈现很清晰的环状地带而不是随机分布

<p>
  <img src=".\images\image-20221206170405261.png" style="margin:0 auto;border-radius:8px">
</p>

我们可以移除原来的随机值并重新添加一个属性给`material`

```ts
const generateGalaxy = () => {
    // ...
    const randomness = new Float32Array(parameters.count * 3)

    positions[i3] = Math.cos(branchAngle) * radius // x
    positions[i3 + 1] = 0// y
    positions[i3 + 2] = Math.sin(branchAngle) * radius// z

    const randomX = Math.random() ** parameters.randomnessPower * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
    const randomY = Math.random() ** parameters.randomnessPower * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius
    const randomZ = Math.random() ** parameters.randomnessPower * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius

    randomness[i3] = randomX
    randomness[i3 + 1] = randomY
    randomness[i3 + 2] = randomZ
    // ...
}
geometry.setAttribute('arandomness', new t.BufferAttribute(randomness, 3))
```

并在`vertex`中使用它

```glsl
attribute vec3  aRandomness;

void main(){
    // ...

    modelPosition.xyz += aRandomness;

    // ...
}
```

最后的效果如下：

<p>
  <img src=".\images\image-20221206172433563.png" style="margin:0 auto;border-radius:8px">
</p>
