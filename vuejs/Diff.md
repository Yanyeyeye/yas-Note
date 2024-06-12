# Diff算法

diff算法是vue的核心主要用来比较新旧两组子节点

## 简单Diff算法

我们在使用diff算法判断两组新旧节点时，需要在VNode中新增 **key** 的属性来提升算法效率以及获取新旧两组节点的映射关系。

```js
const oldVnode = {
    type: 'div',
    children: [
        { type: 'p', children: '1', key: 1 },
        { type: 'p', children: '2', key: 2 },
        { type: 'p', children: 'hello', key: 3 },
    ]
}

const newVnode = {
    type: 'div',
    children: [
        { type: 'p', children: 'world', key: 3 },
        { type: 'p', children: '1', key: 1 },
        { type: 'p', children: '2', key: 2 },
    ]
}
```

![image-20240204151330880](.\images\image-20240204151330880.png)

有了 **key** 的映射之后我们在比较新旧子节点组时就得知道哪些节点需要移动，那么我们就得观察旧节点的索引在变成新节点的时候位置发生了哪些变化。一开始旧节点的索引为递增的顺序，p-1的索引为0，p-2的索引为1，p-3的索引为2，而在变成新子节点的时候各自的索引变成了：p-3的索引为0，p-1的索引为1，p-2的索引为2，（0，1，2）变成了（2，0，1），说明p-3的子节点的顺序变成了，p-1、p-2都在p-3的后面，我们得移动p-3，所以我们就得出一个结论：当在旧节点中寻找与新节点相同的 **key** 值时，将最大的索引值保存下来，如果后续有节点的 **key** 值小于该值时，说明该节点需要移动。

<img src=".\images\image-20240204155932181.png" alt="image-20240204155932181" style="zoom: 67%;margin:0 auto" />

我们在处理要移动的节点时，其实在之前 `patchElement` 的代码中就已经在新旧节点上绑定了真实的**DOM**

```js
function patchElement(n1, n2) {
    // 新的 vnode 引用真实的DOM元素
    const el = n2.el = n1.el
    // ...
}
```

<img src=".\images\image-20240204163807431.png" alt="image-20240204163807431" style="zoom:67%;margin:0 auto" />

移动的大致思路如下：

1. 在旧子节点中按顺序寻找新子节点的 `key` 值，发现 `p-3` 的值在索引2的位置，索引值2成为目前最大的索引值，在真实DOM节点中p-3的节点不需要移动

2. 寻找新子节点组中p-1的位置，发现他在旧的子节点组中的索引值为0，比最大的索引值2要小，说明它在p-3节点的后面，我们根据新子节点组中p-1与p-3的位置关系，来移动真实DOM节点中它俩的顺序，即将p-1移动到p-3节点的后面

    <img src=".\images\image-20240204165718722.png" alt="image-20240204165718722" style="zoom: 67%;margin:0 auto" />

3. 我们继续寻找p-2在旧子节点组中的顺序，发现所对应的索引值为1，比最大的索引值2要小，所以我们也要移动p-2节点的位置，根据他们在新子节点组中的顺序可以知道p-2在p-1节点的后面，随后我们移动真实的DOM中p-2的节点到p-1的节点的后面

    <img src=".\images\image-20240204170204733.png" alt="image-20240204170204733" style="zoom:67%;margin:0 auto" />

这样我们就完成了数量相同的新旧节点的位置移动。

但是，如果说新的节点比旧的节点多该如何操作呢？

<img src=".\images\image-20240204170421878.png" alt="image-20240204170421878" style="zoom: 67%;margin:0 auto" />

我们在之前最基础的DOM移动的操作上增加，对新增节点的操作，大致的步骤如下：

1. 前p-3到p-1的操作与之前的一致

    <img src=".\images\image-20240204173041708.png" alt="image-20240204173041708" style="zoom:67%;margin:0 auto" />

2. 到p-4节点时由于在旧的节点组中没有存在p-4节点，所以我们需要挂载他，根据在新的子节点组中他在p-1的节点后面，所以我们需要移动其真实的DOM节点到p-1节点的后面

   <img src=".\images\image-20240204173400096.png" alt="image-20240204173400096" style="zoom:67%;margin:0 auto" />

对于少节点的情况时，又该如何处理呢？

<img src=".\images\image-20240205093104032.png" alt="image-20240205093104032" style="zoom:67%;margin:0 auto" />

大致思路也跟新增操作差不多，只是在旧子节点中遍历出新子节点中没有的节点，然后将对应的真实DOM卸载即可

<img src=".\images\image-20240205101906597.png" alt="image-20240205101906597" style="zoom:67%;margin:0 auto" />

### 函数处理逻辑

