# 制作一个流动的海洋 :ocean:

## 准备

**步骤1**：准备一个平面并写好基础代码，得让平面平躺

```ts
const planeGeometry = new t.PlaneGeometry(2, 2, 128, 128)

const plane = new t.Mesh(planeGeometry, material)
plane.rotation.x = -Math.PI * 0.5
scene.add(plane)
```

**步骤2**：让其随着`sin()`动起来，Y轴上的坐标根据X的值变化

```glsl
void main()
{
// ...

    modelPosition.y += sin(modelPosition.x);
    
    // ...
}
```

<p>
  <img src=".\images\image-20221205103904969.png" style="margin:0 auto;border-radius:8px;">
</p>

## 初始化

**步骤1**：声明一个变量用来控制波浪强弱

```ts
const material = new t.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    uBigWavesElevation: {
      value: 0.2,
    },
  },
  side: t.DoubleSide,
})
```

**步骤2**：在顶点`.vertex`文件中接收并赋值

```glsl
uniform float uBigWavesElevation;

void main()
{
    // ...
    float elevation = sin(modelPosition.x) * uBigWavesElevation;
    modelPosition.y += elevation;
// ...
}
```

**步骤3**：并将该值添加入`Dat.GUI`中

```ts
gui.add(material.uniforms.uBigWavesElevation, 'value')
  .min(0)
  .max(1)
  .step(0.001)
  .name('uBigWavesElevation')
```

我们可以用相同的方法让Z轴也跟着像波浪那样动起来

```glsl
float elevation = sin(modelPosition.x * uBigWavesFrequency.x) * // 控制X轴向
  sin(modelPosition.z * uBigWavesFrequency.y) * // 控制Z轴向
  uBigWavesElevation;
modelPosition.y += elevation;
```

并添加值到`Dat.GUI`中

```ts
gui.add(material.uniforms.uBigWavesFrequency.value, 'x')
  .min(0)
  .max(10)
  .step(0.001)
  .name('uBigWavesFrequencyX')

gui.add(material.uniforms.uBigWavesFrequency.value, 'y')
  .min(0)
  .max(10)
  .step(0.001)
  .name('uBigWavesFrequencyY')
```

**步骤4**：我们声明一个时间的变量来让海浪动起来

```ts
const material = new t.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    // ...
    uTime: {
      value: 1,
    },
  },
  side: t.DoubleSide,
})

const clock = new t.Clock() // 从初始化时就开始运行
// animate()
const animate = () => {
  // ...
  const elapsedTime = clock.getElapsedTime() // 得到过去的时间，返回的是秒
  // TODO
  // Update water
  material.uniforms.uTime.value = elapsedTime
  
  // ...
}
animate() // 调用动画函数
```

**步骤5**：在`vertex`文件中同样申明相同的变量

```glsl
uniform float uTime;

void main()
{

  float elevation = sin(modelPosition.x * uBigWavesFrequency.x + uTime) *         sin(modelPosition.z * uBigWavesFrequency.y + uTime) *         uBigWavesElevation;
  modelPosition.y += elevation;
}
```

**步骤6**：同样我们声明一个变量来控制整个波浪的速率

```ts
const material = new t.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    // ...
    uTime: {
      value: 0,
    },
    uBigWavesSpeed: {
      value: 1,
    },
  },
  side: t.DoubleSide,
})
```

并添加值到`Dat.GUI`中；

```ts
gui.add(material.uniforms.uBigWavesSpeed, 'value')
  .min(0)
  .max(4)
  .step(0.01)
  .name('uBigWavesSpeed')
```

**步骤7**：我们可以声明海浪的颜色变量浪高的地方颜色浅一些，浪低的地方颜色深一些，并用debug来控制他

```ts
const debugObject = {
  depthColor: '#0000ff',
  surfaceColor: '#8888ff',
}

const material = new t.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    // ...
    uDepthColor: {
      value: new t.Color(debugObject.depthColor),
    },
    uSurfaceColor: {
      value: new t.Color(debugObject.surfaceColor),
    },
  },
  side: t.DoubleSide,
})
```

我们给他加上debug

```ts
gui.addColor(debugObject, 'depthColor')
  .name('depthColor')
  .onChange(() => {
    material.uniforms.uDepthColor.value.set(debugObject.depthColor)
  })
gui.addColor(debugObject, 'surfaceColor')
  .name('surfaceColor')
  .onChange(() => {
    material.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
  })
```

**步骤8**：我们需要获得海浪的翻滚的强度也就是之前声明的`elevation`，并要将其传给`fragment`文件来使用

```glsl
varying float vElevation;

void main()
{
  // ...
  float elevation = sin(modelPosition.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) * sin(modelPosition.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) * uBigWavesElevation;
  
  // ...
  vElevation = elevation;
}
```

**步骤9**：在`fragment`文件中声明之前的两个颜色变量，并接收`vElevation`用`mix()`函数来实现海浪颜色的变化

```glsl
uniform vec3 uDepthColor
uniform vec3 uSurfaceColor
varying float vElevatioN

void main()
{
  vec3 color = mix(uDepthColor, uSurfaceColor, vElevation);
  gl_FragColor = vec4(color, 1.0);
}   
```

**步骤10**：我们可以加上些颜色的偏移量以及颜色的倍数来控制波浪的颜色

```ts
const material = new t.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    // ...
    uColorOffset: {
      value: 0.25,
    },
    uColorMultiplier: {
      value: 2,
    },
  },
  side: t.DoubleSide,
})
```

