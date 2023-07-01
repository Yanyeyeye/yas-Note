# 混合HTML与WebGL :bowl_with_spoon:

我们在[加载进度](./processing.md)一章中的基础上添加入新的功能结合`WebGL`视角的偏移来实现`html`的隐藏与显示

## 准备

首先在html文件添加一个类为`point`的元素，后面还会继续添加其他点元素`point-1`、 `point-2`、`point-3`、`point-4`……

```html
<div ref="point" class="point point-0">
    <div ref="label" class="label">
        1
    </div>
    <div ref="text" class="text">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit
    </div>
</div>
```

我们给他添加上`CSS`

```css
.point
{
    position: absolute;
    top: 50%;
    left: 50%;
}

.point .label
{
    position: absolute;
    top: -20px;
    left: -20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #00000077;
    border: 1px solid #ffffff77;
    color: #ffffff;
    font-family: Helvetica, Arial, sans-serif;
    text-align: center;
    line-height: 40px;
    font-weight: 100;
    font-size: 14px;
    cursor: help; // 鼠标提示帮助
}

.point .text
{
    position: absolute;
    top: 30px;
    left: -120px;
    width: 200px;
    padding: 20px;
    border-radius: 4px;
    background: #00000077;
    border: 1px solid #ffffff77;
    color: #ffffff;
    line-height: 1.3em;
    font-family: Helvetica, Arial, sans-serif;
    font-weight: 100;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none; // 让他在不显示的时候鼠标移上去也不会显示出来
} 

.point:hover .text
{
    opacity: 1;
}
```

我们再给他加上一个功能当消失时缩小消失，当出现时放大出现

```css
.point .label
{
    /* ... */
    transform: scale(0, 0);
    transition: transform 0.3s;
}

.point.visible .label
{
    transform: scale(1, 1);
}
```

## 初始化

我们要让这个图标随着鼠标的移动而移动，我们需要在动画函数中实时更新他的位置信息

**步骤1**：我们先定义一个图标的集合用于存放图标集

```ts
const points = [{
    position: new t.Vector3(1.55, 0.3, -0.6),
    element: point_0,
}]
```

**步骤2**：我们在动画函数中声明图标的位置信息并将该图标的空间三维坐标信息转换为摄像机中的二维信息

```ts
for (const point of points) {
    const screenPosition = point.position.clone()
    screenPosition.project(camera)
    // 你会发现越靠近屏幕中心数值越小且接近0
    console.log(screenPosition.x) 
}
```

**步骤3**：我们将他与屏幕的宽度和高度进行计算并赋值给相应的图标，注意高度是相反的

```ts
for (const point of points) {
    const screenPosition = _point.position.clone()
    screenPosition.project(camera)

    const translateX = screenPosition.x * SIZE.width * 0.5
    const translateY = -screenPosition.y * SIZE.height * 0.5
    point.element.value!.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
}
```

## 碰撞检测

我们使用`Raycaster`来实现图标的显示与隐藏，我们可以比较屏幕到模型的距离与屏幕到图标的距离来控制图标的显示与隐藏

```ts
const raycaster = new t.Raycaster()
```

我们先将相机和图标固定点记录到`Raycast`中

```ts
const raycaster = new t.Raycaster()
// ...
const tick = () =>
{
    // ...

    for(const point of points)
    {
        const screenPosition = point.position.clone()
        screenPosition.project(camera)

        raycaster.setFromCamera(screenPosition, camera)

        // ...
    }

    // ...
}
```

我们在根据这个记录获得图标固定点与摄像机之间的距离，并通过遍历去获取图标下子元素的距离

```ts
const tick = () =>
{
    // ...

    for(const point of points)
    {
        const screenPosition = point.position.clone()
        screenPosition.project(camera)

        raycaster.setFromCamera(screenPosition, camera)
        const intersects = raycaster.intersectObjects(scene.children, true)

        // ...
    }

    // ...
}
```

## 融合计算

根据碰撞的物体的信息，判断是否相交来控制标签的显示与隐藏

```ts
const tick = () =>
{
    // ...

    for(const point of points)
    {
        const screenPosition = point.position.clone()
        screenPosition.project(camera)

        raycaster.setFromCamera(screenPosition, camera)
        const intersects = raycaster.intersectObjects(scene.children, true)

        if(intersects.length === 0)
        {
            point.element.classList.add('visible')
        }
        else
        {
            
        }

        // ...
    }

    // ...
}
```

我们取第一个与射线相交物体的坐标（它可能是图标也可能是头盔，因为当图标被头盔遮住时，摄影机与图标之间的射线投射就会先与头盔相交），之后我们再直接获取图标与摄像头之间的距离两两判断来决定是否需要显示图标

```ts
const tick = () =>
{
    // ...

    for(const point of points)
    {
        const screenPosition = point.position.clone()
        screenPosition.project(camera)

        raycaster.setFromCamera(screenPosition, camera)
        const intersects = raycaster.intersectObjects(scene.children, true)

        if(intersects.length === 0)
        {
            point.element.classList.add('visible')
        }
        else
        {
            const intersectionDistance = intersects[0].distance
            const pointDistance = point.position.distanceTo(camera.position)
            if(intersectionDistance < pointDistance)
            {
                point.element.classList.remove('visible')
            }
            else
            {
                point.element.classList.add('visible')
            }
        }

        // ...
    }

    // ...
}
```

## 问题解决

我们会发现一个问题那个图标会在加载前一直显示在那边，我们可以设置一个属性来延时一会儿来解决这个问题

```ts
if (sceneReady) {
for (const point of points) {
// console.log(points)
    const screenPosition = point.position.clone()
    screenPosition.project(camera)

    raycaster.setFromCamera(screenPosition, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    if (intersects.length === 0) {
    point.element.value!.classList.add('visible')
    }
    else {
    const intersectionDistance = intersects[0].distance
    const pointDistance = point.position.distanceTo(camera.position)
    if (intersectionDistance < pointDistance)
        point.element.value!.classList.remove('visible')

    else
        point.element.value!.classList.add('visible')
    }

    const translateX = screenPosition.x * SIZE.width * 0.5
    const translateY = -screenPosition.y * SIZE.height * 0.5
    point.element.value!.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`
}
}
```
