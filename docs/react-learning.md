<meta name="referrer" content="no-referrer"/>
<a name="yc9pr"></a>
## 1.React理念
React为了践行“**构建快速响应的大型 Web 应用程序**”理念做出的努力。<br />其中的关键是解决**CPU的瓶颈**与**IO的瓶颈**。而落实到实现上，则需要**将同步的更新变为可中断的异步更新。**

**何为异步可中断更新？**<br />在浏览器每一帧的时间中，预留一些时间给JS线程，React利用这部分时间更新组件。<br />当预留的时间不够用时，React将线程控制权交还给浏览器使其有时间渲染UI，React则等待下一帧时间到来继续执行被中断的工作。<br />**更新在执行过程中可能会被打断（浏览器时间分片用尽或有更高优任务插队），当可以继续执行时恢复之前执行的中间状态。**

<a name="uGQz7"></a>
### react15的缺点
React从v15升级到v16后重构了整个架构。本节我们聊聊v15，看看他为什么不能满足**快速响应**的理念，以至于被重构。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650089477183-8aa35c61-da78-46ea-9594-82060e15bec7.png)<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650089611932-4a522269-756b-4d71-9f26-e0b2a54f2f70.png)<br />**总结：**<br />**Reconciler和Renderer是同步交替执行的**，Reconciler会递归虚拟DOM树，发现有需要变更的DOM，便立即会通知Renderer去执行DOM更新，依次递归查找下去。故它**无法实现异步可中断的更新**，当虚拟DOM树比较深时，**需要更新的DOM比较多时，页面会造成卡顿。**

<a name="QhmeS"></a>
### 新的react16架构
由于React15架构不能支撑异步更新以至于需要重构。<br />React16架构新增了Scheduler（调度器）， 调度任务的优先级，高优任务优先进入Reconciler。<br />重构了Reconciler，将递归处理虚拟DOM，变为了**可中断的循环**，内部采用**Fiber架构**。
<a name="Au9Nk"></a>
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650090440348-3d474beb-4235-4f6a-a0aa-88f0d09db4b8.png)
<a name="o2eFt"></a>
## 2. fiber
<a name="HbewI"></a>
## ![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650090518331-7c8d590c-7a3e-435c-9ae2-3a67dccebbb1.png)
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650090583602-00db474b-f5be-4cdd-8110-f5fb9a885ae0.png)<br />**总结：**<br />fiber是React16引入的概念，它有两层含义：

1. fiber节点就是VNode的进阶版本，fiber节点是在VNode基础上，新增了一些属性，在VNode上打上了标记，如增删改查的属性，commit时，renerer就知道如何操作DOM了。
2. 从架构层面来说，在reconciler中通过使用fiber，可以完成**操作中断与恢复**，并且恢复之后可以复用之前的**中间状态**，它是**react内部实现的一套状态更新机制**。当有高优先级任务时，执行的过程中可以中断任务，转而执行高优先级任务，当预留时间不够时，可以中断执行，将线程的执行权交出去。这样一种机制就叫做**fiber**(纤程)。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650702667124-b4daa010-ca9b-4ea4-8434-184c3740a96c.png)<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650703773290-a612ff56-c17c-4d23-bc2b-290826d74d2c.png)**fiber将render阶段中的diff(渲染)进行分片，当预留的时间不够时，停止render，让出主线程执行权，交给渲染线程执行。**

<a name="Py7hG"></a>
## 3. 为何不用generator而创造fiber？
**fiber实现了操作的中断与恢复**，继续执行时复用之前执行的中间状态**。**它类似于协程。<br />而在js中**Generator**就是一种协程的实现，它可以中断函数的执行，将线程控制权交出去，然后可以接着上一次中断的地方接着执行。它跟fiber其实是一样的。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650091449655-6e098273-624d-442f-aaac-6b9627965639.png)

- generator具有传染性
- generator无法实现**高优先级任务插队**，它的中间态是上下文关联的，当有高级先级任务插队时**，需要重新计算上下文的中间状态。**



<a name="XKIvP"></a>
## 4. (element、component)(VNode、jsx对象、fiber节点)的区别
我们知道写的JSX，最终会被`babel`编译为`React.createElement`方法。<br />`createElement`返回一个包含组件数据的对象，我们称之为 `element`，也可以叫做`VNode`(虚拟DOM)，或者为`JSX对象`。<br />`component`就是一个组件，可以是函数组件、class组件，它是作为`type`属性传入`createElement`中去的。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650092428825-109574cd-5f38-454b-93ac-8b5e47b978ff.png)<br />fiber节点拥有比VNode更多的信息，VNode仅仅描述了DOM结构，而fiber包含有Scheduler、Reconciler、Render等相关的信息。

<a name="PSiAM"></a>
## 5.fiber双缓存
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650163087190-7dc2a353-fc32-4196-874d-d375a109f9fe.png)<br />React只有一个根节点，就是`fiberRootNode`，整个应用的根节点，而组件的根节点是`rootFIber`。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650163144564-a5e6bc7f-0e99-4080-b520-65977edda3fa.png)<br />在react中同时存在两棵fiber树，页面中渲染的为`currentFiber树`，内存中(`reconciler中`)正在构建的是`workInProgress Fiber树`，在commit阶段（`renderer中`），将`fiberRootNode`的current指向`workInProgress树`，它变为`currentFiber树`，渲染在页面上。


<a name="o2X3E"></a>
## 6. render流程
Reconciler执行的过程称为**render阶段**，Renderer执行过程称为**commit阶段**。相较于Vue的话，这两个阶段就为render 和 patch。

我们知道`Fiber Reconciler`是`从Stack Reconciler`重构而来，通过**遍历的方式实现可中断的递归**。所以render的工作可以分为两部分：“递”和“归”。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650103054057-67a3ac8f-a2c6-471a-b929-e502c08f3fbf.png)
<a name="jLTve"></a>
### beginWork
beginWork的工作是传入当前Fiber节点，创建子Fiber节点。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650103653750-4c607ecd-c134-4d16-891f-baf4492da019.png)<br />在update阶段中，会涉及diff算法，用jsx对象(VNode)与`current Fiber树`进行比对，判断DOM节点是否可以复用，比对成功就可以拷贝旧fiber节点复用，不能复用则新创建fiber节点，比对的`currentFiber` 打上`deletion`的`effectTag`，最后生成`workInProgress Fiber树`。

