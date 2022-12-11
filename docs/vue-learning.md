<meta name="referrer" content="no-referrer"/>
<a name="AN06i"></a>
<a name="MShI1"></a>
## 1.流程图
下图是Vue实例化的全过程：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649671505060-34d3da4f-5659-46cf-8e89-dbeaac2c4ffe.png)<br />data更新时，执行dep.notify，通知收集的Wathcer执行自身的update方法，update方法执行_render方法，重新生成虚拟DOM，然后执行vm._update，执行patch方法，属性差异更新，diff算法 优化更新dom，将dom渲染到页面。


<a name="bp93f"></a>
## 2.虚拟DOM
虚拟dom不是一个真实的dom，是对真实dom的描述对象，对象存放一些描述dom的关键信息，它的属性比原生dom少太多了。
```javascript
`<div id="aaa" style="color:red">hello{{a}}   <div> {{b}}</div></div>`
```
如上一个html字符串，最终转成的dom对象大致为如下：
```json
{
  tag: "div",
  data: {
    id: "aaa",
    style: {
      color: "red",
    },
  },
  children: [
    {
      children: undefined,
      data: undefined,
      key: undefined,
      tag: undefined,
      text: "hello111",
    },
    {
      tag: "div",
      data: {},
      children: [
        {	
          children: undefined,
          data: undefined,
          key: undefined,
          tag: undefined,
          text: "456",
        },
      ],
    },
  ],
}
```
其中有tag的是元素虚拟节点,对应html中的标签，tag是undefined的是文本虚拟节点，就是标签中的文本。children是子虚拟节点，对应DOM的嵌套结构，data是DOM上的属性集合。<br />嵌套在标签中的文本，会被转为标签VNode的子节点(children)。

<a name="TMxhh"></a>
## 3.compiler
compiler其实就是将调用`compileToFunctions`函数将template里的html字符串转为render函数，就是转为`createElement('xx',...)`这样的形式，后续执行crateElement可以生成虚拟DOM。

- 先将html字符串转为ast语法树，循环用正则匹配，标签、文本等来生成ast。
- 再将ast转为 形如` "_c('div',{id:"a",style:{"color":"red"}},_v("hello"+_s(a)))"`这样的代码。
- 构造函数，利用with改变作用域，可以让其内部直接通过 aa来访问属性，不需要this.aa，函数返回 上面转好的代码。
```javascript
  let ast = parse(template);
  // 生成类似于这样的  "_c('div',{id:"a",style:{"color":"red"}},_v("hello"+_s(a)))"
  let code = generate(ast);
  // 在template中使用 {{name}} ,会直接查找 this.name
  let renderFn = new Function(`with(this){return ${code}}`);
  return renderFn;
```

<a name="suXy5"></a>
## 4.响应式
响应式即当我们更新data后，视图会自动更新。 响应式的原理是 数据观测属性劫持+ 数组方法重写，使用了观察者模式，当触发了getter时会收集watcher依赖，当data更新时，会执行dep.notify 派发更新。

对于对象，我们使用defineProperty对 对象中的每个属性进行劫持，在setter收集依赖，getter派发更新。对于数组，由于数组项太多，我们不能同样使用defineProperty，性能太差，所以采用数组方法重写。

数据观测时，调用oberserve()方法，传入this.options.data，会判断是传入data是否为引用数据类型，若为引用数据类型，则创建一个Obeserve实例。
```javascript
export function observe(value) {
  // 如果传过来的是对象或者数组 进行属性劫持
  // 简单数据类型直接忽略,不需要劫持
  // 每个引用数据都有一个Oberserve实例
  if (
    Object.prototype.toString.call(value) === "[object Object]" ||
    Array.isArray(value)
  ) {
    return new Observer(value);
  }
}
```
在obeserve构造函数中会区分数组和对象，数组采用方法重写，改写数组的__proto__； 如果是对象则会遍历对象，为每个属性调用`defineReactive`方法，完成属性劫持。数组和对象的值若还是引用数据，则会递归创建Oberserve实例，完成观测操作。  每个Observe实例里都有dep属性，`defineReactive`方法中又为每个属性创建了dep实例。
```javascript
class Observer {
  // 观测值
  constructor(value) {
    // 给对象和数组都增加dep属性，主要是数组用,对象每个属性都有dep实例
    this.dep = new Dep(); 

    // 为复杂数据类型添加 `__ob__`属性,其值是当前Observer实例,代表已被响应式处理
    // value是当前Observer实例,在数组重写方法中可以拿到当前this,然后使用dep实例派发更新
    Object.defineProperty(value, "__ob__", {
      //  值指代的就是Observer的实例
      value: this,
      //  不可枚举
      enumerable: false,
      writable: true,
      configurable: true,
    });

    if (Array.isArray(value)) {
      // 这里对数组做了额外判断
      // 通过重写数组原型方法来对数组的七种方法进行拦截
      value.__proto__ = arrayMethods;
      // 对数组的每一项进行递归,存在数组项为对象、数组的情况,为对象的话走属性劫持
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }

  walk(data) {
    // 对象上的所有属性依次进行观测
    for (let key in data) {
      defineReactive(data, key, data[key]);
    }
  }

  // 递归观测数组，重写数组方法
  observeArray(items) {
    for (let i = 0; i < items.length; i++) {
      observe(items[i]);
    }
  }
}
```
**注意： 数组的依赖收集也是在**`defineReactive`中完成的。<br />因为options中，data只能是一个对象，而对象的属性可以是数组，故先走属性劫持，再递归对属性进行观测，这个属性值就可以是数组、简单数据类型、对象等，若是对象或数组就要递归进行观测，调用oberserve方法。

