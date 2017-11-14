/*
使用示例
var ret = window.showModalDialog("demo-modal.html","some argument","dialogWidth:320px;dialogHeight:200px");
alert("Returned from modal: " +ret);
以上代码要放到函数体内
iframe内页面取值方式如下：
		var args = window.dialogArguments;
iframe内页面返回值如下：
		window.returnValue = "XXXXX";
*/

(function() {
    window.showModalDialog = window.showModalDialog || function(url, arg, opt, title) {
        url = url || ''; //URL of a dialog
        arg = arg || null; //arguments to a dialog
        opt = opt || 'dialogWidth:300px;dialogHeight:200px;'; //options: dialogTop;dialogLeft;dialogWidth;dialogHeight or CSS styles
        opt += ";border:1px solid #B0E2FF;";
        var caller = showModalDialog.caller.toString();
		var mask = document.createElement('div');
		mask.style.position ="fixed";
		mask.style.top = 0;
		mask.style.right = 0;
		mask.style.bottom = 0;
		mask.style.left = 0;
		mask.style.overflow = "hidden";
		mask.style.outline = 0;
		mask.style["-webkit-overflow-scrolling"]="touch";
		mask.style["background-color"]="rgb(0, 0, 0)";  
		mask.style.filter = "alpha(opacity=60)";  
		mask.style["background-color"] = "rgba(0, 0, 0, 0.1)"; 
		mask.style["z-index"]= 900;
		document.body.appendChild(mask);
		
        var dialog = document.body.appendChild(document.createElement('dialog'));
        dialog.setAttribute('style', opt.replace(/dialog/gi, ''));
		dialog.style["z-index"]=1000;
		dialog.style["padding-left"] = 0;
		dialog.style["padding-right"] = 0;
		dialog.style["padding-bottom"] = 0;
        dialog.innerHTML = '<div style="margin-left: -16px;margin-right: -16px;"><div style="margin-top: -10px;margin-right:10px;height:0px;"><lable id="iframe-title"></lable><a href="#" id="dialog-close" style="position: absolute; top: 0; right: 4px; font-size: 20px; color: #000; text-decoration: none; outline: none;">&times;</a></div></div><iframe id="dialog-body" src="' + url + '" style="border: 0; width: 100%; height: 100%;overflow:auto"></iframe>';
        var iframe = document.getElementById('dialog-body');
		var iframeWindow = document.getElementById('dialog-body').contentWindow;
        iframeWindow.dialogArguments = arg;
		var oldClose = document.getElementById('dialog-body').contentWindow.close;
		document.getElementById('dialog-body').contentWindow.close=function(){
			oldClose();
			setTimeout(function(){
				dialogClose();
			},0)
		}
        document.getElementById('dialog-close').addEventListener('click', function(e) {
            e.preventDefault();
			dialogClose();
			
        });
		dialog.style.display="block";
        var isNext = false;
        var nextStmts = caller.split('\n').filter(function(stmt) {
            if(isNext || stmt.indexOf('showModalDialog(') >= 0) return isNext = true;
            return false;
        });
		function dialogClose(){
			var returnValue = document.getElementById('dialog-body').contentWindow.returnValue;
            document.body.removeChild(dialog);
			document.body.removeChild(mask);
            nextStmts[0] = nextStmts[0].replace(/<\/?.+?>/g, "");
            nextStmts[0] = nextStmts[0].replace(/[\r\n]/g, "");
            nextStmts[0] = nextStmts[0].replace(/(window\.)?showModalDialog\(.*\)/g, JSON.stringify(returnValue));
            eval('{\n' + nextStmts.join('\n'));
		}
        throw 'Execution stopped until showModalDialog is closed';
    };
})();