在mount阶段中，由于当前`current Fiber树`仅存在`rootFiber`，所以VNode在与fiber进行比对时，都是新建fiber。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650103764760-ec5eae36-6e54-4f86-b8a4-936c99ff0d52.png)<br />在render的"递"阶段，dfs遍历fiber节点树，与旧fiber树(current fiber)进行比对，若需要对 对应的DOM进行增删改操作时，会给当前fiber节点打上标志（**effectTag**），在commit阶段遍历**effectList链表**，对DOM进行 增删改操作。<br />**注意：** 首次渲染时(mount)，递归VNode树，创建fiber节点，并不会对每个fiber节点打上effectTag，只会对根节点`rootFIber`打上`palacement`的`effecTag`，在commit阶段，只会执行一次DOM节点插入操作。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650104324733-ad6baf0a-00b4-4486-ace5-d1f570844d32.png)
<a name="OjrWH"></a>
### completeWork
在completeWork中，**update主要处理props**，不需要生成DOM节点，处于更新阶段，之前已经渲染过了，存在一颗完整的`currentFiber`树，可以直接复用DOM。对处理的props生成`updateQueue`，最终在commit阶段渲染到页面。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650104730158-9f325ee5-fc73-4d6a-a4e8-f5036b596e50.png)<br />而在mount时(首次渲染)，需要根据fiber节点生成对应的DOM，挂在`fiber.stateNode`上，**并将子孙的DOM节点插入上层的DOM节点中，形成一棵DOM树**。形成DOM树，但不会立即插入到页面中去，这个操作是在内存中完成的，不是在浏览器中完成，需要等到commit阶段才会将其插入到页面。 同样也会处理props的逻辑。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650104834885-eb169994-7751-44f3-9651-489c8dedd98d.png)<br />至此我们会生成一棵fiber树，树中存被打上标记(effectTag)的节点，同时我们还需要生成`**EffectList**`链表，链表上是**所有被打上标记的节点**。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650105432464-935e3f57-e02e-4cd2-892e-e96a4142845f.png)
<a name="n6sFb"></a>
### 总结
整个render阶段，就是`Reconciler`执行的全过程，分为“递”和“归”两个过程。<br />其中“递”阶段会执行`beginWork`，“归”阶段会执行`completeWork`。<br />render阶段会区分`mount`(首次渲染)和`update`。

- 在递阶段的mount阶段，由于此时`currentFiber`树为空，其只有`rootFiber`节点，此时根据组件返回的JSX (VNode) 在内存中依次创建Fiber节点并连接在一起构建Fiber树，被称为`workInProgress Fiber树`。并对`rootFiber`打上`placement`的effectTag。
- 在递阶段的update阶段，`workInProgress fiber`的创建可以复用`current Fiber树`对应的节点数据，复用更新fiber节点（diff算法）。`fiber.alternate`将`current fiber `和 `workInProgress fiber`连接起来，故在`workInprogressFiber`树中可以拿得到其对应的`current Fiber`节点。  在遍历fiber节点时，会比对`current fiber `和 `workInProgress fiber`节点（同层比较），比对需要更新的节点打上`EffectTag`标志。

- 在归阶段的mount阶段，根据fiber节点生成对应的DOM，挂载`fiber.stateNode`上。生成子孙节点的DOM节点，并按照**父子规则**插入组成`DOM树`。并对props进行处理，生成`updateQueue`。此时便已经构建好了一棵`**离屏DOM树**`。
- 在归阶段的update阶段，不需要生成DOM节点，fiber节点已经存在了Dom节点了。这时需要处理props，生成`workInProgress.updateQueue`，最终会在**commit阶段**被渲染在页面上。 如果新增一个fiber节点，此时并不需要生成对应的DOM结构，只需要为其打上一个`effectTag`即可，在递阶段完成。  在往上执行归操作时，将被标记的fiber节点(effectTag) 组成一个`effectList链表`，为了在commit阶段更加高效操作DOM。

最终，我们得到了处理过的`workInprogress fiber`树，`effectList`链表、`updateQueue`保存了变化的props数据，`effectList`和`updateQueue`被挂载在`workInprogress fiber`的属性上的。<br />然后将`fiberRootNode`被传递给`commitRoot`方法，开启`commit阶段`工作流程。<br />**整个render阶段都是在内存中完成。**


<a name="b7AMj"></a>
## 7. commit流程
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650113650443-2581ed40-8169-48ee-b55b-13cc2a1cb962.png)
<a name="fWqrk"></a>
### before mutation阶段
`before mutation`阶段的代码很短，整个过程就是遍历`effectList`并调用`commitBeforeMutationEffects`函数处理。**在该阶段操作DOM，完成DOM渲染。**<br />commitBeforeMutationEffects整体分为如下三部分：

1. 处理`DOM节点`渲染/删除后的` autoFocus、blur` 逻辑。
2. 调用`getSnapshotBeforeUpdate`生命周期钩子。
3. 调度`useEffect`。

这里并不会对DOM进行操作，主要是完成一些调度、初始化工作。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650115575186-4f6bb943-30b4-4e1e-a395-235f52da8b57.png)
<a name="CR5Aj"></a>
### mutation阶段
类似`before mutation`阶段，`mutation`阶段也是遍历`effectList`，执行函数。这里执行的是`commitMutationEffects`。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650115966692-fd620189-ad51-42ba-8df4-cd958f68e909.png)

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650116053816-60cf8da3-5637-4d26-92eb-a0c7d2105d73.png)<br />`Update effect`主要更新DOM元素，将`fiber.updateQueue`的props更新到页面的DOM中去。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650116084093-f2c14aef-b1c0-430a-96ba-cd18674137fc.png)<br />在`Deletion effect`中会触发`componentWillUnmount`的生命周期钩子，这里做的主要是DOM卸载工作，执行`uesEffect`销毁函数，解绑ref。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650116183479-d026fd8e-50b7-4e08-bd2f-4fccaf8b6b3c.png)
<a name="fX5sE"></a>
### layout阶段
该阶段之所以称为`layout`，因为该阶段的代码都是在**DOM渲染完成**（mutation阶段完成）后执行的，此时可以拿到更新后的DOM。<br />该阶段触发的生命周期钩子和hook可以直接访问到已经改变后的DOM，即该阶段是可以参与DOM layout的阶段。

与前两个阶段类似，`layout阶段`也是遍历`effectList`，执行函数。<br />具体执行的函数是`commitLayoutEffects`。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650116496067-2b5e73f5-ae68-4827-84e8-e387781ecaea.png)<br />然后将`fiberRootNode`的`current`指向当前`workInprogress Fiber树`，它会变为`current Fiber树`。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650116551537-55519e4d-d3ab-4936-b008-0b183623204e.png)
<a name="V37yp"></a>
### 总结
整个commit分为三个阶段，`beforeMutaion`、`mutaion`、`layout`。<br />这三个阶段都要遍历`effectList`，执行相应操作，具体如下：<br />`beforeMutaion`：

1. 处理DOM渲染/删除时 focus、blur等逻辑状态。
2. 执行`getSnapshotBeforeUpdate`钩子。
3. 调度`useEffect`，注意不是执行，将`flushPassiveEffects`添加到`scheduleCallbak`中，在layout阶段之后再执行，`flushPassiveEffects`内部会遍历`effectList`，执行所有的`useEffect`回调。

`Mutaion`：

1. 对DOM进行操作，增删改。
2. `effectTag`为`palacement`代表新增节点，将fiber对应的DOM节点挂载到对应的父DOM下。
3. `effectTag`为`deletion`代表删除节点，在删除DOM节点时，会触发`componentWillUnmount`生命周期钩子，会执行useEffect的销毁函数，解绑ref，相应删除它的子孙节点。
4. `effectTag`为`update`代表更新节点，将fiber的`updateQueue`更新到对应DOM上去。
5. 创建文本节点。