而在属性劫持时，会判断oberserve()方法返回值，若是引用数据会创建并返回Oberserver实例，简单数据是没有返回值的。 若返回值有值，调用返回的Oberserver实例的depend方法，收集依赖。<br />如下劫持了arr属性，通过obj.arr[0] 访问数组元素时，也会触发arr的getter，所以可以收集数组的依赖。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649674097845-5d0bc6c6-28c3-4b35-aa2c-95a1d314b00b.png)<br />若存在`{arr:[[0,12]]}`这样的数组嵌套数组，访问obj.arr[0][0]也会触发arr的getter，只要访问了arr就会触发。 因为每个引用数据都有一个Oberver实例，故我们只需要递归数组，然后给它的Oberver实例执行dep.depend方法 收集依赖即可。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649674829528-51ca805e-a294-459d-a311-26bedb11a958.png)
```javascript
// Object.defineProperty数据劫持核心
function defineReactive(data, key, value) {
  // 递归
  let childOb = observe(value); // childOb就是Observer实例

  // 每一个属性都有一个Dep实例
  let dep = new Dep(); // 为每个属性实例化一个Dep

  // 这里只是先观测着,劫持对象属性观测,后续render中的访问data属性时,getter触发时收集依赖
  Object.defineProperty(data, key, {
    // 真正触发getter是在_render，_render中执行用户传入的render函数或我们转化的render函数,这时会访问data属性,触发依赖收集
    get() {
      // 页面取值的时候 可以把watcher收集到dep里面--依赖收集
      // 只有Dep.target有值时才会收集依赖,在$mount时才会注册Watcher,Watcher首次时会将Dep.target赋值
      if (Dep.target) {
        // 如果有watcher dep就会保存watcher 同时watcher也会保存dep
        dep.depend();

        // 如果是简单数据类型，childOb会是undefined
        if (childOb) {
          // 这里表示 属性的值依然是一个对象 包含数组和对象 childOb指代的就是Observer实例对象  里面的dep进行依赖收集
          // 比如{a:[1,2,3]} 属性a对应的值是一个数组 观测数组的返回值就是对应数组的Observer实例对象
          childOb.dep.depend(); // 数组收集依赖,每个数组都有个dep 收集watcher,当调用重写方法时,执行notify
          if (Array.isArray(value)) {
            // 如果内部还是数组
            dependArray(value); // 不停的进行依赖收集
          }
        }
      }
      return value;
    },

    set(newValue) {
      if (newValue === value) return;
      // 如果赋值的新值也是一个对象  需要观测
      observe(newValue);
      value = newValue;

      dep.notify(); // 通知渲染watcher去更新--派发更新
    },
  });
}
```
数组重写方法，改写数组的`__proto__`，赋值的这个对象，它的`__proto__`指向Arrary.prototype, 故数组实例调用方法时，根据__proto__向上查找，优先使用重写的方法，若这个方法没有重写，则会使用Arrary.prototype的方法。 **数组重写方法，只为了能感知数组更新操作，好派发更新，相当于属性劫持里的setter。**
```javascript
// 先保留数组原型
const arrayProto = Array.prototype;
// 然后将arrayMethods继承自数组原型
// 这里是面向切片编程思想（AOP）--不破坏封装的前提下，动态的扩展功能

export const arrayMethods = Object.create(arrayProto);

let methodsToPatch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "reverse",
  "sort",
];

methodsToPatch.forEach((method) => {
  // 往arrayMethods上追加方法,对象的原型是Arrary.prototype
  // 重写数组方法仅仅为了能劫持数组操作,能感知数组的值更新了，然后可以派发更新。 数组实例如果调用的不是重写方法,则会往__proto__.__proto__上找，就是Arrary.prototype，原型链知识
  arrayMethods[method] = function (...args) {
    // 还是调用原有的方法,Arrary.prototype上的
    const result = arrayProto[method].apply(this, args);
    // 这句话是关键
    // 通过this.xx.methods,故这里的this就是数据本身
    //  比如数据是{a:[1,2,3]} 那么我们使用a.push(4)  this就是a  ob就是a.__ob__  代表的是该数据已经被响应式观察过了指向Observer实例
    const ob = this.__ob__;

    // 这里的标志就是代表数组有新增操作
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(2); // x.splice(0,1,2) 这里获取splice可能新增的元素
    }

    // 如果有新增的元素 inserted是一个数组 调用Observer实例的observeArray对数组新增的每一项进行观测
    // 如果新增的是对象,则属性劫持,如果新增的是数组则重写方法,如果简单数据类型忽略
    if (inserted) ob.observeArray(inserted); // 对新增的每一项进行观测
    // 派发更新    
    ob.dep.notify(); //数组派发更新 ob指的就是数组对应的Observer实例 我们在get的时候判断如果属性的值还是对象那么就在Observer实例的dep收集依赖 所以这里是一一对应的  可以直接更新
    return result;
  };
});

```

**注意**：先捋清楚一个概念，Vue中有Oberver、Dep、Wathcer构造函数，这些构造函数的作用是：<br />**Oberver**<br /> 在数据观测时，每个引用数据都会实例化一个Oberver，Oberver实例上都有`__ob__`属性，代表已经观测过了，它的value就是this，指向当前实例。Oberver内部会完成 对象属性劫持 + 数组重写。

**Dep**<br />经过Oberver观测过的数据，其中每个属性都有一个Dep实例，每个Oberver实例也有Dep实例，挂载在dep属性上了。当触发了getter，会先判断是否存在Dep.target，然后会调用dep.depend进行依赖收集，depend方法又会调用Dep.target.addDep方法，这个方法是Watcher实例的方法。

**Watcher**<br />观察者模式中的观察者，它在组件执行$mount时，会实例化Watcher，实例化传入_update方法，首次会执行get方法，将当前Watcher实例赋值给Dep.target。然后执行_update方法，完成组件渲染更新，之后将当前Watcher从Dep.target中移除，Dep中维护了`targetStack`这样一个栈结构，移除就是出栈操作。 <br />一个组件只会执行一次$mount方法，故只会有一个Wathcer。  接着上面，执行dep.depend时，会调用Watcher实例的addDep方法，方法内部会判断dep是否重复，然后将dep添加到自身的deps数组中，收集dep，不会重复收集dep。  然后再调用`dep.addSub(this)`，将自身实例作为参数，返回到Dep实例当中去，将Watcher的实例收集到自身的subs数组中去。  <br />**所以Dep和Wathcer是多对多的关系，并且是同步的，Dep收集Wathcer的同时，Wathcer也会收集Dep。** 在Watcher内对Dep进行了去重操作，所以在返回Dep实例时，就不需要再去重了，同步的关系。 

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649682443810-99994716-4ef8-4836-977a-b5c727b38571.png)

数据劫持是对现有属性进行劫持，新添加的属性，并没有劫持，所以无法触发响应式。 通过数组下标修改值，也是不会触发响应式的，因为数组通过重写方法来派发更新，修改数组下标的值，感知不到，无法派发更新。

<a name="Auk7z"></a>
## 5._render
vue中_render方法就是调用renderFn函数，定义`_c、_s、_v`方法，这些方法在可以生成虚拟DOM。 其实就是_c就是 createElement的内部实现。 最终返回一个虚拟DOM。

<a name="ZyZjF"></a>
## 6._update
_update做的事情很简单，就是传入VNode，然后内部调用patch方法，进行虚拟DOM的更新。**首次渲染和DOM更新都会调用这个方法。**

<a name="Qfo4l"></a>
## 7.patch
patch分为首次渲染和DOM更新，首次渲染就是将虚拟DOM转为真实DOM添加到$el这个元素里面。<br />而DOM更新是，会比对属性差异更新、比对节点(diff)算饭，高效更新DOM，而不是直接生成DOM替换老DOM。

<a name="NYBUr"></a>
## 8.异步批量更新机制
在更新data时，可能存在同时更新一个data多次，若没有异步批量更新机制的话，则这个data会多次通知其Wathcer更新，Watcher更新多次，影响页面性能。<br />异步批量更新是当属性setter，执行`dep.notify`派发更新时，`Wathcer`不会立即执行_update重新render，存在一个**scheduler事件调度机制**。 先调用shceduler中的`queueWatcher`方法，这个方法维护一个队列，将Wathcer添加至队列，这里会进行去重判断。 然后在调用 `nextTick` 方法，传入`nextTick`的回调遍历队列，执行每个watcher对应的更新方法，所以同时多次修改data，只会触发一次更新，从感官来说是批量更新，其实就是个去重更新。 这个队列就被称为**异步任务队列**。<br />`nextTick`方法可以将回调包装为异步任务。

<a name="Z7Xv5"></a>
## 9.nextTick原理
nextTick也维护一个队列，将所有调用它的回调加入队列，它会使用promise、mutationOberve、setImmediate、setTimeout，将回调包装为异步任务，优雅降级，优先包装为微任务。<br />执行nextTick时有一个类似节流机制，它维护了一个回调队列，将调用nextTick方法的回调添加到队列中，只有当队列清空了，才会执行再执行当前队列，间隔一段时间清空当前任务队列。<br />**在下一个的事件循环“tick”中，刷新队列并执行实际队列中的回调。**


<a name="x2io5"></a>
## 10.diff
diff算法是为了高效更新dom，避免每次render时都重新生成新的dom来完全替换老dom。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649510913284-aa45bacd-e38d-4a27-a56c-022008ac5d97.png)<br />在diff算法中，使用双指针来比对虚拟dom，分为如下四种情况：

