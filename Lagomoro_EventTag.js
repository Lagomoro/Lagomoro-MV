/*:
 * @plugindesc Lagomoro EventTag
 * @author Lagomoro
 * @help 
 */

// ====================================================================================================
// * Parameters
// ----------------------------------------------------------------------------------------------------
var Lagomoro = Lagomoro || {};
Lagomoro.EventTag = Lagomoro.EventTag || {};
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
    id            : "Lagomoro_EventTag",
    name          : "Lagomoro 地图标签",
    version       : "2.0.0",
    description   : "在地图事件上显示标签。",
    libraries     : [],
    basics        : [["Lagomoro_PluginManager", "12.0.0"]],
    functions     : [["Lagomoro_Mission", "14.0.0"]],
    preconditions : ["Lagomoro_PluginManager"],
    conflicts     : [],
    overwrited    : [],
    modified      : ["Sprite_Character.prototype.initialize", "Sprite_Character.prototype.update"],
    parameters    : {},
    options       : {}
});
// ====================================================================================================

// ====================================================================================================
// * Sprite_Character
// ====================================================================================================
Sprite_Character.prototype.Lagomoro_EventTag_initialize = Sprite_Character.prototype.initialize;
Sprite_Character.prototype.initialize = function(character) {
    Sprite_Character.prototype.Lagomoro_EventTag_initialize.call(this, character);
    if (character instanceof Game_Event) {
        var datas = character.event().note.match(/\<NPC:[^,]*,#[0-9a-f]{6},[-0-9]*,[-0-9]*\>/i);
        if (datas !== null) {
			datas = datas[0].slice(5,datas[0].length-1).split(',');
            this.drawNPC(datas[0].toString(),datas[1].toString(),parseInt(datas[2]),parseInt(datas[3]));
        };
        datas = character.event().note.match(/\<ICO:[0-9]*,[-0-9]*,[-0-9]*\>/i);
        if (datas !== null) {
			datas = datas[0].slice(5,datas[0].length-1).split(',');
            this.drawIco(parseInt(datas[0]),parseInt(datas[1]),parseInt(datas[2]));			    
        };
	    datas = character.event().note.match(/\<MIS:[^,]*,[^,]*,[-0-9]*,[-0-9]*\>/ig);
        if (datas !== null && Lagomoro_PluginManager.isPluginFit("Lagomoro_EventTag", "Lagomoro_Mission")) {
			for(var i = 0;i < datas.length;i++){
			    var data = datas[i].slice(5,datas[i].length-1).split(',');
				var dataClass = data[0].toString();
                var havmis = $gameSystem.missionExist(dataClass);
                var misfro = $gameSystem.isMissionUpfrontCompleted(dataClass);
                var miscod = $gameSystem.isMissionCompleted(dataClass);
                if(havmis && misfro && !miscod){
                    this.drawMission(dataClass,data[1].toString(),parseInt(data[2]),parseInt(data[3]));
                }else if(i === datas.length - 1){
					this.drawMissionEmpty(parseInt(data[2]),parseInt(data[3]));
					break;
				}
			}
        };
    };
};
Sprite_Character.prototype.drawNPC = function(name, color, xadd, yadd) {
    this._NPCname = new Sprite();
    this._NPCname.bitmap = new Bitmap(100, 20);
    this._NPCname.bitmap.fontSize = 18;
    this._NPCname.bitmap.textColor = color;
    this._NPCname.bitmap.drawText(name, 0, 0, 100, 20, 'center');
    this._NPCname.anchor.x = 0.5;
    this._NPCname.anchor.y = 1;
    this._NPCname.x = xadd;
    this._NPCname.y = yadd;
    this.addChild(this._NPCname);
}
Sprite_Character.prototype.drawIco = function(iconIndex, xadd, yadd) {
    this._NPCico = new Sprite();
    this._NPCico.bitmap = new Bitmap(32, 32);
    var icos = ImageManager.loadSystem('IconSet');
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = iconIndex % 16 * pw;
    var sy = Math.floor(iconIndex / 16) * ph;
    this._NPCico.bitmap.blt(icos, sx, sy, pw, ph, 0, 0);
    this._NPCico.anchor.x = 0.5;
    this._NPCico.anchor.y = 1;
    this._NPCico.x = xadd;
    this._NPCico.y = yadd;
    this.addChild(this._NPCico);
}
Sprite_Character.prototype.drawMission = function(dataClass, color, xadd, yadd) {
	var mishide = $gameSystem.isMissionHide(dataClass);
    var miscop = $gameSystem.isMissionComplete(dataClass);
    var data = dataClass.split('.');
    var colour = color ? color : (Lagomoro_Mission.getData(data[0] + '.'+ data[1]).color || '#FFFFFF');
	this._NPCmis = new Sprite();
    this._NPCmis.bitmap = new Bitmap(32, 32);
    this._NPCmis.bitmap.fontSize = 32;
    this._NPCmis.bitmap.textColor = (mishide || (!mishide && miscop) ? colour : '#999999');
    this._NPCmis.bitmap.drawText((mishide ? '？' : '！'), 0, 0, 32, 32, 'center');
    this._NPCmis.anchor.x = 0.5;
    this._NPCmis.anchor.y = 1;
    this._NPCmis.x = xadd;
    this._NPCmis.y = yadd;
    this.addChild(this._NPCmis);
};
Sprite_Character.prototype.drawMissionEmpty = function(xadd, yadd) {
	this._NPCmis = new Sprite();
    this._NPCmis.bitmap = new Bitmap(32, 32);
    this._NPCmis.bitmap.fontSize = 32;
    this._NPCmis.anchor.x = 0.5;
    this._NPCmis.anchor.y = 1;
    this._NPCmis.x = xadd;
    this._NPCmis.y = yadd;
    this.addChild(this._NPCmis);
};
Sprite_Character.prototype.Lagomoro_EventTag_update = Sprite_Character.prototype.update;
Sprite_Character.prototype.update = function() {
    this.Lagomoro_EventTag_update();
	if(this._NPCmis){
        this.updateMission();
	}
};
Sprite_Character.prototype.updateMission = function() {
	this._NPCmis.bitmap.clear();
    var datas = this._character.event().note.match(/\<MIS:[^,]*,[^,]*,[-0-9]*,[-0-9]*\>/ig);
    if (datas !== null) {
        for(var i = 0;i < datas.length;i++){
            var datai = datas[i].slice(5,datas[i].length-1).split(',');
            var dataClass = datai[0].toString();
            var havmis = $gameSystem.missionExist(dataClass);
            var misfro = $gameSystem.isMissionUpfrontCompleted(dataClass);
            var miscod = $gameSystem.isMissionCompleted(dataClass);
            if(havmis && misfro && !miscod){
                var mishide = $gameSystem.isMissionHide(dataClass);
                var miscop = $gameSystem.isMissionComplete(dataClass);
                var data = dataClass.split('.');
                var colour = datai[1].toString() ? datai[1].toString() : (Lagomoro_Mission.getData(data[0] + '.'+ data[1]).color || '#FFFFFF');
                this._NPCmis.bitmap.textColor = ((mishide || (!mishide && miscop)) ? colour : '#999999');
                this._NPCmis.bitmap.drawText((mishide ? '？' : '！'), 0, 0, 32, 32, 'center');
            }
        }
    };
};