/*:
 * @plugindesc Lagomoro Toast
 * @author Lagomoro
 * @help 
 */

// ====================================================================================================
// * Parameters
// ----------------------------------------------------------------------------------------------------
var Lagomoro = Lagomoro || {};
Lagomoro.Toast = Lagomoro.Toast || {};
// ====================================================================================================
// * Lagomoro_PluginManager Check
// ----------------------------------------------------------------------------------------------------
if(Lagomoro.PluginManager == undefined)
    alert("请您知晓：\n\n       Lagomoro 插件组需要 Lagomoro_PluginManager 管理器支持。" +
        "请您将 Lagomoro_PluginManager 放置于所有 Lagomoro 插件上方，以保证 Lagomoro 插件组正常运行。");
// ====================================================================================================
// * Lagomoro_PluginManager Register
// ----------------------------------------------------------------------------------------------------
Lagomoro_PluginManager.addPlugin({
    id            : "Lagomoro_Toast",
    name          : "Lagomoro 推送系统",
    version       : "12.0.0",
    description   : "推送各种各样的消息。",
    libraries     : [],
    basics        : [["Lagomoro_PluginManager", "12.0.0"]],
    functions     : [],
    preconditions : ["Lagomoro_PluginManager"],
    conflicts     : [],
    overwrited    : [],
    modified      : ["Scene_Base.prototype.updateChildren", "Game_Temp.prototype.initialize"],
    parameters    : {},
    options       : {}
});
// ====================================================================================================

// ====================================================================================================
// * Scene_Base
// ====================================================================================================
Scene_Base.prototype.Lagomoro_Toast_updateChildren = Scene_Base.prototype.updateChildren;
Scene_Base.prototype.updateChildren = function() {
    this.Lagomoro_Toast_updateChildren();
    if($gameTemp){
        $gameTemp.updateToast();
    }
};
// ====================================================================================================
// * Game_Temp
// ====================================================================================================
Game_Temp.prototype.Lagomoro_Toast_initialize = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function() {
    this.Lagomoro_Toast_initialize();
    this._toastlist = [];
};
Game_Temp.prototype.toast = function(text, color) {
    var sprite = new Sprite();
	sprite.bitmap = new Bitmap(Graphics.boxWidth, 36);
	sprite.bitmap.textColor = (color ? color : '#ffff00');
	sprite.bitmap.fontSize = 24;

	var width = sprite.bitmap.measureTextWidth(text) + 12;
	var colorm = (PluginManager.parameters('Lagomoro_Mission')['windowcolor']||'rgba(0, 0, 0, 0.4)');
	
    sprite.bitmap.fillRect(0, 3, width, 30, colorm);
    sprite.bitmap.fillRect(width, 5, 2, 26, colorm);
    sprite.bitmap.fillRect(width + 2, 7, 2, 22, colorm);
    sprite.bitmap.fillRect(width + 4, 9, 2, 18, colorm);
    sprite.bitmap.fillRect(width + 6, 11, 2, 14, colorm);
    sprite.bitmap.fillRect(width + 8, 13, 2, 10, colorm);
    sprite.bitmap.fillRect(width + 10, 15, 2, 6, colorm);
    sprite.bitmap.fillRect(width + 12, 17, 2, 2, colorm);

	sprite.bitmap.drawText(text, 6, 6, Graphics.boxWidth, 24, 'left');

	sprite._time = 0;
    sprite._tempy = 0;
    sprite.alpha = 0;
	this.allToastMove(32);
	this._toastlist.push(sprite);
	SceneManager._scene.addChild(this._toastlist[this._toastlist.length - 1]);
};
Game_Temp.prototype.toastShow = function() {
    for(var i = 0;i < this._toastlist.length;i++){
        this._toastlist[i]._time = 0;
        SceneManager._scene.addChild(this._toastlist[i]);
    }
};
Game_Temp.prototype.allToastMove = function(height) {
    for(var i = 0;i < this._toastlist.length;i++){
		this._toastlist[i]._tempy += height;
	}
};
Game_Temp.prototype.updateToast = function() {
    for(var i = 0;i < this._toastlist.length;i++){
		if(this._toastlist[i]._time < 60){
			this._toastlist[i].alpha += 1/60;
		}else if(this._toastlist[i]._time < 660){
        }else if(this._toastlist[i]._time < 720){
            this._toastlist[i].alpha -= 1/60;
        }
        this._toastlist[i]._time ++;
        if(this._toastlist[i]._tempy > 0){
            this._toastlist[i].y ++;
            this._toastlist[i]._tempy --;
        }
        if(this._toastlist[i].y + this._toastlist[i].height > Graphics.boxHeight - 350 && this._toastlist.length > 1){
            if(this._toastlist[i]._time < 660){
                this._toastlist[i]._time = 660;
            }else if(this._toastlist[i]._time >= 720){
                SceneManager._scene.removeChild(this._toastlist.splice(i,1)[0]);
                i--;
			}
        }
	}
};