- 新旧VNode从头开始比对，调用`isSameVnode`来判断两个节是否一样，然后再调用patch方法递归比对它们的子节点。比对成功，两个头指针后移，下一轮比对。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649512432070-17dfcb98-5fc4-42d2-9617-efc3dca2e29a.png)
```javascript
// 判断两个vnode的标签和key是否相同 如果相同 就可以认为是同一节点就地复用
function isSameVnode(oldVnode, newVnode) {
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key;
}
```

- 如下结构，在原结构前面追加一个节点，这样头指针从前往后遍历比对就不合理。这时候可以从尾节点开始比对，最终只在原DOM结构头部添加`E`这个DOM即可，只操作了一次DOM。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649512761741-a27290a9-6329-43b5-863e-6930a540510c.png)

- 也可能存在如下这种结构，新DOM结构将头节点变成了尾节点。这时需要头尾比较，即oldStart和newEnd比对，比对成功后，将原DOM树中的D这个节点插入到 oldEnd之后的位置，指针移动，oldStart后移，newEnd前移。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649513933057-85a29015-7618-4a43-991e-fea59b21c393.png)<br />D节点插入到尾指针之后的位置，指针移动，然后进行后面的比对，这时可以从头比对或从尾比对都可以。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649514229391-dea257b9-ddd6-410a-b620-cc24117f8b61.png)

- 如下同理，也存在老VNode的尾和新VNode的头比较。 oldEnd和newStart比对成功，将oldEnd的节点插入到oldStart指针的前面，就重新render的成本就只操作了A节点。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649514466634-3b11b0d5-2c2c-4c39-b853-27afe28b1fda.png)<br />将D节点插入到oldStart之前。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649514604780-b73be47d-1f41-41d8-84ef-0791005fb032.png)

对于不满足上述四种条件的节点列表，会暴力比对。但两个节点列表可能存在key相同的节点，可以借助map结构，优化暴力比对。 

1. 事先先遍历老节点列表，将它们的key和索引存在map中。 
2. 遍历新节点列表，拿到新节点的key在map中查找，看是否有可以复用的节点，存在的话，将这个节点插入到oldStart之前。 若不存在的话，就需要新建DOM节点插入到oldStart之前，最后将newStart指针后移。 暴力比对与上面四个case是同级的，当前节点比对完毕，又进入新的一轮比对，也可能满足上面四个case。



**关键点**：

- 暴力比对时，在将复用的DOM节点插入到oldStart后，同时也要将该节点位置为空，避免指针移动时再次访问到，不能删除，将这个虚拟节点从数组中删除的话，会影响到指针索引。
- 将节点插入到oldStart之前，并不是对这个节点(VNode)数组做的操作，而是对真实DOM操作的，使用的是insertBefore方法，将这个dom(已经存在的)插入到某个位置，这个操作类似于移动，插入后原位置的dom就不存在了，并不是复制一个dom插入过去。 appendChild同理。
- 如上这些节点在比对时，都是VNode，VNode上有el属性，它对应着真实DOM。对于新VNode此时它们的el是空的，el属性是在虚拟DOM转为真实DOM时添加的。 而老VNode的el是有值的，它们已经被转过真实DOM了。
- 最后在比对完毕后，老节点可能还会有剩余，需要将它们从DOM中删除。通过`oldStartIndex、oldEndIndex`可以得知是否还剩有节点。

**关键方法**<br />在插入DOM节点时，很多地方都用了`insertBefore`方法，这个方法有个优点，当第二个参数为null时，相当于`appenChild`，插入到父节点中的最后。<br />若
```javascript
el.insertBefore(createElm(newCh[i]), xx);

// 若oldEndVnode此时是最后一个节点，那么oldEndVnode.el.nextSibling就是null
 parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
```
如上就是diff全过程，它是patch方法的一部分，用来比对虚拟节点的，在patch中还需要比对属性差异更新，比对文本节点。


<a name="Dz9A7"></a>
## 11.为什么不推荐用index做key？
在patch中，虚拟dom转为dom替换老dom时，用到diff算法，diff会根据key来比较两个虚拟dom是否一致，若一致的话就可以直接复用这个dom，不需要再生成dom进行替换。<br />而用index做为key的话，因为index是不稳定的，随时可能发生变化。如删除中间的元素、或倒序插入元素(不是尾部插入)，都会导致key的错乱。<br />如`[A,B,C]`代表四个节点，现在从头插入一个节点D， 此时节点列表为`[D,A,B,C]`，A、B、C、D分别是它们的文本节点，就是标签中的文本。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649517755027-e4de45a6-2de7-49ff-b995-81027d910ce9.png)<br />这样D和A的key是一样的，是要复用A节点的，但是在递归比对它们子VNode时，发现它们的文本VNode不一样，所以要创建个文本节点 来替换A的子文本节点，B、C同理，总共操作了DOM 4次。<br />如果不用index做key，用一个独一无二的值，那么只需要操作DOM一次，对D节点新建DOM插入到DOM列表的前面。 <br />**这样用index做为key，遇到倒序插入和删除等一些破坏顺序的操作时，会增加操作DOM的次数，影响性能。**

而在一些带有input的节点时，如果用的index做key，而破坏节点顺序时，可能会遇到bug。输入框保存在状态，文本节点更新了，但是input的状态还是没变更。[https://juejin.cn/post/7026119446162997261](https://juejin.cn/post/7026119446162997261)

<a name="EEVys"></a>
## 12.组件原理
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649661243052-efe42c2e-ed9a-450b-86f9-ed7c19735529.png)<br />在完成组件嵌套中，最重要的是将options.components的属性使用 Vue.extend包装成构造函数。<br />如下componentA是一个对象，这时就需要使用Vue.extend(componentA)包装一下，其返回值是一个构造函数。
```javascript
let componentA = {
  data(){},
  ...
}

{
  data(){}
  
  components:{
    componentA,
  }
}
```
源码中的包装过程如下，在生成VNode时进行包装。
```javascript
// 获取组件选项
let Ctor = vm.$options.components[tag]; 

if (isObject(Ctor)) {
    // vm.$options._base指向Vue  
    Ctor = vm.$options._base.extend(Ctor);
  }
```

<a name="A9ObA"></a>
## 13.options
options是Vue实例化是传入的对象，在写Vue单文件组件时，export 出去的也是一个options对象。
```javascript
// 如下Vue中传入的对象就是options
new Vue({
  el: xx,
  data(){},
  ...
})
  
export default {
  data(){}
  ...
}  
```
在组件初始化时，会将全局options和自身的options进行合并，后续再讲。

<a name="BSVFK"></a>
## 14.全局API
全局API就是挂载在Vue上的API，如Vue.component、 Vue.filter、 Vue.direactive、Vue.minxin ，通过这些可以创建一个全局组件、过滤器等，在任何组件(Vue实例)都可以直接使用全局组件、全局过滤器等等。

我们使用Vue.mixin可以进行全局混入，将mixin中的options混入到每个组件中去。这些的实现都是基于组件初始化时会合并 Vue.options(全局optiosns)。

