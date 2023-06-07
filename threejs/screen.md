# 全屏与改变大小 :tv:

## 获取窗口大小

使用`window.`来获取屏幕的长宽

```js
const WIDTH = window.innerWidth
const HEIGHT = window.innerHeight
```

## 监听窗口

让画布随着窗口大小变化而变化

``` js
// ... camer代码
// ... render代码
window.addEventListener('resize', () => {
    // 更新窗口大小
    SIZE.WIDTH = window.innerWidth
    SIZE.HEIGHT = window.innerHeight

    // 更新照相机
    camera.aspect = SIZE.WIDTH / SIZE.HEIGHT
    camera.updateProjectionMatrix()

    // 重新渲染画布大小
    renderer.setSize(SIZE.WIDTH, SIZE.HEIGHT)

    // 适应所有的屏幕像素比
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
```

### 减小像素感

原始的屏幕的像素渲染如下：

<p>
  <img src=".\images\image-20221014104101179.png" alt="pixel screenshot" style="border-radius:8px">
</p>

一个像素里渲染一个，或一个像素里渲染4个或一个像素里渲染9个...

```js
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
```

## 实现全屏

可以实现点击图标时实现全屏或双击时实现

```ts:line-numbers
// 以下代码不支持safari
window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement)
        document.getElementById('crown')!.requestFullscreen()
    else
        document.exitFullscreen()
})
```
