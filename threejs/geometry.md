# 几何Geometry

## 初始化

### BufferGeometry几何缓冲区

这个类是面片、线或点几何体的有效表述。包括顶点位置，面片索引、法相量、颜色值、UV 坐标和自定义缓存属性值。

```JS
const geometry = new t.BufferGeometry()
```

::: tip
使用**BufferGeometry**可以有效减少向**GPU**传输上述数据所需的开销。
:::

### 类数组

首先要了解诸如`Int8Array`、`Int16Array`、`Float32Array`之类的类数组，他们是用来定义数组中每个数在内存中所存储容量的大小，访问[TypeArray.com](http://www.yanhuangxueyuan.com/Javascript/typeArray.html)来了解他们

我们使用类数组定义内部的一个顶点需要占多少的空间

- 直接定义内部的顶点

    ```js
    const positionArray = new Int8Array([
        0, 0, 0,  // 第一个顶点的x, y, z坐标
        0, 1, 0,  // 第二个顶点的x, y, z坐标
        1, 0, 0   // 第三个顶点的x, y, z坐标
    ])
    ```

- 或先定义有多少个顶点，在向其中的位置上赋值

    ```js
    const positionArray = new Int8Array(9)  // 先定义需要多少个空间
    // 第一个顶点
    positionArray[1] = 0  // x的坐标
    positionArray[2] = 0  // y的坐标
    positionArray[3] = 0  // z的坐标
    // 第二个顶点
    positionArray[4] = 0  // x的坐标
    positionArray[5] = 1  // y的坐标
    positionArray[6] = 0  // z的坐标
    // 第三个顶点
    positionArray[7] = 1  // x的坐标
    positionArray[8] = 0  // y的坐标
    positionArray[9] = 0  // z的坐标
    ```

### BufferAttribute属性缓冲区

这个类用于存储与[BufferGeometry](/threejs/geometry.html#buffergeometry几何缓冲区)相关联的`attribute`（例如：顶点位置向量，面片索引，法向量，颜色值，UV坐标以及任何自定义`attribute`）

```js
// 第一个参数是TypedArray类型的数组，就是用Int8Array之类定义的类数组
// 第二个参数是每多少数为一个顶点
const positionAttribute = new t.BufferAttribute(positionArray, 3)
```
  
在由*BufferGeometry*生成的`geometry`中定义`position`位置属性

```js
// 第一个参数是属性名
// 第二个参数是属性值
geometry.setAttribute('position', positionAttribute)
```

::: tip

- 利用**BufferAttribute**，可以更高效的向**GPU**传递数据。
- 更多内容详见 [Threejs BufferAttribute](https://threejs.org/docs/index.html?q=BufferAttribute#api/zh/core/BufferAttribute)

:::

### 代码示例

```js:line-numbers {9-10}
const geometry = new t.BufferGeometry()
const count = 50  // 生成三角形的数量

// 三角形有三个顶点每个顶点有x,y,z三个方向 
const positionArray = new Int8Array(count * 3 * 3) 
for (let i = 0; i < count * 3 * 3; i++)
    positionArray[i] = (Math.random() - 0.5) * 40

const positionAttribute = new t.BufferAttribute(positionArray, 3)
geometry.setAttribute('position', positionAttribute)

const material = new t.MeshBasicMaterial( { color: 0xff0000 } );
const mesh = new t.Mesh( geometry, material );
scene.add(mesh)
```

## 物体的结构

可以使用`wireframe: true`来显示物体的网格结构

  ```js
  const cube1 = new t.Mesh(
      new t.BoxGeometry(30, 30, 30, 1, 2, 1),
      new t.MeshBasicMaterial({ color: '#f6bd1d', wireframe: true }),
  )
  ```

## 清除所有模型

清理几何体与模型来释放内存

  ```js
  if (group) {
      group.traverse(item => {
          if (item instanceof t.Mesh) {
              if (Array.isArray(item.material)) {
                  item.material.forEach(a => {
                      a.dispose()
                  })
              } else {
                  item.material.dispose() // 删除材质
              }
              item.geometry.dispose() // 删除几何体
          }
          item = null
      })
      // 删除场景对象scene的子对象group
      this.scene.remove(group)
  }
  ```
