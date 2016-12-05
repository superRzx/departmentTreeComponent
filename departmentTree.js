/* 树形图 */
(function(){
  var defaultOpt = {
    data: '',
    ele: '',
    isDbClk: false,
    timer: null
  };
  /* 定义构造函数 */
  function DepartmentTree(opt) {
    var objOpt = $.extend(defaultOpt, opt);

    this.isDbClk = objOpt.isDbClk;  //是否支持双击修改名称
    this.originData = objOpt.data;  //存储原始数据
    this.parentNode = objOpt.ele;   // ele: 传入想要渲染的父级容器
    this.selectedNodeId = objOpt.data.id;    // 保存当前选中的节点id
    this.data = new Array(objOpt.data);   //将传入的数据保存进数组
    this.timer = null;
    this.init();
  }

  DepartmentTree.prototype = {

    //方法初始化
    init: function() {
      var _this = this;
      this.renderDepartmentTree(_this.parentNode, _this.data);
      this.treeStatusInit();
      this.eventHandler();
      if(this.isDbClk) {
        this.bindDbClick();
      }
      this.inputBlur();
      this.deleteClk();
    },

    // 根据传入的数据渲染整颗树
    renderDepartmentTree: function(ele, data) {
      var _this = this;
      if(data.length !== 0) {
        $.each(data, function(index, item) {
          var subItem = $('<div class="sub-item"></div>'),
            subTitle = $('<div class="sub-title"></div>').attr('propId', item.id),
            iconArrow = $('<i class="dt-icon-arrow"></i>'),
            iconFile = $('<i class="dt-icon-file"></i>'),
            subName = $('<span class="dt-name"></span>').html(item.name),
            spNum = $('<span class="sp-num"></span>').html('（<span class="sp-dt-num">' + item.num + '</span>人）'),
            subList = $('<div class="sub-list"></div>');

          if(item.departmentList.length !==0) {
            subTitle.append(iconArrow);
            _this.renderDepartmentTree(subList, item.departmentList);
          } else {
            iconFile.addClass('ml24');
          }

          subTitle.append(iconFile).append(subName).append(spNum);
          ele.append(subItem.append(subTitle).append(subList));
          
        })  
      }
      
    },

    treeStatusInit: function() {
      this.parentNode.find('.sub-title').eq(0).addClass('selected')
        .find('.dt-icon-file').removeClass('dt-icon-file').addClass('dt-icon-cp');

      //存入当前选中的节点  
      this.selectedDomNode = $('.sub-title').eq(0);

      //存入当前选中节点的id
      this.selectedNodeId = this.originData.id;
    },

    eventHandler: function() {
      var _this = this;

      var ACTIVE = 'active',
        SELECTED = 'selected',
        parentNode = this.parentNode;

      parentNode.off('click');

      parentNode.on('click', '.dt-icon-arrow', function(e) {
        e.stopPropagation();
        if($(this).hasClass(ACTIVE)) {
          $(this).removeClass(ACTIVE);
          $(this).parent().siblings('.sub-list').slideUp(200);
        } else {
          $(this).addClass(ACTIVE);
          $(this).parent().siblings('.sub-list').slideDown(200);
        }
      })

      //添加部门按钮
      $('.dt-btn-add').on('click', function() {
        var selectedDomNode = _this.selectedDomNode;
        var isHasArrow = selectedDomNode.find('.dt-icon-arrow');
        if(_this.selectedNodeId == -1) {
          _this.selectedDomNode.find('.dt-name-input').focus();
          //alert('请输入当前分类名称才可在当前分类下新建分类')
          return;
        }
        if(isHasArrow.length !== 0) {
          if(!isHasArrow.hasClass(ACTIVE)) {
            isHasArrow.trigger('click');
          }
        } else {
          var iconArrow = $('<i class="dt-icon-arrow"></i>');
          selectedDomNode.find('.ml24').removeClass('ml24');
          selectedDomNode.prepend(iconArrow);
          iconArrow.trigger('click');
        }
        _this.addDepartment(selectedDomNode);
      })

      //编辑部门按钮
      $('.dt-btn-edit').on('click', function() {
        var selectedDomNode = _this.selectedDomNode;
        var dtName = selectedDomNode.find('.dt-name');
        var subNameInput = $('<input type="text" class="dt-name-input">').val(dtName.html()).width(_this.countInputWidth());
        dtName.after(subNameInput);
        subNameInput.select();
        dtName.hide();
      })

      //点击部门切换状态
      parentNode.on('click', '.sub-title', function() {
        clearTimeout(_this.timer);
        var _$this = $(this);
        _this.timer = setTimeout(function() {
          if(_$this.hasClass(SELECTED)) {
            return;  
          }
          parentNode.find('.sub-title').removeClass(SELECTED);
          _$this.addClass(SELECTED);

          _this.selectedDomNode = _$this;
          _this.selectedNodeId = _$this.attr('propid');
        }, 300);
        
      })
    },

    //点击删除按钮，删除所选部门
    deleteClk: function(cb) {
      var _this = this;
      $('.dt-btn-delete').on('click', function() {
        var selectedDomNode = _this.selectedDomNode;
        if(selectedDomNode.find('.dt-icon-cp').length !== 0) {
          alert('无法删除根节点');
          return;
        } else {
          if(cb) {
            cb();
          } else {
            selectedDomNode.parent('.sub-item').remove();
            _this.treeStatusInit();
          }
        }
      })
    },

    //光标失去焦点事件
    inputBlur: function(cb) {
      var _this = this;
      _this.parentNode.off('blur').on('blur', '.dt-name-input', function() {
        var textValue = $(this).val();
        if(textValue === '') {
          if($(this).parent('.sub-title').attr('propid') == -1) {
            $(this).parent().parent().remove();
          } else{
            $(this).focus();
            if($('.jconfirm-msg').length === 0) {
              //alert('请输入分组名称');  
            }
            return;  
          }
        } else {
          if(cb) {
            cb();
          } else {
            $(this).siblings('.dt-name').show().html(textValue);
            $(this).remove();
          }
        }
        //$(this).siblings('.dt-name').show().html(textValue);
        //$(this).remove();
      })
    },

    //是否支持双击时间
    bindDbClick: function() {
      var _this = this;
      _this.parentNode.on('dblclick', '.dt-name', function(e) {
        clearTimeout(_this.timer);
        e.stopPropagation();
        var subNameInput = $('<input type="text" class="dt-name-input">').val($(this).html()).width(_this.countInputWidth());
        $(this).after(subNameInput);
        subNameInput.select();
        $(this).hide();
      })
    },

    addDepartment: function(ele) {
      var subItem = $('<div class="sub-item"></div>'),
        subTitle = $('<div class="sub-title"></div>').attr('propId', -1),
        iconFile = $('<i class="dt-icon-file ml24"></i>'),
        subName = $('<span class="dt-name"></span>'),
        spNum = $('<span class="sp-num"></span>').html('（0人）'),
        subNameInput = $('<input type="text" class="dt-name-input">'),
        subList = $('<div class="sub-list"></div>');

      subItem.append(subTitle.append(iconFile).append(subName).append(subNameInput).append(spNum)).append(subList);
      ele.siblings('.sub-list').append(subItem);
      subName.hide();
      subNameInput.width(this.countInputWidth());
      subNameInput.focus();
    },

    countInputWidth: function() {
      var selectedDomNode = this.selectedDomNode;
      var result = selectedDomNode.width() - 
        selectedDomNode.find('.dt-icon-file').outerWidth() -
        selectedDomNode.find('.sp-num').width();

      if(selectedDomNode.find('.dt-icon-arrow').length !== 0) {
        result -= selectedDomNode.find('.dt-icon-arrow').outerWidth();
      }

      return result;
    } 

  }

  window.DepartmentTree = DepartmentTree;
  //module.exports = DepartmentTree;
})()
  

