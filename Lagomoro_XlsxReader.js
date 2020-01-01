/*:
 * @plugindesc Lagomoro Xlsx Reader
 * @author Lagomoro
 * @help 
 */

// ====================================================================================================
// * Parameters
// ----------------------------------------------------------------------------------------------------
var Lagomoro = Lagomoro || {};
Lagomoro.XlsxReader = Lagomoro.XlsxReader || {};
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
    id            : "Lagomoro_XlsxReader",
    name          : "Lagomoro 数据库阅读器",
    version       : "5.0.0",
    description   : "为需要填写 Xlsx 数据库的 Lagomoro 插件提供支持。",
    libraries     : ["xlsx.core.min.js"],
    basics        : [["Lagomoro_PluginManager", "12.0.0"]],
    functions     : [],
    preconditions : ["Lagomoro_PluginManager"],
    conflicts     : [],
    overwrited    : [],
    modified      : [],
    parameters    : {},
    options       : {}
});
// ====================================================================================================

// ====================================================================================================
// * Lagomoro_XlsxReader
// ====================================================================================================
function Lagomoro_XlsxReader() {
    throw new Error('This is a static class');
};
Lagomoro_XlsxReader.load = function(filename, compile, callback, target){
    var jsonName = filename.split(".");
    jsonName.pop();
    jsonName = jsonName.join(".");
    if(StorageManager.isLocalMode()){
        var path = require('path');
        var fs = require('fs');
        var localPath = path.join(path.dirname(process.mainModule.filename), "data/");
        var jsonFile = localPath + jsonName;
        var xlsxFile = localPath + filename;
        if(fs.existsSync(xlsxFile)){
            var json = this.loadLocalXlsx(xlsxFile, compile, callback, target);
            this.saveLocalJson(json, localPath, jsonFile);
        }else{
            if(fs.existsSync(jsonFile)){
                this.loadLocalJson(jsonFile, callback, target);
            }else{
                throw new Error("[Lagomoro_XlsxReader.js] Unable to find [" + filename + "] or [" + jsonName + "] on local");
            }
        }
    }else{
        this.loadWebXlsx(filename, jsonName, compile, callback, target);
    }
};
Lagomoro_XlsxReader.loadLocalXlsx = function(xlsxFile, compile, callback, target){
    var workbook = XLSX.readFile(xlsxFile, {cellStyles:true});
    var json = compile.call(this, workbook);
    callback.call(target, json);
    return json;
};
Lagomoro_XlsxReader.saveLocalJson = function(json, localPath, jsonFile){
    var fs = require('fs');
    if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath);
    }
    fs.writeFileSync(jsonFile, LZString.compressToBase64(JsonEx.stringify(json)));
};
Lagomoro_XlsxReader.loadLocalJson = function(jsonFile, callback, target){
    var data = require('fs').readFileSync(jsonFile, { encoding: 'utf8' });
    var json = JsonEx.parse(LZString.decompressFromBase64(data));
    callback.call(target, json);
};
Lagomoro_XlsxReader.loadWebXlsx = function(xlsxFile, jsonFile, compile, callback, target){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "data/" + xlsxFile);
    xhr.overrideMimeType('application/vnd.ms-excel');
    xhr.onload = function() {
        if (xhr.status < 400) {
            var xhr2 = new XMLHttpRequest();
            xhr2.open('GET', xhr.responseURL, true);
            xhr2.responseType = 'arraybuffer';
            xhr2.onload = function() {
                if(xhr2.status < 400) {
                    var workbook = XLSX.read(new Uint8Array(xhr2.response), {type:'array', cellStyles:true});
                    var json = compile.call(this, workbook);
                    callback.call(target, json);
                }
            };
            xhr2.onerror = function(){
                Lagomoro_XlsxReader.loadWebJson(jsonFile, callback, target);
            }
            xhr2.send();
        }
    };
    xhr.onerror = function(){
        Lagomoro_XlsxReader.loadWebJson(jsonFile, callback, target);
    }
    xhr.send();
};
Lagomoro_XlsxReader.loadWebJson = function(jsonFile, callback, target) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', "data/" + jsonFile);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
        if (xhr.status < 400) {
            var json = JsonEx.parse(LZString.decompressFromBase64(xhr.responseText));
            callback.call(target, json);
        }
    };
    xhr.onerror = function(){
        throw new Error("[Lagomoro_XlsxReader.js] Unable to find [" + filename + "] or [" + jsonName + "] on web");
    }
    xhr.send();
};
Lagomoro_XlsxReader.getWorksheet = function(workbook, index){
    return workbook.Sheets[workbook.SheetNames[index]];
};
Lagomoro_XlsxReader.getLength = function(workbook){
    return workbook.SheetNames.length;
};
Lagomoro_XlsxReader.isCellExist = function(worksheet, address) {
    var cell = worksheet[address];
    return cell && (cell.v !== null);
};
Lagomoro_XlsxReader.isWorksheetEnd = function(worksheet, linenumber) {
    var linename = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    for(var i = 0;i < linename.length;i++){
        if(this.isCellExist(worksheet, linename[i] + linenumber)) return false;
    }
    return true;
};
Lagomoro_XlsxReader.readCellColor = function(worksheet, address) {
    var cell = worksheet[address];
    if(cell && cell.s.fgColor.rgb){
        return '#' + cell.s.fgColor.rgb;
    }
    return '#FFFFFF';
}
Lagomoro_XlsxReader.readCellValue = function(worksheet, address, type) {
    if(this.isCellExist(worksheet, address)){
        var cell = worksheet[address];
        switch(type){
            case 'boolean':return !!cell.v;
            case 'number':return Number(cell.v);
            case 'string':return String(cell.v);
            case 'data':return cell.v;
            default: return '';
        }
    }else{
        switch(type){
            case 'boolean':return false;
            case 'number':return 0;
            case 'string':return '';
            case 'data':return null;
            default: return '';
        }
    }
};