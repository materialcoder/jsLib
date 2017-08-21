//前台调用
var $ = function(args) {
	return new Base(args);
}

//基础库
function Base(args) {
	//创建一个数组，用来保存获取的节点和节点数组
	this.elements = [];
	if(typeof args == "string") {
		//CSS模拟 $('#box p .a')
		if(args.indexOf(" ") != -1) {
			var elements = args.split(" "); //把节点拆开分别保存到数组里
			var childElements = [];         //存放临时节点对象的数组,解决被覆盖的问题
			var node = [];                  //存放父节点
			for(var i=0;i<elements.length;i++) {
				if(node.length == 0) node.push(document); //如果默认没有父节点，则传入document
				switch(elements[i].charAt(0)) {
					case "#":
						childElements=[];
						childElements.push(this.getId(elements[i].substring(1)));
						node = childElements; //新查找到的节点作为下一个查找节点的父节点
						break;
					case ".":
						childElements = [];
						for(var j=0;j<node.length;j++) {
							var temps = this.getClass(elements[i].substring(1),node[j])
							for(var k=0;k<temps.length;k++) {
								childElements.push(temps[k]);
							}
						}
						node = childElements;
						break;
					default:
						childElements = [];
						for(var j=0;j<node.length;j++) {
							var temps = this.getTagName(elements[i],node[j])
							for(var k=0;k<temps.length;k++) {
								childElements.push(temps[k]);
							}
						}
						node = childElements;

				}
			}
			this.elements = childElements;
		} else {
			//find模拟
			switch(args.charAt(0)) {
				case "#":
					this.elements.push(this.getId(args.substring(1)));
					break;
				case ".":
					this.elements = this.getClass(args.substring(1));
					break;
				default:
					this.elements = this.getTagName(args);
			}
		}
	} else if (typeof args == 'object') {
		if(args != undefined) { //arg是一个对象，undefined也是一个对象，区别与typeof返回的带引号的'undefined'
			this.elements[0] = args;
		}
	} else if (typeof args == 'function') {
		this.ready(args);
	}
}

