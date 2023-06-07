# 可视化调试Debug :lady_beetle:

## Debug库

- `dat.GUI`
- `control-panel`
- `ControlKit`
- `Guify`
- `Oui`

### dat.GUI

- **步骤1**：安装`dat.GUI`

``` bash
npm i dat.gui
```

- **步骤2**：导入`dat.gui`

```js
/**
* Debug 
* gui.add(...) // 可以链式调用
*/
import * as dat from 'dat.gui'
```

- **步骤3**：使用
  
``` js
const gui = new dat.GUI({ closed: true, width: 400 }) // 设置关闭与宽度
const param = {
    color: 0xff0000,
    spin: () => {
        gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + Math.PI * 2}) // 一秒旋转一圈
    },
}
/**
 * 物体
*/
const material = new t.MeshBasicMaterial({ color: param.color })
const geometry = new t.BoxGeometry(30, 30, 30)
const mesh = new t.Mesh(geometry, material)

gui.add(mesh.position, 'x')
    .min(-30) // 能调整到最小是多少
    .max(30) // 能调整到最大时多少
    .step(1) // 调试时每一步的间隔
    .name('yellow x') // 当命名重复时可使用.name()使用别名
gui.add(mesh.position, 'y').min(-30).max(30).step(1)
gui.add(mesh.position, 'z').min(-30).max(30).step(1)
gui.add(mesh, 'visible') // 是否可见
gui.add(material, 'wireframe') // 是否只显示物体的框架
gui.addColor(param, 'color') // 设置debug颜色
    .onChange(() => { materials.color.set(param.color) }) // 当颜色改变时回调
gui.add(param, 'spin') // 旋转
```

### 更多

- [dat.GUI Github 仓库](https://github.com/dataarts/dat.gui)
- [API 文档](https://github.com/dataarts/dat.gui/blob/HEAD/API.md)
- [一个简单而全面的示例](https://jsfiddle.net/ikatyang/182ztwao/)
