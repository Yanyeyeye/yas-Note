# 字体Fonts :mahjong:

::: tip
`ThreeJS`中提供了一些字体位置为：

```bash
\node_modules\three\examples\fonts
```

:::

## 字体加载（`vite`）

```ts
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
const loader = new FontLoader()
loader.load(
  new URL('../assets/fonts/helvetiker_bold.typeface.json', import.meta.url).href,

  // onLoad回调
  (font) => {
    // do something with the font
    console.log(font)
  },

  // onProgress回调
  (xhr) => {
    console.log(`${xhr.loaded / xhr.total * 100}% loaded`)
  },

  // onError回调
  (err) => {
    console.log(`An error happened${err}`)
  },
)
```

## 使用字体

```ts
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
const loader = new FontLoader()
loader.load(
  new URL('../assets/fonts/helvetiker_bold.typeface.json', import.meta.url).href,
  (font) => {
    const geometry = new TextGeometry(
      'Yanyeyeyes', // 要实现的字体
      {
        font, // 所加载使用的字体
        size: 0.5, // 字体大小
        height: 0.2, // 文本厚度
        curveSegments: 12, // 文本曲线上点的数量
        bevelEnabled: true, // 是否开启斜角，默认为false
        bevelThickness: 0.03, // 文本上斜角的深度
        bevelSize: 0.02, // 斜角与原始原始轮廓之间的距离
        bevelSegments: 5, // 斜角的分段数
      },
    )
    const material = new t.MeshMatcapMaterial() // 使用材质捕捉纹理
    material.wireframe = true // 将文字镂空
    const mesh = new t.Mesh(geometry, material)
    scene.add(mesh)
  },
)
```

### 实现文字的居中

- `.computeBoundingBox()`计算当前 `bufferGeometry` 的外边界矩形
- `.computeBoundingSphere()`计算当前 `bufferGeometry` 的外边界球形

```ts
geometry.computeBoundingBox() // 获取边界值
// 将得到的边界值移动各一半,要注意截取斜角的深度
geometry.translate(
    -(geometry.boundingBox!.max.x - 0.02) / 2,
    -(geometry.boundingBox!.max.y - 0.02) / 2,
    -(geometry.boundingBox!.max.z - 0.03) / 2,
)
// 或
// 直接使用.center()
geometry.center()
```

<p>
  <img src=".\images\image-20221105153128316.png" style="margin:0 auto;border-radius:8px">
</p>

<p>
  <img src=".\images\image-20221105153342925.png" style="margin:0 auto;border-radius:8px">
</p>
  
### 为字体添加材质

```ts
const textureLoader = new t.TextureLoader()
const textureMatcap = textureLoader.load(
  new URL('../assets/textures/matcaps/1.png', import.meta.url).href
)
const material = new t.MeshMatcapMaterial({ matcap: textureMatcap })
```

<p>
  <img src=".\images\image-20221105160011495.png" style="margin:0 auto;border-radius:8px">
</p>

添加其它的物体

```ts
console.time('box') // 用于计算花了多长时间来渲染

const geometry = new t.BoxGeometry(1, 1, 1)
const material = new t.MeshMatcapMaterial({ matcap: textureMatcap }) // 可以复用之前的材质

for (let i = 0; i < 500; i++) {
  const box = new t.Mesh(geometry, material)
  // 改变box的位置
  box.position.x = (Math.random() - 0.5) * 10
  box.position.y = (Math.random() - 0.5) * 10
  box.position.z = (Math.random() - 0.5) * 10

  // 改变box的朝向
  box.rotation.x = Math.random() * Math.PI
  box.rotation.y = Math.random() * Math.PI

  // 改变box大小
  const scale = Math.random()
  box.scale.x = scale
  box.scale.y = scale
  box.scale.z = scale
  // box.scale.set(scale, scale, scale)

  scene.add(box)
}
console.timeEnd('box') // 用于计算花了多长时间来渲染
```

<p>
  <img src=".\images\image-20221105162243106.png" style="margin:0 auto;border-radius:8px">
</p>
