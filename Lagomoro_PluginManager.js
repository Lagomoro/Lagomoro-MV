/*:
 * @plugindesc Lagomoro Plugin Manager
 * @author Lagomoro
 * @help
 */

// ====================================================================================================
// * Parameters
// ----------------------------------------------------------------------------------------------------
var Lagomoro = Lagomoro || {};
Lagomoro.PluginManager = Lagomoro.PluginManager || {};
// ----------------------------------------------------------------------------------------------------
Lagomoro.PluginManager.Language = Lagomoro.PluginManager.Language || {};
Lagomoro.PluginManager.Language.Warning      = "[Warning] %1 需要 %2 V%3 及以上版本支持，您的版本 V%4 过旧。";
Lagomoro.PluginManager.Language.Precondition = "[Error] &nbsp;&nbsp;&nbsp;&nbsp; %1 需要在插件管理器中位于 %2 下方, 请您调整插件位置。";
Lagomoro.PluginManager.Language.Missing      = "[Missing] %1 需要 %2 才能运行，请您检查是否已经安装该插件。";
Lagomoro.PluginManager.Language.Library      = "[Missing] %1 需要扩展库 %2 才能运行，请您检查是否已经将扩展库放在 js/lib 文件夹下。";
Lagomoro.PluginManager.Language.WarningTitle = "Lagomoro_PluginManager 检测到您安装的插件出现了以下错误："
Lagomoro.PluginManager.Language.WarningSlice = "// ======================================================================";
Lagomoro.PluginManager.Language.WarningHelp  = "请解决以上问题，Lagomoro 插件组才能正常运行。";
// ====================================================================================================

