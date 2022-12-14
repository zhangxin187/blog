<meta name="referrer" content="no-referrer"/>
<a name="vHA20"></a>
##  1. this的指向问题
this总是返回一个对象，他的返回值与 **调用者**有关。this与执行上下文有关。<br />函数的运行环境 不等于 定义环境，函数运行的环境是函数被调用执行时所处的环境。<br />一般情况下：<br />① 在普通函数中，this指向window，若this无调用者<br />② 在构造函数中，this指向new的实例对象<br />③ 在方法声明中，this指向调用者<br />④ 在定时器中， this指向window<br />⑤ 在事件中，this 指向事件源<br />⑥ 在箭头函数中，不绑定this关键字，箭头函数中的this 指向的是箭头函数定义的作用域内的this，继承定义作用域中的this。<br />**针对普通函数、方法声明中this指向说明：**方法声明绑定的函数可以看作为普通函数<br />首先判断函数的调用者，若函数有调用者，则this指向调用者；若函数无调用者，则this指向window，其实window是它的调用者，window被省略了。<br />由于JS的异步，定时器函数最终运行在全局(可以认为无调用者)，它的this始终指向window(不人为改变this指向)。
```javascript
function Fn(name) {
  this.name = name;   //this指向实例fn1
  fn = function () {
    console.log(this); //window
    this.name='xxx';   //为window.name赋值,不改变fn1的属性
  }
  fn(); 
}
var fn1 = new Fn('zx');
```
由于fn是普通函数，且它没有调用者，故this指向window。
```javascript
function Fn(name) {
  this.name = name;
  this.fn = function () {
    console.log(this); //fn1实例对象
    this.name = 'xxx'  //修改了fn1实例的属性
  }
  this.fn()
}
var fn1 = new Fn('zx');
console.log(fn1.name); //xxx
```
fn为普通函数(方法声明)，它有调用者this，即为实例对象，故fn函数中this指向实例对象。

```javascript
function Fn(name) {
  this.name = name;
  this.fn = ()=>{
    console.log(this); // 指向实例
  }
  this.fn()
}
var fn1 = new Fn('zx');
console.log(fn1.name); //xxx
```
由于fn为箭头函数，它不绑定this，它会继承定义它的作用域中的this，即它的this为构造函数Fn中的this，指向fn1实例。  故使用箭头函数，可以在构造函数的函数中方便调用实例，不用担心this的指向问题。

**结论：**若函数为箭头函数，则this指向定义它的作用域中的this；若函数为普通函数，则this指向它的调用者，若无调用者则指向window。 <br />并不是 xx.fn() ，则fn函数中的this就指向xx，要判断xx是否为fn的的调用者，若xx中没有fn函数，则会报错！

例1：
```javascript
function fun(){
    console.log(this.s);
}

var obj = {
    s:'1',
    f:fun
}

var s = '2';

obj.f(); //1
fun(); //2
```
obj.f()调用，函数的调用者为obj，故this指向obj，this.s 就是obj对象下的s<br />fun() 调用，函数运行在全局中，无调用者，this指向window，this.s 是调用全局下的变量 s。若开启严格模式，全局作用域中的函数指向undefined，禁止指向window。

例2：
```javascript
var A = {
    name: '张三',
    f: function () {
        console.log('姓名：' + this.name);
    }
};

var B = {
    name: '李四'
};

B.f = A.f;
B.f()   // 姓名：李四
A.f()   // 姓名：张三
```
上面代码中，A.f属性被赋给B.f，也就是 A对象将匿名函数的 地址 赋值给B对象；<br />那么在调用时，函数分别根据运行环境的不同，指向对象A和B。 this指向函数的调用者。

例3：
```javascript
function foo() {
    console.log(this.a);
}
var obj2 = {
    a: 2,
    fn: foo
};
var obj1 = {
    a: 1,
    o1: obj2
};
obj1.o1.fn(); // 2
```
obj1对象的o1属性值是obj2对象的地址，而obj2对象的fn属性的值是函数foo的地址；<br />函数foo的调用环境是在obj2中的，因此this指向对象obj2;<br />以上这种题，多个嵌套调用关系，不需要管太多，只需要记住 **函数中this的指向与它所调用执行的环境有关**。  故只需要看函数运行环境是什么即可，这道题 foo()函数运行在obj2对象当中，故其this 指向obj2 .<br />换一种思路，函数的最终调用者是obj2，**故像这种多层调用关系，只需要找到最后一个调用者(真正的调用者)即可。**

```javascript
this.x = 9; // 在浏览器中，this 指向全局的 "window" 对象
var module = {
  x: 81,
  getX: function () {
    return this.x;
  },
};

module.getX(); // 81

var retrieveX = module.getX;
retrieveX(); // 9
```
这个跟上题类似，`retrieveX()`最终在全局调用，又没明显调用者，故其this指向window。

<a name="HJogM"></a>
##  2. for循环的执行顺序
```javascript
for(i=0;i<9;i++){}
```
1. 执行i=0，这个是赋初值，不进入循环，只执行一次。<br />2. 执行判断判断条件，不满足跳出循环。<br />3. 执行循环体中的语句。<br />4. 执行i++，i++和++i在for循环中都是一样的。
```javascript
for (let i = 2; i <=num; i++) {
    ...
    //此处让i置为1,然后经过i++,下一次循环的开始i为2,而不是1
    i=1;
  }
```


<a name="VoCQk"></a>
##  3. ascll码和unicode码
ascll码 基于拉丁字母的一套**电脑编码系统**，主要用于显示现代英语和其他西欧语言，<br />ascll用一个字节编码，ascll只用了一个字节的后7位，高位为0，**也就是说ASCll的值是从0到127，故ascll码共定义了128个字符。**

Unicode码扩展自ASCII字元集。在严格的ASCII中，每个字元用7位元表示，或者电脑上普遍使用的每字元有8位元宽；而Unicode使用全16位元字元集。**这使得Unicode能够表示世界上所有的书写语言中可能用于电脑通讯的字元、象形文字和其他符号。**

联系：<br />单个字符的unicode码和ascll码是一样的，如'a'的ascll码和unicode码都是97.<br />区别：<br />**ascll用一个字节编码，而unicode用两个**，ascll只用了一个字节的后7位，高位为0，也就是说ascll的值是从0到127（2^7-1），比如48表示'0'这个字符，97表示'a',也就是说ascll只能用来写英语，而不能用于他大字符集的语言，比如汉语。而unicode能表示2的16次方的字符集，大概是6.4万字符，也就是说世界上上几乎所有的语言都能用unicode编码。 <br />**字符串没有ascll码，而具有unicode码。**


<a name="Vxoyh"></a>
##  4. 圣杯布局和双飞翼布局
圣杯布局和双飞翼布局都是 两侧容器宽度固定，中间容器自适应的布局，**且中间容器应该优先被渲染**，即中间容器应该在放在几个容器的前面。

**圣杯 与 双飞翼 布局两者的不同之处，在于圣杯布局的 左中右 三列容器没有多余的子容器来参与布局； 而双飞翼布局三列容，中间的middle多了一个子容器的存在；**<br />**若圣杯布局的父容器container设置了最小宽度,则当屏幕小于这个最小宽度时会出现滚动条，而双飞翼布局则是三栏响应式布局，三个容器都显示，不会出现滚动条。**

**圣杯布局是通过父元素container的padding 空出左右两列的宽度 来实现效果的；**<br />**双飞翼布局是通过控制middle 的子容器的 margin 空出左右两列的宽度 来实现的；**

实现这两个布局依据：1.三个元素全部浮动   2. 利用了元素 设置负margin-left到一定值后会使其自身往上一行移动的原理，移动到上一行从右边开始，当设置marin为百分数，则是相对于父元素的宽度。

**流体布局：**也是两侧容器固定，中间容器自适应的布局，与圣杯、双飞翼不同的是，流体布局要将 中间容器main放在最后面，前两个容器(两侧容器)左右浮动，然后**中间容器不浮动，会占据浮动元素的位置，一行显示**，设置width100%，中间容器不能被优先渲染。  如果将三个容器位置调换，则不能让它们一行显示。


<a name="eReO2"></a>
##  5. Fragment
**Fragment是一个文档碎片节点，相当于一个虚拟的节点对象，它可以包含各种类型的节点。 它不存在于文档当中**，它有一个很实用的特点，当请求把一个DocumentFragment节点插入到文档树中时，**插入的不是DocumentFragment自身，而是它的所有子孙节点**。这个特性使得DocumentFragment成了占位符，暂时存放那些一次插入文档的节点。**它还有利于实现文档的剪切、复制和粘贴操作。 **<br />如果使用appendChid()方法将原dom树中的节点添加到DocumentFragment中时，原来的节点会被删除，用于文档的剪切、复制和粘贴操作。 

**用途：**当需要添加多个dom元素时，如果先将这些元素添加到DocumentFragment中，再统一将DocumentFragment添加到页面，会减少页面渲染dom(重排)的次数，性能会明显提升。<br />**创建方式：**两种方式<br />createDocumentFragment()的兼容性更好
```javascript
document.createDocumentFragment()
new Fragment()
```

添加多个dom元素，使用frament能更少操作dom，减少重排重绘次数，提高浏览器性能。
```javascript
var ul = document.getElementById("ul");
var fragment = document.createDocumentFragment();
for (var i = 0; i < 2000; i++) {
    var li = document.createElement("li");
    li.innerHTML = "index: " + i;
    fragment.appendChild(li); //添加到fragment中去
}
ul.appendChild(fragment);
```

<a name="jESaH"></a>
##  6.闭包
闭包就是指有权访问另一个函数作用域中变量的函数，即可以在其他作用域中访问函数作用域当中的变量。<br />简单地说，闭包需要具备以下三个条件：<br />①函数嵌套函数。<br />②外部函数return了内部函数。<br />③内部函数中包含了外部函数定义的变量

特性：延伸函数的作用域，可以在其他作用域读取函数内部的变量，让这些局部变量始终保存在内存当中，不会被垃圾回收机制所回收，这些局部变量即就是闭包获取的变量。 当闭包不存在了，这些变量才会被销毁。<br />闭包的**优点**是可以避免全局变量的污染，**缺点**是闭包会常驻内存，会增⼤内存使⽤量，使⽤不当很容易造成内存泄露。

用处： 1.读取函数内部的变量(延伸函数作用域链)    	2.封装对象的私有属性和私有方法

**闭包封装对象的私有属性和方法：**<br />js是个弱类型语言，不像java有特定的字面量（private)来定义私有参数，js通过闭包封装对象的私有属性和方法。<br />对象的私有属性和方法，即在外部不能够被访问得到，要通过闭包做接口才能获取得到私有属性和私有方法。
```javascript
function Person(name) {
  //私有属性
  var age = 20;
  //公有属性
  this.name = name;
  //通过闭包来获取、设置私有属性
  this.setAge = function (val) {
    age = val;
  };
  this.getAge = function () {
    return age;
  }
  //私有方法
  var fn = function (val) {
    console.log(val)
  }
  //通过闭包来获取私有方法
  this.getPrivateFn = function () {
    return fn;
  }
}
  var p1 = new Person('zx');
    console.log(p1.name) //'zx'
    console.log(p1.age)  //undefind 私有变量
    //通过闭包获取对象下的私有属性
    console.log(p1.getAge()); //20
    //通过闭包接口设置私有属性
    p1.setAge(30);
    console.log(p1.getAge()); //30
    //直接调用私有方法
    console.log(p1.fn);  //undefind
    //通过闭包返回该私有方法
    var fn1 = p1.getPrivateFn();
    //调用私有方法
    fn1('hi');
```

**什么是内存泄露？**<br />1. 定义：一块被分配的内存既不能使用，也不能回收(内存常驻)。从而影响性能，甚至导致程序崩溃。<br /> 2. 起因：JavaScript的垃圾自动回收机制会按一定的策略找出那些**不再继续使用的变量**，释放其占有的内存。然而由于一些原因导致**在这种机制下内存管理器不能正确解读JavaScript变量的生命周期**，**从而没有释放其内存，而也没有再被使用。**<br />循环引用是导致以上情况的主要原因之一；<br />setTimeout 的第⼀个参数使⽤字符串⽽⾮函数的话，会引发内存泄漏<br />3. 解决办法<br />常用的解决方法就是在JavaScript代码段运行完之时将形成循环引用的JavaScript对象手动设置为空，切断引用。变量设置为null，则回收机制会将其回收。 <br />闭包的内存泄漏解决方法：在退出函数前，将不使用的局部变量全部删除( 将那些变量置为null )。

<a name="qvRXW"></a>
##  7.作用域链
变量或函数可以发生作用( 可访问 )的区域即是作用域。作用域的最大用途就是隔离变量或函数，并控制变量或函数的生命周期，超过该区域的变量或函数就不能被访问。

当一个块或函数嵌套在另一个块或函数中时，就发生了作用域的嵌套。因此，在当前作用域中无法搜索到某个变量时，引擎就会在外层嵌套的作用域中继续搜索，直到搜索到该变量，或抵达最外层的作用域（也就是全局作用域）为止。这样一条有序的列表，称为作用域链，作用域链的最前端一定是当前作用域。

<a name="qotun"></a>
##  8. instanceof 原理
instanceof 可以**判断一个对象( 引用 )是否属于某构造函数**，即判断一个对象是否是一个构造函数的实例，即判断一个引用数据属于什么类型。<br />还可以在继承关系中用来判断一个实例是否属于它的父类型。

原理是按着原型链往上查找来判断，**当前对象的__proto__是否等于( 指向 )构造函数的原型prototype**，**不相等则按着原型链往上找原型 再进行判断。**<br />如 arr数组，arr instanceof Arrary => arr.__proto__===Arrary.prototype=>true<br />如 arr数组，arr instanceof Object => arr.__proto__===Object.prototype => false => arr.__proto__.__proto__===Object.prototype => true； 按着原型链往上找原型，直到相等。

```javascript
function Person(name,age,sex){
     this.name = name;
     this.age = age;
     this.sex = sex;
 }
 function Student(name,age,sex,score){
     Person.call(this,name,age,sex);  
     this.score = score;
  }
 
 Student.prototype = new Person();  // 这里改变了原型指向，实现继承
 Student.prototype.constructor=Student; //指回Student
 var stu = new Student("小明",20,"男",99); //创建了学生对象stu
 console.log(stu instanceof Student);    // true  stu.__proto__==Student.prototype
 console.log(stu instanceof Person);    // true
 console.log(stu instanceof Object);    // true
```
上面 Student构造函数继承了Person，通过构造函数改变指向 和 原型prototype来完成的继承。  Student的原型指向Person实例，Person实例的__proto__指向了Person原型，Person原型的__proto__指向了Object。 instanceof按着原型链往上找，查看是否相等。

**注意：只有new出来的对象才能用 instanceof来判断，instanceof判断一个对象(引用)是否属于某个构造函数。**
```javascript
var num1=123;
num1 instanceof Number //false
var num2 = new Number(123);
num2 instanceof Number //true
```
Number、String、Boolean是基本数据，即在我们创建的时候，系统通过new帮我们包装了数据，使之像有对象一样拥有的属性、方法，使之成为基本包装类型数据。<br />**但是instanceof 并不识别 系统包装的数据**，还是将它们认定为基本数据。  故需要我们自己手动包装基本数据，即 通过new生成一个 数字、字符串，将其包装为对象，这样 它就可以通过 instanceof来进行判断。