```js
function EZDiff(n1, n2, container) {
    const newChildren = n2.children
    const oldChildren = n1.children

    // 用来存储索引值最大的节点的索引，来判断是否要移动节点
    let lastIndex = 0
    // 在新的子节点中遍历旧子节点组中的节点，找到相同key值的节点
    for(let i = 0; i < newChildren.length; i++) {
        const newVNode = newChildren[i]
        // 用于表示在旧的子节点组中是否含有新子节点中的节点
        let find = false
        // 遍历旧的节点组找到能复用的节点并更新
        for(let j = 0; j < oldChildren.length; j++) {
            const oldVNode = oldChildren[j]
            if(newVNode.key === oldVNode.key) {
                find = true // 说明有找到就把值置为true并操作该元素
                patch(oldVNode, newVNode, container)
                // 如果说在新的子节点组中有索引值比它之前的节点的索引值小说明它的位置变了需要移动
                if(j < lastIndex) {
                    // 获得新子节点之前的那个节点的真实DOM
                    const prevVNode = newChildren[i - 1]
                    // 如果prevVNode不存在，说明当前的newVNode是第一个节点，不需要移动
                    if(prevVNode) {
                        // 获得要挂在节点后面的那个兄弟节点真实DOM的位置
                        const anchor = prevVNode.el.nextSibling
                        // 将真实的DOM挂载上去
                        insert(newVNode.el, container, anchor)
                    }
                } else {
                    // 如果不是就把最大的索引赋值给他
                    lastIndex = j 
                }
                // 如果有找到了，就跳出内层循环，节省性能开支
                break;
            }
        }
        // 处理新增节点
        // 如果find一直为false
        // 说明在该newVNode节点是新的节点我们需要将他挂载到响应的位置上
        if(!find) {
            // 获取该 newVNode 节点之前的节点的真实DOM
            const prevVnode = newChildren[i - 1]
            let anchor = null
            if(prevVnode) {
                // 如果不是第一个节点那么就要找到这个之前节点的后一个兄弟节点并挂载它
                anchor = prevVnode.el.nextSibling
            }else{
                // 与之前的操作相同，如果该节点是节点组中的第一个节点那么就把它挂载到容器元素的第一个节点的位置
                anchor = container.firstChild
            }
            // 将该新增的节点挂载到响应的位置上
            patch(null, newVNode, container, anchor)
        }
    }
    
    // 当之前的节点移动、新增操作结束后，就到了移除多余元素的操作
    for(let i = 0; i < oldChildren.length; i++) {
        const oldVNode = oldChildren[i] // 得到旧子节点
        // 在旧在节点中寻找新子节点没有的节点
        const has = newChildren.find(
            vnode => vnode.key === oldVNode.key
        )
        // 如果没有找到相同key节点的，则说明要卸载该DOM元素
        if(!has) {
            unmount(oldVNode)
        }
    }
}
```

## 双端Diff算法

之前的简单Diff算法用key值来尽可能的复用DOM，并通过移动DOM的方式来完成更新，从而减少不断的创建和销毁DOM元素带来的性能开销。但是简单Diff算法有许多缺陷就比如之前节点的移动需要移动两次节点，而其实我们只需要移动一次DOM元素就可以完成操作。

<div style="display: flex;">
    <img src=".\images\image-20240205111754814.png" alt="image-20240205111754814" style="zoom: 50%;" />
    <img src=".\images\image-20240205111813658.png" alt="image-20240205111813658" style="zoom: 50%;" />
</div>

那我们就使用双端Diff算法来简化移动的步骤及次数，我们需要准备4个索引值分别指向新旧节点组的头和尾的节点，并获取该4个节点的vnode节点

<img src=".\images\image-20240205112059810.png" alt="image-20240205112059810" style="zoom:67%;margin:0 auto" />

我们有如下四个比较顺序

<img src=".\images\image-20240205144054538.png" alt="image-20240205144054538" style="zoom:67%;margin:0 auto" />

### 理想情况

处理节点的步骤如下：

1. 先比较p-4与p-1不相同不移动，比较p-3与p-4不相同不移动，比较p-3与p-1不相同不移动，比较p-4与p-4相同需要移动，新子节点在子节点组的开头而在旧子节点组的末尾，需要把p-4所对应的真实DOM移动到整个节点组的开头，并改变指向新旧节点中p-4节点的索引值

   <img src=".\images\image-20240205154459435.png" alt="image-20240205154459435" style="zoom:67%;margin:0 auto" />

2. 先比较p-2与p-1的节点不相同不移动，比较p-3与p-3的节点相同需要移动，但都是在新旧子节点组的末尾所以不需要移动，但是指向p-3节点的索引值需要改变

   <img src=".\images\image-20240205154646618.png" alt="image-20240205154646618" style="zoom:67%;margin:0 auto" />

3. 比较p-2与p-1的节点不相同不移动，比较p-1与p-2的节点不相同不移动，比较p-1与p-1相同需要移动，新节点组中p-1在组的末尾而旧节点组中p-1在组的开头位置，需要把p-1节点的真实DOM移动到p-2节点之后，并改变指向p-1节点的索引值

   <img src=".\images\image-20240205155014790.png" alt="image-20240205155014790" style="zoom:67%;margin:0 auto" />

4. 比较p-2节点与p-2节点相同需要移动，但因为都是开头的节点所以不需要移动，而指向p-2的索引值还是需要改变

   <img src=".\images\image-20240205160215781.png" alt="image-20240205160215781" style="zoom:67%;margin:0 auto" />