// ====================================================================================================
// * Lagomoro_PluginManager
// ====================================================================================================
function Lagomoro_PluginManager() {
    throw new Error('This is a static class');
};
Lagomoro_PluginManager._plugins = {};
Lagomoro_PluginManager._warnings = [];
Lagomoro_PluginManager._registerList = [];
Lagomoro_PluginManager._libraries = {};
Lagomoro_PluginManager.addPlugin = function(pluginData){
    pluginData.id            = pluginData.id            || "Empty Id";
    pluginData.name          = pluginData.name          || "Empty Name";
    pluginData.version       = pluginData.version       || "0.0.0";
    pluginData.description   = pluginData.description   || "Empty Description";
    pluginData.libraries     = pluginData.libraries     || [];
    pluginData.basics        = pluginData.basics        || [];
    pluginData.functions     = pluginData.functions     || [];
    pluginData.preconditions = pluginData.preconditions || [];
    pluginData.conflicts     = pluginData.conflicts     || [];
    pluginData.overwrited    = pluginData.overwrited    || [];
    pluginData.modified      = pluginData.modified      || [];
    pluginData.parameters    = pluginData.parameters    || {};
    pluginData.options       = pluginData.options       || {};
    this._registerList.push(pluginData);
}
Lagomoro_PluginManager.reset = function(){
    this._plugins = {};
    this._warnings = [];
};
Lagomoro_PluginManager.haveData = function(pluginName){
	for(key in this._plugins){
		if(pluginName == key) return true;
    }
    return false;
};
Lagomoro_PluginManager.havePlugin = function(pluginName){
	for(index in this._registerList){
		if(pluginName == this._registerList[index]) return true;
    }
    return false;
};
Lagomoro_PluginManager.isPluginFit = function(pluginName, targetName){
    var targetVersion = null;
    var functionVersion = null;
	for(key in this._plugins){
        if(key == pluginName){
            var haveTarget = false;
            for(index in this._plugins[key].functions){
                var functionData = this._plugins[key].functions[index];
                if(functionData[0] == targetName){
                    haveTarget = true;
                    targetVersion = functionData[1];
                    break;
                }
            }
            if(!haveTarget) return false;
        }
        if(key == targetName){
            functionVersion = this._plugins[key].version;
        }
    }
    if(!targetVersion || !functionVersion) return false;
    return this.compareVersion(0, targetVersion.split("."), functionVersion.split("."));
};
Lagomoro_PluginManager.addWarning = function(warnings, type){
    switch(type){
        case "VERSION"      : warnings.push(Lagomoro.PluginManager.Language.Warning.format(arguments[2], arguments[3], arguments[4], arguments[5])); break;
        case "PRECONDITION" : warnings.push(Lagomoro.PluginManager.Language.Precondition.format(arguments[2], arguments[3])); break;
        case "MISSING"      : warnings.push(Lagomoro.PluginManager.Language.Missing.format(arguments[2], arguments[3])); break;
        case "LIBRARY"      : warnings.push(Lagomoro.PluginManager.Language.Library.format(arguments[2], arguments[3])); break;
    }
};
Lagomoro_PluginManager.compareVersion = function(point, target, version){
    if(parseInt(version[point]) > parseInt(target[point])){
        return true;
    }else if (parseInt(version[point]) == parseInt(target[point])){
        return point == target.length - 1 ? true : this.compareVersion(point + 1, target, version);
    }
    return false;
};
Lagomoro_PluginManager.register = function(){
    this.reset();
    this.readData();
    this.updateData();
    this.saveData();
    this.checkBasics(this._warnings);
    this.checkPreconditions(this._warnings);
    this.loadLibraries(this._warnings);
    this.showWarnings(this._warnings);
};
Lagomoro_PluginManager.localFilePath = function() {
    return StorageManager.localFileDirectoryPath() + 'manager.morosave';
};
Lagomoro_PluginManager.webStorageKey = function() {
    return 'Lagomoro Plugin Config';
};
Lagomoro_PluginManager.readData = function(){
    var data = null;
    if (StorageManager.isLocalMode()) {
        var fs = require('fs');
        var filePath = this.localFilePath();
        if (fs.existsSync(filePath)) {
            data = fs.readFileSync(filePath, { encoding: 'utf8' });
        }
    } else {
        data = localStorage.getItem(this.webStorageKey());
    }
    this._plugins = data ? JsonEx.parse(LZString.decompressFromBase64(data)) : this._plugins;
};
Lagomoro_PluginManager.saveData = function(){
    var data = LZString.compressToBase64(JsonEx.stringify(this._plugins));
    if (StorageManager.isLocalMode()) {
        var fs = require('fs');
        var dirPath = StorageManager.localFileDirectoryPath();
        var filePath = this.localFilePath();
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        fs.writeFileSync(filePath, data);
    } else {
        localStorage.setItem(this.webStorageKey(), data);
    }
};
Lagomoro_PluginManager.updateData = function(){
    for(index in this._registerList){
	    var pluginData = this._registerList[index];
        if(this.haveData(pluginData.id)){
            for(key in this._plugins[pluginData.id].parameters){
                for(target in pluginData.parameters){
                    if(key == target){
                        pluginData.parameters[target] == this._plugins[pluginData.id].parameters[key];
                    }
                }
            }
        }
        this._plugins[pluginData.id] = pluginData;
    }
};
Lagomoro_PluginManager.checkBasics = function(warnings){
    for(var index = 0; index < this._registerList.length; index++){
        for(basicIndex in this._registerList[index].basics){
            var basic = this._registerList[index].basics[basicIndex];
            var haveBasic = false;
            for(var targetIndex = 0; targetIndex < this._registerList.length; targetIndex++){
                var target = this._registerList[targetIndex];
                if(basic[0] == target.id){
                    haveBasic = true;
                    if(!this.compareVersion(0, basic[1].split("."), target.version.split("."))){
                        this.addWarning(warnings, "VERSION", this._registerList[index].id, basic[0], basic[1], target.version);
                    }
                    break;
                }
            }
            if(!haveBasic){
                this.addWarning(warnings, "MISSING", this._registerList[index].id, basic[0]);
            }
        }
    }
};
Lagomoro_PluginManager.checkPreconditions = function(warnings){
	for(var index = 0; index < this._registerList.length; index++){
        for(preconditionIndex in this._registerList[index].preconditions){
            var precondition = this._registerList[index].preconditions[preconditionIndex];
            var havePrecondition = true;
            var touched = false;
            for(var targetIndex = 0; targetIndex < this._registerList.length; targetIndex++){
                if(targetIndex == index) touched = true;
                if(touched && this._registerList[targetIndex].id == precondition) havePrecondition = false;
            }
            if(!havePrecondition){
                this.addWarning(warnings, "PRECONDITION", this._registerList[index].id, precondition);
            }
        }
    }
};
Lagomoro_PluginManager.haveLibrary = function(libraryName){
	for(key in this._libraries){
        if(libraryName == key){
            return true;
        }
    }
    return false;
};
Lagomoro_PluginManager.isAllLibraryLoaded = function(){
	for(key in this._libraries){
        if(this._libraries[key] == 0){
            return false;
        }
    }
    return true;
};
Lagomoro_PluginManager.loadLibraries = function(warnings){
	for(index in this._registerList){
		for(library in this._registerList[index].libraries){
            libraryName = this._registerList[index].libraries[library];
            if(!this.haveLibrary(libraryName)){
                this._libraries[libraryName] = 0;
                var url = "js/libs/" + libraryName;
                if (require('fs').existsSync(url)) {
                    var script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.src = url;
                    script.async = false;
                    script.onerror = PluginManager.onError.bind(this);
                    script.onload = function(){
                        Lagomoro_PluginManager._libraries[libraryName] = 1;
                        if(Lagomoro_PluginManager.isAllLibraryLoaded && Lagomoro_PluginManager._warnings.length == 0){
                            Lagomoro_PluginManager.launch();
                            Lagomoro_PluginManager.launch = function(){};
                        }
                    }
                    script._url = url;
                    document.body.appendChild(script);
                }else{
                    this.addWarning(warnings, "LIBRARY", this._registerList[index].id, libraryName);
                }
            }
        }
    }
};
Lagomoro_PluginManager.showWarnings = function(warnings){
	if(warnings.length > 0){
        Graphics.printPluginWarning(warnings);
        AudioManager.stopAll();
        SceneManager.stop();
    }
};
Lagomoro_PluginManager.getParameter = function(pluginName, parameterName){
	return this._plugins[pluginName].variables[parameterName];
};
Lagomoro_PluginManager.setParameter = function(pluginName, parameterName, value){
	this._plugins[pluginName].variables[parameterName] = value;
};
Lagomoro_PluginManager.launch = function(){

};
// ====================================================================================================
// * Scene_Boot
// ====================================================================================================
Scene_Boot.prototype.Lagomoro_PluginManager_initialize = Scene_Boot.prototype.initialize;
Scene_Boot.prototype.initialize = function() {
    Scene_Boot.prototype.Lagomoro_PluginManager_initialize.call(this, arguments);
    Lagomoro_PluginManager.register();
};
// ====================================================================================================
// * Graphics
// ====================================================================================================
Graphics.printPluginWarning = function(stack) {
    if (this._errorPrinter) {
        this._errorPrinter.innerHTML = this._makeWarningHtml(stack);
    }
    this._applyCanvasFilter();
    this._clearUpperCanvas();
};
Graphics._makeWarningHtml = function(stack) {
    var warnings = '';
    for (var i = 0; i < stack.length; i++) {
        warnings += '<font color=white>// * ' + stack[i] + '</font><br>';
    }
    var word = Lagomoro.PluginManager.Language;
    return ('<font color="yellow"><b>' + word.WarningTitle + 
        '</b></font><br><br><font color="white"><b>' + word.WarningSlice + 
        '</b></font><br>' + warnings + '<font color="white"><b>' + word.WarningSlice + 
        '</b></font><br><br><font color="yellow"><b>' + word.WarningHelp +'</b></font><br>');
};
Graphics._updateErrorPrinter = function() {
    this._errorPrinter.width = this._width * 0.8;
    this._errorPrinter.height = this._height * 0.8;
    this._errorPrinter.style.textAlign = 'left';
    this._errorPrinter.style.textShadow = '1px 1px 3px #000000';
    this._errorPrinter.style.fontSize = Math.ceil(this._height/60) + 'px';
    this._errorPrinter.style.zIndex = 99;
    this._centerElement(this._errorPrinter);
};

// ====================================================================================================
// * Lagomoro_PluginManager Register
// ----------------------------------------------------------------------------------------------------
Lagomoro_PluginManager.addPlugin({
    id            : "Lagomoro_PluginManager",
    name          : "Lagomoro 插件管理器",
    version       : "12.0.0",
    description   : "管理 Lagomoro 的所有插件，提供解决方案和插件管理。",
    libraries     : [],
    basics        : [],
    functions     : [],
    preconditions : [],
    conflicts     : [],
    overwrited    : ["Graphics._updateErrorPrinter"],
    modified      : ["Scene_Boot.prototype.initialize"],
    parameters    : {},
    options       : {}
});
// ====================================================================================================