<a name="CY6xU"></a>
##  9. typeof 的原理
![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892276057-ed0607fa-9dfa-4997-8514-39daaf6d6c9c.jpeg#averageHue=%23e6cfa9&crop=0&crop=0&crop=1&crop=1&height=751&id=nJ1Yl&name=image.jpeg&originHeight=751&originWidth=887&originalType=binary&ratio=1&rotation=0&showTitle=false&size=458427&status=done&style=none&title=&width=887)<br />所以typeof 只能判断 数字、字符串、布尔值、undefined、函数； 对象、null、 数组、Date等其他引用数据都会被判断为 'object'。<br />typeof判断返回的是字符串，如'number'、'function' 等等

**注意：**<br />typeof  undefined ='undefind' ； typeof NaN='number'<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892275962-4f4acc33-adba-4b2e-a2f6-3f24356073c5.jpeg#averageHue=%23fefdfd&crop=0&crop=0&crop=1&crop=1&height=97&id=gxRIs&name=image.jpeg&originHeight=97&originWidth=747&originalType=binary&ratio=1&rotation=0&showTitle=false&size=21286&status=done&style=none&title=&width=747)


<a name="hgyeu"></a>
##  10.解决小数加减乘除精度丢失的方案
原因：计算机将数以二进制的形式存储，js按照2进制来处理小数的加减乘除,所以会出现精度丢失的问题。<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892275964-34bc6acb-00e7-4684-b7ec-459434c086e4.jpeg#averageHue=%23fefefe&crop=0&crop=0&crop=1&crop=1&height=44&id=FkxI7&name=image.jpeg&originHeight=44&originWidth=702&originalType=binary&ratio=1&rotation=0&showTitle=false&size=13375&status=done&style=none&title=&width=702)<br />十进制的小数转换为二进制，主要是小数部分乘以2，取整数部分依次从左往右放在小数点后，直至相乘为0。 **10进制小数转为2进制，可能存在无限循环的情况。**<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892276041-429ac97f-b96e-42a6-b9a4-f2878a1e3ac4.jpeg#averageHue=%23f7f6f5&crop=0&crop=0&crop=1&crop=1&height=301&id=Iu4gZ&name=image.jpeg&originHeight=301&originWidth=1048&originalType=binary&ratio=1&rotation=0&showTitle=false&size=232958&status=done&style=none&title=&width=1048)<br />0.9在计算机中二进制的存储为：0.1100100100(100无限循环)<br />而JS的二进制最多只能存储64位，采用IEEE754标准。

**js按照二进制来处理小数的加减乘除，然后再转为十进制，故存在精度丢失问题。**

**解决思路：将小数转为整数后再作运算，然后再转为小数。**<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892276001-1f0a1227-33d3-4cb6-a9d3-9ee881ee58c1.jpeg#averageHue=%23fefefe&crop=0&crop=0&crop=1&crop=1&height=98&id=WDpTl&name=image.jpeg&originHeight=98&originWidth=508&originalType=binary&ratio=1&rotation=0&showTitle=false&size=24408&status=done&style=none&title=&width=508)

**注意：**大整数也可能存在精度丢失，JS 中能精准表示的最大整数是** Math.pow(2, 53)**，十进制即 9007199254740992，大于 9007199254740992 的可能会丢失精度。一般不会用到大整数。<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892275972-a121c0b4-b725-4f67-86fb-85bc820722c0.jpeg#averageHue=%23fcfcfc&crop=0&crop=0&crop=1&crop=1&height=55&id=lC8Ki&name=image.jpeg&originHeight=55&originWidth=372&originalType=binary&ratio=1&rotation=0&showTitle=false&size=17998&status=done&style=none&title=&width=372)

**解决代码：**
```javascript
//加法 
function accAdd(arg1,arg2){ 
var r1,r2,m; 
r1=arg1.toString().split(".")[1].length;
r2=arg2.toString().split(".")[1].length;
m=Math.pow(10,Math.max(r1,r2)) 
return (arg1*m+arg2*m)/m 
} 
//减法 
function Subtr(arg1,arg2){ 
 var r1,r2,m,n; 
 r1=arg1.toString().split(".")[1].length;
 r2=arg2.toString().split(".")[1].length;
 m=Math.pow(10,Math.max(r1,r2)); 
 n=(r1>=r2)?r1:r2; //求出保留几位小数，即为位数最大的小数位
 return ((arg1*m-arg2*m)/m).toFixed(n); 
}
 //乘法 
 function accMul(arg1,arg2) 
 { 
 var m=0,t1=0,t2=0; 
 t1=arg1.toString().split(".")[1].length;
 t2=arg2.toString().split(".")[1].length; 
 // 乘法也存在精度丢失,故这里用repalce  
 return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,t1+t2) 
 } 
 //除法
function accDiv(arg1,arg2){ 
 var t1=0,t2=0,r1,r2; 
 t1=arg1.toString().split(".")[1].length;
 t2=arg2.toString().split(".")[1].length;
 r1=Number(arg1.toString().replace(".","")) 
 r2=Number(arg2.toString().replace(".","")) 
 return (r1/r2)*Math.pow(10,t2-t1); 
 } 
```


<a name="oQkRD"></a>
##  11. cookie安全防护 和 XSS-CSRF
**HttpOnly**<br />HttpOnly 最早是由微软在 IE6 中实现的，现在已成为标准 。 浏览器会禁止页面中的 JavaScript 访问带有 HttpOnly 属性的 Cookie。 目的很明显，就是为了应对 Cookie 劫持攻击。<br />大多数XSS攻击的目的都是盗窃cookie。服务端可以通过在它创建的cookie上设置HttpOnly属性来缓解这个问题，指出不应在客户端上访问cookie。

**XSS**全称Cross Site Scripting，名为**跨站脚本攻击**，黑客将恶意脚本代码植入到页面中从而实现盗取用户信息等操作。<br />  1、用户A访问安全网站B，然后用户C发现B网站存在XSS漏洞，此时用户C向A发送了一封邮件，里面有包含恶意脚本的URL地址（此URL地址还是网站B的地址，只是路径上有恶意脚本），当用户点击访问时，因为网站B中cookie含有用户的敏感信息，此时用户C就可以利用脚本在受信任的情况下获取用户A的cookie信息，以及进行一些恶意操作。在现实生活中，黑客经常会通过 QQ 群或者邮件等渠道诱导用户去点击这些恶意链接，所以对于一些链接我们一定要慎之又慎。<br />      这种攻击叫做**反射性XSS**<br />      2、假设网站B是一个博客网站，恶意用户C在存在XSS漏洞的网站B发布了一篇文章，文章中存在一些恶意脚本，例如img标签、script标签等，这篇博客必然会存入数据库中，当其他用户访问该文章时恶意脚本就会执行，然后进行恶意操作。<br />      这种攻击方式叫做**持久性XSS**，将携带脚本的数据存入数据库，之后又由后台返回。

**SameSite**<br />SameSite是一种机制(属性)，用于定义cookie如何跨域发送。samesite主要用于说明该Cookie是否仅被同站请求享有，来控制Cookie何时该被跨站请求携带**。 SameSite的目的是尝试阻止CSRF。**<br />SameSite 选项通常有 Strict、Lax 和 None 三个值。

- SameSite 的值是 Strict，那么浏览器会完全禁止第三方 Cookie，仅在同站请求中携带该Cookie。即我在a.com登陆了，保存了cookie信息，第三方网站访问a.com时不能携带该cookie。
- Lax 相对宽松一点。在跨站点的情况下，从第三方站点的链接打开和从第三方站点提交 Get 方式的表单这两种方式都会携带 Cookie。但如果在第三方站点中使用 Post 方法，或者通过 img、iframe 等标签加载的 URL，这些场景都不会携带 Cookie。
- 而如果使用 None 的话，在任何情况下都会发送 Cookie 数据。

**CSRF**全称cross-site request forgery，名为**跨站请求伪造**，顾名思义就是黑客伪装成用户身份来执行一些非用户自愿的恶意以及非法操作。<br />比如用户访问网站B，且浏览器存储了该站点登陆的cookie，黑客发现了网站B存在CSRF漏洞而此时用户的cookie还未失效，想尽了各种办法勾引用户访问了黑客写好的危险网站C，危险网站C 就会 获取携带该cookie 向网站B发起请求做一些非法操作，这样用户在不知情的情况下就被操控了。 危险网站C向网站B发送请求是绕过了浏览器的同源政策，如script、img、ifame等不受同源政策影响，黑客利用这些向第三方网站发起请求。


<a name="VF6rl"></a>
##  12. 验证请求的来源站定
验证请求的来源 可以阻止CSRF攻击。<br />在服务器端验证请求来源的站点，就是验证 HTTP 请求头中的 Origin 和 Referer 属性。<br />Referer 是 HTTP 请求头中的一个字段，记录了该 HTTP 请求的来源地址，包含了具体的URL。 而Origin 属性只包含了域名信息，并没有包含具体的 URL 路径。这是 Origin 和 Referer 的一个主要区别。<br />**服务器的策略是优先判断 Origin，如果请求头中没有包含 Origin 属性**，再根据实际情况判断是否使用 Referer 值。

**Origin、Host、Referer**<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892277083-fe05c6bc-5da6-4db5-b259-e3741d3b77a9.jpeg#averageHue=%23f6f5f5&crop=0&crop=0&crop=1&crop=1&height=531&id=O9qHZ&name=image.jpeg&originHeight=531&originWidth=1054&originalType=binary&ratio=1&rotation=0&showTitle=false&size=254929&status=done&style=none&title=&width=1054)

**1. Host**<br />描述请求将被发送的目的地，包括，且仅仅包括**域名和端口号**。<br />在任何类型请求中，request都会包含此header信息。<br />**2. Origin**<br />用来说明请求从哪里发起的，**只用于post请求**。且仅仅包括**协议和域名**。<br />这个参数一般只存在于CORS跨域请求中，可以看到response有对应的header：Access-Control-Allow-Origin。<br />**3. Referer**<br />告知服务器 请求的原始资源的URL，**其用于所有类型的请求**，并且包括：**协议+域名+查询参数（注意，不包含锚点信息hash）**。http请求的URL不包含锚点hash值，改变hash不触发网页重载，hash变化不会触发新的URL请求。<br />因为原始的URL中的查询参数可能包含ID或密码等敏感信息，如果写入referer，则可能导致信息泄露。**origin的方式比Referer更安全。**


<a name="Uu8r4"></a>
##  13. ajax的优缺点
优点：<br />1.**无刷新更新数据**，这使得Web应用程序更为迅捷地响应用户交互，并避免了在网络上发送那些没有改变的信息，减少用户等待时间，带来非常好的用户体验。<br />2.**异步与服务器通信**，AJAX使用异步方式与服务器通信，不需要打断用户的操作，具有更加迅速的响应能力。    <br />3.**前端和后端负载均衡**，AJAX可以把以前一些服务器负担的工作转嫁到客户端，利用客户端闲置的能力来处理，减轻服务器和带宽的负担，节约空间和宽带租用成本。并且减轻服务器的负担，AJAX的原则是“按需取数据”，可以最大程度的减少冗余请求和响应对服务器造成的负担，提升站点性能。<br />4.**有助于前后端分离开发**，数据和呈现分离。<br />缺点：<br />1. ajax干掉了Back和History功能，即对浏览器机制的破坏，不能实现浏览器的前进、后退、收藏等操作。因为浏览器仅能记忆历史记录中的静态页面，通过ajax局部修改页面，不能被浏览器所记录。<br />2.违背URL和资源定位的初衷，因为ajax请求的地址不会被记录到l浏览器的地址栏，这个与资源定位的初衷相违背。<br />3. ajax的安全问题，Ajax技术就如同对企业数据建立了一个直接通道。这使得开发者在不经意间会暴露比以前更多的数据和服务器逻辑。<br />4. ajax是异步请求，容易造成回调地狱的问题，多层嵌套。

<a name="ceEj5"></a>
##  14. 手写Promise
一个 Promise 的当前状态必须为以下三种状态中的一种：**等待态（Pending）**、**执行态（Fulfilled）**和**拒绝态(Rejected)，Fufilled和Rejected又合称为settled.**<br />1. 处于等待态时，可以迁移至执行态或拒绝态，执行态和拒绝态不能再迁移到其他状态。<br />2. Then()方法接收两个参数，onFulfilled, onRejected，它们是回调函数，如果不是函数，Promise内部会将它们封装为函数。 <br />3. then()方法返回一个Promise对象，then方法中的两个回调函数是异步执行，即then()方法获取执行结果、错误信息为异步，**注意**：**then()方法并不是异步，then中的回调函数是异步执行！**<br />4. then方法可以穿透，then中回调函数return数据、promise对象，在下个then()方法中可以获取到数据或promise的执行结果。

**一个Promise的手写思路:**<br />1. Promise是一个类，定义Promise的最初状态为Pending，全局定义两个变量存储执行结果、错误信息，再定义个存储then()方法中回调函数的数组，完成初始化操作。<br />2. 在new Promise时传入一个函数作为参数，在Promise类的内部定义两个函数 resolve、reject，然后执行传入的那个函数，并将resolve和reject作为参数传递给 Promise实例。在Promise实例中，调用resolve或reject函数，函数的内部完成 状态的迁移和赋值操作( 注意this指向，将执行结果或错误信息保存到全局中 )，Promise内部只会执行第一个resolve或reject( Promise的状态一经改变，便不能再执行迁移状态和获取值等操作 )。<br />3. 内部定义then方法，then方法有两个参数函数 onFuilled、onRejected，外部Promise实例调用then方法，并传递两个回调函数做为参数，在内部判断现在Promise的状态，然后执行onFuilled 或 onRejected回调函数，将执行结果或错误信息作为参数 传递给外部的then的回调函数。<br />**补充事项：**<br />1. **不要相信外部传递过来的回调函数，一定要进行try catch异常捕获**，将执行外部回调函数的代码放在try中，当该函数执行出错，则将错误信息 传递给错误的回调函数 reject和 onRejected并执行( 当new时传递的回调函数出错，则使用reject在内部改变promise的状态，并传递错误信息，最终会执行onRejected回调函数，将错误信息传递给 外部的Promise实例 )。<br />2. 外部Promise实例可能异步改变Promise的状态(调用resolve或reject)，则会先执行then()方法，在内部此时状态还是Pending( 改变Promise状态是异步 ) ，等异步代码执行时，then方法已经执行过了，故无法正常获取到执行结果。  在内部当状态为Pending时，要将then的回调函数onFuilled和onRejected存到数组中，然后当异步代码执行，resolve或reject回调执行时，Promise的状态发生了改变，然后再调用数组中的回调函数传递执行结果或错误信息。<br />3. then方法中的获取执行结果、错误信息是异步，即then()方法中两个回调函数是异步执行。 在内部将 执行那两个回调函数( 并传递执行结果、错误信息)变为异步操作，即给代码添加一个定时器（setTimeout），将那些代码添加到任务队列中，异步执行。<br />4. 链式调用，then方法返回的是一个promise对象，then方法中回调函数return一个数据或Promise对象，则后面的then能获取到数据或执行结果、错误信息。  在内部then函数的内部，返回一个new的Promise，并将之前then中的代码包裹在这个Promise中，然后进行判断执行then()方法中的回调的返回值，若返回值为数据，则直接resolve(返回值)，改变当前then返回的promise的状态，则后面then能通过成功回调接收到数据。 注意：上一个promise的状态并不会影响下一个promise，即不管上一个then中是在成功回调还是错误回调中reutrn，都调用的是resolve()方法，下一个then都是通过成功回调获取数据。如果当前then中回调执行出错，则调用reject()改变返回Promise的状态，下一个then()方法中通过错误回调函数 获取错误信息。  若返回值是Promise对象，则要先在内部使用then获取它的执行结果或错误信息，再resolve或reject改变返回Promise的状态，下一个then根据Promise状态执行回调接收。<br />5.  如Promise.all()、race()等静态方法，可以在类中通过static定义静态成员，这些静态方法返回的是promise对象，实现过程简单。<br />6. **只需要了解一个Promise的过程，后续的链式调用、静态方法就是对Promise的递归调用、迭代。**<br />7. throw后面的代码不再执行，与return一样，throw返回一个错误。若在一个函数中 添加throw 123，将函数调用 用try catch进行捕获异常，则在catch中通过参数err能获取throw后面的数据123。   <br />可以将throw的错误信息通过  Error、TypeError构造函数进行包装，则在catch中，参数err获得的是Error、TypeError实例，错误信息被包在其中。<br />**注意：**若用try catch来捕获throw的错误信息，则在控制台中就不会报错( 也不会打印错误信息 )，错误信息被catch接收。  若直接throw 错误( 不进行异常捕获 )，则会在控制台报错，打印出错误信息！
```javascript
function fn(){
    console.log(1)    
    //throw new Error(123)
    throw 123   //throw后的代码不再执行，跳出函数
    console.log(2) 
}
try{
    fn() // 1 
}catch(err){
    console.log(err)  //123
}
```

<a name="S3Wns"></a>
##  15. i++和++i
i++和++i都是自增1，如果在赋值当中，则i++是先赋值，再自增；++i是先自增，再赋值。
```javascript
var i = 0;
let a = ++i; //先自增再赋值
let b=i++;   //先赋值再自增
console.log(a); //1  
console.log(b); //1
```
在console.log() 等输出语句中，同样是这个特性。
```javascript
let i=0;
console.log(++i) //1  先自增再打印
console.log(i++) //1  先打印再自增
```


<a name="PJZyw"></a>
##  16. MVC和MVVM
M:Model即模型，数据；  V:View即视图，看到的页面；  <br />**MVC：**<br />MVC是Model-View- Controller的简写。即模型-视图-控制器。C即Controller(控制器)是页面业务逻辑，接收View层传递过来的指令，选取Model层对应的数据，进行相应操作( 操作DOM )，然后将数据映射到View上。一句话描述就是Controller负责将Model的数据用View显示出来。**使用MVC的目的就是将视图和数据分离**。**MVC是单向通信**。也就是View跟Model，必须通过Controller来承上启下，View可以直接获取Model中的数据来展示，但通信必须经过Controller，如用户操作了页面，这时需要view将通知Controller来更新Model中的数据。

用户操作->View（负责接收用户的输入操作）->Controller（业务逻辑处理）->Model（数据持久化）->View（将结果反馈给View）

**MVVM：**<br />MVVM是 Model-View-ViewModel 的缩写，分别对应着：数据，视图，视图模型。Model是我们应用中的数据模型，View是我们的视图层，通过ViewModle视图模型，可以把我们Modle中的数据映射到View视图上，同时，在View层修改了一些数据，也会反应更新我们的Modle。<br />它是根据**数据双向绑定**，View和Model之间没有联系，通过ViewModel进行交互，Model和ViewModel之间的交互是双向的， 因此View 数据的变化会同步到Model中，而Model 数据的变化也会立即反应到View 上。我们不需要再关心业务逻辑处理了。<br />ViewModel 通过双向数据绑定把 View 层和 Model 层连接了起来，ViewModel里面包含DOM Listeners和Data Bindings，DOM Listeners和Data Bindings是实现双向绑定的关键。<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892277048-47eaf07e-5492-4d1c-b5b1-483dbe347111.jpeg#averageHue=%23fefdfc&crop=0&crop=0&crop=1&crop=1&height=119&id=yPM5l&name=image.jpeg&originHeight=119&originWidth=739&originalType=binary&ratio=1&rotation=0&showTitle=false&size=31794&status=done&style=none&title=&width=739)<br />**为什么会出现MVVM？**<br />MVC 架构模式对于简单的应用来看是OK 的，也符合软件架构的分层思想。 但是随着发展，前端越来越复杂了，随之暴露出三个问题：<br />1、 开发者在代码中大量调用相同的 DOM API，处理繁琐 ，操作冗余，使得代码难以维护。<br />2、大量的DOM 操作使页面渲染性能降低，加载速度变慢，影响用户体验。<br />3、 当 Model 频繁发生变化，开发者需要主动更新到View ；当用户的操作导致 Model 发生变化，开发者同样需要将变化的数据同步到Model中，这样的工作不仅繁琐，而且很难维护复杂多变的数据状态。

**MVC和MVVM区别：**<br />MVVM和MVC都是为了让数据、视图、业务逻辑进行分离。<br />MVVM与MVC最大的区别就是：**它实现了View和Model的自动同步**，也就是当Model的属性改变时，我们不用再自己手动操作Dom元素，来改变View的显示，而是改变属性后该属性对应View层显示会自动改变(响应式)。**MVVM和MVC都实现了前后端分离，将视图层和数据层分离开。**<br />MVC和MVVM的区别并不是VM完全取代了C，ViewModel存在目的在于抽离Controller中**展示的业务逻辑**，而不是替代Controller，其它业务处理逻辑等还是应该放在Controller中实现。Controller的存在感降低了。

**MVC和MVP的区别：**<br />MVC中view依赖于model，因此view中可能存在一些业务逻辑，view和model并没有完全分离。<br />**MVP的出现就是为了解决MVC中view和model没有完全分离，view中可能存在业务逻辑的问题。**<br />在MVP中View并不直接使用Model，Presenter层充当了桥梁的角色，它们之间所有的交互完全是通过Presenter 来进行的。由于对视图的渲染放在了Presenter中，所以视图和Presenter的交互会过于频繁。还有一点需要明白，如果Presenter过多地渲染了视图，往往会使得它与特定的视图的联系过于紧密。一旦视图需要变更，那么Presenter也需要变更了。MVP只是解决了view和model完全分离的问题，但是还是需要我们操作大量DOM，同步Model数据。

<a name="BYK6M"></a>
##  17.  CommonJS、AMD、CMD、ES6规范
**模块化的好处：**1.减少全局变量污染； 2.提高了可复用性；3.代码更易维护；4.模块分离可以实现按需加载；5.一定程度上减少了http请求的数量；<br />CommonJS、AMD、CMD和ES6规范是四种主流的模块化规范。

**CommonJS**<br />采用CommonJS模块规范的应用，每个文件就是一个模块，具有自己的私有作用域，不会污染全局作用域。**模块的加载是同步的而且可以加载多次，但在第一次加载后就会被缓存，后面再次被加载时会直接从缓存中读取。**CommonJS主要用于服务器Node.js编程。<br />通过moudule.exports、exports向外暴露模块，通过require引入外部模块。

例题：<br />如果两个模块循环引用会出现什么情况呢？如果模块的加载是简单的同步加载，那循环引用就会引起死循环<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892277053-690bd66a-1244-43d2-bb4b-5123f295805e.jpeg#averageHue=%23212125&crop=0&crop=0&crop=1&crop=1&height=214&id=yoYUj&name=image.jpeg&originHeight=214&originWidth=671&originalType=binary&ratio=1&rotation=0&showTitle=false&size=52988&status=done&style=none&title=&width=671)<br />执行main.js后输出的结果：<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892277044-cee24288-1384-43c4-a465-694aecdc6674.jpeg#averageHue=%23202225&crop=0&crop=0&crop=1&crop=1&height=71&id=c3I3x&name=image.jpeg&originHeight=71&originWidth=507&originalType=binary&ratio=1&rotation=0&showTitle=false&size=11922&status=done&style=none&title=&width=507)<br />上述代码中a加载了b，b加载了a，但我们发现，并没有发生我们担心的循环引用的问题，这是因为**CommonJS会在发生循环引用的位置剪断循环**。具体的执行过程是这样的：<br />执行第一句输出，但由于require是同步加载，会先转去加载a.js，在加载完成前不会输出。在加载a.js的过程中转去加载b.js，这时发现b.js加载了a.js，发生了循环引用，CommonJS在发生循环的点，也就是当b.js加载a.js时，a.js的第二句话处( require代码 )切断循环，也就是说b.js加载a.js的时候不会执行exports.x='a2'。此时b.js加载a.js完毕，加载的x值是a1，所以先输出b.js a1，b.js文件继续向下执行，将其暴露的属性x修改为b2，b.js文件执行完毕，显然此时a.js加载的x为b2，所以输出第二行a.js b2，第三行输出得到main.js a2。** CommonJS规范require加载模块是同步的。**<br />在main.js中第二个console.log语句执行，这时不会执行a.js和b.js文件里的输出了。**模块可以多次加载，在第一次加载以后再加载模块时，会直接从缓存中取值而不会再次加载文件（不会再执行require代码）**，所以第二次加载的时候会直接从缓存中取出exports属性，所以a.js和b.js文件的console.log语句不会执行了。

**注意：模块内部的变化不会影响加载后的值，也就是说模块内部的属性和输出的属性不是响应式变化的，模块暴露的是对象的拷贝，ES6导出的是对象的引用**

**AMD**<br />AMD全称为Asynchronous Module Definition，是**异步加载模块的，允许指定回调函数**。由于Node.js主要用于服务器编程，模块文件一般都已经存在于本地硬盘，所以加载起来比较快，不需要异步加载，所以CommonJS规范比较适用。但是，如果是浏览器环境，要从服务器端加载模块，这时就必须采用异步模式，因此**浏览器端一般采用AMD规范**。<br />**定义模块**<br />AMD规范使用define来定义模块，define函数的定义define(id?,dependencies?,factory)。id为字符串类型唯一用来标识模块（可以省略），dependencies是一个数组字面量，用来表示当前定义的模块所依赖的模块（默认后缀名是.js），当没有dependencies时，表示该模块是一个独立模块，不依赖任何模块。factory是一个需要实例化的函数，函数的参数与依赖的模块一一对应，函数需要有返回值，函数的返回值表示当前模块暴露的内容。<br />**调用模块**<br />AMD规范使用require来调用模块，require函数的定义是require(dependencies,factory)。dependencies是一个数组字面量，表示调用的模块，factory需要传入一个回调函数，用来说明模块异步加载完成后执行的操作。<br />**配置require对象**<br />require函数本身也是一个对象，它带有一个config函数用来配置require函数的运行参数，config函数接受一个对象作为参数。<br />**baseUrl**：baseUrl参数指定本地模块位置的基准目录，即本地模块的路径是相对于哪个目录的。<br />**paths**： paths参数指定各个模块的位置。这个位置可以是服务器上的相对位置，也可以是外部源。可以为每个模块定义多个位置，如果第一个位置加载失败，则加载第二个位置，后面我们将看到具体例子。<br />**shim**：有些库不是AMD兼容的，这时就需要指定shim属性的值。shim是用来帮助require.js加载非AMD规范的库。<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892277195-eaf62c50-dbdd-4646-bd84-5dc592810622.jpeg#averageHue=%23212224&crop=0&crop=0&crop=1&crop=1&height=148&id=apLVy&name=image.jpeg&originHeight=148&originWidth=543&originalType=binary&ratio=1&rotation=0&showTitle=false&size=27074&status=done&style=none&title=&width=543)

![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892277647-f5214030-8e6f-4b1d-8d9f-fa924383024f.jpeg#averageHue=%23212226&crop=0&crop=0&crop=1&crop=1&height=142&id=kpcqo&name=image.jpeg&originHeight=142&originWidth=547&originalType=binary&ratio=1&rotation=0&showTitle=false&size=35790&status=done&style=none&title=&width=547)

![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892277791-d981a21f-c4f5-47db-ac2f-49b76ca459d8.jpeg#averageHue=%23202224&crop=0&crop=0&crop=1&crop=1&height=214&id=W0PJt&name=image.jpeg&originHeight=214&originWidth=539&originalType=binary&ratio=1&rotation=0&showTitle=false&size=56049&status=done&style=none&title=&width=539)

**CMD**<br />CMD全称是Common Module Definition，**它整合了CommonJS和AMD规范的特点，专门用于浏览器端，异步加载模块**。该规范明确了模块的书写格式和基本交互规则<br />CMD规范通过define关键字来定义模块，基本语法为define(factory)，factory的取值可以是函数或者任何合法的值（对象、数组、字符串等）。当factory是函数时，表示是该模块的构造函数，这个函数具有三个参数————“require、exports、module”。require参数是一个方法，它接受模块唯一标识作为参数，用来引入依赖。exports参数用来暴露模块，module参数指向当前模块。

**ES6规范**<br />ES6模块规范的设计思想是**尽量的静态化**，**使得编译时就能确定模块的依赖关系以及输入和输出的变量。 **而CommonJS和CMD，都只能在**运行时确定依赖**，因为它们的导出和导入的模块是个对象，只有运行时才能得到这个对象和查找对象下的方法，导致完全没有办法在编译时做静态优化。<br />ES6的模块不是对象，而是通过export命令显式指定输出的代码，再通过import命令输入，ES6模块是在编译时确定依赖关系。

**ES6是浏览器和服务器通用的模块化规范。**<br />通过export暴露模块成员，通过import 导入外部模块成员，有默认出和按需导出

**在使用CommonJS规范时，输出的是值的拷贝**，也就是说输出之后，模块内部的变化不会影响输出。但在ES6中是恰好相反的，**ES6规范中输出的是值的引用，也就是说模块内部变化会影响输出。**<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892277740-c6b27715-b53c-47f6-9a12-6ae39fae0d7e.jpeg#averageHue=%23222427&crop=0&crop=0&crop=1&crop=1&height=84&id=ik1Qq&name=image.jpeg&originHeight=84&originWidth=546&originalType=binary&ratio=1&rotation=0&showTitle=false&size=17091&status=done&style=none&title=&width=546)

![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892278019-f399687a-00a1-4771-a9d2-f0264619fd98.jpeg#averageHue=%23222326&crop=0&crop=0&crop=1&crop=1&height=83&id=ID2SN&name=image.jpeg&originHeight=83&originWidth=511&originalType=binary&ratio=1&rotation=0&showTitle=false&size=19821&status=done&style=none&title=&width=511)

**总结**

- CommonJS规范主要用于服务端编程，加载模块是同步的，这并不适合在浏览器环境，因为同步意味着阻塞加载，浏览器资源是异步加载的，因此有了AMD、CMD解决方案。
- AMD规范在浏览器环境中异步加载模块，而且可以并行加载多个模块。不过，AMD规范开发成本高，代码的阅读和书写比较困难，模块定义方式的语义不顺畅。
- CMD规范与AMD规范很相似，都用于浏览器编程，依赖就近，延迟执行，可以很容易在Node.js中运行。但是依赖SPM打包，模块的加载逻辑偏重。
- ES6在语言标准的层面上，实现了模块功能，而且实现得相当简单，完全可以取代CommonJS和 CMD规范，成为浏览器和服务器通用的模块化解决方案。
- 在ESM中，由于默认是严格模式，故它的顶层是指向undefined。而在CommonJs模块中，它的顶层this是指向当前模块的`module.exports`对象。
- ESM导出的是值的引用，模块内部变化会影响输出；而其他模块导出的是值的拷贝，模块内部变化不影响输出。


18. web追踪会话的方法<br />1. cookie+session      <br />2. token，客户端向服务器发送请求时，服务器保存用户的信息，生成该用户的唯一token并发给客户端，客户端将token进行存储(一般存储再sessionStorage中)，后续的所有发送请求，便会携带该token以验证身份。<br />3. 隐藏表单域： 将客户端的信息存储在隐藏表单域，这些信息会随着请求一起发送到服务器，服务器通过获取的这些信息来进行会话跟踪。<br />4. URL重写：在URL上添加一个客户端的唯一标识，服务器通过这个唯一标识来识别客户端。

<a name="hVVdR"></a>
##  19.  Number.MIN_VALUE 和 Number.MAX_VALUE
Number.MIN_VALUE 是 js 中可表示的最小的数（无限接近于0，非负数）。它的值为5e-324。注意它不是负数，最小的负数是 - Number.MAX_VALUE。<br />Number.MAX_VALUE 是 js的一个常量，表示js可表示的最大值，值为 1.7976931348623157e+308。<br />它们都是Number的静态属性，实例成员无法获取得到。


<a name="Ayumq"></a>
##  20. eval
eval() 函数**可计算某个字符串，并执行其中的的 Js 代码**，它是JS中一个全局对象。将对应字符串解析成JS代码并运行。<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892278621-7a0aba01-5928-4892-8826-0006a0818c66.jpeg#averageHue=%23bfbebd&crop=0&crop=0&crop=1&crop=1&height=248&id=gyIYB&name=image.jpeg&originHeight=248&originWidth=1055&originalType=binary&ratio=1&rotation=0&showTitle=false&size=121298&status=done&style=none&title=&width=1055)

```javascript
eval("x=10;y=20;document.write(x*y)") //200
document.write(eval("2+2")) //4
```
eval可将JSON字符串转为JSON对象，JSON字符串外面要加上一对小括号将其包围起来。<br />但是如果JSON格式中没有小括号包围，则该eval()方法就不会返回该对象。因为eval()方法在处理方括号”{}”时，会把它当成是一个语句块。那么eval()方法会执行方括号里面的语句，里面的代码不是一个合法的表达式，故会抛出异常。
```javascript
var obj = "{'aa':11,'bb':22}";
eval("("+obj+")"); //将JSON字符串转为对象
```

如果参数中没有合法的表达式和语句，则抛出 SyntaxError 异常。<br />如果传递给 eval() 的 Javascript 代码生成了一个异常，eval() 将把该异常传递给调用者。

注意：应该避免使⽤ eval ，不安全，非常耗性能，先解析成JS代码，后执行代码。

21. 陷阱题<br />["1", "2", "3"].map(parseInt) 答案是多少？    [1, NaN, NaN]
```javascript
["1", "2", "3"].map(parseInt)
解析为：
["1", "2", "3"].map((item,index)=>{
    return parseInt(item,index)
})
//内部执行：
parseInt(1,0); // 1 ,radix设置为0,则根据字符串判断数字的基数
parseInt(2,1); // NaN
parseInt(3,2); // NaN
//返回新数组为：[1,NaN,NaN]
```
map函数遍历数组，并对遍历到的元素进行处理操作，返回一个新数组，它有两个参数item和index。<br />parseInt解析一个字符串，并返回一个整数，可以实现其他进制转为十进制。<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892278570-6589a8cf-39ed-4164-9468-551c6e07f949.jpeg#averageHue=%23d6c4ad&crop=0&crop=0&crop=1&crop=1&height=254&id=zwWx5&name=image.jpeg&originHeight=254&originWidth=986&originalType=binary&ratio=1&rotation=0&showTitle=false&size=148214&status=done&style=none&title=&width=986)

```javascript
parseInt('3',2)// NaN 二进制下没有3,故返回NaN
parseInt('11',16)//NaN 十六进制下没有11,故返回NaN
//省略radix或设置为0,则根据字符串判断数字的基数,9被判断为十进制数
parseInt(9,0) //9
parseInt('11',2) //3
```
如果待转换的数字字符串 不符合设置的基数radix，则会返回NaN；<br />设置的radix不合法，则导致解析失败，返回NaN；

<a name="HHYYA"></a>
##  22.defer 和 async
当解析器遇到 script 标签(外部脚本)时，文档的解析将停止，立即下载并执行脚本( js文件 )，脚本执行完毕后将继续解析文档。避免JS操作DOM 和 文档解析发生冲突。<br />defer和 async都是script标签上的属性。<br />**defer**<br />如果给script标签定义了defer属性，这个属性的作用是**表明脚本在执行时不会影响文档的解析**。也就是说，当解析器遇到 script 标签时，文档的解析不会停止，其他线程将下载脚本，待到文档解析完成，脚本才会执行。解析文档和下载脚本是并行进行的（异步）。**立即下载脚本，但延迟执行。**<br />**脚本按照它们出现的先后顺序执行**，即先声明的脚本先执行，这样有利于脚本间的依赖关系。
```javascript
//脚本A先于脚本B执行
<script defer type="text/javascript" src="A.js"></script>
<script defer type="text/javascript" src="B.js"></script>
```

**async**<br />如果给script标签定义了async属性，当解析器遇到 script 标签时，文档的解析不会停止，其他线程将下载脚本，**脚本下载完成后立即开始执行脚本**，脚本执行的过程中文档将停止解析文档，直到脚本执行完毕。<br />**只要脚本下载完成，将会立即执行，未必会按照声明顺序执行**。它完全不考虑脚本间的依赖关系，不会按照既定顺序执行，所以它对于应用脚本的用处不大。


**总结：**<br />1. defer和async都是立即下载脚本，下载脚本和解析文档并行执行(异步)，不会暂停文档的解析。<br />2. defer和async都只用于外部脚本文件，即引入的外部js。<br />3. 脚本下载完 执行的时机不同，async是脚本下载完成后立即执行，defer是下载完后，等到文档解析完成，再按照脚本声明的先后顺序执行。<br />4. 如果同时使用 defer 和 async，则会默认使用 async，忽略 defer。


<a name="ALr9z"></a>
##  23. 严格模式
除了正常运行模式，ECMAscript 5添加了第二种运行模式：["严格模式"](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Functions_and_function_scope/Strict_mode)（strict mode）。顾名思义，这种模式使得Javascript在更严格的条件下运行。<br />- 消除Javascript语法的一些不合理、不严谨之处，减少一些怪异行为;<br />- 消除代码运行的一些不安全之处，保证代码运行的安全；<br />- 提高编译器效率，增加运行速度；<br />- 为未来新版本的Javascript做好铺垫；<br />**限制：**<br />变量必须声明后再使用<br />函数的参数不能同名，否则报错<br />对象的属性不能有同名属性，否则报错<br />不能使⽤ with 语句<br />禁止 this 指向全局对象，会为undefined<br />函数必须声明在全局或函数作用域的顶层，不允许在块级作用域中声明函数。<br />严禁删除已经声明变量。例如，delete x; 语法是错误的。<br />**注意：es6的class类和模块(esm)中，默认指定为严格模式 。**

<a name="JgKRn"></a>
##  24. window.requestAnimationFrame
译为'请求动画帧'，window.requestAnimationFrame() 可实现动画，间隔屏幕刷新一次的时间执行一次动画回调函数，相当于定时器，比定时器性能好。<br />大多数电脑屏幕是60hz，即一秒钟刷新60次，刷新一次的间隔为16.7ms，视觉根本无法察觉。<br />动画本质就是要让人眼看到图像被刷新而引起变化的视觉效果，这个变化要以连贯的、平滑的方式进行过渡。 动画刷新的时间间隔 要和屏幕刷新一次间隔一样，这样动画才是连贯的，若不一样，则动画会丢帧。 js动画就是利用定时器，间隔一定的时间修改元素的属性，如让元素移动1px。<br />由于刷新频率受**屏幕分辨率**和**屏幕尺寸**的影响，因此不同设备的屏幕刷新频率可能会不同，所以定时器的间隔时间就不好设置了。<br />与setTimeout相比，requestAnimationFrame最大的优势是**由系统来决定回调函数的执行时机，间隔屏幕刷新一次的时间执行回调函数。**具体一点讲，如果屏幕刷新率是60Hz,那么回调函数就每16.7ms被执行一次，如果刷新率是75Hz，那么这个时间间隔就变成了1000/75=13.3ms，换句话说就是，**requestAnimationFrame的步伐跟着系统的刷新步伐走**。它能保证回调函数在屏幕每一次的刷新间隔中只被执行一次，这样就不会引起丢帧现象，也不会导致动画出现卡顿的问题。
```javascript
var progress = 0;
//回调函数
function render() {
    progress += 1; //修改图像的位置
    if (progress < 100) {
           //在动画没有结束前，递归渲染
           window.requestAnimationFrame(render);
    }
}
//第一帧渲染
window.requestAnimationFrame(render);
```


<a name="Cfyy5"></a>
##  25. 如何渲染几万条数据并不卡住界⾯
这道题考察了如何在不卡住页面的情况下渲染数据，也就是说不能⼀次性将几万条都渲染出来，而应该⼀次渲染部分 DOM ，那么就可以通过**requestAnimationFrame **间隔屏幕刷新一次的时间执行插入部分DOM的函数，这样页面就十分流畅。<br /> 在添加DOM时，可以使用fragment，可以减少回流次数，优化性能。<br />在外部添加个定时器，让代码异步执行，不影响下面的代码执行。
```javascript
setTimeout(() => {
  // 插⼊⼗万条数据
  const total = 100000
  // ⼀次插⼊ 20 条，如果觉得性能不好就减少
  const once = 20
  // 渲染数据总共需要⼏次
  const loopCount = total / once
  let countOfRender = 0
  let ul = document.querySelector("ul");
  function add() {
    // 优化性能，插⼊不会造成回流(重排)
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < once; i++) {
      const li = document.createElement("li");
      fragment.appendChild(li);
    }
    ul.appendChild(fragment);
    countOfRender += 1;
    loop();
  }
  function loop() {
    if (countOfRender < loopCount) {
      //间隔页面刷新一次的时间调用插入dom的回调  
      window.requestAnimationFrame(add); 
    }
  }
  loop();
}, 0);
```


<a name="xNfYX"></a>
##  26. caller和callee
caller 是返回⼀个对函数的引用，在该函数中调用了当前函数；<br />callee 是返回正在被执行的函数，即返回当前函数，它是arguments的一个属性，callee适用于函数的递归调用，直接使用函数名代码容易耦合。<br />arguments.callee.length，获得形参的个数，arguments.length是实参的个数。
```javascript
function fn1() {
  fn2()
}
function fn2() {
  console.log(fn2.caller);
}
fn1(); //fn1 在fn1中调用了fn2函数
fn2(); //null 无调用者
```

```javascript
function fn(val){
    console.log(arguments.callee); //返回当前函数
    arguments.length //实参的个数,4
    arguments.callee.length //形参的个数,1
}
fn(1,2,3,4)
```


<a name="rWUxK"></a>
##  27.transform
transform是浏览器对加载出来的元素做的渲染，**改变元素视图上的大小和位置**，不会改变实际位置和大小，元素始终在实际的位置，只不过被隐藏了。<br />如使用transform:translate() 对元素进行移动，使用offsetLeft 获取元素的位置，元素仍处原始的位置。

<a name="L5AUQ"></a>
##  28. 函数防抖和函数节流
**防抖**<br />例子：<br />不使用防抖的情况下，比如我们要在搜索框搜索一个东西，客户端获取输入的关键字向服务器发送请求，获取关联的内容。它使用的是input事件，每当输入框内容发生变化，就会向服务器发送请求。当我们要搜索mate，则每打一个字，就要向服务器发送请求，获取关联内容，这样会浪费带宽，影响性能。<br />正确的做法应该是在合适的情况下再发送网络请求；如果用户快速输入mate，则就发送一次网络请求；如果用户在输入的过程中停顿一段时间，如500ms内没有再次触发事件，则就向服务器发送请求。这就是防抖操作。<br />**定义：**当一个事件被触发，它不会立即执行，而是在一段时间内没有再次触发事件，则会执行事件处理程序。**每次触发事件，则延迟时间会重置。**不管事件触发频率多高，一定在事件触发 n 秒后才执行，如果在一个事件执行的 n秒内又触发了这个事件，就以新的事件的时间为准，n秒后才执行。<br />总之，**触发完事件的一段时间内没有再次触发事件，则执行事件的处理程序。**<br />密集的事件触发，我们只希望执行比较靠后发生的事件，就可以使用防抖函数；<br />防抖的应用场景很多：

- 输入框中频繁的输入内容，搜索或者提交信息；
- 频繁的点击按钮，触发某个事件；
- 监听浏览器滚动事件，完成某些特定操作；
- 用户缩放浏览器的resize事件；

**节流**<br />例子：<br />很多飞机大战的游戏中会有这样的设定，即使按下的频率非常快，子弹也会保持一定的频率来发射；比如1秒钟只能发射一次，即使用户在这1秒钟按下了10次，子弹会保持发射一颗的频率来发射；<br />**定义：不管事件触发频率有多高，只在单位时间内执行一次**，第一次触发事件立即执行，最后一次触发事件也必然执行( 到达时间便会执行 )，中间触发事件都是单位时间执行一次。<br />节流的应用场景：

- 监听页面的滚动事件；
- 鼠标移动事件；
- 用户频繁点击按钮操作；
- 游戏中的一些设计；



29. 手写防抖和节流<br />防抖和节流都可以通过第三方库来实现，如lodash库的API。<br />防抖动和节流本质是不一样的。**防抖动是将多次执行变为最后一次执行，节流是将多次执行变成每隔一段时间执行。**

**防抖函数的核心思路如下：**<br />当触发一个函数时，并不会立即执行这个函数，而是会延迟（通过定时器来延迟函数的执行）<br />如果在延迟时间内，有重新触发函数，那么取消上一次的函数执行（取消定时器）；<br />如果在延迟时间内，没有重新触发函数，那么这个函数就正常执行（执行传入的函数）；
```javascript
//参数：事件处理函数、延迟时间、是否立即执行(Boolean值)
function deBounce(fn, delay, immediate) {
  let timer = null;
  return function (...args) { //可以传参
    //每次触发事件，清除上一次的定时器;清除定时器后,timer并不置为空,而存储清除该定时器的次数
    clearInterval(timer)
    //判断是否要立即执行一次函数
    if (immediate && !timer) {
      fn.apply(this, args)
    }
    //使用箭头函数，让定时器回调函数继承return函数的this,return的函数最终会绑定给元素,最终this指向触发事件的元素
    //定时器当中的this指向全局window,所以要改变定时器中的this
    timer = setTimeout(() => {
      //args是一个参数数组,apply传递的参数要为数组
      fn.apply(this, args)
    }, delay)
  }
}
//应用防抖函数
//deBounce函数将事件处理程序包装为一个防抖函数
let debounceFn = deBounce(fn, 1000, true); //事先定义事件处理程序fn
//绑定事件
input.oninput = debounceFn;
```

**节流函数的核心思路：**<br />节流函数在单位时间内执行一次事件处理程序，第一次触发立即执行，最后一次触发必然执行。<br />节流函数的默认实现思路我们采用时间戳和定时器的方式来完成：<br />我们使用一个last来记录上一次执行的时间<br />每次准备执行前，获取一下当前的时间now：如果 now - last > interval，那么函数执行，并且将now赋值给last即可，当前时间变为上一次执行的时间。<br />时间戳第一次触发则立即执行事件处理程序，最后一次触发则可能不会执行，因为now-last<interval；<br />若要最后一次触发执行的话，则要添加定时器；<br />时间戳+定时器组合使用，第一次触发立即执行，最后一次触发必然执行。

```javascript
function throttle(fn, delay) {
  let timer = null;
  //记录上一次执行时间戳
  let last = 0;
  return function (...args) {
    let now = Date.now();
    if (now - last > delay) {
      //清除开启的定时器,单位时间内只执行一次
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      //执行函数,为函数指定this和添加参数
      fn.apply(this, args)
      // 更新上一次的时间戳为当前时间戳
      last = now;
    } else if (timer == null) { //不能频繁开启定时器，只能开启一个定时器
      //保证最后一次触发执行
      timer = setTimeout(() => {
        //定时器函数执行后,将timer置为null，能让后面触发事件添加定时器
        timer = null;
        fn.apply(this, args)
      }, delay)
    }
  }
}

//应用
//将事件处理程序包装为节流函数
let throttleFn = throttle(fn, 2000);
//绑定事件
btn.onclick = throttleFn;
```

<a name="iR12a"></a>
##  30. input、img是行内元素
input、img等这些元素能设置宽高、不独占一行，在以往的认识中，都将它们归为了行内块元素，其实它们真正意义行属于**行内元素**。<br />行内元素分为**行内替换元素 **和 **行内不可替换元素。**<br />**行内替换元素：就是浏览器根据元素的标签和属性，来决定元素具体实现的内容**。例如浏览器会根据 <img> 标签的 src 属性的值来读取图片信息并显示出来，而如果查看 HTML 代码，则看不到图片的实际内容；又例如根据 <input> 标签的 type 属性来决定是显示输入框，还是单选按钮等。<br />**行内不可替换元素：**HTML 的大多数元素是不可替换元素，即其内容直接表现给用户端（例如浏览器）。

**行内替换元素**img、input等，它能设置宽高边距、且不独占一行，和行内块性质一样。<br />**行内不可替换元素**不能设置宽高边距等，在以往对行内元素的认识，其实就是对行内不可替换元素的认识。**行内不可替换元素可以设置水平margin和padding，不能设置宽高、竖直marigin和padding。**

在以前的CSS版本，根本没有提出inline-block( 行内块 )这个概念，所以对元素的划分要么是行内元素，要么就是块级元素。除非自己手动设置display:inline-block，那么这个元素才是行内块元素。 <br />块级元素：div、表格相关元素、h1-h6、ul、li、p、form等<br />**其实它们的划分不是很明显，有时候说行内元块元素也行，说行内元素也行，事物不是绝对的，要结合选项来看。**

<a name="w7edz"></a>
##  31. tips
![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892278581-a575fd25-b363-4560-91e8-6017c63a2fc7.jpeg#averageHue=%23fdfcfc&crop=0&crop=0&crop=1&crop=1&height=304&id=S9mBy&name=image.jpeg&originHeight=304&originWidth=555&originalType=binary&ratio=1&rotation=0&showTitle=false&size=46563&status=done&style=none&title=&width=555)<br />通过new 创建的字符串，参数必须是字符串，否则生成的不是字符串。<br />new创建的字符串它的类型属于对象，字面量创建的字符串类型为字符串，它们两个'=='比较的话，涉及到隐式转换，故为true。 若全等于'==='由于类型不同，故为false。

<a name="AVur5"></a>
##  32.  面试题(词法作用域)
```javascript
var len = 10;
function fn() {
  console.log(this.len);
}
var obj = {
  len: 5,
  method: function (fn) {
    fn();
    arguments[0]();
  }
}
obj.method(fn, 1)
//输出:  10 5  undefind
```
将fn作为参数传给数组的方法中，调用fn()，此时fn()没有调用者，故其指向window全局，故this.len 就是全局的len，输出10；<br />上面只是总结出来的，真正的原理时，**js函数的作用域是词法作用域(静态作用域)，即函数的作用域在定义时已经确定了**，作用域规定了如何查找变量，也就是确定当前执行代码对变量的访问权限。所以后续在obj内调用fn时，它的作用域指向仍是声明时的全局。

arguments接收全部的实参，不管是否定义了形参。 故arguments[0]就是第一个实参fn。<br />**注意：**arguments是一个伪数组，就是一个对象。**arguments接收参数，实际将参数作为自己属性值来存储**，故fn作为一个属性值定义在arguments中，arguments[0]()访问该属性并执行， 此时fn 的调用者就是arguments，**故此时fn的this指向为arguments**，arguments中未定义len，故输出undefind。

<a name="fBbJb"></a>
##  33. 面试题（类型转换）
![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892278637-29ab3967-0414-40f2-8772-306e7565440f.jpeg#averageHue=%23fefefe&crop=0&crop=0&crop=1&crop=1&height=195&id=RWS2h&name=image.jpeg&originHeight=195&originWidth=680&originalType=binary&ratio=1&rotation=0&showTitle=false&size=38982&status=done&style=none&title=&width=680)<br />''==0，如果一个操作数是字符串，另一个操作数是数值，在比较相等性之前先将字符串转换为数值，Number(' ') =>  0<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892278639-86303b87-2cb8-4a80-bf1c-d5fda7dbaa2f.jpeg#averageHue=%23fdfdfd&crop=0&crop=0&crop=1&crop=1&height=150&id=KCRzz&name=image.jpeg&originHeight=150&originWidth=794&originalType=binary&ratio=1&rotation=0&showTitle=false&size=17713&status=done&style=none&title=&width=794)

<a name="FtmlO"></a>
##  34.面试题（parseFloat）
![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892278947-248b7ad1-f7c4-4bde-98b8-4ff0066fa105.jpeg#averageHue=%23fdfdfd&crop=0&crop=0&crop=1&crop=1&height=200&id=CS0Kn&name=image.jpeg&originHeight=200&originWidth=865&originalType=binary&ratio=1&rotation=0&showTitle=false&size=33815&status=done&style=none&title=&width=865)<br />parseInt()和parseFloat() 里面有个强制转换，会将字符串转为数字。<br />parseInt()会将小数转换为整数，保留整数部分；<br />parseFloat()转换小数时，会省略尾部的0；<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892279139-6f67eee2-cdde-4cc2-9481-7af47ec380d3.jpeg#averageHue=%23fcfcfc&crop=0&crop=0&crop=1&crop=1&height=197&id=iXB6d&name=image.jpeg&originHeight=197&originWidth=616&originalType=binary&ratio=1&rotation=0&showTitle=false&size=31198&status=done&style=none&title=&width=616)<br />将字符串转换为数字时，从左到右，遇到非数字字符便停止转换，如'1.20m'转为1.20；<br />若首字母就是非数字字符，则转换不到数字。


<a name="bcsc3"></a>
##  35.  单线程
单线程：就是进程只有一个线程。单线程在程序执行时，所走的程序路径按照连续顺序排下来，前面的必须处理好，后面的才会执行。<br />**原因** ：避免 DOM 渲染的冲突<br />浏览器需要渲染 DOM<br />JS 可以修改 DOM 结构<br />JS 执行的时候，浏览器 DOM 渲染会暂停<br />两段 JS 也不能同时执⾏（都修改 DOM 就冲突了）<br />webworker 支持多线程，但是不能访问 DOM<br />解决方案 - 异步

<a name="WWdPu"></a>
##  36. webworker
JavaScript 语言采用的是**单线程模型**，也就是说，所有任务只能在一个线程上完成，一次只能做一件事。前面的任务没做完，后面的任务只能等着。‘<br />Web Worker 的作用，就是为 JavaScript** 创造多线程环境**，**允许主线程创建 Worker 线程，将一些任务分配给后者运行。**在主线程运行的同时，Worker 线程在后台运行，两者互不干扰。等到 Worker 线程完成计算任务，再把结果返回给主线程。这样的好处是，一些计算密集型或高延迟的任务，被 Worker 线程负担了，主线程（通常负责 UI 交互）就会很流畅，不会被阻塞或拖慢。<br />Worker 线程一旦新建成功，就会始终运行，不会被主线程上的活动（比如用户点击按钮、提交表单）打断。这样有利于随时响应主线程的通信。但是，**这也造成了 Worker 比较耗费资源，不应该过度使用，一旦使用完毕，就应该关闭。**

**缺点：**

- worker线程并不是独立的，完全受主线程控制，算是主线程的子线程
- worker不能访问dom，不能用来更新UI
- 不能跨域加载js，同源限制
- 线程一旦创建成功，始终存在，耗费资源，需要手动关闭

Web Worker 有以下几个使用注意点：<br />（1）同源限制<br />分配给 Worker 线程运行的脚本文件，必须与主线程的脚本文件同源。<br />（2）DOM 限制<br />Worker 线程所在的全局对象，与主线程不一样，无法读取主线程所在网页的 DOM 对象，也无法使用document、window、parent这些对象。但是，Worker 线程可以navigator对象和location对象。<br />（3）通信联系<br />Worker 线程和主线程不在同一个上下文环境，它们不能直接通信，必须通过消息( 事件触发响应机制 )完成。<br />（4）脚本限制<br />Worker 线程不能执行alert()方法和confirm()方法，但可以使用 XMLHttpRequest 对象发出 AJAX 请求。<br />（5）文件限制<br />Worker 线程无法读取本地文件，即不能打开本机的文件系统（file://），它所加载的脚本，必须来自网络，所以要和主线程运行的脚本文件同源。<br />（6）全局对象<br />Web Worker 有自己的全局对象 self，不是主线程的window，而是一个专门为 Worker 定制的全局对象。因此定义在window上面的对象和方法不是全部都可以使用。

**基本用法**<br />浏览器原生提供Worker()构造函数，用来供主线程生成 Worker 线程。
```javascript
var myWorker = new Worker(jsUrl, options);
```
Worker()构造函数，可以接受两个参数。第一个参数是脚本的网址（必须遵守同源政策），该参数是必需的，且只能加载 JS 脚本，否则会报错。第二个参数是配置对象，该对象可选。它的一个作用就是指定 Worker 的名称，用来区分多个 Worker 线程。<br />**主线程**<br />主线程调用worker.postMessage()方法，向 Worker 发消息。<br />worker.postMessage()方法的参数，就是主线程传给 Worker 的数据。它可以是各种数据类型，包括二进制数据。
```javascript
worker.postMessage('Hello World');
```

主线程通过worker.onmessage指定监听函数，接收子线程发回来的消息。<br />监听函数的参数是事件对象，它的data属性包含子线程发来的数据。
```javascript
worker.onmessage = function (event) {
  console.log('Received message ' + event.data);
  doSomething();
}
```
Worker 完成任务以后，主线程就可以把它关掉。
```javascript
worker.terminate();
```

**Worker线程**<br />Worker 线程内部需要有一个监听函数，监听message事件。self为子线程的全局对象，监听函数的参数是事件对象，它的data属性包含主线程发来的数据。<br />`self.postMessage()`方法用来向主线程发送消息。
```javascript
self.addEventListener('message', function (e) {
  self.postMessage('You said: ' + e.data);
}, false);
```
完成任务以后，内部需要关闭Worker
```javascript
self.close();
```


<a name="t7z2r"></a>
##  38. 异步编程的解决方案
1. 回调函数<br />2. 事件监听<br />这种方式下，异步任务的执行不取决于代码的顺序，而取决于某个事件是否发生。<br />下面是两个函数f1和f2，编程的意图是f2必须等到f1执行完成，才能执行。当f1发生done事件，就执行f2
```javascript
f1.on('done', f2);
```
f1.trigger(‘done’)表示，执行完成后，立即触发done事件，从而开始执行f2。
```javascript
function f1() {
  setTimeout(function () {
    // ...
    f1.trigger('done');
  }, 1000);
}
```
这种方法的优点是比较容易理解，可以绑定多个事件，每个事件可以指定多个回调函数，而且可以"去耦合"，有利于实现模块化。缺点是整个程序都要变成事件驱动型，运行流程会变得很不清晰。阅读代码的时候，很难看出主流程。

3. 发布订阅<br />我们假定，存在一个"信号中心"，某个任务执行完成，就向信号中心"发布"（publish）一个信号，其他任务可以向信号中心"订阅"（subscribe）这个信号，从而知道什么时候自己可以开始执行。这就叫做"发布/订阅模式"（publish-subscribe pattern），又称"观察者模式"（observer pattern）。<br />首先，f2向信号中心jQuery订阅done信号。
```javascript
jQuery.subscribe('done', f2);
```
然后，f1进行如下改写：jQuery.publish('done')的意思是，f1执行完成后，向信号中心jQuery发布done信号，从而引发f2的执行。
```javascript
function f1() {
  setTimeout(function () {
    // ...
    jQuery.publish('done');
  }, 1000);
}
```
f2完成执行后，可以取消订阅（unsubscribe）
```javascript
jQuery.unsubscribe('done', f2);
```
这种方法的性质与“事件监听”类似，但是明显优于后者。因为可以通过查看“消息中心”，了解存在多少信号、每个信号有多少订阅者，从而监控程序的运行。

4. Promise/A+<br />Promise本意是承诺，在程序中的意思就是承诺我过一段时间后会给你一个结果。<br />Promise/A+是Promise的一个规范，其实Promise 规范有很多，如Promise/A，Promise/B，Promise/D 以及 Promise/A 的升级版 Promise/A+。ES6中采用了 Promise/A+ 规范。

5. Generators

6.async/await<br />async/await是基于Promise实现的，它不能用于普通的回调函数。<br />async/await与Promise一样，是非阻塞的。<br />async/await**使得异步代码看起来像同步代码(**并非真正的转为同步代码**)**，是一个语法糖，让异步代码按照同步代码去执行。

**总结：**<br />JS 异步编程进化史：callback -> promise -> generator -> async + await；<br />async/await 函数的实现，就是将 Generator 函数和自动执行器，包装在一个函数里，不需要我们再手动改变状态(调用next()方法让generator函数继续执行)。<br />async/await可以说是异步终极解决方案；


<a name="brtgM"></a>
##  39. Generator
Generator 的中文名称是生成器，它是ES6中提供的新特性。在过去，封装一段运算逻辑的单元是函数。函数只存在“没有被调用”或者“被调用”的情况，不存在一个函数被执行之后还能暂停的情况，而Generator的出现让这种情况成为可能。最大特点就是**可以交出函数的执行权（即暂停执行）**，将线程的执行权交出去，供别的地方使用。

通过function* 来定义的函数称之为“生成器函数”（generator function），**它的特点是可以中断函数的执行，每次执行yield语句之后，函数即暂停执行，直到调用返回的生成器对象的next()方法它才会继续执行。**<br />也就是说Generator 函数是一个**状态机**，封装了多个内部状态。**执行 Generator 函数返回一个遍历器对象（一个指向内部状态的指针对象）**，调用遍历器对象的next方法，使得指针移向下一个状态。每次调用next方法，内部指针就从函数头部或上一次停下来的地方开始执行，直到遇到下一个yield表达式（或return语句）为止。

真正让Generator具有价值的是**yield**关键字，这个**yield**关键字让 Generator内部的逻辑能够切割成多个部分，执行到yeild语句之后，函数便暂停执行。
```javascript
function* fn(){  //创建generator函数
    yeild console.log(1);
    yeild console.log(2);
    yeild console.log(3);
}
//执行generator函数，得到Generator实例，即得到遍历器对象
var gen=fn(); //函数遇到yeild便会停止执行
//调用遍历器对象的next()方法，函数便会继续执行，遇到下个yeild又会暂停执行
//要让业务逻辑继续执行完，需要反复调用next()
gen.next(); //1 
gen.next(); //2
gen.next(); //3
```

**next()调用时，返回一个对象**，yield除了切割逻辑外，它与.next()的行为息息相关。每次.next()调用时，返回一个对象，这个对象具备两个属性。<br />其中一个属性是布尔型的**done**。它表示这个Generator对象的逻辑块是否执行完成，逻辑块执行完成，即函数中的所有yeild语句 都被执行过了。<br />另一个属性是**value**，它是 yield语句后的表达式的值。
```javascript
function * getNumbers(num) {
    for(let i=0; i<num;i++) {
        yield i
    }
    return 'ok';
}
const gen = getNumbers(10);
function next() {
    let res = gen.next();
    if(res.done) { 
        console.log('done');
    } else {
        setTimeout(next,300); //递归调用
    }
}
next();
```


通过.next()方法可以传递参数，该参数就会被当作上一个yield表达式的返回值 ，**即 将参数 赋值给上一个yield关键字前面的变量声明。**<br />所以，对于Generator而言，**它不仅可以将逻辑的单元切分得更细外，还能在暂停和继续执行的间隔中，动态传入数据，使得代码逻辑可以更灵活。**
```javascript
 function* fn(a, b) {
  var h = yield a + b;
  console.log(h);  //"Hello world!"
};

let generator = fn(4, 2);
generator.next();  // h : undefined
generator.next("Hello world!"); //参数作为上一个yeild表达式的返回值。
```

由于next方法的参数表示上一个yield表达式的返回值，所以在第一次使用next方法时，传递参数是无效的。V8 引擎直接忽略第一次使用next方法时的参数，只有从第二次使用next方法开始，参数才是有效的。**从语义上讲，第一个next方法用来启动遍历器对象，所以不用带有参数。**<br />[https://www.ruanyifeng.com/blog/2015/04/generator.html](https://www.ruanyifeng.com/blog/2015/04/generator.html)


<a name="aOwnO"></a>
##  39. 浏览器中的事件循环(evenloop)
JS是一种单线程、非阻塞的语言，JS的代码执行是基于一种事件循环的机制。<br />JS代码的执行过程中，除了依靠函数调用栈( 执行栈 )来搞定函数的执行顺序外，还依靠任务队列(task queue)来搞定另外一些代码的执行。整个执行过程，我们称为事件循环过程。<br />同步任务在主线程中执行，形成一个执行栈，异步任务经Event Table注册回调函数，当指定的事情完成( 异步任务有了运行结果 )，Event Table会将注册的回调函数添加进任务队列，当执行栈中的同步任务执行完，执行栈空闲时，会去任务队列中查看是否有可执行的异步任务，如果有就依次取出到执行栈中执行，上述过程不断重复，就称为事件循环。

定时器设置时间并不是回调函数准确的执行时间，因为当时间到了(异步任务有了运行结果)，回调函数才被添加进任务队列，可能同步代码未执行完 或任务队列中可能存在大量任务，当执行栈为空时才会依次执行任务队列中的任务(事件循环)，定时器回调函数之前的任务执行需要耗费时间，就会造成定时器回调函数的延迟，所以定时器回调函数的执行时间要大于设置的时间，所以**定时器设置的时间并不是准确时间，只是个最优(理想)时间。 **定时器在同步代码执行完毕后，并且任务队列之前的任务执行完毕后，才会执行。<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892279399-0372a909-880d-46aa-b707-c3a20a438303.jpeg#averageHue=%23f9f8f8&crop=0&crop=0&crop=1&crop=1&height=730&id=i3wSV&name=image.jpeg&originHeight=730&originWidth=828&originalType=binary&ratio=1&rotation=0&showTitle=false&size=230298&status=done&style=none&title=&width=828)<br />一个线程中，事件循环是唯一的，但是任务队列可以拥有多个。任务队列可以分为** 宏任务队列**和**微任务队列**。<br />macro-task（宏任务）大概包括：

- script
- setTimeout
- setInterval
- setImmediate(Node中的API)
- I/O
- UI render

micro-task（微任务）大概包括:

- process.nextTick(node中的API)
- Promise.then()/catch() ，Promise内部的代码会立即执行(同步代码)。
- Async/Await(实际就是promise)
- MutationObserver(html5新特性)，监视DOM结构变化的接口。

**宏任务** 可以理解是首次执行栈执行的任务就是一个宏任务（包括每次从事件队列中获取一个事件回调并放到执行栈中执行）。<br />**浏览器为了能够使得JS内部宏任务与DOM任务能够有序的执行，会在一个宏任务执行结束后，在下一个宏任务执行开始前，对页面进行重新渲染。**

**宏微任务执行顺序的疑惑**<br />若不将 首次执行 执行栈 视作宏任务，那么应该是先执行执行栈中的同步任务，执行过程中将异步任务分别推入宏任务和微任务队列。 然后先执行所有微任务，在执行过程中产生新的微任务，将其推到微任务对列，当所有微任务执行完毕，再执行宏任务。 宏任务执行过程中遇到微任务将其添加到微任务队列中，再执行宏任务过程中产生的所有微任务......<br />辩证的去看。  按理说执行执行栈中的任务应该是一个同步任务，而宏任务和微任务属于异步任务。
> 所以其实是看一次loop的开始和截止的界限如何定义，从首次执行执行栈开始算，就是先执行宏任务，再执行全部微任务；从执行栈清空后，第一次把微任务的回调放到执行栈中执行的时候算，就是先全部微任务，再宏任务。


**运行机制：**<br />在事件循环中，每进行一次循环操作称为 tick，每一次 tick 的任务[处理模型](https://www.w3.org/TR/html5/webappapis.html#event-loops-processing-model)是比较复杂的，但关键步骤如下：

- 执行一个宏任务(初始时，将执行执行栈中的任务视作为宏任务)
- 执行过程中如果遇到微任务，就将它添加到微任务的任务队列中
- 宏任务执行完毕后，立即执行当前微任务队列中的所有微任务（依次执行）
- 所有微任务执行完毕，执行下一个宏任务之前，开始检查渲染，然后GUI线程接管渲染
- 渲染完毕后，JS线程继续接管，开始下一个宏任务（从事件队列中获取）

总的结论就是，先执行宏任务，遇到微任务则添加进微任务队列，当宏任务执行结束，然后执行该宏任务产生的所有微任务，若微任务在执行过程中产生了新的微任务，则将其推入到微任务队列，继续执行微任务队列中的任务，也就是说**在执行微任务过程中产生的新的微任务并不会推迟到下个宏任务中执行，而是在当前的宏任务中继续执行。**微任务执行完毕后，进入下一轮事件循环，执行下一个宏任务。<br />**在开始下一轮事件循环前，必须将所有的微任务都执行完毕。**<br />![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892279434-085e3f29-f80a-4440-a252-b65303c93ce3.jpeg#averageHue=%23fcfcfc&crop=0&crop=0&crop=1&crop=1&height=436&id=pgzl6&name=image.jpeg&originHeight=436&originWidth=451&originalType=binary&ratio=1&rotation=0&showTitle=false&size=34422&status=done&style=none&title=&width=451)

40. 宏任务微任务执行顺序的面试题
```javascript
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
	console.log('async2');
}
console.log('script start');

setTimeout(function() {
    console.log('setTimeout');
}, 0)

async1();

new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});
console.log('script end');
//输出
/*
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
*/
```
**Promise和async中的立即执行**<br />我们知道Promise中的异步体现在then和catch中，所以写在Promise中的代码是被当做同步任务立即执行的**，then()和catch()才属于微任务**。**而在async/await中，在出现awai之前，其中的代码也是立即执行的。**<br />**await做了什么**<br />从字面意思上看await就是等待，await 等待的是一个表达式，这个表达式的返回值可以是一个promise对象也可以是其他值。<br />很多人以为await会一直等待之后的表达式执行完之后才会继续执行下面的代码，**实际上await是一个让出线程的标志。await后面的表达式会先执行一遍，await下面的代码是微任务，将await下面的代码添加进微任务队列，然后就会跳出整个async函数来执行后面的代码。**

由于因为async await 本身就是promise+generator的语法糖。所以await下面的代码是微任务（microtask）。await可以写为promise，对应本题中的如下。
```javascript
async function async1() {
	console.log('async1 start');
	await async2();
	console.log('async1 end'); //微任务
}
//等价于
async function async1() {
	console.log('async1 start'); 
	Promise.resolve(async2()).then(() => {
                console.log('async1 end');
        })
}
```


题解：<br />1. 首先，事件循环从执行宏任务开始，这个时候，只有一个script(整体代码)任务；当遇到任务源(task source)时，则会先分发任务到对应的任务队列中去。<br />2. 代码从上往下执行，遇到了 console 语句，直接输出 script start；代码继续往下执行，遇到setTimeout，它是一个宏任务，将它添加进宏任务队列；执行 async1()函数，由于出现在await之前的代码立即执行，故输出 async1 start ； 遇到了await时，会将await后面的表达式执行一遍，所以就紧接着输出async2； 然后将await下面的代码也就是console.log('async1 end')加入到微任务队列中，接着跳出async1函数来执行后面的代码。<br /> 再往下遇到Promise，Promise中的代码立即执行，故输出promise1，接着将 .then() 添加到微任务队列当中； 接着执行输出 script end；<br />3. 至此一个宏任务执行完毕，每执行完一个宏任务后，就会执行宏任务执行过程中产生的所有微任务( 按顺序执行 )。此时微任务队列中有两个任务 async1 end 和 promise2；<br />因此按先后顺序输出 async1 end，promise2，当所有的微任务执行完毕后，表示该轮循环结束。<br />4. 第二轮循环依旧从宏任务队列开始。此时宏任务中只有一个 setTimeout，取出执行直接输出即可，至此整个流程结束。

**变式1：**
```javascript
async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
}
async function async2() {
    //async2做出如下更改：
    new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
    });
}
console.log('script start');

setTimeout(function() {
    console.log('setTimeout');
}, 0)
async1();

new Promise(function(resolve) {
    console.log('promise3');
    resolve();
}).then(function() {
    console.log('promise4');
});
console.log('script end');

//输出
script start
async1 start
promise1
promise3
script end
promise2
async1 end
promise4
setTimeout
```
相较于原题，只是将await后面表示式中的内容改变了，执行async2()函数时，Promise中的内容立即执行，输出promise1，接着将.then()添加到微任务队列中，然后将await下面的代码添加进微任务队列。执行微任务队列中的任务时，按照添加的顺序依次执行。

**变式2：**
```javascript
async function async1() {
    console.log('async1 start');
    await async2();
    //更改如下：
    setTimeout(function() { 
        console.log('setTimeout1')
    },0)
}
async function async2() {
    //更改如下：
	setTimeout(function() {
		console.log('setTimeout2')
	},0)
}
console.log('script start');
async1();
setTimeout(function() {
    console.log('setTimeout3');
}, 0)
new Promise(function(resolve) {
    console.log('promise1');
    resolve();
}).then(function() {
    console.log('promise2');
});
console.log('script end');
//输出
script start
async1 start
promise1
script end
promise2
setTimeout2
setTimeout3
setTimeout1
```
本题与上一题不同的是，await下面的代码变为异步代码；<br />大体上和前面题一样，不同的是，执行aync2()时，将setTimeout2 添加到宏任务队列，然后await下面的代码还是被添加到微任务队列，然后将setTimeout3添加到宏任务队列；当宏任务执行完时，开始执行微任务，执行await下面的代码，发现它属于一个宏任务，故将setTimeout1添加到宏任务队列中去；最后按照宏任务队列中任务的顺序，故依次输出setTimeout2、setTimeout3、setTimeout1。<br />**注意：不管await下面的代码本质是否为宏任务，最初都把它看作一个微任务，将它添加进微任务队列，当执行它的时候，发现它是宏任务，再将它添加进宏任务队列。**

**例题3**
```javascript
console.log('script start')
setTimeout(() => {
    console.log('setTimeout')
}, 0)
let promise1 = new Promise((resolve) => {
    resolve('promise1.then')
    console.log('promise1')
})
promise1.then((res) => {
    console.log(res)
    Promise.resolve().then(() => {
        console.log('promise2')
    })
})
console.log('script end')
//输出
script start
promise1
script end
promise1.then
promise2
setTimeout
```
在执行微任务的过程中，产生了新的微任务，直接将其推入到微任务队列中，继续执行微任务队列中的任务。即在当前宏任务中继续执行该微任务，不会将其推迟到下一个宏任务中执行。

**例题4**
```javascript
new Promise(function (resolve) {
  resolve()
  console.log(1);
}).then(function () {
  console.log(3);
}).then(function () {
  console.log(5);
})

new Promise(function (resolve) {
  resolve()
  console.log(2);
}).then(function () {
  console.log(4);
}).then(function () {
  console.log(6);
}).then(function () {
  console.log(7);
});
//输出 1 2 3 4 5 6 7
```
先执行宏任务，即整体代码，promise内部是同步的，执行第一个promise，输出1，后面的then方法为微任务，添加到微任务队列中，再执行第二个promise，输出2，后面的then添加到微任务队列。 执行完宏任务，开始按照队列顺序执行微任务，先输出3，后面的then方法添加到微任务队列，再执行第二个promise的then方法，输出4，后面的then方法添加到微任务队列，然后再执行第一个promise中的第二个then方法，输出5....<br />**注意：**按照微任务队列中的顺序进行执行，先添加进队列的任务，先执行。



<a name="AHNP7"></a>
##  41. node中的事件循环
浏览器中有事件循环，node 中也有，事件循环是 node 处理非阻塞 I/O 操作的机制，node中事件循环的实现是依靠的libuv引擎。在 node 11 之后，事件循环的一些原理发生了变化。<br />node 中也有宏任务和微任务，与浏览器中的事件循环类似，其中，<br />macro-task 大概包括：

- setTimeout
- setInterval
- setImmediate
- script（整体代码)
- I/O 操作等。

micro-task 大概包括：

- process.nextTick(与普通微任务有区别，在微任务队列执行之前执行)
- new Promise().then(回调)等。

![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892279481-2cf05f16-e3df-4fff-a05d-c0e764d7343c.jpeg#averageHue=%23323232&crop=0&crop=0&crop=1&crop=1&height=451&id=ANvkP&name=image.jpeg&originHeight=451&originWidth=751&originalType=binary&ratio=1&rotation=0&showTitle=false&size=56216&status=done&style=none&title=&width=751)<br />图中的每个框被称为事件循环机制的一个阶段，每个阶段都有一个 FIFO 队列来执行回调。虽然每个阶段都是特殊的，但通常情况下，当事件循环进入给定的阶段时，它将执行特定于该阶段的任何操作，然后执行该阶段队列中的回调，直到队列用尽或最大回调数已执行。当该队列已用尽或达到回调限制，事件循环将移动到下一阶段。

因此，从上面这个简化图中，我们可以分析出 node 的事件循环的执行阶段顺序（宏任务执行顺序）为：<br />输入数据阶段(incoming data)->轮询阶段(poll)->检查阶段(check)->关闭事件回调阶段(close callback)->定时器检测阶段(timers)->I/O事件回调阶段(I/O callbacks)->闲置阶段(idle, prepare)->轮询阶段...

**每个阶段中都有宏任务，执行宏任务过程中会产生微任务。当一个阶段中所有任务回调执行完毕 或 达到最大回调数，则会进入下一个阶段。**

**阶段概述**

- 定时器检测阶段(timers)：本阶段执行 timer 的回调，即 setTimeout、setInterval 里面的回调函数。
- I/O事件回调阶段(I/O callbacks)：执行延迟到下一个循环迭代的 I/O 回调，即上一轮循环中未被执行的一些I/O回调。
- 闲置阶段(idle, prepare)：仅系统内部使用。
- 轮询阶段(poll)：检索新的 I/O 事件;执行与 I/O 相关的回调（几乎所有情况下，除了关闭的回调函数，那些由计时器和 setImmediate() 调度的之外），其余情况 node 将在适当的时候在此阻塞。
- 检查阶段(check)：setImmediate() 回调函数在这里执行
- 关闭事件回调阶段(close callback)：一些关闭的回调函数，如：socket.on('close', ...)。



**process.nextTick**<br />process.nextTick 是一个独立于 eventLoop 的任务队列。<br />在每一个 eventLoop 阶段完成后会去检查 nextTick 队列，如果里面有任务，会让这部分任务优先于微任务执行。**process.nextTick优先于微任务执行。**
```javascript
setImmediate(() => {
    console.log('timeout1')
    Promise.resolve().then(() =>console.log('promise resolve'))
    process.nextTick(() =>console.log('next tick1'))
});
setImmediate(() => {
    console.log('timeout2')
    process.nextTick(() =>console.log('next tick2'))
});
setImmediate(() =>console.log('timeout3'));
setImmediate(() =>console.log('timeout4'));
```

- 在 node11 之前，因为每一个 eventLoop 阶段完成后会去检查 nextTick 队列，如果里面有任务，会让这部分任务优先于微任务执行，因此上述代码是先进入 check 阶段，执行所有 setImmediate，完成之后执行 nextTick 队列，最后执行微任务队列，因此输出为timeout1=>timeout2=>timeout3=>timeout4=>next tick1=>next tick2=>promise resolve
- 在 node11 之后，process.nextTick 是微任务的一种( **优先执行nextTick **),因此上述代码是先进入 check 阶段，执行一个 setImmediate 宏任务，然后执行其微任务队列，再执行下一个宏任务及其微任务，因此输出为timeout1=>next tick1=>promise resolve=>timeout2=>next tick2=>timeout3=>timeout4

**node 版本差异说明**<br />这里主要说明的是 node11 前后的差异，因为 node11 之后一些特性已经向浏览器看齐了，总的变化一句话来说就是，**如果是 node11 版本一旦执行一个阶段里的一个宏任务(setTimeout,setInterval和setImmediate)就立刻执行对应的微任务队列。node11之前的版本，会先执行一个阶段中所有的宏任务，再执行nextTick，然后再执行微任务。**

**timers 阶段的执行时机变化**
```javascript
setTimeout(()=>{
    console.log('timer1')
    Promise.resolve().then(function() {
        console.log('promise1')
    })
}, 0)
setTimeout(()=>{
    console.log('timer2')
    Promise.resolve().then(function() {
        console.log('promise2')
    })
}, 0)
```

- 如果是 node11 版本一旦执行一个阶段里的一个宏任务(setTimeout,setInterval和setImmediate)就立刻执行微任务队列，这就跟浏览器端运行一致，最后的结果为timer1=>promise1=>timer2=>promise2
- 如果是 node10 及其之前版本要看第一个定时器执行完，第二个定时器是否在完成队列中.
   - 如果是第二个定时器还未在完成队列中，最后的结果为timer1=>promise1=>timer2=>promise2
   - 如果是第二个定时器已经在完成队列中，则最后的结果为timer1=>timer2=>promise1=>promise2

**check 阶段的执行时机变化**
```javascript
setImmediate(() =>console.log('immediate1'));
setImmediate(() => {
    console.log('immediate2')
    Promise.resolve().then(() =>console.log('promise resolve'))
});
setImmediate(() =>console.log('immediate3'));
setImmediate(() =>console.log('immediate4'));
```

- 如果是 node11 后的版本，会输出immediate1=>immediate2=>promise resolve=>immediate3=>immediate4
- 如果是 node11 前的版本，会输出immediate1=>immediate2=>immediate3=>immediate4=>promise resolve

**结论：如果是 node11 版本一旦执行一个阶段里的一个宏任务(setTimeout,setInterval和setImmediate)就立刻执行对应的微任务队列。**<br />**如果是node11之前的版本，优先执行一个阶段中的所有宏任务，然后再执行所有的微任务。**

**node 和 浏览器 eventLoop的主要区别**<br />两者最主要的区别在于**浏览器中的微任务是在每个相应的宏任务中执行的，而nodejs中的微任务是在不同阶段之间执行的。**

**Node中宏任务的执行是分阶段的，当一个阶段中所有回调执行完毕或超出最大调用栈时，才进入到下一个阶段。**而在一个阶段中宏微任务执行顺序如下：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1648639624790-a6bcab6c-94f9-4d3c-af83-586bb06087c7.png#averageHue=%23fefefd&clientId=u4724859e-5fd8-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=251&id=u93107503&margin=%5Bobject%20Object%5D&name=image.png&originHeight=276&originWidth=736&originalType=binary&ratio=1&rotation=0&showTitle=false&size=92131&status=done&style=none&taskId=u40dda47d-d542-4e98-93ac-b4c3d8bc93b&title=&width=669.0908945887545)


<a name="OXZjn"></a>
##  42. 二进制与、或、异或操作
![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892279548-a696a544-b852-49ba-80e8-56eec19cfcdc.jpeg#averageHue=%23ebebeb&crop=0&crop=0&crop=1&crop=1&height=216&id=DHZ2X&name=image.jpeg&originHeight=216&originWidth=1620&originalType=binary&ratio=1&rotation=0&showTitle=false&size=114885&status=done&style=none&title=&width=1620)<br />异或^ 相同取0，不同取1；<br />js进行与或等逻辑计算时，两边的数会先转为二进制，然后再进行与、或、异或操作，再将结果转为十进制数。<br />如5 &3得结果为7，5转为二进制为0101，3转为二进制为0011，0101&0011=0111，再转为十进制数为7<br />tips：

- num >> 1  num左移一位，除以2取整 ， 等于 Math.floor(num/2)
- num & 1  用来判断num是不是奇数

<a name="kvMAG"></a>
##  43. 移动端1px问题
由于移动端的屏幕物理像素(分辨率)高，可能会存在CSS中的1px对应有2个物理像素，物理像素比为2，故有二倍屏、三倍屏等。<br />分辨率越高，能显示的物理像素点越多，故显示的越清晰。<br />在二倍屏下，1px的border对应有两个物理像素，1px的宽度会被放大显示为2px，故该1px的border比普通屏下显示得更宽。

解决方案： <br />在二倍屏下让其显示的1px宽度和普通屏下1px宽度一样。<br />1. 将border设置为0.5px，在二倍屏的放大效果下显示为1px。<br />2. SVG<br />3. 伪元素，在元素里设置伪元素，让伪元素的宽高为父元素的200%，再scale(0.5)缩小一半，在缩小宽高的同时，也将border进行了缩小。 父元素不添加border，伪元素覆盖父元素，给伪元素添加border。
```css
div {
  position: relative;
  width: 200px;
  height: 200px;
}
div::before {
  content: '';
  position: absolute; //伪元素是行内元素
  width: 200%;
  height: 200%;
  box-sizing: border-box;  //必须设置为border的盒模型
  border: 1px solid black;
  transform-origin: left top; //固定缩放中心
  transform: scale(0.5); //border也缩小为了原来的一半0.5px
}
```


<a name="LeqG7"></a>
##  44. onload() 和 ready()的区别
1. 执行时机不同： 

- onload()是等页面**全部资源加载完毕执行**，包括图片等资源；
- document.ready()等**DOM结构加载完毕才执行**，不需要等到全部资源加载完毕，DOM树加载完毕，还有图片等一些资源还未加载，**故ready() 比 onload() 先执行**。

2. 执行次数不同，如果定义多个 onload() 和 ready()，**则ready()会执行多次，而onload()只执行一次**，后面的覆盖掉前面定义的。

<a name="iCcHP"></a>
##  45. << 和 >> 移位操作
这是二进制数的移位操作，<<代表左移位，>>代表右移位。<br />JS运算内部 先将十进制数转为二进制，然后进行移位操作，再将移位后的二进制转为十进制数。<br />如 1<<4，内部先将1转为二进制 0001，然后左移四位变为10000，转为十进制的值为16.<br />左移除2，右移除2。


<a name="mUlpx"></a>
##  46. Object.create()
Object.create()方法创建一个新对象，使用现有的对象来提供新创建对象的__proto__，现有对象作为它的原型对象，该API可以用来完成对象继承。
```javascript
var obj={a:123,b:456};
var newObj=Object.create(obj); //obj就为newObj的原型  newObj.__proto__=obj

// 实现
const createObject = (obj)=>{
  function Fn(){}
  Fn.prototype = obj;
  return new Fn();
}
```


<a name="QAiYk"></a>
##  47. with 语法
with语句的作用是**将代码的作用域设置到一个特定的作用域中，即改变一块代码的作用域。**<br />使用with关键字的目的是为了简化多次编写访问同一对象的工作，比如下面的例子：
```javascript
var qs = location.search.substring(1);
var hostName = location.hostname;
var url = location.href;
```
这几行代码都是访问location对象中的属性，如果使用with关键字的话，可以简化代码如下：
```javascript
with (location){
    var qs = search.substring(1);  //location.search...
    var hostName = hostname;
    var url = href;
}
```
在这段代码中，使用了with语句关联了location对象，代码块内部每个变量首先被认为是一个局部变量，如果局部变量与location对象的某个属性同名，则这个局部变量会指向location对象属性。 **先在当前关联的对象上找同名的属性，若是找不到的话，则会定义为一个全局变量。**<br />注意：**with并不会产生一个类似函数一样的作用域**，若在里面声明一个非同名属性的变量，则该变量为全局变量，只有在函数中声明的变量才是局部变量。<br />注意：在严格模式下不能使用with语句。

能产生上下文只有全局(globalContext)和函数(VO)。

with语法不推荐使用：**1. 性能问题 **  **2. 语义不明，调试困难**<br />使用了with关键字后，**JS引擎无法对这段代码进行优化**，js引擎无法分辨出作用域中的变量是全局变量还是当下的一个属性，执行时才能确定。因此，js引擎在遇到with关键字后，它就会对这段代码放弃优化，所以执行效率就降低。使用with关键字对性能的影响还有一点就是js压缩工具，它**无法对这段代码进行压缩**，这也是影响性能的一个因素。

```javascript
var obj = { a: 456 }
with (obj) {
  var a= 999;  // with会忽略var、const、let等,先在obj中查找，找不到再声明
  var b = 123;
}
console.log(obj); //{a:999}
console.log(b);   //123
```
with关联了obj对象，则其中的变量先在obj中查找看是否有同名属性，若有则就调用该对象下的同名属性进行赋值操作；若没有的话，则该变量声明为全局变量。<br />js引擎不知道 其中的变量到底是关联对象的属性 还是 全局变量，故不进行解析，语义不明。
```javascript
var obj = {
    x: 10,
    foo: function () {
        with (this) {
            var x = 20;
            var y = 30;
            console.log(y);//30
        }
    }
};
obj.foo();
console.log(obj.x);//20
console.log(obj.y);//undefined
```
这段代码，this的指向是obj，变量提升 x和y的声明提到了函数的顶部，因此在with代码块中可以通过x变量直接访问obj的x属性，故可以完成赋值操作。  由于obj中没有y属性，故y被定义为foo函数的局部变量( 查找局部变量y，设置为30 )。 


<a name="RvsRq"></a>
##  48. 面试题
```javascript
const aaa = 'global1';
var bbb='global2';
let ccc='global3';
let obj = {
  aaa: 'scope',
  fn: () => {
    console.log(this.aaa); //undefined
    console.log(this.bbb); //global2
    console.log(this.ccc); //undefind
    console.log(this);  //window
  }
}
obj.fn();  
// 重点： 箭头函数不绑定this	 let、const声明的全局变量不绑定在window上
```
fn是一个箭头函数，它其中的this就是定义它作用域下的this，对象不产生执行上下文，故箭头函数中的this指向window。  <br />**let、const在全局声明的变量不存储在window中**，即声明的变量不绑定在window中，故this.aaa  获取不到变量值，输出undefind； **在全局中var声明的变量和function创建的函数会绑定在window当中**，故可以通过this获取得到。<br />**结论：在全局中let、const声明的变量不绑定在window当中，var声明的变量和function创建的函数会绑定在window当中。**

**let、const声明的变量存储在哪？**<br />在全局作用域中，用 let 和 const 声明的全局变量并没有在全局对象window中，**在一个块级作用域中**，let、const会产生块级作用域，可以通过变量名直接进行访问。

**var、let、const的其他区别：**<br />1. var声明变量存在变量提升，let和const不存在变量提升，实际提升了，但是因为暂时性死区所以无法访问。<br />2. let和const声明形成块作用域，var变量提升不会形成作用域<br />3. 同一作用域下let和const不允许重复声明，否则会报错，而var可以<br />4. var和let可以可以修改声明的变量，const不可以，若是引用数据，则可以更改其内部的数据，只要内存地址不变就行。<br />5. let 和 const 定义的变量在定义之前调用，会抛出错误(形成了暂时性死区)，而 var 不会。<br />6. var 和 let 声明的时候可以不初始化赋值，const声明时必须赋值，否则会报错。

<a name="jLnls"></a>
##  49. flex的三个参数
flex属性 是** flex-grow**、**flex-shrink**、**flex-basis**三个属性的缩写。<br />**flex-grow：定义项目的的放大比例；**

- 默认为0，即 即使存在剩余空间，也不会放大；
- 所有项目的flex-grow为1：等分剩余空间（自动放大占位）；
- flex-grow为n的项目，占据的空间（放大的比例）是flex-grow为1的n倍。

**flex-shrink：定义项目的缩小比例；**

- 默认为1，即 如果空间不足，该项目将缩小；
- 所有项目的flex-shrink为1：当空间不足时，缩小的比例相同；
- flex-shrink为0：空间不足时，该项目不会缩小；
- flex-shrink为n的项目，空间不足时缩小的比例是flex-shrink为1的n倍。

**flex-basis： 定义在分配剩余空间之前，项目占据的主轴空间（main size），浏览器根据此属性计算主轴是否有剩余空间。**

- 默认值为auto，即 项目原本大小；
- 设置后项目将占据固定空间。

所以flex属性的默认值为：0 1 auto （不放大会缩小）<br />flex为none：0 0 auto （不放大也不缩小）<br />flex为auto：1 1 auto （放大且缩小）

flex：1 即为flex-grow：1，经常用作自适应布局，将父容器设置display：flex，侧边栏大小固定后，将内容区flex：1，内容区则会自动放大占满剩余空间。


<a name="PyVE0"></a>
##  50. display:none、visibility:hidden、opacity:0的区别
1. display:none：不生成盒子，会让元素从渲染树上消失，可以达到隐藏元素的效果，隐藏后不占据空间，它会产生重排和重绘。<br />2. visibility：hidden：对元素内容进行隐藏，只是视觉上看不到了，实际仍然占据着原来空间，当前元素与其后代元素都会被隐藏，子元素继承该属性。可以通过设置子元素visibility:visible 使子元素显示出来，<br />3. opacity：0 ：该元素透明度为0,也只是视觉上看不到了，实际还占用空间，当前元素与其后代元素都会被隐藏，但是不能通过设置子元素opacity: 0使其重新显示。<br />4. rgba（0,0,0,0）：当前元素透明度为0，与opacity：0一样，只是子元素不会被隐藏。<br />5. overflow：hidden：对溢出当前元素区域的内容进行隐藏。


<a name="R1FPc"></a>
##  51. 值得深思的题
```javascript
let p1 = () => {
  return new Promise((resolve, reject) => {
    resolve('1')
    console.log(1);
  })
}
let p2 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('2')
      console.log(2);
    }, 100)
  })
}
let p3 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('3')
      console.log(3);
    })
  })
}
let arr = [p2, p3]
let res = arr.reduce((pre, cur) => {
  return pre.then(() => {
    //情况1：带有return  
    return cur()
    //情况2：不带有return
    cur()
  })
}, p1())

res.then(() => {
  console.log('end');
})
//输出
//情况1：  1 2 3 'end'
//情况2：  1 'end' 3 2
```
p1、p1、p3都是函数里面返回Promise，p2和p3 的Promise内部有定时器(异步)，p2定时器的时间大于p3。<br />reduce中，p1的Promise先使用then获取执行结果，然后在then中执行p2函数，并且return p2的Promise，Promise的then()方法返回的是一个Promise，如果在Promise内部在执行onFulfilled 或 onRejected回调时，该回调有返回值(return xx)，**如果是普通值**，则直接改变当前then返回Promise的执行态(resolve(xx))，以便下一个then可以获取到该值。 <br />**如果是Promise**，则内部使用then方法获取到它的终值或拒因，然后再改变当前then返回Promise的执行态( resolve(终值/拒因) )，以便下一个then能获取到return Promise中的值。上述这个过程就是**then穿透**。<br />**情况1: **由于pre.then()里面返回Promise，则Promise内部会调用then方法，等待return 的Promise执行状态改变，具有了终值或拒因，然后再改变当前then返回Promise的执行态，<br />才会继续往下执行代码。 则p2和p3会按照顺序执行，当reduce执行完毕，返回的还是Promise，然后再执行res.then，输出 end.

reduce做的就是p1、p2、p3的迭代then。 通过迭代then，控制Promise的执行顺序。

```javascript
p1().then(()=>{  //调用p1时，里面执行console.log(1),输出1
    //Promise内部会等待返回的promise拥有结果(即执行态改变),然后then再返回Promise
    //故要等待p2中Promise的异步代码执行结束,且外部调用了resolve/reject改变了返回Promise的执行态
    //代码才继续向下执行
    return p2()  
})
.then(()=>{
    return p3() //同理,输出3
})
.then(()=>{
   console.log('end')    
})
```

**情况2**：由于pre.then()当中是函数的调用，并没有return 函数返回的Promise。则调用函数时，Promise中的代码为异步任务(定时器)，pre.then返回的还是Promise，该Promise的结果为undefined(内部调用resolve(undefined))。调用then时，无需等待直接返回Promise，后续pre.then() 并没有意义，因为then()中返回的是undefined( 没有return，默认返回undefined )，则 then穿透实际无意，每次在then中构造Promise，由于Promise中的代码是定时器，它们是宏任务，而最后一个.then() 是微任务，所以优先执行，故输出 'end'，再根据定时器的时间，输出3 2。

情况2相当于如下： 
```javascript
p1().then(()=>{  //p1执行,输出1
    //遇到new Promise,Promise中的代码默认是同步代码,故直接执行
    //执行过程发现promise中的代码是定时器,属于宏任务，则添加到宏任务队列
    new Promise((resolve)=>{    
        setTimeOut(()=>{console.log(2)},300)
    })
})
.then(()=>{
   new Promise((resolve)=>{
         setTimeOut(()=>{console.log(3)})
     })
})
//执行微任务
.then(()=>{
   console.log('end')   
})
```

**验证：**
```javascript
//代码1：
let p1 = new Promise((resolve, reject) => {
  resolve(1)
})
p1.then((data) => {
  console.log(data);
  //return 的Promise未改变执行态
  return new Promise((resolve, reject) => {  }) 
}).then((data) => {
  // 这两个永远不会输出，因为上述始终promise始终是pending
  console.log(data);
  console.log(3);
})
//输出: 1  

//代码2：
let p1 = new Promise((resolve, reject) => {
  resolve(1)
})
p1.then((data) => {
  console.log(data);
  //return 的Promise调用resolve,改变了执行态
  return new Promise((resolve, reject) => { resolve(2) }) 
}).then((data) => {
  console.log(data);
  console.log(3);
})
//输出: 1 2 3
```
上述代码验证了，then中return promise，则Promise的内部要使用then方法获取到它的终值或拒因，然后再改变当前then返回Promise的执行态( resolve(终值/拒因) )，以便下一个then能获取到return promise中的值。 <br />**若return 的promise不改变执行态，没有终值或拒因，则Promise内部使用then便获取不到该promise的结果，代码会一直卡在这个地方**，除非return promise的执行态改变了，能拿到它的终值或拒因，则then才会返回Promise，代码才会向下继续执行。


<a name="az0Tf"></a>
##  52. 手写reduce
![image.jpeg](https://cdn.nlark.com/yuque/0/2021/jpeg/12388054/1611892280759-946bfffa-22d9-43e2-84f2-a94840d7da6e.jpeg#averageHue=%23fefdfc&crop=0&crop=0&crop=1&crop=1&height=683&id=y5Vrh&name=image.jpeg&originHeight=683&originWidth=1018&originalType=binary&ratio=1&rotation=0&showTitle=false&size=478771&status=done&style=none&title=&width=1018)<br />思路：遍历数组，然后执行传入的回调函数，并将回调函数的返回值作为下次执行回调的第一个参数，当遍历结束后，然后再将最后一次执行的返回值作为终值 返回出去即可。<br />注意：要区分拥有initialValue 和不拥有的情况，拥有的话，则遍历从第一个元素开始，initialValue作为 accumulator；若不拥有的话，则数组中第一个元素作为accumulator，遍历从第二个元素开始。
```javascript
Array.prototype.reduce1 = function (fn, init) {
      if (typeof fn !== 'function') {
        throw new TypeError('第一个参数必须为函数')
      }
      //this指向方法的调用者,即数组实例
      if (!Array.isArray(this)) {
        throw new TypeError('该方法的只能用于数组')
      }
      let index = 0
      //判断是否传入初值
      //当没有传入初值,则令数组中的第一个元素为初值,current为第二个元素
      if (init == 'undefined') {
        index = 1
        init = this[0]
      }
      //累加器的值
      let accumulator = init
      //遍历
      for (let i = index; i < this.length; i++) {
        //拿到返回值,再作为下一次调用的第一个参数
        accumulator = fn(accumulator, this[i], i, this)
      }
      //遍历完,将最后一次执行fn的返回值作为终值返回出去
      return accumulator
    }
```

<a name="Thf46"></a>
##  53. JS执行输出问题
```javascript
function fn1() {
    console.log(a);
    // 没有用关键字声明变量，它是一个全局变量,不属于在作用域中，不存在变量提升
    a = 1;
}


function fn2() {
    a = 1;
    console.log(a);
}

function fn3() {
    console.log(a);
    // 变量提升
    var a = 1;
}

fn1(); // 报错,a is not defined
fn2(); // 1
fn3(); // undefined
```
```javascript
var foo = 1;

function foo(){}

console.log(foo); // 1

// 预解析
function foo();
var foo;
foo =1;
console.log(foo);
```
在作用域中存在变量(函数提升)，函数提升优于变量。

```javascript
console.log(foo); // [Function: foo]

var foo = 1;

function foo(){
};

console.log(foo); // 1

// 预解析
function foo();
console.log(foo);
var foo;
foo = 1;
console.log(foo);
```
变量提升的规则如下：<br />**函数提升优先于变量声明，当变量声明提升时，发现变量名和函数名相同，则不会覆盖函数名。**

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1648455903432-4840d998-3586-4d86-a94e-607a615c1021.png#averageHue=%23fefefe&clientId=ueade5e5e-5399-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=505&id=u9dd480b2&margin=%5Bobject%20Object%5D&name=image.png&originHeight=505&originWidth=945&originalType=binary&ratio=1&rotation=0&showTitle=false&size=74306&status=done&style=stroke&taskId=u9a78ae4e-dbd6-4791-8308-72358e0d2bb&title=&width=945)
```javascript
console.log(foo); // foo(){return 2}

function foo() {
  return 1;
}
console.log(foo); // foo(){return 2}

var foo = 1;

function foo() {
  return 2;
}

console.log(foo); // 1

// 预解析
function foo() {
  return 1;
}

function foo() {
  return 2;
}

console.log(foo); 
console.log(foo); 

var foo;
foo = 1;

console.log(foo); 
```
**当函数声明提升时，发现已存在相同的函数名称，则会覆盖。**

<a name="Rd6fi"></a>
##  54. 函数参数传递方式
JS中函数参数传递是 **值传递**，当实参为基本数据类型时，传递的是**值的副本**，当实参为引用类型时，传递的是**引用的副本**，也称为**共享传递**。<br /> 虽然想传递的是引用副本，引用的对象是同一个，指向同一个对象，修改对象中的属性值时，实参的属性值同步更新。 但如果直接修改参数时，由于是引用的副本，故不会影响实参。

**按引用传递(**call by reference)，函数的形参接收实参的隐式引用，而不再是副本。这意味着函数形参的值如果被修改，实参也会被修改。同时两者指向相同的值。<br />[https://segmentfault.com/a/1190000005794070](https://segmentfault.com/a/1190000005794070)


<a name="AvBtO"></a>
##  55. 关于原型链的题
```javascript
function Foo() {
}

Object instanceof Object // true
Function instanceof Function // true
Function instanceof Object // true
Foo instanceof Foo // false
Foo instanceof Object // true
Foo instanceof Function // true
```
instanceof 的原理是 判断左边的的__proto__是否等于右边的prototype，若不相等左边顺着__proto__向上查找，再判断是否相等，直至查找到null为止。

Object、Arrary、Boolean等都是构造函数，本质上就是函数，而函数又是对象，故拥有__proto__成员的。而Function是所有函数的构造函数，故有如下：
```javascript
Object.__proto__ == Function.prototype; // true
Arrary.__proto__ == Function.prototype; // true
String.__proto__ == Function.prototype; // true

// Function也是一个函数,故如下还是成立
Function.__proto__ == Function.prototype; // true

// Foo的构造函数是Function,故如下成立
Foo.__proto__ == Function.prototype; // true
// 如上成立，故如下不成立
Foo.__proto__ == Foo.prototype; // false
```
<a name="x3qph"></a>
##  56. JSON.stringify
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1648567060583-1cf2b2f9-00a2-4e07-a6ae-e77ef7740d2e.png#averageHue=%23fafbfb&clientId=uff439712-3777-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=2876&id=u32c1b532&margin=%5Bobject%20Object%5D&name=image.png&originHeight=3164&originWidth=2148&originalType=binary&ratio=1&rotation=0&showTitle=false&size=2893198&status=done&style=none&taskId=u12364385-5c18-4d7b-8266-712c73ad430&title=&width=1952.7272304030498)

<a name="EOWAh"></a>
##  57. v8垃圾回收机制
[https://juejin.cn/post/6844904016325902344](https://juejin.cn/post/6844904016325902344)<br />补充：在看上面文章时，搞不懂为啥**可达性**算法可以解决 **引用计数**不能解决的循环引用问题**。**<br />可达性是从根结点出发，能访问得到的对象标记为“活动的”，通过判断对象能否链接到根对象，如果一个对象从根对象不可达(无法访问到)，那么它就应该被回收。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1648626328637-6c728ab6-e11c-40a2-97a3-b2c413fd97e0.png#averageHue=%23fefefd&clientId=u4724859e-5fd8-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=872&id=u5ad0df8d&margin=%5Bobject%20Object%5D&name=image.png&originHeight=959&originWidth=874&originalType=binary&ratio=1&rotation=0&showTitle=false&size=473307&status=done&style=none&taskId=uc58e4376-1c92-4c9e-b917-dfdb4199c5c&title=&width=794.545437324146)[内存回收机制](https://learn.lianglianglee.com/%E4%B8%93%E6%A0%8F/%E9%87%8D%E5%AD%A6%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F-%E5%AE%8C/27%20%20%E5%86%85%E5%AD%98%E5%9B%9E%E6%94%B6%E4%B8%8A%E7%AF%87%EF%BC%9A%E5%A6%82%E4%BD%95%E8%A7%A3%E5%86%B3%E5%86%85%E5%AD%98%E7%9A%84%E5%BE%AA%E7%8E%AF%E5%BC%95%E7%94%A8%E9%97%AE%E9%A2%98%EF%BC%9F.md)

下面这个就存在循环引用，如果垃圾回收采用“引用计数”，那么a和b的引用数始终为1，当函数出栈时，函数作用域不会被释放，不会回收a和b两个对象，导致它们在内存中永驻，“**内存泄漏**”。<br />采用“可达性”算法的话，因为无法从根对象访问得到 a和b，所以它们不会被标记，会被回收。
```javascript
function foo() {
    let a = {};
    let b = {};
    a.a1 = b;
    b.b1 = a;
}
foo();
```
如下在全局声明两个对象，这两个对象也存在循环引用，但是它们是全局对象，默认挂在window上的，window.o1 、window.o2， 所以对于全局变量是永远不会被回收的。 这里不被回收的原因是它们是全局变量，而不是循环引用，跟算法无关。
```javascript
const o1 = {
  a:o2
}
const o2 = {
  a:o1
}
```

<a name="EvJjG"></a>
##  58. Service Workers
serviceWorker是**为了解决网页应用离线无法使用的问题**，通过serviceWorker将脚本文件注册缓存在浏览器里，离线时，依旧可以进行访问，类似与原生app离线访问。serviceWorker是一个独立的线程，不能访问DOM。

<a name="bqp13"></a>
##  59.什么是polyfill
Polyfill是一个js库，主要抚平不同浏览器之间对js实现的差异，用来为浏览器提供它没有原生支持的较新的功能、语法，用来兜底的。 

<a name="CIHSh"></a>
##  60. ast
ast是抽象语法树，对源代码进行抽象而形成的树状结构，用来表示代码语法结构。 <br />生成ast语法树分为两步，1. 词法分析，将代码分割为token数组， 2. 语法分析，将token数组转为语法树。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1648913620036-09f92231-e512-430a-9697-ff6322e63124.png#averageHue=%23f5f5f4&clientId=uca709b80-432b-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=3456&id=ub96eb81a&margin=%5Bobject%20Object%5D&name=image.png&originHeight=4320&originWidth=1812&originalType=binary&ratio=1&rotation=0&showTitle=false&size=3068552&status=done&style=none&taskId=u4114fd62-851b-432a-a1d8-6d9e7379325&title=&width=1449.6)

<a name="VSXYw"></a>
##  61. babel原理
babel用来进行语法转化的，比如将浏览器不支持的语法转为浏览器支持的。<br />它内部主要做了这些：

1. 将源代码转为ast语法树
2. 对ast进行遍历，执行特定的逻辑对节点进行增删改查
3. 将ast语法树再转为代码

之前手写webpack时，其中parse方法就是一个简易的babel原理。先利用babylon将源代码转为ast，然后使用traverse遍历语法树，将`require`替换为`__webpack_require__`，再使用generator将其转为js 代码。
```javascript
 let ast = babylon.parse((source))
    //使用traverse遍历ast语法树
    traverse(ast, {
      //当源码执行表达式时会触发CallExpression(),如require()、console.log()都会触发这个访问函数
      //若源代码中分别执行一次require()、console.log(),则它们都会触发CallExpression(),该函数执行两次
      CallExpression (p) {
        //p.node可以拿到对应的节点
        let node = p.node
        //对引用模块进行处理
        if (node.callee.name == 'require') {
          //将 'require' 替换 为  '__webpack_require__'
          node.callee.name = '__webpack_require__'
          //获取模块名,即require()中引入的路径/文件名
          let moduleName = node.arguments[0].value
          //源码中存在引用文件时,没加后缀,这一步是判断是否有后缀,没有的话添上
          moduleName = moduleName + (path.extname(moduleName) ? '' : '.js')
          //将引用的路径'./a'转换为模块名所要求的形式 './src/a.js' 
          //path.join拼接路径,会删掉 'src'前面的'./',故要手动加上
          moduleName = './' + path.join(parentPath, moduleName)
          //将改造后的模块名 存入到依赖列表
          dependencies.push(moduleName)
          //节点替换  types创建新节点替换掉原节点; StringLitral：字符串类型的节点
          node.arguments = [types.StringLiteral(moduleName)]
        }
      }
    })
    //将替换节点后的ast语法树 转换为源码
    let sourceCode = generator(ast).code
    return sourceCode;
```
[https://bobi.ink/2019/10/01/babel/](https://bobi.ink/2019/10/01/babel/)

<a name="vjmQ5"></a>
##  62.BigInt
在js中Number能表达的最大数字为`Number.MAX_SAFE_INTEGER`，即2^53 - 1  。<br />而`BigInt`可以表示任意大的整数。<br />当涉及大数比较大小时可以用BigInt，然后调用toString()方法将bigInt转为字符串。

<a name="U0zOh"></a>
##  63.sort
这里主要写sort返回值对排序的影响：<br />sort从左到右遍历元素，a为b的前一个元素，若返回值为负数，则保持原位 a在b之前，若返回值为正数，则要交换位置，a在b之后。


<a name="zAzkn"></a>
##  64. 中断promise
> 一个promise里有请求，请求超过三秒后，就中断promise，写个通用方法，由外部决定何时终止。

**这里是中断而不是终止，因为 Promise 无法终止。**这个中断的意思是：在合适的时候，把 pending 状态的 promise 给 reject 掉，提前让promise的状态发生迁移，我们不再关心的它请求的结果了，请求并不会被终止掉。<br />例如一个常见的应用场景就是希望给网络请求设置超时时间，一旦超时就就中断，我们这里用定时器模拟一个网络请求。
```javascript
// 模拟请求
const request = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("请求成功啦");
    }, 3000);
  });
};

```
**基础版本：**<br />实现个包装函数，传入超时时间，到达时间后，提前将包装函数的promise状态迁移，实际上请求的promise还在，只是包装函数返回的promise有了reject拒因。<br />**原理：**promise的状态是不可逆的，通过函数包装promise，在函数内有另外一个promise和传入的promise来竞争(`Promise.race`)。只需要将内部promise的状态改变即可，就可以实现中断promise，实际上中断的是包装函数返回的promise。
```javascript
function timeoutWrapper(request, timeout = 1000) {
  const wait = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject("请求超时");
    }, timeout);
  });
  return Promise.race([request(), wait]);
}

// 使用
timeoutWrapper(request).then(
  (d) => {
    console.log(d);
  },
  (e) => {
    console.log(e);
  }
);
```
不过这种方式并不灵活，因为终止 promise 的原因可能有很多，例如当用户点击某个按钮或者出现其他事件时手动终止。所以应该写一个包装函数，提供 abort 方法，让使用者自己决定何时终止。**在外部可以调个方法,来中断这个promise。**
```javascript
function abortWrapper(request) {
  let abort;
  // 将reject方法通过闭包传出去,在外部来调用,让promise的状态迁移到Rejected
  let p1 = new Promise((resolve, reject) => (abort = reject));
  let p = Promise.race([request(), p1]);
  p.abort = abort;
  return p;
}

// 使用
const p = abortWrapper(request);
p.then(
  (d) => {
    console.log(d);
  },
  (e) => {
    console.log(e);
  }
);

setTimeout(() => {
  p.abort("请求失败了");
}, 2000);

```


<a name="jxN1F"></a>
##  65. `.d.ts`可以被编译吗？
`**.d.ts**`**文件的作用：**<br />“d.ts”文件用于为 TS 提供有关用 JS 编写的 API 的类型信息。简单讲，就是你可以在 ts 中调用的 js 的声明文件。TS的核心在于静态类型，我们在编写 TS 的时候会定义很多的类型，但是主流的库都是 JS编写的，并不支持类型系统。这个时候你不能用TS重写主流的库，这个时候我们只需要编写仅包含类型注释的 d.ts 文件，然后从您的 TS 代码中，可以在仍然使用纯 JS 库的同时，获得静态类型检查的 TS 优势。<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650684427642-33a55b1f-9c82-4eea-9d3b-aae0629acb6b.png#averageHue=%23a5a5a5&clientId=ua622b26f-301b-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=290&id=udf9858f2&margin=%5Bobject%20Object%5D&name=image.png&originHeight=362&originWidth=916&originalType=binary&ratio=1&rotation=0&showTitle=false&size=46367&status=done&style=none&taskId=u5094d092-7fe5-417a-a2b5-5feebeeb2b1&title=&width=732.8)<br />`d.ts`文件不包含任何实现，**所以根本不编译为JS**，它只是给JS暴露的API进行类型定义。

**如果在.d.ts写枚举会被编译吗？**<br />这是问题是一个坑，首先枚举肯定会被编译为对象，其次在`.d.ts`文件当中也是可以定义枚举的。但是我们在文件中是无法引入`.d.ts`文件的，`.d.ts`这个文件是用来跟`同名js文件`暴露的API提供类型解释的。 <br />所以它压根不能被引入到文件中去，也不允许引入，所以也不管你是否在`.d.ts`中写枚举了。


<a name="WdkBt"></a>
##  66. 如何优化太多if-else代码

1. if中提前return，去除不必要的else；
2. 按需使用三目运算符和switch-case；
3. 合并条件表达式，很多if-else的条件是可以合并的；
4. 对于那些`if(key) return value`的代码，可以用枚举或者map来优化；
5. 使用`策略模式`，其实在js里，面向对象的写法并不多。所以策略模式的应用，可以维护一个对象(key value)的形式，key就是具体的条件，value则是回调函数，里面是具体的执行逻辑。 key不同则策略不同，策略不同有不同的处理方法，命中具体策略，执行具体的逻辑。


<a name="lHgwf"></a>
##  67. 什么是前端工程化
前端工程化的基础是建立在`前后端分离`之上的，这样前端才可以单独的作为一个工程。
<a name="hmJP5"></a>
##  68.如何实现前端工程化呢？

1. **使用webpack等打包工具，对项目进行构建编译。**

构建，简单来说就是编译，前端开发的所有文件最终归属是要交给浏览器去解析、渲染，并将页面呈现给用户，构建就是**将前端开发中的所有源代码转化为宿主浏览器可以执行的代码**。前端构建产出的资源文件只有三种，HTML、CSS、JS文件。 主要使用babel对js进行编译，对css进行预编译。

2. ** 模块化开发**

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650698181509-32fa4938-74a7-4507-bcf0-b4be58a242bf.png#averageHue=%23f5f5f5&clientId=u6de2a63d-21dd-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=184&id=uf9bc10c9&margin=%5Bobject%20Object%5D&name=image.png&originHeight=250&originWidth=970&originalType=binary&ratio=1&rotation=0&showTitle=false&size=52300&status=done&style=none&taskId=uf58e0772-ee6d-4f71-b67b-803bcc5c2b7&title=&width=714)

3. **组件化开发**

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650698287086-bd16e1b4-5135-4639-adc7-386fce9cc398.png#averageHue=%23e3e3e3&clientId=u6de2a63d-21dd-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=145&id=u023347ac&margin=%5Bobject%20Object%5D&name=image.png&originHeight=179&originWidth=945&originalType=binary&ratio=1&rotation=0&showTitle=false&size=69981&status=done&style=none&taskId=uac8be708-f75c-4a20-9fc7-412b48db25b&title=&width=767)

4. **规范化约束**

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650698450431-079629a4-b1ef-4c51-a9b6-98235b3df452.png#averageHue=%23e0e0e0&clientId=u6de2a63d-21dd-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=172&id=u792d271a&margin=%5Bobject%20Object%5D&name=image.png&originHeight=225&originWidth=998&originalType=binary&ratio=1&rotation=0&showTitle=false&size=99006&status=done&style=none&taskId=u6f5c946c-1a09-4e50-8e7d-b9fb969f04e&title=&width=764.2000122070312)<br />具体的落地实现是eslint相关。

5. **项目部署流程化**

![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650698619435-35d94e34-98ff-40f2-b3e3-bb80b087d451.png#averageHue=%23dfdfde&clientId=u6de2a63d-21dd-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=191&id=u2b3f0dfb&margin=%5Bobject%20Object%5D&name=image.png&originHeight=242&originWidth=964&originalType=binary&ratio=1&rotation=0&showTitle=false&size=229027&status=done&style=none&taskId=ubb7743fb-b6f5-4b78-836c-e08e9aaca16&title=&width=762.6000061035156)<br />将打包生成的静态资源部署到目标服务器上。


<a name="tkIE6"></a>
##  69. 如何一次性渲染10w条列表数据？

- 虚拟列表
- 时间分片，fragment + requestAnimationFrame
- 懒加载

虚拟列表是只渲染视口高度的数据，始终只渲染视口里的dom。监听scroll事件，切换数据内容，将偏移的内容再移入到视口当中。 这样用户可以一直滚动，但是始终只是视口的dom在变化。<br />由于在操作DOM时，会引起重绘，如果DOM数量过多，那么重绘的成本太高了。所以虚拟列表仅仅渲染了视口高度的DOM，降低重绘的成本。可以在视口上方和下方都添加一些缓存列表，这样可以避免在滚动时出现百屏。

无论是虚拟列表还是懒加载，传统的做法是`scroll + 节流`，这种做法的优势是老 API，兼容性刚刚的，缺点是，滑多了还是会引起性能问题。<br />可以使用[IntersectionObserver](https://link.juejin.cn?target=https%3A%2F%2Fdeveloper.mozilla.org%2Fzh-CN%2Fdocs%2FWeb%2FAPI%2FIntersectionObserver)替换监听scroll事件，`IntersectionObserver`可以监听目标元素是否出现在可视区域内，在监听的回调事件中执行可视区域数据的更新，并且`IntersectionObserver`的监听回调是**异步触发，不随着目标元素的滚动而触发，性能消耗极低。**<br />[https://juejin.cn/post/6844903982742110216](https://juejin.cn/post/6844903982742110216)<br />[https://segmentfault.com/a/1190000041415120](https://segmentfault.com/a/1190000041415120)

<a name="pnlrr"></a>
##  70. 懒加载
![image.png](https://cdn.nlark.com/yuque/0/2022/png/12388054/1650728323409-17ffb43e-82b1-42c1-8473-3c5c5ba48d44.png#averageHue=%23e7e7e6&clientId=ubfa14836-9fab-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=529&id=u46685b1a&margin=%5Bobject%20Object%5D&name=image.png&originHeight=661&originWidth=966&originalType=binary&ratio=1&rotation=0&showTitle=false&size=371852&status=done&style=none&taskId=u19986caf-34f8-4f33-bd1e-c1bdab2798e&title=&width=772.8)懒加载主要是指延迟加载图像，适用于图片较多的场景。可以减少首次渲染的请求数，减少服务器负载。 当图片出现在视口中时，再给图片添加src，让其发起请求，获取图片资源。<br />[https://juejin.cn/post/6844903614138286094](https://juejin.cn/post/6844903614138286094)

所以懒加载和虚拟列表还是有区别的，懒加载是为了减少请求数，虚拟列表是为了降低重绘带来的性能消耗，始终渲染视口高度的DOM，然后始终让渲染区域保持在视口当中。

<a name="Tfja3"></a>
##  70. csrf-token
因为第三方网站冒用了用户cookie代替用户发送了请求，实施了攻击。 所以采用token来解决csrf攻击，服务端会生成token，然后将token种在前端的cookie中。当请求发送到服务端时，会比较客户端的token和服务端的token是否相等，来判断该请求是否合法。<br />**那么问题来了**，既然cookie可以被第三方网站冒用(无法直接获取其内容)，那么为什么还要把tooken放到cookie中呢？ <br />其实在客户端发请求时，会有个统一处理步骤，**获取cookie中的内容取出token，然后将token放在header中**，服务端会获取header中的token来进行对比，cookie中的token仅仅起个存储作用，方便服务端塞入。


<a name="vSfdX"></a>
  <br />