`Layout`：

1. 调用生命周期钩子、hook相关操作。
   1. class组件会调用`componentDidMount`或`componentDidUpdate`钩子。
   2. 函数组件会调用`useLayoutEffect`的回调函数，调度`useEffect`的`销毁与回调函数`。执行`useEffect`的返回函数，执行更新前组件的销毁动作。
   3. setState的第二个回调函数也会在这里调用，这里可以拿到更新后的`state`。
2. 获取DOM实例，更新Ref。
3. 将`fiberRootNode`的`current`指向当前`workInprogress Fiber树`，它会变为`current Fiber树`，而之前的`current Fiber树`变为 `workInprogress Fiber树`。

<a name="zponV"></a>
## 8. 为啥要废弃一些生命周期？
`reconciler`在React16使用`fiber`进行了重构，**支持异步可中断的操作，**reconciler的任务可能中断/重新开始。<br />如当前render阶段被中断，下次再执行时，对应的组件在render阶段的生命周期钩子（即componentWillXXX）可能触发多次。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650118231230-d68e396a-097a-4028-9fdf-cf0ded97b2fa.png)

<a name="jA7aP"></a>
## 9. Effect和useLayoutEffect有啥区别？
<a name="JdiA5"></a>
### 使用方式
这两个函数的使用方式其实非常简单，他们都接受一个函数一个数组，只有在数组里面的值改变的情况下才会再次执行 effect。
<a name="i5K4k"></a>
### 差异

- useEffect 是异步执行的，而useLayoutEffect是同步执行的。
- useEffect 的执行时机是浏览器完成渲染之后(`commit阶段完成后`)，而 useLayoutEffect 的执行时机是浏览器把内容真正渲染到界面之前(`commit阶段的layout阶段`)，和 componentDidMount 等价。

如在`useEffect`和`useLayoutEffect`中`setState`，因为 useEffect 是渲染完之后异步执行的，所以会出现闪烁现象，有旧state变为新state的闪烁。<br />而 `useLayoutEffect` 是渲染之前同步执行的，所以会等它执行完再渲染上去，就避免了闪烁现象。也就是说我们最好把操作 dom 的相关操作放到 `useLayouteEffect` 中去，避免导致闪烁。

`mutation阶段`会执行`useLayoutEffect hook`的销毁函数。<br />在`layout阶段`开始时，`useLayoutEffect hook`从上一次更新的销毁函数调用 到本次更新的回调函数调用是同步执行的。<br />而`useEffect`则需要先在`beforeMutaion阶段`调度，推入`SchduleCallbak`中，然后在commit阶段完后异步执行。<br />在`Layout阶段完成后`再异步执行，在dom渲染挂载完成后异步执行。<br />我们习惯在`useEffect`中执行一些副作用，**因此它不应该阻塞浏览器的渲染。**
<a name="N8UpK"></a>
### 总结

1. 优先使用 useEffect，因为它是异步执行的，不会阻塞渲染
2. 会影响到渲染的操作尽量放到 useLayoutEffect中去，避免出现闪烁问题


<a name="AcYP3"></a>
## 10. diff
react的diff发生在`reconciler`的`beginwork`中，只有在update时才会涉及diff算法。<br />diff算法是`VNode/JSX对象`和`current fiber`进行比较，比较它们的DOM，决定新建或复用fiber节点。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650160800678-653546e6-50ba-42db-a3aa-07763e39f663.png)<br />diff分为**单节点diff**和**多节点diff**

<a name="gDTrs"></a>
### 单节点diff
只有key和type都相同时，才认为DOM节点可以复用，DOM节点是挂在`fiber.stateNode`上，故fiber节点也直接拷贝副本复用即可。<br />当本次更新的JSX对象**只有一个节点时**，会触发单节点diff。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650160986230-2a04a65a-8177-4c80-8c09-8575e429457a.png)
<a name="rkwbw"></a>
### 多节点diff
若本次更次的VNode的children是一个数组，就是多节点diff。`VNode`是一个数组，`currentFiber`是一个链表，数组和链表进行比较，所以不能双指针头尾比较，只能通过**指针遍历链表、遍历数组进行比较**。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650161548221-7da674ee-8253-4662-a0d5-41ea92505432.png)<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650161625377-0f363ec3-2e65-425b-a2a8-ae783c192da4.png)<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650161683967-b736a911-d2cc-42f9-8ba2-859853fbda01.png)<br />当`newChildren`和`oldFiber`都未遍历完，则从根据key来找节点，决定是否复用。为了优化查找，所以在这里会存储一个map结构，为了快速找到key对应的`oldFiber`。 <br />然后直接遍历`newChildren`数组，在map中找key，找到相同key，再比较type是否相同来决定是否复用DOM，若相同直接复用fiber副本，将这个key从map中删除。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650161720924-4d4aa8f2-daf2-444b-b566-b132b0b11486.png)


<a name="iUWot"></a>
### vue的diff和react的diff有啥异同？
**相同点：**

- 出发点相同，在update时，与上一次`VNode/CurrentFIber` 进行比对，来决定DOM是否可以复用，**减少DOM操作次数，提高性能。**
- 都是通过比对** key和type**，来决定两个DOM是否相同复用。
- 单节点diff相同
- 多节点diff时，暴力比对的策略相同，通过map来进行优化，更快找到key对应的`oldFiber/VNode`。
- 都是同层级之间diff。

**不同点：**

- vue的diff发生在patch阶段，diff后，直接就操作`新建/更新DOM`了，是同步的过程。react的diff发生在`reconciler`中，它不会立即更新DOM，而是复用/新建fiber节点，若需要操作DOM，则对对应fiber节点打上`effectTag`的标志，**在commit阶段(renderer)中**，遍历`effectList`**批量操作更新DOM。**
- react的diff是可以被打断终止的，当预留时间不够/有高优先级任务进来，再次恢复时，可以从之前的中间态继续执行。
- diff比较的对象不同，vue中是比较前后两次`VNode数组`，react是`VNode数组`和`currentFiber链表`比对。
- 多节点diff实现有所不同，在vue中是比较的是两个数组，所以采用了**头尾双指针(**头头、头尾、尾尾、尾头)比较。 而react是链表和数组比较，只能从头遍历比较，从左向右比较， **vue的更加高效。**

<a name="uHfUD"></a>
## 11. 状态更新机制
<a name="rTqGX"></a>
### 更新流程
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650179954597-75df9dc6-fb08-4bc1-a4a4-83437e5373a1.png)

**在react中，需要我们手动触发状态更新，react并不会感知状态是否更新。**<br />总共有如下这几种触发状态更新的方法，调用触发状态更新方法会生成`update对象`。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650180022181-5e389253-bf14-4a28-a414-3839f053e7fa.png)<br />在render阶段，是从`rootFiber`向下遍历比对生成`workInProgress Fiber`的，从当前**触发更新的fiber**向上遍历可以找到`rootFiber`。<br />而在`当前触发更新fiber中`，可以从下向上遍历找到`rootFiber`。在render阶段，会从向下遍历(dfs)，找到对应的`更新fiber`，计算`state`、打上`effectTag`标签等。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650180108958-3938de04-965d-4b23-b2a7-623a77481377.png)<br />此时已经拿到`rootFiber`，而且已知该`Fiber树`中必然有某个`FIber节点`包含`Update对象`，需要进行更新。此时，需要`Scheduler`根据**更新优先级**来决定 是异步更新还是同步更新。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650180284450-ec01bb57-fbf0-48a5-a84f-95045ca29bb2.png)