Vue构造函数会维护一个`Vue.options`属性，它与组件的options结构一摸一样。如我们使用mixin，会将传入的options通过`mergeOptions`合并到Vue.options中去。 <br />会将Vue.component的第二个参数(definition)  添加到到Vue.options.components中去。
```javascript
// global-api/index.js
export function initGlobalApi(Vue) {
  // 全局options，组件初始化时,将这个options合并到每个组件上,全局mixin、全局components、全局filter等会往上面放
  Vue.options = {};

  //_base指向Vue
  Vue.options._base = Vue;
  
  // 创建Vue.extend全局方法
  initExtend(Vue);
  
  Vue.mixin = function (options) {
    // 这里的this指向Vue构造函数
    this.options = mergeOptions(this.options, options);
    return this;
  };

  Vue.component = function (id, definition) {
    // this.options._base指向Vue,源码也是这样写的
    // 用Vue.extend将传来options(definition)包装,返回一个Vue子构造函数(VueComponent)
    definition = this.options._base.extend(definition);
  };
  this.options.components[id] = definition;
}
```
**在组件实例化时，会将 构造函数(Vue or VueComponent)的options和自身options进行合并**，这样就能混入全局mixin、直接使用全局组件等，上面的代码`Vue.options._base = Vue;`，故我们可以在所有组件中通过 `this.$options._base`拿到Vue构造函数。
```javascript
  Vue.prototype._init = function (options) {
    const vm = this;
    // vm.constructor = vm.__proto__.constructor = Vue
    // 这里的this不仅仅是Vue实例,也可能是Sub实例,Sub是Vue.extend()的返回值
    // 故这里vm.constructor.options 可能是 Vue.options 或 Sub.options
    vm.$options = mergeOptions(vm.constructor.options, options);
  };
```

<a name="APZUs"></a>
## 15.Vue.extend原理
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649664427853-5e06f401-2cac-43b2-bfdc-ad6391ad4af9.png)<br />Vue.extend() 返回的是一个构造函数，这个构造函数是Vue的子构造函数，通过原型继承继承Vue。<br />Vue.component()创建的全局组件，在内部会将使用Vue.extend包装为构造函数，组件options.components里的对象也会在生成组件VNode时也会使用Vue.extend包装为构造函数。<br />正是因为这个构造函数继承了Vue，所以可以直接使用_init、$mount等方法。
```javascript
export default function initExtend(Vue) {
  //组件的唯一标识
  let cid = 0; 

  // 创建子类继承Vue父类 便于属性扩展
  Vue.extend = function (extendOptions) {
    // 创建子类的构造函数 并且调用初始化方法
    const Sub = function VueComponent(options) {
      // 这里的this指向Sub实例
      // _init是Vue.prototype上的方法, this.__proto__ = Sub.prototype  this.__proto__.__proto__ = Vue.Prototype
      this._init(options); //调用Vue初始化方法
    };

    Sub.cid = cid++;
    // 这里的this指向Vue,通过Vue.extend调用的方法,this.prototype = Vue.prototype
    Sub.prototype = Object.create(this.prototype); // 子类原型指向父类,原型继承
    //constructor指回自己
    Sub.prototype.constructor = Sub;
    // this.options就是Vue.options,全局(Vue.)options和传入options合并
    Sub.options = mergeOptions(this.options, extendOptions);

    return Sub;
  };
}
```
那么VueCOmponent这个构造函数是继承Vue，为啥不直接用Vue？<br />使用Vue.extend() 可以进行options扩展，将Vue.extend传入的options和 实例化时传入的options进行合并。
```javascript
const Ctor = Vue.extend({created(){console.log(1)}});

const Com1 = new Ctor({created(){console.log(2)}});

// 打印 1 2
```
上述过程一共经历了这些合并操作：
```javascript
// 1. Vue.extend内部将 Vue.options 和 传入的opiotns合并
Sub.options = mergeOptions(this.options, extendOptions);

// 2. new Cotr时,会执行_init初始化方法
// 此时vm.constructor指向Sub,options是实例化传入的options
// 将Sub.opitons 和 自身opiotns合并
vm.$options = mergeOptions(vm.constructor.options, options);

```

<a name="ZfMfY"></a>
## 16.mergeOptions策略
在使用全局minxin、Vue.extend、组件初始化时，都会合并options，就是通过`mergeOptions`这个方法实现的。

mergeOptions合并分策略的，如果是生命周期且同名，就将两个options的**生命周期合并为一个数组**，**构造函数.opitons的生命周期在前面**， 故mixin时，同名混入的生命周期先执行。
```javascript
export const LIFECYCLE_HOOKS = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestroy",
  "destroyed",
];

function mergeHook(parentVal, childVal) {
  // 如果有儿子
  if (childVal) {
    if (parentVal) {
      // 构造函数.optiosn在前面
      return parentVal.concat(childVal);
    } else {
      // 包装成一个数组
      // 只有儿子
      return [childVal];
    }
  } else {
    // 这个已经是数组了,第一次进来包装成Arrary了
    return parentVal;
  }
}

// 为生命周期添加合并策略
LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeHook;
});

// 合并策略
const strats = {};

export function mergeOptions(parent, child) {
  const options = {};
  // 遍历父亲,这里的父亲就是 构造函数.options
  for (let k in parent) {
    mergeFiled(k);
  }
  
  // 父亲没有 儿子有
  for (let k in child) {
    if (!parent.hasOwnProperty(k)) {
      mergeFiled(k);
    }
  }

  function mergeFiled(k) {
    if (strats[k]) {
      // 特有合并策略,生命周期、组件
      options[k] = strats[k](parent[k], child[k]);
    } else {
      // 默认策略
      // 优先取当前组件的
      options[k] = child[k] ? child[k] : parent[k];
    }
  }
  return options;
}
```
组件的合并策略又不一样，它是通过继承完成的。将构造函数的.options.components作为当前options.components的__proto__。<br />组件同名的话，先查找自身的,自身查找不到向上查找，故我们使用全局组件时，即使不用将其引入到当前options的components上，也可以直接使用，通过原型链查找的。<br />在生成组件VNode时，会查找components对象里的属性。
```javascript
strats.components = function (parentVal, childVal) {
  let res = Object.create(parentVal || {});

  if (childVal) {
    for (let key in childVal) {
      res[key] = childVal[key];
    }
  }
  return res;
};
```
<a name="LD1YL"></a>
<a name="SqXwd"></a>
## 17.生命周期
生命周期就是Vue从创建到销毁全过程，会伴随着一些hook的调用，我们可以在这些钩子里做一些事情。这与webpack的hook一样，plugin就利用hook扩充webpack的功能。<br />生命周期函数是放在opiotns中的，我们可以在Vue执行到一定的地方时，调用这些钩子函数。
```javascript
// hook会被mergeOptions中会被包装为数组
export function callHook(vm, hook) {
  // 依次执行生命周期对应的方法
  const handlers = vm.$options[hook];
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      //生命周期里面的this指向当前实例
      handlers[i].call(vm); 
    }
  }
}
```
我们知道Vue实例化的过程， _init( [props初始化、methods配置、数据初始化、观测、 )  = > $mount => _update => patch ， 生命周期钩子就在这些阶段中被触发。

<a name="AsfGN"></a>
## 18.父子组件生命周期顺序
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649666476848-9f796451-6bb6-4570-bebc-cfae3ba13bbf.png)<br />根据组件原理可知，根据组件原理可知，当父组件在patch时，会实例化子组件，那么此时父组件的生命周期执行了有 beforeCreated -> created -> beforeMount  。<br />在patch阶段实例化子组件，那么子组件会执行  beforeCreated -> created -> beforeMount  -> mounted ， 当子组件渲染完毕后，父组件patch阶段走完，渲染完毕，执行mounted钩子。

这里的update的生命周期是有问题的，具体要分场景：

- 若子组件使用了父组件的props，或子组件使用`$emit`通知父组件修改data。

父beforeUpdate -> 子beforeUpdate -> 子updated  -> 父updated

- 若父子组件没有数据流向，则它们update生命周期是独立的，子组件更新，只触发它的钩子，父组件也是。

<a name="ycBKZ"></a>
## 19.Watcher
Watcher是Vue中的一个构造函数，用来**创建一个观察者对象的，对某个数据观察，当数据发生变化，会派发更新，执行wathcer里的响应方法。**<br />一个组件只有一个渲染watcher，多个侦听watcher，多个计算属性watcher，它们都是Watcher的实例对象。都观察某些属性，当属性变化时执行相应的 操作。