### 非理想情况

但我们有时候还会遇到非理想的情况比如下面这种

<img src=".\images\image-20240205161030163.png" alt="image-20240205161030163" style="zoom:67%;margin:0 auto" />

当步骤①②③④都没找到相同的节点时，我们就要进行特殊的处理

<img src=".\images\image-20240205162530299.png" alt="image-20240205162530299" style="zoom: 80%;margin:0 auto" />

1. 我们直接在旧的子节点组中遍历查找p-2，发现其在索引为1的位置，而p-2节点在新子节点中的索引为0是在头部，所以我们要改变其真实DOM的位置将他放到旧子节点组的头部，并改变新节点组中当前节点索引的位置以及将p-2节点置空

   <img src=".\images\image-20240205164000363.png" alt="image-20240205164000363" style="zoom:67%;margin:0 auto" />

2. 之后我们将剩余的节点再根据之前的步骤进行移动

   <img src=".\images\image-20240205165637874.png" alt="image-20240205165637874" style="zoom:67%;margin:0 auto" />

3. 比较p-4与p-1不同不移动，比较p-3与p-4不同不移动，比较p-3与p-1不同不移动，比较p-4与p-4相同要移动，因为在新的子节点组中p-4节点在头部，所以我们要将其移动到真实DOM组中的头部去，并改变指向p-4的索引值

   <img src=".\images\image-20240205170539177.png" alt="image-20240205170539177" style="zoom:67%;margin:0 auto" />

4. 比较p-1与p-1相同但都在头部不需要移动，但要改变指向新旧p-1节点的索引值

   <img src=".\images\image-20240205170701621.png" alt="image-20240205170701621" style="zoom:67%;margin:0 auto" />

5. 当索引值遇到undefined的时候需要忽略该节点

   <img src=".\images\image-20240205170818775.png" alt="image-20240205170818775" style="zoom:67%;margin:0 auto" />

6. p-3与p-3节点比较相同，但都在新旧组的开头所以不需要移动，但还是要改变指向p-3的索引值

   <img src=".\images\image-20240205171144330.png" alt="image-20240205171144330" style="zoom:67%;margin:0 auto" />

### 新增子节点的情况

对于新子节点组中出现比旧子节点中多余的节点时，我们也要进行处理

- 情况一

    <img src=".\images\image-20240205172135174.png" alt="image-20240205172135174" style="zoom:67%;margin:0 auto" />

  1. 比较p-4与p-1不同不移动，比较p-2与p-3不同不移动，比较p-2与p-1不同不移动，比较p-4与p-3不同不移动，接下来得进入到遍历旧子节点组找p-4的节点，发现就子节点组中都不存在，则说明p-4节点为新增节点需要新增，因为p-4节点为头部节点所以直接将其挂载到真实DOM的头部位置
    <img src=".\images\image-20240205172712390.png" alt="image-20240205172712390" style="zoom:67%;margin:0 auto" />
  2. 接下来的比较操作与之前一致不多赘述

- 情况二

  <img src=".\images\image-20240205172942041.png" alt="image-20240205172942041" style="zoom:67%;margin:0 auto" />

  1. 比较p-4与p-3节点不同不移动，比较p-3与p-3节点相同，因为都在末尾所以不需要移动，但需要改变指向p-3节点的索引值

     <img src=".\images\image-20240205173119768.png" alt="image-20240205173119768" style="zoom:67%;margin:0 auto" />

  2. 比较p-4与p-1节点不同不移动，比较p-2与p-2节点相同，因为都在末尾不需要移动，但需要改变指向p-2节点的索引值

     <img src=".\images\image-20240205173226016.png" alt="image-20240205173226016" style="zoom:67%;margin:0 auto" />

  3. 比较p-4与p-1节点不同不移动，比较p-1与p-1节点相同，因为都是末尾节点所以不需要移动，但需要改变指向p-1节点的索引值

     <img src=".\images\image-20240205173344250.png" alt="image-20240205173344250" style="zoom:67%;margin:0 auto" />

  4. 我们发现现在只剩下p-4节点，p-4节点没有被处理，那么我们就要将它增加到真实的DOM的顺序中，无论是头部节点还是尾部节点，我们发现`oldStartIdx`始终是这些剩余的节点该在的位置

### 缺少子节点的情况

  <img src=".\images\image-20240207093127322.png" alt="image-20240207093127322" style="zoom:67%;margin:0 auto" />

  对于上图中新子节点组中的节点数量比旧子节点组中的节点数量少的情况时，我们需要将少的节点卸载掉，大致步骤如下：

  1. p-1与p-1比较相同需要移动，但都因为是头部节点所以不需要移动，将指向p-1节点的索引值改变
  
     <img src=".\images\image-20240207094054267.png" alt="image-20240207094054267" style="zoom:67%;margin:0 auto" />
  
  2. 比较p-3与p-2不相同不需要移动，比较p-3与p-3相同，但都不在末尾不需要移动，但需要改变指向p-3的索引值
  
     <img src=".\images\image-20240207094207386.png" alt="image-20240207094207386" style="zoom:67%;margin:0 auto" />
  
  3. 当旧子节点组中两索引值重合或新子节点组中`newStartIdx`的值比`newEndIdx`的值大时，说明旧子节点组中的这些节点需要卸载

