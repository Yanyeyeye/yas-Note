# 加载进度 :stopwatch:

我们在加载模型以及贴图的时候，由于电脑的性能不会一下子加载出来，模型在加载好之后突然闪出来，为了解决这个问题我们可以设置一个黑屏的延时时间，当模型加载好时再显示。

## 准备

**步骤1**：加载进度的动画我们可以使用一个平面几何放在整个屏幕的中央，这个几何平面使用着色器材质`ShaderMaterial`

```ts:line-numbers
const overlayGeometry = new t.PlaneGeometry(1, 1, 1, 1)
const overlayMaterial = new t.ShaderMaterial(
    {
    vertexShader: `
        void main(){
            gl_Position = vec4(position, 1.0);
        }`,
    fragmentShader: `
        void main(){
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }`,
    },
)
const overlay = new t.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)
```

<p>
  <img src=".\images\image-20221213105843707.png" style="margin:0 auto;border-radius:8px">
</p>

**步骤2**：平面顶点坐标是从`-0.5`到`0.5`，我们可以将整个平面变大以填满整个屏幕

```ts
const overlayGeometry = new t.PlaneGeometry(2, 2, 1, 1)
```

**步骤3**：我们可以将整个平面的颜色变为黑色，并设置α的值，同样不要忘记添加`transparent`为`true`

```ts:line-numbers
const overlayGeometry = new t.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new t.ShaderMaterial(
    {
        transparent: true,
        fragmentShader: `
            void main(){
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.5);
            }`,
    },
)
const overlay = new t.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)
```

**步骤4**：我们也可以将`α`值改为`uniform`来进行调整

```ts:line-numbers
const overlayGeometry = new t.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new t.ShaderMaterial({
    transparent: true,
    uniforms: {
        uAlpha: {
            value: 1,
        },
    },
    vertexShader: `
        void main(){
            gl_Position = vec4(position, 1.0);
        }`,
    fragmentShader: `
        uniform float uAlpha;
            void main(){
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }`,
},
)
const overlay = new t.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)
```

**步骤5**：我们可以使用`LoadingManager`来控制不同阶段`Loader`加载器的状态以及要运行的代码

```ts
/**
* Loaders
*/
const loadingManager = new t.LoadingManager()
const gltfLoader = new GLTFLoader(loadingManager)
const cubeTextureLoader = new t.CubeTextureLoader(loadingManager)
```

`Loading`中有两个回调函数，可以在不同的阶段执行

```ts
const loadingManager = new t.LoadingManager(
    // Loaded
    () =>
    {
        console.log('loaded')
    },

    // Progress
    () =>
    {
        console.log('progress')
    }
)
```

所以我们在`LoadingManager`里面来改变之前定义的`uAlpha`的值

```ts
import { gsap } from 'gsap'

// ...

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        // 持续三秒数值的变化从0到1
        gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
    },

    // ...
)
```

**步骤6**：我们是在当前开发者的环境下进行开发的，所有的东西加载起来都非常的快，但是我们可以模拟低的带宽

1. 我们在chrome里打开`Disable cache`

    <p>
    <img src=".\images\image-20221213144930666.png" style="margin:0 auto;border-radius:8px">
    </p>

2. 设置自定义的限流阀

    <p>
    <img src=".\images\image-20221213145042262.png" style="margin:0 auto;border-radius:8px">
    </p>

3. 保存并使用
    <p>
    <img src=".\images\image-20221213145119289.png" style="margin:0 auto;border-radius:8px">
    </p>

## 初始化

在设置完上述的配置后需要设置`html`与`css`来增加一个进度条

```html
<body>
    <canvas class="webgl"></canvas>
    <div ref="loadingBar" class="top-1/2 h-0.5" absolute w-full bg-white/>
</body>
```

<p>
    <img src=".\images\image-20221213151036738.png" style="margin:0 auto;border-radius:8px">
</p>

现在有条线在屏幕中央我们把它现藏起来藏到屏幕的左边

```css tailwind
transform="~ scale-x-0 origin-top-left"
```

我们在`LoadingManager`中监控一下

- `itemUrl`： 被加载的项的url。
- `itemsLoaded`： 目前已加载项的个数。
- `itemsTotal` ： 总共所需要加载项的个数。

```ts
const loadingManager = new t.LoadingManager(
    // ...

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        console.log(itemUrl, itemsLoaded, itemsTotal)
    }
)
```

<p>
    <img src=".\images\image-20221213153010292.png" style="margin:0 auto;border-radius:8px">
</p>

我们发现他到最后就变成了两个相同的数字，我们可以用`itemsLoaded / itemsTotal`的方法，来计算这个值，并用它来控制进度条

```ts
const loadingBar = ref<HTMLDivElement | null>(null)

const loadingManager = new t.LoadingManager(
    () => {
        gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
        const progressRatio = itemsLoaded / itemsTotal
        loadingBar.value!.style.transform = `scaleX(${progressRatio})`
    })
const gltfLoader = new GLTFLoader(loadingManager)
const cubeTextureLoader = new t.CubeTextureLoader(loadingManager)
```

## 动画

我们给这个进度条加点动画

```css
transition="duration-500"
```

我们在给这个离开的动画

```css
.ended {
    transform: scaleX(0);
    transform-origin: 100% 0;
    transition: transform 1.5s ease-in-out;
}
```

在加载的时候使用它

```ts
const loadingManager = new t.LoadingManager(
    () => {
    gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
    loadingBar.value!.classList.add('ended')
    loadingBar.value!.style.transform = ''
    },
    // ...
)
```

## 问题解决

但我们还发现一个问题，当模型加载完了之后，进度条会一下子消失，原因有以下两点：

1. 第一次渲染场景中的元素需要时间，计算机会暂时冻结。
2. 我们在进度条中添加了0.5秒的过渡时长。这也就意味着，当加载函数被触发时，进度条还没有完成到结束状态的转换。

```ts
const loadingManager = new t.LoadingManager(
    () => {
    gsap.delayedCall(0.5, () => {
        gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
        loadingBar.value!.classList.add('ended')
        loadingBar.value!.style.transform = ''
    })
    },
    (itemUrl, itemsLoaded, itemsTotal) => {
    const progressRatio = itemsLoaded / itemsTotal
    loadingBar.value!.style.transform = `scaleX(${progressRatio})`
    },
)
```

这样当进度条消失的时候会非常的顺滑

:::tip
但混合`HTML`与`WebGL`非常影响性能
:::