看下Watcher的基础结构：
```javascript
// 全局变量id  每次new Watcher都会自增
let id = 0;
export default class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn; 
    this.cb = cb; 
    this.options = options;
    this.id = id++; // watcher的唯一标识
    this.deps = []; //存放dep的容器
    this.depsId = new Set(); //用来去重dep
    
    // 如果表达式是一个函数
    if (typeof exprOrFn === "function") {
      this.getter = exprOrFn;
    } 

    this.get();
  }

  get() {
    pushTarget(this); 
    this.getter.call(this.vm); 
    popTarget();
  }

  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      // 为了避免dep重复
      this.depsId.add(id);
      this.deps.push(dep);
      // 直接调用dep的addSub方法  把自己--watcher实例添加到dep的subs容器里面
      dep.addSub(this);
    }
  }

  update() {
      // 每次watcher进行更新的时候  是否可以让他们先缓存起来  之后再一起调用
      // 异步队列机制,同一watcher只会推入一次,根据watcher.id来区别
      queueWatcher(this);
  }

  run() {
        this.cb.call(this.vm, newVal, oldVal);
    }
}

```
**Watcher的核心就是get方法**，渲染Watcher在初始化时会调用`get`方法，当观察的属性发生变化时，dep会遍历它收集的watcher派发更新，中间会有异步队列机制，最终会执行`get`方法。<br />get方法里的getter就是**响应操作**，所以观察的属性发生变化，会执行watcher对应的响应方法。

注意get方法中执行getter前会执行`pushTarget`方法，该方法的作用是，给Dep.target赋值为当前Watcher实例。
```javascript
Dep.target = null;

// 栈结构用来存watcher
const targetStack = [];

// 可能存在多个Watcher,一个组件一个渲染watcher,多个用户自定义watcher,故通过栈结构来维护
export function pushTarget(watcher) {
  targetStack.push(watcher);
  Dep.target = watcher; // Dep.target指向当前watcher
}
```
在属性劫持的getter中，如果要收集watcher依赖，会先判断Dep.target是否有值，**有了对应watcher实例才会收集依赖，而不是只要该属性被访问就收集依赖**。

在看`popTarget`方法，当前实例的响应操作执行完毕了，要干掉Dep.target的值，否则后续收集依赖就有问题了。<br />至于为啥要用栈来存watcher，用出栈 替代 `Dep.target = null` ，后面再说。
```javascript
export function popTarget() {
  targetStack.pop(); 
  Dep.target = targetStack[targetStack.length - 1];
}
```

看看渲染watcher传入的getter函数，渲染watcher在$mount方法中创建，一个组件只会初始化执行$mount方法，故一个组件只有一个渲染watcher。<br />执行`vm._render()`，会生成虚拟DOM，在这过程中会访问data属性，触发属性的getter，会收集依赖。<br />`_update`方法是将VNode转为DOM，完成页面初次渲染或更新。<br />`updateComponent`方法传入了Watcher实例，将它赋值给`this.getter`，初始化时调用`get`方法，完成依赖的收集，页面的渲染。<br />正因为这个方法访问了属性，促使属性收集了依赖，所以这个方法名为`this.getter`，**故这个方法既有属性访问收集，又有响应更新的操作。**<br />后续属性更新时，执行`dep.notify`方法派发更新，执行watcher里的`get`方法，此时`getter`方法中依然有属性访问的操作，但是在收集依赖时会去重，所以不会重复的收集依赖。 所以执行getter方法完成页面的更新。
```javascript
 let updateComponent = () => {
    vm._update(vm._render());
  };

 new Watcher(vm, updateComponent, null, true);
```



<a name="bq7s3"></a>
## 20.watch侦听器原理
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649745594154-d36ed53c-1736-48c0-b948-7b89c2d4d00c.png)<br />在初始化状态时，拿到options中的watch选项进行watch的初始化操作。
```javascript
// 初始化watch
export default function initWatch(vm) {
  let watch = vm.$options.watch;
  // 为每个watch 实例化Watcher
  for (let k in watch) {
    const handler = watch[k]; //用户自定义watch的写法可能是数组 对象 函数 字符串
    if (Array.isArray(handler)) {
      // 如果是数组就遍历进行创建
      handler.forEach((handle) => {
        createWatcher(vm, k, handle);
      });
    } else {
      createWatcher(vm, k, handler);
    }
  }
}

// 创建watcher的核心,为watch选项中每一个属性都创建一个Watcher
// exprOrFn: 表达式 or funciotn
function createWatcher(vm, exprOrFn, handler, options = {}) {
  if (typeof handler === "object") {
    options = handler; //保存用户传入的对象
    handler = handler.handler; //这个代表真正用户传入的函数
  }
  
  if (typeof handler === "string") {
    //   代表传入的是定义好的methods方法,从this上拿method
    handler = vm[handler];
  }

  // 调用vm.$watch创建侦听Wathcer
  return vm.$watch(exprOrFn, handler, options);
}

```
挂载$watch方法
```javascript
Vue.prototype.$watch = function (exprOrFn, cb, options) {
    const vm = this;
    //  user: true 这里表示是一个侦听Watcher
    new Watcher(vm, exprOrFn, cb, { ...options, user: true });

    // 如果有immediate属性,代表需要立即执行回调,上来先执行一次
    if (options.immediate) {
      cb();
    }
  };
```
原先Watcher只有一个渲染Watcher，但现在有了侦听Watcher，所以需要对Watcher构造函数改造，非本次新增内容省略。
```javascript
export default class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    ...

    /** 监听器watch特有 */
    // 标识是用户自定义watcher,是一个侦听watcher
    this.user = options.user;
    
    // 侦听器的exprOrFn是一个表达式
    if (typeof exprOrFn === "function") {
      this.getter = exprOrFn;
    } else {
      // 侦听wathcer
      this.getter = function () {
        //用户watcher传过来的可能是一个字符串   类似a.a.a.a.b
        let path = exprOrFn.split(".");
        let obj = vm;
        // 通过循环访问拿到表达式对应最终对应的属性值
        // 这里访问了data属性, 会触发getter,将当前Watcher收集
        for (let i = 0; i < path.length; i++) {
          obj = obj[path[i]]; //vm.a.a.a.a.b
        }
        return obj;
      };
    }

    // 实例化就会默认调用get方法,依赖收集
    this.value = this.get();
  }

  get() {
    pushTarget(this);
    const res = this.getter.call(this.vm); 
    popTarget();
    return res;
  }
 
  run() {
    // 重新获取值
    const newVal = this.get(); 
    // 上一次的值
    const oldVal = this.value; 
    // 现在的新值将成为下一次变化的老值
    this.value = newVal; 
    
    // 如果是用户自定义wathcer
    if (this.user) {
      // 如果两次的值不相同  或者值是引用类型 因为引用类型新老值是相等的 他们是指向同一引用地址
      if (newVal !== oldVal || isObject(newVal)) {
        // 执行watch的回调函数
        this.cb.call(this.vm, newVal, oldVal);
      }
    } else {
      // 渲染watcher
      this.get();
    }
  }
}

```
**总结**

- watch侦听器，内部会先遍历watch选项，每个属性都执行`createWatcher`方法，方法内部处理watch，兼容watch的写法，然后为每个属性都调用`vm.$watch`方法。
- `vm.$watch`创建Watcher实例，如果有options选项，可以在这里进行处理，如immediate。
- Watcher内部初始化，将传来的表达式(如a.b.c)，包装成getter方法，内部循环访问这个属性，访问属性会触发属性的getter，这时会收集当前watcher为依赖。
- Watcher在初始化时，会执行get方法，让get方法返回getter的返回值，而getter的返回值就是表达式的值，从this上访问这个表达式的值。 
- 当侦听的data发生变化时，会通知它收集的watcher更新，最终会执行`run`方法，在run中通过`this.value`拿到更新前的值，然后调用`this.get`拿到更新后的值，最后再将更新后的值赋值给`this.value`，这样在下一次照样通过`this.value`拿到更新前的值。 最后在调用`this.cb`，触发watch 的回调函数。


