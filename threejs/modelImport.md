# 导入模型并使用UV贴图 :beverage_box:

## 使用贴图

我们使用纹理贴图``textureLoader``来加载我们的`UV`贴图

```ts
const bakedTexture = new textureLoader.load('baked.jpg')
```

:::tip
因为法线的缘故你贴上去的图可能按照Y轴翻转了，我们得将他翻转过来

```ts
backedTexture.flipY = false
```

:::

我们使用`t.MeshBasicMaterial()`来初始化贴图材质

```ts
const bakedMaterial = new t.MeshBasicMaterial({ map: bakedTexture })
```

让物体的所有子元素的材质都使用`bake`的材质也就是`UV`贴图

```ts
const gltfLoader = new GLTFLoader()
gltfLoader.load(
    new URL('../assets/models/Duck/glTF/XXX.gltf', import.meta.url).href,
    (gltf) => {
        gltf.scene.traverse((child)=>{
            child.material = bakedMaterial
        })
    }
)
```

## 优化贴图与渲染

在贴完图后我们会发现这个模型的颜色，对比度会不太准确我们可以微调他

- 对于贴图的优化

    ```ts
    bakedTexture.encoding = t.sRGBEncoding
    ```

- 对于渲染器`renderer`的优化

     ```ts
     renderer.outputEncoding = t.sRGBEncoding
     ```

## 自发光材质的处理

有些自发光的物体由于在`UV`展开时，并没有被选择所以会在贴图时被整张图包裹，记得在**Blender**中将自发光的模型放在同一组中

**步骤1**：我们需要重新创建一个基础的材质用于自发光的物体，别忘了给`color`

```ts
const xxxMaterial = new t.MeshBasicMaterial({ color: 0xffffff }) 
// 或 0xffffe5，有时候我们会添加side: t.DoubleSide 来让自发光的物体正反两面可视
```

**步骤2**：我们可以使用`.find()`参数来找到那个相应的材质`.find()`函数不会改变数组中原有的元素，而是会返回数组中匹配的第一个数

 ```ts
 const xxxemissionMesh = gltf.scene.children.find(child => child.name === 'xxxx')
 ```

**步骤3**：将创建的自放光材质赋值给找到的自发光物体的`material`

```ts
xxxemissionMesh.material = xxxMaterial
```

## 性能优化

 1. 在**Blender**将模型的所有分散的物体合并成一个物体，并取消掉所有的材质，最后导出白模

 2. 由于我们将模型所有的物体合并在了一起，所以在第三点中我们要循环遍历所有的物体这会非常损耗性能，我们可以将它改为如下的操作方式

```ts
const gltfLoader = new GLTFLoader()
gltfLoader.load(
    new URL('../assets/models/Duck/glTF/XXX.gltf', import.meta.url).href,
    (gltf) => {
        const bakedMesh = gltf.scene.children.find(child => child.name === 'baked')
    }
    bakedMesh.material = bakedMaterial
)
```
