#通过 构造函数+原型的方式 实现部门树公用组件
##工具库为jquery


![image](https://github.com/superRzx/departmentTreeComponent/blob/master/img/design.png "效果图")

##如何使用
###组件初始化
```javascript
var opt = {
  data: dtTree.data,
  ele: $('.dt-list')
}
var dtLeft = new DepartmentTree(opt);

##api    
* `bindDbClick()` 是否需要支持双击编辑部门名称功能
* `inputBlur(cb)`  cb:传入回调函数，在绑定光标离开焦点事件的时候执行cb
* `deleteClk(cb)`  cb:传入回调函数，在点击删除按钮时执行的回调