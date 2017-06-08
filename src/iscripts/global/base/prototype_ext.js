// AUTHOR:   SongErwei
// ROLE:    	
// CREATED:  2016-03-31 11:45:56

// includes 方法还不是标准，IE不支持，故不能用，自己定义吧

String.prototype.contains = function(it) { 
	return this.indexOf(it) != -1;  
}
// http://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find, 'g'), replace);
};

Array.prototype.contains = function(it) { 
	//return this.indexOf(it) != -1;  
	// IE8没有indexOf，暂时先用jquery的，先跑起来
	return ($.inArray(it, this) != -1);
}

// 写成prototype报错，故写成一般的function
// https://stackoverflow.com/questions/7306669/how-to-get-all-properties-values-of-a-javascript-object-without-knowing-the-key
function ObjectValues(obj) {
    var v = [];
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            v.push(obj[key]);
        }
    }
    return v;
}

// 在数字前补0，保证长度为n
//copyfrom: http://stackoverflow.com/questions/8513032/less-than-10-add-0-to-number
Number.prototype.pad = function(n) {
	return (new Array(n).join('0') + this).slice((n || 2) * -1);
}

$.prototype.is_visible = function() {
	return this.is(':visible');
}
$.prototype.is_not = function(sel) {
	return (!this.is(sel));
}

$.prototype.showMe = function(b) {
  if (b) {
    this.show();
  } else {
    this.hide();
  }
}

// 适用于只能点击一次的，以防连续点击
$.prototype.one_click = function(handler) {
	return this.one('click', function() {
		tlog('You clicked me, and can not click me any more');
		handler();
	});
}

// hide是我们convention.css中定义的标准class，js中应尽量用addHide()/removeHide()方式来隐藏/显示。
// 若用show()/hide()，有时会因为inline的问题，出现非预期结果
$.prototype.addHide = function() {
	return this.addClass('hide');
}
$.prototype.removeHide = function() {
	return this.removeClass('hide');
}
// $.prototype.rmHide = function() {
// 	return this.removeHide(); 
// }
$.prototype.hasHide = function() {
	return this.hasClass('hide');
}

$.prototype.addActive = function() {
	return this.addClass('active');
}
$.prototype.removeActive = function() {
	return this.removeClass('active');
}
// $.prototype.rmActive = function() {
//     return this.removeActive();
// }
$.prototype.hasActive = function() {
	return this.hasClass('active');
}

$.prototype.tplToObj = function() {
	if (this.hasClass('tpl')) {
		return this.removeClass('tpl').addClass('obj');
	} else {
		alert('not tpl element');
	}
}

// 表单json 化
$.fn.serializeJSON=function() {
  var json = {};
  $.map($(this).serializeArray(), function(n, i) {
    var _ = n.name.indexOf('[');
    if (_ > -1) {
      var o = json;
      _name = n.name.replace(/\]/gi, '').split('[');
      for (var i=0, len=_name.length; i<len; i++) {
        if (i == len-1) {
          if (o[_name[i]]) {
            if (typeof o[_name[i]] == 'string') {
              o[_name[i]] = [o[_name[i]]];
            }
            o[_name[i]].push(n.value);
          }
          else o[_name[i]] = n.value || '';
        }
        else o = o[_name[i]] = o[_name[i]] || {};
      }
    }
    else {
      if (json[n.name] !== undefined) {
        if (!json[n.name].push) {
          json[n.name] = [json[n.name]];
        }
        json[n.name].push(n.value || '');
      }
      else json[n.name] = n.value || '';      
    }
  });
  return json;
};

// 下面这些是我还不会prototype时的扩展策略，未来有时间再改成prototype方式 

function $has(sel) {
	return ($(sel).length > 0)	
}

// 常常忘记 .
function $c(name) {
	return ('.' == name[0] ? $(name) : $('.' + name))
}

function $t(sel) {
	return $(sel).text()
}

function $v(sel) {
	return $(sel).val()
}

function $has_t(sel) {
	return $t(sel).length > 0
}
function $has_v(sel) {
	return $v(sel).length > 0
}