<a name="XWCIG"></a>
### update对象
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650182754476-6a479e8a-f0b1-4652-9bbd-5f1269c28a64.png)<br />更新是由具体`Fiber节点`上触发的，更新会产生Update对象，一个`Fiber节点`可能会产生多个`Update对象`，如连续触发多次`setState`。<br />多个`Update对象`通过`next指针`连接成一个链表，存储在`fiber.updateQueue`中。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650182791000-bc3b0c45-baaa-4fe2-8da3-fc31b0ca01f5.png)
<a name="tiMwQ"></a>
### updateQueue结构
更新调度进入render阶段后，会将`shared.pending`的环 剪开并链接在`updateQueue.lastBaseUpdate`后面，将`本次更新的Update`取出链接在`lastBaseUpdate`后面。

这样会形成一个`updateQueue.baseUpdate链表`，接下来遍历链表，基于`baseState`(上一次的state)，依次与遍历到的`Update`进行计算产生`新的state`，当遍历完毕最后一次计算得到的`state`就是本次`该Fiber节点`在本次更新的state（源码中叫做`memoizedState`）。  然后再给这个fiber节点打上`effectTag`，在`commit阶段`渲染到页面中去。

由于在遍历`baseUpdate链表`时，每个`Update`都与`baseState`进行计算，`baseState`只有在`commit阶段`执行完毕才会变化，故调用多次`setState`并没有基于上次setState更新的state而进行更新，只有最后一次`setState`生效，一种`批量更新的机制`。

如果要基于上次更新的state而进行计算，需要使用在setState中使用函数式写法。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650183074089-a9323e02-14d0-44d4-adfc-faaf018a2655.png)
<a name="URSMJ"></a>
### 优先级
在`reconciler`中任务的执行是可以被打断的，当有高优先级任务，`reconciler`中的任务被打断，转而执行高优先级任务，执行完毕可以回到打断的任务中，基于中间态接着执行。<br />通过**优先级**可以决定哪个`更新任务`优先被执行。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650184841629-2aad87fe-cb50-4d6d-a739-c8bb5c2bfbd9.png)<br />优先级调度需要开启`comcurrent`模式，React18已经默认切换为`comcurrent`模式了。开启了这个模式，就可以调度任务的优先级，高优的`update`先执行。<br />通过如下`createRoot`创建入口函数，就可以开启`comcurrent`模式了。
```javascript
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(<App/>);
```
使用`ReactDOM.render()`创建入口函数，它属于`legacy`模式，这是当前`React17`使用的方式，它不支持优先级调度，不支持`任务中断/优先级`。<br />所以要想高性能完成更新渲染，需要开启`concurrent`模式。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650186041877-e58bcc90-e2b3-4f06-8fa6-04e62ceeeb2b.png)<br />B2被跳过了，那么第二次render时，它的`baseState`为跳过的前一个`update`计算的`State值`，并不是前一次render生成的`memoizeState`。

**保证任务中断/恢复时Update对象不丢失**<br />本次更新的`Update对象`会存储在`updateQueue.shared.pending`，以一个`单向环状链表`形式保存。由于fiber使用`双缓存机制`技术，所以该`update对象`也同样保存在了`currentFiber.updateQueue`中。<br />当render被中断重新执行后，会基于`currentFiber.updateQueue`克隆出`workInprogressFiber.updateQueue`。<br />当`commit阶段`完成渲染，由于`workInProgress updateQueue.lastBaseUpdate`中保存了`上一次的Update`，所以` workInProgress Fiber树`变成`current Fiber树`后也不会造成Update丢失。

**保证连续状态的依赖性**<br />在`setState`中使用函数更新state，那么每次拿到的state 是基于上次更新得到的，这样更新状态是具有连续性的。<br />在优先级调度下，有多个连续的`Update`，且前后具有依赖性的。那么当跳过某个`update`时，保存在`baseUpdate`中的不仅是该`Update`，还包括链表中该Update之后的`所有Update`。

故因为如上机制，所以在**开启优先级调度模式**下，可能会造成`update`被重复多次执行，其生命周期也会被多次执行，所以在React16.4废弃了一些生命周期（componentWillxxxx），这些生命周期是在`render阶段`触发的。

<a name="L0ogu"></a>
## 12. setState是同步还是异步？
[https://zhuanlan.zhihu.com/p/350332132](https://zhuanlan.zhihu.com/p/350332132)<br />**结论：**<br />只要你进入了 react 的调度流程，那就是异步的。只要你没有进入 react 的调度流程，那就是同步的。<br />在`setTimeout`、`setInterval` ，直接在 DOM 上绑定原生事件等。这些都不会走 React 的调度流程，在这种情况下调用 setState ，那这次 setState 就是同步的。 

**异步情况：**<br />在生命周期中、合成事件中，进入这些回调函数之前，`isBatchingUpdates`会置为`true`，触发了 react 的**批处理机制**`batchedUpdates`，将多次`setState`放到队列中，在`reconciler`中异步批量执行，最终只会执行最后一次`setState`。 故在setState后拿不到更新后的状态值。 当同步代码执行完毕后，`isBatchingUpdates`会被置为false。

**同步情况：**<br />在异步代码、原生事件中 调用setState不会触发批量更新机制，可以在setState后立即拿到更新的state。在同步代码执行完毕后，异步代码才会执行，此时`isBatchingUpdates`为`false`，故不会进入react调度流程，不会异批量更新，所以可以立即拿到更新后state。

**注意：**在函数组件中，无论怎么setState都拿不到更新后的值，这是由于函数闭包引起的，重新执行了函数。

react的主张**状态不可变**，所以拿到立即拿到更新后的state这个操作是不合理的，要么就将其状态提到最上层。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650209399196-45e9e1ae-1e13-4a87-aca4-d36e493fc95a.png)


<a name="YiWSa"></a>
## 13.为啥推荐用函数组件、hook？
<a name="u1TuY"></a>
### 原class组件的痛点：

- 在组件之间复用状态逻辑很难，使用renderProps、HOC，这些都有缺点，会让代码变得难以理解，而且会造成回调地狱，代码难以维护。
- 复杂组件变得难以理解，我们经常会在生命周期中做一些**副作用操作**，可能在一个生命周期中，有多个互不相干的逻辑，这样且不好进行拆分，容易导致BUG。
- class组件的this难以理解，还需要给事件处理函数绑定this。
- 性能问题，calss相较于function不是很好压缩。而且class组件对`concurrent(同步)模式`支持不友好。在`render阶段`若有高优先级的任务，会中断当前任务，转而执行高优先级的任务，执行完毕后可以回到中断的任务接着`中间态`继续执行。class组件的实例对象是共享的，在某个任务中修改了state，其他任务可以感知到，这样会造成问题。