Base.prototype = {

	//DOM加载
	ready: function(fn) {
		addDomLoaded(fn);
	},

	//获取ID节点,id永远是唯一的，因此不需要父节点
	getId: function(id) {
		return document.getElementById(id);
	},

	//获取元素节点
	getTagName: function(tag, parentNode) {
		var node = null;
		var temp = []
		if(parentNode != undefined) {
			node = parentNode;
		} else {
			node = document;
		}
		var tags = node.getElementsByTagName(tag);
		for(var i=0;i<tags.length;i++) {
			temp.push(tags[i]);
		}
		return temp;
	},

	//获取class节点
	getClass: function(className, parentNode) {
		var node = null;
		var temp = []
		if(parentNode != undefined) {
			node = parentNode;
		} else {
			node = document;
		}
		var all = node.getElementsByTagName('*');
		for(var i=0;i<all.length;i++) {
			if(all[i].className == className) {
				temp.push(all[i]);
			}
		}
		return temp;
	},

	//获取某一个节点，并返回这个节点
	ge: function(number) {
		return this.elements[number];
	},

	//设置CSS选择器子节点
	find: function(str) {
		var childElements = [];
		for(var i=0;i<this.elements.length;i++) {
			switch(str.charAt(0)) {
				case "#":
					childElements.push(this.getId(str.substring(1)))
					break;
				case ".":
					var temps = this.getClass(str.substring(1), this.elements[i])
					for(var j=0;j<temps.length;j++) {
						childElements.push(temps[j]);
					}
					break;
				default:
					var temps = this.getTagName(str, this.elements[i]);
					for(var j=0;j<temps.length;j++) {
						childElements.push(temps[j]);
					}
			}
		}
		this.elements = childElements;
		return this;
	},

	//获取某一个节点,并且返回Base对象
	eq: function(number) {
		var element = this.elements[number];
		this.elements = [];
		this.elements[0] = element;
		return this;
	},

	//获取首个节点，并返回这个节点对象
	first: function() {
		return this.elements[0];
	},

	//获取最后一个节点，并返回这个节点对象
	last: function() {
		return this.elements[this.elements.length - 1];
	},

	// 设置css样式
	css: function(attr, value) {
		for(var i=0;i<this.elements.length;i++) {
			//获取CSS样式值
			if(arguments.length==1) {
				return getStyle(this.elements[i],attr);
			}
			//设置css样式
			this.elements[i].style[attr] = value;
		}
		return this;
	},

	//添加class
	addClass: function(className) {
		for(var i=0;i<this.elements.length;i++) {
			if(this.elements[i].className) {
				if(!hasClass(this.elements[i],className)) {
					this.elements[i].className += " " + className;
				}
			} else {
				this.elements[i].className = className;
			}
		}
		return this;
	},

	//移除class
	removeClass: function(className) {
		for(var i=0;i<this.elements.length;i++) {
			if(hasClass(this.elements[i],className)) {
				this.elements[i].className = this.elements[i].className.replace(new RegExp('(\\s|^)'+className+'(\\s|$)')," ");
			}
		}
		return this;
	},

	//添加link或style中的CSS规则,很少用
	addRule: function(num,selectorText,cssText,position) {
		var sheet = document.styleSheets[num];
		insertRule(sheet,selectorText,cssText,position);
		return this;
	},

	//移除link或style中的CSS规则，很少用
	removeRule: function(num, index) {
		var sheet = document.styleSheets[num];
		deleteRule(sheet, index);
		return this;
	},

	//设置innerHTML
	html: function(str) {
		for(var i=0;i<this.elements.length;i++) {
			//获取innerHTML
			if(arguments.length == 0) {
				return this.elements[i].innerHTML;
			}
			//设置或更改innerHTML
			this.elements[i].innerHTML = str;
		}
		return this;
	},

	//设置鼠标移入移除事件
	hover: function(over, out) {
		for(var i=0;i<this.elements.length;i++) {
			addEvent(this.elements[i],'mouseover',over);
			addEvent(this.elements[i],'mouseout',out);
		}
		return this;
	},

	//设置显示
	show: function() {
		for(var i=0;i<this.elements.length;i++) {
			this.elements[i].style.display = "block";
		}
		return this;
	},

	//设置隐藏
	hide: function() {
		for(var i=0;i<this.elements.length;i++) {
			this.elements[i].style.display = "none";
		}
		return this;
	},

	//设置元素居中
	center: function(width, height) {
		var top = (getInner().height - height)/2;
		var left = (getInner().width - width)/2;
		for(var i=0;i<this.elements.length;i++) {
			this.elements[i].style.top = top + "px";
			this.elements[i].style.left = left + "px";
		}
		return this;
	},

	//锁屏功能
	lock: function() {
		for(var i=0;i<this.elements.length;i++) {
			this.elements[i].style.width = getInner().width + "px";
			this.elements[i].style.height = getInner().height + "px";
			this.elements[i].style.display = "block";
			document.documentElement.style.overflow = "hidden";
			/*addEvent(this.elements[i],'mousedown', function(e) {
				e.preventDefault();
				addEvent(document,'mousemove',function(e){
					e.preventDefault();
				})
			})*/

			addEvent(window, 'scroll',scrollTop);
		}
		return this;
	},

	//取消锁屏功能
	unlock: function() {
		for(var i=0;i<this.elements.length;i++) {
			this.elements[i].style.display = "none";
			document.documentElement.style.overflow = "auto";
			
			removeEvent(window,'scroll',scrollTop);
		}
		return this;
	},

	//绑定点击事件
	click: function(fn) {
		for(var i=0;i<this.elements.length;i++) {
			//this.elements[i].onclick = fn;
			addEvent(this.elements[i],'click',fn);
		}
		return this;
	},

	//触发浏览器窗口事件
	resize: function(fn) {
		for(var i=0;i<this.elements.length;i++) {
			var element = this.elements[i];
			addEvent(window,'resize', function() {
				fn();
				if(element.offsetLeft > getInner().width - element.offsetWidth) {
					element.style.left = (getInner().width - element.offsetWidth) + "px";
				}
				if(element.offsetTop > getInner().height - element.offsetHeight) {
					element.style.top = (getInner().height - element.offsetHeight) + "px";
				}
			})
		}
		return this;
	},

	//设置动画
	animate: function(obj) {
		for(var i=0;i<this.elements.length;i++) {
			var element = this.elements[i];
			
			var attr = obj['attr'] != undefined ? obj['attr'] : 'left'; //可选，不传默认为left
			var start = obj['start'] != undefined ? obj['start'] :
						attr=='opacity' ? parseFloat(getStyle(element,attr))*100 : parseInt(getStyle(element,attr)); //可选，默认为CSS的起始位置
			var time = obj['time'] != undefined ? obj['time'] : 50; //可选，默认每50毫秒执行一次
			var step = obj['step'] != undefined ? obj['step'] : 10; //可选，默认每次移动10px
			
			var alter = obj['alter'];
			var target = obj['target'];
			if(alter != undefined && target == undefined) {
				target = obj['alter'] + start;
			} else if(alter == undefined && target == undefined) {
				throw new Error('alter增量和target目标量必须填一个');
			}

			//var target = obj['alter'] + start;  //必选，增量，运行的目标点
			
			var speed = obj['speed'] != undefined ? obj['speed'] : 6; //可选，默认缓冲速度为6
			var type = obj['type'] == 0 ? 'constant' : obj[type] == 1 ? 'buffer' : 'buffer'; //可选，0表示匀速，1表示缓冲，默认缓冲

			if(attr == 'opacity') {
				element.style.opacity = start/100;
			} else {
				element.style[attr] = start + 'px';
			}

			if(start > target) {
				step = -step;
			}
			clearInterval(window.timer); //避免点击或其他事件触发动画时速度累加
			timer = setInterval(function() {
				if(type == 'buffer') {
					step = attr=='opacity' ? (target - parseFloat(getStyle(element,attr))*100)/speed : 
						   (target - parseInt(getStyle(element,attr)))/speed;
					step = step>0 ? Math.ceil(step):Math.floor(step);
				}
				if(attr == 'opacity') {
					if(step==0) {
						setOpacity();
					} else if(step > 0 && Math.abs(parseFloat(getStyle(element,attr))*100 - target) <= step) {
						setOpacity();
					} else if(step < 0 && (parseFloat(getStyle(element,attr))*100 - target) <= Math.abs(step)) {
						setOpacity();
					} else {
						var temp = parseFloat(getStyle(element,attr)) *100;
						element.style.opacity = parseInt(temp + step) /100;
					}
				} else {
					if(step==0) {
						setTarget();
					} else if(step > 0 && Math.abs(parseInt(getStyle(element,attr)) - target) <= step) {
						setTarget();
					} else if(step < 0 && (parseInt(getStyle(element,attr)) - target) <= Math.abs(step)) {
						setTarget();
					} else {
						element.style[attr] = parseInt(getStyle(element,attr))+step+"px";
					}
				}
				
				function setTarget() {
					element.style[attr] = target + 'px';
					clearInterval(timer);
				}

				function setOpacity() {
					element.style.opacity = parseInt(target)/100;
					clearInterval(timer);
				}
			}, time);
		}
		return this;
	}
	
}

//插件入口
Base.prototype.extend = function(name, fn) {
	Base.prototype[name] = fn;
}