### 函数处理实现

我们将以上所遇到的所有情况写成函数逻辑

```js
function patchChildren(n1, n2, container){
    const oldChildren = n1.children
    const newChildren = n2.children
    // 定义四个索引值用来指向四个节点
    let oldStartIdx = 0
    let oldEndIdx = oldChildren.length - 1
    let newStartIdx = 0
    let newEndIdx = newChildren.length - 1
    let oldStartVNode = oldChildren[oldStartIdx]
    let oldEndVNode = oldChildren[oldEndIdx]
    let newStartVNode = newChildren[newStartIdx]
    let newEndVNode = newChildren[newEndIdx]

    // 用while循环遍历新旧子节点组，条件是该两组节点组的索引值不能逆序
    while(oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx){
        if(!oldStartVNode){
            // 说明该节点之前就已经处理过了
            // 直接重新赋值
            oldStartVNode = oldChildren[++oldStartIdx]
        }else if(!oldEndVNode){
            oldEndVNode = oldChildren[--oldEndIdx]
        }else if(newStartVNode.key === oldStartVNode.key) {
            // 处理新旧子节点组头部节点相同的情况
            // 不移动位置，但需要改变指向该节点的索引值
            // 打补丁
            patch(newStartVNode, oldStartVNode, container)
            oldStartVNode = oldChildren[++oldStartIdx]
            newStartVNode = newChildren[++newStartIdx]
        } else if(newEndVNode.key === oldEndVNode.key) {
            // 处理新旧子节点组末尾的情况
            // 打补丁
            patch(newStartVNode, oldStartVNode, container)
            newEndVNode = newChildren[--newEndIdx]
            oldEndVNode = oldChildren[--oldEndIdx]
        } else if(newEndVNode.key === oldStartVNode.key) {
            // 处理新子节点组末尾节点与旧子节点组头部节点的情况
            // 该节点从旧子节点组的头部到了新子节点组的末尾
            // 需要将该节点移动到真实DOM组的末尾
            // 打补丁
            patch(oldStartVNode, newEndVNode, container)
            insert(oldStartVNode.el, container, oldEndVNode.el.nextSibling)
        } else if(newStartVNode.key === oldEndVNode.key) {
            // 处理新子节点组头部节点与旧子节点组末尾节点的情况
            // 先对两节点打补丁
            patch(oldEndVNode, newStartVNode, container)
            // 因为需要移动的节点的位置在新子节点组的开头，而在旧子节点组的末尾
            // 所以要将其该节点移动到真实DOM节点组的开头
            insert(oldEndVNode.el, container, oldStartVNode.el)
            // 改变指向该节点的索引值
            oldEndVNode = oldChildren[--oldEndIdx]
            newStartVNode = newChildren[++newStartIdx]
        } else {
            // 上述四个逻辑都没有匹配到对应的节点
            // 需要遍历旧子节点组寻找对应的节点
            const idxInOld = oldChildren.findIndex(
                node => node.key === newStartVNode.key
            )
            // 如果该节点的索引大于0，说明有相对应的节点在就子节点组中
            if(idxInOld > 0) {
                // 得到该节点
                const vnodeToMove = oldChildren[idxInOld]
                // 打补丁
                patch(vnodeToMove, newChildren, container)
                // 因为是从新节点组的头部开始去旧子节点组中需寻找对应的节点
                // 所以需要把找到的节点放到真实DOM组的开头位置
                insert(vnodeToMove.el, container, oldStartVNode.el)
                // 将旧子节点组中寻找到的位置赋空
                oldChildren[idxInOld] = undefined
                // 最后改变newStartIdx的位置
                newStartVNode = newChildren[++newStartIdx]
            } else {
                // 处理新增节点的情况
                // 如果没找到，说明该节点是新增的节点直接挂载到以oldStartVNode锚点位置
                patch(null, newStartVNode, container, oldStartVNode.el)
            }
            newStartVNode = newChildren[++newStartIdx]
        }
    }

    // 新增节点的特殊情况，在尾部的新增节点与在头部的新增节点的情况一致，都需要将其挂载到oldStartIdx的位置
    if(oldEndIdx < oldStartIdx && newStartIdx <= newEndIdx) {
        for(let i = newStartIdx; i <= newEndIdx; i++) {
            patch(null, newChildren[i], container, oldStartVNode.el)
        }
    }else if(newEndIdx < newStartIdx && oldStartIdx <= oldEndIdx) {
        // 多的需要卸载掉
        for(let i = oldStartIdx; i <= oldEndIdx; i++) {
            unmount(oldChildren[i])
        }
    }
}
```

## 快速Diff算法

快速Diff算法的思想最早来源于 **ivi** 与 **infero** 两个框架，Vue3采用快速Diff算法操作DOM优于Vue2中采用双端Diff算法。

