// 创建一个Vue的构造函数,形参接收一个对象
function Vue(config) {
  // 触发生命周期钩子
  config.beforeCreate && config.beforeCreate();
  // 初始化阶段
  this.init(config);
}
Vue.prototype.init = function (config) {
  // 将config对象中的data属性赋值给实例对象，用于保存
  this.$data = this._data = config.data;
  // 对$data的值进行数据劫持
  this.DataHijacking(this.$data);
  // 对$data的值进行数据代理
  this.DataBroker();
  this.Compilation(config.el);
};
// 数据劫持函数
Vue.prototype.DataHijacking = function (DataObj) {
  // 使用Object.keys方法拿到$data中的键，返回是一个数组所以可以链式调用forEach
  Object.keys(DataObj).forEach((key) => {
    let val = DataObj[key];
    // 如果拿到的属性值是对象时就需要进行递归，确保所有数据都能劫持到
    if (typeof val === 'object') {
      this.DataHijacking(val);
    }
    // 拿到key后，使用Object.defineProperty对属性进行劫持，
    // 就是当用户每次访问实例对象的属性值都能让我们察觉
    Object.defineProperty(DataObj, key, {
      get() {
        /**
         *
         * 可写逻辑
         *
         *
         */
        return val;
      },
      set(newVal) {
        /**
         *
         * 可写逻辑
         *
         *
         */
        val = newVal;
      },
    });
  });
};
// 数据代理函数
Vue.prototype.DataBroker = function () {
  // 拿到$data上的所有键
  Object.keys(this.$data).forEach((key) => {
    // 代理:就是帮$data上的所有属性都给this加一遍
    let val = this.$data[key];
    Object.defineProperty(this, key, {
      get() {
        /**
         *
         * 可写逻辑
         *
         *
         */
        return val;
      },
      set(newVal) {
        /**
         *
         * 可写逻辑
         *
         *
         */
        val = newVal;
      },
    });
  });
};
// 模板编译
Vue.prototype.Compilation = function (el) {
  // 如果用户给的是选择器就获取节点，给的是节点就直接赋值
  if (typeof el === 'string') {
    this.$el = document.querySelector(el);
  } else {
    this.$el = el;
  }
  // 创建一个文档碎片，因为其的特性，使得我们可以在内存中进行DOM操作，优化了性能
  // 是可变的不能使用const接收
  let Fragment = document.createDocumentFragment();
  shear(this.$el, Fragment);
  // 调用打印一下Fragment
  // 将DOM已经存于内存，此时我们就可以对其进行操作，
  action(Fragment, this);
  // 调用完成后再一次打印看看Fragment
  // console.log(Fragment);
  // 将DOM重新渲染进文档中
  shear(Fragment, this.$el);
};
// sending 被剪切的
// receive 存放的
function shear(sending, receive) {
  // 因为不知Dom层级有多少，所有需要使用While循环
  // 打印一下属性,看看firstChild是啥
  // console.dir(sending);
  // 原Dom上的第一个子节点 切给存放的变量
  while (sending.firstChild) {
    // appendChild方法具有剪切作用，剪切：百度
    // 当sending.firstChild没有值时为一个null，假值，此时循环体结束
    // receive.appendChild(sending.firstChild);
    receive.appendChild(sending.firstChild);
    // 如果是第一次调用，这时你能看到DOM中你发在id为el—String的标签内的所有标签都不在页面上了
  }
}
function action(Fragment, ThisData) {
  // 预先编写好正则
  const reg = /{{(.*)}}/;
  //  拿到子节点数组
  // 数组是伪数组，保险起见给他换个壳
  // Array.from是一个静态方法，用于将类数组对象或可迭代对象转换为数组。
  //它接受一个类数组对象或可迭代对象作为参数，并返回一个新的数组。
  Array.from(Fragment.childNodes).forEach((item) => {
    // 如果为文本节点且匹配正则
    if (item.textContent && item.nodeType === 3 && reg.test(item.textContent)) {
      let textArr = reg.exec(item.textContent);
      // 使用reduce取得对应数据
      let val = textArr[1].split('.').reduce((previous, current) => {
        return previous[current];
      }, ThisData);
      // 使用replace方法对文本进行替换
      item.textContent = item.textContent.replace(textArr[0], val);
      // 打印看看效果,可以看到很完美的进行了替换
      // console.log(item.textContent);
    }
    if (item.childNodes && item.childNodes.length) {
      // 如果子节点还有，就递归
      action(item, ThisData);
    }
  });
}