<a name="S7jYD"></a>
## 21.计算属性computed原理
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649749392334-8a758012-9831-45ea-baa7-30bfa8686943.png)<br />computed当依赖的数据发生变化时，会重新计算，那么computed一定也是一个观察者，需要创建Watcher实例。我们要解决以下这些事情：

1. computed收集依赖。
2. 缓存，只有当依赖的属性发生变化时，才重新计算。
3. 若template中用到了computed，而当computed重新计算了，需要更新页面。
4. 需要感知有地方使用了computed，若都没使用computed，computed内部计算逻辑不会执行。

初始化computed，为computed选项中每个属性都创建Watcher实例。同时劫持计算属性，与响应式属性劫持作用一样。<br />通过劫持了计算属性，这样我们可以感知到谁访问了当前计算属性，来决定做些什么。属性劫持时，要重写计算属性的getter方法，不能使用传入的getter。<br />这个getter方法实现了缓存 和 页面更新，后面再研究这个getter方法。
```javascript
import Watcher from "../observe/watcher";
import Dep from "../observe/dep";

export default function initComputed(vm) {
  const computed = vm.$options.computed;

  // 用来存放计算watcher
  const watchers = (vm._computedWatchers = {}); 

  for (let k in computed) {
    // 获取用户定义的计算属性
    const userDef = computed[k]; 

    // 计算属性的值可以是函数 或 对象,对象要写 getter,setter可选,当计算属性被赋值时,可以在setter中更新data
    const getter = typeof userDef === "function" ? userDef : userDef.get; 

    // 创建计算watcher，lazy设置为true，lazy是一个标志
    // getter是computed的getter函数,后续可以通过vm._computedWatchers[key]拿对应的watcher实例
    // new Watcher去收集依赖
    watchers[k] = new Watcher(vm, getter, () => {}, { lazy: true });

    // 对computed的getter和setter劫持,同时也将computed的key 添加到this上了,故可以通过this.xx来访问computed属性
    defineComputed(vm, k, userDef);
  }
}

// 重新定义计算属性  对get和set劫持
function defineComputed(target, key, userDef) {
  // definition模版
  const sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: () => {},
    set: () => {},
  };

  if (typeof userDef === "function") {
    // 如果是一个函数，需要手动赋值到get上,只有getter
    sharedPropertyDefinition.get = createComputedGetter(key);
  } else {
    sharedPropertyDefinition.get = createComputedGetter(key);
    sharedPropertyDefinition.set = userDef.set;
  }
  // 利用Object.defineProperty来对计算属性的get和set进行劫持
  Object.defineProperty(target, key, sharedPropertyDefinition);
}

// 重写计算属性的get方法 来判断是否需要进行重新计算
function createComputedGetter(key) {
  return function () {
    const watcher = this._computedWatchers[key]; //获取对应的计算属性对应Watcher实例
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate(); //计算属性取值的时候 如果是脏的  需要重新求值
      }

      // 上述watcher.get()执行完毕,此时Dep.target应该是渲染watcher
      if (Dep.target) {
        // 如果Dep还存在target 这个时候一般为渲染watcher 计算属性依赖的数据也需要收集
        watcher.depend();
      }
      return watcher.value;
    }
  };
}

```
改造Watcher，新增`lazy`，代表当前watcher是一个计算属性watcher，新增`dirty`，表示是否需要重新计算，即依赖的data是否发生改变。<br />`getter`方法是computed的函数体，如果函数体内有`this.xx`对data属性访问的代码，那么在执行getter方法时会收集依赖。<br />计算属性watcher与渲染、侦听watcher不一样，它初始化时不执行`get`方法。 

改写`update`方法，在之前的渲染、侦听watcher，当观察的属性更新时，会通知对应的watcher执行update方法，来触发响应data更新的操作。 在计算属性watcher的`update`方法中，并不会将当前watcher推入异步执行队列，而只是将`dirty`置为false，代表依赖的data发生变化了。

新增了`evaluate`方法，这个方法其实跟`run`方法类似，专门提供给计算属性用的，内部执行`get`方法。
```javascript
export default class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    /** computed特有 */
    // 标识计算属性watcher
    this.lazy = options.lazy;
    //dirty可变  表示计算watcher是否需要重新计算 默认值是true,实现缓存
    this.dirty = this.lazy; 

    // 如果表达式是一个函数
    if (typeof exprOrFn === "function") {
      this.getter = exprOrFn;
    }
    
    // 计算属性实例化的时候不要去调用get
    this.value = this.lazy ? undefined : this.get();
  }

  get() {
    pushTarget(this); 
    // 计算属性在这里执行用户定义的get函数,访问计算属性的依赖项,从而把自身计算Watcher添加到依赖项dep里面收集起来
    const res = this.getter.call(this.vm);
    popTarget();
    return res;
  }

  update() {
    // 计算属性依赖的值发生变化 只需要把dirty置为true,下次访问到了 重新计算
    if (this.lazy) {
      this.dirty = true;
    } else {
      // 每次watcher进行更新的时候  是否可以让他们先缓存起来  之后再一起调用
      // 异步队列机制,同一watcher只会推入一次,根据watcher.id来区别
      queueWatcher(this);
    }
  }

  // 计算属性进行计算,并且计算完成把dirty置为false
  evaluate() {
    this.value = this.get();
    this.dirty = false;
  }

  depend() {
    // 计算属性的watcher存储了依赖项的dep
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend(); //调用依赖项的dep去收集渲染watcher
    }
  }

  run() {
    this.get();
  }
}

```
上述已经定义好了watcher，但是它没有执行`get`方法，`get`方法是Watcher的核心。那么计算属性什么时候执行get方法呢？<br />之前劫持了每个计算属性，重写了getter方法。 那么当template中使用了这个计算属性，在执行render方法时，会访问这个计算属性，触发了其getter方法。<br />现在回到这个之前定义的getter劫持中去，当getter被触发了，先取当前计算属性的Watcher实例，之前创建的。<br />判断`watcher.dirty`，判断依赖的data是否更新，首次`dirty`为true，这是会执行`evaluate`方法，执行其内部的`get`方法，访问依赖的属性，让依赖的属性收集当前watcher实例。 <br />并返回`watcher.value`，这样render时，模版中就可以拿到计算属性的值了。
```javascript
....
get () {
    //获取对应的计算属性对应Watcher实例
    const watcher = this._computedWatchers[key]; 
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate(); //计算属性取值的时候 如果是脏的  需要重新求值
      }

      // 上述watcher.get()执行完毕,此时Dep.target应该是渲染watcher
      if (Dep.target) {
        // 如果Dep还存在target 这个时候一般为渲染watcher 计算属性依赖的数据也需要收集
        watcher.depend();
      }
      return watcher.value;
    }

```
而后续依赖的data更新时，只是将`dirty`置为了true，并没有重新计算computed，那么这样就有问题了。