### 理想情况

对于头尾节点值相同的情况

我们有如下**相同前置节点与后置节点**的新旧子节点组，我们要对它们进行预处理

### 处理新增节点

<img src=".\images\image-20240208120456868.png" alt="image-20240208120456868" style="zoom:67%;margin:0 auto" />

1. 我们建立索引 `j` 分别指向新旧节点的头部节点，并一直比较下去：p-1与p-1相同不移动，索引 `j` 往下递增

   <img src=".\images\image-20240208122304207.png" alt="image-20240208122304207" style="zoom:67%;margin:0 auto" />

2. p-4与p-2不相同停止 `j` 的向下递增，创建新旧节点组的末端节点索引 `newEnd` 与 `oldEnd` ，并比较p-3与p-3节点相同，末端索引值往上移动，直到遇到p-4与p-2不相同，索引停止移动

   <img src=".\images\image-20240208122721612.png" alt="image-20240208122721612" style="zoom:67%;margin:0 auto" />

3. 当旧节点组中 `oldEnd` 的值大于 `j` 时，说明旧子节点组中的所有节点已经处理完了，这时可能会遇到 `newEnd` 的值大于等于 `j` 的情况，说明新子节点组中有多余的节点需要将他们挂载上去

   <img src=".\images\image-20240208123916609.png" alt="image-20240208123916609" style="zoom:67%;margin:0 auto" />

### 处理删除节点

<img src=".\images\image-20240208124118909.png" alt="image-20240208124118909" style="zoom:67%;margin:0 auto" />

我们有如上的新旧子节点组的情况，我们处理的逻辑也类似新增节点的逻辑

1. 创建头部索引 `j` 开始从上往下遍历，p-1与p-1相同`j` 自增，p-3与p-2不相同 `j` 不发生变化，创建末尾索引值 `oldEnd` 与 `newEnd`

   <img src=".\images\image-20240208125255796.png" alt="image-20240208125255796" style="zoom:67%;margin:0 auto" />

2. p-3与p-3相同末尾索引值向上移动

   <img src=".\images\image-20240208125351067.png" alt="image-20240208125351067" style="zoom:67%;margin:0 auto" />

3. 当 `newEnd` 的值小于 `j` 时，`oldEnd` 的值大于等于 `j` 时，说明新子节点组中节点已经全部遍历完了，旧子节点组中 `oldEnd` 与 `j` 索引值之间的所有节点需要卸载掉

   <img src=".\images\image-20240208130004320.png" alt="image-20240208130004320" style="zoom:67%;margin:0 auto" />

### 非理想情况

<img src=".\images\image-20240208130221074.png" alt="image-20240208130221074" style="zoom:67%;margin:0 auto" />

当遇到复杂的情况，如新旧子节点中只有少量相同的头尾节点的时候，我们按照之前的逻辑思路来处理

p-1与p-1比较相同索引值 `j` 向下移动，p-3与p-2不相同索引值 `j` 不需要发生移动，创建新旧节点组中末尾节点索引 `newEndIdx` 与 `oldEndIdx` ,比较p-5与p-5节点相同，末端索引值需要向上移动，p-7与p-6比较不同，末端索引值不发生移动

<img src=".\images\image-20240208130949976.png" alt="image-20240208130949976" style="zoom:67%;margin:0 auto" />

当新旧子节点组的索引值都停止移动时，说明新旧子节点组的首尾的节点已经没有相同的了，这时候我们就要观察这两组新旧子节点中有哪些节点需要发生移动。

大致的思路是构建一张索引表存储新子节点组中 `key` 值与该节点索引的关系，并将其在旧节点组中的索引值存储在一张名为 `source` 的索引表中用于后续移动DOM的操作，对于在旧节点组中没有而新子节点组中有的节点，我们将其在source数组中的值置为 `-1`，对于旧子节点组中有新子节点组中没有的节点我们直接将他卸载

<img src=".\images\image-20240208133129462.png" alt="image-20240208133129462" style="zoom:67%;margin:0 auto" />

此外在创建了 `source` 数组与索引表之外，还需要获取到 `source` 数组中最长的递增序列，这个最长的递增序列所对应的节点索引，即为不需要移动的节点

<img src=".\images\image-20240208143027770.png" alt="image-20240208143027770" style="zoom:67%;margin:0 auto" />

如上图seq数组中所存储的索引值所代表的意思是p-3与p-4不需要发生移动，而p-2与p-7需要位置需要移动

大致的移动逻辑思路如下：

1. 分别创建变量 `s` 与变量 `i` 指向 `seq` 数组与新子节点组的末端，特别注意的是变量 `i` 是剩余的新字节点组中的变量

2. 我们要循环遍历新子节点组，并寻找与`seq`数组中不相同的索引值，即为要移动的节点

   <img src=".\images\image-20240208150528272.png" alt="image-20240208150528272" style="zoom:67%;margin:0 auto" />