<a name="ZkjWF"></a>
### 函数组件(hook)带来的优点：

- 函数组件可以使用hook来更加优雅的逻辑复用，提高代码的维护性。
- 函数组件使用hooks(useEffect)来替代生命周期，可以在hook中写副作用操作，可以将不同的副作用操作抽离到不同的hook中。**利用hook提供的副作用的API，使得生命周期变成了一个“底层概念”**，无需开发者考虑。开发者工作在更高的抽象层次上了，**从过去的命令式编程转变成了声明式编程。**
- 函数组件可以更好的支持`concurrent模式`，并发渲染**“多个版本”的组件树**，这些组件树是多个独立的函数，故它们的状态也互相不影响。

**函数组件的心智模型**<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650211859168-fd596413-41d4-4165-8862-8731457eee2d.png)<br />函数组件采用函数式编程，需要**保持函数组件是一个纯函数**，它的state、ref都由hook提供。函数式组件仅仅是**【外部数据=>view】的映射**，属于pure function的心智模型。 


<a name="qOkP0"></a>
## 14.实现useState  
实现分为两步：

1. 通过一些途径触发更新，组件重新render(函数组件重新执行)。
2. 使用useState可以拿到最新的值。

**思路：**

1. useState这个hook存储在组件对应的`fiber节点`上，一个组件有多个hook，会连成链表存储。每次调用useState，就会产生一个hook。
2. 调用useState的触发更新方法，会产生一个update，存储在hook.queue.pending中，多个update会组成单向环状链表
3. 在mount时，会创建hook并添加在fiber上；当通过某个hook的触发更新函数 触发更新，会往对应hook.queue.pending上添加上update。组件重新render，函数组件里的代码从上到下依次执行，执行`useState`时会判断是否有update，然后计算状态。
4. 一个组件会有多个hook，多个hook链接成链表，是通过维护一个**指针变量**`workInProgressHook` 来确定是当前useState的hook 是哪一个hook。每次触发调度时，都会将当前hook指针变量置为第一个hook，触发组件render，重新执行useState，每执行完一个useState，`workInProgressHook`指针后移一位，这样就可以确定当前useState对应的是哪个hook了。
5. 这里简单写法，直接就在`rootFiber`上，省略了从当前`fiber`节点向上查找`rootFiber`的过程。在`render阶段`会收到`Scheduler`发来的任务，遍历`rootFiber`找到对应的fiber节点，遍历`updateQueue`计算state。
```javascript
// 通过workInProgressHook变量始终指向当前正在工作的hook。
let workInProgressHook;

// 判断时mount or update
let isMount = true;

// hook存放在对应的fiber节点上,一个组件会有多个hook,故这里存放为hook链表
// 产生状态更新时，会生成update结构，多个update组成单向环状链表，在class组件中update存放在updateQueue中，在函数组件中存放在hook中
const fiber = {
  // 存放hook链表
  memoizedState: null,
  stateNode: App,
};

// 模拟调度Scheduler
// 在shcdule里会调用函数组件，进入render阶段
function schedule() {
  // 更新前将workInProgressHook重置为fiber保存的第一个Hook
  workInProgressHook = fiber.memoizedState;

  // 执行函数组件,触发组件render
  const app = fiber.stateNode();
  // 置为update阶段
  isMount = false;
  return app;
}

// 调用更新state的方法内部实际调用dispatchAction
// queue === fiber.hook.queue === fiber.updateQueue(class组件中)
// action 更新state的函数
// 作用：更新state时会调用，创建update对象，添加在fiber.hook.queue.pending上,组成单向环状链表,并触发schedule进行调度
function dispatchAction(queue, action) {
  const update = {
    action,
    next: null,
  };

  if (queue.pending === null) {
    // queue.pending不存在update
    // 多个update会构成单向环状链表，这里仅有一个update，也要与自己构成环状链表
    update.next = update;
  } else {
    // queue.pending上已存在环状链表,此次新加入的update要插入到环状链表的最后
    // queue.pending指向环状链表的最后一个节点,queue.pending.next则指向第一个节点
    // 要将此次update插入环状链表,且作为最后一会节点
    // 1. 先将自己的next指针指向第一个节点  2. 再让最后一个节点的next指针指向自己
    update.next = queue.pending.next;
    queue.pending.next = update;
  }
  // update存放在 fiber.memorizeState(hook).queue.pending上
  // queue.pending指向update链表的最后一个节点
  queue.pending = update;

  // 此时已经生成了update对象,放到了fiber节点的hook.queue.pending上了,此时需要触发schedule调度机制,后续render
  schedule();
}

// 当调用更新state的方法时,会触发函数重新执行,故useState也会再次执行,此时isMount为false,update阶段
function useState(initialState) {
  // useState生成hook
  let hook;

  if (isMount) {
    hook = {
      queue: {
        pending: null,
      },
      // 存放state
      memoizedState: initialState,
      next: null, // 指向下一个hook
    };

    // 判断fiber上是否存在hook
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook;
    } else {
      // 将当前hook链接到已有的hook之后,引用数据，同时会更新到fiber.memorizeState中
      workInProgressHook.next = hook;
    }

    // 指向当前hook,即hook链表最后一个hook
    workInProgressHook = hook;
  } else {
    // update阶段
    hook = workInProgressHook;
    // 指向下一个hook
    workInProgressHook = workInProgressHook.next;
  }

  // 当前hook的state
  let baseState = hook.memoizedState;

  if (hook.queue.pending) {
    // 这里已经进入了render阶段,遍历updateQueue,计算state
    let firstUpdate = hook.queue.pending.next;

    // 执行多个update,这里不考虑优先级调度相关
    do {
      // 计算state
      const action = firstUpdate.action;
      baseState = action(baseState);
      // 指针后移
      firstUpdate = firstUpdate.next;
    } while (firstUpdate !== hook.queue.pending); // 最后一个update执行完后跳出循环

    // update执行完后,清空queue.pending
    hook.queue.pending = null;
  }

  // 更新hook上的state
  hook.memoizedState = baseState;

  // 调用useState返回state和更新state的方法,在useState中
  // 通过调用dispatchAction来生成update对象, hook.queue === updateQueue
  // 当触发更新后,这里返回更新后的state
  // 这里通过函数克里化,让每个方法默认带其hook.queue
  return [baseState, dispatchAction.bind(null, hook.queue)];
}

// 模拟组件
function App() {
  const [num, updateNum] = useState(0);
  const [flag, setFlag] = useState(false);

  console.log(`${isMount ? "mount" : "update"} num: `, num, flag);

  return {
    click() {
      updateNum((num) => num + 1);
    },
    set() {
      setFlag((flag) => !flag);
    },
  };
}

const app = schedule();
// 触发更新
app.click();
app.set();
app.set();

```
<a name="aGPdU"></a>
### hook数据结构
一个组件会有多个hook，组成链表存储在fiber.memoizeState中，通过`workInprogressHook`来确定当前hook。<br />`hook.queue `等同于` updateQueue`，它存储`update对象`，`pending`始终指向`update`链表的最后一个节点。<br />不同的`hook.memoizeState`保存不同的值，useEffect、useRef、useState保存的都不同。 <br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650259862832-1546889a-5591-4f97-9f22-db42a2b5fd4a.png)
<a name="awFby"></a>
<a name="b48W1"></a>
<a name="g0PmV"></a>
## 15.为什么hook需要放在顶层？
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650247685462-5a5621f4-15d6-471b-956e-2a6c438dbd55.png)<br />组件的hook是被存放在对应的fiber节点中，多个hook组成一个链表，只要每次render时(重新执行)，hook的顺序都不变，那么就能确认当前执行`useState`、`useEffect`是哪一个hook。