设置deBug

```ts
gui.add(material.uniforms.uColorOffset, 'value')
  .min(0)
  .max(1)
  .step(0.001).
  name('uColorOffset')
gui.add(material.uniforms.uColorMultiplier, 'value')
  .min(0)
  .max(10
  ).step(0.001)
  .name('uColorMultiplier')
```

**步骤11**：我们可以加上`mixStrength`来控制混合颜色的强度

```glsl
uniform float uColorOffset;
uniform float uColorMultiplier;

void main()
{
  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
  vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
  gl_FragColor = vec4(color, 1.0);
}
```

<p>
  <img src=".\images\image-20221205152100584.png" style="margin:0 auto;border-radius:8px">
</p>

## 柏林噪音

我们可以用之前学的柏林噪音来制造些小波浪

<p>
  <img src=".\images\image-20221205152152032.png" style="margin:0 auto;border-radius:8px">
</p>

以下是他的文件内容：

```glsl
// Classic Perlin 3D Noise 
// by Stefan Gustavson
//
vec4 permute(vec4 x)
{
  return mod(((x*34.0)+1.0)*x, 289.0);
}
vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}
vec3 fade(vec3 t)
{
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec3 P)
{
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}
```

**步骤1**：我们在`vertex`文件中使用它

```glsl
void main()
{
  // ...
  float elevation = sin(modelPosition.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) * sin(modelPosition.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) * uBigWavesElevation;

  elevation += cnoise(vec3(modelPosition.xz, uTime));

  modelPosition.y += elevation;
  // ...
}
```

我们让他的时间的频率慢一些

```glsl
elevation += cnoise(vec3(modelPosition.xz, uTime * 0.2));
```

波浪多一些

```glsl
elevation += cnoise(vec3(modelPosition.xz * 3.0, uTime * 0.2));
```

浪高小一些

```glsl
elevation += cnoise(vec3(modelPosition.xz * 3.0, uTime * 0.2)) * 0.15;
```

<p>
  <img src=".\images\image-20221205160127638.png" style="margin:0 auto;border-radius:8px">
</p>

**步骤2**：一般浪没有那么平滑会有一些棱角和凹凸的地方，我们对其取绝对值再相减

```glsl
elevation -= abs(cnoise(vec3(modelPosition.xz * 3.0, uTime * 0.2)) * 0.15);
```

<p>
  <img src=".\images\image-20221205160720041.png" style="margin:0 auto;border-radius:8px">
</p>

我们给大浪上加一些小浪花，我们用循环来解决，并用`i`来控制

```glsl
for(float i = 1.0; i <= 3.0; i++){
  elevation -= abs(cnoise(vec3(modelPosition.xz * 3.0 * i, uTime * 0.2)) * 0.15);
}
```

<p>
  <img src=".\images\image-20221205161225768.png" style="margin:0 auto;border-radius:8px">
</p>

**步骤3**：但这些波浪的浪高很奇怪呈现出许多倒刺的感觉，我们需要用`i`来减弱它，我们需要降低最外层的浪高

```glsl
for(float i = 1.0; i <= 3.0; i++){
  elevation -= abs(cnoise(vec3(modelPosition.xz * 3.0 * i, uTime * 0.2)) * 0.15 / i);
}
```

<p>
  <img src=".\images\image-20221205162803237.png" style="margin:0 auto;border-radius:8px">
</p>

我们需要给它增加更多浪的细节，也就是需要扩大原始平面的细节将其增加到`512x512`并且增加小浪的数量来实现更多的细节

```ts
const planeGeometry = new t.PlaneGeometry(2, 2, 512, 512)
```

```glsl
for(float i = 1.0; i <= 4.0; i++){
    elevation -= abs(cnoise(vec3(modelPosition.xz * 3.0 * i, uTime * 0.2)) * 0.15 / i);
}
```

<p>
  <img src=".\images\image-20221205163250433.png" style="margin:0 auto;border-radius:8px">
</p>

**步骤4**：我们将这些固定的值变成可以自定义调节的值

```ts
const material = new t.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    // ...
    uSmallWavesElevation: {
      value: 0.15,
    },
    uSmallWavesFrequency: {
      value: 3,
    },
    uSmallWavesSpeed: {
      value: 0.2,
    },
    uSmallInterations: {
      value: 4.0,
    },
  },
  side: t.DoubleSide,
})
```

在`vertex`里接收这些值

```glsl
uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallInterations;

void main()
{
  // ...
  for(float i = 1.0; i <= uSmallInterations; i++){
    elevation -= abs(cnoise(vec3(modelPosition.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i);
  }
  // ...
}
```

并把他们添加进`Debug`中

```ts
gui.add(material.uniforms.uSmallWavesElevation, 'value')
  .min(0)
  .max(1)
  .step(0.001)
  .name('uSmallWavesElevation')
gui.add(material.uniforms.uSmallWavesFrequency, 'value')
  .min(0)
  .max(30)
  .step(1)
  .name('uSmallWavesFrequency')
gui.add(material.uniforms.uSmallWavesSpeed, 'value')
  .min(0)
  .max(4)
  .step(0.001)
  .name('uSmallWavesSpeed')
gui.add(material.uniforms.uSmallInterations, 'value')
  .min(0)
  .max(10)
  .step(1)
  .name('uSmallInterations')
```

<p>
  <img src=".\images\image-20221205165123809.png" style="margin:0 auto;border-radius:8px">
</p>