再回到上面的代码，在执行完`watcher.evaluate()`时，接着会执行`watcher.depend()`，那么`depend`方法有何作用？<br />在depend方法中，遍历当前watcher收集的deps依赖项，watcher和dep是同步的，dep收集了watcher，watcher同时也会收集dep。  
```javascript
  depend() {
    // 计算属性的watcher存储了依赖项的dep
    let i = this.deps.length;
    while (i--) {
      this.deps[i].depend(); //调用依赖项的dep去收集渲染watcher
    }
  }
```
遍历所有的dep执行`dep.dend()`方法，让dep收集依赖，那么收集的是哪个watcher呢？看看`dep.denpend()`方法。 `dep.depend()`方法其实就是收集`Dep.target`这个Wacther，并让这个Watcher收集自身Dep实例。
```javascript
// Dep
depend() {
    if (Dep.target) {
      Dep.target.addDep(this); 
    }
  }


// Watcher
addDep(dep) {
  let id = dep.id;
  if (!this.depsId.has(id)) {
    // 为了避免dep重复
    this.depsId.add(id);
    this.deps.push(dep);
    // 直接调用dep的addSub方法  把自己--watcher实例添加到dep的subs容器里面
    dep.addSub(this);
  }
}

```
那么这个Dep.target指的是哪个Watcher实例呢？  回到计算属性的get方法，我们知道上一步执行了render，访问了计算属性，所以会触发计算属性的getter，在getter中执行了`watch.evaluate`方法，`evaluate`本质就是调用了`watch.getter`方法，当`watch.getter`执行中，`Dep.target`就是当前的计算Watcher，当`watch.getter`执行完毕，Watcher的`targetStack`会出栈，那么此时的Dep.target就是渲染Watcher。
```javascript
const targetStack = [];
// 可能存在多个Watcher,一个组件一个渲染watcher,多个用户自定义watcher,故通过栈结构来维护
export function pushTarget(watcher) {
  targetStack.push(watcher);
  Dep.target = watcher; // Dep.target指向当前watcher
}
export function popTarget() {
  targetStack.pop(); // 当前watcher出栈 拿到上一个watcher
  Dep.target = targetStack[targetStack.length - 1];
}

```
故depend收集的是渲染Watcher，即computed依赖的数据收集了渲染Watcher。 那么当`computed`依赖的data属性发生变化后，它会通知** 计算属性Watcher**更新， 将dirty置为true。 也会通知 **渲染Watcher** 执行get方法，执行render、_update方法更新页面。  <br />在执行render时，又会访问计算属性，此时进入了计算属性的getter，然后重新进行计算，所以此时便可以拿到计算后的值，然后更新页面，所以页面上就能呈现 重新计算后的计算属性。



**注意：**若存在多个计算属性，那么当计算属性Watcher的get方法执行完毕，Dep.target还是渲染Watcher。 因为js是单线程，执行完一个计算属性，才会执行下一个计算属性，所以每次计算属性watcher的get执行完，此时Dep.target一定是渲染Watcher。

**总结**

- 我们要劫持计算属性，这样才能感知到计算属性被访问了。若计算属性没被访问，则不会执行内部的计算逻辑。
- 计算属性Watcher初始化时，并不会执行get方法，其次当计算属性依赖的data更新时，也不会直接执行get方法，而是将dirty置为false，代表依赖的data发生变化了，需要重新计算。**它的get方法执行是计算属性自己控制的，只有当计算属性被访问时，走进了劫持的getter，才会执行watch.get方法。**
- **计算属性依赖的data会收集至少两个watcher，一个是当前计算属性watcher，一个是渲染watcher。**需要借助渲染watcher才会重新计算computed，才会使页面更新。
- 计算属性的缓存是通过dirty标志完成的，只有当依赖的data更新了，dirty才会被置为true，代表需要重新计算。 所以当页面更新时，若依赖的data未更新，render函数访问了计算属性，此时dirty为false，故不会执行`watcher.evaluate`，不会重新进行计算。



<a name="iOQE6"></a>
## 22.$set、$delete原理
根据响应式可知，对象追加属性、根据下标修改数组，不会触发页面更新。 因为数组是方法重写来感知数组被修改，对象是通过对现有属性进行劫持，所以修改后，不会派发更新。<br />$set内部其实很简单，如果是数组的话，调用splice重写方法，肯定会触发更新。 而要是对象的话，则在调用`defineReactive`方法，对新增属性进行劫持，然后手动触发`dep.notify`派发更新。

dep是通过`__ob__`拿到的，`__ob__`的值是该数据的Obeserver实例，在Oberserve初始化时，会为每个对象、数组都添加`__ob__`属性，__ob__指向Observer实例，而每个Oberver实例都有dep属性，故可以通过`__ob__.dep.notify()`来派发更新。

$delete 数组的话还是调用splice，对象的话直接删除属性，然后手动触发`dep.notify`派发更新。



<a name="ggofP"></a>
## 23.defineProperty详解
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649757585503-e4123796-c18c-46b4-9962-37a3bf4cd22c.png)<br />我们知道数组是通过重写方法来完成数据观测的，为什么不使用definproperty呢？

1. 数组一般有很多元素，defineProperty是对每个属性进行配置，它的性能会很差。
2. 若使用defineProperty来配置数组时，当我们使用push或unshift方法时，它是无法感知我们修改了数组。跟对象追加属性一样，push、unshifit增加了索引(key)，所以无法感知并派发更新。 所以还是得重写数组方法。

<a name="RwZWw"></a>
## 24.vue2和vue3响应式
Vue3 改用 Proxy 替代 Object.defineProperty。因为 Proxy 可以直接监听对象和数组的变化，并且有多达 13 种拦截方法。

**差异**

- vue2使用definproperty和数组方法重写来实现数据观测。
- vue3使用proxy来对数组和对象进行劫持。

**vue2使用defineProperty的痛点**

- 只是对**对象的属性进行劫持**，要**遍历对象**为每个属性使用defineProperty。
- 在遇到一个对象的属性还是一个对象的情况下，**需要递归劫持。**
- 无法感知对象新增属性、删除属性，不会派发更新
- 数组不能使用defineProperty，比较异类。

**为什么definproperty需要递归劫持？**<br />在defineProperty的get中，只能返回一个已取值的value，不可以写成如下，这样会造成死循环。
```javascript
const o = { a: 1 };

Object.defineProperty(o, "a", {
  get() {
    // 访问o['a']又触发get,死循环
    return o["a"];
  },
});

console.log(o.a);

```
正由于这样的原因，如下当访问`o.a.b`返回的还是`o.a`的值，**在get中无法动态取值**，所以必须得递归劫持，否则访问不到正确的值。
```javascript
const o = { a: { b: 1 } };

const value = o.a;
Object.defineProperty(o, "a", {
  get() {
    return value;
  },
});

console.log(o.a);   // 1
console.log(o.a.b); // 1
```

**而proxy的出现正是为了解决上面的问题：**<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649766825750-cd3b660c-0525-4a1a-a6f5-09b750ca61ce.png)<br />**Proxy支持13种拦截操作，比definProperty的功能强大得多。**

proxy作用的是对象(引用数据)，而不是对象的属性，代理的是整个对象，所以当对象的属性仍是对象时，不需要递归，因为在proxy的get 中可以动态取值。
```javascript
const o = { a: { b: 1 } };

const proxyO = new Proxy(o, {
  get(target, property) {
    return target[property];
  },
});

console.log(proxyO.a);   // {b:1}
console.log(proxyO.a.b); // 1

```
proxy可以感知到数组的push、unshift方法：
```javascript
const arr = [1];

const proxyO = new Proxy(arr, {
  set(target, property, value) {
    console.log("get!!!");
    target[property] = value;
    return true;
  },
});

proxyO.push(111);
console.log(arr); // [1,111]

// 会输出 两个 `get!!!`
```
当数组pus、unshift时，会触发两次`set`，原因是push修改了`arr`的内容，又修改了`arr`的length。

**proxy存在的问题：**<br />proxy最大的问题就是兼容性不好，无法 polyfill 存在浏览器兼容问题，不支持IE浏览器。