通过一个指针变量`workInProgressHook`来指向当前hook，在render时，将其指向fiber上hook链表第一个节点，在执行组件里的代码时，每次执行`useState`、`useEffect`会将指针后移一位，指向下一个hook，这样就能确定当前是哪一个hook了。

所以一定要保证每次render(函数组件执行时)调用hook的顺序，这样才能在调用hook时确定当前是哪个hook，然后可以获取当前hook中保存的数据。   **若放在if、循环里 则不能保证 一定是按相同顺序被调用，这样会出现BUG。**


<a name="fTUXG"></a>
## 16.useRef
我们知道hook存放在对应的`fiber节点`上的，useEffect这个hook也存放在fiber节点上，它有一个结构`effect`，类似与stateHook的`update`。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650254385249-740af9f5-b707-42c4-ba40-a775cff742b4.png)useRef的实现很简单，将ref的值存储在`fiber.hook.memoized`就行。正是因为它的ref上存储的，当前组件的所有组件树都对应这一个red，故我们将ref当作`class组件中的this`来用，可以在更新ref的值后，立即获取更新后的值，不会有state的闭包问题。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650257869718-013611ee-342f-41cf-959a-5aa5f18e89a0.png)
<a name="N43sS"></a>
### ref工作流程
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650258303904-c42f3fd2-a190-4819-8e09-f1f86864a252.png)<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650258328396-8aa6adc0-666f-4c3c-8d69-e9cc1bba8f26.png)<br />commit阶段中，在`mutaion阶段`，根据`effectTag`对ref进行相应操作，在`layout阶段`，为ref赋值。


<a name="qp9p6"></a>
## 17.useMemo、useCallback
这两个hook其实和useRef差不多，就是将其存储在fiber节点上，**无论组件怎么渲染，产生多少个渲染树，fiber上存储的数据在多个渲染树依然是共享唯一的。**<br />组件重新渲染时，**从**`**fiber.hook**`**上取保存的函数或计算的值**，组件内不会执行计算逻辑、函数初始化，这样可以性能优化，但是存储在fiber上也是有性能消耗的。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650258852889-d1c15e51-a1e1-4209-b395-d63eb617fbab.png)


<a name="gyvPl"></a>
## 18. 事件机制
```javascript
<div onClick={this.handleClick.bind(this)}>点我</div>
```
React并不是将click事件绑定到了div的真实DOM上，而是在`document`处监听了所有的事件，当事件发生并且冒泡到document处的时候，**React将事件内容封装并交由真正的处理函数运行**。这样的方式不仅仅**减少了内存的消耗，还能在组件挂在销毁时统一订阅和移除事件。**

冒泡到document上的事件也不是原生的浏览器事件，而是由react自己实现的合成事件（SyntheticEvent）。因此如果不想要是事件冒泡的话应该调用event.preventDefault()方法，而不是调用event.stopProppagation()方法。<br />![](https://cdn.nlark.com/yuque/0/2021/jpeg/1500604/1611890469312-7504e85d-c6db-481e-b9d3-5307a3de708c.jpeg#crop=0&crop=0&crop=1&crop=1&from=url&id=sw8TS&margin=%5Bobject%20Object%5D&originHeight=395&originWidth=878&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

实现合成事件的目的如下：

- 合成事件首先抹平了浏览器之间的兼容问题，另外这是一个跨浏览器原生事件包装器，赋予了**跨平台开发**的能力，不强依赖浏览器DOM；
- 对于原生浏览器事件来说，浏览器会给监听器创建一个事件对象。如果你有很多的事件监听，那么就需要分配很多的事件对象，造成高额的内存分配问题。但是对于合成事件来说，**有一个事件池专门来管理它们的创建和销毁，当事件需要被使用时，就会从池子中复用对象，**事件回调结束后，就会销毁事件对象上的属性，从而便于下次复用事件对象。

事件池机制意味着** SyntheticEvent对象会被缓存且反复使用**，目的是提高性能，减少创建不必要的对象。当SyntheticEvent对象被收回到事件池中时，属性会被抹除、重置为null。<br />**但是React17之后不将SyntheticEvent对象放到事件池中统一管理了。**

<a name="pSfpp"></a>
### React的事件和普通的HTML事件有什么不同？
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650263219741-4100e905-f6c5-4813-b091-af7139a353cb.png)

<a name="OJKZr"></a>
## 19. HOC、RenderProps、Hooks
HOC / Render Props / Hooks 三种写法都可以**提高代码的复用性**。但实现方法不同。<br />**HOC**<br />HOC 是对传入的组件进行增强（组合）后，返回新的组件给开发者，通过函数接受一个组件，再返回一个容器组件，容器组件的render内容就是传入的组件，可以对该组件进行组合增强其复用性。<br />**缺点：可读性差，易用性差**，看不到接收和返回的结构，增加调试和修复问题的成本，难以理解。

**RenderProps**<br />Render Props 是指将一个返回 React 组件的函数，作为 prop 传给另一个 组件的共享代码的技术，将渲染内容由调用者来约束。主要解决组件逻辑相同而渲染规则不同的复用问题。<br />**缺点：**代码相对冗长，但能清晰看到组件接收的 props 以及传递的功能等，可以对 props 属性重命名，不会有命名冲突。但难以在 render 函数外使用数据源，且**容易形成嵌套地狱**。

**Hooks**<br />上述两种都是class组件用来复用代码的方法，它们都有缺点。React Hooks 是 React 16.8 引入的一组 API，可以完成**逻辑复用**。使用 Hooks 时，能清晰看到组件接收的 props 以及传递的功能等，可以对 props 属性重命名，不会有命名冲突，不存在嵌套地狱，且没有数据源获取及使用范围的限制。

**总结∶**<br />Hoc、render props和hook都是为了解决代码复用的问题，但是hoc和render props都有特定的使用场景和明显的缺点。hook是react16.8更新的新的API，让组件逻辑复用更简洁明了，同时也解决了hoc和render props的一些缺点。

<a name="i9as3"></a>
## 20.进程、线程、协程、纤程
**进程**<br />通俗理解一个运行起来的程序或者软件叫做进程，每次启动一个进程都需要向操作系统索要运行资源，让进程中的线程去执行对应的代码，**进程是操作系统分配资源的基本单位**。

