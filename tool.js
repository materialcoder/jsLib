//浏览器检测
(function () {
	window.sys = {};   //让外部可以访问，保存浏览器信息对象
	var ua = navigator.userAgent.toLowerCase(); //获取浏览器信息字符串
	var s;  //浏览器信息数组：浏览器名称+版本
	(s = ua.match(/msie ([\d.]+)/) || ua.match(/rv:([\d.]+)/)) ? sys.ie = s[1]:
	(s = ua.match(/edge\/([\d.]+)/)) ? sys.edge = s[1]:
	(s = ua.match(/firefox\/([\d.]+)/)) ? sys.firefox = s[1] :
	(s = ua.match(/chrome\/([\d.]+)/)) ? sys.chrome = s[1] :
	(s = ua.match(/opera\/.*version\/([\d.]+)/)) ? sys.opera = s[1] :
	(s = ua.match(/version\/([\d.]+).*safari/)) ? sys.safari = s[1] : 0;

	if(/webkit/.test(ua)) {
		sys.webkit = ua.match(/webkit\/([\d.]+)/)[1];
	}
})();

//DOM加载
function addDomLoaded(fn) {
	var isReady = false;
	var timer = null;

	function doReady(fn) {
		if(timer) clearInterval(timer);
		if(isReady) return;
		isReady = true;
		fn();
	}

	if((sys.opera && sys.opera < 9) || (sys.firefox && sys.firefox < 3) || (sys.webkit && sys.webkit <525)) {
		//这么老的浏览器基本用不着
		timer = setInterval(function() {
			if(document && document.getElementById && document.getElementsByTagName && document.body) {
				doReady(fn);
			}
		},1);
	} else if(document.addEventListener) { //W3C
		addEvent(document,'DOMContentLoaded', function() {
			fn();
			removeEvent(document,'DOMContentLoaded',arguments.callee);
		});
	} else if(sys.ie && sys.ie < 9) {  //IE
		var timer = null;
		timer = setInterval(function() {
			try {
				document.documentElement.doScroll("left");
				doReady(fn);
			} catch(e) {}
		},1);
	}
}


/*
为每个事件添加一个计数器，实现累加，并且清晰地指出是传给addEvent用的
JS一切皆为对象
addEvent.ID = 1;
addEvent.ID++;
 */

//跨浏览器事件绑定
function addEvent(obj,type,fn) {
	if(typeof obj.addEventListener != 'undefined') {
		obj.addEventListener(type, fn, false);
	}/* else if(typeof obj.attachEvent != 'undefined') {
		obj.attachEvent('on'+type, function(){
			fn.call(obj, window.event); //解决低版本IE中this指向window问题，使用call将this指向obj，但之后又无法删除事件
		});
	}*/ else { //处理低版本IE事件中，多个事件不按顺序执行的问题
		//创建一个存放事件的哈希表（散列表）
		if(!obj.events) {
			obj.events = {};
		}

		//第一次执行时
		if(!obj.events[type]) {
			//创建一个存放事件处理函数的数组
			obj.events[type] = [];
			//把第一次的事件处理函数先存储到第一个位置上
			if(obj['on'+type]) obj.events[type][0] = fn;
		} else {
			//同一个注册函数进行屏蔽，不填加到计数器中
			if(addEvent.equal(obj.events[type],fn)) return false;
		}

		//第二次开始用事件计数器来按顺序存储事件函数
		obj.events[type][addEvent.ID++] = fn;
		//通过传统事件绑定方法，依次执行事件处理函数
		obj['on'+type] = addEvent.exec;
	}
}

//为每个事件分配一个计数器
addEvent.ID = 1;

//执行事件处理函数
addEvent.exec = function(event) {
	var e = event || addEvent.fixEvent(window.event);
	var es = this.events[e.type];
	for(var i in es) {
		es[i].call(this, e);
	}
}

//同一个注册函数进行屏蔽
addEvent.equal = function(es,fn) {
	for(var i in es) {
		if(es[i]==fn) {
			return true;
		} else {
			return false;
		}
	}
}


//把IE常用的Event对象匹配到W3C中去,相当于给IE中的event添加了两个方法
addEvent.fixEvent = function(event) {
	event.preventDefault = addEvent.fixEvent.preventDefault;
	event.stopPropagation = addEvent.fixEvent.stopPropagation;
	event.target = event.srcElement;
	return event;
}

//IE阻止默认行为
addEvent.fixEvent.preventDefault = function () {
	this.returnValue = false;
}


//IE阻止冒泡
addEvent.fixEvent.stopPropagation = function() {
	this.cancelBubble = true;
}

//跨浏览器删除事件绑定
function removeEvent(obj, type, fn) {
	if(typeof obj.removeEventListener != 'undefined') {
		obj.removeEventListener(type, fn, false);
	} else /*if(typeof obj.detachEvent != 'undefined') {
		obj.detachEvent('on'+type, fn);
	}*/ {
		if(obj.events) {
			for(var i in obj.events[type]) {
				if(obj.events[type][i] == fn) {
					delete obj.events[type][i];
				}
			}
		}
	}
}


//跨浏览器视口大小
function getInner() {
	if(typeof window.innerWidth != 'undefined') { //IE8及以下版本不支持innerWidth
		return {
			width: window.innerWidth,
			height: window.innerHeight
		}
	} else {
		return {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight
		}
	}
}


//跨浏览器获取style
function getStyle(element, attr) {
	if(typeof window.getComputedStyle != 'undefined') { //W3C
		return window.getComputedStyle(element,null)[attr];
	} else if(typeof element.currentStyle != 'undefined') {  //IE
		return element.currentStyle[attr];
	}
}

//判断class是否存在
function hasClass(element, className) {
	return element.className.match(new RegExp('(\\s|^)'+className+'(\\s|$)'))
}

//跨浏览器添加Rule规则
function insertRule(sheet,selectorText,cssText,position) {
	if(typeof sheet.insertRule != 'undefined') {
		sheet.insertRule(selectorText+'{'+cssText+'}',position); //W3C
	} else if (typeof sheet.addRule != 'undefined') {
		sheet.addRule(selectorText,cssText,position); //IE
	}
}

//跨浏览器移除link规则
function deleteRule(sheet, index) {
	if(typeof sheet.deleteRule != 'undefined') {
		sheet.deleteRule(index); //W3C
	} else if (typeof sheet.removeRule != 'undefined') {
		sheet.removeRule(index); //IE
	}
}


//删除左右空格
function tirm(str) {
	return str.replace(/(^\s*)(\s*$)/,'');
}

//禁止滚动
function scrollTop() {
	document.documentElement.scrollTop = 0;
	document.body.scrollTop = 0;
}