3. 索引3 所对应的节点 p-7 在 `source` 数组中的值为 `-1`，该p-7节点为新增节点，我们需要获取该节点之后的节点的位置，并将其挂载到那节点之前，如果p-7就是末端节点则直接挂载到容器的末尾，变量 `i` 减小向上移动

   <img src=".\images\image-20240208151919184.png" alt="image-20240208151919184" style="zoom:67%;margin:0 auto" />

4. 索引2 所对应的节点为p-2在 `source` 数组中的值为 `1`， p-2节点不是新增节点，再与 `seq` 数组 `s` 索引值所对应的值 `1` 比较，索引`2≠1`，说明p-2节点需要改变位置，获取p-2节点之后的节点的位置，将其插入到那节点之前，变量 `i` 减小向上移动

   <img src=".\images\image-20240208152631379.png" alt="image-20240208152631379" style="zoom:67%;margin:0 auto" />

5. 索引1 所对应的节点为p-4在 `source` 数组中的值为 `3`，p-4节点不是新增节点，在与 `seq` 数组 `s` 索引值对应的值 `1` 比较，索引 `1=1`，说明p-4该节点不需要移动，变量 `i` 与 变量 `s` 减小向上移动

   <img src=".\images\image-20240208153025179.png" alt="image-20240208153025179" style="zoom:67%;margin:0 auto" />

6. 索引0 所对应的节点为p-3在 `source` 数组中的值为 `2`，p-3节点不是新增节点，在与 `seq` 数组 `s` 索引值对应的值 `0` 比较，索引 `0=0`，说明p-3该节点不需要移动，变量 `i` 与 变量`s` 减小向上移动，变量 `i = 0` 循环结束

### 函数处理逻辑

```js
function patchKeyedChildren(n1, n2, container) {
    const newChildren = n2.children
    const oldChildren = n1.children

    // 创建索引j来处理理想情况
    let j = 0
    let oldVNode = oldChildren[j]
    let newVNode = newChildren[j]

    // 使用 while 来从头往尾遍历相同的 key 值
    // 直到拥有不同的 key 值的节点
    while(oldVNode.key === newVNode.key) {
        // 调用 patch 函数对相同节点不同的内容来打补丁
        patch(oldVNode, newVNode, container)
        // 更新索引去指向下一对节点
        j++
        oldVNode = oldChildren[j]
        newVNode = newChildren[j]
    }

    // 得到末尾节点
    let oldEnd = oldChildren.length - 1
    let newEnd = newChildren.length - 1
    oldVNode = oldChildren[oldEnd]
    newVNode = newChildren[newEnd]

    // 从头开始的节点对不一致了
    // 那就从末尾开始遍历上去
    while(oldVNode.key === newVNode.key) {
        // 相同节点不同内容打补丁
        patch(oldVNode, newVNode, container)
        // 网上遍历
        oldEnd--
        newEnd--
        oldVNode = oldChildren[oldEnd]
        newVNode = newChildren[newEnd]
    }

    // 以上为预处理代码，以下为对节点进行的相应操作
    // 说明有新增的节点在新节点组中
    if(j > oldEnd && j <= newEnd) {
        // 得到锚点索引，新的子节点都要插到该节点之前
        const anchorIndex = newEnd + 1
        // 获取锚点节点的真实DOM
        const anchor = anchorIndex < newChildren.length ? newChildren[anchorIndex].el : null 
        // 利有 while 循环，将这些节点都挂在上去
        while(j <= newEnd) {
            patch(null, newChildren[j++], container, anchor)
        }
    }else if(j <= oldEnd) {
        // 处理多余元素的情况，需要把多余的元素卸载掉
        while(j <= oldEnd) {
            unmount(oldChildren[j++])
        }
    }else{
        // 处理非理想情况，即当j > oldEnd && j <= newEnd 以及 j > newEnd && j <= oldEnd
        // 构造 source 数组用来存储新节点组中各节点在老节点组中的索引值以及新增元素
        // 并用它来求取最大的递增序列即不需要移动的元素
        // 获得新子节点中未处理的节点的个数
        const count = newEnd - j + 1
        const source = new Array(count)
        // 新增节点的值为 -1
        source.fill(-1)
        // newStart 与 oldStart 为预处理之后的节点组的头部节点
        const newStart = j
        const oldStart = j
        // moved 变量用于表示是否需要移动节点
        let moved = false
        // pos 变量用来存储索引代表遍历旧的一组子节点的过程中遇到的最大索引值
        // 如果在遍历过程中遇到的索引值呈现递增趋势，则说明不需要移动节点，反之则需要。
        let pos = 0

        // 创建索引表用来快速映射新节点与其在新子节点组中索引的关系
        const keyIndex = {}
        for(let i = newStart; i <= newEnd; i++) {
            keyIndex[newChildren[i].key] = i
        }
        // 新增 patched 变量，代表更新过的节点数量
        let patched = 0
        for(let i = oldStart; i <= oldEnd; i++) {
            oldVNode = oldChildren[i]
            // 如果更新过的节点的数量大于新子节点中的节点数时
            // 则要将他们都卸载掉
            if(patched <= count) {
                // 通过索引表快速找到该节点在新子节点组中的索引值
                const k = keyIndex[oldVNode.key]

                if(typeof k !== 'undefined') {
                    // 说明该节点在新节点中存在，因为有位置与他对应
                    newVNode = newChildren[k]
                    // 打补丁
                    patch(oldVNode, newVnode, container)
                    patched++
                    // 将其放到 source 数组中相对应的位置
                    // k 与 newStart 的索引值都是整体的索引值
                    // 相减不需要加1来得到source数组中的索引值
                    source[k - newStart] = i
                    // 源码中有这么一块来判断是否需要移动元素
                    // 但我感觉不需要这一块的内容
                    // 因为之前已经预处理过相关的节点了
                    if(k < pos){
                        moved = true
                    }else{
                        pos = k
                    }
                }else{
                    // 不存在就卸载
                    unmount(oldVNode)
                }   
            }else{
                // 旧节点中多余的节点要卸载
                unmount(oldVNode)
            }
        }
        // 如果需要移动DOM
        if(moved) {
            // seq数组用来获取并存储source数组中最长的递增序列
            const seq = getSequence(source)

            // 用来指向seq数组中最后一个值
            let s = seq.length - 1
            // 用来指向新子节点数组中最后一个值
            let i = count - 1
            for(i; i >= 0; i--) {
                if(source[i] === -1) {
                    // 说明是新节点，我们得获取它之后的那个节点的真实DOM的位置
                    // newStart是整体的索引开头，加上i获取预处理后新节点组中的位置
                    const pos = i + newStart
                    // 获取新的节点的DOM元素
                    const newVNode = newChildren[pos]
                    // 获取他之后真实节点的DOM位置
                    const nextPos = pos + 1
                    const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
                    // 将新的节点挂载到他之后节点的前面去
                    patch(null, newVNode, container, anchor)
                }
                if(i !== seq[s]) {
                    // seq中存储的索引值不等于新子节点数组中的索引值，就要移动该元素
                    // 与新节点相似的处理方法，只不过对于已存在节点的操作是直接插入到其之后DOM节点之前的位置
                    const pos = i + newStart
                    // 获取新的节点的DOM元素
                    const newVNode = newChildren[pos]
                    // 获取他之后真实节点的DOM位置
                    const nextPos = pos + 1
                    const anchor = nextPos < newChildren.length ? newChildren[nextPos].el : null
                    // 将新的节点挂载到他之后节点的前面去
                    insert(newVNode.el, container, anchor)
                } else {
                    // 如果索引值与seq数组中存储的索引值一致则不需要移动，变量s与i需要减小并向上移动  
                    s--
                }
            }
        }
    }
}
```

