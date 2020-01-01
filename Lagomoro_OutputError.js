/*:
 * @plugindesc Lagomoro Error Output
 * @author Lagomoro
 * @help
 */

// ====================================================================================================
// * Parameters
// ----------------------------------------------------------------------------------------------------
var Lagomoro = Lagomoro || {};
Lagomoro.OutputError = Lagomoro.OutputError || {};
// ----------------------------------------------------------------------------------------------------
Lagomoro.OutputError.Language = Lagomoro.OutputError.Language || {};
Lagomoro.OutputError.Language.WarningTitle = "很抱歉，我们发现了一些错误："
Lagomoro.OutputError.Language.WarningSlice = "// ======================================================================";
Lagomoro.OutputError.Language.WarningHelp  = "错误信息已经存储到save目录下。";
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
    id            : "Lagomoro_OutputError",
    name          : "Lagomoro 错误信息输出",
    version       : "2.0.0",
    description   : "打印错误信息到屏幕上，方便玩家进行反馈。",
    libraries     : [],
    basics        : [["Lagomoro_PluginManager", "12.0.0"]],
    functions     : [],
    preconditions : ["Lagomoro_PluginManager"],
    conflicts     : [],
    overwrited    : ["SceneManager.catchException", "Graphics.printError", "Graphics._makeErrorHtml", "Graphics._updateErrorPrinter"],
    modified      : [],
    parameters    : {},
    options       : {}
});
// ====================================================================================================

// ====================================================================================================
// * SceneManager
// ====================================================================================================
SceneManager.catchException = function(e) {
    if (e instanceof Error) {
        Graphics.printError(e.name, e.message, e.stack);
        console.error(e.stack);
    } else {
        Graphics.printError('UnknownError', e);
    }
    AudioManager.stopAll();
    this.stop();
};
// ====================================================================================================
// * DataManager
// ====================================================================================================
DataManager.getDateNow_File  = function() {
    var date = new Date();
    return date.getFullYear() + '-' + (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1) + '-' + (date.getDate() < 10 ? '0' : '') + date.getDate() + ' ' + (date.getHours() < 10 ? '0' : '') + date.getHours() + '-' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + '-' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
};
DataManager.getDateNow  = function() {
	var date = new Date();
    return date.getFullYear() + '-' + (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1) + '-' + (date.getDate() < 10 ? '0' : '') + date.getDate() + ' ' + (date.getHours() < 10 ? '0' : '') + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
};
DataManager.saveError = function(input) {
    var write = '';
    write += '// ======================================================================\r\n';
    write += '// * Error Log :\r\n';
    write += '// ======================================================================\r\n';
    write += '// * Game Information :\r\n';
    write += '// ----------------------------------------------------------------------\r\n';
    write += '// * Date                         : ' + this.getDateNow() + '\r\n';
    write += '// * Game Name                    : ' + ($dataSystem ? $dataSystem.gameTitle : Lagomoro.PluginManager.GameName) + '\r\n';
    write += '// * Game Version                 : ' + Lagomoro.PluginManager.Version + '\r\n';
    write += '// ======================================================================\r\n';
    write += '// * Browser Information :\r\n';
    write += '// ----------------------------------------------------------------------\r\n';
    write += '// * Browser CodeName             : ' + window.navigator.appCodeName + '\r\n';
    write += '// * Browser Name                 : ' + window.navigator.appName + '\r\n';
    write += '// * Browser Version              : ' + window.navigator.appVersion + '\r\n';
    write += '// * Cookies Enabled              : ' + window.navigator.cookieEnabled + '\r\n';
    write += '// * Online                       : ' + window.navigator.onLine + '\r\n';
    write += '// * Platform                     : ' + window.navigator.platform + '\r\n';
    write += '// * UserAgent                    : ' + window.navigator.userAgent + '\r\n';
    write += '// ======================================================================\r\n';
    write += '// * Device Information :\r\n';
    write += '// ----------------------------------------------------------------------\r\n';
    write += '// * Operating System             : ' + process.platform + ' (' + require("os").type() + ' ' + require("os").release() + ')\r\n';
    write += '// * Total Internal Storage       : ' + Math.round(require("os").totalmem()/1024/1024) + ' MB (' + require("os").totalmem() + ' B)\r\n';
    write += '// * Free Internal Storage        : ' + Math.round(require("os").freemem()/1024/1024) + ' MB (' + require("os").freemem() + ' B)\r\n';
    write += '// * Central Processing Unit Info : '+ (require("os").cpus().length > 0 ? require("os").cpus()[0].model : 'Empty') + ' (' + require("os").cpus().length + ')Cores\r\n';
    write += '// * Endianness Type              : ' + require("os").endianness() + '\r\n';
    write += '// * Processor Architecture       : ' + require("os").arch() + '\r\n';
    write += '// * Operating state              : ' + require("os").loadavg() + '\r\n';
    write += '// ======================================================================\r\n';
    write += '// * ' + input[0] + '\r\n';
    write += '// ----------------------------------------------------------------------\r\n';
    for (var i = 1; i < input.length; i++) {
        write += input[i] + '\r\n';
    }
    write += '// ======================================================================\r\n';
    write += '// * 以上信息仅包含您的设备、浏览器、游戏版本，会作为BUG修复的参考，不含任何隐私信息。' + '\r\n';
    write += '// * 希望您将该日志上传给作者来帮助报告BUG，感谢您的理解和支持。' + '\r\n';
    write += '// * 作者联系方式：' + '\r\n';
    write += '// ======================================================================\r\n';
    var fs = require('fs');
    if (!fs.existsSync(StorageManager.localFileDirectoryPath())) {
        fs.mkdirSync(StorageManager.localFileDirectoryPath());
    }
    fs.writeFileSync(StorageManager.localFileDirectoryPath() + 'Error Log ' + this.getDateNow_File() + '.txt', write);
};
// ====================================================================================================
// * Graphics
// ====================================================================================================
Graphics.printError = function(name, message, stack) {
    DataManager.saveError(this._makeErrorList(stack));
    if (this._errorPrinter) {
        this._errorPrinter.innerHTML = this._makeErrorHtml(stack);
    }
    this._applyCanvasFilter();
    this._clearUpperCanvas();
};
Graphics._makeErrorList = function(stack) {
    var lines = stack.split(/(?:\r\n|\r|\n)/);
    for (var i = 0; i < lines.length; i++) {
        lines[i] = lines[i].replace(/[\(](.*[\/])/, '(');
    }
    return lines;
};
Graphics._makeErrorHtml = function(stack) {
    var lines = this._makeErrorList(stack);
    var errors = '';
    for (var i = 1; i < lines.length; i++) {
        errors += '<font color=white>' + lines[i] + '</font><br>';
    }
    var word = Lagomoro.OutputError.Language;
    return ('<font color="yellow"><b>' + word.WarningTitle + 
        '</b></font><br><br><font color="white"><b>' + word.WarningSlice + 
        '<br>// * ' + lines[0] + '<br>' + word.WarningSlice + 
        '</b></font><br>' + errors + '<font color="white"><b>' + word.WarningSlice + 
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