**线程**<br />线程是依赖于进程的，也称为「微进程」。它是**程序执行过程中的最小单元** 。<br />**线程是cpu调度的基本单位**， 通过线程去执行进程中代码， 线程是执行代码的分支。**同一个进程的多个线程共享进程的资源**（省去了资源调度现场保护的很多工作）。当进程销毁后，进程下面的线程同样会被销毁。

**协程**<br />协程，又称微线程，纤程。**是一种基于线程之上，但又比线程更加轻量级的存在，这种由程序员自己写程序来管理的轻量级线程叫做『用户空间线程』**，它不受内核CPU的控制。<br />一句话说明什么是协程：**协程是一种用户态的轻量级线程。**

协程拥有自己的寄存器上下文和栈。协程调度切换时，将寄存器上下文和栈保存到其他地方，在切回来的时候，恢复先前保存的寄存器上下文和栈。因此：协程能保留上一次调用时的状态（即所有局部状态的一个特定组合），每次过程重入时，就相当于进入上一次调用的状态，换种说法：进入上一次离开时所处逻辑流的位置。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650039600506-3bb99d21-a732-4360-ab98-adbaa6990470.png)<br />**总结一下协程就是程序员自己定义的，在执行一个程序时可以进行中断，将线程的执行权交出去，等过一段时间后，可以回到原程序时，又可以接着前面的状态继续执行。**<br />在js中，`generator`就是协程的实现，执行函数时，可以中断执行，将执行权交出去，下次可以接着上次的状态接着执行函数。<br />**纤程和协程是一个概念，微软引入windows的不同叫法而已。协程是一种异步任务的解决方案。**



<a name="qL9JL"></a>
## 21.vue和react的区别
**1、监听数据变化的实现原理不同**

- Vue通过 getter/setter以及一些函数的劫持，能精确知道数据变化。利用响应式，当修改状态后，会自动进行更新。
- React默认是通过比较引用的方式（diff）进行的，如果不优化可能导致大量不必要的VDOM的重新渲染。需要自己手动`setState`告知产生状态变化。

这是因为Vue和React设计理念上的区别，**Vue使用的是可变数据，而React更强调数据的不可变。**

**2、模板语法的不同**

- Vue ⼀般使⽤的 HTML 的拓展模板语法，⼀般判断和循环，只能通过**指令(v-if)**来完成。
-  React 使⽤的则是 JSX 语法，JSX 语法可以使⽤ JS 的常⻅语法，条件、循环。使⽤的更 加原⽣。 

**3、diff不同**<br />在diff那节总结过了。

4、更新粒度不同，vue可以精确到组件，而React是自顶向下递归进行更新的，组件树中每个组件都会重新render。

也可以从react函数组件的优点展开来讲，vue属于面向对象编程。


<a name="zzSy2"></a>
## 22. renderProps究竟解决了什么样的问题？
目前我有一个场景，如下：
```javascript
// App.tsx
<Menu><MenuItem/></Menu>

// Menu.tsx
const Menu = (props)=>{
  // 我如何在当前组件中传参给props.children呢？
  {props.children}
}
```
**解法1: renderProps**
```javascript
// App.tsx
<Menu render = {(props)=>(<MenuItem {...props} />)}></Menu>

// Menu.tsx
const Menu = (props)=>{
  const [count,setCount] = useState(0);
  props.render({count,setCount})
}

// MenuItem.tsx
// 在当前组件中可以通过props拿到父组件传来的值
```
**如何用语言表达出他的场景？**<br />`render prop`是一个用于告知`内部组件`需要渲染什么内容的函数prop，由外部组件定义渲染结构，而内部组件提供具体的依赖数据。类似于`Vue`里的`作用域插槽`。

**解法2:**
```javascript
// App.tsx
<Menu MenuItem={MenuItem}></Menu>

// Menu.tsx
const Menu = (props)=>{
  const [count,setCount] = useState(0);
  const {MenuItem} = props;
  <MenuItem count={count} />
}

// MenuItem.tsx
// 在当前组件中可以通过props拿到父组件传来的值
```
其实`<MenuItem/>`这样写，在内部会执行这个组件，就是执行该函数。那么`props.children`其实拿到的是组件执行的返回结果`VNode/element/jsx对象`。<br />其实放在组件标签之间的内容，相当于将它原封不动的添加为 props.children属性。那么其实我可以随意的往这里嵌入内容。<br />而`{MenuItem}`这样实际上就是一个函数组件了，它相较于`<MenuItem>`是没有执行。

还可以利用`React.Children`这个顶层API来操作`props.children`。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650469049244-466b2500-9388-468f-ab67-1e6fc5484532.png)


<a name="bL8Xv"></a>
## 23. 为什么Vue不引入fiber？
Vue其实跟React16之前是一样的，它render - commit(patch)是一个同步的过程，同步操作DOM，**为什么Vue不存在React丢帧的性能问题？如果存在为什么引入fiber来解决这个问题？**

其实回答这个问题，要从vue和react响应式的原理来看：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650702508840-a0ed51ac-7cae-4368-8481-d8d274033195.png)<br />**Vue由于每个组件对应一个监视器，对依赖收集和派发更新，又得益于Vue的模版语法，可以实现静态编译，能准确的完成依赖收集。**这是react中动态的jsx不能做到的。<br />[https://juejin.cn/post/7077545184807878692](https://juejin.cn/post/7077545184807878692)


<a name="UNWL8"></a>
## 24.React为啥不实现Vue那套响应式？
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650703120671-7d071ced-dc0f-4db4-9788-2f00f38ab4e4.png)<br />在React中遵循`状态不可变思想`，每次setState并没有改变原来的状态，而是使用新的空间创建新的state，所以状态压根不会被修改，因此也完成不了状态的收集。

<a name="GjnRm"></a>
## 25. 为啥Vue的diff能够精确到具体组件级别？
**每个组件都有对应的渲染Watcher**，当状态修改时，会派发对应组件的`渲染Watcher`进行更新。<br />只要传递给子组件的props没有变化 且 没有子组件插槽，则父组件更新是不会触发子组件的更新。<br />props原理可知，子组件会对接收到的props进行观测，所以当props发生了变化(Vue内部做得)，则会触发子组件更新。<br />而当父组件中使用了子组件插槽传递内容，那么父组件更新时，会执行子组件的`forceUpdate`方法，触发子组件的更新。<br />[https://juejin.cn/post/6844904113432444942](https://juejin.cn/post/6844904113432444942)

<a name="jR2XY"></a>
## 26. react组件状态不可变如何理解？
react的核心设计理念就是**状态不可变**，组件是就UI和逻辑的单元，**组件视图是由状态驱动更新的**。<br />**react的理念是同样的状态，渲染出来的视图是一样的，这也就是纯函数的概念，做到状态和UI视图的统一。**

**状态不可变的好处：**<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650714145920-4df726e5-93a4-4bff-80f9-2be693a7827a.png)<br />总结下就是，状态可变可能会引起状态的流向不确定，使用不可变状态更加方便追踪数据的变化，使组件逻辑变得简单，同样的状态渲染出来的UI也是一样。

**而setState并不会对状态进修改，而是新建一个空间来存储新的状态，同时会触发组件自上而下递归更新。**


