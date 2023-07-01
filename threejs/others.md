# 问题解决 :hammer_and_wrench:

## 金属相关的材质不反光的问题

当在场景中导入模型会出现一些金属材质的模型失去反光的效果，如下图所示：

<p>
  <img src=".\images\image-20230224155738971.png" style="margin:0 auto;border-radius:8px">
</p>

1. 这可能是由于加载的时候出现材质丢失，解决方式是加载够给他复制颜色而不是用自发光

    解决办法：遍历模型中所有的材质为他们附上自带的颜色（不推荐）

    ```ts
    gltf.scene.traverse(child => {
        if (child instanceof t.Mesh && child.material instanceof t.MeshStandardMaterial) {
            child.material.emissive = child.material.color
            child.material.emissiveMap = child.material.map
        }
    })
    ```

    <p>
    <img src=".\images\image-20230224161253889.png" style="margin:0 auto;border-radius:8px">
    </p>
  
2. 也可能是你在导出三维模型的时候材质出现了问题，需重新使用模型导出软件检查材质后导出

## 场景贴图

遇到模型金属度显示不出来的问题一般为没有设置场景而导致没有光线让其反射解决方法如下：

**步骤1**：加载`EXRloader`

```ts
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader'
```

**步骤2**：在场景中使用

```ts
const scene = new t.Scene()
scene.environment = new EXRLoader().load('sunset.exr')
scene.environment.mapping = t.EquirectangularReflectionMapping
```