[链接](https://juejin.cn/post/7069397770766909476) [链接](https://zhuanlan.zhihu.com/p/60126477) [链接](https://www.jianshu.com/p/8cde476238f0)


<a name="wW6CM"></a>
## 25.props原理
若props的值是父组件的data，子组件在模版中使用了props，则子组件在render时会拿到访问该prop，在父组件中的属性劫持中，会收集子组件的渲染Watcher，故父组件的data更新时，会派发更新，子组件会重新render。

<a name="FDiBm"></a>
## 26.directive原理
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1649775857114-831fc33f-36b8-46d5-8fe7-5e2fbabf393b.png)

<a name="mYLeT"></a>
## 27.vue同时写了render函数和template会怎么样？
vue在compiler阶段，会将template转译为 render函数。 而如果已经有了render函数，则不会进行转译，而是直接执行render函数。<br />**所以同时写了render和template，最终只有render起作用，而template会被忽略。**

<a name="wloOa"></a>
## 28.Vue的渐进式如何理解
从设计理念上来讲，**Vue主张少，不强势**。可以在核心功能的基础上任意选用其他的部件，不一定要全部整合在一起。可以看到，所说的“渐进式”，其实就是Vue的使用方式，同时也体现了Vue的设计的理念，总而言之，你可以有很多选择，并不是非常强制你一定要用那种方式**，vue只是为我们提供了视图层，至于底层的实现，还是有非常多的选择的。**

它不可能不像react，**react也有一定程度的主张**，它的主张主要是**函数式编程**的理念，比如说，你需要知道什么是副作用，什么是纯函数，如何隔离副作用。

**总结:**<br />可能有些方面是不如React，不如Angular，但它是**渐进的**，**没有强主张**。你可以在原有大系统的上面，把一两个组件改用它实现；也可以整个用它全家桶开发；还可以用它的视图，搭配你自己设计的整个下层用。**它只是个轻量视图而已**，只做了自己该做的事，没有做不该做的事，仅此而已。没有多做职责之外的事，只做了自己该做的事。


<a name="ecUVZ"></a>
## 29.Vue中props原理
<a name="aoVBi"></a>
 ![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650705085060-d759af71-2dd7-45ca-b187-689dab6a554d.png)
**当前组件执行时，如何拿到父组件传来的props？**<br />在执行父组件的`render`函数时，会为子组件创建组件占位符`VNode`，此时会根据子组件中props的定义从组件标签的属性中匹配传入的数据，并存储在子组件的`VNode`中。

**总结：**

1. 父组件执行render时，遇到子组件会为子组件创建VNode，并根据其组件当中的props定义，将标签上的属性存储在`子组件的VNode`当中。
2. 当子组件`init`时，会执行`initProps`方法，方法中对接受到的`props`(存储在`vm._props`)进行响应式劫持(`defineReactive`)，将porps定义为响应式属性。
3. 子组件render时，观测的props会收集依赖，将当前组件的渲染Watcher收集到`dep.subs`中。
4. 当父组件中修改了props，这个props可能是父组件的状态，父组件会重新render。** 此时会重新计算子组件的props**，执行`updateChildComponent`方法，为props重新赋值。 此时props的setter感知到了变化，会派发更新，子组件的渲染Watcher执行`_update`方法，子组件重新渲染。

**props全流程：**<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650705709247-334ac97e-710b-4d34-8a2d-c42aa3347279.png)<br />[https://juejin.cn/post/6995066367850315784](https://juejin.cn/post/6995066367850315784)

<a name="gEXHL"></a>
## 30.Vue中插槽slot原理
插槽原理可以分两个版本来将，2.6版本之前的具名插槽和作用域插槽，2.6版本之后的插槽。2.6版本之后废弃了slot-scope这样的作用域插槽写法。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650711565447-b350be44-54c0-4c9d-8d5e-bb4bff262c70.png)
<a name="NtSzC"></a>
## 31.2.6版本之前的插槽
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650711653471-3d737f4a-55cd-442e-8871-49d9e1c48140.png)<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650711696346-3b5c7c94-0556-4008-97a6-2b3cc03c9e25.png)<br />**作用域插槽和具名插槽区别 ：**<br />具名插槽在父组件编译渲染阶段，会创建插槽的VNode，并将插槽VNode放在了子组件VNode当中。子组件在render时，直接从`vm.$slots`获取对应的插槽VNode，挂在到对应的`slot`标签下面。<br />当父组件重新render时，重新生成`插槽VNode`，会调用子组件的`vm.$forceUpdate`，触发子组件更新视图。

作用域插槽在父组件中并不直接生成插槽`VNode`，而是保存了一个`scopedSlots`对象，存储插槽的名称以及它们对应的`渲染函数`，执行渲染函数会生成VNode，并将该对象插入到`子组件VNode`当中。当子组件render时，会拿到`vm.$slotScopes`对象，并传入对应props，执行渲染函数，生成插槽VNode，并插入到对应`slot`下面。<br />当父组件重新render时，会调用子组件的`vm.$forceUpdate`，触发子组件更新视图。

**作用域插槽和具名插槽渲染上下文不同，具名插槽在父组件中渲染，作用域插槽在子组件中渲染。**

<a name="caKdz"></a>
## 32.2.6之后的插槽
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650713038974-5d24e1b7-c09e-4342-880b-7a8cbb95309f.png)<br />**总结：**<br />2.6以后的插槽，不管是`具名插槽`还是`作用域插槽`，父组件中保存`slotScopes`对象，都在子组件中执行渲染函数，完成渲染。**渲染的上下文始终是子组件。**<br />当父组件中的状态没有在父组件中使用，只是在插槽中使用，那么更新只会影响子组件。<br />[https://juejin.cn/post/6997966632022704135](https://juejin.cn/post/6997966632022704135)


<a name="x4G8g"></a>
## 33.vuex的state为啥具有响应式？
其实在实例化vuex时，在`constructor`内部会将`state`用作`data`来创建一个Vue实例，而这个Vue实例仅仅为了观测data、完成后续依赖收集。<br />当在模版中使用`Vuex.state`时，在执行render函数阶段，渲染Watcher会收集`Vuex.state`的Dep，而`Vuex.state`的Dep同样会收集组件的`渲染Watcher`。 所以当触发commit更新Vuex中的状态时，会派发更新，让组件的`渲染watcher`中的update方法重新执行，组件重新render。

而对应的getter，也会被放到Vuex内部Vue实例的`computed`上面去。

<a name="yU8Lb"></a>
## 34.vuex为啥不能在mutation中做异步操作？

- Vuex中所有的状态更新的唯一途径都是mutation，异步操作通过 Action 来提交 mutation实现，这样可以方便地跟踪每一个状态的变化，从而能够实现一些工具帮助更好地了解我们的应用。
- 每个mutation执行完成后都会对应到一个新的状态变更，这样devtools就可以打个快照存下来，然后就可以实现 time-travel 了。如果mutation支持异步操作，就没有办法知道状态是何时更新的，无法很好的进行状态的追踪，给调试带来困难。

只有`mutaion`才可以更新`state`，这样做的目的是为了**更好的追踪状态的变化**，让我们更好的理解应用的数据流向。如果在mutaion中做了异步操作，那么mutaion执行完毕后，并没有修改状态，所以我们无法检测到状态的变化。而当异步操作执行了的时候，我们无法得知这个state在哪里被更新的。<br />所以需要在action中完成异步操作，待有了结果后在触发mutaion来完成更新state的操作，mutation执行完毕后对应为状态的更新，这样就能让我更好追踪状态的变化。


<br />[

](https://blog.csdn.net/weixin_54187299/article/details/118209619)<br />[

](https://blog.csdn.net/weixin_54187299/article/details/118209619)