```js
// 获得最长的递增序列
function getSequence(arr) {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
        const arrI = arr[i]
        if (arrI !== 0) {
            j = result[result.length - 1]
            if (arr[j] < arrI) {
                p[i] = j
                result.push(i)
                continue
            }
            u = 0
            v = result.length - 1
            while (u < v) {
                c = ((u + v) / 2) | 0
                if (arr[result[c]] < arrI) {
                    u = c + 1
                } else {
                    v = c
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1]
                }
                result[u] = i
            }
        }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
        result[u] = v
        v = p[v]
    }
    return result
}
```

### 处理事件

在[mountElement函数](renderer.html#mountelement函数)中，我们还要继续对标签中的事件进行处理，对于**vnode**中的`props`里一般将`on`开头的属性名描述为事件

```js
const vnode = {
    type: 'p',
    props: {
        // 使用 onXxx 描述事件
        onClick: () => {
            alert('clicked')
        }
    },
    children: 'text'
}
```

所以我们要在[**patchProps函数**](renderer.html#抽离api)中添加对事件的处理方法

初步版本：

```js
patchProps(el, key, prevValue, nextValue) {
    if (/^on/.test(key)) {
        const name = key.slice(2).toLowerCase()
        // 移除上次绑定的事件处理函数
        prevValue && el.removeEventListener(name, prevValue)
        // 绑定新的事件处理函数
        el.addEventListener(name, nextValue)
    }
}
```

在初步的处理事件函数中，我们每次更新绑定的时候会先移除上次绑定的事件处理函数，再添加新的事件处理函数，这样频繁的创建删除操作会非常影响性能。

并且处理事件的时候会遇到不同的情况：

1. 一个标签中有多个事件处理函数
2. 同个事件处理函数中有多个处理方法

```js
const vnode = {
    type: 'p',
    props: {
        onClick: [
            () => {
                alert('onContextmenu')
            },
            () => {
                alert('onContextmenu')
            }
        ],
        onContextmenu: () => {
            alert('onContextmenu')
        },
        onClick: "", // 这是定义了事件但没有赋值的情况，也就是清空点击函数
        onClick: [
            () => {
                alert("C");
            },
            () => {
                alert("D");
            },
        ]
    }
    children: 'text'
}
```

根据以上所遇到的问题，梳理下要优化的地方：

1. 要能够存储同个事件的多个方法与多个事件的处理函数
2. 要能够减少性能的开销，减少清除监听器的操作次数

2.0版本：

```js
// 将设置属性的相关操作封装进 patchProps 中，并作为渲染器选项传递
// el为要创建的节点; key为属性名; prevValue为旧的属性值; nextValue为新的属性值
function patchProps(el, key, prevValue, nextValue) {
    // 处理事件操作
    if (/^on/.test(key)) {
        // 定义一个对象invokers要能够实现绑定多个事件的处理函数
        // 判断el._vei存不存在，不存在则创建一个对象
        const invokers = el._vei || (el._vei = {})
        // 获取为该元素伪造的事件处理函数invoker,并获取相对应的事件的方法
        let invoker = invokers[key]
        // 获取事件名称, ( key: onClick ) ==> click
        const name = key.slice(2).toLowerCase()
        // 如果新的事件处理函数存在
        if (nextValue) {
            if (!invoker) {
                // 如果没有 invoker则定义一个invoker作为伪造的事件函数并传入事件参数，
                // 而真正的事件处理函数用invoker.value存储
                // 当在运行invoker函数的事件的时候其实就是在运行invoker.value中真正的事件处理函数
                invoker = el._vei[key] = (e) => {
                    // 若invoker.value为同一个事件下的不同方法
                    if (Array.isArray(invoker.value)) {
                        // 遍历所有的真实事件函数，在每个里面传入事件参数
                        invoker.value.forEach(fn => fn(e))
                    } else {
                        // 否则直接为函数传入参数
                        invoker.value(e)
                    }
                }
                // 将真正的事件处理函数赋值给 invoker.value
                invoker.value = nextValue
                // 绑定invoker作为事件处理函数
                el.addEventListener(name, invoker)
            } else {
                // 如果invoker存在，则意味着更新只需要更新invoker.value即可
                // 不用再卸载掉之前的监听器
                // 因为是同一个事件下
                invoker.value = nextValue
            }
        } else if (invoker) {
            // 如果遇到定义了事件但没有赋值的情况，说明新的事件绑定函数不存在
            // 需要执行初始化操作卸载之前绑定的事件
            // 即判断 invoker 是否存在，存在的话则移除绑定
            el.removeEventListener(name, invoker)
        }
    } else if (key === 'class') {
        el.className = nextValue || ''
    } else if (shouldSetAsProps(el, key, nextValue)) {
        const type = typeof el[key]
        if (type === 'boolean' && value === '') {
            el[key] = true
        } else {
            el[key] = nextValue
        }
    } else {
        el.setAttribute(key, nextValue)
    }
}
```

但当我们将事件处理函数与响应式的数据绑定使用时会发生一个很奇怪的现象，处理代码（只保留了关键的地方）如下：

```js
const bol = ref(false)

effect(() => {
    // 创建vnode
    const vnode = {
        type: 'div',
        props: bol.value ? {
            onClick: () => {
                alert('父元素 clicked')
            }
        }:{},
        children: [
            {
                type: 'p',
                props: {
                    onClick: () => {
                        bol.value = true
                    }
                },
                children: 'text'
            }
        ]
    }
    renderer.render(vnode, document.querySelector('#app'))
})
```

在运行上述代码的时候，我们会发现在一开始初始化绑定父元素的时候并没有绑定事件的处理函数，因为`bol`的值为`false`，所以当我们点击时应该不会出现弹出框，但是当我们点击的时候却出现了弹框。

这是因为在点击的时候，响应式函数接收到了`bol`的值的改变会重新执行副作用函数，这时候会渲染父元素的点击函数绑定处理事件，之后捕获到从子元素冒泡上来的点击响应，流程如下所示：

<img src=".\images\image-20240119172943463.png" alt="image-20240119172943463" style="zoom: 67%;margin:0 auto" />

所以我们要阻止这个冒泡的传递，这里用时间戳来屏蔽掉所有初始绑定元素之后的冒泡事件处理函数

```js
function patchProps(el, key, prevValue, nextValue) {
    if (/^on/.test(key)) {
        const invokers = el._vei || (el._vei = {})
        let invoker = invokers[key]
        const name = key.slice(2).toLowerCase()
        if (nextValue) {
            if (!invoker) {
                invoker = el._vei[key] = (e) => {
                    // 如果初次绑定的事件早于事件触发的时间则不执行事件处理操作
                    if (e.timeStamp < invoker.attached) return
                    if (Array.isArray(invoker.value)) {
                        invoker.value.forEach(fn => fn(e))
                    } else {
                        invoker.value(e)
                    }
                }
                invoker.value = nextValue
                // 绑定初次渲染的函数时间
                invoker.attached = performance.now()
                el.addEventListener(name, invoker)
            } else {
                invoker.value = nextValue
            }
        } else if (invoker) {
            el.removeEventListener(name, invoker)
        }
    } else if (key === 'class') {
        el.className = nextValue || ''
    } else if (shouldSetAsProps(el, key, nextValue)) {
        const type = typeof el[key]
        if (type === 'boolean' && value === '') {
            el[key] = true
        } else {
            el[key] = nextValue
        }
    } else {
        el.setAttribute(key, nextValue)
    }
}
```