<a name="ojfUU"></a>
## 27. react fiber中断任务时，为啥能保存状态？
可以从`fiber双缓存`和fiber节点指针指向来讲。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650714482740-b2bae887-8bdc-4e0e-bbac-ebe70afdbb26.png)<br />fiber增加了节点指针，可以通过指针找到父节点和兄弟节点**，同时用循环代替了递归**，循环终止比递归更加高效方便。 <br />而fiber双缓存概念，一个React应用中存在两个fiber树，`currentFiber树` 和 `workInProgress Fiber树`，当任务重新执行时，会从对应的`currentFIber`中克隆出`Update对象`。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650714810818-bbf90248-f9d9-4aac-8f80-5c64485ad333.png)
<a name="F8XOg"></a>
## 28. requestIdleCallback 
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650716499419-c6ee5008-e456-41e6-ab3e-6856ea495363.png)<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650716573617-471d6918-f109-488d-81c2-661aae9ec125.png)<br />requestIdleCallback中的回调，会在浏览器空闲时被调用，在一帧当中剩余的时间再调用。

一帧包含了`用户的交互`、`js的执行`、以及`requestAnimationFrame的调用`，`布局计算`以及`页面的重绘`等工作。<br />假如某一帧里面要执行的任务不多，在不到16ms（1000/60)的时间内就完成了上述任务的话，那么这一帧就会有一定的空闲时间，这段时间就恰好可以用来执行requestIdleCallback的回调<br />[https://segmentfault.com/a/1190000014457824](https://segmentfault.com/a/1190000014457824)



<a name="ydr10"></a>
## 29. 帧的概念，react里与浏览器之前关系？
每秒**帧数**实际上就是指动画或视频每秒放映的画面数，帧就是`画面数`。每一帧都是静止的图象,快速连续地显示帧便形成了运动的假象。高的帧率可以得到更流畅、更逼真的动画。每秒钟帧数 (fps) 愈多,所显示的动作就会愈流畅。<br />通常我们屏幕的刷新率为`60hz`，1s刷新60次，1s可以有60帧，那么1帧可以理解为`16.6ms`，当前帧切换到下一帧的时间为`16.6ms`。



<a name="INKpC"></a>
## 30. vue的模版语法，实现静态编译，这个该怎么理解？
> 另一方面vue能实现依赖收集得益于它的模版语法，实现静态编译，这是使用更灵活的JSX语法的react做不到的。

这句话可以从Vue的`模版语法` 相较于 `jsx` 的优势来说，vue的模版语法在编译时会进行一些优化，如`静态提升`。

那么什么是静态提升呢？当 Vue 的编译器在编译过程中，**发现了一些不会变的节点或者属性，就会给这些节点打上标记。  **然后编译器在生成代码字符串的过程中(ast转为代码)，会发现这些静态的节点，并提升它们，将他们序列化成字符串，**以此减少编译及渲染成本。有时可以跳过一整棵树。**

在编译阶段，发现一些不会变动的节点和属性，将其提升的静态节点，保存为html字符串，不会被转为渲染函数。 所以在执行render函数时，不会生成VNode，VNode树的节点会变少，优化了diff比对。真是因为这样的优化，可以减少编译和每次渲染的成本。

**模版语法可以在编译器中做性能优化，实现静态编译，为静态内容做优化，加速编译及减少渲染成本，所以它在访问状态收集依赖方面会更加高效，而jsx却享受不到这个静态优化，所以模版语法比jsx更加高效，依赖收集也更加高效。**

<a name="f1uFt"></a>
## 31. redux
<a name="Iw3C0"></a>
### 出现背景：
Redux是一个用来**管理数据状态**的库。随着JavaScript单页应用开发日趋复杂，JavaScript需要管理比任何时候都要多的state（状态）， Redux就是降低管理难度的。（Redux支持React、Angular、jQuery甚至纯JavaScript）。<br />在 React 中，UI 以组件的形式来搭建，组件之间可以嵌套组合。**但 React 中组件间通信的数据流是单向的**，顶层组件可以通过 props 属性向下层组件传递数据，而下层组件不能向上层组件传递数据，兄弟组件之间同样不能。**这样简单的单向数据流支撑起了 React 中的数据可控性。**<br />组件嵌套过多时，组件可能需要一层层传递数据，多个组件通信起来较于麻烦，状态难以管控，所以`Redux`用来**管理全局的状态，集中管理数据，实现组件间数据共享。**<br />![redux原理图.png](https://cdn.nlark.com/yuque/0/2021/png/12388054/1622476571552-731d9a76-0bac-49c2-9d9a-d0076ae36b8f.png)
<a name="WF3O3"></a>
### 工作流程
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650864364252-f95922af-cdd7-4a6e-87b6-c869d6b618a7.png)<br />简单的来讲，redux就是一个管理状态的库，定义了许多概念，store用来存储数据、进行调度更新，dispatch用来触发一个更新状态的操作，action用来描述更新的动作，reducer用来真正执行状态的更新。 而又依据**发布订阅**模式，当状态更新后，可以通知具体的订阅者，来执行一些操作。在React中，需要在状态更新后触发组件重新render，获取新的状态。

<a name="yYJsc"></a>
### react-redux
![react-redux模型图.png](https://cdn.nlark.com/yuque/0/2021/png/12388054/1622476699744-cfb97142-8522-4faf-9549-7624d8f46261.png)

react-redux是基于redux进行封装的，状态管理的核心还是redux。react-redux只是为了更加适用于react，redux内部使用Context 传递store。然后使用HOC高阶组件 组合具体的UI组件，在HOC内部获取Context上的state，以及更新dispatch方法。 <br />那么在使用Connect这个高阶组件时，需要向HOC传入props的key，以及具体的action，就是函数的调用，参数传递。 最终将 store的state和dispatch方法通过props的形式传入到具体UI组件中，这样在UI组件中就不需要操作具体的redux的API。<br />并且react-redux内部会订阅redux的状态变化，然后内部帮我们执行 `foreupdate`，组件重新render。


<a name="fk2bt"></a>
## 32. Redux合并多个reducer
一个应用只允许有一个store，当状态复杂时，一个reducer会十分复杂臃肿，不利于后期开发维护。所以有必要将reducer拆分为多个子reducer，每个reducer进行独立的状态更新管理。<br />我们需要借助`combineReducers`来合并多个reducer，`combineReducers`就是一个函数，其实也可以理解为一个`reducer`，它组合多个`子reducer`，最终将所有reducer返回的state维护在一个对象中，放在store中进行管理。

**那么组合了多个reducer，当dispatch时，怎么确定执行对应的reduer呢？**<br />其实当store只有一个reducer时，而`action`这个结构，只表明操作state的行为，并不会定义操作哪个具体的reducer，sotre内部会遍历所有的reducer，由于reduer内部会有`swtich case`的逻辑，若当前`action`不能命中逻辑，则是不会更新state的。

那么多个reducer的情况也是如此，内部会遍历所有的reducer，reducer命中了action，才会更新状态。




<a name="SV9eD"></a>
## <br />
