/*//拖拽功能
拖拽的流程：
1.点下去
2.在点下的物体被选中，进行move移动
3.然后抬起鼠标，停止移动*/
/**
 * 拖拽功能函数
 * @param  {array} tags  可拖拽的节点数组
 * @return {object}       Base
 */
$().extend('drag', function() {
	var tags = arguments;
	for(var i=0;i<this.elements.length;i++) {
		addEvent(this.elements[i],'mousedown', function(e){
			//e.preventDefault(); //空div时IE中无法正常拖动
			if(tirm(this.innerHTML).length==0) {
				e.preventDefault();
			}
			var _this = this;
			var diffX = e.clientX - _this.offsetLeft;
			var diffY = e.clientY - _this.offsetTop;
			
			//自定义拖拽区
			var flag = false;
			for(var j=0;j<tags.length;j++) {
				if(e.target == tags[j]) {
					flag = true; //只要有一个使flag为true，就返回
					break;
				}
			}

			if(flag) {
				addEvent(document,'mousemove', move);
				addEvent(document,'mouseup', up);
			} else {
				removeEvent(document,'mousemove', move);
				removeEvent(document,'mouseup', up);
			}
			function move(e) {
				var left = e.clientX - diffX;
				var top = e.clientY - diffY;
				if(left < 0) {
					left = 0;
				} else if(left > (getInner().width - _this.offsetWidth)) {
					left = getInner().width - _this.offsetWidth;
				}

				if(top < 0) {
					top = 0;
				} else if(top > (getInner().height - _this.offsetHeight)) {
					top = getInner().height - _this.offsetHeight;
				}
				_this.style.left = left + "px";
				_this.style.top = top + "px";
				//鼠标锁住时触发；解决IE8及以下版本在拖出浏览器外部的时候还出现空白
				if(typeof _this.setCapture != 'undefined') {
					_this.setCapture();
				}
			}

			function up(e) {
				removeEvent(document,'mousemove',move);
				removeEvent(document,'mousemove',up);
				//鼠标释放时触发；解决IE8及以下版本在拖出浏览器外部的时候还出现空白
				if(typeof _this.releaseCapture != 'undefined') {
					_this.releaseCapture();
				}
			}
		});
	}
	return this;
});