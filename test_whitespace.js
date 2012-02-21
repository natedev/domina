var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.DEBUG = true;
goog.LOCALE = "en";
goog.evalWorksForGlobals_ = null;
goog.provide = function(name) {
  if(!COMPILED) {
    if(goog.getObjectByName(name) && !goog.implicitNamespaces_[name]) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    var namespace = name;
    while(namespace = namespace.substring(0, namespace.lastIndexOf("."))) {
      goog.implicitNamespaces_[namespace] = true
    }
  }
  goog.exportPath_(name)
};
goog.setTestOnly = function(opt_message) {
  if(COMPILED && !goog.DEBUG) {
    opt_message = opt_message || "";
    throw Error("Importing test-only code into non-debug environment" + opt_message ? ": " + opt_message : ".");
  }
};
if(!COMPILED) {
  goog.implicitNamespaces_ = {}
}
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split(".");
  var cur = opt_objectToExportTo || goog.global;
  if(!(parts[0] in cur) && cur.execScript) {
    cur.execScript("var " + parts[0])
  }
  for(var part;parts.length && (part = parts.shift());) {
    if(!parts.length && goog.isDef(opt_object)) {
      cur[part] = opt_object
    }else {
      if(cur[part]) {
        cur = cur[part]
      }else {
        cur = cur[part] = {}
      }
    }
  }
};
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split(".");
  var cur = opt_obj || goog.global;
  for(var part;part = parts.shift();) {
    if(goog.isDefAndNotNull(cur[part])) {
      cur = cur[part]
    }else {
      return null
    }
  }
  return cur
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for(var x in obj) {
    global[x] = obj[x]
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if(!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, "/");
    var deps = goog.dependencies_;
    for(var i = 0;provide = provides[i];i++) {
      deps.nameToPath[provide] = path;
      if(!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {}
      }
      deps.pathToNames[path][provide] = true
    }
    for(var j = 0;require = requires[j];j++) {
      if(!(path in deps.requires)) {
        deps.requires[path] = {}
      }
      deps.requires[path][require] = true
    }
  }
};
goog.require = function(rule) {
  if(!COMPILED) {
    if(goog.getObjectByName(rule)) {
      return
    }
    var path = goog.getPathFromDeps_(rule);
    if(path) {
      goog.included_[path] = true;
      goog.writeScripts_()
    }else {
      var errorMessage = "goog.require could not find: " + rule;
      if(goog.global.console) {
        goog.global.console["error"](errorMessage)
      }
      throw Error(errorMessage);
    }
  }
};
goog.basePath = "";
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {
};
goog.identityFunction = function(var_args) {
  return arguments[0]
};
goog.abstractMethod = function() {
  throw Error("unimplemented abstract method");
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    return ctor.instance_ || (ctor.instance_ = new ctor)
  }
};
if(!COMPILED) {
  goog.included_ = {};
  goog.dependencies_ = {pathToNames:{}, nameToPath:{}, requires:{}, visited:{}, written:{}};
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != "undefined" && "write" in doc
  };
  goog.findBasePath_ = function() {
    if(goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return
    }else {
      if(!goog.inHtmlDocument_()) {
        return
      }
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName("script");
    for(var i = scripts.length - 1;i >= 0;--i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf("?");
      var l = qmark == -1 ? src.length : qmark;
      if(src.substr(l - 7, 7) == "base.js") {
        goog.basePath = src.substr(0, l - 7);
        return
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT || goog.writeScriptTag_;
    if(!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true
    }
  };
  goog.writeScriptTag_ = function(src) {
    if(goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      doc.write('<script type="text/javascript" src="' + src + '"></' + "script>");
      return true
    }else {
      return false
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if(path in deps.written) {
        return
      }
      if(path in deps.visited) {
        if(!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path)
        }
        return
      }
      deps.visited[path] = true;
      if(path in deps.requires) {
        for(var requireName in deps.requires[path]) {
          if(requireName in deps.nameToPath) {
            visitNode(deps.nameToPath[requireName])
          }else {
            if(!goog.getObjectByName(requireName)) {
              throw Error("Undefined nameToPath for " + requireName);
            }
          }
        }
      }
      if(!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path)
      }
    }
    for(var path in goog.included_) {
      if(!deps.written[path]) {
        visitNode(path)
      }
    }
    for(var i = 0;i < scripts.length;i++) {
      if(scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i])
      }else {
        throw Error("Undefined script input");
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if(rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule]
    }else {
      return null
    }
  };
  goog.findBasePath_();
  if(!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + "deps.js")
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if(s == "object") {
    if(value) {
      if(value instanceof Array) {
        return"array"
      }else {
        if(value instanceof Object) {
          return s
        }
      }
      var className = Object.prototype.toString.call(value);
      if(className == "[object Window]") {
        return"object"
      }
      if(className == "[object Array]" || typeof value.length == "number" && typeof value.splice != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("splice")) {
        return"array"
      }
      if(className == "[object Function]" || typeof value.call != "undefined" && typeof value.propertyIsEnumerable != "undefined" && !value.propertyIsEnumerable("call")) {
        return"function"
      }
    }else {
      return"null"
    }
  }else {
    if(s == "function" && typeof value.call == "undefined") {
      return"object"
    }
  }
  return s
};
goog.propertyIsEnumerableCustom_ = function(object, propName) {
  if(propName in object) {
    for(var key in object) {
      if(key == propName && Object.prototype.hasOwnProperty.call(object, propName)) {
        return true
      }
    }
  }
  return false
};
goog.propertyIsEnumerable_ = function(object, propName) {
  if(object instanceof Object) {
    return Object.prototype.propertyIsEnumerable.call(object, propName)
  }else {
    return goog.propertyIsEnumerableCustom_(object, propName)
  }
};
goog.isDef = function(val) {
  return val !== undefined
};
goog.isNull = function(val) {
  return val === null
};
goog.isDefAndNotNull = function(val) {
  return val != null
};
goog.isArray = function(val) {
  return goog.typeOf(val) == "array"
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == "array" || type == "object" && typeof val.length == "number"
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == "function"
};
goog.isString = function(val) {
  return typeof val == "string"
};
goog.isBoolean = function(val) {
  return typeof val == "boolean"
};
goog.isNumber = function(val) {
  return typeof val == "number"
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == "function"
};
goog.isObject = function(val) {
  var type = goog.typeOf(val);
  return type == "object" || type == "array" || type == "function"
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] || (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.removeUid = function(obj) {
  if("removeAttribute" in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_)
  }
  try {
    delete obj[goog.UID_PROPERTY_]
  }catch(ex) {
  }
};
goog.UID_PROPERTY_ = "closure_uid_" + Math.floor(Math.random() * 2147483648).toString(36);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.cloneObject(obj[key])
    }
    return clone
  }
  return obj
};
Object.prototype.clone;
goog.bindNative_ = function(fn, selfObj, var_args) {
  return fn.call.apply(fn.bind, arguments)
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  var context = selfObj || goog.global;
  if(arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(context, newArgs)
    }
  }else {
    return function() {
      return fn.apply(context, arguments)
    }
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if(Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1) {
    goog.bind = goog.bindNative_
  }else {
    goog.bind = goog.bindJs_
  }
  return goog.bind.apply(null, arguments)
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs)
  }
};
goog.mixin = function(target, source) {
  for(var x in source) {
    target[x] = source[x]
  }
};
goog.now = Date.now || function() {
  return+new Date
};
goog.globalEval = function(script) {
  if(goog.global.execScript) {
    goog.global.execScript(script, "JavaScript")
  }else {
    if(goog.global.eval) {
      if(goog.evalWorksForGlobals_ == null) {
        goog.global.eval("var _et_ = 1;");
        if(typeof goog.global["_et_"] != "undefined") {
          delete goog.global["_et_"];
          goog.evalWorksForGlobals_ = true
        }else {
          goog.evalWorksForGlobals_ = false
        }
      }
      if(goog.evalWorksForGlobals_) {
        goog.global.eval(script)
      }else {
        var doc = goog.global.document;
        var scriptElt = doc.createElement("script");
        scriptElt.type = "text/javascript";
        scriptElt.defer = false;
        scriptElt.appendChild(doc.createTextNode(script));
        doc.body.appendChild(scriptElt);
        doc.body.removeChild(scriptElt)
      }
    }else {
      throw Error("goog.globalEval not available");
    }
  }
};
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split("-");
    var mapped = [];
    for(var i = 0;i < parts.length;i++) {
      mapped.push(getMapping(parts[i]))
    }
    return mapped.join("-")
  };
  var rename;
  if(goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == "BY_WHOLE" ? getMapping : renameByParts
  }else {
    rename = function(a) {
      return a
    }
  }
  if(opt_modifier) {
    return className + "-" + rename(opt_modifier)
  }else {
    return rename(className)
  }
};
goog.setCssNameMapping = function(mapping, style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = style
};
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for(var key in values) {
    var value = ("" + values[key]).replace(/\$/g, "$$$$");
    str = str.replace(new RegExp("\\{\\$" + key + "\\}", "gi"), value)
  }
  return str
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo)
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {
  }
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor;
  childCtor.prototype.constructor = childCtor
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if(caller.superClass_) {
    return caller.superClass_.constructor.apply(me, Array.prototype.slice.call(arguments, 1))
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for(var ctor = me.constructor;ctor;ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if(ctor.prototype[opt_methodName] === caller) {
      foundCaller = true
    }else {
      if(foundCaller) {
        return ctor.prototype[opt_methodName].apply(me, args)
      }
    }
  }
  if(me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args)
  }else {
    throw Error("goog.base called from a method of one name " + "to a method of a different name");
  }
};
goog.scope = function(fn) {
  fn.call(goog.global)
};
goog.provide("goog.debug.Error");
goog.debug.Error = function(opt_msg) {
  this.stack = (new Error).stack || "";
  if(opt_msg) {
    this.message = String(opt_msg)
  }
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = "CustomError";
goog.provide("goog.string");
goog.provide("goog.string.Unicode");
goog.string.Unicode = {NBSP:"\u00a0"};
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0
};
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l
};
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(prefix, str.substr(0, prefix.length)) == 0
};
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(suffix, str.substr(str.length - suffix.length, suffix.length)) == 0
};
goog.string.subs = function(str, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var replacement = String(arguments[i]).replace(/\$/g, "$$$$");
    str = str.replace(/\%s/, replacement)
  }
  return str
};
goog.string.collapseWhitespace = function(str) {
  return str.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
goog.string.isEmpty = function(str) {
  return/^[\s\xa0]*$/.test(str)
};
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str))
};
goog.string.isBreakingWhitespace = function(str) {
  return!/[^\t\n\r ]/.test(str)
};
goog.string.isAlpha = function(str) {
  return!/[^a-zA-Z]/.test(str)
};
goog.string.isNumeric = function(str) {
  return!/[^0-9]/.test(str)
};
goog.string.isAlphaNumeric = function(str) {
  return!/[^a-zA-Z0-9]/.test(str)
};
goog.string.isSpace = function(ch) {
  return ch == " "
};
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= " " && ch <= "~" || ch >= "\u0080" && ch <= "\ufffd"
};
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, " ")
};
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, "\n")
};
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, " ")
};
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, " ")
};
goog.string.trim = function(str) {
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
goog.string.trimLeft = function(str) {
  return str.replace(/^[\s\xa0]+/, "")
};
goog.string.trimRight = function(str) {
  return str.replace(/[\s\xa0]+$/, "")
};
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();
  if(test1 < test2) {
    return-1
  }else {
    if(test1 == test2) {
      return 0
    }else {
      return 1
    }
  }
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(str1, str2) {
  if(str1 == str2) {
    return 0
  }
  if(!str1) {
    return-1
  }
  if(!str2) {
    return 1
  }
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var count = Math.min(tokens1.length, tokens2.length);
  for(var i = 0;i < count;i++) {
    var a = tokens1[i];
    var b = tokens2[i];
    if(a != b) {
      var num1 = parseInt(a, 10);
      if(!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if(!isNaN(num2) && num1 - num2) {
          return num1 - num2
        }
      }
      return a < b ? -1 : 1
    }
  }
  if(tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length
  }
  return str1 < str2 ? -1 : 1
};
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;
goog.string.urlEncode = function(str) {
  str = String(str);
  if(!goog.string.encodeUriRegExp_.test(str)) {
    return encodeURIComponent(str)
  }
  return str
};
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, " "))
};
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? "<br />" : "<br>")
};
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  if(opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;")
  }else {
    if(!goog.string.allRe_.test(str)) {
      return str
    }
    if(str.indexOf("&") != -1) {
      str = str.replace(goog.string.amperRe_, "&amp;")
    }
    if(str.indexOf("<") != -1) {
      str = str.replace(goog.string.ltRe_, "&lt;")
    }
    if(str.indexOf(">") != -1) {
      str = str.replace(goog.string.gtRe_, "&gt;")
    }
    if(str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, "&quot;")
    }
    return str
  }
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /\"/g;
goog.string.allRe_ = /[&<>\"]/;
goog.string.unescapeEntities = function(str) {
  if(goog.string.contains(str, "&")) {
    if("document" in goog.global && !goog.string.contains(str, "<")) {
      return goog.string.unescapeEntitiesUsingDom_(str)
    }else {
      return goog.string.unescapePureXmlEntities_(str)
    }
  }
  return str
};
goog.string.unescapeEntitiesUsingDom_ = function(str) {
  var el = goog.global["document"]["createElement"]("div");
  el["innerHTML"] = "<pre>x" + str + "</pre>";
  if(el["firstChild"][goog.string.NORMALIZE_FN_]) {
    el["firstChild"][goog.string.NORMALIZE_FN_]()
  }
  str = el["firstChild"]["firstChild"]["nodeValue"].slice(1);
  el["innerHTML"] = "";
  return goog.string.canonicalizeNewlines(str)
};
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch(entity) {
      case "amp":
        return"&";
      case "lt":
        return"<";
      case "gt":
        return">";
      case "quot":
        return'"';
      default:
        if(entity.charAt(0) == "#") {
          var n = Number("0" + entity.substr(1));
          if(!isNaN(n)) {
            return String.fromCharCode(n)
          }
        }
        return s
    }
  })
};
goog.string.NORMALIZE_FN_ = "normalize";
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/  /g, " &#160;"), opt_xml)
};
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for(var i = 0;i < length;i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if(str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1)
    }
  }
  return str
};
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(str.length > chars) {
    str = str.substring(0, chars - 3) + "..."
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.truncateMiddle = function(str, chars, opt_protectEscapedCharacters, opt_trailingChars) {
  if(opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str)
  }
  if(opt_trailingChars) {
    if(opt_trailingChars > chars) {
      opt_trailingChars = chars
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + "..." + str.substring(endPoint)
  }else {
    if(str.length > chars) {
      var half = Math.floor(chars / 2);
      var endPos = str.length - half;
      half += chars % 2;
      str = str.substring(0, half) + "..." + str.substring(endPos)
    }
  }
  if(opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str)
  }
  return str
};
goog.string.specialEscapeChars_ = {"\x00":"\\0", "\u0008":"\\b", "\u000c":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t", "\u000b":"\\x0B", '"':'\\"', "\\":"\\\\"};
goog.string.jsEscapeCache_ = {"'":"\\'"};
goog.string.quote = function(s) {
  s = String(s);
  if(s.quote) {
    return s.quote()
  }else {
    var sb = ['"'];
    for(var i = 0;i < s.length;i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] || (cc > 31 && cc < 127 ? ch : goog.string.escapeChar(ch))
    }
    sb.push('"');
    return sb.join("")
  }
};
goog.string.escapeString = function(str) {
  var sb = [];
  for(var i = 0;i < str.length;i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i))
  }
  return sb.join("")
};
goog.string.escapeChar = function(c) {
  if(c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c]
  }
  if(c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c]
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if(cc > 31 && cc < 127) {
    rv = c
  }else {
    if(cc < 256) {
      rv = "\\x";
      if(cc < 16 || cc > 256) {
        rv += "0"
      }
    }else {
      rv = "\\u";
      if(cc < 4096) {
        rv += "0"
      }
    }
    rv += cc.toString(16).toUpperCase()
  }
  return goog.string.jsEscapeCache_[c] = rv
};
goog.string.toMap = function(s) {
  var rv = {};
  for(var i = 0;i < s.length;i++) {
    rv[s.charAt(i)] = true
  }
  return rv
};
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1
};
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  if(index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) + s.substr(index + stringLength, s.length - index - stringLength)
  }
  return resultStr
};
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "");
  return s.replace(re, "")
};
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), "g");
  return s.replace(re, "")
};
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
goog.string.repeat = function(string, length) {
  return(new Array(length + 1)).join(string)
};
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf(".");
  if(index == -1) {
    index = s.length
  }
  return goog.string.repeat("0", Math.max(0, length - index)) + s
};
goog.string.makeSafe = function(obj) {
  return obj == null ? "" : String(obj)
};
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, "")
};
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) + Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36)
};
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  var v1Subs = goog.string.trim(String(version1)).split(".");
  var v2Subs = goog.string.trim(String(version2)).split(".");
  var subCount = Math.max(v1Subs.length, v2Subs.length);
  for(var subIdx = 0;order == 0 && subIdx < subCount;subIdx++) {
    var v1Sub = v1Subs[subIdx] || "";
    var v2Sub = v2Subs[subIdx] || "";
    var v1CompParser = new RegExp("(\\d*)(\\D*)", "g");
    var v2CompParser = new RegExp("(\\d*)(\\D*)", "g");
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ["", "", ""];
      var v2Comp = v2CompParser.exec(v2Sub) || ["", "", ""];
      if(v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break
      }
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
      order = goog.string.compareElements_(v1CompNum, v2CompNum) || goog.string.compareElements_(v1Comp[2].length == 0, v2Comp[2].length == 0) || goog.string.compareElements_(v1Comp[2], v2Comp[2])
    }while(order == 0)
  }
  return order
};
goog.string.compareElements_ = function(left, right) {
  if(left < right) {
    return-1
  }else {
    if(left > right) {
      return 1
    }
  }
  return 0
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function(str) {
  var result = 0;
  for(var i = 0;i < str.length;++i) {
    result = 31 * result + str.charCodeAt(i);
    result %= goog.string.HASHCODE_MAX_
  }
  return result
};
goog.string.uniqueStringCounter_ = Math.random() * 2147483648 | 0;
goog.string.createUniqueString = function() {
  return"goog_" + goog.string.uniqueStringCounter_++
};
goog.string.toNumber = function(str) {
  var num = Number(str);
  if(num == 0 && goog.string.isEmpty(str)) {
    return NaN
  }
  return num
};
goog.string.toCamelCaseCache_ = {};
goog.string.toCamelCase = function(str) {
  return goog.string.toCamelCaseCache_[str] || (goog.string.toCamelCaseCache_[str] = String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase()
  }))
};
goog.string.toSelectorCaseCache_ = {};
goog.string.toSelectorCase = function(str) {
  return goog.string.toSelectorCaseCache_[str] || (goog.string.toSelectorCaseCache_[str] = String(str).replace(/([A-Z])/g, "-$1").toLowerCase())
};
goog.provide("goog.asserts");
goog.provide("goog.asserts.AssertionError");
goog.require("goog.debug.Error");
goog.require("goog.string");
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  messageArgs.shift();
  this.messagePattern = messagePattern
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.doAssertFailure_ = function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = "Assertion failed";
  if(givenMessage) {
    message += ": " + givenMessage;
    var args = givenArgs
  }else {
    if(defaultMessage) {
      message += ": " + defaultMessage;
      args = defaultArgs
    }
  }
  throw new goog.asserts.AssertionError("" + message, args || []);
};
goog.asserts.assert = function(condition, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_("", null, opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return condition
};
goog.asserts.fail = function(opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError("Failure" + (opt_message ? ": " + opt_message : ""), Array.prototype.slice.call(arguments, 1));
  }
};
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertString = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(value), value], opt_message, Array.prototype.slice.call(arguments, 2))
  }
  return value
};
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if(goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_("instanceof check failed.", null, opt_message, Array.prototype.slice.call(arguments, 3))
  }
};
goog.provide("goog.array");
goog.provide("goog.array.ArrayLike");
goog.require("goog.asserts");
goog.NATIVE_ARRAY_PROTOTYPES = true;
goog.array.ArrayLike;
goog.array.peek = function(array) {
  return array[array.length - 1]
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.indexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? 0 : opt_fromIndex < 0 ? Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex;
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.indexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i < arr.length;i++) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.lastIndexOf ? function(arr, obj, opt_fromIndex) {
  goog.asserts.assert(arr.length != null);
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex)
} : function(arr, obj, opt_fromIndex) {
  var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
  if(fromIndex < 0) {
    fromIndex = Math.max(0, arr.length + fromIndex)
  }
  if(goog.isString(arr)) {
    if(!goog.isString(obj) || obj.length != 1) {
      return-1
    }
    return arr.lastIndexOf(obj, fromIndex)
  }
  for(var i = fromIndex;i >= 0;i--) {
    if(i in arr && arr[i] === obj) {
      return i
    }
  }
  return-1
};
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.forEach ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;--i) {
    if(i in arr2) {
      f.call(opt_obj, arr2[i], i, arr)
    }
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.filter ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = [];
  var resLength = 0;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      var val = arr2[i];
      if(f.call(opt_obj, val, i, arr)) {
        res[resLength++] = val
      }
    }
  }
  return res
};
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.map ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var res = new Array(l);
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2) {
      res[i] = f.call(opt_obj, arr2[i], i, arr)
    }
  }
  return res
};
goog.array.reduce = function(arr, f, val, opt_obj) {
  if(arr.reduce) {
    if(opt_obj) {
      return arr.reduce(goog.bind(f, opt_obj), val)
    }else {
      return arr.reduce(f, val)
    }
  }
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.reduceRight = function(arr, f, val, opt_obj) {
  if(arr.reduceRight) {
    if(opt_obj) {
      return arr.reduceRight(goog.bind(f, opt_obj), val)
    }else {
      return arr.reduceRight(f, val)
    }
  }
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr)
  });
  return rval
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.some ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return true
    }
  }
  return false
};
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES && goog.array.ARRAY_PROTOTYPE_.every ? function(arr, f, opt_obj) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj)
} : function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
      return false
    }
  }
  return true
};
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = 0;i < l;i++) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i]
};
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split("") : arr;
  for(var i = l - 1;i >= 0;i--) {
    if(i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i
    }
  }
  return-1
};
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0
};
goog.array.isEmpty = function(arr) {
  return arr.length == 0
};
goog.array.clear = function(arr) {
  if(!goog.isArray(arr)) {
    for(var i = arr.length - 1;i >= 0;i--) {
      delete arr[i]
    }
  }
  arr.length = 0
};
goog.array.insert = function(arr, obj) {
  if(!goog.array.contains(arr, obj)) {
    arr.push(obj)
  }
};
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj)
};
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd)
};
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if(arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj)
  }else {
    goog.array.insertAt(arr, obj, i)
  }
};
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if(rv = i >= 0) {
    goog.array.removeAt(arr, i)
  }
  return rv
};
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1
};
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if(i >= 0) {
    goog.array.removeAt(arr, i);
    return true
  }
  return false
};
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments)
};
goog.array.clone = function(arr) {
  if(goog.isArray(arr)) {
    return goog.array.concat(arr)
  }else {
    var rv = [];
    for(var i = 0, len = arr.length;i < len;i++) {
      rv[i] = arr[i]
    }
    return rv
  }
};
goog.array.toArray = function(object) {
  if(goog.isArray(object)) {
    return goog.array.concat(object)
  }
  return goog.array.clone(object)
};
goog.array.extend = function(arr1, var_args) {
  for(var i = 1;i < arguments.length;i++) {
    var arr2 = arguments[i];
    var isArrayLike;
    if(goog.isArray(arr2) || (isArrayLike = goog.isArrayLike(arr2)) && arr2.hasOwnProperty("callee")) {
      arr1.push.apply(arr1, arr2)
    }else {
      if(isArrayLike) {
        var len1 = arr1.length;
        var len2 = arr2.length;
        for(var j = 0;j < len2;j++) {
          arr1[len1 + j] = arr2[j]
        }
      }else {
        arr1.push(arr2)
      }
    }
  }
};
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(arr, goog.array.slice(arguments, 1))
};
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);
  if(arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start)
  }else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end)
  }
};
goog.array.removeDuplicates = function(arr, opt_rv) {
  var returnArray = opt_rv || arr;
  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while(cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = goog.isObject(current) ? "o" + goog.getUid(current) : (typeof current).charAt(0) + current;
    if(!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current
    }
  }
  returnArray.length = cursorInsert
};
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr, opt_compareFn || goog.array.defaultCompare, false, target)
};
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true, undefined, opt_obj)
};
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target, opt_selfObj) {
  var left = 0;
  var right = arr.length;
  var found;
  while(left < right) {
    var middle = left + right >> 1;
    var compareResult;
    if(isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr)
    }else {
      compareResult = compareFn(opt_target, arr[middle])
    }
    if(compareResult > 0) {
      left = middle + 1
    }else {
      right = middle;
      found = !compareResult
    }
  }
  return found ? left : ~left
};
goog.array.sort = function(arr, opt_compareFn) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.sort.call(arr, opt_compareFn || goog.array.defaultCompare)
};
goog.array.stableSort = function(arr, opt_compareFn) {
  for(var i = 0;i < arr.length;i++) {
    arr[i] = {index:i, value:arr[i]}
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index
  }
  goog.array.sort(arr, stableCompareFn);
  for(var i = 0;i < arr.length;i++) {
    arr[i] = arr[i].value
  }
};
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key])
  })
};
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for(var i = 1;i < arr.length;i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if(compareResult > 0 || compareResult == 0 && opt_strict) {
      return false
    }
  }
  return true
};
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if(!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) || arr1.length != arr2.length) {
    return false
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for(var i = 0;i < l;i++) {
    if(!equalsFn(arr1[i], arr2[i])) {
      return false
    }
  }
  return true
};
goog.array.compare = function(arr1, arr2, opt_equalsFn) {
  return goog.array.equals(arr1, arr2, opt_equalsFn)
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b
};
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if(index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true
  }
  return false
};
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return index >= 0 ? goog.array.removeAt(array, index) : false
};
goog.array.bucket = function(array, sorter) {
  var buckets = {};
  for(var i = 0;i < array.length;i++) {
    var value = array[i];
    var key = sorter(value, i, array);
    if(goog.isDef(key)) {
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value)
    }
  }
  return buckets
};
goog.array.repeat = function(value, n) {
  var array = [];
  for(var i = 0;i < n;i++) {
    array[i] = value
  }
  return array
};
goog.array.flatten = function(var_args) {
  var result = [];
  for(var i = 0;i < arguments.length;i++) {
    var element = arguments[i];
    if(goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element))
    }else {
      result.push(element)
    }
  }
  return result
};
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);
  if(array.length) {
    n %= array.length;
    if(n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n))
    }else {
      if(n < 0) {
        goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n))
      }
    }
  }
  return array
};
goog.array.zip = function(var_args) {
  if(!arguments.length) {
    return[]
  }
  var result = [];
  for(var i = 0;true;i++) {
    var value = [];
    for(var j = 0;j < arguments.length;j++) {
      var arr = arguments[j];
      if(i >= arr.length) {
        return result
      }
      value.push(arr[i])
    }
    result.push(value)
  }
};
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;
  for(var i = arr.length - 1;i > 0;i--) {
    var j = Math.floor(randFn() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp
  }
};
goog.provide("goog.userAgent");
goog.require("goog.string");
goog.userAgent.ASSUME_IE = false;
goog.userAgent.ASSUME_GECKO = false;
goog.userAgent.ASSUME_WEBKIT = false;
goog.userAgent.ASSUME_MOBILE_WEBKIT = false;
goog.userAgent.ASSUME_OPERA = false;
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;
goog.userAgent.getUserAgentString = function() {
  return goog.global["navigator"] ? goog.global["navigator"].userAgent : null
};
goog.userAgent.getNavigator = function() {
  return goog.global["navigator"]
};
goog.userAgent.init_ = function() {
  goog.userAgent.detectedOpera_ = false;
  goog.userAgent.detectedIe_ = false;
  goog.userAgent.detectedWebkit_ = false;
  goog.userAgent.detectedMobile_ = false;
  goog.userAgent.detectedGecko_ = false;
  var ua;
  if(!goog.userAgent.BROWSER_KNOWN_ && (ua = goog.userAgent.getUserAgentString())) {
    var navigator = goog.userAgent.getNavigator();
    goog.userAgent.detectedOpera_ = ua.indexOf("Opera") == 0;
    goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ && ua.indexOf("MSIE") != -1;
    goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ && ua.indexOf("WebKit") != -1;
    goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ && ua.indexOf("Mobile") != -1;
    goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ && !goog.userAgent.detectedWebkit_ && navigator.product == "Gecko"
  }
};
if(!goog.userAgent.BROWSER_KNOWN_) {
  goog.userAgent.init_()
}
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.userAgent.detectedGecko_;
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.userAgent.detectedWebkit_;
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.detectedMobile_;
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
goog.userAgent.determinePlatform_ = function() {
  var navigator = goog.userAgent.getNavigator();
  return navigator && navigator.platform || ""
};
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
goog.userAgent.ASSUME_MAC = false;
goog.userAgent.ASSUME_WINDOWS = false;
goog.userAgent.ASSUME_LINUX = false;
goog.userAgent.ASSUME_X11 = false;
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11;
goog.userAgent.initPlatform_ = function() {
  goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM, "Mac");
  goog.userAgent.detectedWindows_ = goog.string.contains(goog.userAgent.PLATFORM, "Win");
  goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM, "Linux");
  goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() && goog.string.contains(goog.userAgent.getNavigator()["appVersion"] || "", "X11")
};
if(!goog.userAgent.PLATFORM_KNOWN_) {
  goog.userAgent.initPlatform_()
}
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;
goog.userAgent.determineVersion_ = function() {
  var version = "", re;
  if(goog.userAgent.OPERA && goog.global["opera"]) {
    var operaVersion = goog.global["opera"].version;
    version = typeof operaVersion == "function" ? operaVersion() : operaVersion
  }else {
    if(goog.userAgent.GECKO) {
      re = /rv\:([^\);]+)(\)|;)/
    }else {
      if(goog.userAgent.IE) {
        re = /MSIE\s+([^\);]+)(\)|;)/
      }else {
        if(goog.userAgent.WEBKIT) {
          re = /WebKit\/(\S+)/
        }
      }
    }
    if(re) {
      var arr = re.exec(goog.userAgent.getUserAgentString());
      version = arr ? arr[1] : ""
    }
  }
  if(goog.userAgent.IE) {
    var docMode = goog.userAgent.getDocumentMode_();
    if(docMode > parseFloat(version)) {
      return String(docMode)
    }
  }
  return version
};
goog.userAgent.getDocumentMode_ = function() {
  var doc = goog.global["document"];
  return doc ? doc["documentMode"] : undefined
};
goog.userAgent.VERSION = goog.userAgent.determineVersion_();
goog.userAgent.compare = function(v1, v2) {
  return goog.string.compareVersions(v1, v2)
};
goog.userAgent.isVersionCache_ = {};
goog.userAgent.isVersion = function(version) {
  return goog.userAgent.isVersionCache_[version] || (goog.userAgent.isVersionCache_[version] = goog.string.compareVersions(goog.userAgent.VERSION, version) >= 0)
};
goog.provide("goog.dom.BrowserFeature");
goog.require("goog.userAgent");
goog.dom.BrowserFeature = {CAN_ADD_NAME_OR_TYPE_ATTRIBUTES:!goog.userAgent.IE || goog.userAgent.isVersion("9"), CAN_USE_CHILDREN_ATTRIBUTE:!goog.userAgent.GECKO && !goog.userAgent.IE || goog.userAgent.IE && goog.userAgent.isVersion("9") || goog.userAgent.GECKO && goog.userAgent.isVersion("1.9.1"), CAN_USE_INNER_TEXT:goog.userAgent.IE && !goog.userAgent.isVersion("9"), INNER_HTML_NEEDS_SCOPED_ELEMENT:goog.userAgent.IE};
goog.provide("goog.dom.TagName");
goog.dom.TagName = {A:"A", ABBR:"ABBR", ACRONYM:"ACRONYM", ADDRESS:"ADDRESS", APPLET:"APPLET", AREA:"AREA", B:"B", BASE:"BASE", BASEFONT:"BASEFONT", BDO:"BDO", BIG:"BIG", BLOCKQUOTE:"BLOCKQUOTE", BODY:"BODY", BR:"BR", BUTTON:"BUTTON", CANVAS:"CANVAS", CAPTION:"CAPTION", CENTER:"CENTER", CITE:"CITE", CODE:"CODE", COL:"COL", COLGROUP:"COLGROUP", DD:"DD", DEL:"DEL", DFN:"DFN", DIR:"DIR", DIV:"DIV", DL:"DL", DT:"DT", EM:"EM", FIELDSET:"FIELDSET", FONT:"FONT", FORM:"FORM", FRAME:"FRAME", FRAMESET:"FRAMESET", 
H1:"H1", H2:"H2", H3:"H3", H4:"H4", H5:"H5", H6:"H6", HEAD:"HEAD", HR:"HR", HTML:"HTML", I:"I", IFRAME:"IFRAME", IMG:"IMG", INPUT:"INPUT", INS:"INS", ISINDEX:"ISINDEX", KBD:"KBD", LABEL:"LABEL", LEGEND:"LEGEND", LI:"LI", LINK:"LINK", MAP:"MAP", MENU:"MENU", META:"META", NOFRAMES:"NOFRAMES", NOSCRIPT:"NOSCRIPT", OBJECT:"OBJECT", OL:"OL", OPTGROUP:"OPTGROUP", OPTION:"OPTION", P:"P", PARAM:"PARAM", PRE:"PRE", Q:"Q", S:"S", SAMP:"SAMP", SCRIPT:"SCRIPT", SELECT:"SELECT", SMALL:"SMALL", SPAN:"SPAN", STRIKE:"STRIKE", 
STRONG:"STRONG", STYLE:"STYLE", SUB:"SUB", SUP:"SUP", TABLE:"TABLE", TBODY:"TBODY", TD:"TD", TEXTAREA:"TEXTAREA", TFOOT:"TFOOT", TH:"TH", THEAD:"THEAD", TITLE:"TITLE", TR:"TR", TT:"TT", U:"U", UL:"UL", VAR:"VAR"};
goog.provide("goog.dom.classes");
goog.require("goog.array");
goog.dom.classes.set = function(element, className) {
  element.className = className
};
goog.dom.classes.get = function(element) {
  var className = element.className;
  return className && typeof className.split == "function" ? className.split(/\s+/) : []
};
goog.dom.classes.add = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var b = goog.dom.classes.add_(classes, args);
  element.className = classes.join(" ");
  return b
};
goog.dom.classes.remove = function(element, var_args) {
  var classes = goog.dom.classes.get(element);
  var args = goog.array.slice(arguments, 1);
  var b = goog.dom.classes.remove_(classes, args);
  element.className = classes.join(" ");
  return b
};
goog.dom.classes.add_ = function(classes, args) {
  var rv = 0;
  for(var i = 0;i < args.length;i++) {
    if(!goog.array.contains(classes, args[i])) {
      classes.push(args[i]);
      rv++
    }
  }
  return rv == args.length
};
goog.dom.classes.remove_ = function(classes, args) {
  var rv = 0;
  for(var i = 0;i < classes.length;i++) {
    if(goog.array.contains(args, classes[i])) {
      goog.array.splice(classes, i--, 1);
      rv++
    }
  }
  return rv == args.length
};
goog.dom.classes.swap = function(element, fromClass, toClass) {
  var classes = goog.dom.classes.get(element);
  var removed = false;
  for(var i = 0;i < classes.length;i++) {
    if(classes[i] == fromClass) {
      goog.array.splice(classes, i--, 1);
      removed = true
    }
  }
  if(removed) {
    classes.push(toClass);
    element.className = classes.join(" ")
  }
  return removed
};
goog.dom.classes.addRemove = function(element, classesToRemove, classesToAdd) {
  var classes = goog.dom.classes.get(element);
  if(goog.isString(classesToRemove)) {
    goog.array.remove(classes, classesToRemove)
  }else {
    if(goog.isArray(classesToRemove)) {
      goog.dom.classes.remove_(classes, classesToRemove)
    }
  }
  if(goog.isString(classesToAdd) && !goog.array.contains(classes, classesToAdd)) {
    classes.push(classesToAdd)
  }else {
    if(goog.isArray(classesToAdd)) {
      goog.dom.classes.add_(classes, classesToAdd)
    }
  }
  element.className = classes.join(" ")
};
goog.dom.classes.has = function(element, className) {
  return goog.array.contains(goog.dom.classes.get(element), className)
};
goog.dom.classes.enable = function(element, className, enabled) {
  if(enabled) {
    goog.dom.classes.add(element, className)
  }else {
    goog.dom.classes.remove(element, className)
  }
};
goog.dom.classes.toggle = function(element, className) {
  var add = !goog.dom.classes.has(element, className);
  goog.dom.classes.enable(element, className, add);
  return add
};
goog.provide("goog.math.Coordinate");
goog.math.Coordinate = function(opt_x, opt_y) {
  this.x = goog.isDef(opt_x) ? opt_x : 0;
  this.y = goog.isDef(opt_y) ? opt_y : 0
};
goog.math.Coordinate.prototype.clone = function() {
  return new goog.math.Coordinate(this.x, this.y)
};
if(goog.DEBUG) {
  goog.math.Coordinate.prototype.toString = function() {
    return"(" + this.x + ", " + this.y + ")"
  }
}
goog.math.Coordinate.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.x == b.x && a.y == b.y
};
goog.math.Coordinate.distance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy)
};
goog.math.Coordinate.squaredDistance = function(a, b) {
  var dx = a.x - b.x;
  var dy = a.y - b.y;
  return dx * dx + dy * dy
};
goog.math.Coordinate.difference = function(a, b) {
  return new goog.math.Coordinate(a.x - b.x, a.y - b.y)
};
goog.math.Coordinate.sum = function(a, b) {
  return new goog.math.Coordinate(a.x + b.x, a.y + b.y)
};
goog.provide("goog.math.Size");
goog.math.Size = function(width, height) {
  this.width = width;
  this.height = height
};
goog.math.Size.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.width == b.width && a.height == b.height
};
goog.math.Size.prototype.clone = function() {
  return new goog.math.Size(this.width, this.height)
};
if(goog.DEBUG) {
  goog.math.Size.prototype.toString = function() {
    return"(" + this.width + " x " + this.height + ")"
  }
}
goog.math.Size.prototype.getLongest = function() {
  return Math.max(this.width, this.height)
};
goog.math.Size.prototype.getShortest = function() {
  return Math.min(this.width, this.height)
};
goog.math.Size.prototype.area = function() {
  return this.width * this.height
};
goog.math.Size.prototype.perimeter = function() {
  return(this.width + this.height) * 2
};
goog.math.Size.prototype.aspectRatio = function() {
  return this.width / this.height
};
goog.math.Size.prototype.isEmpty = function() {
  return!this.area()
};
goog.math.Size.prototype.ceil = function() {
  this.width = Math.ceil(this.width);
  this.height = Math.ceil(this.height);
  return this
};
goog.math.Size.prototype.fitsInside = function(target) {
  return this.width <= target.width && this.height <= target.height
};
goog.math.Size.prototype.floor = function() {
  this.width = Math.floor(this.width);
  this.height = Math.floor(this.height);
  return this
};
goog.math.Size.prototype.round = function() {
  this.width = Math.round(this.width);
  this.height = Math.round(this.height);
  return this
};
goog.math.Size.prototype.scale = function(s) {
  this.width *= s;
  this.height *= s;
  return this
};
goog.math.Size.prototype.scaleToFit = function(target) {
  var s = this.aspectRatio() > target.aspectRatio() ? target.width / this.width : target.height / this.height;
  return this.scale(s)
};
goog.provide("goog.object");
goog.object.forEach = function(obj, f, opt_obj) {
  for(var key in obj) {
    f.call(opt_obj, obj[key], key, obj)
  }
};
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key]
    }
  }
  return res
};
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for(var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj)
  }
  return res
};
goog.object.some = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(f.call(opt_obj, obj[key], key, obj)) {
      return true
    }
  }
  return false
};
goog.object.every = function(obj, f, opt_obj) {
  for(var key in obj) {
    if(!f.call(opt_obj, obj[key], key, obj)) {
      return false
    }
  }
  return true
};
goog.object.getCount = function(obj) {
  var rv = 0;
  for(var key in obj) {
    rv++
  }
  return rv
};
goog.object.getAnyKey = function(obj) {
  for(var key in obj) {
    return key
  }
};
goog.object.getAnyValue = function(obj) {
  for(var key in obj) {
    return obj[key]
  }
};
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val)
};
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = obj[key]
  }
  return res
};
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for(var key in obj) {
    res[i++] = key
  }
  return res
};
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;
  for(var i = isArrayLike ? 0 : 1;i < keys.length;i++) {
    obj = obj[keys[i]];
    if(!goog.isDef(obj)) {
      break
    }
  }
  return obj
};
goog.object.containsKey = function(obj, key) {
  return key in obj
};
goog.object.containsValue = function(obj, val) {
  for(var key in obj) {
    if(obj[key] == val) {
      return true
    }
  }
  return false
};
goog.object.findKey = function(obj, f, opt_this) {
  for(var key in obj) {
    if(f.call(opt_this, obj[key], key, obj)) {
      return key
    }
  }
  return undefined
};
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key]
};
goog.object.isEmpty = function(obj) {
  for(var key in obj) {
    return false
  }
  return true
};
goog.object.clear = function(obj) {
  for(var i in obj) {
    delete obj[i]
  }
};
goog.object.remove = function(obj, key) {
  var rv;
  if(rv = key in obj) {
    delete obj[key]
  }
  return rv
};
goog.object.add = function(obj, key, val) {
  if(key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val)
};
goog.object.get = function(obj, key, opt_val) {
  if(key in obj) {
    return obj[key]
  }
  return opt_val
};
goog.object.set = function(obj, key, value) {
  obj[key] = value
};
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : obj[key] = value
};
goog.object.clone = function(obj) {
  var res = {};
  for(var key in obj) {
    res[key] = obj[key]
  }
  return res
};
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if(type == "object" || type == "array") {
    if(obj.clone) {
      return obj.clone()
    }
    var clone = type == "array" ? [] : {};
    for(var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key])
    }
    return clone
  }
  return obj
};
goog.object.transpose = function(obj) {
  var transposed = {};
  for(var key in obj) {
    transposed[obj[key]] = key
  }
  return transposed
};
goog.object.PROTOTYPE_FIELDS_ = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
goog.object.extend = function(target, var_args) {
  var key, source;
  for(var i = 1;i < arguments.length;i++) {
    source = arguments[i];
    for(key in source) {
      target[key] = source[key]
    }
    for(var j = 0;j < goog.object.PROTOTYPE_FIELDS_.length;j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if(Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key]
      }
    }
  }
};
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0])
  }
  if(argLength % 2) {
    throw Error("Uneven number of arguments");
  }
  var rv = {};
  for(var i = 0;i < argLength;i += 2) {
    rv[arguments[i]] = arguments[i + 1]
  }
  return rv
};
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if(argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0])
  }
  var rv = {};
  for(var i = 0;i < argLength;i++) {
    rv[arguments[i]] = true
  }
  return rv
};
goog.provide("goog.dom");
goog.provide("goog.dom.DomHelper");
goog.provide("goog.dom.NodeType");
goog.require("goog.array");
goog.require("goog.dom.BrowserFeature");
goog.require("goog.dom.TagName");
goog.require("goog.dom.classes");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Size");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.dom.ASSUME_QUIRKS_MODE = false;
goog.dom.ASSUME_STANDARDS_MODE = false;
goog.dom.COMPAT_MODE_KNOWN_ = goog.dom.ASSUME_QUIRKS_MODE || goog.dom.ASSUME_STANDARDS_MODE;
goog.dom.NodeType = {ELEMENT:1, ATTRIBUTE:2, TEXT:3, CDATA_SECTION:4, ENTITY_REFERENCE:5, ENTITY:6, PROCESSING_INSTRUCTION:7, COMMENT:8, DOCUMENT:9, DOCUMENT_TYPE:10, DOCUMENT_FRAGMENT:11, NOTATION:12};
goog.dom.getDomHelper = function(opt_element) {
  return opt_element ? new goog.dom.DomHelper(goog.dom.getOwnerDocument(opt_element)) : goog.dom.defaultDomHelper_ || (goog.dom.defaultDomHelper_ = new goog.dom.DomHelper)
};
goog.dom.defaultDomHelper_;
goog.dom.getDocument = function() {
  return document
};
goog.dom.getElement = function(element) {
  return goog.isString(element) ? document.getElementById(element) : element
};
goog.dom.$ = goog.dom.getElement;
goog.dom.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(document, opt_tag, opt_class, opt_el)
};
goog.dom.getElementsByClass = function(className, opt_el) {
  var parent = opt_el || document;
  if(goog.dom.canUseQuerySelector_(parent)) {
    return parent.querySelectorAll("." + className)
  }else {
    if(parent.getElementsByClassName) {
      return parent.getElementsByClassName(className)
    }
  }
  return goog.dom.getElementsByTagNameAndClass_(document, "*", className, opt_el)
};
goog.dom.getElementByClass = function(className, opt_el) {
  var parent = opt_el || document;
  var retVal = null;
  if(goog.dom.canUseQuerySelector_(parent)) {
    retVal = parent.querySelector("." + className)
  }else {
    retVal = goog.dom.getElementsByClass(className, opt_el)[0]
  }
  return retVal || null
};
goog.dom.canUseQuerySelector_ = function(parent) {
  return parent.querySelectorAll && parent.querySelector && (!goog.userAgent.WEBKIT || goog.dom.isCss1CompatMode_(document) || goog.userAgent.isVersion("528"))
};
goog.dom.getElementsByTagNameAndClass_ = function(doc, opt_tag, opt_class, opt_el) {
  var parent = opt_el || doc;
  var tagName = opt_tag && opt_tag != "*" ? opt_tag.toUpperCase() : "";
  if(goog.dom.canUseQuerySelector_(parent) && (tagName || opt_class)) {
    var query = tagName + (opt_class ? "." + opt_class : "");
    return parent.querySelectorAll(query)
  }
  if(opt_class && parent.getElementsByClassName) {
    var els = parent.getElementsByClassName(opt_class);
    if(tagName) {
      var arrayLike = {};
      var len = 0;
      for(var i = 0, el;el = els[i];i++) {
        if(tagName == el.nodeName) {
          arrayLike[len++] = el
        }
      }
      arrayLike.length = len;
      return arrayLike
    }else {
      return els
    }
  }
  var els = parent.getElementsByTagName(tagName || "*");
  if(opt_class) {
    var arrayLike = {};
    var len = 0;
    for(var i = 0, el;el = els[i];i++) {
      var className = el.className;
      if(typeof className.split == "function" && goog.array.contains(className.split(/\s+/), opt_class)) {
        arrayLike[len++] = el
      }
    }
    arrayLike.length = len;
    return arrayLike
  }else {
    return els
  }
};
goog.dom.$$ = goog.dom.getElementsByTagNameAndClass;
goog.dom.setProperties = function(element, properties) {
  goog.object.forEach(properties, function(val, key) {
    if(key == "style") {
      element.style.cssText = val
    }else {
      if(key == "class") {
        element.className = val
      }else {
        if(key == "for") {
          element.htmlFor = val
        }else {
          if(key in goog.dom.DIRECT_ATTRIBUTE_MAP_) {
            element.setAttribute(goog.dom.DIRECT_ATTRIBUTE_MAP_[key], val)
          }else {
            element[key] = val
          }
        }
      }
    }
  })
};
goog.dom.DIRECT_ATTRIBUTE_MAP_ = {"cellpadding":"cellPadding", "cellspacing":"cellSpacing", "colspan":"colSpan", "rowspan":"rowSpan", "valign":"vAlign", "height":"height", "width":"width", "usemap":"useMap", "frameborder":"frameBorder", "maxlength":"maxLength", "type":"type"};
goog.dom.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize_(opt_window || window)
};
goog.dom.getViewportSize_ = function(win) {
  var doc = win.document;
  if(goog.userAgent.WEBKIT && !goog.userAgent.isVersion("500") && !goog.userAgent.MOBILE) {
    if(typeof win.innerHeight == "undefined") {
      win = window
    }
    var innerHeight = win.innerHeight;
    var scrollHeight = win.document.documentElement.scrollHeight;
    if(win == win.top) {
      if(scrollHeight < innerHeight) {
        innerHeight -= 15
      }
    }
    return new goog.math.Size(win.innerWidth, innerHeight)
  }
  var el = goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body;
  return new goog.math.Size(el.clientWidth, el.clientHeight)
};
goog.dom.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(window)
};
goog.dom.getDocumentHeight_ = function(win) {
  var doc = win.document;
  var height = 0;
  if(doc) {
    var vh = goog.dom.getViewportSize_(win).height;
    var body = doc.body;
    var docEl = doc.documentElement;
    if(goog.dom.isCss1CompatMode_(doc) && docEl.scrollHeight) {
      height = docEl.scrollHeight != vh ? docEl.scrollHeight : docEl.offsetHeight
    }else {
      var sh = docEl.scrollHeight;
      var oh = docEl.offsetHeight;
      if(docEl.clientHeight != oh) {
        sh = body.scrollHeight;
        oh = body.offsetHeight
      }
      if(sh > vh) {
        height = sh > oh ? sh : oh
      }else {
        height = sh < oh ? sh : oh
      }
    }
  }
  return height
};
goog.dom.getPageScroll = function(opt_window) {
  var win = opt_window || goog.global || window;
  return goog.dom.getDomHelper(win.document).getDocumentScroll()
};
goog.dom.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(document)
};
goog.dom.getDocumentScroll_ = function(doc) {
  var el = goog.dom.getDocumentScrollElement_(doc);
  var win = goog.dom.getWindow_(doc);
  return new goog.math.Coordinate(win.pageXOffset || el.scrollLeft, win.pageYOffset || el.scrollTop)
};
goog.dom.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(document)
};
goog.dom.getDocumentScrollElement_ = function(doc) {
  return!goog.userAgent.WEBKIT && goog.dom.isCss1CompatMode_(doc) ? doc.documentElement : doc.body
};
goog.dom.getWindow = function(opt_doc) {
  return opt_doc ? goog.dom.getWindow_(opt_doc) : window
};
goog.dom.getWindow_ = function(doc) {
  return doc.parentWindow || doc.defaultView
};
goog.dom.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(document, arguments)
};
goog.dom.createDom_ = function(doc, args) {
  var tagName = args[0];
  var attributes = args[1];
  if(!goog.dom.BrowserFeature.CAN_ADD_NAME_OR_TYPE_ATTRIBUTES && attributes && (attributes.name || attributes.type)) {
    var tagNameArr = ["<", tagName];
    if(attributes.name) {
      tagNameArr.push(' name="', goog.string.htmlEscape(attributes.name), '"')
    }
    if(attributes.type) {
      tagNameArr.push(' type="', goog.string.htmlEscape(attributes.type), '"');
      var clone = {};
      goog.object.extend(clone, attributes);
      attributes = clone;
      delete attributes.type
    }
    tagNameArr.push(">");
    tagName = tagNameArr.join("")
  }
  var element = doc.createElement(tagName);
  if(attributes) {
    if(goog.isString(attributes)) {
      element.className = attributes
    }else {
      if(goog.isArray(attributes)) {
        goog.dom.classes.add.apply(null, [element].concat(attributes))
      }else {
        goog.dom.setProperties(element, attributes)
      }
    }
  }
  if(args.length > 2) {
    goog.dom.append_(doc, element, args, 2)
  }
  return element
};
goog.dom.append_ = function(doc, parent, args, startIndex) {
  function childHandler(child) {
    if(child) {
      parent.appendChild(goog.isString(child) ? doc.createTextNode(child) : child)
    }
  }
  for(var i = startIndex;i < args.length;i++) {
    var arg = args[i];
    if(goog.isArrayLike(arg) && !goog.dom.isNodeLike(arg)) {
      goog.array.forEach(goog.dom.isNodeList(arg) ? goog.array.clone(arg) : arg, childHandler)
    }else {
      childHandler(arg)
    }
  }
};
goog.dom.$dom = goog.dom.createDom;
goog.dom.createElement = function(name) {
  return document.createElement(name)
};
goog.dom.createTextNode = function(content) {
  return document.createTextNode(content)
};
goog.dom.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(document, rows, columns, !!opt_fillWithNbsp)
};
goog.dom.createTable_ = function(doc, rows, columns, fillWithNbsp) {
  var rowHtml = ["<tr>"];
  for(var i = 0;i < columns;i++) {
    rowHtml.push(fillWithNbsp ? "<td>&nbsp;</td>" : "<td></td>")
  }
  rowHtml.push("</tr>");
  rowHtml = rowHtml.join("");
  var totalHtml = ["<table>"];
  for(i = 0;i < rows;i++) {
    totalHtml.push(rowHtml)
  }
  totalHtml.push("</table>");
  var elem = doc.createElement(goog.dom.TagName.DIV);
  elem.innerHTML = totalHtml.join("");
  return elem.removeChild(elem.firstChild)
};
goog.dom.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(document, htmlString)
};
goog.dom.htmlToDocumentFragment_ = function(doc, htmlString) {
  var tempDiv = doc.createElement("div");
  if(goog.dom.BrowserFeature.INNER_HTML_NEEDS_SCOPED_ELEMENT) {
    tempDiv.innerHTML = "<br>" + htmlString;
    tempDiv.removeChild(tempDiv.firstChild)
  }else {
    tempDiv.innerHTML = htmlString
  }
  if(tempDiv.childNodes.length == 1) {
    return tempDiv.removeChild(tempDiv.firstChild)
  }else {
    var fragment = doc.createDocumentFragment();
    while(tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild)
    }
    return fragment
  }
};
goog.dom.getCompatMode = function() {
  return goog.dom.isCss1CompatMode() ? "CSS1Compat" : "BackCompat"
};
goog.dom.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(document)
};
goog.dom.isCss1CompatMode_ = function(doc) {
  if(goog.dom.COMPAT_MODE_KNOWN_) {
    return goog.dom.ASSUME_STANDARDS_MODE
  }
  return doc.compatMode == "CSS1Compat"
};
goog.dom.canHaveChildren = function(node) {
  if(node.nodeType != goog.dom.NodeType.ELEMENT) {
    return false
  }
  switch(node.tagName) {
    case goog.dom.TagName.APPLET:
    ;
    case goog.dom.TagName.AREA:
    ;
    case goog.dom.TagName.BASE:
    ;
    case goog.dom.TagName.BR:
    ;
    case goog.dom.TagName.COL:
    ;
    case goog.dom.TagName.FRAME:
    ;
    case goog.dom.TagName.HR:
    ;
    case goog.dom.TagName.IMG:
    ;
    case goog.dom.TagName.INPUT:
    ;
    case goog.dom.TagName.IFRAME:
    ;
    case goog.dom.TagName.ISINDEX:
    ;
    case goog.dom.TagName.LINK:
    ;
    case goog.dom.TagName.NOFRAMES:
    ;
    case goog.dom.TagName.NOSCRIPT:
    ;
    case goog.dom.TagName.META:
    ;
    case goog.dom.TagName.OBJECT:
    ;
    case goog.dom.TagName.PARAM:
    ;
    case goog.dom.TagName.SCRIPT:
    ;
    case goog.dom.TagName.STYLE:
      return false
  }
  return true
};
goog.dom.appendChild = function(parent, child) {
  parent.appendChild(child)
};
goog.dom.append = function(parent, var_args) {
  goog.dom.append_(goog.dom.getOwnerDocument(parent), parent, arguments, 1)
};
goog.dom.removeChildren = function(node) {
  var child;
  while(child = node.firstChild) {
    node.removeChild(child)
  }
};
goog.dom.insertSiblingBefore = function(newNode, refNode) {
  if(refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode)
  }
};
goog.dom.insertSiblingAfter = function(newNode, refNode) {
  if(refNode.parentNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling)
  }
};
goog.dom.insertChildAt = function(parent, child, index) {
  parent.insertBefore(child, parent.childNodes[index] || null)
};
goog.dom.removeNode = function(node) {
  return node && node.parentNode ? node.parentNode.removeChild(node) : null
};
goog.dom.replaceNode = function(newNode, oldNode) {
  var parent = oldNode.parentNode;
  if(parent) {
    parent.replaceChild(newNode, oldNode)
  }
};
goog.dom.flattenElement = function(element) {
  var child, parent = element.parentNode;
  if(parent && parent.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT) {
    if(element.removeNode) {
      return element.removeNode(false)
    }else {
      while(child = element.firstChild) {
        parent.insertBefore(child, element)
      }
      return goog.dom.removeNode(element)
    }
  }
};
goog.dom.getChildren = function(element) {
  if(goog.dom.BrowserFeature.CAN_USE_CHILDREN_ATTRIBUTE && element.children != undefined) {
    return element.children
  }
  return goog.array.filter(element.childNodes, function(node) {
    return node.nodeType == goog.dom.NodeType.ELEMENT
  })
};
goog.dom.getFirstElementChild = function(node) {
  if(node.firstElementChild != undefined) {
    return node.firstElementChild
  }
  return goog.dom.getNextElementNode_(node.firstChild, true)
};
goog.dom.getLastElementChild = function(node) {
  if(node.lastElementChild != undefined) {
    return node.lastElementChild
  }
  return goog.dom.getNextElementNode_(node.lastChild, false)
};
goog.dom.getNextElementSibling = function(node) {
  if(node.nextElementSibling != undefined) {
    return node.nextElementSibling
  }
  return goog.dom.getNextElementNode_(node.nextSibling, true)
};
goog.dom.getPreviousElementSibling = function(node) {
  if(node.previousElementSibling != undefined) {
    return node.previousElementSibling
  }
  return goog.dom.getNextElementNode_(node.previousSibling, false)
};
goog.dom.getNextElementNode_ = function(node, forward) {
  while(node && node.nodeType != goog.dom.NodeType.ELEMENT) {
    node = forward ? node.nextSibling : node.previousSibling
  }
  return node
};
goog.dom.getNextNode = function(node) {
  if(!node) {
    return null
  }
  if(node.firstChild) {
    return node.firstChild
  }
  while(node && !node.nextSibling) {
    node = node.parentNode
  }
  return node ? node.nextSibling : null
};
goog.dom.getPreviousNode = function(node) {
  if(!node) {
    return null
  }
  if(!node.previousSibling) {
    return node.parentNode
  }
  node = node.previousSibling;
  while(node && node.lastChild) {
    node = node.lastChild
  }
  return node
};
goog.dom.isNodeLike = function(obj) {
  return goog.isObject(obj) && obj.nodeType > 0
};
goog.dom.isWindow = function(obj) {
  return goog.isObject(obj) && obj["window"] == obj
};
goog.dom.contains = function(parent, descendant) {
  if(parent.contains && descendant.nodeType == goog.dom.NodeType.ELEMENT) {
    return parent == descendant || parent.contains(descendant)
  }
  if(typeof parent.compareDocumentPosition != "undefined") {
    return parent == descendant || Boolean(parent.compareDocumentPosition(descendant) & 16)
  }
  while(descendant && parent != descendant) {
    descendant = descendant.parentNode
  }
  return descendant == parent
};
goog.dom.compareNodeOrder = function(node1, node2) {
  if(node1 == node2) {
    return 0
  }
  if(node1.compareDocumentPosition) {
    return node1.compareDocumentPosition(node2) & 2 ? 1 : -1
  }
  if("sourceIndex" in node1 || node1.parentNode && "sourceIndex" in node1.parentNode) {
    var isElement1 = node1.nodeType == goog.dom.NodeType.ELEMENT;
    var isElement2 = node2.nodeType == goog.dom.NodeType.ELEMENT;
    if(isElement1 && isElement2) {
      return node1.sourceIndex - node2.sourceIndex
    }else {
      var parent1 = node1.parentNode;
      var parent2 = node2.parentNode;
      if(parent1 == parent2) {
        return goog.dom.compareSiblingOrder_(node1, node2)
      }
      if(!isElement1 && goog.dom.contains(parent1, node2)) {
        return-1 * goog.dom.compareParentsDescendantNodeIe_(node1, node2)
      }
      if(!isElement2 && goog.dom.contains(parent2, node1)) {
        return goog.dom.compareParentsDescendantNodeIe_(node2, node1)
      }
      return(isElement1 ? node1.sourceIndex : parent1.sourceIndex) - (isElement2 ? node2.sourceIndex : parent2.sourceIndex)
    }
  }
  var doc = goog.dom.getOwnerDocument(node1);
  var range1, range2;
  range1 = doc.createRange();
  range1.selectNode(node1);
  range1.collapse(true);
  range2 = doc.createRange();
  range2.selectNode(node2);
  range2.collapse(true);
  return range1.compareBoundaryPoints(goog.global["Range"].START_TO_END, range2)
};
goog.dom.compareParentsDescendantNodeIe_ = function(textNode, node) {
  var parent = textNode.parentNode;
  if(parent == node) {
    return-1
  }
  var sibling = node;
  while(sibling.parentNode != parent) {
    sibling = sibling.parentNode
  }
  return goog.dom.compareSiblingOrder_(sibling, textNode)
};
goog.dom.compareSiblingOrder_ = function(node1, node2) {
  var s = node2;
  while(s = s.previousSibling) {
    if(s == node1) {
      return-1
    }
  }
  return 1
};
goog.dom.findCommonAncestor = function(var_args) {
  var i, count = arguments.length;
  if(!count) {
    return null
  }else {
    if(count == 1) {
      return arguments[0]
    }
  }
  var paths = [];
  var minLength = Infinity;
  for(i = 0;i < count;i++) {
    var ancestors = [];
    var node = arguments[i];
    while(node) {
      ancestors.unshift(node);
      node = node.parentNode
    }
    paths.push(ancestors);
    minLength = Math.min(minLength, ancestors.length)
  }
  var output = null;
  for(i = 0;i < minLength;i++) {
    var first = paths[0][i];
    for(var j = 1;j < count;j++) {
      if(first != paths[j][i]) {
        return output
      }
    }
    output = first
  }
  return output
};
goog.dom.getOwnerDocument = function(node) {
  return node.nodeType == goog.dom.NodeType.DOCUMENT ? node : node.ownerDocument || node.document
};
goog.dom.getFrameContentDocument = function(frame) {
  var doc;
  if(goog.userAgent.WEBKIT) {
    doc = frame.document || frame.contentWindow.document
  }else {
    doc = frame.contentDocument || frame.contentWindow.document
  }
  return doc
};
goog.dom.getFrameContentWindow = function(frame) {
  return frame.contentWindow || goog.dom.getWindow_(goog.dom.getFrameContentDocument(frame))
};
goog.dom.setTextContent = function(element, text) {
  if("textContent" in element) {
    element.textContent = text
  }else {
    if(element.firstChild && element.firstChild.nodeType == goog.dom.NodeType.TEXT) {
      while(element.lastChild != element.firstChild) {
        element.removeChild(element.lastChild)
      }
      element.firstChild.data = text
    }else {
      goog.dom.removeChildren(element);
      var doc = goog.dom.getOwnerDocument(element);
      element.appendChild(doc.createTextNode(text))
    }
  }
};
goog.dom.getOuterHtml = function(element) {
  if("outerHTML" in element) {
    return element.outerHTML
  }else {
    var doc = goog.dom.getOwnerDocument(element);
    var div = doc.createElement("div");
    div.appendChild(element.cloneNode(true));
    return div.innerHTML
  }
};
goog.dom.findNode = function(root, p) {
  var rv = [];
  var found = goog.dom.findNodes_(root, p, rv, true);
  return found ? rv[0] : undefined
};
goog.dom.findNodes = function(root, p) {
  var rv = [];
  goog.dom.findNodes_(root, p, rv, false);
  return rv
};
goog.dom.findNodes_ = function(root, p, rv, findOne) {
  if(root != null) {
    for(var i = 0, child;child = root.childNodes[i];i++) {
      if(p(child)) {
        rv.push(child);
        if(findOne) {
          return true
        }
      }
      if(goog.dom.findNodes_(child, p, rv, findOne)) {
        return true
      }
    }
  }
  return false
};
goog.dom.TAGS_TO_IGNORE_ = {"SCRIPT":1, "STYLE":1, "HEAD":1, "IFRAME":1, "OBJECT":1};
goog.dom.PREDEFINED_TAG_VALUES_ = {"IMG":" ", "BR":"\n"};
goog.dom.isFocusableTabIndex = function(element) {
  var attrNode = element.getAttributeNode("tabindex");
  if(attrNode && attrNode.specified) {
    var index = element.tabIndex;
    return goog.isNumber(index) && index >= 0
  }
  return false
};
goog.dom.setFocusableTabIndex = function(element, enable) {
  if(enable) {
    element.tabIndex = 0
  }else {
    element.removeAttribute("tabIndex")
  }
};
goog.dom.getTextContent = function(node) {
  var textContent;
  if(goog.dom.BrowserFeature.CAN_USE_INNER_TEXT && "innerText" in node) {
    textContent = goog.string.canonicalizeNewlines(node.innerText)
  }else {
    var buf = [];
    goog.dom.getTextContent_(node, buf, true);
    textContent = buf.join("")
  }
  textContent = textContent.replace(/ \xAD /g, " ").replace(/\xAD/g, "");
  textContent = textContent.replace(/\u200B/g, "");
  if(!goog.userAgent.IE) {
    textContent = textContent.replace(/ +/g, " ")
  }
  if(textContent != " ") {
    textContent = textContent.replace(/^\s*/, "")
  }
  return textContent
};
goog.dom.getRawTextContent = function(node) {
  var buf = [];
  goog.dom.getTextContent_(node, buf, false);
  return buf.join("")
};
goog.dom.getTextContent_ = function(node, buf, normalizeWhitespace) {
  if(node.nodeName in goog.dom.TAGS_TO_IGNORE_) {
  }else {
    if(node.nodeType == goog.dom.NodeType.TEXT) {
      if(normalizeWhitespace) {
        buf.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ""))
      }else {
        buf.push(node.nodeValue)
      }
    }else {
      if(node.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
        buf.push(goog.dom.PREDEFINED_TAG_VALUES_[node.nodeName])
      }else {
        var child = node.firstChild;
        while(child) {
          goog.dom.getTextContent_(child, buf, normalizeWhitespace);
          child = child.nextSibling
        }
      }
    }
  }
};
goog.dom.getNodeTextLength = function(node) {
  return goog.dom.getTextContent(node).length
};
goog.dom.getNodeTextOffset = function(node, opt_offsetParent) {
  var root = opt_offsetParent || goog.dom.getOwnerDocument(node).body;
  var buf = [];
  while(node && node != root) {
    var cur = node;
    while(cur = cur.previousSibling) {
      buf.unshift(goog.dom.getTextContent(cur))
    }
    node = node.parentNode
  }
  return goog.string.trimLeft(buf.join("")).replace(/ +/g, " ").length
};
goog.dom.getNodeAtOffset = function(parent, offset, opt_result) {
  var stack = [parent], pos = 0, cur;
  while(stack.length > 0 && pos < offset) {
    cur = stack.pop();
    if(cur.nodeName in goog.dom.TAGS_TO_IGNORE_) {
    }else {
      if(cur.nodeType == goog.dom.NodeType.TEXT) {
        var text = cur.nodeValue.replace(/(\r\n|\r|\n)/g, "").replace(/ +/g, " ");
        pos += text.length
      }else {
        if(cur.nodeName in goog.dom.PREDEFINED_TAG_VALUES_) {
          pos += goog.dom.PREDEFINED_TAG_VALUES_[cur.nodeName].length
        }else {
          for(var i = cur.childNodes.length - 1;i >= 0;i--) {
            stack.push(cur.childNodes[i])
          }
        }
      }
    }
  }
  if(goog.isObject(opt_result)) {
    opt_result.remainder = cur ? cur.nodeValue.length + offset - pos - 1 : 0;
    opt_result.node = cur
  }
  return cur
};
goog.dom.isNodeList = function(val) {
  if(val && typeof val.length == "number") {
    if(goog.isObject(val)) {
      return typeof val.item == "function" || typeof val.item == "string"
    }else {
      if(goog.isFunction(val)) {
        return typeof val.item == "function"
      }
    }
  }
  return false
};
goog.dom.getAncestorByTagNameAndClass = function(element, opt_tag, opt_class) {
  var tagName = opt_tag ? opt_tag.toUpperCase() : null;
  return goog.dom.getAncestor(element, function(node) {
    return(!tagName || node.nodeName == tagName) && (!opt_class || goog.dom.classes.has(node, opt_class))
  }, true)
};
goog.dom.getAncestorByClass = function(element, opt_class) {
  return goog.dom.getAncestorByTagNameAndClass(element, null, opt_class)
};
goog.dom.getAncestor = function(element, matcher, opt_includeNode, opt_maxSearchSteps) {
  if(!opt_includeNode) {
    element = element.parentNode
  }
  var ignoreSearchSteps = opt_maxSearchSteps == null;
  var steps = 0;
  while(element && (ignoreSearchSteps || steps <= opt_maxSearchSteps)) {
    if(matcher(element)) {
      return element
    }
    element = element.parentNode;
    steps++
  }
  return null
};
goog.dom.DomHelper = function(opt_document) {
  this.document_ = opt_document || goog.global.document || document
};
goog.dom.DomHelper.prototype.getDomHelper = goog.dom.getDomHelper;
goog.dom.DomHelper.prototype.setDocument = function(document) {
  this.document_ = document
};
goog.dom.DomHelper.prototype.getDocument = function() {
  return this.document_
};
goog.dom.DomHelper.prototype.getElement = function(element) {
  if(goog.isString(element)) {
    return this.document_.getElementById(element)
  }else {
    return element
  }
};
goog.dom.DomHelper.prototype.$ = goog.dom.DomHelper.prototype.getElement;
goog.dom.DomHelper.prototype.getElementsByTagNameAndClass = function(opt_tag, opt_class, opt_el) {
  return goog.dom.getElementsByTagNameAndClass_(this.document_, opt_tag, opt_class, opt_el)
};
goog.dom.DomHelper.prototype.getElementsByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementsByClass(className, doc)
};
goog.dom.DomHelper.prototype.getElementByClass = function(className, opt_el) {
  var doc = opt_el || this.document_;
  return goog.dom.getElementByClass(className, doc)
};
goog.dom.DomHelper.prototype.$$ = goog.dom.DomHelper.prototype.getElementsByTagNameAndClass;
goog.dom.DomHelper.prototype.setProperties = goog.dom.setProperties;
goog.dom.DomHelper.prototype.getViewportSize = function(opt_window) {
  return goog.dom.getViewportSize(opt_window || this.getWindow())
};
goog.dom.DomHelper.prototype.getDocumentHeight = function() {
  return goog.dom.getDocumentHeight_(this.getWindow())
};
goog.dom.Appendable;
goog.dom.DomHelper.prototype.createDom = function(tagName, opt_attributes, var_args) {
  return goog.dom.createDom_(this.document_, arguments)
};
goog.dom.DomHelper.prototype.$dom = goog.dom.DomHelper.prototype.createDom;
goog.dom.DomHelper.prototype.createElement = function(name) {
  return this.document_.createElement(name)
};
goog.dom.DomHelper.prototype.createTextNode = function(content) {
  return this.document_.createTextNode(content)
};
goog.dom.DomHelper.prototype.createTable = function(rows, columns, opt_fillWithNbsp) {
  return goog.dom.createTable_(this.document_, rows, columns, !!opt_fillWithNbsp)
};
goog.dom.DomHelper.prototype.htmlToDocumentFragment = function(htmlString) {
  return goog.dom.htmlToDocumentFragment_(this.document_, htmlString)
};
goog.dom.DomHelper.prototype.getCompatMode = function() {
  return this.isCss1CompatMode() ? "CSS1Compat" : "BackCompat"
};
goog.dom.DomHelper.prototype.isCss1CompatMode = function() {
  return goog.dom.isCss1CompatMode_(this.document_)
};
goog.dom.DomHelper.prototype.getWindow = function() {
  return goog.dom.getWindow_(this.document_)
};
goog.dom.DomHelper.prototype.getDocumentScrollElement = function() {
  return goog.dom.getDocumentScrollElement_(this.document_)
};
goog.dom.DomHelper.prototype.getDocumentScroll = function() {
  return goog.dom.getDocumentScroll_(this.document_)
};
goog.dom.DomHelper.prototype.appendChild = goog.dom.appendChild;
goog.dom.DomHelper.prototype.append = goog.dom.append;
goog.dom.DomHelper.prototype.removeChildren = goog.dom.removeChildren;
goog.dom.DomHelper.prototype.insertSiblingBefore = goog.dom.insertSiblingBefore;
goog.dom.DomHelper.prototype.insertSiblingAfter = goog.dom.insertSiblingAfter;
goog.dom.DomHelper.prototype.removeNode = goog.dom.removeNode;
goog.dom.DomHelper.prototype.replaceNode = goog.dom.replaceNode;
goog.dom.DomHelper.prototype.flattenElement = goog.dom.flattenElement;
goog.dom.DomHelper.prototype.getFirstElementChild = goog.dom.getFirstElementChild;
goog.dom.DomHelper.prototype.getLastElementChild = goog.dom.getLastElementChild;
goog.dom.DomHelper.prototype.getNextElementSibling = goog.dom.getNextElementSibling;
goog.dom.DomHelper.prototype.getPreviousElementSibling = goog.dom.getPreviousElementSibling;
goog.dom.DomHelper.prototype.getNextNode = goog.dom.getNextNode;
goog.dom.DomHelper.prototype.getPreviousNode = goog.dom.getPreviousNode;
goog.dom.DomHelper.prototype.isNodeLike = goog.dom.isNodeLike;
goog.dom.DomHelper.prototype.contains = goog.dom.contains;
goog.dom.DomHelper.prototype.getOwnerDocument = goog.dom.getOwnerDocument;
goog.dom.DomHelper.prototype.getFrameContentDocument = goog.dom.getFrameContentDocument;
goog.dom.DomHelper.prototype.getFrameContentWindow = goog.dom.getFrameContentWindow;
goog.dom.DomHelper.prototype.setTextContent = goog.dom.setTextContent;
goog.dom.DomHelper.prototype.findNode = goog.dom.findNode;
goog.dom.DomHelper.prototype.findNodes = goog.dom.findNodes;
goog.dom.DomHelper.prototype.getTextContent = goog.dom.getTextContent;
goog.dom.DomHelper.prototype.getNodeTextLength = goog.dom.getNodeTextLength;
goog.dom.DomHelper.prototype.getNodeTextOffset = goog.dom.getNodeTextOffset;
goog.dom.DomHelper.prototype.getAncestorByTagNameAndClass = goog.dom.getAncestorByTagNameAndClass;
goog.dom.DomHelper.prototype.getAncestor = goog.dom.getAncestor;
goog.provide("goog.functions");
goog.functions.constant = function(retValue) {
  return function() {
    return retValue
  }
};
goog.functions.FALSE = goog.functions.constant(false);
goog.functions.TRUE = goog.functions.constant(true);
goog.functions.NULL = goog.functions.constant(null);
goog.functions.identity = function(opt_returnValue, var_args) {
  return opt_returnValue
};
goog.functions.error = function(message) {
  return function() {
    throw Error(message);
  }
};
goog.functions.lock = function(f) {
  return function() {
    return f.call(this)
  }
};
goog.functions.withReturnValue = function(f, retValue) {
  return goog.functions.sequence(f, goog.functions.constant(retValue))
};
goog.functions.compose = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    var result;
    if(length) {
      result = functions[length - 1].apply(this, arguments)
    }
    for(var i = length - 2;i >= 0;i--) {
      result = functions[i].call(this, result)
    }
    return result
  }
};
goog.functions.sequence = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    var result;
    for(var i = 0;i < length;i++) {
      result = functions[i].apply(this, arguments)
    }
    return result
  }
};
goog.functions.and = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    for(var i = 0;i < length;i++) {
      if(!functions[i].apply(this, arguments)) {
        return false
      }
    }
    return true
  }
};
goog.functions.or = function(var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    for(var i = 0;i < length;i++) {
      if(functions[i].apply(this, arguments)) {
        return true
      }
    }
    return false
  }
};
goog.functions.not = function(f) {
  return function() {
    return!f.apply(this, arguments)
  }
};
goog.functions.create = function(constructor, var_args) {
  var temp = function() {
  };
  temp.prototype = constructor.prototype;
  var obj = new temp;
  constructor.apply(obj, Array.prototype.slice.call(arguments, 1));
  return obj
};
/*
 Portions of this code are from the Dojo Toolkit, received by
 The Closure Library Authors under the BSD license. All other code is
 Copyright 2005-2009 The Closure Library Authors. All Rights Reserved.

 The "New" BSD License:

 Copyright (c) 2005-2009, The Dojo Foundation
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 Redistributions of source code must retain the above copyright notice, this
 list of conditions and the following disclaimer.
 Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.
 Neither the name of the Dojo Foundation nor the names of its contributors
 may be used to endorse or promote products derived from this software
 without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE
 FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
goog.provide("goog.dom.query");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.functions");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.dom.query = function() {
  var cssCaseBug = goog.userAgent.WEBKIT && goog.dom.getDocument().compatMode == "BackCompat";
  var childNodesName = !!goog.dom.getDocument().firstChild["children"] ? "children" : "childNodes";
  var specials = ">~+";
  var caseSensitive = false;
  var getQueryParts = function(query) {
    if(specials.indexOf(query.slice(-1)) >= 0) {
      query += " * "
    }else {
      query += " "
    }
    var ts = function(s, e) {
      return goog.string.trim(query.slice(s, e))
    };
    var queryParts = [];
    var inBrackets = -1, inParens = -1, inMatchFor = -1, inPseudo = -1, inClass = -1, inId = -1, inTag = -1, lc = "", cc = "", pStart;
    var x = 0, ql = query.length, currentPart = null, cp = null;
    var endTag = function() {
      if(inTag >= 0) {
        var tv = inTag == x ? null : ts(inTag, x);
        if(specials.indexOf(tv) < 0) {
          currentPart.tag = tv
        }else {
          currentPart.oper = tv
        }
        inTag = -1
      }
    };
    var endId = function() {
      if(inId >= 0) {
        currentPart.id = ts(inId, x).replace(/\\/g, "");
        inId = -1
      }
    };
    var endClass = function() {
      if(inClass >= 0) {
        currentPart.classes.push(ts(inClass + 1, x).replace(/\\/g, ""));
        inClass = -1
      }
    };
    var endAll = function() {
      endId();
      endTag();
      endClass()
    };
    var endPart = function() {
      endAll();
      if(inPseudo >= 0) {
        currentPart.pseudos.push({name:ts(inPseudo + 1, x)})
      }
      currentPart.loops = currentPart.pseudos.length || currentPart.attrs.length || currentPart.classes.length;
      currentPart.oquery = currentPart.query = ts(pStart, x);
      currentPart.otag = currentPart.tag = currentPart.oper ? null : currentPart.tag || "*";
      if(currentPart.tag) {
        currentPart.tag = currentPart.tag.toUpperCase()
      }
      if(queryParts.length && queryParts[queryParts.length - 1].oper) {
        currentPart.infixOper = queryParts.pop();
        currentPart.query = currentPart.infixOper.query + " " + currentPart.query
      }
      queryParts.push(currentPart);
      currentPart = null
    };
    for(;lc = cc, cc = query.charAt(x), x < ql;x++) {
      if(lc == "\\") {
        continue
      }
      if(!currentPart) {
        pStart = x;
        currentPart = {query:null, pseudos:[], attrs:[], classes:[], tag:null, oper:null, id:null, getTag:function() {
          return caseSensitive ? this.otag : this.tag
        }};
        inTag = x
      }
      if(inBrackets >= 0) {
        if(cc == "]") {
          if(!cp.attr) {
            cp.attr = ts(inBrackets + 1, x)
          }else {
            cp.matchFor = ts(inMatchFor || inBrackets + 1, x)
          }
          var cmf = cp.matchFor;
          if(cmf) {
            if(cmf.charAt(0) == '"' || cmf.charAt(0) == "'") {
              cp.matchFor = cmf.slice(1, -1)
            }
          }
          currentPart.attrs.push(cp);
          cp = null;
          inBrackets = inMatchFor = -1
        }else {
          if(cc == "=") {
            var addToCc = "|~^$*".indexOf(lc) >= 0 ? lc : "";
            cp.type = addToCc + cc;
            cp.attr = ts(inBrackets + 1, x - addToCc.length);
            inMatchFor = x + 1
          }
        }
      }else {
        if(inParens >= 0) {
          if(cc == ")") {
            if(inPseudo >= 0) {
              cp.value = ts(inParens + 1, x)
            }
            inPseudo = inParens = -1
          }
        }else {
          if(cc == "#") {
            endAll();
            inId = x + 1
          }else {
            if(cc == ".") {
              endAll();
              inClass = x
            }else {
              if(cc == ":") {
                endAll();
                inPseudo = x
              }else {
                if(cc == "[") {
                  endAll();
                  inBrackets = x;
                  cp = {}
                }else {
                  if(cc == "(") {
                    if(inPseudo >= 0) {
                      cp = {name:ts(inPseudo + 1, x), value:null};
                      currentPart.pseudos.push(cp)
                    }
                    inParens = x
                  }else {
                    if(cc == " " && lc != cc) {
                      endPart()
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    return queryParts
  };
  var agree = function(first, second) {
    if(!first) {
      return second
    }
    if(!second) {
      return first
    }
    return function() {
      return first.apply(window, arguments) && second.apply(window, arguments)
    }
  };
  function getArr(i, opt_arr) {
    var r = opt_arr || [];
    if(i) {
      r.push(i)
    }
    return r
  }
  var isElement = function(n) {
    return 1 == n.nodeType
  };
  var blank = "";
  var getAttr = function(elem, attr) {
    if(!elem) {
      return blank
    }
    if(attr == "class") {
      return elem.className || blank
    }
    if(attr == "for") {
      return elem.htmlFor || blank
    }
    if(attr == "style") {
      return elem.style.cssText || blank
    }
    return(caseSensitive ? elem.getAttribute(attr) : elem.getAttribute(attr, 2)) || blank
  };
  var attrs = {"*=":function(attr, value) {
    return function(elem) {
      return getAttr(elem, attr).indexOf(value) >= 0
    }
  }, "^=":function(attr, value) {
    return function(elem) {
      return getAttr(elem, attr).indexOf(value) == 0
    }
  }, "$=":function(attr, value) {
    var tval = " " + value;
    return function(elem) {
      var ea = " " + getAttr(elem, attr);
      return ea.lastIndexOf(value) == ea.length - value.length
    }
  }, "~=":function(attr, value) {
    var tval = " " + value + " ";
    return function(elem) {
      var ea = " " + getAttr(elem, attr) + " ";
      return ea.indexOf(tval) >= 0
    }
  }, "|=":function(attr, value) {
    value = " " + value;
    return function(elem) {
      var ea = " " + getAttr(elem, attr);
      return ea == value || ea.indexOf(value + "-") == 0
    }
  }, "=":function(attr, value) {
    return function(elem) {
      return getAttr(elem, attr) == value
    }
  }};
  var noNextElementSibling = typeof goog.dom.getDocument().firstChild.nextElementSibling == "undefined";
  var nSibling = !noNextElementSibling ? "nextElementSibling" : "nextSibling";
  var pSibling = !noNextElementSibling ? "previousElementSibling" : "previousSibling";
  var simpleNodeTest = noNextElementSibling ? isElement : goog.functions.TRUE;
  var _lookLeft = function(node) {
    while(node = node[pSibling]) {
      if(simpleNodeTest(node)) {
        return false
      }
    }
    return true
  };
  var _lookRight = function(node) {
    while(node = node[nSibling]) {
      if(simpleNodeTest(node)) {
        return false
      }
    }
    return true
  };
  var getNodeIndex = function(node) {
    var root = node.parentNode;
    var i = 0, tret = root[childNodesName], ci = node["_i"] || -1, cl = root["_l"] || -1;
    if(!tret) {
      return-1
    }
    var l = tret.length;
    if(cl == l && ci >= 0 && cl >= 0) {
      return ci
    }
    root["_l"] = l;
    ci = -1;
    var te = root["firstElementChild"] || root["firstChild"];
    for(;te;te = te[nSibling]) {
      if(simpleNodeTest(te)) {
        te["_i"] = ++i;
        if(node === te) {
          ci = i
        }
      }
    }
    return ci
  };
  var isEven = function(elem) {
    return!(getNodeIndex(elem) % 2)
  };
  var isOdd = function(elem) {
    return getNodeIndex(elem) % 2
  };
  var pseudos = {"checked":function(name, condition) {
    return function(elem) {
      return elem.checked || elem.attributes["checked"]
    }
  }, "first-child":function() {
    return _lookLeft
  }, "last-child":function() {
    return _lookRight
  }, "only-child":function(name, condition) {
    return function(node) {
      if(!_lookLeft(node)) {
        return false
      }
      if(!_lookRight(node)) {
        return false
      }
      return true
    }
  }, "empty":function(name, condition) {
    return function(elem) {
      var cn = elem.childNodes;
      var cnl = elem.childNodes.length;
      for(var x = cnl - 1;x >= 0;x--) {
        var nt = cn[x].nodeType;
        if(nt === 1 || nt == 3) {
          return false
        }
      }
      return true
    }
  }, "contains":function(name, condition) {
    var cz = condition.charAt(0);
    if(cz == '"' || cz == "'") {
      condition = condition.slice(1, -1)
    }
    return function(elem) {
      return elem.innerHTML.indexOf(condition) >= 0
    }
  }, "not":function(name, condition) {
    var p = getQueryParts(condition)[0];
    var ignores = {el:1};
    if(p.tag != "*") {
      ignores.tag = 1
    }
    if(!p.classes.length) {
      ignores.classes = 1
    }
    var ntf = getSimpleFilterFunc(p, ignores);
    return function(elem) {
      return!ntf(elem)
    }
  }, "nth-child":function(name, condition) {
    function pi(n) {
      return parseInt(n, 10)
    }
    if(condition == "odd") {
      return isOdd
    }else {
      if(condition == "even") {
        return isEven
      }
    }
    if(condition.indexOf("n") != -1) {
      var tparts = condition.split("n", 2);
      var pred = tparts[0] ? tparts[0] == "-" ? -1 : pi(tparts[0]) : 1;
      var idx = tparts[1] ? pi(tparts[1]) : 0;
      var lb = 0, ub = -1;
      if(pred > 0) {
        if(idx < 0) {
          idx = idx % pred && pred + idx % pred
        }else {
          if(idx > 0) {
            if(idx >= pred) {
              lb = idx - idx % pred
            }
            idx = idx % pred
          }
        }
      }else {
        if(pred < 0) {
          pred *= -1;
          if(idx > 0) {
            ub = idx;
            idx = idx % pred
          }
        }
      }
      if(pred > 0) {
        return function(elem) {
          var i = getNodeIndex(elem);
          return i >= lb && (ub < 0 || i <= ub) && i % pred == idx
        }
      }else {
        condition = idx
      }
    }
    var ncount = pi(condition);
    return function(elem) {
      return getNodeIndex(elem) == ncount
    }
  }};
  var defaultGetter = goog.userAgent.IE ? function(cond) {
    var clc = cond.toLowerCase();
    if(clc == "class") {
      cond = "className"
    }
    return function(elem) {
      return caseSensitive ? elem.getAttribute(cond) : elem[cond] || elem[clc]
    }
  } : function(cond) {
    return function(elem) {
      return elem && elem.getAttribute && elem.hasAttribute(cond)
    }
  };
  var getSimpleFilterFunc = function(query, ignores) {
    if(!query) {
      return goog.functions.TRUE
    }
    ignores = ignores || {};
    var ff = null;
    if(!ignores.el) {
      ff = agree(ff, isElement)
    }
    if(!ignores.tag) {
      if(query.tag != "*") {
        ff = agree(ff, function(elem) {
          return elem && elem.tagName == query.getTag()
        })
      }
    }
    if(!ignores.classes) {
      goog.array.forEach(query.classes, function(cname, idx, arr) {
        var re = new RegExp("(?:^|\\s)" + cname + "(?:\\s|$)");
        ff = agree(ff, function(elem) {
          return re.test(elem.className)
        });
        ff.count = idx
      })
    }
    if(!ignores.pseudos) {
      goog.array.forEach(query.pseudos, function(pseudo) {
        var pn = pseudo.name;
        if(pseudos[pn]) {
          ff = agree(ff, pseudos[pn](pn, pseudo.value))
        }
      })
    }
    if(!ignores.attrs) {
      goog.array.forEach(query.attrs, function(attr) {
        var matcher;
        var a = attr.attr;
        if(attr.type && attrs[attr.type]) {
          matcher = attrs[attr.type](a, attr.matchFor)
        }else {
          if(a.length) {
            matcher = defaultGetter(a)
          }
        }
        if(matcher) {
          ff = agree(ff, matcher)
        }
      })
    }
    if(!ignores.id) {
      if(query.id) {
        ff = agree(ff, function(elem) {
          return!!elem && elem.id == query.id
        })
      }
    }
    if(!ff) {
      if(!("default" in ignores)) {
        ff = goog.functions.TRUE
      }
    }
    return ff
  };
  var nextSiblingIterator = function(filterFunc) {
    return function(node, ret, bag) {
      while(node = node[nSibling]) {
        if(noNextElementSibling && !isElement(node)) {
          continue
        }
        if((!bag || _isUnique(node, bag)) && filterFunc(node)) {
          ret.push(node)
        }
        break
      }
      return ret
    }
  };
  var nextSiblingsIterator = function(filterFunc) {
    return function(root, ret, bag) {
      var te = root[nSibling];
      while(te) {
        if(simpleNodeTest(te)) {
          if(bag && !_isUnique(te, bag)) {
            break
          }
          if(filterFunc(te)) {
            ret.push(te)
          }
        }
        te = te[nSibling]
      }
      return ret
    }
  };
  var _childElements = function(filterFunc) {
    filterFunc = filterFunc || goog.functions.TRUE;
    return function(root, ret, bag) {
      var te, x = 0, tret = root[childNodesName];
      while(te = tret[x++]) {
        if(simpleNodeTest(te) && (!bag || _isUnique(te, bag)) && filterFunc(te, x)) {
          ret.push(te)
        }
      }
      return ret
    }
  };
  var _isDescendant = function(node, root) {
    var pn = node.parentNode;
    while(pn) {
      if(pn == root) {
        break
      }
      pn = pn.parentNode
    }
    return!!pn
  };
  var _getElementsFuncCache = {};
  var getElementsFunc = function(query) {
    var retFunc = _getElementsFuncCache[query.query];
    if(retFunc) {
      return retFunc
    }
    var io = query.infixOper;
    var oper = io ? io.oper : "";
    var filterFunc = getSimpleFilterFunc(query, {el:1});
    var qt = query.tag;
    var wildcardTag = "*" == qt;
    var ecs = goog.dom.getDocument()["getElementsByClassName"];
    if(!oper) {
      if(query.id) {
        filterFunc = !query.loops && wildcardTag ? goog.functions.TRUE : getSimpleFilterFunc(query, {el:1, id:1});
        retFunc = function(root, arr) {
          var te = goog.dom.getDomHelper(root).getElement(query.id);
          if(!te || !filterFunc(te)) {
            return
          }
          if(9 == root.nodeType) {
            return getArr(te, arr)
          }else {
            if(_isDescendant(te, root)) {
              return getArr(te, arr)
            }
          }
        }
      }else {
        if(ecs && /\{\s*\[native code\]\s*\}/.test(String(ecs)) && query.classes.length && !cssCaseBug) {
          filterFunc = getSimpleFilterFunc(query, {el:1, classes:1, id:1});
          var classesString = query.classes.join(" ");
          retFunc = function(root, arr) {
            var ret = getArr(0, arr), te, x = 0;
            var tret = root.getElementsByClassName(classesString);
            while(te = tret[x++]) {
              if(filterFunc(te, root)) {
                ret.push(te)
              }
            }
            return ret
          }
        }else {
          if(!wildcardTag && !query.loops) {
            retFunc = function(root, arr) {
              var ret = getArr(0, arr), te, x = 0;
              var tret = root.getElementsByTagName(query.getTag());
              while(te = tret[x++]) {
                ret.push(te)
              }
              return ret
            }
          }else {
            filterFunc = getSimpleFilterFunc(query, {el:1, tag:1, id:1});
            retFunc = function(root, arr) {
              var ret = getArr(0, arr), te, x = 0;
              var tret = root.getElementsByTagName(query.getTag());
              while(te = tret[x++]) {
                if(filterFunc(te, root)) {
                  ret.push(te)
                }
              }
              return ret
            }
          }
        }
      }
    }else {
      var skipFilters = {el:1};
      if(wildcardTag) {
        skipFilters.tag = 1
      }
      filterFunc = getSimpleFilterFunc(query, skipFilters);
      if("+" == oper) {
        retFunc = nextSiblingIterator(filterFunc)
      }else {
        if("~" == oper) {
          retFunc = nextSiblingsIterator(filterFunc)
        }else {
          if(">" == oper) {
            retFunc = _childElements(filterFunc)
          }
        }
      }
    }
    return _getElementsFuncCache[query.query] = retFunc
  };
  var filterDown = function(root, queryParts) {
    var candidates = getArr(root), qp, x, te, qpl = queryParts.length, bag, ret;
    for(var i = 0;i < qpl;i++) {
      ret = [];
      qp = queryParts[i];
      x = candidates.length - 1;
      if(x > 0) {
        bag = {};
        ret.nozip = true
      }
      var gef = getElementsFunc(qp);
      for(var j = 0;te = candidates[j];j++) {
        gef(te, ret, bag)
      }
      if(!ret.length) {
        break
      }
      candidates = ret
    }
    return ret
  };
  var _queryFuncCacheDOM = {}, _queryFuncCacheQSA = {};
  var getStepQueryFunc = function(query) {
    var qparts = getQueryParts(goog.string.trim(query));
    if(qparts.length == 1) {
      var tef = getElementsFunc(qparts[0]);
      return function(root) {
        var r = tef(root, []);
        if(r) {
          r.nozip = true
        }
        return r
      }
    }
    return function(root) {
      return filterDown(root, qparts)
    }
  };
  var qsa = "querySelectorAll";
  var qsaAvail = !!goog.dom.getDocument()[qsa] && (!goog.userAgent.WEBKIT || goog.userAgent.isVersion("526"));
  var getQueryFunc = function(query, opt_forceDOM) {
    if(qsaAvail) {
      var qsaCached = _queryFuncCacheQSA[query];
      if(qsaCached && !opt_forceDOM) {
        return qsaCached
      }
    }
    var domCached = _queryFuncCacheDOM[query];
    if(domCached) {
      return domCached
    }
    var qcz = query.charAt(0);
    var nospace = -1 == query.indexOf(" ");
    if(query.indexOf("#") >= 0 && nospace) {
      opt_forceDOM = true
    }
    var useQSA = qsaAvail && !opt_forceDOM && specials.indexOf(qcz) == -1 && (!goog.userAgent.IE || query.indexOf(":") == -1) && !(cssCaseBug && query.indexOf(".") >= 0) && query.indexOf(":contains") == -1 && query.indexOf("|=") == -1;
    if(useQSA) {
      var tq = specials.indexOf(query.charAt(query.length - 1)) >= 0 ? query + " *" : query;
      return _queryFuncCacheQSA[query] = function(root) {
        try {
          if(!(9 == root.nodeType || nospace)) {
            throw"";
          }
          var r = root[qsa](tq);
          if(goog.userAgent.IE) {
            r.commentStrip = true
          }else {
            r.nozip = true
          }
          return r
        }catch(e) {
          return getQueryFunc(query, true)(root)
        }
      }
    }else {
      var parts = query.split(/\s*,\s*/);
      return _queryFuncCacheDOM[query] = parts.length < 2 ? getStepQueryFunc(query) : function(root) {
        var pindex = 0, ret = [], tp;
        while(tp = parts[pindex++]) {
          ret = ret.concat(getStepQueryFunc(tp)(root))
        }
        return ret
      }
    }
  };
  var _zipIdx = 0;
  var _nodeUID = goog.userAgent.IE ? function(node) {
    if(caseSensitive) {
      return node.getAttribute("_uid") || node.setAttribute("_uid", ++_zipIdx) || _zipIdx
    }else {
      return node.uniqueID
    }
  } : function(node) {
    return node["_uid"] || (node["_uid"] = ++_zipIdx)
  };
  var _isUnique = function(node, bag) {
    if(!bag) {
      return 1
    }
    var id = _nodeUID(node);
    if(!bag[id]) {
      return bag[id] = 1
    }
    return 0
  };
  var _zipIdxName = "_zipIdx";
  var _zip = function(arr) {
    if(arr && arr.nozip) {
      return arr
    }
    var ret = [];
    if(!arr || !arr.length) {
      return ret
    }
    if(arr[0]) {
      ret.push(arr[0])
    }
    if(arr.length < 2) {
      return ret
    }
    _zipIdx++;
    if(goog.userAgent.IE && caseSensitive) {
      var szidx = _zipIdx + "";
      arr[0].setAttribute(_zipIdxName, szidx);
      for(var x = 1, te;te = arr[x];x++) {
        if(arr[x].getAttribute(_zipIdxName) != szidx) {
          ret.push(te)
        }
        te.setAttribute(_zipIdxName, szidx)
      }
    }else {
      if(goog.userAgent.IE && arr.commentStrip) {
        try {
          for(var x = 1, te;te = arr[x];x++) {
            if(isElement(te)) {
              ret.push(te)
            }
          }
        }catch(e) {
        }
      }else {
        if(arr[0]) {
          arr[0][_zipIdxName] = _zipIdx
        }
        for(var x = 1, te;te = arr[x];x++) {
          if(arr[x][_zipIdxName] != _zipIdx) {
            ret.push(te)
          }
          te[_zipIdxName] = _zipIdx
        }
      }
    }
    return ret
  };
  var query = function(query, root) {
    if(!query) {
      return[]
    }
    if(query.constructor == Array) {
      return query
    }
    if(!goog.isString(query)) {
      return[query]
    }
    if(goog.isString(root)) {
      root = goog.dom.getElement(root);
      if(!root) {
        return[]
      }
    }
    root = root || goog.dom.getDocument();
    var od = root.ownerDocument || root.documentElement;
    caseSensitive = root.contentType && root.contentType == "application/xml" || goog.userAgent.OPERA && (root.doctype || od.toString() == "[object XMLDocument]") || !!od && (goog.userAgent.IE ? od.xml : root.xmlVersion || od.xmlVersion);
    var r = getQueryFunc(query)(root);
    if(r && r.nozip) {
      return r
    }
    return _zip(r)
  };
  query.pseudos = pseudos;
  return query
}();
goog.exportSymbol("goog.dom.query", goog.dom.query);
goog.exportSymbol("goog.dom.query.pseudos", goog.dom.query.pseudos);
goog.provide("goog.userAgent.jscript");
goog.require("goog.string");
goog.userAgent.jscript.ASSUME_NO_JSCRIPT = false;
goog.userAgent.jscript.init_ = function() {
  var hasScriptEngine = "ScriptEngine" in goog.global;
  goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ = hasScriptEngine && goog.global["ScriptEngine"]() == "JScript";
  goog.userAgent.jscript.DETECTED_VERSION_ = goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_ ? goog.global["ScriptEngineMajorVersion"]() + "." + goog.global["ScriptEngineMinorVersion"]() + "." + goog.global["ScriptEngineBuildVersion"]() : "0"
};
if(!goog.userAgent.jscript.ASSUME_NO_JSCRIPT) {
  goog.userAgent.jscript.init_()
}
goog.userAgent.jscript.HAS_JSCRIPT = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? false : goog.userAgent.jscript.DETECTED_HAS_JSCRIPT_;
goog.userAgent.jscript.VERSION = goog.userAgent.jscript.ASSUME_NO_JSCRIPT ? "0" : goog.userAgent.jscript.DETECTED_VERSION_;
goog.userAgent.jscript.isVersion = function(version) {
  return goog.string.compareVersions(goog.userAgent.jscript.VERSION, version) >= 0
};
goog.provide("goog.string.StringBuffer");
goog.require("goog.userAgent.jscript");
goog.string.StringBuffer = function(opt_a1, var_args) {
  this.buffer_ = goog.userAgent.jscript.HAS_JSCRIPT ? [] : "";
  if(opt_a1 != null) {
    this.append.apply(this, arguments)
  }
};
goog.string.StringBuffer.prototype.set = function(s) {
  this.clear();
  this.append(s)
};
if(goog.userAgent.jscript.HAS_JSCRIPT) {
  goog.string.StringBuffer.prototype.bufferLength_ = 0;
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
    if(opt_a2 == null) {
      this.buffer_[this.bufferLength_++] = a1
    }else {
      this.buffer_.push.apply(this.buffer_, arguments);
      this.bufferLength_ = this.buffer_.length
    }
    return this
  }
}else {
  goog.string.StringBuffer.prototype.append = function(a1, opt_a2, var_args) {
    this.buffer_ += a1;
    if(opt_a2 != null) {
      for(var i = 1;i < arguments.length;i++) {
        this.buffer_ += arguments[i]
      }
    }
    return this
  }
}
goog.string.StringBuffer.prototype.clear = function() {
  if(goog.userAgent.jscript.HAS_JSCRIPT) {
    this.buffer_.length = 0;
    this.bufferLength_ = 0
  }else {
    this.buffer_ = ""
  }
};
goog.string.StringBuffer.prototype.getLength = function() {
  return this.toString().length
};
goog.string.StringBuffer.prototype.toString = function() {
  if(goog.userAgent.jscript.HAS_JSCRIPT) {
    var str = this.buffer_.join("");
    this.clear();
    if(str) {
      this.append(str)
    }
    return str
  }else {
    return this.buffer_
  }
};
goog.provide("goog.events.EventWrapper");
goog.events.EventWrapper = function() {
};
goog.events.EventWrapper.prototype.listen = function(src, listener, opt_capt, opt_scope, opt_eventHandler) {
};
goog.events.EventWrapper.prototype.unlisten = function(src, listener, opt_capt, opt_scope, opt_eventHandler) {
};
goog.provide("goog.events.BrowserFeature");
goog.require("goog.userAgent");
goog.events.BrowserFeature = {HAS_W3C_BUTTON:!goog.userAgent.IE || goog.userAgent.isVersion("9"), SET_KEY_CODE_TO_PREVENT_DEFAULT:goog.userAgent.IE && !goog.userAgent.isVersion("8")};
goog.provide("goog.disposable.IDisposable");
goog.disposable.IDisposable = function() {
};
goog.disposable.IDisposable.prototype.dispose;
goog.disposable.IDisposable.prototype.isDisposed;
goog.provide("goog.Disposable");
goog.provide("goog.dispose");
goog.require("goog.disposable.IDisposable");
goog.Disposable = function() {
  if(goog.Disposable.ENABLE_MONITORING) {
    goog.Disposable.instances_[goog.getUid(this)] = this
  }
};
goog.Disposable.ENABLE_MONITORING = false;
goog.Disposable.instances_ = {};
goog.Disposable.getUndisposedObjects = function() {
  var ret = [];
  for(var id in goog.Disposable.instances_) {
    if(goog.Disposable.instances_.hasOwnProperty(id)) {
      ret.push(goog.Disposable.instances_[Number(id)])
    }
  }
  return ret
};
goog.Disposable.clearUndisposedObjects = function() {
  goog.Disposable.instances_ = {}
};
goog.Disposable.prototype.disposed_ = false;
goog.Disposable.prototype.isDisposed = function() {
  return this.disposed_
};
goog.Disposable.prototype.getDisposed = goog.Disposable.prototype.isDisposed;
goog.Disposable.prototype.dispose = function() {
  if(!this.disposed_) {
    this.disposed_ = true;
    this.disposeInternal();
    if(goog.Disposable.ENABLE_MONITORING) {
      var uid = goog.getUid(this);
      if(!goog.Disposable.instances_.hasOwnProperty(uid)) {
        throw Error(this + " did not call the goog.Disposable base " + "constructor or was disposed of after a clearUndisposedObjects " + "call");
      }
      delete goog.Disposable.instances_[uid]
    }
  }
};
goog.Disposable.prototype.disposeInternal = function() {
};
goog.dispose = function(obj) {
  if(obj && typeof obj.dispose == "function") {
    obj.dispose()
  }
};
goog.provide("goog.events.Event");
goog.require("goog.Disposable");
goog.events.Event = function(type, opt_target) {
  goog.Disposable.call(this);
  this.type = type;
  this.target = opt_target;
  this.currentTarget = this.target
};
goog.inherits(goog.events.Event, goog.Disposable);
goog.events.Event.prototype.disposeInternal = function() {
  delete this.type;
  delete this.target;
  delete this.currentTarget
};
goog.events.Event.prototype.propagationStopped_ = false;
goog.events.Event.prototype.returnValue_ = true;
goog.events.Event.prototype.stopPropagation = function() {
  this.propagationStopped_ = true
};
goog.events.Event.prototype.preventDefault = function() {
  this.returnValue_ = false
};
goog.events.Event.stopPropagation = function(e) {
  e.stopPropagation()
};
goog.events.Event.preventDefault = function(e) {
  e.preventDefault()
};
goog.provide("goog.events.EventType");
goog.require("goog.userAgent");
goog.events.EventType = {CLICK:"click", DBLCLICK:"dblclick", MOUSEDOWN:"mousedown", MOUSEUP:"mouseup", MOUSEOVER:"mouseover", MOUSEOUT:"mouseout", MOUSEMOVE:"mousemove", SELECTSTART:"selectstart", KEYPRESS:"keypress", KEYDOWN:"keydown", KEYUP:"keyup", BLUR:"blur", FOCUS:"focus", DEACTIVATE:"deactivate", FOCUSIN:goog.userAgent.IE ? "focusin" : "DOMFocusIn", FOCUSOUT:goog.userAgent.IE ? "focusout" : "DOMFocusOut", CHANGE:"change", SELECT:"select", SUBMIT:"submit", INPUT:"input", PROPERTYCHANGE:"propertychange", 
DRAGSTART:"dragstart", DRAGENTER:"dragenter", DRAGOVER:"dragover", DRAGLEAVE:"dragleave", DROP:"drop", TOUCHSTART:"touchstart", TOUCHMOVE:"touchmove", TOUCHEND:"touchend", TOUCHCANCEL:"touchcancel", CONTEXTMENU:"contextmenu", ERROR:"error", HELP:"help", LOAD:"load", LOSECAPTURE:"losecapture", READYSTATECHANGE:"readystatechange", RESIZE:"resize", SCROLL:"scroll", UNLOAD:"unload", HASHCHANGE:"hashchange", PAGEHIDE:"pagehide", PAGESHOW:"pageshow", POPSTATE:"popstate", COPY:"copy", PASTE:"paste", CUT:"cut", 
MESSAGE:"message", CONNECT:"connect"};
goog.provide("goog.reflect");
goog.reflect.object = function(type, object) {
  return object
};
goog.reflect.sinkValue = new Function("a", "return a");
goog.provide("goog.events.BrowserEvent");
goog.provide("goog.events.BrowserEvent.MouseButton");
goog.require("goog.events.BrowserFeature");
goog.require("goog.events.Event");
goog.require("goog.events.EventType");
goog.require("goog.reflect");
goog.require("goog.userAgent");
goog.events.BrowserEvent = function(opt_e, opt_currentTarget) {
  if(opt_e) {
    this.init(opt_e, opt_currentTarget)
  }
};
goog.inherits(goog.events.BrowserEvent, goog.events.Event);
goog.events.BrowserEvent.MouseButton = {LEFT:0, MIDDLE:1, RIGHT:2};
goog.events.BrowserEvent.IEButtonMap = [1, 4, 2];
goog.events.BrowserEvent.prototype.target = null;
goog.events.BrowserEvent.prototype.currentTarget;
goog.events.BrowserEvent.prototype.relatedTarget = null;
goog.events.BrowserEvent.prototype.offsetX = 0;
goog.events.BrowserEvent.prototype.offsetY = 0;
goog.events.BrowserEvent.prototype.clientX = 0;
goog.events.BrowserEvent.prototype.clientY = 0;
goog.events.BrowserEvent.prototype.screenX = 0;
goog.events.BrowserEvent.prototype.screenY = 0;
goog.events.BrowserEvent.prototype.button = 0;
goog.events.BrowserEvent.prototype.keyCode = 0;
goog.events.BrowserEvent.prototype.charCode = 0;
goog.events.BrowserEvent.prototype.ctrlKey = false;
goog.events.BrowserEvent.prototype.altKey = false;
goog.events.BrowserEvent.prototype.shiftKey = false;
goog.events.BrowserEvent.prototype.metaKey = false;
goog.events.BrowserEvent.prototype.state;
goog.events.BrowserEvent.prototype.platformModifierKey = false;
goog.events.BrowserEvent.prototype.event_ = null;
goog.events.BrowserEvent.prototype.init = function(e, opt_currentTarget) {
  var type = this.type = e.type;
  goog.events.Event.call(this, type);
  this.target = e.target || e.srcElement;
  this.currentTarget = opt_currentTarget;
  var relatedTarget = e.relatedTarget;
  if(relatedTarget) {
    if(goog.userAgent.GECKO) {
      try {
        goog.reflect.sinkValue(relatedTarget.nodeName)
      }catch(err) {
        relatedTarget = null
      }
    }
  }else {
    if(type == goog.events.EventType.MOUSEOVER) {
      relatedTarget = e.fromElement
    }else {
      if(type == goog.events.EventType.MOUSEOUT) {
        relatedTarget = e.toElement
      }
    }
  }
  this.relatedTarget = relatedTarget;
  this.offsetX = e.offsetX !== undefined ? e.offsetX : e.layerX;
  this.offsetY = e.offsetY !== undefined ? e.offsetY : e.layerY;
  this.clientX = e.clientX !== undefined ? e.clientX : e.pageX;
  this.clientY = e.clientY !== undefined ? e.clientY : e.pageY;
  this.screenX = e.screenX || 0;
  this.screenY = e.screenY || 0;
  this.button = e.button;
  this.keyCode = e.keyCode || 0;
  this.charCode = e.charCode || (type == "keypress" ? e.keyCode : 0);
  this.ctrlKey = e.ctrlKey;
  this.altKey = e.altKey;
  this.shiftKey = e.shiftKey;
  this.metaKey = e.metaKey;
  this.platformModifierKey = goog.userAgent.MAC ? e.metaKey : e.ctrlKey;
  this.state = e.state;
  this.event_ = e;
  delete this.returnValue_;
  delete this.propagationStopped_
};
goog.events.BrowserEvent.prototype.isButton = function(button) {
  if(!goog.events.BrowserFeature.HAS_W3C_BUTTON) {
    if(this.type == "click") {
      return button == goog.events.BrowserEvent.MouseButton.LEFT
    }else {
      return!!(this.event_.button & goog.events.BrowserEvent.IEButtonMap[button])
    }
  }else {
    return this.event_.button == button
  }
};
goog.events.BrowserEvent.prototype.isMouseActionButton = function() {
  return this.isButton(goog.events.BrowserEvent.MouseButton.LEFT) && !(goog.userAgent.WEBKIT && goog.userAgent.MAC && this.ctrlKey)
};
goog.events.BrowserEvent.prototype.stopPropagation = function() {
  goog.events.BrowserEvent.superClass_.stopPropagation.call(this);
  if(this.event_.stopPropagation) {
    this.event_.stopPropagation()
  }else {
    this.event_.cancelBubble = true
  }
};
goog.events.BrowserEvent.prototype.preventDefault = function() {
  goog.events.BrowserEvent.superClass_.preventDefault.call(this);
  var be = this.event_;
  if(!be.preventDefault) {
    be.returnValue = false;
    if(goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) {
      try {
        var VK_F1 = 112;
        var VK_F12 = 123;
        if(be.ctrlKey || be.keyCode >= VK_F1 && be.keyCode <= VK_F12) {
          be.keyCode = -1
        }
      }catch(ex) {
      }
    }
  }else {
    be.preventDefault()
  }
};
goog.events.BrowserEvent.prototype.getBrowserEvent = function() {
  return this.event_
};
goog.events.BrowserEvent.prototype.disposeInternal = function() {
  goog.events.BrowserEvent.superClass_.disposeInternal.call(this);
  this.event_ = null;
  this.target = null;
  this.currentTarget = null;
  this.relatedTarget = null
};
goog.provide("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.math.Box = function(top, right, bottom, left) {
  this.top = top;
  this.right = right;
  this.bottom = bottom;
  this.left = left
};
goog.math.Box.boundingBox = function(var_args) {
  var box = new goog.math.Box(arguments[0].y, arguments[0].x, arguments[0].y, arguments[0].x);
  for(var i = 1;i < arguments.length;i++) {
    var coord = arguments[i];
    box.top = Math.min(box.top, coord.y);
    box.right = Math.max(box.right, coord.x);
    box.bottom = Math.max(box.bottom, coord.y);
    box.left = Math.min(box.left, coord.x)
  }
  return box
};
goog.math.Box.prototype.clone = function() {
  return new goog.math.Box(this.top, this.right, this.bottom, this.left)
};
if(goog.DEBUG) {
  goog.math.Box.prototype.toString = function() {
    return"(" + this.top + "t, " + this.right + "r, " + this.bottom + "b, " + this.left + "l)"
  }
}
goog.math.Box.prototype.contains = function(other) {
  return goog.math.Box.contains(this, other)
};
goog.math.Box.prototype.expand = function(top, opt_right, opt_bottom, opt_left) {
  if(goog.isObject(top)) {
    this.top -= top.top;
    this.right += top.right;
    this.bottom += top.bottom;
    this.left -= top.left
  }else {
    this.top -= top;
    this.right += opt_right;
    this.bottom += opt_bottom;
    this.left -= opt_left
  }
  return this
};
goog.math.Box.prototype.expandToInclude = function(box) {
  this.left = Math.min(this.left, box.left);
  this.top = Math.min(this.top, box.top);
  this.right = Math.max(this.right, box.right);
  this.bottom = Math.max(this.bottom, box.bottom)
};
goog.math.Box.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.top == b.top && a.right == b.right && a.bottom == b.bottom && a.left == b.left
};
goog.math.Box.contains = function(box, other) {
  if(!box || !other) {
    return false
  }
  if(other instanceof goog.math.Box) {
    return other.left >= box.left && other.right <= box.right && other.top >= box.top && other.bottom <= box.bottom
  }
  return other.x >= box.left && other.x <= box.right && other.y >= box.top && other.y <= box.bottom
};
goog.math.Box.distance = function(box, coord) {
  if(coord.x >= box.left && coord.x <= box.right) {
    if(coord.y >= box.top && coord.y <= box.bottom) {
      return 0
    }
    return coord.y < box.top ? box.top - coord.y : coord.y - box.bottom
  }
  if(coord.y >= box.top && coord.y <= box.bottom) {
    return coord.x < box.left ? box.left - coord.x : coord.x - box.right
  }
  return goog.math.Coordinate.distance(coord, new goog.math.Coordinate(coord.x < box.left ? box.left : box.right, coord.y < box.top ? box.top : box.bottom))
};
goog.math.Box.intersects = function(a, b) {
  return a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom
};
goog.math.Box.intersectsWithPadding = function(a, b, padding) {
  return a.left <= b.right + padding && b.left <= a.right + padding && a.top <= b.bottom + padding && b.top <= a.bottom + padding
};
goog.provide("goog.math.Rect");
goog.require("goog.math.Box");
goog.require("goog.math.Size");
goog.math.Rect = function(x, y, w, h) {
  this.left = x;
  this.top = y;
  this.width = w;
  this.height = h
};
goog.math.Rect.prototype.clone = function() {
  return new goog.math.Rect(this.left, this.top, this.width, this.height)
};
goog.math.Rect.prototype.toBox = function() {
  var right = this.left + this.width;
  var bottom = this.top + this.height;
  return new goog.math.Box(this.top, right, bottom, this.left)
};
goog.math.Rect.createFromBox = function(box) {
  return new goog.math.Rect(box.left, box.top, box.right - box.left, box.bottom - box.top)
};
if(goog.DEBUG) {
  goog.math.Rect.prototype.toString = function() {
    return"(" + this.left + ", " + this.top + " - " + this.width + "w x " + this.height + "h)"
  }
}
goog.math.Rect.equals = function(a, b) {
  if(a == b) {
    return true
  }
  if(!a || !b) {
    return false
  }
  return a.left == b.left && a.width == b.width && a.top == b.top && a.height == b.height
};
goog.math.Rect.prototype.intersection = function(rect) {
  var x0 = Math.max(this.left, rect.left);
  var x1 = Math.min(this.left + this.width, rect.left + rect.width);
  if(x0 <= x1) {
    var y0 = Math.max(this.top, rect.top);
    var y1 = Math.min(this.top + this.height, rect.top + rect.height);
    if(y0 <= y1) {
      this.left = x0;
      this.top = y0;
      this.width = x1 - x0;
      this.height = y1 - y0;
      return true
    }
  }
  return false
};
goog.math.Rect.intersection = function(a, b) {
  var x0 = Math.max(a.left, b.left);
  var x1 = Math.min(a.left + a.width, b.left + b.width);
  if(x0 <= x1) {
    var y0 = Math.max(a.top, b.top);
    var y1 = Math.min(a.top + a.height, b.top + b.height);
    if(y0 <= y1) {
      return new goog.math.Rect(x0, y0, x1 - x0, y1 - y0)
    }
  }
  return null
};
goog.math.Rect.intersects = function(a, b) {
  return a.left <= b.left + b.width && b.left <= a.left + a.width && a.top <= b.top + b.height && b.top <= a.top + a.height
};
goog.math.Rect.prototype.intersects = function(rect) {
  return goog.math.Rect.intersects(this, rect)
};
goog.math.Rect.difference = function(a, b) {
  var intersection = goog.math.Rect.intersection(a, b);
  if(!intersection || !intersection.height || !intersection.width) {
    return[a.clone()]
  }
  var result = [];
  var top = a.top;
  var height = a.height;
  var ar = a.left + a.width;
  var ab = a.top + a.height;
  var br = b.left + b.width;
  var bb = b.top + b.height;
  if(b.top > a.top) {
    result.push(new goog.math.Rect(a.left, a.top, a.width, b.top - a.top));
    top = b.top;
    height -= b.top - a.top
  }
  if(bb < ab) {
    result.push(new goog.math.Rect(a.left, bb, a.width, ab - bb));
    height = bb - top
  }
  if(b.left > a.left) {
    result.push(new goog.math.Rect(a.left, top, b.left - a.left, height))
  }
  if(br < ar) {
    result.push(new goog.math.Rect(br, top, ar - br, height))
  }
  return result
};
goog.math.Rect.prototype.difference = function(rect) {
  return goog.math.Rect.difference(this, rect)
};
goog.math.Rect.prototype.boundingRect = function(rect) {
  var right = Math.max(this.left + this.width, rect.left + rect.width);
  var bottom = Math.max(this.top + this.height, rect.top + rect.height);
  this.left = Math.min(this.left, rect.left);
  this.top = Math.min(this.top, rect.top);
  this.width = right - this.left;
  this.height = bottom - this.top
};
goog.math.Rect.boundingRect = function(a, b) {
  if(!a || !b) {
    return null
  }
  var clone = a.clone();
  clone.boundingRect(b);
  return clone
};
goog.math.Rect.prototype.contains = function(another) {
  if(another instanceof goog.math.Rect) {
    return this.left <= another.left && this.left + this.width >= another.left + another.width && this.top <= another.top && this.top + this.height >= another.top + another.height
  }else {
    return another.x >= this.left && another.x <= this.left + this.width && another.y >= this.top && another.y <= this.top + this.height
  }
};
goog.math.Rect.prototype.getSize = function() {
  return new goog.math.Size(this.width, this.height)
};
goog.provide("goog.style");
goog.require("goog.array");
goog.require("goog.dom");
goog.require("goog.math.Box");
goog.require("goog.math.Coordinate");
goog.require("goog.math.Rect");
goog.require("goog.math.Size");
goog.require("goog.object");
goog.require("goog.string");
goog.require("goog.userAgent");
goog.style.setStyle = function(element, style, opt_value) {
  if(goog.isString(style)) {
    goog.style.setStyle_(element, opt_value, style)
  }else {
    goog.object.forEach(style, goog.partial(goog.style.setStyle_, element))
  }
};
goog.style.setStyle_ = function(element, value, style) {
  element.style[goog.string.toCamelCase(style)] = value
};
goog.style.getStyle = function(element, property) {
  return element.style[goog.string.toCamelCase(property)] || ""
};
goog.style.getComputedStyle = function(element, property) {
  var doc = goog.dom.getOwnerDocument(element);
  if(doc.defaultView && doc.defaultView.getComputedStyle) {
    var styles = doc.defaultView.getComputedStyle(element, null);
    if(styles) {
      return styles[property] || styles.getPropertyValue(property)
    }
  }
  return""
};
goog.style.getCascadedStyle = function(element, style) {
  return element.currentStyle ? element.currentStyle[style] : null
};
goog.style.getStyle_ = function(element, style) {
  return goog.style.getComputedStyle(element, style) || goog.style.getCascadedStyle(element, style) || element.style[style]
};
goog.style.getComputedPosition = function(element) {
  return goog.style.getStyle_(element, "position")
};
goog.style.getBackgroundColor = function(element) {
  return goog.style.getStyle_(element, "backgroundColor")
};
goog.style.getComputedOverflowX = function(element) {
  return goog.style.getStyle_(element, "overflowX")
};
goog.style.getComputedOverflowY = function(element) {
  return goog.style.getStyle_(element, "overflowY")
};
goog.style.getComputedZIndex = function(element) {
  return goog.style.getStyle_(element, "zIndex")
};
goog.style.getComputedTextAlign = function(element) {
  return goog.style.getStyle_(element, "textAlign")
};
goog.style.getComputedCursor = function(element) {
  return goog.style.getStyle_(element, "cursor")
};
goog.style.setPosition = function(el, arg1, opt_arg2) {
  var x, y;
  var buggyGeckoSubPixelPos = goog.userAgent.GECKO && (goog.userAgent.MAC || goog.userAgent.X11) && goog.userAgent.isVersion("1.9");
  if(arg1 instanceof goog.math.Coordinate) {
    x = arg1.x;
    y = arg1.y
  }else {
    x = arg1;
    y = opt_arg2
  }
  el.style.left = goog.style.getPixelStyleValue_(x, buggyGeckoSubPixelPos);
  el.style.top = goog.style.getPixelStyleValue_(y, buggyGeckoSubPixelPos)
};
goog.style.getPosition = function(element) {
  return new goog.math.Coordinate(element.offsetLeft, element.offsetTop)
};
goog.style.getClientViewportElement = function(opt_node) {
  var doc;
  if(opt_node) {
    if(opt_node.nodeType == goog.dom.NodeType.DOCUMENT) {
      doc = opt_node
    }else {
      doc = goog.dom.getOwnerDocument(opt_node)
    }
  }else {
    doc = goog.dom.getDocument()
  }
  if(goog.userAgent.IE && !goog.userAgent.isVersion(9) && !goog.dom.getDomHelper(doc).isCss1CompatMode()) {
    return doc.body
  }
  return doc.documentElement
};
goog.style.getBoundingClientRect_ = function(el) {
  var rect = el.getBoundingClientRect();
  if(goog.userAgent.IE) {
    var doc = el.ownerDocument;
    rect.left -= doc.documentElement.clientLeft + doc.body.clientLeft;
    rect.top -= doc.documentElement.clientTop + doc.body.clientTop
  }
  return rect
};
goog.style.getOffsetParent = function(element) {
  if(goog.userAgent.IE) {
    return element.offsetParent
  }
  var doc = goog.dom.getOwnerDocument(element);
  var positionStyle = goog.style.getStyle_(element, "position");
  var skipStatic = positionStyle == "fixed" || positionStyle == "absolute";
  for(var parent = element.parentNode;parent && parent != doc;parent = parent.parentNode) {
    positionStyle = goog.style.getStyle_(parent, "position");
    skipStatic = skipStatic && positionStyle == "static" && parent != doc.documentElement && parent != doc.body;
    if(!skipStatic && (parent.scrollWidth > parent.clientWidth || parent.scrollHeight > parent.clientHeight || positionStyle == "fixed" || positionStyle == "absolute")) {
      return parent
    }
  }
  return null
};
goog.style.getVisibleRectForElement = function(element) {
  var visibleRect = new goog.math.Box(0, Infinity, Infinity, 0);
  var dom = goog.dom.getDomHelper(element);
  var body = dom.getDocument().body;
  var scrollEl = dom.getDocumentScrollElement();
  var inContainer;
  for(var el = element;el = goog.style.getOffsetParent(el);) {
    if((!goog.userAgent.IE || el.clientWidth != 0) && (!goog.userAgent.WEBKIT || el.clientHeight != 0 || el != body) && (el.scrollWidth != el.clientWidth || el.scrollHeight != el.clientHeight) && goog.style.getStyle_(el, "overflow") != "visible") {
      var pos = goog.style.getPageOffset(el);
      var client = goog.style.getClientLeftTop(el);
      pos.x += client.x;
      pos.y += client.y;
      visibleRect.top = Math.max(visibleRect.top, pos.y);
      visibleRect.right = Math.min(visibleRect.right, pos.x + el.clientWidth);
      visibleRect.bottom = Math.min(visibleRect.bottom, pos.y + el.clientHeight);
      visibleRect.left = Math.max(visibleRect.left, pos.x);
      inContainer = inContainer || el != scrollEl
    }
  }
  var scrollX = scrollEl.scrollLeft, scrollY = scrollEl.scrollTop;
  if(goog.userAgent.WEBKIT) {
    visibleRect.left += scrollX;
    visibleRect.top += scrollY
  }else {
    visibleRect.left = Math.max(visibleRect.left, scrollX);
    visibleRect.top = Math.max(visibleRect.top, scrollY)
  }
  if(!inContainer || goog.userAgent.WEBKIT) {
    visibleRect.right += scrollX;
    visibleRect.bottom += scrollY
  }
  var winSize = dom.getViewportSize();
  visibleRect.right = Math.min(visibleRect.right, scrollX + winSize.width);
  visibleRect.bottom = Math.min(visibleRect.bottom, scrollY + winSize.height);
  return visibleRect.top >= 0 && visibleRect.left >= 0 && visibleRect.bottom > visibleRect.top && visibleRect.right > visibleRect.left ? visibleRect : null
};
goog.style.scrollIntoContainerView = function(element, container, opt_center) {
  var elementPos = goog.style.getPageOffset(element);
  var containerPos = goog.style.getPageOffset(container);
  var containerBorder = goog.style.getBorderBox(container);
  var relX = elementPos.x - containerPos.x - containerBorder.left;
  var relY = elementPos.y - containerPos.y - containerBorder.top;
  var spaceX = container.clientWidth - element.offsetWidth;
  var spaceY = container.clientHeight - element.offsetHeight;
  if(opt_center) {
    container.scrollLeft += relX - spaceX / 2;
    container.scrollTop += relY - spaceY / 2
  }else {
    container.scrollLeft += Math.min(relX, Math.max(relX - spaceX, 0));
    container.scrollTop += Math.min(relY, Math.max(relY - spaceY, 0))
  }
};
goog.style.getClientLeftTop = function(el) {
  if(goog.userAgent.GECKO && !goog.userAgent.isVersion("1.9")) {
    var left = parseFloat(goog.style.getComputedStyle(el, "borderLeftWidth"));
    if(goog.style.isRightToLeft(el)) {
      var scrollbarWidth = el.offsetWidth - el.clientWidth - left - parseFloat(goog.style.getComputedStyle(el, "borderRightWidth"));
      left += scrollbarWidth
    }
    return new goog.math.Coordinate(left, parseFloat(goog.style.getComputedStyle(el, "borderTopWidth")))
  }
  return new goog.math.Coordinate(el.clientLeft, el.clientTop)
};
goog.style.getPageOffset = function(el) {
  var box, doc = goog.dom.getOwnerDocument(el);
  var positionStyle = goog.style.getStyle_(el, "position");
  var BUGGY_GECKO_BOX_OBJECT = goog.userAgent.GECKO && doc.getBoxObjectFor && !el.getBoundingClientRect && positionStyle == "absolute" && (box = doc.getBoxObjectFor(el)) && (box.screenX < 0 || box.screenY < 0);
  var pos = new goog.math.Coordinate(0, 0);
  var viewportElement = goog.style.getClientViewportElement(doc);
  if(el == viewportElement) {
    return pos
  }
  if(el.getBoundingClientRect) {
    box = goog.style.getBoundingClientRect_(el);
    var scrollCoord = goog.dom.getDomHelper(doc).getDocumentScroll();
    pos.x = box.left + scrollCoord.x;
    pos.y = box.top + scrollCoord.y
  }else {
    if(doc.getBoxObjectFor && !BUGGY_GECKO_BOX_OBJECT) {
      box = doc.getBoxObjectFor(el);
      var vpBox = doc.getBoxObjectFor(viewportElement);
      pos.x = box.screenX - vpBox.screenX;
      pos.y = box.screenY - vpBox.screenY
    }else {
      var parent = el;
      do {
        pos.x += parent.offsetLeft;
        pos.y += parent.offsetTop;
        if(parent != el) {
          pos.x += parent.clientLeft || 0;
          pos.y += parent.clientTop || 0
        }
        if(goog.userAgent.WEBKIT && goog.style.getComputedPosition(parent) == "fixed") {
          pos.x += doc.body.scrollLeft;
          pos.y += doc.body.scrollTop;
          break
        }
        parent = parent.offsetParent
      }while(parent && parent != el);
      if(goog.userAgent.OPERA || goog.userAgent.WEBKIT && positionStyle == "absolute") {
        pos.y -= doc.body.offsetTop
      }
      for(parent = el;(parent = goog.style.getOffsetParent(parent)) && parent != doc.body && parent != viewportElement;) {
        pos.x -= parent.scrollLeft;
        if(!goog.userAgent.OPERA || parent.tagName != "TR") {
          pos.y -= parent.scrollTop
        }
      }
    }
  }
  return pos
};
goog.style.getPageOffsetLeft = function(el) {
  return goog.style.getPageOffset(el).x
};
goog.style.getPageOffsetTop = function(el) {
  return goog.style.getPageOffset(el).y
};
goog.style.getFramedPageOffset = function(el, relativeWin) {
  var position = new goog.math.Coordinate(0, 0);
  var currentWin = goog.dom.getWindow(goog.dom.getOwnerDocument(el));
  var currentEl = el;
  do {
    var offset = currentWin == relativeWin ? goog.style.getPageOffset(currentEl) : goog.style.getClientPosition(currentEl);
    position.x += offset.x;
    position.y += offset.y
  }while(currentWin && currentWin != relativeWin && (currentEl = currentWin.frameElement) && (currentWin = currentWin.parent));
  return position
};
goog.style.translateRectForAnotherFrame = function(rect, origBase, newBase) {
  if(origBase.getDocument() != newBase.getDocument()) {
    var body = origBase.getDocument().body;
    var pos = goog.style.getFramedPageOffset(body, newBase.getWindow());
    pos = goog.math.Coordinate.difference(pos, goog.style.getPageOffset(body));
    if(goog.userAgent.IE && !origBase.isCss1CompatMode()) {
      pos = goog.math.Coordinate.difference(pos, origBase.getDocumentScroll())
    }
    rect.left += pos.x;
    rect.top += pos.y
  }
};
goog.style.getRelativePosition = function(a, b) {
  var ap = goog.style.getClientPosition(a);
  var bp = goog.style.getClientPosition(b);
  return new goog.math.Coordinate(ap.x - bp.x, ap.y - bp.y)
};
goog.style.getClientPosition = function(el) {
  var pos = new goog.math.Coordinate;
  if(el.nodeType == goog.dom.NodeType.ELEMENT) {
    if(el.getBoundingClientRect) {
      var box = goog.style.getBoundingClientRect_(el);
      pos.x = box.left;
      pos.y = box.top
    }else {
      var scrollCoord = goog.dom.getDomHelper(el).getDocumentScroll();
      var pageCoord = goog.style.getPageOffset(el);
      pos.x = pageCoord.x - scrollCoord.x;
      pos.y = pageCoord.y - scrollCoord.y
    }
  }else {
    var isAbstractedEvent = goog.isFunction(el.getBrowserEvent);
    var targetEvent = el;
    if(el.targetTouches) {
      targetEvent = el.targetTouches[0]
    }else {
      if(isAbstractedEvent && el.getBrowserEvent().targetTouches) {
        targetEvent = el.getBrowserEvent().targetTouches[0]
      }
    }
    pos.x = targetEvent.clientX;
    pos.y = targetEvent.clientY
  }
  return pos
};
goog.style.setPageOffset = function(el, x, opt_y) {
  var cur = goog.style.getPageOffset(el);
  if(x instanceof goog.math.Coordinate) {
    opt_y = x.y;
    x = x.x
  }
  var dx = x - cur.x;
  var dy = opt_y - cur.y;
  goog.style.setPosition(el, el.offsetLeft + dx, el.offsetTop + dy)
};
goog.style.setSize = function(element, w, opt_h) {
  var h;
  if(w instanceof goog.math.Size) {
    h = w.height;
    w = w.width
  }else {
    if(opt_h == undefined) {
      throw Error("missing height argument");
    }
    h = opt_h
  }
  goog.style.setWidth(element, w);
  goog.style.setHeight(element, h)
};
goog.style.getPixelStyleValue_ = function(value, round) {
  if(typeof value == "number") {
    value = (round ? Math.round(value) : value) + "px"
  }
  return value
};
goog.style.setHeight = function(element, height) {
  element.style.height = goog.style.getPixelStyleValue_(height, true)
};
goog.style.setWidth = function(element, width) {
  element.style.width = goog.style.getPixelStyleValue_(width, true)
};
goog.style.getSize = function(element) {
  if(goog.style.getStyle_(element, "display") != "none") {
    return new goog.math.Size(element.offsetWidth, element.offsetHeight)
  }
  var style = element.style;
  var originalDisplay = style.display;
  var originalVisibility = style.visibility;
  var originalPosition = style.position;
  style.visibility = "hidden";
  style.position = "absolute";
  style.display = "inline";
  var originalWidth = element.offsetWidth;
  var originalHeight = element.offsetHeight;
  style.display = originalDisplay;
  style.position = originalPosition;
  style.visibility = originalVisibility;
  return new goog.math.Size(originalWidth, originalHeight)
};
goog.style.getBounds = function(element) {
  var o = goog.style.getPageOffset(element);
  var s = goog.style.getSize(element);
  return new goog.math.Rect(o.x, o.y, s.width, s.height)
};
goog.style.toCamelCase = function(selector) {
  return goog.string.toCamelCase(String(selector))
};
goog.style.toSelectorCase = function(selector) {
  return goog.string.toSelectorCase(selector)
};
goog.style.getOpacity = function(el) {
  var style = el.style;
  var result = "";
  if("opacity" in style) {
    result = style.opacity
  }else {
    if("MozOpacity" in style) {
      result = style.MozOpacity
    }else {
      if("filter" in style) {
        var match = style.filter.match(/alpha\(opacity=([\d.]+)\)/);
        if(match) {
          result = String(match[1] / 100)
        }
      }
    }
  }
  return result == "" ? result : Number(result)
};
goog.style.setOpacity = function(el, alpha) {
  var style = el.style;
  if("opacity" in style) {
    style.opacity = alpha
  }else {
    if("MozOpacity" in style) {
      style.MozOpacity = alpha
    }else {
      if("filter" in style) {
        if(alpha === "") {
          style.filter = ""
        }else {
          style.filter = "alpha(opacity=" + alpha * 100 + ")"
        }
      }
    }
  }
};
goog.style.setTransparentBackgroundImage = function(el, src) {
  var style = el.style;
  if(goog.userAgent.IE && !goog.userAgent.isVersion("8")) {
    style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(" + 'src="' + src + '", sizingMethod="crop")'
  }else {
    style.backgroundImage = "url(" + src + ")";
    style.backgroundPosition = "top left";
    style.backgroundRepeat = "no-repeat"
  }
};
goog.style.clearTransparentBackgroundImage = function(el) {
  var style = el.style;
  if("filter" in style) {
    style.filter = ""
  }else {
    style.backgroundImage = "none"
  }
};
goog.style.showElement = function(el, display) {
  el.style.display = display ? "" : "none"
};
goog.style.isElementShown = function(el) {
  return el.style.display != "none"
};
goog.style.installStyles = function(stylesString, opt_node) {
  var dh = goog.dom.getDomHelper(opt_node);
  var styleSheet = null;
  if(goog.userAgent.IE) {
    styleSheet = dh.getDocument().createStyleSheet();
    goog.style.setStyles(styleSheet, stylesString)
  }else {
    var head = dh.getElementsByTagNameAndClass("head")[0];
    if(!head) {
      var body = dh.getElementsByTagNameAndClass("body")[0];
      head = dh.createDom("head");
      body.parentNode.insertBefore(head, body)
    }
    styleSheet = dh.createDom("style");
    goog.style.setStyles(styleSheet, stylesString);
    dh.appendChild(head, styleSheet)
  }
  return styleSheet
};
goog.style.uninstallStyles = function(styleSheet) {
  var node = styleSheet.ownerNode || styleSheet.owningElement || styleSheet;
  goog.dom.removeNode(node)
};
goog.style.setStyles = function(element, stylesString) {
  if(goog.userAgent.IE) {
    element.cssText = stylesString
  }else {
    var propToSet = goog.userAgent.WEBKIT ? "innerText" : "innerHTML";
    element[propToSet] = stylesString
  }
};
goog.style.setPreWrap = function(el) {
  var style = el.style;
  if(goog.userAgent.IE && !goog.userAgent.isVersion("8")) {
    style.whiteSpace = "pre";
    style.wordWrap = "break-word"
  }else {
    if(goog.userAgent.GECKO) {
      style.whiteSpace = "-moz-pre-wrap"
    }else {
      style.whiteSpace = "pre-wrap"
    }
  }
};
goog.style.setInlineBlock = function(el) {
  var style = el.style;
  style.position = "relative";
  if(goog.userAgent.IE && !goog.userAgent.isVersion("8")) {
    style.zoom = "1";
    style.display = "inline"
  }else {
    if(goog.userAgent.GECKO) {
      style.display = goog.userAgent.isVersion("1.9a") ? "inline-block" : "-moz-inline-box"
    }else {
      style.display = "inline-block"
    }
  }
};
goog.style.isRightToLeft = function(el) {
  return"rtl" == goog.style.getStyle_(el, "direction")
};
goog.style.unselectableStyle_ = goog.userAgent.GECKO ? "MozUserSelect" : goog.userAgent.WEBKIT ? "WebkitUserSelect" : null;
goog.style.isUnselectable = function(el) {
  if(goog.style.unselectableStyle_) {
    return el.style[goog.style.unselectableStyle_].toLowerCase() == "none"
  }else {
    if(goog.userAgent.IE || goog.userAgent.OPERA) {
      return el.getAttribute("unselectable") == "on"
    }
  }
  return false
};
goog.style.setUnselectable = function(el, unselectable, opt_noRecurse) {
  var descendants = !opt_noRecurse ? el.getElementsByTagName("*") : null;
  var name = goog.style.unselectableStyle_;
  if(name) {
    var value = unselectable ? "none" : "";
    el.style[name] = value;
    if(descendants) {
      for(var i = 0, descendant;descendant = descendants[i];i++) {
        descendant.style[name] = value
      }
    }
  }else {
    if(goog.userAgent.IE || goog.userAgent.OPERA) {
      var value = unselectable ? "on" : "";
      el.setAttribute("unselectable", value);
      if(descendants) {
        for(var i = 0, descendant;descendant = descendants[i];i++) {
          descendant.setAttribute("unselectable", value)
        }
      }
    }
  }
};
goog.style.getBorderBoxSize = function(element) {
  return new goog.math.Size(element.offsetWidth, element.offsetHeight)
};
goog.style.setBorderBoxSize = function(element, size) {
  var doc = goog.dom.getOwnerDocument(element);
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode();
  if(goog.userAgent.IE && (!isCss1CompatMode || !goog.userAgent.isVersion("8"))) {
    var style = element.style;
    if(isCss1CompatMode) {
      var paddingBox = goog.style.getPaddingBox(element);
      var borderBox = goog.style.getBorderBox(element);
      style.pixelWidth = size.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right;
      style.pixelHeight = size.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom
    }else {
      style.pixelWidth = size.width;
      style.pixelHeight = size.height
    }
  }else {
    goog.style.setBoxSizingSize_(element, size, "border-box")
  }
};
goog.style.getContentBoxSize = function(element) {
  var doc = goog.dom.getOwnerDocument(element);
  var ieCurrentStyle = goog.userAgent.IE && element.currentStyle;
  if(ieCurrentStyle && goog.dom.getDomHelper(doc).isCss1CompatMode() && ieCurrentStyle.width != "auto" && ieCurrentStyle.height != "auto" && !ieCurrentStyle.boxSizing) {
    var width = goog.style.getIePixelValue_(element, ieCurrentStyle.width, "width", "pixelWidth");
    var height = goog.style.getIePixelValue_(element, ieCurrentStyle.height, "height", "pixelHeight");
    return new goog.math.Size(width, height)
  }else {
    var borderBoxSize = goog.style.getBorderBoxSize(element);
    var paddingBox = goog.style.getPaddingBox(element);
    var borderBox = goog.style.getBorderBox(element);
    return new goog.math.Size(borderBoxSize.width - borderBox.left - paddingBox.left - paddingBox.right - borderBox.right, borderBoxSize.height - borderBox.top - paddingBox.top - paddingBox.bottom - borderBox.bottom)
  }
};
goog.style.setContentBoxSize = function(element, size) {
  var doc = goog.dom.getOwnerDocument(element);
  var isCss1CompatMode = goog.dom.getDomHelper(doc).isCss1CompatMode();
  if(goog.userAgent.IE && (!isCss1CompatMode || !goog.userAgent.isVersion("8"))) {
    var style = element.style;
    if(isCss1CompatMode) {
      style.pixelWidth = size.width;
      style.pixelHeight = size.height
    }else {
      var paddingBox = goog.style.getPaddingBox(element);
      var borderBox = goog.style.getBorderBox(element);
      style.pixelWidth = size.width + borderBox.left + paddingBox.left + paddingBox.right + borderBox.right;
      style.pixelHeight = size.height + borderBox.top + paddingBox.top + paddingBox.bottom + borderBox.bottom
    }
  }else {
    goog.style.setBoxSizingSize_(element, size, "content-box")
  }
};
goog.style.setBoxSizingSize_ = function(element, size, boxSizing) {
  var style = element.style;
  if(goog.userAgent.GECKO) {
    style.MozBoxSizing = boxSizing
  }else {
    if(goog.userAgent.WEBKIT) {
      style.WebkitBoxSizing = boxSizing
    }else {
      style.boxSizing = boxSizing
    }
  }
  style.width = size.width + "px";
  style.height = size.height + "px"
};
goog.style.getIePixelValue_ = function(element, value, name, pixelName) {
  if(/^\d+px?$/.test(value)) {
    return parseInt(value, 10)
  }else {
    var oldStyleValue = element.style[name];
    var oldRuntimeValue = element.runtimeStyle[name];
    element.runtimeStyle[name] = element.currentStyle[name];
    element.style[name] = value;
    var pixelValue = element.style[pixelName];
    element.style[name] = oldStyleValue;
    element.runtimeStyle[name] = oldRuntimeValue;
    return pixelValue
  }
};
goog.style.getIePixelDistance_ = function(element, propName) {
  return goog.style.getIePixelValue_(element, goog.style.getCascadedStyle(element, propName), "left", "pixelLeft")
};
goog.style.getBox_ = function(element, stylePrefix) {
  if(goog.userAgent.IE) {
    var left = goog.style.getIePixelDistance_(element, stylePrefix + "Left");
    var right = goog.style.getIePixelDistance_(element, stylePrefix + "Right");
    var top = goog.style.getIePixelDistance_(element, stylePrefix + "Top");
    var bottom = goog.style.getIePixelDistance_(element, stylePrefix + "Bottom");
    return new goog.math.Box(top, right, bottom, left)
  }else {
    var left = goog.style.getComputedStyle(element, stylePrefix + "Left");
    var right = goog.style.getComputedStyle(element, stylePrefix + "Right");
    var top = goog.style.getComputedStyle(element, stylePrefix + "Top");
    var bottom = goog.style.getComputedStyle(element, stylePrefix + "Bottom");
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left))
  }
};
goog.style.getPaddingBox = function(element) {
  return goog.style.getBox_(element, "padding")
};
goog.style.getMarginBox = function(element) {
  return goog.style.getBox_(element, "margin")
};
goog.style.ieBorderWidthKeywords_ = {"thin":2, "medium":4, "thick":6};
goog.style.getIePixelBorder_ = function(element, prop) {
  if(goog.style.getCascadedStyle(element, prop + "Style") == "none") {
    return 0
  }
  var width = goog.style.getCascadedStyle(element, prop + "Width");
  if(width in goog.style.ieBorderWidthKeywords_) {
    return goog.style.ieBorderWidthKeywords_[width]
  }
  return goog.style.getIePixelValue_(element, width, "left", "pixelLeft")
};
goog.style.getBorderBox = function(element) {
  if(goog.userAgent.IE) {
    var left = goog.style.getIePixelBorder_(element, "borderLeft");
    var right = goog.style.getIePixelBorder_(element, "borderRight");
    var top = goog.style.getIePixelBorder_(element, "borderTop");
    var bottom = goog.style.getIePixelBorder_(element, "borderBottom");
    return new goog.math.Box(top, right, bottom, left)
  }else {
    var left = goog.style.getComputedStyle(element, "borderLeftWidth");
    var right = goog.style.getComputedStyle(element, "borderRightWidth");
    var top = goog.style.getComputedStyle(element, "borderTopWidth");
    var bottom = goog.style.getComputedStyle(element, "borderBottomWidth");
    return new goog.math.Box(parseFloat(top), parseFloat(right), parseFloat(bottom), parseFloat(left))
  }
};
goog.style.getFontFamily = function(el) {
  var doc = goog.dom.getOwnerDocument(el);
  var font = "";
  if(doc.body.createTextRange) {
    var range = doc.body.createTextRange();
    range.moveToElementText(el);
    try {
      font = range.queryCommandValue("FontName")
    }catch(e) {
      font = ""
    }
  }
  if(!font) {
    font = goog.style.getStyle_(el, "fontFamily")
  }
  var fontsArray = font.split(",");
  if(fontsArray.length > 1) {
    font = fontsArray[0]
  }
  return goog.string.stripQuotes(font, "\"'")
};
goog.style.lengthUnitRegex_ = /[^\d]+$/;
goog.style.getLengthUnits = function(value) {
  var units = value.match(goog.style.lengthUnitRegex_);
  return units && units[0] || null
};
goog.style.ABSOLUTE_CSS_LENGTH_UNITS_ = {"cm":1, "in":1, "mm":1, "pc":1, "pt":1};
goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_ = {"em":1, "ex":1};
goog.style.getFontSize = function(el) {
  var fontSize = goog.style.getStyle_(el, "fontSize");
  var sizeUnits = goog.style.getLengthUnits(fontSize);
  if(fontSize && "px" == sizeUnits) {
    return parseInt(fontSize, 10)
  }
  if(goog.userAgent.IE) {
    if(sizeUnits in goog.style.ABSOLUTE_CSS_LENGTH_UNITS_) {
      return goog.style.getIePixelValue_(el, fontSize, "left", "pixelLeft")
    }else {
      if(el.parentNode && el.parentNode.nodeType == goog.dom.NodeType.ELEMENT && sizeUnits in goog.style.CONVERTIBLE_RELATIVE_CSS_UNITS_) {
        var parentElement = el.parentNode;
        var parentSize = goog.style.getStyle_(parentElement, "fontSize");
        return goog.style.getIePixelValue_(parentElement, fontSize == parentSize ? "1em" : fontSize, "left", "pixelLeft")
      }
    }
  }
  var sizeElement = goog.dom.createDom("span", {"style":"visibility:hidden;position:absolute;" + "line-height:0;padding:0;margin:0;border:0;height:1em;"});
  goog.dom.appendChild(el, sizeElement);
  fontSize = sizeElement.offsetHeight;
  goog.dom.removeNode(sizeElement);
  return fontSize
};
goog.style.parseStyleAttribute = function(value) {
  var result = {};
  goog.array.forEach(value.split(/\s*;\s*/), function(pair) {
    var keyValue = pair.split(/\s*:\s*/);
    if(keyValue.length == 2) {
      result[goog.string.toCamelCase(keyValue[0].toLowerCase())] = keyValue[1]
    }
  });
  return result
};
goog.style.toStyleAttribute = function(obj) {
  var buffer = [];
  goog.object.forEach(obj, function(value, key) {
    buffer.push(goog.string.toSelectorCase(key), ":", value, ";")
  });
  return buffer.join("")
};
goog.style.setFloat = function(el, value) {
  el.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] = value
};
goog.style.getFloat = function(el) {
  return el.style[goog.userAgent.IE ? "styleFloat" : "cssFloat"] || ""
};
goog.style.getScrollbarWidth = function() {
  var mockElement = goog.dom.createElement("div");
  mockElement.style.cssText = "visibility:hidden;overflow:scroll;" + "position:absolute;top:0;width:100px;height:100px";
  goog.dom.appendChild(goog.dom.getDocument().body, mockElement);
  var width = mockElement.offsetWidth - mockElement.clientWidth;
  goog.dom.removeNode(mockElement);
  return width
};
goog.provide("goog.iter");
goog.provide("goog.iter.Iterator");
goog.provide("goog.iter.StopIteration");
goog.require("goog.array");
goog.require("goog.asserts");
goog.iter.Iterable;
if("StopIteration" in goog.global) {
  goog.iter.StopIteration = goog.global["StopIteration"]
}else {
  goog.iter.StopIteration = Error("StopIteration")
}
goog.iter.Iterator = function() {
};
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  return this
};
goog.iter.toIterator = function(iterable) {
  if(iterable instanceof goog.iter.Iterator) {
    return iterable
  }
  if(typeof iterable.__iterator__ == "function") {
    return iterable.__iterator__(false)
  }
  if(goog.isArrayLike(iterable)) {
    var i = 0;
    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
      while(true) {
        if(i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        if(!(i in iterable)) {
          i++;
          continue
        }
        return iterable[i++]
      }
    };
    return newIter
  }
  throw Error("Not implemented");
};
goog.iter.forEach = function(iterable, f, opt_obj) {
  if(goog.isArrayLike(iterable)) {
    try {
      goog.array.forEach(iterable, f, opt_obj)
    }catch(ex) {
      if(ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }else {
    iterable = goog.iter.toIterator(iterable);
    try {
      while(true) {
        f.call(opt_obj, iterable.next(), undefined, iterable)
      }
    }catch(ex) {
      if(ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }
};
goog.iter.filter = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      var val = iterable.next();
      if(f.call(opt_obj, val, undefined, iterable)) {
        return val
      }
    }
  };
  return newIter
};
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  var start = 0;
  var stop = startOrStop;
  var step = opt_step || 1;
  if(arguments.length > 1) {
    start = startOrStop;
    stop = opt_stop
  }
  if(step == 0) {
    throw Error("Range step argument must not be zero");
  }
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if(step > 0 && start >= stop || step < 0 && start <= stop) {
      throw goog.iter.StopIteration;
    }
    var rv = start;
    start += step;
    return rv
  };
  return newIter
};
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator)
};
goog.iter.map = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      var val = iterable.next();
      return f.call(opt_obj, val, undefined, iterable)
    }
  };
  return newIter
};
goog.iter.reduce = function(iterable, f, val, opt_obj) {
  var rval = val;
  goog.iter.forEach(iterable, function(val) {
    rval = f.call(opt_obj, rval, val)
  });
  return rval
};
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while(true) {
      if(f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return true
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return false
};
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while(true) {
      if(!f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return false
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return true
};
goog.iter.chain = function(var_args) {
  var args = arguments;
  var length = args.length;
  var i = 0;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    try {
      if(i >= length) {
        throw goog.iter.StopIteration;
      }
      var current = goog.iter.toIterator(args[i]);
      return current.next()
    }catch(ex) {
      if(ex !== goog.iter.StopIteration || i >= length) {
        throw ex;
      }else {
        i++;
        return this.next()
      }
    }
  };
  return newIter
};
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var dropping = true;
  newIter.next = function() {
    while(true) {
      var val = iterable.next();
      if(dropping && f.call(opt_obj, val, undefined, iterable)) {
        continue
      }else {
        dropping = false
      }
      return val
    }
  };
  return newIter
};
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var taking = true;
  newIter.next = function() {
    while(true) {
      if(taking) {
        var val = iterable.next();
        if(f.call(opt_obj, val, undefined, iterable)) {
          return val
        }else {
          taking = false
        }
      }else {
        throw goog.iter.StopIteration;
      }
    }
  };
  return newIter
};
goog.iter.toArray = function(iterable) {
  if(goog.isArrayLike(iterable)) {
    return goog.array.toArray(iterable)
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val)
  });
  return array
};
goog.iter.equals = function(iterable1, iterable2) {
  iterable1 = goog.iter.toIterator(iterable1);
  iterable2 = goog.iter.toIterator(iterable2);
  var b1, b2;
  try {
    while(true) {
      b1 = b2 = false;
      var val1 = iterable1.next();
      b1 = true;
      var val2 = iterable2.next();
      b2 = true;
      if(val1 != val2) {
        return false
      }
    }
  }catch(ex) {
    if(ex !== goog.iter.StopIteration) {
      throw ex;
    }else {
      if(b1 && !b2) {
        return false
      }
      if(!b2) {
        try {
          val2 = iterable2.next();
          return false
        }catch(ex1) {
          if(ex1 !== goog.iter.StopIteration) {
            throw ex1;
          }
          return true
        }
      }
    }
  }
  return false
};
goog.iter.nextOrValue = function(iterable, defaultValue) {
  try {
    return goog.iter.toIterator(iterable).next()
  }catch(e) {
    if(e != goog.iter.StopIteration) {
      throw e;
    }
    return defaultValue
  }
};
goog.iter.product = function(var_args) {
  var someArrayEmpty = goog.array.some(arguments, function(arr) {
    return!arr.length
  });
  if(someArrayEmpty || !arguments.length) {
    return new goog.iter.Iterator
  }
  var iter = new goog.iter.Iterator;
  var arrays = arguments;
  var indicies = goog.array.repeat(0, arrays.length);
  iter.next = function() {
    if(indicies) {
      var retVal = goog.array.map(indicies, function(valueIndex, arrayIndex) {
        return arrays[arrayIndex][valueIndex]
      });
      for(var i = indicies.length - 1;i >= 0;i--) {
        goog.asserts.assert(indicies);
        if(indicies[i] < arrays[i].length - 1) {
          indicies[i]++;
          break
        }
        if(i == 0) {
          indicies = null;
          break
        }
        indicies[i] = 0
      }
      return retVal
    }
    throw goog.iter.StopIteration;
  };
  return iter
};
goog.provide("goog.structs");
goog.require("goog.array");
goog.require("goog.object");
goog.structs.getCount = function(col) {
  if(typeof col.getCount == "function") {
    return col.getCount()
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return col.length
  }
  return goog.object.getCount(col)
};
goog.structs.getValues = function(col) {
  if(typeof col.getValues == "function") {
    return col.getValues()
  }
  if(goog.isString(col)) {
    return col.split("")
  }
  if(goog.isArrayLike(col)) {
    var rv = [];
    var l = col.length;
    for(var i = 0;i < l;i++) {
      rv.push(col[i])
    }
    return rv
  }
  return goog.object.getValues(col)
};
goog.structs.getKeys = function(col) {
  if(typeof col.getKeys == "function") {
    return col.getKeys()
  }
  if(typeof col.getValues == "function") {
    return undefined
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    var rv = [];
    var l = col.length;
    for(var i = 0;i < l;i++) {
      rv.push(i)
    }
    return rv
  }
  return goog.object.getKeys(col)
};
goog.structs.contains = function(col, val) {
  if(typeof col.contains == "function") {
    return col.contains(val)
  }
  if(typeof col.containsValue == "function") {
    return col.containsValue(val)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.contains(col, val)
  }
  return goog.object.containsValue(col, val)
};
goog.structs.isEmpty = function(col) {
  if(typeof col.isEmpty == "function") {
    return col.isEmpty()
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.isEmpty(col)
  }
  return goog.object.isEmpty(col)
};
goog.structs.clear = function(col) {
  if(typeof col.clear == "function") {
    col.clear()
  }else {
    if(goog.isArrayLike(col)) {
      goog.array.clear(col)
    }else {
      goog.object.clear(col)
    }
  }
};
goog.structs.forEach = function(col, f, opt_obj) {
  if(typeof col.forEach == "function") {
    col.forEach(f, opt_obj)
  }else {
    if(goog.isArrayLike(col) || goog.isString(col)) {
      goog.array.forEach(col, f, opt_obj)
    }else {
      var keys = goog.structs.getKeys(col);
      var values = goog.structs.getValues(col);
      var l = values.length;
      for(var i = 0;i < l;i++) {
        f.call(opt_obj, values[i], keys && keys[i], col)
      }
    }
  }
};
goog.structs.filter = function(col, f, opt_obj) {
  if(typeof col.filter == "function") {
    return col.filter(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter(col, f, opt_obj)
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if(keys) {
    rv = {};
    for(var i = 0;i < l;i++) {
      if(f.call(opt_obj, values[i], keys[i], col)) {
        rv[keys[i]] = values[i]
      }
    }
  }else {
    rv = [];
    for(var i = 0;i < l;i++) {
      if(f.call(opt_obj, values[i], undefined, col)) {
        rv.push(values[i])
      }
    }
  }
  return rv
};
goog.structs.map = function(col, f, opt_obj) {
  if(typeof col.map == "function") {
    return col.map(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map(col, f, opt_obj)
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if(keys) {
    rv = {};
    for(var i = 0;i < l;i++) {
      rv[keys[i]] = f.call(opt_obj, values[i], keys[i], col)
    }
  }else {
    rv = [];
    for(var i = 0;i < l;i++) {
      rv[i] = f.call(opt_obj, values[i], undefined, col)
    }
  }
  return rv
};
goog.structs.some = function(col, f, opt_obj) {
  if(typeof col.some == "function") {
    return col.some(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some(col, f, opt_obj)
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    if(f.call(opt_obj, values[i], keys && keys[i], col)) {
      return true
    }
  }
  return false
};
goog.structs.every = function(col, f, opt_obj) {
  if(typeof col.every == "function") {
    return col.every(f, opt_obj)
  }
  if(goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every(col, f, opt_obj)
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for(var i = 0;i < l;i++) {
    if(!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return false
    }
  }
  return true
};
goog.provide("goog.structs.Map");
goog.require("goog.iter.Iterator");
goog.require("goog.iter.StopIteration");
goog.require("goog.object");
goog.require("goog.structs");
goog.structs.Map = function(opt_map, var_args) {
  this.map_ = {};
  this.keys_ = [];
  var argLength = arguments.length;
  if(argLength > 1) {
    if(argLength % 2) {
      throw Error("Uneven number of arguments");
    }
    for(var i = 0;i < argLength;i += 2) {
      this.set(arguments[i], arguments[i + 1])
    }
  }else {
    if(opt_map) {
      this.addAll(opt_map)
    }
  }
};
goog.structs.Map.prototype.count_ = 0;
goog.structs.Map.prototype.version_ = 0;
goog.structs.Map.prototype.getCount = function() {
  return this.count_
};
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();
  var rv = [];
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key])
  }
  return rv
};
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return this.keys_.concat()
};
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key)
};
goog.structs.Map.prototype.containsValue = function(val) {
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    if(goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return true
    }
  }
  return false
};
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if(this === otherMap) {
    return true
  }
  if(this.count_ != otherMap.getCount()) {
    return false
  }
  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;
  this.cleanupKeysArray_();
  for(var key, i = 0;key = this.keys_[i];i++) {
    if(!equalityFn(this.get(key), otherMap.get(key))) {
      return false
    }
  }
  return true
};
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b
};
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0
};
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0
};
goog.structs.Map.prototype.remove = function(key) {
  if(goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;
    if(this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_()
    }
    return true
  }
  return false
};
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if(this.count_ != this.keys_.length) {
    var srcIndex = 0;
    var destIndex = 0;
    while(srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if(goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key
      }
      srcIndex++
    }
    this.keys_.length = destIndex
  }
  if(this.count_ != this.keys_.length) {
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while(srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if(!goog.structs.Map.hasKey_(seen, key)) {
        this.keys_[destIndex++] = key;
        seen[key] = 1
      }
      srcIndex++
    }
    this.keys_.length = destIndex
  }
};
goog.structs.Map.prototype.get = function(key, opt_val) {
  if(goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key]
  }
  return opt_val
};
goog.structs.Map.prototype.set = function(key, value) {
  if(!goog.structs.Map.hasKey_(this.map_, key)) {
    this.count_++;
    this.keys_.push(key);
    this.version_++
  }
  this.map_[key] = value
};
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if(map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues()
  }else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map)
  }
  for(var i = 0;i < keys.length;i++) {
    this.set(keys[i], values[i])
  }
};
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this)
};
goog.structs.Map.prototype.transpose = function() {
  var transposed = new goog.structs.Map;
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    var value = this.map_[key];
    transposed.set(value, key)
  }
  return transposed
};
goog.structs.Map.prototype.toObject = function() {
  this.cleanupKeysArray_();
  var obj = {};
  for(var i = 0;i < this.keys_.length;i++) {
    var key = this.keys_[i];
    obj[key] = this.map_[key]
  }
  return obj
};
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(true)
};
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(false)
};
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  this.cleanupKeysArray_();
  var i = 0;
  var keys = this.keys_;
  var map = this.map_;
  var version = this.version_;
  var selfObj = this;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while(true) {
      if(version != selfObj.version_) {
        throw Error("The map has changed since the iterator was created");
      }
      if(i >= keys.length) {
        throw goog.iter.StopIteration;
      }
      var key = keys[i++];
      return opt_keys ? key : map[key]
    }
  };
  return newIter
};
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
};
goog.provide("goog.dom.forms");
goog.require("goog.structs.Map");
goog.dom.forms.getFormDataMap = function(form) {
  var map = new goog.structs.Map;
  goog.dom.forms.getFormDataHelper_(form, map, goog.dom.forms.addFormDataToMap_);
  return map
};
goog.dom.forms.getFormDataString = function(form) {
  var sb = [];
  goog.dom.forms.getFormDataHelper_(form, sb, goog.dom.forms.addFormDataToStringBuffer_);
  return sb.join("&")
};
goog.dom.forms.getFormDataHelper_ = function(form, result, fnAppend) {
  var els = form.elements;
  for(var el, i = 0;el = els[i];i++) {
    if(el.disabled || el.tagName.toLowerCase() == "fieldset") {
      continue
    }
    var name = el.name;
    var type = el.type.toLowerCase();
    switch(type) {
      case "file":
      ;
      case "submit":
      ;
      case "reset":
      ;
      case "button":
        break;
      case "select-multiple":
        var values = goog.dom.forms.getValue(el);
        if(values != null) {
          for(var value, j = 0;value = values[j];j++) {
            fnAppend(result, name, value)
          }
        }
        break;
      default:
        var value = goog.dom.forms.getValue(el);
        if(value != null) {
          fnAppend(result, name, value)
        }
    }
  }
  var inputs = form.getElementsByTagName("input");
  for(var input, i = 0;input = inputs[i];i++) {
    if(input.form == form && input.type.toLowerCase() == "image") {
      name = input.name;
      fnAppend(result, name, input.value);
      fnAppend(result, name + ".x", "0");
      fnAppend(result, name + ".y", "0")
    }
  }
};
goog.dom.forms.addFormDataToMap_ = function(map, name, value) {
  var array = map.get(name);
  if(!array) {
    array = [];
    map.set(name, array)
  }
  array.push(value)
};
goog.dom.forms.addFormDataToStringBuffer_ = function(sb, name, value) {
  sb.push(encodeURIComponent(name) + "=" + encodeURIComponent(value))
};
goog.dom.forms.hasFileInput = function(form) {
  var els = form.elements;
  for(var el, i = 0;el = els[i];i++) {
    if(!el.disabled && el.type && el.type.toLowerCase() == "file") {
      return true
    }
  }
  return false
};
goog.dom.forms.setDisabled = function(el, disabled) {
  if(el.tagName == "FORM") {
    var els = el.elements;
    for(var i = 0;el = els[i];i++) {
      goog.dom.forms.setDisabled(el, disabled)
    }
  }else {
    if(disabled == true) {
      el.blur()
    }
    el.disabled = disabled
  }
};
goog.dom.forms.focusAndSelect = function(el) {
  el.focus();
  if(el.select) {
    el.select()
  }
};
goog.dom.forms.hasValue = function(el) {
  var value = goog.dom.forms.getValue(el);
  return!!value
};
goog.dom.forms.hasValueByName = function(form, name) {
  var value = goog.dom.forms.getValueByName(form, name);
  return!!value
};
goog.dom.forms.getValue = function(el) {
  var type = el.type;
  if(!goog.isDef(type)) {
    return null
  }
  switch(type.toLowerCase()) {
    case "checkbox":
    ;
    case "radio":
      return goog.dom.forms.getInputChecked_(el);
    case "select-one":
      return goog.dom.forms.getSelectSingle_(el);
    case "select-multiple":
      return goog.dom.forms.getSelectMultiple_(el);
    default:
      return goog.isDef(el.value) ? el.value : null
  }
};
goog.dom.$F = goog.dom.forms.getValue;
goog.dom.forms.getValueByName = function(form, name) {
  var els = form.elements[name];
  if(els.type) {
    return goog.dom.forms.getValue(els)
  }else {
    for(var i = 0;i < els.length;i++) {
      var val = goog.dom.forms.getValue(els[i]);
      if(val) {
        return val
      }
    }
    return null
  }
};
goog.dom.forms.getInputChecked_ = function(el) {
  return el.checked ? el.value : null
};
goog.dom.forms.getSelectSingle_ = function(el) {
  var selectedIndex = el.selectedIndex;
  return selectedIndex >= 0 ? el.options[selectedIndex].value : null
};
goog.dom.forms.getSelectMultiple_ = function(el) {
  var values = [];
  for(var option, i = 0;option = el.options[i];i++) {
    if(option.selected) {
      values.push(option.value)
    }
  }
  return values.length ? values : null
};
goog.dom.forms.setValue = function(el, opt_value) {
  var type = el.type;
  if(goog.isDef(type)) {
    switch(type.toLowerCase()) {
      case "checkbox":
      ;
      case "radio":
        goog.dom.forms.setInputChecked_(el, opt_value);
        break;
      case "select-one":
        goog.dom.forms.setSelectSingle_(el, opt_value);
        break;
      case "select-multiple":
        goog.dom.forms.setSelectMultiple_(el, opt_value);
        break;
      default:
        el.value = goog.isDefAndNotNull(opt_value) ? opt_value : ""
    }
  }
};
goog.dom.forms.setInputChecked_ = function(el, opt_value) {
  el.checked = opt_value ? "checked" : null
};
goog.dom.forms.setSelectSingle_ = function(el, opt_value) {
  el.selectedIndex = -1;
  if(goog.isString(opt_value)) {
    for(var option, i = 0;option = el.options[i];i++) {
      if(option.value == opt_value) {
        option.selected = true;
        break
      }
    }
  }
};
goog.dom.forms.setSelectMultiple_ = function(el, opt_value) {
  if(goog.isString(opt_value)) {
    opt_value = [opt_value]
  }
  for(var option, i = 0;option = el.options[i];i++) {
    option.selected = false;
    if(opt_value) {
      for(var value, j = 0;value = opt_value[j];j++) {
        if(option.value == value) {
          option.selected = true
        }
      }
    }
  }
};
goog.provide("goog.debug.EntryPointMonitor");
goog.provide("goog.debug.entryPointRegistry");
goog.debug.EntryPointMonitor = function() {
};
goog.debug.EntryPointMonitor.prototype.wrap;
goog.debug.EntryPointMonitor.prototype.unwrap;
goog.debug.entryPointRegistry.refList_ = [];
goog.debug.entryPointRegistry.register = function(callback) {
  goog.debug.entryPointRegistry.refList_[goog.debug.entryPointRegistry.refList_.length] = callback
};
goog.debug.entryPointRegistry.monitorAll = function(monitor) {
  var transformer = goog.bind(monitor.wrap, monitor);
  for(var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer)
  }
};
goog.debug.entryPointRegistry.unmonitorAllIfPossible = function(monitor) {
  var transformer = goog.bind(monitor.unwrap, monitor);
  for(var i = 0;i < goog.debug.entryPointRegistry.refList_.length;i++) {
    goog.debug.entryPointRegistry.refList_[i](transformer)
  }
};
goog.provide("goog.debug.errorHandlerWeakDep");
goog.debug.errorHandlerWeakDep = {protectEntryPoint:function(fn, opt_tracers) {
  return fn
}};
goog.provide("goog.events.Listener");
goog.events.Listener = function() {
};
goog.events.Listener.counter_ = 0;
goog.events.Listener.prototype.isFunctionListener_;
goog.events.Listener.prototype.listener;
goog.events.Listener.prototype.proxy;
goog.events.Listener.prototype.src;
goog.events.Listener.prototype.type;
goog.events.Listener.prototype.capture;
goog.events.Listener.prototype.handler;
goog.events.Listener.prototype.key = 0;
goog.events.Listener.prototype.removed = false;
goog.events.Listener.prototype.callOnce = false;
goog.events.Listener.prototype.init = function(listener, proxy, src, type, capture, opt_handler) {
  if(goog.isFunction(listener)) {
    this.isFunctionListener_ = true
  }else {
    if(listener && listener.handleEvent && goog.isFunction(listener.handleEvent)) {
      this.isFunctionListener_ = false
    }else {
      throw Error("Invalid listener argument");
    }
  }
  this.listener = listener;
  this.proxy = proxy;
  this.src = src;
  this.type = type;
  this.capture = !!capture;
  this.handler = opt_handler;
  this.callOnce = false;
  this.key = ++goog.events.Listener.counter_;
  this.removed = false
};
goog.events.Listener.prototype.handleEvent = function(eventObject) {
  if(this.isFunctionListener_) {
    return this.listener.call(this.handler || this.src, eventObject)
  }
  return this.listener.handleEvent.call(this.listener, eventObject)
};
goog.provide("goog.structs.SimplePool");
goog.require("goog.Disposable");
goog.structs.SimplePool = function(initialCount, maxCount) {
  goog.Disposable.call(this);
  this.maxCount_ = maxCount;
  this.freeQueue_ = [];
  this.createInitial_(initialCount)
};
goog.inherits(goog.structs.SimplePool, goog.Disposable);
goog.structs.SimplePool.prototype.createObjectFn_ = null;
goog.structs.SimplePool.prototype.disposeObjectFn_ = null;
goog.structs.SimplePool.prototype.setCreateObjectFn = function(createObjectFn) {
  this.createObjectFn_ = createObjectFn
};
goog.structs.SimplePool.prototype.setDisposeObjectFn = function(disposeObjectFn) {
  this.disposeObjectFn_ = disposeObjectFn
};
goog.structs.SimplePool.prototype.getObject = function() {
  if(this.freeQueue_.length) {
    return this.freeQueue_.pop()
  }
  return this.createObject()
};
goog.structs.SimplePool.prototype.releaseObject = function(obj) {
  if(this.freeQueue_.length < this.maxCount_) {
    this.freeQueue_.push(obj)
  }else {
    this.disposeObject(obj)
  }
};
goog.structs.SimplePool.prototype.createInitial_ = function(initialCount) {
  if(initialCount > this.maxCount_) {
    throw Error("[goog.structs.SimplePool] Initial cannot be greater than max");
  }
  for(var i = 0;i < initialCount;i++) {
    this.freeQueue_.push(this.createObject())
  }
};
goog.structs.SimplePool.prototype.createObject = function() {
  if(this.createObjectFn_) {
    return this.createObjectFn_()
  }else {
    return{}
  }
};
goog.structs.SimplePool.prototype.disposeObject = function(obj) {
  if(this.disposeObjectFn_) {
    this.disposeObjectFn_(obj)
  }else {
    if(goog.isObject(obj)) {
      if(goog.isFunction(obj.dispose)) {
        obj.dispose()
      }else {
        for(var i in obj) {
          delete obj[i]
        }
      }
    }
  }
};
goog.structs.SimplePool.prototype.disposeInternal = function() {
  goog.structs.SimplePool.superClass_.disposeInternal.call(this);
  var freeQueue = this.freeQueue_;
  while(freeQueue.length) {
    this.disposeObject(freeQueue.pop())
  }
  delete this.freeQueue_
};
goog.provide("goog.events.pools");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.Listener");
goog.require("goog.structs.SimplePool");
goog.require("goog.userAgent.jscript");
goog.events.ASSUME_GOOD_GC = false;
goog.events.pools.getObject;
goog.events.pools.releaseObject;
goog.events.pools.getArray;
goog.events.pools.releaseArray;
goog.events.pools.getProxy;
goog.events.pools.setProxyCallbackFunction;
goog.events.pools.releaseProxy;
goog.events.pools.getListener;
goog.events.pools.releaseListener;
goog.events.pools.getEvent;
goog.events.pools.releaseEvent;
(function() {
  var BAD_GC = !goog.events.ASSUME_GOOD_GC && goog.userAgent.jscript.HAS_JSCRIPT && !goog.userAgent.jscript.isVersion("5.7");
  function getObject() {
    return{count_:0, remaining_:0}
  }
  function getArray() {
    return[]
  }
  var proxyCallbackFunction;
  goog.events.pools.setProxyCallbackFunction = function(cb) {
    proxyCallbackFunction = cb
  };
  function getProxy() {
    var f = function(eventObject) {
      return proxyCallbackFunction.call(f.src, f.key, eventObject)
    };
    return f
  }
  function getListener() {
    return new goog.events.Listener
  }
  function getEvent() {
    return new goog.events.BrowserEvent
  }
  if(!BAD_GC) {
    goog.events.pools.getObject = getObject;
    goog.events.pools.releaseObject = goog.nullFunction;
    goog.events.pools.getArray = getArray;
    goog.events.pools.releaseArray = goog.nullFunction;
    goog.events.pools.getProxy = getProxy;
    goog.events.pools.releaseProxy = goog.nullFunction;
    goog.events.pools.getListener = getListener;
    goog.events.pools.releaseListener = goog.nullFunction;
    goog.events.pools.getEvent = getEvent;
    goog.events.pools.releaseEvent = goog.nullFunction
  }else {
    goog.events.pools.getObject = function() {
      return objectPool.getObject()
    };
    goog.events.pools.releaseObject = function(obj) {
      objectPool.releaseObject(obj)
    };
    goog.events.pools.getArray = function() {
      return arrayPool.getObject()
    };
    goog.events.pools.releaseArray = function(obj) {
      arrayPool.releaseObject(obj)
    };
    goog.events.pools.getProxy = function() {
      return proxyPool.getObject()
    };
    goog.events.pools.releaseProxy = function(obj) {
      proxyPool.releaseObject(getProxy())
    };
    goog.events.pools.getListener = function() {
      return listenerPool.getObject()
    };
    goog.events.pools.releaseListener = function(obj) {
      listenerPool.releaseObject(obj)
    };
    goog.events.pools.getEvent = function() {
      return eventPool.getObject()
    };
    goog.events.pools.releaseEvent = function(obj) {
      eventPool.releaseObject(obj)
    };
    var OBJECT_POOL_INITIAL_COUNT = 0;
    var OBJECT_POOL_MAX_COUNT = 600;
    var objectPool = new goog.structs.SimplePool(OBJECT_POOL_INITIAL_COUNT, OBJECT_POOL_MAX_COUNT);
    objectPool.setCreateObjectFn(getObject);
    var ARRAY_POOL_INITIAL_COUNT = 0;
    var ARRAY_POOL_MAX_COUNT = 600;
    var arrayPool = new goog.structs.SimplePool(ARRAY_POOL_INITIAL_COUNT, ARRAY_POOL_MAX_COUNT);
    arrayPool.setCreateObjectFn(getArray);
    var HANDLE_EVENT_PROXY_POOL_INITIAL_COUNT = 0;
    var HANDLE_EVENT_PROXY_POOL_MAX_COUNT = 600;
    var proxyPool = new goog.structs.SimplePool(HANDLE_EVENT_PROXY_POOL_INITIAL_COUNT, HANDLE_EVENT_PROXY_POOL_MAX_COUNT);
    proxyPool.setCreateObjectFn(getProxy);
    var LISTENER_POOL_INITIAL_COUNT = 0;
    var LISTENER_POOL_MAX_COUNT = 600;
    var listenerPool = new goog.structs.SimplePool(LISTENER_POOL_INITIAL_COUNT, LISTENER_POOL_MAX_COUNT);
    listenerPool.setCreateObjectFn(getListener);
    var EVENT_POOL_INITIAL_COUNT = 0;
    var EVENT_POOL_MAX_COUNT = 600;
    var eventPool = new goog.structs.SimplePool(EVENT_POOL_INITIAL_COUNT, EVENT_POOL_MAX_COUNT);
    eventPool.setCreateObjectFn(getEvent)
  }
})();
goog.provide("goog.events");
goog.require("goog.array");
goog.require("goog.debug.entryPointRegistry");
goog.require("goog.debug.errorHandlerWeakDep");
goog.require("goog.events.BrowserEvent");
goog.require("goog.events.Event");
goog.require("goog.events.EventWrapper");
goog.require("goog.events.pools");
goog.require("goog.object");
goog.require("goog.userAgent");
goog.events.listeners_ = {};
goog.events.listenerTree_ = {};
goog.events.sources_ = {};
goog.events.onString_ = "on";
goog.events.onStringMap_ = {};
goog.events.keySeparator_ = "_";
goog.events.requiresSyntheticEventPropagation_;
goog.events.listen = function(src, type, listener, opt_capt, opt_handler) {
  if(!type) {
    throw Error("Invalid event type");
  }else {
    if(goog.isArray(type)) {
      for(var i = 0;i < type.length;i++) {
        goog.events.listen(src, type[i], listener, opt_capt, opt_handler)
      }
      return null
    }else {
      var capture = !!opt_capt;
      var map = goog.events.listenerTree_;
      if(!(type in map)) {
        map[type] = goog.events.pools.getObject()
      }
      map = map[type];
      if(!(capture in map)) {
        map[capture] = goog.events.pools.getObject();
        map.count_++
      }
      map = map[capture];
      var srcUid = goog.getUid(src);
      var listenerArray, listenerObj;
      map.remaining_++;
      if(!map[srcUid]) {
        listenerArray = map[srcUid] = goog.events.pools.getArray();
        map.count_++
      }else {
        listenerArray = map[srcUid];
        for(var i = 0;i < listenerArray.length;i++) {
          listenerObj = listenerArray[i];
          if(listenerObj.listener == listener && listenerObj.handler == opt_handler) {
            if(listenerObj.removed) {
              break
            }
            return listenerArray[i].key
          }
        }
      }
      var proxy = goog.events.pools.getProxy();
      proxy.src = src;
      listenerObj = goog.events.pools.getListener();
      listenerObj.init(listener, proxy, src, type, capture, opt_handler);
      var key = listenerObj.key;
      proxy.key = key;
      listenerArray.push(listenerObj);
      goog.events.listeners_[key] = listenerObj;
      if(!goog.events.sources_[srcUid]) {
        goog.events.sources_[srcUid] = goog.events.pools.getArray()
      }
      goog.events.sources_[srcUid].push(listenerObj);
      if(src.addEventListener) {
        if(src == goog.global || !src.customEvent_) {
          src.addEventListener(type, proxy, capture)
        }
      }else {
        src.attachEvent(goog.events.getOnString_(type), proxy)
      }
      return key
    }
  }
};
goog.events.listenOnce = function(src, type, listener, opt_capt, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      goog.events.listenOnce(src, type[i], listener, opt_capt, opt_handler)
    }
    return null
  }
  var key = goog.events.listen(src, type, listener, opt_capt, opt_handler);
  var listenerObj = goog.events.listeners_[key];
  listenerObj.callOnce = true;
  return key
};
goog.events.listenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.listen(src, listener, opt_capt, opt_handler)
};
goog.events.unlisten = function(src, type, listener, opt_capt, opt_handler) {
  if(goog.isArray(type)) {
    for(var i = 0;i < type.length;i++) {
      goog.events.unlisten(src, type[i], listener, opt_capt, opt_handler)
    }
    return null
  }
  var capture = !!opt_capt;
  var listenerArray = goog.events.getListeners_(src, type, capture);
  if(!listenerArray) {
    return false
  }
  for(var i = 0;i < listenerArray.length;i++) {
    if(listenerArray[i].listener == listener && listenerArray[i].capture == capture && listenerArray[i].handler == opt_handler) {
      return goog.events.unlistenByKey(listenerArray[i].key)
    }
  }
  return false
};
goog.events.unlistenByKey = function(key) {
  if(!goog.events.listeners_[key]) {
    return false
  }
  var listener = goog.events.listeners_[key];
  if(listener.removed) {
    return false
  }
  var src = listener.src;
  var type = listener.type;
  var proxy = listener.proxy;
  var capture = listener.capture;
  if(src.removeEventListener) {
    if(src == goog.global || !src.customEvent_) {
      src.removeEventListener(type, proxy, capture)
    }
  }else {
    if(src.detachEvent) {
      src.detachEvent(goog.events.getOnString_(type), proxy)
    }
  }
  var srcUid = goog.getUid(src);
  var listenerArray = goog.events.listenerTree_[type][capture][srcUid];
  if(goog.events.sources_[srcUid]) {
    var sourcesArray = goog.events.sources_[srcUid];
    goog.array.remove(sourcesArray, listener);
    if(sourcesArray.length == 0) {
      delete goog.events.sources_[srcUid]
    }
  }
  listener.removed = true;
  listenerArray.needsCleanup_ = true;
  goog.events.cleanUp_(type, capture, srcUid, listenerArray);
  delete goog.events.listeners_[key];
  return true
};
goog.events.unlistenWithWrapper = function(src, wrapper, listener, opt_capt, opt_handler) {
  wrapper.unlisten(src, listener, opt_capt, opt_handler)
};
goog.events.cleanUp_ = function(type, capture, srcUid, listenerArray) {
  if(!listenerArray.locked_) {
    if(listenerArray.needsCleanup_) {
      for(var oldIndex = 0, newIndex = 0;oldIndex < listenerArray.length;oldIndex++) {
        if(listenerArray[oldIndex].removed) {
          var proxy = listenerArray[oldIndex].proxy;
          proxy.src = null;
          goog.events.pools.releaseProxy(proxy);
          goog.events.pools.releaseListener(listenerArray[oldIndex]);
          continue
        }
        if(oldIndex != newIndex) {
          listenerArray[newIndex] = listenerArray[oldIndex]
        }
        newIndex++
      }
      listenerArray.length = newIndex;
      listenerArray.needsCleanup_ = false;
      if(newIndex == 0) {
        goog.events.pools.releaseArray(listenerArray);
        delete goog.events.listenerTree_[type][capture][srcUid];
        goog.events.listenerTree_[type][capture].count_--;
        if(goog.events.listenerTree_[type][capture].count_ == 0) {
          goog.events.pools.releaseObject(goog.events.listenerTree_[type][capture]);
          delete goog.events.listenerTree_[type][capture];
          goog.events.listenerTree_[type].count_--
        }
        if(goog.events.listenerTree_[type].count_ == 0) {
          goog.events.pools.releaseObject(goog.events.listenerTree_[type]);
          delete goog.events.listenerTree_[type]
        }
      }
    }
  }
};
goog.events.removeAll = function(opt_obj, opt_type, opt_capt) {
  var count = 0;
  var noObj = opt_obj == null;
  var noType = opt_type == null;
  var noCapt = opt_capt == null;
  opt_capt = !!opt_capt;
  if(!noObj) {
    var srcUid = goog.getUid(opt_obj);
    if(goog.events.sources_[srcUid]) {
      var sourcesArray = goog.events.sources_[srcUid];
      for(var i = sourcesArray.length - 1;i >= 0;i--) {
        var listener = sourcesArray[i];
        if((noType || opt_type == listener.type) && (noCapt || opt_capt == listener.capture)) {
          goog.events.unlistenByKey(listener.key);
          count++
        }
      }
    }
  }else {
    goog.object.forEach(goog.events.sources_, function(listeners) {
      for(var i = listeners.length - 1;i >= 0;i--) {
        var listener = listeners[i];
        if((noType || opt_type == listener.type) && (noCapt || opt_capt == listener.capture)) {
          goog.events.unlistenByKey(listener.key);
          count++
        }
      }
    })
  }
  return count
};
goog.events.getListeners = function(obj, type, capture) {
  return goog.events.getListeners_(obj, type, capture) || []
};
goog.events.getListeners_ = function(obj, type, capture) {
  var map = goog.events.listenerTree_;
  if(type in map) {
    map = map[type];
    if(capture in map) {
      map = map[capture];
      var objUid = goog.getUid(obj);
      if(map[objUid]) {
        return map[objUid]
      }
    }
  }
  return null
};
goog.events.getListener = function(src, type, listener, opt_capt, opt_handler) {
  var capture = !!opt_capt;
  var listenerArray = goog.events.getListeners_(src, type, capture);
  if(listenerArray) {
    for(var i = 0;i < listenerArray.length;i++) {
      if(listenerArray[i].listener == listener && listenerArray[i].capture == capture && listenerArray[i].handler == opt_handler) {
        return listenerArray[i]
      }
    }
  }
  return null
};
goog.events.hasListener = function(obj, opt_type, opt_capture) {
  var objUid = goog.getUid(obj);
  var listeners = goog.events.sources_[objUid];
  if(listeners) {
    var hasType = goog.isDef(opt_type);
    var hasCapture = goog.isDef(opt_capture);
    if(hasType && hasCapture) {
      var map = goog.events.listenerTree_[opt_type];
      return!!map && !!map[opt_capture] && objUid in map[opt_capture]
    }else {
      if(!(hasType || hasCapture)) {
        return true
      }else {
        return goog.array.some(listeners, function(listener) {
          return hasType && listener.type == opt_type || hasCapture && listener.capture == opt_capture
        })
      }
    }
  }
  return false
};
goog.events.expose = function(e) {
  var str = [];
  for(var key in e) {
    if(e[key] && e[key].id) {
      str.push(key + " = " + e[key] + " (" + e[key].id + ")")
    }else {
      str.push(key + " = " + e[key])
    }
  }
  return str.join("\n")
};
goog.events.getOnString_ = function(type) {
  if(type in goog.events.onStringMap_) {
    return goog.events.onStringMap_[type]
  }
  return goog.events.onStringMap_[type] = goog.events.onString_ + type
};
goog.events.fireListeners = function(obj, type, capture, eventObject) {
  var map = goog.events.listenerTree_;
  if(type in map) {
    map = map[type];
    if(capture in map) {
      return goog.events.fireListeners_(map[capture], obj, type, capture, eventObject)
    }
  }
  return true
};
goog.events.fireListeners_ = function(map, obj, type, capture, eventObject) {
  var retval = 1;
  var objUid = goog.getUid(obj);
  if(map[objUid]) {
    map.remaining_--;
    var listenerArray = map[objUid];
    if(!listenerArray.locked_) {
      listenerArray.locked_ = 1
    }else {
      listenerArray.locked_++
    }
    try {
      var length = listenerArray.length;
      for(var i = 0;i < length;i++) {
        var listener = listenerArray[i];
        if(listener && !listener.removed) {
          retval &= goog.events.fireListener(listener, eventObject) !== false
        }
      }
    }finally {
      listenerArray.locked_--;
      goog.events.cleanUp_(type, capture, objUid, listenerArray)
    }
  }
  return Boolean(retval)
};
goog.events.fireListener = function(listener, eventObject) {
  var rv = listener.handleEvent(eventObject);
  if(listener.callOnce) {
    goog.events.unlistenByKey(listener.key)
  }
  return rv
};
goog.events.getTotalListenerCount = function() {
  return goog.object.getCount(goog.events.listeners_)
};
goog.events.dispatchEvent = function(src, e) {
  var type = e.type || e;
  var map = goog.events.listenerTree_;
  if(!(type in map)) {
    return true
  }
  if(goog.isString(e)) {
    e = new goog.events.Event(e, src)
  }else {
    if(!(e instanceof goog.events.Event)) {
      var oldEvent = e;
      e = new goog.events.Event(type, src);
      goog.object.extend(e, oldEvent)
    }else {
      e.target = e.target || src
    }
  }
  var rv = 1, ancestors;
  map = map[type];
  var hasCapture = true in map;
  var targetsMap;
  if(hasCapture) {
    ancestors = [];
    for(var parent = src;parent;parent = parent.getParentEventTarget()) {
      ancestors.push(parent)
    }
    targetsMap = map[true];
    targetsMap.remaining_ = targetsMap.count_;
    for(var i = ancestors.length - 1;!e.propagationStopped_ && i >= 0 && targetsMap.remaining_;i--) {
      e.currentTarget = ancestors[i];
      rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type, true, e) && e.returnValue_ != false
    }
  }
  var hasBubble = false in map;
  if(hasBubble) {
    targetsMap = map[false];
    targetsMap.remaining_ = targetsMap.count_;
    if(hasCapture) {
      for(var i = 0;!e.propagationStopped_ && i < ancestors.length && targetsMap.remaining_;i++) {
        e.currentTarget = ancestors[i];
        rv &= goog.events.fireListeners_(targetsMap, ancestors[i], e.type, false, e) && e.returnValue_ != false
      }
    }else {
      for(var current = src;!e.propagationStopped_ && current && targetsMap.remaining_;current = current.getParentEventTarget()) {
        e.currentTarget = current;
        rv &= goog.events.fireListeners_(targetsMap, current, e.type, false, e) && e.returnValue_ != false
      }
    }
  }
  return Boolean(rv)
};
goog.events.protectBrowserEventEntryPoint = function(errorHandler) {
  goog.events.handleBrowserEvent_ = errorHandler.protectEntryPoint(goog.events.handleBrowserEvent_);
  goog.events.pools.setProxyCallbackFunction(goog.events.handleBrowserEvent_)
};
goog.events.handleBrowserEvent_ = function(key, opt_evt) {
  if(!goog.events.listeners_[key]) {
    return true
  }
  var listener = goog.events.listeners_[key];
  var type = listener.type;
  var map = goog.events.listenerTree_;
  if(!(type in map)) {
    return true
  }
  map = map[type];
  var retval, targetsMap;
  if(goog.events.synthesizeEventPropagation_()) {
    var ieEvent = opt_evt || goog.getObjectByName("window.event");
    var hasCapture = true in map;
    var hasBubble = false in map;
    if(hasCapture) {
      if(goog.events.isMarkedIeEvent_(ieEvent)) {
        return true
      }
      goog.events.markIeEvent_(ieEvent)
    }
    var evt = goog.events.pools.getEvent();
    evt.init(ieEvent, this);
    retval = true;
    try {
      if(hasCapture) {
        var ancestors = goog.events.pools.getArray();
        for(var parent = evt.currentTarget;parent;parent = parent.parentNode) {
          ancestors.push(parent)
        }
        targetsMap = map[true];
        targetsMap.remaining_ = targetsMap.count_;
        for(var i = ancestors.length - 1;!evt.propagationStopped_ && i >= 0 && targetsMap.remaining_;i--) {
          evt.currentTarget = ancestors[i];
          retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type, true, evt)
        }
        if(hasBubble) {
          targetsMap = map[false];
          targetsMap.remaining_ = targetsMap.count_;
          for(var i = 0;!evt.propagationStopped_ && i < ancestors.length && targetsMap.remaining_;i++) {
            evt.currentTarget = ancestors[i];
            retval &= goog.events.fireListeners_(targetsMap, ancestors[i], type, false, evt)
          }
        }
      }else {
        retval = goog.events.fireListener(listener, evt)
      }
    }finally {
      if(ancestors) {
        ancestors.length = 0;
        goog.events.pools.releaseArray(ancestors)
      }
      evt.dispose();
      goog.events.pools.releaseEvent(evt)
    }
    return retval
  }
  var be = new goog.events.BrowserEvent(opt_evt, this);
  try {
    retval = goog.events.fireListener(listener, be)
  }finally {
    be.dispose()
  }
  return retval
};
goog.events.pools.setProxyCallbackFunction(goog.events.handleBrowserEvent_);
goog.events.markIeEvent_ = function(e) {
  var useReturnValue = false;
  if(e.keyCode == 0) {
    try {
      e.keyCode = -1;
      return
    }catch(ex) {
      useReturnValue = true
    }
  }
  if(useReturnValue || e.returnValue == undefined) {
    e.returnValue = true
  }
};
goog.events.isMarkedIeEvent_ = function(e) {
  return e.keyCode < 0 || e.returnValue != undefined
};
goog.events.uniqueIdCounter_ = 0;
goog.events.getUniqueId = function(identifier) {
  return identifier + "_" + goog.events.uniqueIdCounter_++
};
goog.events.synthesizeEventPropagation_ = function() {
  if(goog.events.requiresSyntheticEventPropagation_ === undefined) {
    goog.events.requiresSyntheticEventPropagation_ = goog.userAgent.IE && !goog.global["addEventListener"]
  }
  return goog.events.requiresSyntheticEventPropagation_
};
goog.debug.entryPointRegistry.register(function(transformer) {
  goog.events.handleBrowserEvent_ = transformer(goog.events.handleBrowserEvent_);
  goog.events.pools.setProxyCallbackFunction(goog.events.handleBrowserEvent_)
});
goog.provide("goog.dom.xml");
goog.require("goog.dom");
goog.require("goog.dom.NodeType");
goog.dom.xml.MAX_XML_SIZE_KB = 2 * 1024;
goog.dom.xml.MAX_ELEMENT_DEPTH = 256;
goog.dom.xml.createDocument = function(opt_rootTagName, opt_namespaceUri) {
  if(opt_namespaceUri && !opt_rootTagName) {
    throw Error("Can't create document with namespace and no root tag");
  }
  if(document.implementation && document.implementation.createDocument) {
    return document.implementation.createDocument(opt_namespaceUri || "", opt_rootTagName || "", null)
  }else {
    if(typeof ActiveXObject != "undefined") {
      var doc = goog.dom.xml.createMsXmlDocument_();
      if(doc) {
        if(opt_rootTagName) {
          doc.appendChild(doc.createNode(goog.dom.NodeType.ELEMENT, opt_rootTagName, opt_namespaceUri || ""))
        }
        return doc
      }
    }
  }
  throw Error("Your browser does not support creating new documents");
};
goog.dom.xml.loadXml = function(xml) {
  if(typeof DOMParser != "undefined") {
    return(new DOMParser).parseFromString(xml, "application/xml")
  }else {
    if(typeof ActiveXObject != "undefined") {
      var doc = goog.dom.xml.createMsXmlDocument_();
      doc.loadXML(xml);
      return doc
    }
  }
  throw Error("Your browser does not support loading xml documents");
};
goog.dom.xml.serialize = function(xml) {
  if(typeof XMLSerializer != "undefined") {
    return(new XMLSerializer).serializeToString(xml)
  }
  var text = xml.xml;
  if(text) {
    return text
  }
  throw Error("Your browser does not support serializing XML documents");
};
goog.dom.xml.selectSingleNode = function(node, path) {
  if(typeof node.selectSingleNode != "undefined") {
    var doc = goog.dom.getOwnerDocument(node);
    if(typeof doc.setProperty != "undefined") {
      doc.setProperty("SelectionLanguage", "XPath")
    }
    return node.selectSingleNode(path)
  }else {
    if(document.implementation.hasFeature("XPath", "3.0")) {
      var doc = goog.dom.getOwnerDocument(node);
      var resolver = doc.createNSResolver(doc.documentElement);
      var result = doc.evaluate(path, node, resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      return result.singleNodeValue
    }
  }
  return null
};
goog.dom.xml.selectNodes = function(node, path) {
  if(typeof node.selectNodes != "undefined") {
    var doc = goog.dom.getOwnerDocument(node);
    if(typeof doc.setProperty != "undefined") {
      doc.setProperty("SelectionLanguage", "XPath")
    }
    return node.selectNodes(path)
  }else {
    if(document.implementation.hasFeature("XPath", "3.0")) {
      var doc = goog.dom.getOwnerDocument(node);
      var resolver = doc.createNSResolver(doc.documentElement);
      var nodes = doc.evaluate(path, node, resolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      var results = [];
      var count = nodes.snapshotLength;
      for(var i = 0;i < count;i++) {
        results.push(nodes.snapshotItem(i))
      }
      return results
    }else {
      return[]
    }
  }
};
goog.dom.xml.createMsXmlDocument_ = function() {
  var doc = new ActiveXObject("MSXML2.DOMDocument");
  if(doc) {
    doc.resolveExternals = false;
    doc.validateOnParse = false;
    try {
      doc.setProperty("ProhibitDTD", true);
      doc.setProperty("MaxXMLSize", goog.dom.xml.MAX_XML_SIZE_KB);
      doc.setProperty("MaxElementDepth", goog.dom.xml.MAX_ELEMENT_DEPTH)
    }catch(e) {
    }
  }
  return doc
};
goog.provide("cljs.core");
goog.require("goog.string");
goog.require("goog.string.StringBuffer");
goog.require("goog.object");
goog.require("goog.array");
cljs.core._STAR_print_fn_STAR_ = function _STAR_print_fn_STAR_(_) {
  throw new Error("No *print-fn* fn set for evaluation environment");
};
cljs.core.truth_ = function truth_(x) {
  return x != null && x !== false
};
cljs.core.type_satisfies_ = function type_satisfies_(p, x) {
  var or__3548__auto____7356 = p[goog.typeOf.call(null, x)];
  if(cljs.core.truth_(or__3548__auto____7356)) {
    return or__3548__auto____7356
  }else {
    var or__3548__auto____7358 = p["_"];
    if(cljs.core.truth_(or__3548__auto____7358)) {
      return or__3548__auto____7358
    }else {
      return false
    }
  }
};
cljs.core.is_proto_ = function is_proto_(x) {
  return x.constructor.prototype === x
};
cljs.core._STAR_main_cli_fn_STAR_ = null;
cljs.core.missing_protocol = function missing_protocol(proto, obj) {
  return Error.call(null, "No protocol method " + proto + " defined for type " + goog.typeOf.call(null, obj) + ": " + obj)
};
cljs.core.aclone = function aclone(array_like) {
  return Array.prototype.slice.call(array_like)
};
cljs.core.array = function array(var_args) {
  return Array.prototype.slice.call(arguments)
};
cljs.core.aget = function aget(array, i) {
  return array[i]
};
cljs.core.aset = function aset(array, i, val) {
  return array[i] = val
};
cljs.core.alength = function alength(array) {
  return array.length
};
cljs.core.IFn = {};
cljs.core._invoke = function() {
  var _invoke = null;
  var _invoke__7644 = function(this$) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7399 = this$;
      if(cljs.core.truth_(and__3546__auto____7399)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7399
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$)
    }else {
      return function() {
        var or__3548__auto____7402 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7402)) {
          return or__3548__auto____7402
        }else {
          var or__3548__auto____7404 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7404)) {
            return or__3548__auto____7404
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$)
    }
  };
  var _invoke__7645 = function(this$, a) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7407 = this$;
      if(cljs.core.truth_(and__3546__auto____7407)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7407
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a)
    }else {
      return function() {
        var or__3548__auto____7411 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7411)) {
          return or__3548__auto____7411
        }else {
          var or__3548__auto____7412 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7412)) {
            return or__3548__auto____7412
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a)
    }
  };
  var _invoke__7646 = function(this$, a, b) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7418 = this$;
      if(cljs.core.truth_(and__3546__auto____7418)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7418
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b)
    }else {
      return function() {
        var or__3548__auto____7421 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7421)) {
          return or__3548__auto____7421
        }else {
          var or__3548__auto____7424 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7424)) {
            return or__3548__auto____7424
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b)
    }
  };
  var _invoke__7647 = function(this$, a, b, c) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7427 = this$;
      if(cljs.core.truth_(and__3546__auto____7427)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7427
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c)
    }else {
      return function() {
        var or__3548__auto____7430 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7430)) {
          return or__3548__auto____7430
        }else {
          var or__3548__auto____7431 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7431)) {
            return or__3548__auto____7431
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c)
    }
  };
  var _invoke__7648 = function(this$, a, b, c, d) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7435 = this$;
      if(cljs.core.truth_(and__3546__auto____7435)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7435
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d)
    }else {
      return function() {
        var or__3548__auto____7438 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7438)) {
          return or__3548__auto____7438
        }else {
          var or__3548__auto____7440 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7440)) {
            return or__3548__auto____7440
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d)
    }
  };
  var _invoke__7649 = function(this$, a, b, c, d, e) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7444 = this$;
      if(cljs.core.truth_(and__3546__auto____7444)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7444
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e)
    }else {
      return function() {
        var or__3548__auto____7446 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7446)) {
          return or__3548__auto____7446
        }else {
          var or__3548__auto____7475 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7475)) {
            return or__3548__auto____7475
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e)
    }
  };
  var _invoke__7650 = function(this$, a, b, c, d, e, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7480 = this$;
      if(cljs.core.truth_(and__3546__auto____7480)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7480
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f)
    }else {
      return function() {
        var or__3548__auto____7484 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7484)) {
          return or__3548__auto____7484
        }else {
          var or__3548__auto____7486 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7486)) {
            return or__3548__auto____7486
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f)
    }
  };
  var _invoke__7651 = function(this$, a, b, c, d, e, f, g) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7488 = this$;
      if(cljs.core.truth_(and__3546__auto____7488)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7488
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g)
    }else {
      return function() {
        var or__3548__auto____7490 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7490)) {
          return or__3548__auto____7490
        }else {
          var or__3548__auto____7492 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7492)) {
            return or__3548__auto____7492
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g)
    }
  };
  var _invoke__7652 = function(this$, a, b, c, d, e, f, g, h) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7493 = this$;
      if(cljs.core.truth_(and__3546__auto____7493)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7493
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h)
    }else {
      return function() {
        var or__3548__auto____7518 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7518)) {
          return or__3548__auto____7518
        }else {
          var or__3548__auto____7519 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7519)) {
            return or__3548__auto____7519
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h)
    }
  };
  var _invoke__7653 = function(this$, a, b, c, d, e, f, g, h, i) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7521 = this$;
      if(cljs.core.truth_(and__3546__auto____7521)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7521
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i)
    }else {
      return function() {
        var or__3548__auto____7524 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7524)) {
          return or__3548__auto____7524
        }else {
          var or__3548__auto____7525 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7525)) {
            return or__3548__auto____7525
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i)
    }
  };
  var _invoke__7654 = function(this$, a, b, c, d, e, f, g, h, i, j) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7527 = this$;
      if(cljs.core.truth_(and__3546__auto____7527)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7527
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j)
    }else {
      return function() {
        var or__3548__auto____7530 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7530)) {
          return or__3548__auto____7530
        }else {
          var or__3548__auto____7531 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7531)) {
            return or__3548__auto____7531
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j)
    }
  };
  var _invoke__7655 = function(this$, a, b, c, d, e, f, g, h, i, j, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7535 = this$;
      if(cljs.core.truth_(and__3546__auto____7535)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7535
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k)
    }else {
      return function() {
        var or__3548__auto____7538 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7538)) {
          return or__3548__auto____7538
        }else {
          var or__3548__auto____7540 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7540)) {
            return or__3548__auto____7540
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k)
    }
  };
  var _invoke__7656 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7542 = this$;
      if(cljs.core.truth_(and__3546__auto____7542)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7542
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }else {
      return function() {
        var or__3548__auto____7544 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7544)) {
          return or__3548__auto____7544
        }else {
          var or__3548__auto____7546 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7546)) {
            return or__3548__auto____7546
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l)
    }
  };
  var _invoke__7657 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7548 = this$;
      if(cljs.core.truth_(and__3546__auto____7548)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7548
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }else {
      return function() {
        var or__3548__auto____7550 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7550)) {
          return or__3548__auto____7550
        }else {
          var or__3548__auto____7552 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7552)) {
            return or__3548__auto____7552
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m)
    }
  };
  var _invoke__7658 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7553 = this$;
      if(cljs.core.truth_(and__3546__auto____7553)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7553
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }else {
      return function() {
        var or__3548__auto____7557 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7557)) {
          return or__3548__auto____7557
        }else {
          var or__3548__auto____7559 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7559)) {
            return or__3548__auto____7559
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n)
    }
  };
  var _invoke__7659 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7562 = this$;
      if(cljs.core.truth_(and__3546__auto____7562)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7562
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }else {
      return function() {
        var or__3548__auto____7565 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7565)) {
          return or__3548__auto____7565
        }else {
          var or__3548__auto____7568 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7568)) {
            return or__3548__auto____7568
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o)
    }
  };
  var _invoke__7660 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7571 = this$;
      if(cljs.core.truth_(and__3546__auto____7571)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7571
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }else {
      return function() {
        var or__3548__auto____7574 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7574)) {
          return or__3548__auto____7574
        }else {
          var or__3548__auto____7584 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7584)) {
            return or__3548__auto____7584
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p)
    }
  };
  var _invoke__7661 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7600 = this$;
      if(cljs.core.truth_(and__3546__auto____7600)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7600
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }else {
      return function() {
        var or__3548__auto____7602 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7602)) {
          return or__3548__auto____7602
        }else {
          var or__3548__auto____7604 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7604)) {
            return or__3548__auto____7604
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q)
    }
  };
  var _invoke__7662 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7606 = this$;
      if(cljs.core.truth_(and__3546__auto____7606)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7606
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }else {
      return function() {
        var or__3548__auto____7609 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7609)) {
          return or__3548__auto____7609
        }else {
          var or__3548__auto____7610 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7610)) {
            return or__3548__auto____7610
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s)
    }
  };
  var _invoke__7663 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7613 = this$;
      if(cljs.core.truth_(and__3546__auto____7613)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7613
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }else {
      return function() {
        var or__3548__auto____7614 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7614)) {
          return or__3548__auto____7614
        }else {
          var or__3548__auto____7616 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7616)) {
            return or__3548__auto____7616
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t)
    }
  };
  var _invoke__7664 = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7619 = this$;
      if(cljs.core.truth_(and__3546__auto____7619)) {
        return this$.cljs$core$IFn$_invoke
      }else {
        return and__3546__auto____7619
      }
    }())) {
      return this$.cljs$core$IFn$_invoke(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }else {
      return function() {
        var or__3548__auto____7620 = cljs.core._invoke[goog.typeOf.call(null, this$)];
        if(cljs.core.truth_(or__3548__auto____7620)) {
          return or__3548__auto____7620
        }else {
          var or__3548__auto____7621 = cljs.core._invoke["_"];
          if(cljs.core.truth_(or__3548__auto____7621)) {
            return or__3548__auto____7621
          }else {
            throw cljs.core.missing_protocol.call(null, "IFn.-invoke", this$);
          }
        }
      }().call(null, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
  };
  _invoke = function(this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest) {
    switch(arguments.length) {
      case 1:
        return _invoke__7644.call(this, this$);
      case 2:
        return _invoke__7645.call(this, this$, a);
      case 3:
        return _invoke__7646.call(this, this$, a, b);
      case 4:
        return _invoke__7647.call(this, this$, a, b, c);
      case 5:
        return _invoke__7648.call(this, this$, a, b, c, d);
      case 6:
        return _invoke__7649.call(this, this$, a, b, c, d, e);
      case 7:
        return _invoke__7650.call(this, this$, a, b, c, d, e, f);
      case 8:
        return _invoke__7651.call(this, this$, a, b, c, d, e, f, g);
      case 9:
        return _invoke__7652.call(this, this$, a, b, c, d, e, f, g, h);
      case 10:
        return _invoke__7653.call(this, this$, a, b, c, d, e, f, g, h, i);
      case 11:
        return _invoke__7654.call(this, this$, a, b, c, d, e, f, g, h, i, j);
      case 12:
        return _invoke__7655.call(this, this$, a, b, c, d, e, f, g, h, i, j, k);
      case 13:
        return _invoke__7656.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l);
      case 14:
        return _invoke__7657.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m);
      case 15:
        return _invoke__7658.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n);
      case 16:
        return _invoke__7659.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
      case 17:
        return _invoke__7660.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p);
      case 18:
        return _invoke__7661.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q);
      case 19:
        return _invoke__7662.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s);
      case 20:
        return _invoke__7663.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t);
      case 21:
        return _invoke__7664.call(this, this$, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, s, t, rest)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _invoke
}();
cljs.core.ICounted = {};
cljs.core._count = function _count(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7736 = coll;
    if(cljs.core.truth_(and__3546__auto____7736)) {
      return coll.cljs$core$ICounted$_count
    }else {
      return and__3546__auto____7736
    }
  }())) {
    return coll.cljs$core$ICounted$_count(coll)
  }else {
    return function() {
      var or__3548__auto____7737 = cljs.core._count[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____7737)) {
        return or__3548__auto____7737
      }else {
        var or__3548__auto____7738 = cljs.core._count["_"];
        if(cljs.core.truth_(or__3548__auto____7738)) {
          return or__3548__auto____7738
        }else {
          throw cljs.core.missing_protocol.call(null, "ICounted.-count", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IEmptyableCollection = {};
cljs.core._empty = function _empty(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7739 = coll;
    if(cljs.core.truth_(and__3546__auto____7739)) {
      return coll.cljs$core$IEmptyableCollection$_empty
    }else {
      return and__3546__auto____7739
    }
  }())) {
    return coll.cljs$core$IEmptyableCollection$_empty(coll)
  }else {
    return function() {
      var or__3548__auto____7740 = cljs.core._empty[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____7740)) {
        return or__3548__auto____7740
      }else {
        var or__3548__auto____7741 = cljs.core._empty["_"];
        if(cljs.core.truth_(or__3548__auto____7741)) {
          return or__3548__auto____7741
        }else {
          throw cljs.core.missing_protocol.call(null, "IEmptyableCollection.-empty", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ICollection = {};
cljs.core._conj = function _conj(coll, o) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7743 = coll;
    if(cljs.core.truth_(and__3546__auto____7743)) {
      return coll.cljs$core$ICollection$_conj
    }else {
      return and__3546__auto____7743
    }
  }())) {
    return coll.cljs$core$ICollection$_conj(coll, o)
  }else {
    return function() {
      var or__3548__auto____7746 = cljs.core._conj[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____7746)) {
        return or__3548__auto____7746
      }else {
        var or__3548__auto____7747 = cljs.core._conj["_"];
        if(cljs.core.truth_(or__3548__auto____7747)) {
          return or__3548__auto____7747
        }else {
          throw cljs.core.missing_protocol.call(null, "ICollection.-conj", coll);
        }
      }
    }().call(null, coll, o)
  }
};
cljs.core.IIndexed = {};
cljs.core._nth = function() {
  var _nth = null;
  var _nth__7754 = function(coll, n) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7748 = coll;
      if(cljs.core.truth_(and__3546__auto____7748)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____7748
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n)
    }else {
      return function() {
        var or__3548__auto____7749 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____7749)) {
          return or__3548__auto____7749
        }else {
          var or__3548__auto____7750 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____7750)) {
            return or__3548__auto____7750
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n)
    }
  };
  var _nth__7755 = function(coll, n, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7751 = coll;
      if(cljs.core.truth_(and__3546__auto____7751)) {
        return coll.cljs$core$IIndexed$_nth
      }else {
        return and__3546__auto____7751
      }
    }())) {
      return coll.cljs$core$IIndexed$_nth(coll, n, not_found)
    }else {
      return function() {
        var or__3548__auto____7752 = cljs.core._nth[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____7752)) {
          return or__3548__auto____7752
        }else {
          var or__3548__auto____7753 = cljs.core._nth["_"];
          if(cljs.core.truth_(or__3548__auto____7753)) {
            return or__3548__auto____7753
          }else {
            throw cljs.core.missing_protocol.call(null, "IIndexed.-nth", coll);
          }
        }
      }().call(null, coll, n, not_found)
    }
  };
  _nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return _nth__7754.call(this, coll, n);
      case 3:
        return _nth__7755.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _nth
}();
cljs.core.ISeq = {};
cljs.core._first = function _first(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7784 = coll;
    if(cljs.core.truth_(and__3546__auto____7784)) {
      return coll.cljs$core$ISeq$_first
    }else {
      return and__3546__auto____7784
    }
  }())) {
    return coll.cljs$core$ISeq$_first(coll)
  }else {
    return function() {
      var or__3548__auto____7787 = cljs.core._first[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____7787)) {
        return or__3548__auto____7787
      }else {
        var or__3548__auto____7788 = cljs.core._first["_"];
        if(cljs.core.truth_(or__3548__auto____7788)) {
          return or__3548__auto____7788
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-first", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._rest = function _rest(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7793 = coll;
    if(cljs.core.truth_(and__3546__auto____7793)) {
      return coll.cljs$core$ISeq$_rest
    }else {
      return and__3546__auto____7793
    }
  }())) {
    return coll.cljs$core$ISeq$_rest(coll)
  }else {
    return function() {
      var or__3548__auto____7794 = cljs.core._rest[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____7794)) {
        return or__3548__auto____7794
      }else {
        var or__3548__auto____7795 = cljs.core._rest["_"];
        if(cljs.core.truth_(or__3548__auto____7795)) {
          return or__3548__auto____7795
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeq.-rest", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.ILookup = {};
cljs.core._lookup = function() {
  var _lookup = null;
  var _lookup__7816 = function(o, k) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7803 = o;
      if(cljs.core.truth_(and__3546__auto____7803)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____7803
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k)
    }else {
      return function() {
        var or__3548__auto____7804 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____7804)) {
          return or__3548__auto____7804
        }else {
          var or__3548__auto____7805 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____7805)) {
            return or__3548__auto____7805
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k)
    }
  };
  var _lookup__7817 = function(o, k, not_found) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7807 = o;
      if(cljs.core.truth_(and__3546__auto____7807)) {
        return o.cljs$core$ILookup$_lookup
      }else {
        return and__3546__auto____7807
      }
    }())) {
      return o.cljs$core$ILookup$_lookup(o, k, not_found)
    }else {
      return function() {
        var or__3548__auto____7811 = cljs.core._lookup[goog.typeOf.call(null, o)];
        if(cljs.core.truth_(or__3548__auto____7811)) {
          return or__3548__auto____7811
        }else {
          var or__3548__auto____7812 = cljs.core._lookup["_"];
          if(cljs.core.truth_(or__3548__auto____7812)) {
            return or__3548__auto____7812
          }else {
            throw cljs.core.missing_protocol.call(null, "ILookup.-lookup", o);
          }
        }
      }().call(null, o, k, not_found)
    }
  };
  _lookup = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return _lookup__7816.call(this, o, k);
      case 3:
        return _lookup__7817.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _lookup
}();
cljs.core.IAssociative = {};
cljs.core._contains_key_QMARK_ = function _contains_key_QMARK_(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7828 = coll;
    if(cljs.core.truth_(and__3546__auto____7828)) {
      return coll.cljs$core$IAssociative$_contains_key_QMARK_
    }else {
      return and__3546__auto____7828
    }
  }())) {
    return coll.cljs$core$IAssociative$_contains_key_QMARK_(coll, k)
  }else {
    return function() {
      var or__3548__auto____7830 = cljs.core._contains_key_QMARK_[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____7830)) {
        return or__3548__auto____7830
      }else {
        var or__3548__auto____7832 = cljs.core._contains_key_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____7832)) {
          return or__3548__auto____7832
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-contains-key?", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core._assoc = function _assoc(coll, k, v) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7837 = coll;
    if(cljs.core.truth_(and__3546__auto____7837)) {
      return coll.cljs$core$IAssociative$_assoc
    }else {
      return and__3546__auto____7837
    }
  }())) {
    return coll.cljs$core$IAssociative$_assoc(coll, k, v)
  }else {
    return function() {
      var or__3548__auto____7839 = cljs.core._assoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____7839)) {
        return or__3548__auto____7839
      }else {
        var or__3548__auto____7840 = cljs.core._assoc["_"];
        if(cljs.core.truth_(or__3548__auto____7840)) {
          return or__3548__auto____7840
        }else {
          throw cljs.core.missing_protocol.call(null, "IAssociative.-assoc", coll);
        }
      }
    }().call(null, coll, k, v)
  }
};
cljs.core.IMap = {};
cljs.core._dissoc = function _dissoc(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7847 = coll;
    if(cljs.core.truth_(and__3546__auto____7847)) {
      return coll.cljs$core$IMap$_dissoc
    }else {
      return and__3546__auto____7847
    }
  }())) {
    return coll.cljs$core$IMap$_dissoc(coll, k)
  }else {
    return function() {
      var or__3548__auto____7867 = cljs.core._dissoc[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____7867)) {
        return or__3548__auto____7867
      }else {
        var or__3548__auto____7869 = cljs.core._dissoc["_"];
        if(cljs.core.truth_(or__3548__auto____7869)) {
          return or__3548__auto____7869
        }else {
          throw cljs.core.missing_protocol.call(null, "IMap.-dissoc", coll);
        }
      }
    }().call(null, coll, k)
  }
};
cljs.core.ISet = {};
cljs.core._disjoin = function _disjoin(coll, v) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7875 = coll;
    if(cljs.core.truth_(and__3546__auto____7875)) {
      return coll.cljs$core$ISet$_disjoin
    }else {
      return and__3546__auto____7875
    }
  }())) {
    return coll.cljs$core$ISet$_disjoin(coll, v)
  }else {
    return function() {
      var or__3548__auto____7880 = cljs.core._disjoin[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____7880)) {
        return or__3548__auto____7880
      }else {
        var or__3548__auto____7883 = cljs.core._disjoin["_"];
        if(cljs.core.truth_(or__3548__auto____7883)) {
          return or__3548__auto____7883
        }else {
          throw cljs.core.missing_protocol.call(null, "ISet.-disjoin", coll);
        }
      }
    }().call(null, coll, v)
  }
};
cljs.core.IStack = {};
cljs.core._peek = function _peek(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7895 = coll;
    if(cljs.core.truth_(and__3546__auto____7895)) {
      return coll.cljs$core$IStack$_peek
    }else {
      return and__3546__auto____7895
    }
  }())) {
    return coll.cljs$core$IStack$_peek(coll)
  }else {
    return function() {
      var or__3548__auto____7898 = cljs.core._peek[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____7898)) {
        return or__3548__auto____7898
      }else {
        var or__3548__auto____7899 = cljs.core._peek["_"];
        if(cljs.core.truth_(or__3548__auto____7899)) {
          return or__3548__auto____7899
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-peek", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core._pop = function _pop(coll) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7902 = coll;
    if(cljs.core.truth_(and__3546__auto____7902)) {
      return coll.cljs$core$IStack$_pop
    }else {
      return and__3546__auto____7902
    }
  }())) {
    return coll.cljs$core$IStack$_pop(coll)
  }else {
    return function() {
      var or__3548__auto____7904 = cljs.core._pop[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____7904)) {
        return or__3548__auto____7904
      }else {
        var or__3548__auto____7905 = cljs.core._pop["_"];
        if(cljs.core.truth_(or__3548__auto____7905)) {
          return or__3548__auto____7905
        }else {
          throw cljs.core.missing_protocol.call(null, "IStack.-pop", coll);
        }
      }
    }().call(null, coll)
  }
};
cljs.core.IVector = {};
cljs.core._assoc_n = function _assoc_n(coll, n, val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7915 = coll;
    if(cljs.core.truth_(and__3546__auto____7915)) {
      return coll.cljs$core$IVector$_assoc_n
    }else {
      return and__3546__auto____7915
    }
  }())) {
    return coll.cljs$core$IVector$_assoc_n(coll, n, val)
  }else {
    return function() {
      var or__3548__auto____7916 = cljs.core._assoc_n[goog.typeOf.call(null, coll)];
      if(cljs.core.truth_(or__3548__auto____7916)) {
        return or__3548__auto____7916
      }else {
        var or__3548__auto____7918 = cljs.core._assoc_n["_"];
        if(cljs.core.truth_(or__3548__auto____7918)) {
          return or__3548__auto____7918
        }else {
          throw cljs.core.missing_protocol.call(null, "IVector.-assoc-n", coll);
        }
      }
    }().call(null, coll, n, val)
  }
};
cljs.core.IDeref = {};
cljs.core._deref = function _deref(o) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7925 = o;
    if(cljs.core.truth_(and__3546__auto____7925)) {
      return o.cljs$core$IDeref$_deref
    }else {
      return and__3546__auto____7925
    }
  }())) {
    return o.cljs$core$IDeref$_deref(o)
  }else {
    return function() {
      var or__3548__auto____7927 = cljs.core._deref[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____7927)) {
        return or__3548__auto____7927
      }else {
        var or__3548__auto____7929 = cljs.core._deref["_"];
        if(cljs.core.truth_(or__3548__auto____7929)) {
          return or__3548__auto____7929
        }else {
          throw cljs.core.missing_protocol.call(null, "IDeref.-deref", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.IDerefWithTimeout = {};
cljs.core._deref_with_timeout = function _deref_with_timeout(o, msec, timeout_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7938 = o;
    if(cljs.core.truth_(and__3546__auto____7938)) {
      return o.cljs$core$IDerefWithTimeout$_deref_with_timeout
    }else {
      return and__3546__auto____7938
    }
  }())) {
    return o.cljs$core$IDerefWithTimeout$_deref_with_timeout(o, msec, timeout_val)
  }else {
    return function() {
      var or__3548__auto____7939 = cljs.core._deref_with_timeout[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____7939)) {
        return or__3548__auto____7939
      }else {
        var or__3548__auto____7940 = cljs.core._deref_with_timeout["_"];
        if(cljs.core.truth_(or__3548__auto____7940)) {
          return or__3548__auto____7940
        }else {
          throw cljs.core.missing_protocol.call(null, "IDerefWithTimeout.-deref-with-timeout", o);
        }
      }
    }().call(null, o, msec, timeout_val)
  }
};
cljs.core.IMeta = {};
cljs.core._meta = function _meta(o) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7948 = o;
    if(cljs.core.truth_(and__3546__auto____7948)) {
      return o.cljs$core$IMeta$_meta
    }else {
      return and__3546__auto____7948
    }
  }())) {
    return o.cljs$core$IMeta$_meta(o)
  }else {
    return function() {
      var or__3548__auto____7952 = cljs.core._meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____7952)) {
        return or__3548__auto____7952
      }else {
        var or__3548__auto____7954 = cljs.core._meta["_"];
        if(cljs.core.truth_(or__3548__auto____7954)) {
          return or__3548__auto____7954
        }else {
          throw cljs.core.missing_protocol.call(null, "IMeta.-meta", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.IWithMeta = {};
cljs.core._with_meta = function _with_meta(o, meta) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7959 = o;
    if(cljs.core.truth_(and__3546__auto____7959)) {
      return o.cljs$core$IWithMeta$_with_meta
    }else {
      return and__3546__auto____7959
    }
  }())) {
    return o.cljs$core$IWithMeta$_with_meta(o, meta)
  }else {
    return function() {
      var or__3548__auto____7960 = cljs.core._with_meta[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____7960)) {
        return or__3548__auto____7960
      }else {
        var or__3548__auto____7962 = cljs.core._with_meta["_"];
        if(cljs.core.truth_(or__3548__auto____7962)) {
          return or__3548__auto____7962
        }else {
          throw cljs.core.missing_protocol.call(null, "IWithMeta.-with-meta", o);
        }
      }
    }().call(null, o, meta)
  }
};
cljs.core.IReduce = {};
cljs.core._reduce = function() {
  var _reduce = null;
  var _reduce__7982 = function(coll, f) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7970 = coll;
      if(cljs.core.truth_(and__3546__auto____7970)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____7970
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f)
    }else {
      return function() {
        var or__3548__auto____7976 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____7976)) {
          return or__3548__auto____7976
        }else {
          var or__3548__auto____7977 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____7977)) {
            return or__3548__auto____7977
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f)
    }
  };
  var _reduce__7983 = function(coll, f, start) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____7978 = coll;
      if(cljs.core.truth_(and__3546__auto____7978)) {
        return coll.cljs$core$IReduce$_reduce
      }else {
        return and__3546__auto____7978
      }
    }())) {
      return coll.cljs$core$IReduce$_reduce(coll, f, start)
    }else {
      return function() {
        var or__3548__auto____7979 = cljs.core._reduce[goog.typeOf.call(null, coll)];
        if(cljs.core.truth_(or__3548__auto____7979)) {
          return or__3548__auto____7979
        }else {
          var or__3548__auto____7980 = cljs.core._reduce["_"];
          if(cljs.core.truth_(or__3548__auto____7980)) {
            return or__3548__auto____7980
          }else {
            throw cljs.core.missing_protocol.call(null, "IReduce.-reduce", coll);
          }
        }
      }().call(null, coll, f, start)
    }
  };
  _reduce = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return _reduce__7982.call(this, coll, f);
      case 3:
        return _reduce__7983.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return _reduce
}();
cljs.core.IEquiv = {};
cljs.core._equiv = function _equiv(o, other) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____7995 = o;
    if(cljs.core.truth_(and__3546__auto____7995)) {
      return o.cljs$core$IEquiv$_equiv
    }else {
      return and__3546__auto____7995
    }
  }())) {
    return o.cljs$core$IEquiv$_equiv(o, other)
  }else {
    return function() {
      var or__3548__auto____7997 = cljs.core._equiv[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____7997)) {
        return or__3548__auto____7997
      }else {
        var or__3548__auto____7998 = cljs.core._equiv["_"];
        if(cljs.core.truth_(or__3548__auto____7998)) {
          return or__3548__auto____7998
        }else {
          throw cljs.core.missing_protocol.call(null, "IEquiv.-equiv", o);
        }
      }
    }().call(null, o, other)
  }
};
cljs.core.IHash = {};
cljs.core._hash = function _hash(o) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____8004 = o;
    if(cljs.core.truth_(and__3546__auto____8004)) {
      return o.cljs$core$IHash$_hash
    }else {
      return and__3546__auto____8004
    }
  }())) {
    return o.cljs$core$IHash$_hash(o)
  }else {
    return function() {
      var or__3548__auto____8006 = cljs.core._hash[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____8006)) {
        return or__3548__auto____8006
      }else {
        var or__3548__auto____8007 = cljs.core._hash["_"];
        if(cljs.core.truth_(or__3548__auto____8007)) {
          return or__3548__auto____8007
        }else {
          throw cljs.core.missing_protocol.call(null, "IHash.-hash", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.ISeqable = {};
cljs.core._seq = function _seq(o) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____8034 = o;
    if(cljs.core.truth_(and__3546__auto____8034)) {
      return o.cljs$core$ISeqable$_seq
    }else {
      return and__3546__auto____8034
    }
  }())) {
    return o.cljs$core$ISeqable$_seq(o)
  }else {
    return function() {
      var or__3548__auto____8036 = cljs.core._seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____8036)) {
        return or__3548__auto____8036
      }else {
        var or__3548__auto____8037 = cljs.core._seq["_"];
        if(cljs.core.truth_(or__3548__auto____8037)) {
          return or__3548__auto____8037
        }else {
          throw cljs.core.missing_protocol.call(null, "ISeqable.-seq", o);
        }
      }
    }().call(null, o)
  }
};
cljs.core.ISequential = {};
cljs.core.IRecord = {};
cljs.core.IPrintable = {};
cljs.core._pr_seq = function _pr_seq(o, opts) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____8043 = o;
    if(cljs.core.truth_(and__3546__auto____8043)) {
      return o.cljs$core$IPrintable$_pr_seq
    }else {
      return and__3546__auto____8043
    }
  }())) {
    return o.cljs$core$IPrintable$_pr_seq(o, opts)
  }else {
    return function() {
      var or__3548__auto____8044 = cljs.core._pr_seq[goog.typeOf.call(null, o)];
      if(cljs.core.truth_(or__3548__auto____8044)) {
        return or__3548__auto____8044
      }else {
        var or__3548__auto____8046 = cljs.core._pr_seq["_"];
        if(cljs.core.truth_(or__3548__auto____8046)) {
          return or__3548__auto____8046
        }else {
          throw cljs.core.missing_protocol.call(null, "IPrintable.-pr-seq", o);
        }
      }
    }().call(null, o, opts)
  }
};
cljs.core.IPending = {};
cljs.core._realized_QMARK_ = function _realized_QMARK_(d) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____8049 = d;
    if(cljs.core.truth_(and__3546__auto____8049)) {
      return d.cljs$core$IPending$_realized_QMARK_
    }else {
      return and__3546__auto____8049
    }
  }())) {
    return d.cljs$core$IPending$_realized_QMARK_(d)
  }else {
    return function() {
      var or__3548__auto____8051 = cljs.core._realized_QMARK_[goog.typeOf.call(null, d)];
      if(cljs.core.truth_(or__3548__auto____8051)) {
        return or__3548__auto____8051
      }else {
        var or__3548__auto____8053 = cljs.core._realized_QMARK_["_"];
        if(cljs.core.truth_(or__3548__auto____8053)) {
          return or__3548__auto____8053
        }else {
          throw cljs.core.missing_protocol.call(null, "IPending.-realized?", d);
        }
      }
    }().call(null, d)
  }
};
cljs.core.IWatchable = {};
cljs.core._notify_watches = function _notify_watches(this$, oldval, newval) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____8063 = this$;
    if(cljs.core.truth_(and__3546__auto____8063)) {
      return this$.cljs$core$IWatchable$_notify_watches
    }else {
      return and__3546__auto____8063
    }
  }())) {
    return this$.cljs$core$IWatchable$_notify_watches(this$, oldval, newval)
  }else {
    return function() {
      var or__3548__auto____8065 = cljs.core._notify_watches[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____8065)) {
        return or__3548__auto____8065
      }else {
        var or__3548__auto____8067 = cljs.core._notify_watches["_"];
        if(cljs.core.truth_(or__3548__auto____8067)) {
          return or__3548__auto____8067
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-notify-watches", this$);
        }
      }
    }().call(null, this$, oldval, newval)
  }
};
cljs.core._add_watch = function _add_watch(this$, key, f) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____8069 = this$;
    if(cljs.core.truth_(and__3546__auto____8069)) {
      return this$.cljs$core$IWatchable$_add_watch
    }else {
      return and__3546__auto____8069
    }
  }())) {
    return this$.cljs$core$IWatchable$_add_watch(this$, key, f)
  }else {
    return function() {
      var or__3548__auto____8070 = cljs.core._add_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____8070)) {
        return or__3548__auto____8070
      }else {
        var or__3548__auto____8071 = cljs.core._add_watch["_"];
        if(cljs.core.truth_(or__3548__auto____8071)) {
          return or__3548__auto____8071
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-add-watch", this$);
        }
      }
    }().call(null, this$, key, f)
  }
};
cljs.core._remove_watch = function _remove_watch(this$, key) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____8073 = this$;
    if(cljs.core.truth_(and__3546__auto____8073)) {
      return this$.cljs$core$IWatchable$_remove_watch
    }else {
      return and__3546__auto____8073
    }
  }())) {
    return this$.cljs$core$IWatchable$_remove_watch(this$, key)
  }else {
    return function() {
      var or__3548__auto____8075 = cljs.core._remove_watch[goog.typeOf.call(null, this$)];
      if(cljs.core.truth_(or__3548__auto____8075)) {
        return or__3548__auto____8075
      }else {
        var or__3548__auto____8077 = cljs.core._remove_watch["_"];
        if(cljs.core.truth_(or__3548__auto____8077)) {
          return or__3548__auto____8077
        }else {
          throw cljs.core.missing_protocol.call(null, "IWatchable.-remove-watch", this$);
        }
      }
    }().call(null, this$, key)
  }
};
cljs.core.identical_QMARK_ = function identical_QMARK_(x, y) {
  return x === y
};
cljs.core._EQ_ = function _EQ_(x, y) {
  return cljs.core._equiv.call(null, x, y)
};
cljs.core.nil_QMARK_ = function nil_QMARK_(x) {
  return x === null
};
cljs.core.type = function type(x) {
  return x.constructor
};
Function.prototype.cljs$core$IPrintable$ = true;
Function.prototype.cljs$core$IPrintable$_pr_seq = function(this$) {
  return cljs.core.list.call(null, "#<", cljs.core.str.call(null, this$), ">")
};
cljs.core.IHash["null"] = true;
cljs.core._hash["null"] = function(o) {
  return 0
};
cljs.core.ILookup["null"] = true;
cljs.core._lookup["null"] = function() {
  var G__8221 = null;
  var G__8221__8222 = function(o, k) {
    return null
  };
  var G__8221__8223 = function(o, k, not_found) {
    return not_found
  };
  G__8221 = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8221__8222.call(this, o, k);
      case 3:
        return G__8221__8223.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8221
}();
cljs.core.IAssociative["null"] = true;
cljs.core._assoc["null"] = function(_, k, v) {
  return cljs.core.hash_map.call(null, k, v)
};
cljs.core.ICollection["null"] = true;
cljs.core._conj["null"] = function(_, o) {
  return cljs.core.list.call(null, o)
};
cljs.core.IReduce["null"] = true;
cljs.core._reduce["null"] = function() {
  var G__8226 = null;
  var G__8226__8228 = function(_, f) {
    return f.call(null)
  };
  var G__8226__8229 = function(_, f, start) {
    return start
  };
  G__8226 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__8226__8228.call(this, _, f);
      case 3:
        return G__8226__8229.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8226
}();
cljs.core.IPrintable["null"] = true;
cljs.core._pr_seq["null"] = function(o) {
  return cljs.core.list.call(null, "nil")
};
cljs.core.ISet["null"] = true;
cljs.core._disjoin["null"] = function(_, v) {
  return null
};
cljs.core.ICounted["null"] = true;
cljs.core._count["null"] = function(_) {
  return 0
};
cljs.core.IStack["null"] = true;
cljs.core._peek["null"] = function(_) {
  return null
};
cljs.core._pop["null"] = function(_) {
  return null
};
cljs.core.ISeq["null"] = true;
cljs.core._first["null"] = function(_) {
  return null
};
cljs.core._rest["null"] = function(_) {
  return cljs.core.list.call(null)
};
cljs.core.IEquiv["null"] = true;
cljs.core._equiv["null"] = function(_, o) {
  return cljs.core.nil_QMARK_.call(null, o)
};
cljs.core.IWithMeta["null"] = true;
cljs.core._with_meta["null"] = function(_, meta) {
  return null
};
cljs.core.IMeta["null"] = true;
cljs.core._meta["null"] = function(_) {
  return null
};
cljs.core.IIndexed["null"] = true;
cljs.core._nth["null"] = function() {
  var G__8233 = null;
  var G__8233__8234 = function(_, n) {
    return null
  };
  var G__8233__8235 = function(_, n, not_found) {
    return not_found
  };
  G__8233 = function(_, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8233__8234.call(this, _, n);
      case 3:
        return G__8233__8235.call(this, _, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8233
}();
cljs.core.IEmptyableCollection["null"] = true;
cljs.core._empty["null"] = function(_) {
  return null
};
cljs.core.IMap["null"] = true;
cljs.core._dissoc["null"] = function(_, k) {
  return null
};
Date.prototype.cljs$core$IEquiv$ = true;
Date.prototype.cljs$core$IEquiv$_equiv = function(o, other) {
  return o.toString() === other.toString()
};
cljs.core.IHash["number"] = true;
cljs.core._hash["number"] = function(o) {
  return o
};
cljs.core.IEquiv["number"] = true;
cljs.core._equiv["number"] = function(x, o) {
  return x === o
};
cljs.core.IHash["boolean"] = true;
cljs.core._hash["boolean"] = function(o) {
  return o === true ? 1 : 0
};
cljs.core.IHash["function"] = true;
cljs.core._hash["function"] = function(o) {
  return goog.getUid.call(null, o)
};
cljs.core.inc = function inc(x) {
  return x + 1
};
cljs.core.ci_reduce = function() {
  var ci_reduce = null;
  var ci_reduce__8268 = function(cicoll, f) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core._count.call(null, cicoll)))) {
      return f.call(null)
    }else {
      var val__8258 = cljs.core._nth.call(null, cicoll, 0);
      var n__8259 = 1;
      while(true) {
        if(cljs.core.truth_(n__8259 < cljs.core._count.call(null, cicoll))) {
          var G__8276 = f.call(null, val__8258, cljs.core._nth.call(null, cicoll, n__8259));
          var G__8277 = n__8259 + 1;
          val__8258 = G__8276;
          n__8259 = G__8277;
          continue
        }else {
          return val__8258
        }
        break
      }
    }
  };
  var ci_reduce__8269 = function(cicoll, f, val) {
    var val__8260 = val;
    var n__8261 = 0;
    while(true) {
      if(cljs.core.truth_(n__8261 < cljs.core._count.call(null, cicoll))) {
        var G__8282 = f.call(null, val__8260, cljs.core._nth.call(null, cicoll, n__8261));
        var G__8283 = n__8261 + 1;
        val__8260 = G__8282;
        n__8261 = G__8283;
        continue
      }else {
        return val__8260
      }
      break
    }
  };
  var ci_reduce__8270 = function(cicoll, f, val, idx) {
    var val__8266 = val;
    var n__8267 = idx;
    while(true) {
      if(cljs.core.truth_(n__8267 < cljs.core._count.call(null, cicoll))) {
        var G__8284 = f.call(null, val__8266, cljs.core._nth.call(null, cicoll, n__8267));
        var G__8285 = n__8267 + 1;
        val__8266 = G__8284;
        n__8267 = G__8285;
        continue
      }else {
        return val__8266
      }
      break
    }
  };
  ci_reduce = function(cicoll, f, val, idx) {
    switch(arguments.length) {
      case 2:
        return ci_reduce__8268.call(this, cicoll, f);
      case 3:
        return ci_reduce__8269.call(this, cicoll, f, val);
      case 4:
        return ci_reduce__8270.call(this, cicoll, f, val, idx)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return ci_reduce
}();
cljs.core.IndexedSeq = function(a, i) {
  this.a = a;
  this.i = i
};
cljs.core.IndexedSeq.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.IndexedSeq")
};
cljs.core.IndexedSeq.prototype.cljs$core$IHash$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__8317 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IReduce$_reduce = function() {
  var G__8410 = null;
  var G__8410__8411 = function(_, f) {
    var this__8319 = this;
    return cljs.core.ci_reduce.call(null, this__8319.a, f, this__8319.a[this__8319.i], this__8319.i + 1)
  };
  var G__8410__8412 = function(_, f, start) {
    var this__8321 = this;
    return cljs.core.ci_reduce.call(null, this__8321.a, f, start, this__8321.i)
  };
  G__8410 = function(_, f, start) {
    switch(arguments.length) {
      case 2:
        return G__8410__8411.call(this, _, f);
      case 3:
        return G__8410__8412.call(this, _, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8410
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__8327 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__8330 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.IndexedSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IIndexed$_nth = function() {
  var G__8414 = null;
  var G__8414__8415 = function(coll, n) {
    var this__8334 = this;
    var i__8335 = n + this__8334.i;
    if(cljs.core.truth_(i__8335 < this__8334.a.length)) {
      return this__8334.a[i__8335]
    }else {
      return null
    }
  };
  var G__8414__8416 = function(coll, n, not_found) {
    var this__8339 = this;
    var i__8342 = n + this__8339.i;
    if(cljs.core.truth_(i__8342 < this__8339.a.length)) {
      return this__8339.a[i__8342]
    }else {
      return not_found
    }
  };
  G__8414 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8414__8415.call(this, coll, n);
      case 3:
        return G__8414__8416.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8414
}();
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ICounted$_count = function(_) {
  var this__8345 = this;
  return this__8345.a.length - this__8345.i
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_first = function(_) {
  var this__8346 = this;
  return this__8346.a[this__8346.i]
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeq$_rest = function(_) {
  var this__8348 = this;
  if(cljs.core.truth_(this__8348.i + 1 < this__8348.a.length)) {
    return new cljs.core.IndexedSeq(this__8348.a, this__8348.i + 1)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$ISeqable$_seq = function(this$) {
  var this__8409 = this;
  return this$
};
cljs.core.IndexedSeq;
cljs.core.prim_seq = function prim_seq(prim, i) {
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, prim.length))) {
    return null
  }else {
    return new cljs.core.IndexedSeq(prim, i)
  }
};
cljs.core.array_seq = function array_seq(array, i) {
  return cljs.core.prim_seq.call(null, array, i)
};
cljs.core.IReduce["array"] = true;
cljs.core._reduce["array"] = function() {
  var G__8450 = null;
  var G__8450__8453 = function(array, f) {
    return cljs.core.ci_reduce.call(null, array, f)
  };
  var G__8450__8454 = function(array, f, start) {
    return cljs.core.ci_reduce.call(null, array, f, start)
  };
  G__8450 = function(array, f, start) {
    switch(arguments.length) {
      case 2:
        return G__8450__8453.call(this, array, f);
      case 3:
        return G__8450__8454.call(this, array, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8450
}();
cljs.core.ILookup["array"] = true;
cljs.core._lookup["array"] = function() {
  var G__8458 = null;
  var G__8458__8459 = function(array, k) {
    return array[k]
  };
  var G__8458__8460 = function(array, k, not_found) {
    return cljs.core._nth.call(null, array, k, not_found)
  };
  G__8458 = function(array, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8458__8459.call(this, array, k);
      case 3:
        return G__8458__8460.call(this, array, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8458
}();
cljs.core.IIndexed["array"] = true;
cljs.core._nth["array"] = function() {
  var G__8465 = null;
  var G__8465__8466 = function(array, n) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return null
    }
  };
  var G__8465__8467 = function(array, n, not_found) {
    if(cljs.core.truth_(n < array.length)) {
      return array[n]
    }else {
      return not_found
    }
  };
  G__8465 = function(array, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__8465__8466.call(this, array, n);
      case 3:
        return G__8465__8467.call(this, array, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__8465
}();
cljs.core.ICounted["array"] = true;
cljs.core._count["array"] = function(a) {
  return a.length
};
cljs.core.ISeqable["array"] = true;
cljs.core._seq["array"] = function(array) {
  return cljs.core.array_seq.call(null, array, 0)
};
cljs.core.seq = function seq(coll) {
  if(cljs.core.truth_(coll)) {
    return cljs.core._seq.call(null, coll)
  }else {
    return null
  }
};
cljs.core.first = function first(coll) {
  var temp__3698__auto____8482 = cljs.core.seq.call(null, coll);
  if(cljs.core.truth_(temp__3698__auto____8482)) {
    var s__8486 = temp__3698__auto____8482;
    return cljs.core._first.call(null, s__8486)
  }else {
    return null
  }
};
cljs.core.rest = function rest(coll) {
  return cljs.core._rest.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.next = function next(coll) {
  if(cljs.core.truth_(coll)) {
    return cljs.core.seq.call(null, cljs.core.rest.call(null, coll))
  }else {
    return null
  }
};
cljs.core.second = function second(coll) {
  return cljs.core.first.call(null, cljs.core.next.call(null, coll))
};
cljs.core.ffirst = function ffirst(coll) {
  return cljs.core.first.call(null, cljs.core.first.call(null, coll))
};
cljs.core.nfirst = function nfirst(coll) {
  return cljs.core.next.call(null, cljs.core.first.call(null, coll))
};
cljs.core.fnext = function fnext(coll) {
  return cljs.core.first.call(null, cljs.core.next.call(null, coll))
};
cljs.core.nnext = function nnext(coll) {
  return cljs.core.next.call(null, cljs.core.next.call(null, coll))
};
cljs.core.last = function last(s) {
  while(true) {
    if(cljs.core.truth_(cljs.core.next.call(null, s))) {
      var G__8519 = cljs.core.next.call(null, s);
      s = G__8519;
      continue
    }else {
      return cljs.core.first.call(null, s)
    }
    break
  }
};
cljs.core.ICounted["_"] = true;
cljs.core._count["_"] = function(x) {
  var s__8526 = cljs.core.seq.call(null, x);
  var n__8527 = 0;
  while(true) {
    if(cljs.core.truth_(s__8526)) {
      var G__8532 = cljs.core.next.call(null, s__8526);
      var G__8533 = n__8527 + 1;
      s__8526 = G__8532;
      n__8527 = G__8533;
      continue
    }else {
      return n__8527
    }
    break
  }
};
cljs.core.IEquiv["_"] = true;
cljs.core._equiv["_"] = function(x, o) {
  return x === o
};
cljs.core.not = function not(x) {
  if(cljs.core.truth_(x)) {
    return false
  }else {
    return true
  }
};
cljs.core.conj = function() {
  var conj = null;
  var conj__8545 = function(coll, x) {
    return cljs.core._conj.call(null, coll, x)
  };
  var conj__8546 = function() {
    var G__8549__delegate = function(coll, x, xs) {
      while(true) {
        if(cljs.core.truth_(xs)) {
          var G__8550 = conj.call(null, coll, x);
          var G__8551 = cljs.core.first.call(null, xs);
          var G__8552 = cljs.core.next.call(null, xs);
          coll = G__8550;
          x = G__8551;
          xs = G__8552;
          continue
        }else {
          return conj.call(null, coll, x)
        }
        break
      }
    };
    var G__8549 = function(coll, x, var_args) {
      var xs = null;
      if(goog.isDef(var_args)) {
        xs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__8549__delegate.call(this, coll, x, xs)
    };
    G__8549.cljs$lang$maxFixedArity = 2;
    G__8549.cljs$lang$applyTo = function(arglist__8555) {
      var coll = cljs.core.first(arglist__8555);
      var x = cljs.core.first(cljs.core.next(arglist__8555));
      var xs = cljs.core.rest(cljs.core.next(arglist__8555));
      return G__8549__delegate.call(this, coll, x, xs)
    };
    return G__8549
  }();
  conj = function(coll, x, var_args) {
    var xs = var_args;
    switch(arguments.length) {
      case 2:
        return conj__8545.call(this, coll, x);
      default:
        return conj__8546.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  conj.cljs$lang$maxFixedArity = 2;
  conj.cljs$lang$applyTo = conj__8546.cljs$lang$applyTo;
  return conj
}();
cljs.core.empty = function empty(coll) {
  return cljs.core._empty.call(null, coll)
};
cljs.core.count = function count(coll) {
  return cljs.core._count.call(null, coll)
};
cljs.core.nth = function() {
  var nth = null;
  var nth__8575 = function(coll, n) {
    return cljs.core._nth.call(null, coll, Math.floor(n))
  };
  var nth__8576 = function(coll, n, not_found) {
    return cljs.core._nth.call(null, coll, Math.floor(n), not_found)
  };
  nth = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return nth__8575.call(this, coll, n);
      case 3:
        return nth__8576.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return nth
}();
cljs.core.get = function() {
  var get = null;
  var get__8583 = function(o, k) {
    return cljs.core._lookup.call(null, o, k)
  };
  var get__8584 = function(o, k, not_found) {
    return cljs.core._lookup.call(null, o, k, not_found)
  };
  get = function(o, k, not_found) {
    switch(arguments.length) {
      case 2:
        return get__8583.call(this, o, k);
      case 3:
        return get__8584.call(this, o, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get
}();
cljs.core.assoc = function() {
  var assoc = null;
  var assoc__8587 = function(coll, k, v) {
    return cljs.core._assoc.call(null, coll, k, v)
  };
  var assoc__8588 = function() {
    var G__8590__delegate = function(coll, k, v, kvs) {
      while(true) {
        var ret__8586 = assoc.call(null, coll, k, v);
        if(cljs.core.truth_(kvs)) {
          var G__8591 = ret__8586;
          var G__8592 = cljs.core.first.call(null, kvs);
          var G__8593 = cljs.core.second.call(null, kvs);
          var G__8594 = cljs.core.nnext.call(null, kvs);
          coll = G__8591;
          k = G__8592;
          v = G__8593;
          kvs = G__8594;
          continue
        }else {
          return ret__8586
        }
        break
      }
    };
    var G__8590 = function(coll, k, v, var_args) {
      var kvs = null;
      if(goog.isDef(var_args)) {
        kvs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__8590__delegate.call(this, coll, k, v, kvs)
    };
    G__8590.cljs$lang$maxFixedArity = 3;
    G__8590.cljs$lang$applyTo = function(arglist__8596) {
      var coll = cljs.core.first(arglist__8596);
      var k = cljs.core.first(cljs.core.next(arglist__8596));
      var v = cljs.core.first(cljs.core.next(cljs.core.next(arglist__8596)));
      var kvs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__8596)));
      return G__8590__delegate.call(this, coll, k, v, kvs)
    };
    return G__8590
  }();
  assoc = function(coll, k, v, var_args) {
    var kvs = var_args;
    switch(arguments.length) {
      case 3:
        return assoc__8587.call(this, coll, k, v);
      default:
        return assoc__8588.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  assoc.cljs$lang$maxFixedArity = 3;
  assoc.cljs$lang$applyTo = assoc__8588.cljs$lang$applyTo;
  return assoc
}();
cljs.core.dissoc = function() {
  var dissoc = null;
  var dissoc__8702 = function(coll) {
    return coll
  };
  var dissoc__8703 = function(coll, k) {
    return cljs.core._dissoc.call(null, coll, k)
  };
  var dissoc__8704 = function() {
    var G__8707__delegate = function(coll, k, ks) {
      while(true) {
        var ret__8599 = dissoc.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__8708 = ret__8599;
          var G__8709 = cljs.core.first.call(null, ks);
          var G__8710 = cljs.core.next.call(null, ks);
          coll = G__8708;
          k = G__8709;
          ks = G__8710;
          continue
        }else {
          return ret__8599
        }
        break
      }
    };
    var G__8707 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__8707__delegate.call(this, coll, k, ks)
    };
    G__8707.cljs$lang$maxFixedArity = 2;
    G__8707.cljs$lang$applyTo = function(arglist__8715) {
      var coll = cljs.core.first(arglist__8715);
      var k = cljs.core.first(cljs.core.next(arglist__8715));
      var ks = cljs.core.rest(cljs.core.next(arglist__8715));
      return G__8707__delegate.call(this, coll, k, ks)
    };
    return G__8707
  }();
  dissoc = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return dissoc__8702.call(this, coll);
      case 2:
        return dissoc__8703.call(this, coll, k);
      default:
        return dissoc__8704.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  dissoc.cljs$lang$maxFixedArity = 2;
  dissoc.cljs$lang$applyTo = dissoc__8704.cljs$lang$applyTo;
  return dissoc
}();
cljs.core.with_meta = function with_meta(o, meta) {
  return cljs.core._with_meta.call(null, o, meta)
};
cljs.core.meta = function meta(o) {
  if(cljs.core.truth_(function() {
    var x__445__auto____8721 = o;
    if(cljs.core.truth_(function() {
      var and__3546__auto____8723 = x__445__auto____8721;
      if(cljs.core.truth_(and__3546__auto____8723)) {
        var and__3546__auto____8724 = x__445__auto____8721.cljs$core$IMeta$;
        if(cljs.core.truth_(and__3546__auto____8724)) {
          return cljs.core.not.call(null, x__445__auto____8721.hasOwnProperty("cljs$core$IMeta$"))
        }else {
          return and__3546__auto____8724
        }
      }else {
        return and__3546__auto____8723
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__445__auto____8721)
    }
  }())) {
    return cljs.core._meta.call(null, o)
  }else {
    return null
  }
};
cljs.core.peek = function peek(coll) {
  return cljs.core._peek.call(null, coll)
};
cljs.core.pop = function pop(coll) {
  return cljs.core._pop.call(null, coll)
};
cljs.core.disj = function() {
  var disj = null;
  var disj__8746 = function(coll) {
    return coll
  };
  var disj__8747 = function(coll, k) {
    return cljs.core._disjoin.call(null, coll, k)
  };
  var disj__8748 = function() {
    var G__8751__delegate = function(coll, k, ks) {
      while(true) {
        var ret__8742 = disj.call(null, coll, k);
        if(cljs.core.truth_(ks)) {
          var G__8755 = ret__8742;
          var G__8756 = cljs.core.first.call(null, ks);
          var G__8757 = cljs.core.next.call(null, ks);
          coll = G__8755;
          k = G__8756;
          ks = G__8757;
          continue
        }else {
          return ret__8742
        }
        break
      }
    };
    var G__8751 = function(coll, k, var_args) {
      var ks = null;
      if(goog.isDef(var_args)) {
        ks = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__8751__delegate.call(this, coll, k, ks)
    };
    G__8751.cljs$lang$maxFixedArity = 2;
    G__8751.cljs$lang$applyTo = function(arglist__8767) {
      var coll = cljs.core.first(arglist__8767);
      var k = cljs.core.first(cljs.core.next(arglist__8767));
      var ks = cljs.core.rest(cljs.core.next(arglist__8767));
      return G__8751__delegate.call(this, coll, k, ks)
    };
    return G__8751
  }();
  disj = function(coll, k, var_args) {
    var ks = var_args;
    switch(arguments.length) {
      case 1:
        return disj__8746.call(this, coll);
      case 2:
        return disj__8747.call(this, coll, k);
      default:
        return disj__8748.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  disj.cljs$lang$maxFixedArity = 2;
  disj.cljs$lang$applyTo = disj__8748.cljs$lang$applyTo;
  return disj
}();
cljs.core.hash = function hash(o) {
  return cljs.core._hash.call(null, o)
};
cljs.core.empty_QMARK_ = function empty_QMARK_(coll) {
  return cljs.core.not.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.coll_QMARK_ = function coll_QMARK_(x) {
  if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, x))) {
    return false
  }else {
    var x__445__auto____8777 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____8781 = x__445__auto____8777;
      if(cljs.core.truth_(and__3546__auto____8781)) {
        var and__3546__auto____8784 = x__445__auto____8777.cljs$core$ICollection$;
        if(cljs.core.truth_(and__3546__auto____8784)) {
          return cljs.core.not.call(null, x__445__auto____8777.hasOwnProperty("cljs$core$ICollection$"))
        }else {
          return and__3546__auto____8784
        }
      }else {
        return and__3546__auto____8781
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ICollection, x__445__auto____8777)
    }
  }
};
cljs.core.set_QMARK_ = function set_QMARK_(x) {
  if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, x))) {
    return false
  }else {
    var x__445__auto____8807 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____8809 = x__445__auto____8807;
      if(cljs.core.truth_(and__3546__auto____8809)) {
        var and__3546__auto____8810 = x__445__auto____8807.cljs$core$ISet$;
        if(cljs.core.truth_(and__3546__auto____8810)) {
          return cljs.core.not.call(null, x__445__auto____8807.hasOwnProperty("cljs$core$ISet$"))
        }else {
          return and__3546__auto____8810
        }
      }else {
        return and__3546__auto____8809
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISet, x__445__auto____8807)
    }
  }
};
cljs.core.associative_QMARK_ = function associative_QMARK_(x) {
  var x__445__auto____8824 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____8825 = x__445__auto____8824;
    if(cljs.core.truth_(and__3546__auto____8825)) {
      var and__3546__auto____8826 = x__445__auto____8824.cljs$core$IAssociative$;
      if(cljs.core.truth_(and__3546__auto____8826)) {
        return cljs.core.not.call(null, x__445__auto____8824.hasOwnProperty("cljs$core$IAssociative$"))
      }else {
        return and__3546__auto____8826
      }
    }else {
      return and__3546__auto____8825
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IAssociative, x__445__auto____8824)
  }
};
cljs.core.sequential_QMARK_ = function sequential_QMARK_(x) {
  var x__445__auto____8838 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____8843 = x__445__auto____8838;
    if(cljs.core.truth_(and__3546__auto____8843)) {
      var and__3546__auto____8844 = x__445__auto____8838.cljs$core$ISequential$;
      if(cljs.core.truth_(and__3546__auto____8844)) {
        return cljs.core.not.call(null, x__445__auto____8838.hasOwnProperty("cljs$core$ISequential$"))
      }else {
        return and__3546__auto____8844
      }
    }else {
      return and__3546__auto____8843
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ISequential, x__445__auto____8838)
  }
};
cljs.core.counted_QMARK_ = function counted_QMARK_(x) {
  var x__445__auto____8855 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____8856 = x__445__auto____8855;
    if(cljs.core.truth_(and__3546__auto____8856)) {
      var and__3546__auto____8858 = x__445__auto____8855.cljs$core$ICounted$;
      if(cljs.core.truth_(and__3546__auto____8858)) {
        return cljs.core.not.call(null, x__445__auto____8855.hasOwnProperty("cljs$core$ICounted$"))
      }else {
        return and__3546__auto____8858
      }
    }else {
      return and__3546__auto____8856
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.ICounted, x__445__auto____8855)
  }
};
cljs.core.map_QMARK_ = function map_QMARK_(x) {
  if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, x))) {
    return false
  }else {
    var x__445__auto____8862 = x;
    if(cljs.core.truth_(function() {
      var and__3546__auto____8881 = x__445__auto____8862;
      if(cljs.core.truth_(and__3546__auto____8881)) {
        var and__3546__auto____8882 = x__445__auto____8862.cljs$core$IMap$;
        if(cljs.core.truth_(and__3546__auto____8882)) {
          return cljs.core.not.call(null, x__445__auto____8862.hasOwnProperty("cljs$core$IMap$"))
        }else {
          return and__3546__auto____8882
        }
      }else {
        return and__3546__auto____8881
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.IMap, x__445__auto____8862)
    }
  }
};
cljs.core.vector_QMARK_ = function vector_QMARK_(x) {
  var x__445__auto____8886 = x;
  if(cljs.core.truth_(function() {
    var and__3546__auto____8887 = x__445__auto____8886;
    if(cljs.core.truth_(and__3546__auto____8887)) {
      var and__3546__auto____8889 = x__445__auto____8886.cljs$core$IVector$;
      if(cljs.core.truth_(and__3546__auto____8889)) {
        return cljs.core.not.call(null, x__445__auto____8886.hasOwnProperty("cljs$core$IVector$"))
      }else {
        return and__3546__auto____8889
      }
    }else {
      return and__3546__auto____8887
    }
  }())) {
    return true
  }else {
    return cljs.core.type_satisfies_.call(null, cljs.core.IVector, x__445__auto____8886)
  }
};
cljs.core.js_obj = function js_obj() {
  return{}
};
cljs.core.js_keys = function js_keys(obj) {
  var keys__8898 = cljs.core.array.call(null);
  goog.object.forEach.call(null, obj, function(val, key, obj) {
    return keys__8898.push(key)
  });
  return keys__8898
};
cljs.core.js_delete = function js_delete(obj, key) {
  return delete obj[key]
};
cljs.core.lookup_sentinel = cljs.core.js_obj.call(null);
cljs.core.false_QMARK_ = function false_QMARK_(x) {
  return x === false
};
cljs.core.true_QMARK_ = function true_QMARK_(x) {
  return x === true
};
cljs.core.undefined_QMARK_ = function undefined_QMARK_(x) {
  return void 0 === x
};
cljs.core.instance_QMARK_ = function instance_QMARK_(t, o) {
  return o != null && (o instanceof t || o.constructor === t || t === Object)
};
cljs.core.seq_QMARK_ = function seq_QMARK_(s) {
  if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, s))) {
    return false
  }else {
    var x__445__auto____8935 = s;
    if(cljs.core.truth_(function() {
      var and__3546__auto____8936 = x__445__auto____8935;
      if(cljs.core.truth_(and__3546__auto____8936)) {
        var and__3546__auto____8937 = x__445__auto____8935.cljs$core$ISeq$;
        if(cljs.core.truth_(and__3546__auto____8937)) {
          return cljs.core.not.call(null, x__445__auto____8935.hasOwnProperty("cljs$core$ISeq$"))
        }else {
          return and__3546__auto____8937
        }
      }else {
        return and__3546__auto____8936
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeq, x__445__auto____8935)
    }
  }
};
cljs.core.boolean$ = function boolean$(x) {
  if(cljs.core.truth_(x)) {
    return true
  }else {
    return false
  }
};
cljs.core.string_QMARK_ = function string_QMARK_(x) {
  var and__3546__auto____8949 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____8949)) {
    return cljs.core.not.call(null, function() {
      var or__3548__auto____8951 = cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0");
      if(cljs.core.truth_(or__3548__auto____8951)) {
        return or__3548__auto____8951
      }else {
        return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
      }
    }())
  }else {
    return and__3546__auto____8949
  }
};
cljs.core.keyword_QMARK_ = function keyword_QMARK_(x) {
  var and__3546__auto____8954 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____8954)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd0")
  }else {
    return and__3546__auto____8954
  }
};
cljs.core.symbol_QMARK_ = function symbol_QMARK_(x) {
  var and__3546__auto____8959 = goog.isString.call(null, x);
  if(cljs.core.truth_(and__3546__auto____8959)) {
    return cljs.core._EQ_.call(null, x.charAt(0), "\ufdd1")
  }else {
    return and__3546__auto____8959
  }
};
cljs.core.number_QMARK_ = function number_QMARK_(n) {
  return goog.isNumber.call(null, n)
};
cljs.core.fn_QMARK_ = function fn_QMARK_(f) {
  return goog.isFunction.call(null, f)
};
cljs.core.integer_QMARK_ = function integer_QMARK_(n) {
  var and__3546__auto____8970 = cljs.core.number_QMARK_.call(null, n);
  if(cljs.core.truth_(and__3546__auto____8970)) {
    return n == n.toFixed()
  }else {
    return and__3546__auto____8970
  }
};
cljs.core.contains_QMARK_ = function contains_QMARK_(coll, v) {
  if(cljs.core.truth_(cljs.core._lookup.call(null, coll, v, cljs.core.lookup_sentinel) === cljs.core.lookup_sentinel)) {
    return false
  }else {
    return true
  }
};
cljs.core.find = function find(coll, k) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____8974 = coll;
    if(cljs.core.truth_(and__3546__auto____8974)) {
      var and__3546__auto____8976 = cljs.core.associative_QMARK_.call(null, coll);
      if(cljs.core.truth_(and__3546__auto____8976)) {
        return cljs.core.contains_QMARK_.call(null, coll, k)
      }else {
        return and__3546__auto____8976
      }
    }else {
      return and__3546__auto____8974
    }
  }())) {
    return cljs.core.Vector.fromArray([k, cljs.core._lookup.call(null, coll, k)])
  }else {
    return null
  }
};
cljs.core.distinct_QMARK_ = function() {
  var distinct_QMARK_ = null;
  var distinct_QMARK___8992 = function(x) {
    return true
  };
  var distinct_QMARK___8993 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var distinct_QMARK___8995 = function() {
    var G__8998__delegate = function(x, y, more) {
      if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y)))) {
        var s__8986 = cljs.core.set([y, x]);
        var xs__8987 = more;
        while(true) {
          var x__8988 = cljs.core.first.call(null, xs__8987);
          var etc__8989 = cljs.core.next.call(null, xs__8987);
          if(cljs.core.truth_(xs__8987)) {
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, s__8986, x__8988))) {
              return false
            }else {
              var G__9001 = cljs.core.conj.call(null, s__8986, x__8988);
              var G__9003 = etc__8989;
              s__8986 = G__9001;
              xs__8987 = G__9003;
              continue
            }
          }else {
            return true
          }
          break
        }
      }else {
        return false
      }
    };
    var G__8998 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__8998__delegate.call(this, x, y, more)
    };
    G__8998.cljs$lang$maxFixedArity = 2;
    G__8998.cljs$lang$applyTo = function(arglist__9004) {
      var x = cljs.core.first(arglist__9004);
      var y = cljs.core.first(cljs.core.next(arglist__9004));
      var more = cljs.core.rest(cljs.core.next(arglist__9004));
      return G__8998__delegate.call(this, x, y, more)
    };
    return G__8998
  }();
  distinct_QMARK_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return distinct_QMARK___8992.call(this, x);
      case 2:
        return distinct_QMARK___8993.call(this, x, y);
      default:
        return distinct_QMARK___8995.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  distinct_QMARK_.cljs$lang$maxFixedArity = 2;
  distinct_QMARK_.cljs$lang$applyTo = distinct_QMARK___8995.cljs$lang$applyTo;
  return distinct_QMARK_
}();
cljs.core.compare = function compare(x, y) {
  return goog.array.defaultCompare.call(null, x, y)
};
cljs.core.fn__GT_comparator = function fn__GT_comparator(f) {
  if(cljs.core.truth_(cljs.core._EQ_.call(null, f, cljs.core.compare))) {
    return cljs.core.compare
  }else {
    return function(x, y) {
      var r__9051 = f.call(null, x, y);
      if(cljs.core.truth_(cljs.core.number_QMARK_.call(null, r__9051))) {
        return r__9051
      }else {
        if(cljs.core.truth_(r__9051)) {
          return-1
        }else {
          if(cljs.core.truth_(f.call(null, y, x))) {
            return 1
          }else {
            return 0
          }
        }
      }
    }
  }
};
cljs.core.sort = function() {
  var sort = null;
  var sort__9073 = function(coll) {
    return sort.call(null, cljs.core.compare, coll)
  };
  var sort__9074 = function(comp, coll) {
    if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
      var a__9068 = cljs.core.to_array.call(null, coll);
      goog.array.stableSort.call(null, a__9068, cljs.core.fn__GT_comparator.call(null, comp));
      return cljs.core.seq.call(null, a__9068)
    }else {
      return cljs.core.List.EMPTY
    }
  };
  sort = function(comp, coll) {
    switch(arguments.length) {
      case 1:
        return sort__9073.call(this, comp);
      case 2:
        return sort__9074.call(this, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort
}();
cljs.core.sort_by = function() {
  var sort_by = null;
  var sort_by__9084 = function(keyfn, coll) {
    return sort_by.call(null, keyfn, cljs.core.compare, coll)
  };
  var sort_by__9085 = function(keyfn, comp, coll) {
    return cljs.core.sort.call(null, function(x, y) {
      return cljs.core.fn__GT_comparator.call(null, comp).call(null, keyfn.call(null, x), keyfn.call(null, y))
    }, coll)
  };
  sort_by = function(keyfn, comp, coll) {
    switch(arguments.length) {
      case 2:
        return sort_by__9084.call(this, keyfn, comp);
      case 3:
        return sort_by__9085.call(this, keyfn, comp, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sort_by
}();
cljs.core.reduce = function() {
  var reduce = null;
  var reduce__9102 = function(f, coll) {
    return cljs.core._reduce.call(null, coll, f)
  };
  var reduce__9103 = function(f, val, coll) {
    return cljs.core._reduce.call(null, coll, f, val)
  };
  reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return reduce__9102.call(this, f, val);
      case 3:
        return reduce__9103.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reduce
}();
cljs.core.seq_reduce = function() {
  var seq_reduce = null;
  var seq_reduce__9115 = function(f, coll) {
    var temp__3695__auto____9111 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3695__auto____9111)) {
      var s__9112 = temp__3695__auto____9111;
      return cljs.core.reduce.call(null, f, cljs.core.first.call(null, s__9112), cljs.core.next.call(null, s__9112))
    }else {
      return f.call(null)
    }
  };
  var seq_reduce__9116 = function(f, val, coll) {
    var val__9113 = val;
    var coll__9114 = cljs.core.seq.call(null, coll);
    while(true) {
      if(cljs.core.truth_(coll__9114)) {
        var G__9118 = f.call(null, val__9113, cljs.core.first.call(null, coll__9114));
        var G__9119 = cljs.core.next.call(null, coll__9114);
        val__9113 = G__9118;
        coll__9114 = G__9119;
        continue
      }else {
        return val__9113
      }
      break
    }
  };
  seq_reduce = function(f, val, coll) {
    switch(arguments.length) {
      case 2:
        return seq_reduce__9115.call(this, f, val);
      case 3:
        return seq_reduce__9116.call(this, f, val, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return seq_reduce
}();
cljs.core.IReduce["_"] = true;
cljs.core._reduce["_"] = function() {
  var G__9124 = null;
  var G__9124__9126 = function(coll, f) {
    return cljs.core.seq_reduce.call(null, f, coll)
  };
  var G__9124__9127 = function(coll, f, start) {
    return cljs.core.seq_reduce.call(null, f, start, coll)
  };
  G__9124 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__9124__9126.call(this, coll, f);
      case 3:
        return G__9124__9127.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9124
}();
cljs.core._PLUS_ = function() {
  var _PLUS_ = null;
  var _PLUS___9138 = function() {
    return 0
  };
  var _PLUS___9139 = function(x) {
    return x
  };
  var _PLUS___9140 = function(x, y) {
    return x + y
  };
  var _PLUS___9141 = function() {
    var G__9143__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _PLUS_, x + y, more)
    };
    var G__9143 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9143__delegate.call(this, x, y, more)
    };
    G__9143.cljs$lang$maxFixedArity = 2;
    G__9143.cljs$lang$applyTo = function(arglist__9144) {
      var x = cljs.core.first(arglist__9144);
      var y = cljs.core.first(cljs.core.next(arglist__9144));
      var more = cljs.core.rest(cljs.core.next(arglist__9144));
      return G__9143__delegate.call(this, x, y, more)
    };
    return G__9143
  }();
  _PLUS_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _PLUS___9138.call(this);
      case 1:
        return _PLUS___9139.call(this, x);
      case 2:
        return _PLUS___9140.call(this, x, y);
      default:
        return _PLUS___9141.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _PLUS_.cljs$lang$maxFixedArity = 2;
  _PLUS_.cljs$lang$applyTo = _PLUS___9141.cljs$lang$applyTo;
  return _PLUS_
}();
cljs.core._ = function() {
  var _ = null;
  var ___9149 = function(x) {
    return-x
  };
  var ___9150 = function(x, y) {
    return x - y
  };
  var ___9151 = function() {
    var G__9154__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _, x - y, more)
    };
    var G__9154 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9154__delegate.call(this, x, y, more)
    };
    G__9154.cljs$lang$maxFixedArity = 2;
    G__9154.cljs$lang$applyTo = function(arglist__9159) {
      var x = cljs.core.first(arglist__9159);
      var y = cljs.core.first(cljs.core.next(arglist__9159));
      var more = cljs.core.rest(cljs.core.next(arglist__9159));
      return G__9154__delegate.call(this, x, y, more)
    };
    return G__9154
  }();
  _ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return ___9149.call(this, x);
      case 2:
        return ___9150.call(this, x, y);
      default:
        return ___9151.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _.cljs$lang$maxFixedArity = 2;
  _.cljs$lang$applyTo = ___9151.cljs$lang$applyTo;
  return _
}();
cljs.core._STAR_ = function() {
  var _STAR_ = null;
  var _STAR___9251 = function() {
    return 1
  };
  var _STAR___9253 = function(x) {
    return x
  };
  var _STAR___9255 = function(x, y) {
    return x * y
  };
  var _STAR___9257 = function() {
    var G__9265__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _STAR_, x * y, more)
    };
    var G__9265 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9265__delegate.call(this, x, y, more)
    };
    G__9265.cljs$lang$maxFixedArity = 2;
    G__9265.cljs$lang$applyTo = function(arglist__9272) {
      var x = cljs.core.first(arglist__9272);
      var y = cljs.core.first(cljs.core.next(arglist__9272));
      var more = cljs.core.rest(cljs.core.next(arglist__9272));
      return G__9265__delegate.call(this, x, y, more)
    };
    return G__9265
  }();
  _STAR_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 0:
        return _STAR___9251.call(this);
      case 1:
        return _STAR___9253.call(this, x);
      case 2:
        return _STAR___9255.call(this, x, y);
      default:
        return _STAR___9257.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _STAR_.cljs$lang$maxFixedArity = 2;
  _STAR_.cljs$lang$applyTo = _STAR___9257.cljs$lang$applyTo;
  return _STAR_
}();
cljs.core._SLASH_ = function() {
  var _SLASH_ = null;
  var _SLASH___9390 = function(x) {
    return _SLASH_.call(null, 1, x)
  };
  var _SLASH___9391 = function(x, y) {
    return _SLASH_.call(null, x, y)
  };
  var _SLASH___9392 = function() {
    var G__9395__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, _SLASH_, _SLASH_.call(null, x, y), more)
    };
    var G__9395 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9395__delegate.call(this, x, y, more)
    };
    G__9395.cljs$lang$maxFixedArity = 2;
    G__9395.cljs$lang$applyTo = function(arglist__9397) {
      var x = cljs.core.first(arglist__9397);
      var y = cljs.core.first(cljs.core.next(arglist__9397));
      var more = cljs.core.rest(cljs.core.next(arglist__9397));
      return G__9395__delegate.call(this, x, y, more)
    };
    return G__9395
  }();
  _SLASH_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _SLASH___9390.call(this, x);
      case 2:
        return _SLASH___9391.call(this, x, y);
      default:
        return _SLASH___9392.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _SLASH_.cljs$lang$maxFixedArity = 2;
  _SLASH_.cljs$lang$applyTo = _SLASH___9392.cljs$lang$applyTo;
  return _SLASH_
}();
cljs.core._LT_ = function() {
  var _LT_ = null;
  var _LT___9410 = function(x) {
    return true
  };
  var _LT___9411 = function(x, y) {
    return x < y
  };
  var _LT___9412 = function() {
    var G__9415__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x < y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__9416 = y;
            var G__9417 = cljs.core.first.call(null, more);
            var G__9418 = cljs.core.next.call(null, more);
            x = G__9416;
            y = G__9417;
            more = G__9418;
            continue
          }else {
            return y < cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__9415 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9415__delegate.call(this, x, y, more)
    };
    G__9415.cljs$lang$maxFixedArity = 2;
    G__9415.cljs$lang$applyTo = function(arglist__9421) {
      var x = cljs.core.first(arglist__9421);
      var y = cljs.core.first(cljs.core.next(arglist__9421));
      var more = cljs.core.rest(cljs.core.next(arglist__9421));
      return G__9415__delegate.call(this, x, y, more)
    };
    return G__9415
  }();
  _LT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT___9410.call(this, x);
      case 2:
        return _LT___9411.call(this, x, y);
      default:
        return _LT___9412.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT_.cljs$lang$maxFixedArity = 2;
  _LT_.cljs$lang$applyTo = _LT___9412.cljs$lang$applyTo;
  return _LT_
}();
cljs.core._LT__EQ_ = function() {
  var _LT__EQ_ = null;
  var _LT__EQ___9427 = function(x) {
    return true
  };
  var _LT__EQ___9428 = function(x, y) {
    return x <= y
  };
  var _LT__EQ___9429 = function() {
    var G__9436__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x <= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__9437 = y;
            var G__9438 = cljs.core.first.call(null, more);
            var G__9439 = cljs.core.next.call(null, more);
            x = G__9437;
            y = G__9438;
            more = G__9439;
            continue
          }else {
            return y <= cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__9436 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9436__delegate.call(this, x, y, more)
    };
    G__9436.cljs$lang$maxFixedArity = 2;
    G__9436.cljs$lang$applyTo = function(arglist__9442) {
      var x = cljs.core.first(arglist__9442);
      var y = cljs.core.first(cljs.core.next(arglist__9442));
      var more = cljs.core.rest(cljs.core.next(arglist__9442));
      return G__9436__delegate.call(this, x, y, more)
    };
    return G__9436
  }();
  _LT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _LT__EQ___9427.call(this, x);
      case 2:
        return _LT__EQ___9428.call(this, x, y);
      default:
        return _LT__EQ___9429.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _LT__EQ_.cljs$lang$maxFixedArity = 2;
  _LT__EQ_.cljs$lang$applyTo = _LT__EQ___9429.cljs$lang$applyTo;
  return _LT__EQ_
}();
cljs.core._GT_ = function() {
  var _GT_ = null;
  var _GT___9446 = function(x) {
    return true
  };
  var _GT___9447 = function(x, y) {
    return x > y
  };
  var _GT___9448 = function() {
    var G__9450__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x > y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__9451 = y;
            var G__9452 = cljs.core.first.call(null, more);
            var G__9453 = cljs.core.next.call(null, more);
            x = G__9451;
            y = G__9452;
            more = G__9453;
            continue
          }else {
            return y > cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__9450 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9450__delegate.call(this, x, y, more)
    };
    G__9450.cljs$lang$maxFixedArity = 2;
    G__9450.cljs$lang$applyTo = function(arglist__9454) {
      var x = cljs.core.first(arglist__9454);
      var y = cljs.core.first(cljs.core.next(arglist__9454));
      var more = cljs.core.rest(cljs.core.next(arglist__9454));
      return G__9450__delegate.call(this, x, y, more)
    };
    return G__9450
  }();
  _GT_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT___9446.call(this, x);
      case 2:
        return _GT___9447.call(this, x, y);
      default:
        return _GT___9448.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT_.cljs$lang$maxFixedArity = 2;
  _GT_.cljs$lang$applyTo = _GT___9448.cljs$lang$applyTo;
  return _GT_
}();
cljs.core._GT__EQ_ = function() {
  var _GT__EQ_ = null;
  var _GT__EQ___9456 = function(x) {
    return true
  };
  var _GT__EQ___9457 = function(x, y) {
    return x >= y
  };
  var _GT__EQ___9458 = function() {
    var G__9460__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(x >= y)) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__9461 = y;
            var G__9462 = cljs.core.first.call(null, more);
            var G__9463 = cljs.core.next.call(null, more);
            x = G__9461;
            y = G__9462;
            more = G__9463;
            continue
          }else {
            return y >= cljs.core.first.call(null, more)
          }
        }else {
          return false
        }
        break
      }
    };
    var G__9460 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9460__delegate.call(this, x, y, more)
    };
    G__9460.cljs$lang$maxFixedArity = 2;
    G__9460.cljs$lang$applyTo = function(arglist__9464) {
      var x = cljs.core.first(arglist__9464);
      var y = cljs.core.first(cljs.core.next(arglist__9464));
      var more = cljs.core.rest(cljs.core.next(arglist__9464));
      return G__9460__delegate.call(this, x, y, more)
    };
    return G__9460
  }();
  _GT__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _GT__EQ___9456.call(this, x);
      case 2:
        return _GT__EQ___9457.call(this, x, y);
      default:
        return _GT__EQ___9458.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _GT__EQ_.cljs$lang$maxFixedArity = 2;
  _GT__EQ_.cljs$lang$applyTo = _GT__EQ___9458.cljs$lang$applyTo;
  return _GT__EQ_
}();
cljs.core.dec = function dec(x) {
  return x - 1
};
cljs.core.max = function() {
  var max = null;
  var max__9471 = function(x) {
    return x
  };
  var max__9472 = function(x, y) {
    return x > y ? x : y
  };
  var max__9473 = function() {
    var G__9475__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, max, x > y ? x : y, more)
    };
    var G__9475 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9475__delegate.call(this, x, y, more)
    };
    G__9475.cljs$lang$maxFixedArity = 2;
    G__9475.cljs$lang$applyTo = function(arglist__9476) {
      var x = cljs.core.first(arglist__9476);
      var y = cljs.core.first(cljs.core.next(arglist__9476));
      var more = cljs.core.rest(cljs.core.next(arglist__9476));
      return G__9475__delegate.call(this, x, y, more)
    };
    return G__9475
  }();
  max = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return max__9471.call(this, x);
      case 2:
        return max__9472.call(this, x, y);
      default:
        return max__9473.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max.cljs$lang$maxFixedArity = 2;
  max.cljs$lang$applyTo = max__9473.cljs$lang$applyTo;
  return max
}();
cljs.core.min = function() {
  var min = null;
  var min__9482 = function(x) {
    return x
  };
  var min__9483 = function(x, y) {
    return x < y ? x : y
  };
  var min__9484 = function() {
    var G__9490__delegate = function(x, y, more) {
      return cljs.core.reduce.call(null, min, x < y ? x : y, more)
    };
    var G__9490 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9490__delegate.call(this, x, y, more)
    };
    G__9490.cljs$lang$maxFixedArity = 2;
    G__9490.cljs$lang$applyTo = function(arglist__9492) {
      var x = cljs.core.first(arglist__9492);
      var y = cljs.core.first(cljs.core.next(arglist__9492));
      var more = cljs.core.rest(cljs.core.next(arglist__9492));
      return G__9490__delegate.call(this, x, y, more)
    };
    return G__9490
  }();
  min = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return min__9482.call(this, x);
      case 2:
        return min__9483.call(this, x, y);
      default:
        return min__9484.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min.cljs$lang$maxFixedArity = 2;
  min.cljs$lang$applyTo = min__9484.cljs$lang$applyTo;
  return min
}();
cljs.core.fix = function fix(q) {
  if(cljs.core.truth_(q >= 0)) {
    return Math.floor.call(null, q)
  }else {
    return Math.ceil.call(null, q)
  }
};
cljs.core.mod = function mod(n, d) {
  return n % d
};
cljs.core.quot = function quot(n, d) {
  var rem__9519 = n % d;
  return cljs.core.fix.call(null, (n - rem__9519) / d)
};
cljs.core.rem = function rem(n, d) {
  var q__9522 = cljs.core.quot.call(null, n, d);
  return n - d * q__9522
};
cljs.core.rand = function() {
  var rand = null;
  var rand__9523 = function() {
    return Math.random.call(null)
  };
  var rand__9524 = function(n) {
    return n * rand.call(null)
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__9523.call(this);
      case 1:
        return rand__9524.call(this, n)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return rand
}();
cljs.core.rand_int = function rand_int(n) {
  return cljs.core.fix.call(null, cljs.core.rand.call(null, n))
};
cljs.core.bit_xor = function bit_xor(x, y) {
  return x ^ y
};
cljs.core.bit_and = function bit_and(x, y) {
  return x & y
};
cljs.core.bit_or = function bit_or(x, y) {
  return x | y
};
cljs.core.bit_and_not = function bit_and_not(x, y) {
  return x & ~y
};
cljs.core.bit_clear = function bit_clear(x, n) {
  return x & ~(1 << n)
};
cljs.core.bit_flip = function bit_flip(x, n) {
  return x ^ 1 << n
};
cljs.core.bit_not = function bit_not(x) {
  return~x
};
cljs.core.bit_set = function bit_set(x, n) {
  return x | 1 << n
};
cljs.core.bit_test = function bit_test(x, n) {
  return(x & 1 << n) != 0
};
cljs.core.bit_shift_left = function bit_shift_left(x, n) {
  return x << n
};
cljs.core.bit_shift_right = function bit_shift_right(x, n) {
  return x >> n
};
cljs.core._EQ__EQ_ = function() {
  var _EQ__EQ_ = null;
  var _EQ__EQ___9676 = function(x) {
    return true
  };
  var _EQ__EQ___9677 = function(x, y) {
    return cljs.core._equiv.call(null, x, y)
  };
  var _EQ__EQ___9678 = function() {
    var G__9680__delegate = function(x, y, more) {
      while(true) {
        if(cljs.core.truth_(_EQ__EQ_.call(null, x, y))) {
          if(cljs.core.truth_(cljs.core.next.call(null, more))) {
            var G__9684 = y;
            var G__9685 = cljs.core.first.call(null, more);
            var G__9686 = cljs.core.next.call(null, more);
            x = G__9684;
            y = G__9685;
            more = G__9686;
            continue
          }else {
            return _EQ__EQ_.call(null, y, cljs.core.first.call(null, more))
          }
        }else {
          return false
        }
        break
      }
    };
    var G__9680 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__9680__delegate.call(this, x, y, more)
    };
    G__9680.cljs$lang$maxFixedArity = 2;
    G__9680.cljs$lang$applyTo = function(arglist__9687) {
      var x = cljs.core.first(arglist__9687);
      var y = cljs.core.first(cljs.core.next(arglist__9687));
      var more = cljs.core.rest(cljs.core.next(arglist__9687));
      return G__9680__delegate.call(this, x, y, more)
    };
    return G__9680
  }();
  _EQ__EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return _EQ__EQ___9676.call(this, x);
      case 2:
        return _EQ__EQ___9677.call(this, x, y);
      default:
        return _EQ__EQ___9678.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  _EQ__EQ_.cljs$lang$maxFixedArity = 2;
  _EQ__EQ_.cljs$lang$applyTo = _EQ__EQ___9678.cljs$lang$applyTo;
  return _EQ__EQ_
}();
cljs.core.pos_QMARK_ = function pos_QMARK_(n) {
  return n > 0
};
cljs.core.zero_QMARK_ = function zero_QMARK_(n) {
  return n === 0
};
cljs.core.neg_QMARK_ = function neg_QMARK_(x) {
  return x < 0
};
cljs.core.nthnext = function nthnext(coll, n) {
  var n__9694 = n;
  var xs__9695 = cljs.core.seq.call(null, coll);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____9696 = xs__9695;
      if(cljs.core.truth_(and__3546__auto____9696)) {
        return n__9694 > 0
      }else {
        return and__3546__auto____9696
      }
    }())) {
      var G__9697 = n__9694 - 1;
      var G__9698 = cljs.core.next.call(null, xs__9695);
      n__9694 = G__9697;
      xs__9695 = G__9698;
      continue
    }else {
      return xs__9695
    }
    break
  }
};
cljs.core.IIndexed["_"] = true;
cljs.core._nth["_"] = function() {
  var G__9708 = null;
  var G__9708__9709 = function(coll, n) {
    var temp__3695__auto____9702 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____9702)) {
      var xs__9703 = temp__3695__auto____9702;
      return cljs.core.first.call(null, xs__9703)
    }else {
      throw new Error("Index out of bounds");
    }
  };
  var G__9708__9710 = function(coll, n, not_found) {
    var temp__3695__auto____9704 = cljs.core.nthnext.call(null, coll, n);
    if(cljs.core.truth_(temp__3695__auto____9704)) {
      var xs__9705 = temp__3695__auto____9704;
      return cljs.core.first.call(null, xs__9705)
    }else {
      return not_found
    }
  };
  G__9708 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__9708__9709.call(this, coll, n);
      case 3:
        return G__9708__9710.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__9708
}();
cljs.core.str_STAR_ = function() {
  var str_STAR_ = null;
  var str_STAR___9720 = function() {
    return""
  };
  var str_STAR___9721 = function(x) {
    if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, x))) {
      return""
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        return x.toString()
      }else {
        return null
      }
    }
  };
  var str_STAR___9722 = function() {
    var G__9724__delegate = function(x, ys) {
      return function(sb, more) {
        while(true) {
          if(cljs.core.truth_(more)) {
            var G__9725 = sb.append(str_STAR_.call(null, cljs.core.first.call(null, more)));
            var G__9726 = cljs.core.next.call(null, more);
            sb = G__9725;
            more = G__9726;
            continue
          }else {
            return str_STAR_.call(null, sb)
          }
          break
        }
      }.call(null, new goog.string.StringBuffer(str_STAR_.call(null, x)), ys)
    };
    var G__9724 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__9724__delegate.call(this, x, ys)
    };
    G__9724.cljs$lang$maxFixedArity = 1;
    G__9724.cljs$lang$applyTo = function(arglist__9727) {
      var x = cljs.core.first(arglist__9727);
      var ys = cljs.core.rest(arglist__9727);
      return G__9724__delegate.call(this, x, ys)
    };
    return G__9724
  }();
  str_STAR_ = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str_STAR___9720.call(this);
      case 1:
        return str_STAR___9721.call(this, x);
      default:
        return str_STAR___9722.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str_STAR_.cljs$lang$maxFixedArity = 1;
  str_STAR_.cljs$lang$applyTo = str_STAR___9722.cljs$lang$applyTo;
  return str_STAR_
}();
cljs.core.str = function() {
  var str = null;
  var str__9736 = function() {
    return""
  };
  var str__9737 = function(x) {
    if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, x))) {
      return x.substring(2, x.length)
    }else {
      if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, x))) {
        return cljs.core.str_STAR_.call(null, ":", x.substring(2, x.length))
      }else {
        if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, x))) {
          return""
        }else {
          if(cljs.core.truth_("\ufdd0'else")) {
            return x.toString()
          }else {
            return null
          }
        }
      }
    }
  };
  var str__9738 = function() {
    var G__9740__delegate = function(x, ys) {
      return cljs.core.apply.call(null, cljs.core.str_STAR_, x, ys)
    };
    var G__9740 = function(x, var_args) {
      var ys = null;
      if(goog.isDef(var_args)) {
        ys = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__9740__delegate.call(this, x, ys)
    };
    G__9740.cljs$lang$maxFixedArity = 1;
    G__9740.cljs$lang$applyTo = function(arglist__9741) {
      var x = cljs.core.first(arglist__9741);
      var ys = cljs.core.rest(arglist__9741);
      return G__9740__delegate.call(this, x, ys)
    };
    return G__9740
  }();
  str = function(x, var_args) {
    var ys = var_args;
    switch(arguments.length) {
      case 0:
        return str__9736.call(this);
      case 1:
        return str__9737.call(this, x);
      default:
        return str__9738.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  str.cljs$lang$maxFixedArity = 1;
  str.cljs$lang$applyTo = str__9738.cljs$lang$applyTo;
  return str
}();
cljs.core.subs = function() {
  var subs = null;
  var subs__9742 = function(s, start) {
    return s.substring(start)
  };
  var subs__9743 = function(s, start, end) {
    return s.substring(start, end)
  };
  subs = function(s, start, end) {
    switch(arguments.length) {
      case 2:
        return subs__9742.call(this, s, start);
      case 3:
        return subs__9743.call(this, s, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return subs
}();
cljs.core.symbol = function() {
  var symbol = null;
  var symbol__9749 = function(name) {
    if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, name))) {
      name
    }else {
      if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, name))) {
        cljs.core.str_STAR_.call(null, "\ufdd1", "'", cljs.core.subs.call(null, name, 2))
      }else {
      }
    }
    return cljs.core.str_STAR_.call(null, "\ufdd1", "'", name)
  };
  var symbol__9750 = function(ns, name) {
    return symbol.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  symbol = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return symbol__9749.call(this, ns);
      case 2:
        return symbol__9750.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return symbol
}();
cljs.core.keyword = function() {
  var keyword = null;
  var keyword__9753 = function(name) {
    if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, name))) {
      return name
    }else {
      if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, name))) {
        return cljs.core.str_STAR_.call(null, "\ufdd0", "'", cljs.core.subs.call(null, name, 2))
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          return cljs.core.str_STAR_.call(null, "\ufdd0", "'", name)
        }else {
          return null
        }
      }
    }
  };
  var keyword__9754 = function(ns, name) {
    return keyword.call(null, cljs.core.str_STAR_.call(null, ns, "/", name))
  };
  keyword = function(ns, name) {
    switch(arguments.length) {
      case 1:
        return keyword__9753.call(this, ns);
      case 2:
        return keyword__9754.call(this, ns, name)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return keyword
}();
cljs.core.equiv_sequential = function equiv_sequential(x, y) {
  return cljs.core.boolean$.call(null, cljs.core.truth_(cljs.core.sequential_QMARK_.call(null, y)) ? function() {
    var xs__9766 = cljs.core.seq.call(null, x);
    var ys__9769 = cljs.core.seq.call(null, y);
    while(true) {
      if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, xs__9766))) {
        return cljs.core.nil_QMARK_.call(null, ys__9769)
      }else {
        if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, ys__9769))) {
          return false
        }else {
          if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, xs__9766), cljs.core.first.call(null, ys__9769)))) {
            var G__9778 = cljs.core.next.call(null, xs__9766);
            var G__9779 = cljs.core.next.call(null, ys__9769);
            xs__9766 = G__9778;
            ys__9769 = G__9779;
            continue
          }else {
            if(cljs.core.truth_("\ufdd0'else")) {
              return false
            }else {
              return null
            }
          }
        }
      }
      break
    }
  }() : null)
};
cljs.core.hash_combine = function hash_combine(seed, hash) {
  return seed ^ hash + 2654435769 + (seed << 6) + (seed >> 2)
};
cljs.core.hash_coll = function hash_coll(coll) {
  return cljs.core.reduce.call(null, function(p1__9780_SHARP_, p2__9781_SHARP_) {
    return cljs.core.hash_combine.call(null, p1__9780_SHARP_, cljs.core.hash.call(null, p2__9781_SHARP_))
  }, cljs.core.hash.call(null, cljs.core.first.call(null, coll)), cljs.core.next.call(null, coll))
};
cljs.core.extend_object_BANG_ = function extend_object_BANG_(obj, fn_map) {
  var G__9800__9802 = cljs.core.seq.call(null, fn_map);
  if(cljs.core.truth_(G__9800__9802)) {
    var G__9805__9807 = cljs.core.first.call(null, G__9800__9802);
    var vec__9806__9808 = G__9805__9807;
    var key_name__9809 = cljs.core.nth.call(null, vec__9806__9808, 0, null);
    var f__9812 = cljs.core.nth.call(null, vec__9806__9808, 1, null);
    var G__9800__9813 = G__9800__9802;
    var G__9805__9814 = G__9805__9807;
    var G__9800__9815 = G__9800__9813;
    while(true) {
      var vec__9816__9817 = G__9805__9814;
      var key_name__9818 = cljs.core.nth.call(null, vec__9816__9817, 0, null);
      var f__9820 = cljs.core.nth.call(null, vec__9816__9817, 1, null);
      var G__9800__9821 = G__9800__9815;
      var str_name__9823 = cljs.core.name.call(null, key_name__9818);
      obj[str_name__9823] = f__9820;
      var temp__3698__auto____9824 = cljs.core.next.call(null, G__9800__9821);
      if(cljs.core.truth_(temp__3698__auto____9824)) {
        var G__9800__9825 = temp__3698__auto____9824;
        var G__9835 = cljs.core.first.call(null, G__9800__9825);
        var G__9836 = G__9800__9825;
        G__9805__9814 = G__9835;
        G__9800__9815 = G__9836;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return obj
};
cljs.core.List = function(meta, first, rest, count) {
  this.meta = meta;
  this.first = first;
  this.rest = rest;
  this.count = count
};
cljs.core.List.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.List")
};
cljs.core.List.prototype.cljs$core$IHash$ = true;
cljs.core.List.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__9854 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISequential$ = true;
cljs.core.List.prototype.cljs$core$ICollection$ = true;
cljs.core.List.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__9855 = this;
  return new cljs.core.List(this__9855.meta, o, coll, this__9855.count + 1)
};
cljs.core.List.prototype.cljs$core$ISeqable$ = true;
cljs.core.List.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__9871 = this;
  return coll
};
cljs.core.List.prototype.cljs$core$ICounted$ = true;
cljs.core.List.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__9875 = this;
  return this__9875.count
};
cljs.core.List.prototype.cljs$core$IStack$ = true;
cljs.core.List.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__9879 = this;
  return this__9879.first
};
cljs.core.List.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__9881 = this;
  return cljs.core._rest.call(null, coll)
};
cljs.core.List.prototype.cljs$core$ISeq$ = true;
cljs.core.List.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__9883 = this;
  return this__9883.first
};
cljs.core.List.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__9885 = this;
  return this__9885.rest
};
cljs.core.List.prototype.cljs$core$IEquiv$ = true;
cljs.core.List.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__9886 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.List.prototype.cljs$core$IWithMeta$ = true;
cljs.core.List.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__9888 = this;
  return new cljs.core.List(meta, this__9888.first, this__9888.rest, this__9888.count)
};
cljs.core.List.prototype.cljs$core$IMeta$ = true;
cljs.core.List.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__9890 = this;
  return this__9890.meta
};
cljs.core.List.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.List.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__9892 = this;
  return cljs.core.List.EMPTY
};
cljs.core.List;
cljs.core.EmptyList = function(meta) {
  this.meta = meta
};
cljs.core.EmptyList.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.EmptyList")
};
cljs.core.EmptyList.prototype.cljs$core$IHash$ = true;
cljs.core.EmptyList.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__9918 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.EmptyList.prototype.cljs$core$ISequential$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__9922 = this;
  return new cljs.core.List(this__9922.meta, o, null, 1)
};
cljs.core.EmptyList.prototype.cljs$core$ISeqable$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__9923 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ICounted$ = true;
cljs.core.EmptyList.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__9924 = this;
  return 0
};
cljs.core.EmptyList.prototype.cljs$core$IStack$ = true;
cljs.core.EmptyList.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__9925 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__9926 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$ = true;
cljs.core.EmptyList.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__9928 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__9929 = this;
  return null
};
cljs.core.EmptyList.prototype.cljs$core$IEquiv$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__9931 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__9933 = this;
  return new cljs.core.EmptyList(meta)
};
cljs.core.EmptyList.prototype.cljs$core$IMeta$ = true;
cljs.core.EmptyList.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__9935 = this;
  return this__9935.meta
};
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.EmptyList.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__9937 = this;
  return coll
};
cljs.core.EmptyList;
cljs.core.List.EMPTY = new cljs.core.EmptyList(null);
cljs.core.reverse = function reverse(coll) {
  return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.List.EMPTY, coll)
};
cljs.core.list = function() {
  var list__delegate = function(items) {
    return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.List.EMPTY, cljs.core.reverse.call(null, items))
  };
  var list = function(var_args) {
    var items = null;
    if(goog.isDef(var_args)) {
      items = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return list__delegate.call(this, items)
  };
  list.cljs$lang$maxFixedArity = 0;
  list.cljs$lang$applyTo = function(arglist__9963) {
    var items = cljs.core.seq(arglist__9963);
    return list__delegate.call(this, items)
  };
  return list
}();
cljs.core.Cons = function(meta, first, rest) {
  this.meta = meta;
  this.first = first;
  this.rest = rest
};
cljs.core.Cons.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.Cons")
};
cljs.core.Cons.prototype.cljs$core$ISeqable$ = true;
cljs.core.Cons.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__9972 = this;
  return coll
};
cljs.core.Cons.prototype.cljs$core$IHash$ = true;
cljs.core.Cons.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__9977 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Cons.prototype.cljs$core$IEquiv$ = true;
cljs.core.Cons.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__9979 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Cons.prototype.cljs$core$ISequential$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Cons.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__9981 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__9981.meta)
};
cljs.core.Cons.prototype.cljs$core$ICollection$ = true;
cljs.core.Cons.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__9983 = this;
  return new cljs.core.Cons(null, o, coll)
};
cljs.core.Cons.prototype.cljs$core$ISeq$ = true;
cljs.core.Cons.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__9985 = this;
  return this__9985.first
};
cljs.core.Cons.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__9986 = this;
  if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, this__9986.rest))) {
    return cljs.core.List.EMPTY
  }else {
    return this__9986.rest
  }
};
cljs.core.Cons.prototype.cljs$core$IMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__9987 = this;
  return this__9987.meta
};
cljs.core.Cons.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Cons.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__9988 = this;
  return new cljs.core.Cons(meta, this__9988.first, this__9988.rest)
};
cljs.core.Cons;
cljs.core.cons = function cons(x, seq) {
  return new cljs.core.Cons(null, x, seq)
};
cljs.core.IReduce["string"] = true;
cljs.core._reduce["string"] = function() {
  var G__10026 = null;
  var G__10026__10027 = function(string, f) {
    return cljs.core.ci_reduce.call(null, string, f)
  };
  var G__10026__10028 = function(string, f, start) {
    return cljs.core.ci_reduce.call(null, string, f, start)
  };
  G__10026 = function(string, f, start) {
    switch(arguments.length) {
      case 2:
        return G__10026__10027.call(this, string, f);
      case 3:
        return G__10026__10028.call(this, string, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10026
}();
cljs.core.ILookup["string"] = true;
cljs.core._lookup["string"] = function() {
  var G__10037 = null;
  var G__10037__10039 = function(string, k) {
    return cljs.core._nth.call(null, string, k)
  };
  var G__10037__10040 = function(string, k, not_found) {
    return cljs.core._nth.call(null, string, k, not_found)
  };
  G__10037 = function(string, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10037__10039.call(this, string, k);
      case 3:
        return G__10037__10040.call(this, string, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10037
}();
cljs.core.IIndexed["string"] = true;
cljs.core._nth["string"] = function() {
  var G__10090 = null;
  var G__10090__10091 = function(string, n) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return null
    }
  };
  var G__10090__10092 = function(string, n, not_found) {
    if(cljs.core.truth_(n < cljs.core._count.call(null, string))) {
      return string.charAt(n)
    }else {
      return not_found
    }
  };
  G__10090 = function(string, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10090__10091.call(this, string, n);
      case 3:
        return G__10090__10092.call(this, string, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10090
}();
cljs.core.ICounted["string"] = true;
cljs.core._count["string"] = function(s) {
  return s.length
};
cljs.core.ISeqable["string"] = true;
cljs.core._seq["string"] = function(string) {
  return cljs.core.prim_seq.call(null, string, 0)
};
cljs.core.IHash["string"] = true;
cljs.core._hash["string"] = function(o) {
  return goog.string.hashCode.call(null, o)
};
String.prototype.cljs$core$IFn$ = true;
String.prototype.call = function() {
  var G__10103 = null;
  var G__10103__10107 = function(this$, coll) {
    this$ = this;
    return cljs.core.get.call(null, coll, this$.toString())
  };
  var G__10103__10108 = function(this$, coll, not_found) {
    this$ = this;
    return cljs.core.get.call(null, coll, this$.toString(), not_found)
  };
  G__10103 = function(this$, coll, not_found) {
    switch(arguments.length) {
      case 2:
        return G__10103__10107.call(this, this$, coll);
      case 3:
        return G__10103__10108.call(this, this$, coll, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__10103
}();
String["prototype"]["apply"] = function(s, args) {
  if(cljs.core.truth_(cljs.core.count.call(null, args) < 2)) {
    return cljs.core.get.call(null, args[0], s)
  }else {
    return cljs.core.get.call(null, args[0], s, args[1])
  }
};
cljs.core.lazy_seq_value = function lazy_seq_value(lazy_seq) {
  var x__10122 = lazy_seq.x;
  if(cljs.core.truth_(lazy_seq.realized)) {
    return x__10122
  }else {
    lazy_seq.x = x__10122.call(null);
    lazy_seq.realized = true;
    return lazy_seq.x
  }
};
cljs.core.LazySeq = function(meta, realized, x) {
  this.meta = meta;
  this.realized = realized;
  this.x = x
};
cljs.core.LazySeq.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.LazySeq")
};
cljs.core.LazySeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__10123 = this;
  return cljs.core.seq.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IHash$ = true;
cljs.core.LazySeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__10124 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.LazySeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__10130 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.LazySeq.prototype.cljs$core$ISequential$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__10131 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__10131.meta)
};
cljs.core.LazySeq.prototype.cljs$core$ICollection$ = true;
cljs.core.LazySeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__10132 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$ = true;
cljs.core.LazySeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__10133 = this;
  return cljs.core.first.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__10134 = this;
  return cljs.core.rest.call(null, cljs.core.lazy_seq_value.call(null, coll))
};
cljs.core.LazySeq.prototype.cljs$core$IMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__10135 = this;
  return this__10135.meta
};
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.LazySeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__10136 = this;
  return new cljs.core.LazySeq(meta, this__10136.realized, this__10136.x)
};
cljs.core.LazySeq;
cljs.core.to_array = function to_array(s) {
  var ary__10147 = cljs.core.array.call(null);
  var s__10148 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.seq.call(null, s__10148))) {
      ary__10147.push(cljs.core.first.call(null, s__10148));
      var G__10152 = cljs.core.next.call(null, s__10148);
      s__10148 = G__10152;
      continue
    }else {
      return ary__10147
    }
    break
  }
};
cljs.core.bounded_count = function bounded_count(s, n) {
  var s__10154 = s;
  var i__10158 = n;
  var sum__10159 = 0;
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____10222 = i__10158 > 0;
      if(cljs.core.truth_(and__3546__auto____10222)) {
        return cljs.core.seq.call(null, s__10154)
      }else {
        return and__3546__auto____10222
      }
    }())) {
      var G__10224 = cljs.core.next.call(null, s__10154);
      var G__10225 = i__10158 - 1;
      var G__10226 = sum__10159 + 1;
      s__10154 = G__10224;
      i__10158 = G__10225;
      sum__10159 = G__10226;
      continue
    }else {
      return sum__10159
    }
    break
  }
};
cljs.core.spread = function spread(arglist) {
  if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, arglist))) {
    return null
  }else {
    if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, cljs.core.next.call(null, arglist)))) {
      return cljs.core.seq.call(null, cljs.core.first.call(null, arglist))
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, arglist), spread.call(null, cljs.core.next.call(null, arglist)))
      }else {
        return null
      }
    }
  }
};
cljs.core.concat = function() {
  var concat = null;
  var concat__10245 = function() {
    return new cljs.core.LazySeq(null, false, function() {
      return null
    })
  };
  var concat__10246 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return x
    })
  };
  var concat__10247 = function(x, y) {
    return new cljs.core.LazySeq(null, false, function() {
      var s__10235 = cljs.core.seq.call(null, x);
      if(cljs.core.truth_(s__10235)) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__10235), concat.call(null, cljs.core.rest.call(null, s__10235), y))
      }else {
        return y
      }
    })
  };
  var concat__10248 = function() {
    var G__10251__delegate = function(x, y, zs) {
      var cat__10241 = function cat(xys, zs) {
        return new cljs.core.LazySeq(null, false, function() {
          var xys__10239 = cljs.core.seq.call(null, xys);
          if(cljs.core.truth_(xys__10239)) {
            return cljs.core.cons.call(null, cljs.core.first.call(null, xys__10239), cat.call(null, cljs.core.rest.call(null, xys__10239), zs))
          }else {
            if(cljs.core.truth_(zs)) {
              return cat.call(null, cljs.core.first.call(null, zs), cljs.core.next.call(null, zs))
            }else {
              return null
            }
          }
        })
      };
      return cat__10241.call(null, concat.call(null, x, y), zs)
    };
    var G__10251 = function(x, y, var_args) {
      var zs = null;
      if(goog.isDef(var_args)) {
        zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__10251__delegate.call(this, x, y, zs)
    };
    G__10251.cljs$lang$maxFixedArity = 2;
    G__10251.cljs$lang$applyTo = function(arglist__10252) {
      var x = cljs.core.first(arglist__10252);
      var y = cljs.core.first(cljs.core.next(arglist__10252));
      var zs = cljs.core.rest(cljs.core.next(arglist__10252));
      return G__10251__delegate.call(this, x, y, zs)
    };
    return G__10251
  }();
  concat = function(x, y, var_args) {
    var zs = var_args;
    switch(arguments.length) {
      case 0:
        return concat__10245.call(this);
      case 1:
        return concat__10246.call(this, x);
      case 2:
        return concat__10247.call(this, x, y);
      default:
        return concat__10248.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  concat.cljs$lang$maxFixedArity = 2;
  concat.cljs$lang$applyTo = concat__10248.cljs$lang$applyTo;
  return concat
}();
cljs.core.list_STAR_ = function() {
  var list_STAR_ = null;
  var list_STAR___10265 = function(args) {
    return cljs.core.seq.call(null, args)
  };
  var list_STAR___10266 = function(a, args) {
    return cljs.core.cons.call(null, a, args)
  };
  var list_STAR___10267 = function(a, b, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, args))
  };
  var list_STAR___10268 = function(a, b, c, args) {
    return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, args)))
  };
  var list_STAR___10269 = function() {
    var G__10272__delegate = function(a, b, c, d, more) {
      return cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, more)))))
    };
    var G__10272 = function(a, b, c, d, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__10272__delegate.call(this, a, b, c, d, more)
    };
    G__10272.cljs$lang$maxFixedArity = 4;
    G__10272.cljs$lang$applyTo = function(arglist__10275) {
      var a = cljs.core.first(arglist__10275);
      var b = cljs.core.first(cljs.core.next(arglist__10275));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10275)));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10275))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10275))));
      return G__10272__delegate.call(this, a, b, c, d, more)
    };
    return G__10272
  }();
  list_STAR_ = function(a, b, c, d, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return list_STAR___10265.call(this, a);
      case 2:
        return list_STAR___10266.call(this, a, b);
      case 3:
        return list_STAR___10267.call(this, a, b, c);
      case 4:
        return list_STAR___10268.call(this, a, b, c, d);
      default:
        return list_STAR___10269.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  list_STAR_.cljs$lang$maxFixedArity = 4;
  list_STAR_.cljs$lang$applyTo = list_STAR___10269.cljs$lang$applyTo;
  return list_STAR_
}();
cljs.core.apply = function() {
  var apply = null;
  var apply__10407 = function(f, args) {
    var fixed_arity__10284 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, args, fixed_arity__10284 + 1) <= fixed_arity__10284)) {
        return f.apply(f, cljs.core.to_array.call(null, args))
      }else {
        return f.cljs$lang$applyTo(args)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, args))
    }
  };
  var apply__10408 = function(f, x, args) {
    var arglist__10286 = cljs.core.list_STAR_.call(null, x, args);
    var fixed_arity__10287 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__10286, fixed_arity__10287) <= fixed_arity__10287)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__10286))
      }else {
        return f.cljs$lang$applyTo(arglist__10286)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__10286))
    }
  };
  var apply__10409 = function(f, x, y, args) {
    var arglist__10318 = cljs.core.list_STAR_.call(null, x, y, args);
    var fixed_arity__10319 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__10318, fixed_arity__10319) <= fixed_arity__10319)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__10318))
      }else {
        return f.cljs$lang$applyTo(arglist__10318)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__10318))
    }
  };
  var apply__10410 = function(f, x, y, z, args) {
    var arglist__10322 = cljs.core.list_STAR_.call(null, x, y, z, args);
    var fixed_arity__10323 = f.cljs$lang$maxFixedArity;
    if(cljs.core.truth_(f.cljs$lang$applyTo)) {
      if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__10322, fixed_arity__10323) <= fixed_arity__10323)) {
        return f.apply(f, cljs.core.to_array.call(null, arglist__10322))
      }else {
        return f.cljs$lang$applyTo(arglist__10322)
      }
    }else {
      return f.apply(f, cljs.core.to_array.call(null, arglist__10322))
    }
  };
  var apply__10411 = function() {
    var G__10429__delegate = function(f, a, b, c, d, args) {
      var arglist__10329 = cljs.core.cons.call(null, a, cljs.core.cons.call(null, b, cljs.core.cons.call(null, c, cljs.core.cons.call(null, d, cljs.core.spread.call(null, args)))));
      var fixed_arity__10330 = f.cljs$lang$maxFixedArity;
      if(cljs.core.truth_(f.cljs$lang$applyTo)) {
        if(cljs.core.truth_(cljs.core.bounded_count.call(null, arglist__10329, fixed_arity__10330) <= fixed_arity__10330)) {
          return f.apply(f, cljs.core.to_array.call(null, arglist__10329))
        }else {
          return f.cljs$lang$applyTo(arglist__10329)
        }
      }else {
        return f.apply(f, cljs.core.to_array.call(null, arglist__10329))
      }
    };
    var G__10429 = function(f, a, b, c, d, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__10429__delegate.call(this, f, a, b, c, d, args)
    };
    G__10429.cljs$lang$maxFixedArity = 5;
    G__10429.cljs$lang$applyTo = function(arglist__10432) {
      var f = cljs.core.first(arglist__10432);
      var a = cljs.core.first(cljs.core.next(arglist__10432));
      var b = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10432)));
      var c = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10432))));
      var d = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10432)))));
      var args = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10432)))));
      return G__10429__delegate.call(this, f, a, b, c, d, args)
    };
    return G__10429
  }();
  apply = function(f, a, b, c, d, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 2:
        return apply__10407.call(this, f, a);
      case 3:
        return apply__10408.call(this, f, a, b);
      case 4:
        return apply__10409.call(this, f, a, b, c);
      case 5:
        return apply__10410.call(this, f, a, b, c, d);
      default:
        return apply__10411.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  apply.cljs$lang$maxFixedArity = 5;
  apply.cljs$lang$applyTo = apply__10411.cljs$lang$applyTo;
  return apply
}();
cljs.core.vary_meta = function() {
  var vary_meta__delegate = function(obj, f, args) {
    return cljs.core.with_meta.call(null, obj, cljs.core.apply.call(null, f, cljs.core.meta.call(null, obj), args))
  };
  var vary_meta = function(obj, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return vary_meta__delegate.call(this, obj, f, args)
  };
  vary_meta.cljs$lang$maxFixedArity = 2;
  vary_meta.cljs$lang$applyTo = function(arglist__10439) {
    var obj = cljs.core.first(arglist__10439);
    var f = cljs.core.first(cljs.core.next(arglist__10439));
    var args = cljs.core.rest(cljs.core.next(arglist__10439));
    return vary_meta__delegate.call(this, obj, f, args)
  };
  return vary_meta
}();
cljs.core.not_EQ_ = function() {
  var not_EQ_ = null;
  var not_EQ___10440 = function(x) {
    return false
  };
  var not_EQ___10441 = function(x, y) {
    return cljs.core.not.call(null, cljs.core._EQ_.call(null, x, y))
  };
  var not_EQ___10442 = function() {
    var G__10444__delegate = function(x, y, more) {
      return cljs.core.not.call(null, cljs.core.apply.call(null, cljs.core._EQ_, x, y, more))
    };
    var G__10444 = function(x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__10444__delegate.call(this, x, y, more)
    };
    G__10444.cljs$lang$maxFixedArity = 2;
    G__10444.cljs$lang$applyTo = function(arglist__10445) {
      var x = cljs.core.first(arglist__10445);
      var y = cljs.core.first(cljs.core.next(arglist__10445));
      var more = cljs.core.rest(cljs.core.next(arglist__10445));
      return G__10444__delegate.call(this, x, y, more)
    };
    return G__10444
  }();
  not_EQ_ = function(x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 1:
        return not_EQ___10440.call(this, x);
      case 2:
        return not_EQ___10441.call(this, x, y);
      default:
        return not_EQ___10442.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  not_EQ_.cljs$lang$maxFixedArity = 2;
  not_EQ_.cljs$lang$applyTo = not_EQ___10442.cljs$lang$applyTo;
  return not_EQ_
}();
cljs.core.not_empty = function not_empty(coll) {
  if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
    return coll
  }else {
    return null
  }
};
cljs.core.every_QMARK_ = function every_QMARK_(pred, coll) {
  while(true) {
    if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, cljs.core.seq.call(null, coll)))) {
      return true
    }else {
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, coll)))) {
        var G__10449 = pred;
        var G__10450 = cljs.core.next.call(null, coll);
        pred = G__10449;
        coll = G__10450;
        continue
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          return false
        }else {
          return null
        }
      }
    }
    break
  }
};
cljs.core.not_every_QMARK_ = function not_every_QMARK_(pred, coll) {
  return cljs.core.not.call(null, cljs.core.every_QMARK_.call(null, pred, coll))
};
cljs.core.some = function some(pred, coll) {
  while(true) {
    if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
      var or__3548__auto____10453 = pred.call(null, cljs.core.first.call(null, coll));
      if(cljs.core.truth_(or__3548__auto____10453)) {
        return or__3548__auto____10453
      }else {
        var G__10456 = pred;
        var G__10457 = cljs.core.next.call(null, coll);
        pred = G__10456;
        coll = G__10457;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.not_any_QMARK_ = function not_any_QMARK_(pred, coll) {
  return cljs.core.not.call(null, cljs.core.some.call(null, pred, coll))
};
cljs.core.even_QMARK_ = function even_QMARK_(n) {
  if(cljs.core.truth_(cljs.core.integer_QMARK_.call(null, n))) {
    return(n & 1) === 0
  }else {
    throw new Error(cljs.core.str.call(null, "Argument must be an integer: ", n));
  }
};
cljs.core.odd_QMARK_ = function odd_QMARK_(n) {
  return cljs.core.not.call(null, cljs.core.even_QMARK_.call(null, n))
};
cljs.core.identity = function identity(x) {
  return x
};
cljs.core.complement = function complement(f) {
  return function() {
    var G__10646 = null;
    var G__10646__10647 = function() {
      return cljs.core.not.call(null, f.call(null))
    };
    var G__10646__10648 = function(x) {
      return cljs.core.not.call(null, f.call(null, x))
    };
    var G__10646__10649 = function(x, y) {
      return cljs.core.not.call(null, f.call(null, x, y))
    };
    var G__10646__10650 = function() {
      var G__10652__delegate = function(x, y, zs) {
        return cljs.core.not.call(null, cljs.core.apply.call(null, f, x, y, zs))
      };
      var G__10652 = function(x, y, var_args) {
        var zs = null;
        if(goog.isDef(var_args)) {
          zs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
        }
        return G__10652__delegate.call(this, x, y, zs)
      };
      G__10652.cljs$lang$maxFixedArity = 2;
      G__10652.cljs$lang$applyTo = function(arglist__10653) {
        var x = cljs.core.first(arglist__10653);
        var y = cljs.core.first(cljs.core.next(arglist__10653));
        var zs = cljs.core.rest(cljs.core.next(arglist__10653));
        return G__10652__delegate.call(this, x, y, zs)
      };
      return G__10652
    }();
    G__10646 = function(x, y, var_args) {
      var zs = var_args;
      switch(arguments.length) {
        case 0:
          return G__10646__10647.call(this);
        case 1:
          return G__10646__10648.call(this, x);
        case 2:
          return G__10646__10649.call(this, x, y);
        default:
          return G__10646__10650.apply(this, arguments)
      }
      throw"Invalid arity: " + arguments.length;
    };
    G__10646.cljs$lang$maxFixedArity = 2;
    G__10646.cljs$lang$applyTo = G__10646__10650.cljs$lang$applyTo;
    return G__10646
  }()
};
cljs.core.constantly = function constantly(x) {
  return function() {
    var G__10662__delegate = function(args) {
      return x
    };
    var G__10662 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__10662__delegate.call(this, args)
    };
    G__10662.cljs$lang$maxFixedArity = 0;
    G__10662.cljs$lang$applyTo = function(arglist__10664) {
      var args = cljs.core.seq(arglist__10664);
      return G__10662__delegate.call(this, args)
    };
    return G__10662
  }()
};
cljs.core.comp = function() {
  var comp = null;
  var comp__10717 = function() {
    return cljs.core.identity
  };
  var comp__10718 = function(f) {
    return f
  };
  var comp__10719 = function(f, g) {
    return function() {
      var G__10725 = null;
      var G__10725__10726 = function() {
        return f.call(null, g.call(null))
      };
      var G__10725__10727 = function(x) {
        return f.call(null, g.call(null, x))
      };
      var G__10725__10728 = function(x, y) {
        return f.call(null, g.call(null, x, y))
      };
      var G__10725__10729 = function(x, y, z) {
        return f.call(null, g.call(null, x, y, z))
      };
      var G__10725__10730 = function() {
        var G__10740__delegate = function(x, y, z, args) {
          return f.call(null, cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__10740 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10740__delegate.call(this, x, y, z, args)
        };
        G__10740.cljs$lang$maxFixedArity = 3;
        G__10740.cljs$lang$applyTo = function(arglist__10741) {
          var x = cljs.core.first(arglist__10741);
          var y = cljs.core.first(cljs.core.next(arglist__10741));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10741)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10741)));
          return G__10740__delegate.call(this, x, y, z, args)
        };
        return G__10740
      }();
      G__10725 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__10725__10726.call(this);
          case 1:
            return G__10725__10727.call(this, x);
          case 2:
            return G__10725__10728.call(this, x, y);
          case 3:
            return G__10725__10729.call(this, x, y, z);
          default:
            return G__10725__10730.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__10725.cljs$lang$maxFixedArity = 3;
      G__10725.cljs$lang$applyTo = G__10725__10730.cljs$lang$applyTo;
      return G__10725
    }()
  };
  var comp__10720 = function(f, g, h) {
    return function() {
      var G__10743 = null;
      var G__10743__10744 = function() {
        return f.call(null, g.call(null, h.call(null)))
      };
      var G__10743__10745 = function(x) {
        return f.call(null, g.call(null, h.call(null, x)))
      };
      var G__10743__10746 = function(x, y) {
        return f.call(null, g.call(null, h.call(null, x, y)))
      };
      var G__10743__10747 = function(x, y, z) {
        return f.call(null, g.call(null, h.call(null, x, y, z)))
      };
      var G__10743__10748 = function() {
        var G__10751__delegate = function(x, y, z, args) {
          return f.call(null, g.call(null, cljs.core.apply.call(null, h, x, y, z, args)))
        };
        var G__10751 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10751__delegate.call(this, x, y, z, args)
        };
        G__10751.cljs$lang$maxFixedArity = 3;
        G__10751.cljs$lang$applyTo = function(arglist__10752) {
          var x = cljs.core.first(arglist__10752);
          var y = cljs.core.first(cljs.core.next(arglist__10752));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10752)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10752)));
          return G__10751__delegate.call(this, x, y, z, args)
        };
        return G__10751
      }();
      G__10743 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__10743__10744.call(this);
          case 1:
            return G__10743__10745.call(this, x);
          case 2:
            return G__10743__10746.call(this, x, y);
          case 3:
            return G__10743__10747.call(this, x, y, z);
          default:
            return G__10743__10748.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__10743.cljs$lang$maxFixedArity = 3;
      G__10743.cljs$lang$applyTo = G__10743__10748.cljs$lang$applyTo;
      return G__10743
    }()
  };
  var comp__10721 = function() {
    var G__10755__delegate = function(f1, f2, f3, fs) {
      var fs__10709 = cljs.core.reverse.call(null, cljs.core.list_STAR_.call(null, f1, f2, f3, fs));
      return function() {
        var G__10757__delegate = function(args) {
          var ret__10710 = cljs.core.apply.call(null, cljs.core.first.call(null, fs__10709), args);
          var fs__10711 = cljs.core.next.call(null, fs__10709);
          while(true) {
            if(cljs.core.truth_(fs__10711)) {
              var G__10758 = cljs.core.first.call(null, fs__10711).call(null, ret__10710);
              var G__10759 = cljs.core.next.call(null, fs__10711);
              ret__10710 = G__10758;
              fs__10711 = G__10759;
              continue
            }else {
              return ret__10710
            }
            break
          }
        };
        var G__10757 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__10757__delegate.call(this, args)
        };
        G__10757.cljs$lang$maxFixedArity = 0;
        G__10757.cljs$lang$applyTo = function(arglist__10760) {
          var args = cljs.core.seq(arglist__10760);
          return G__10757__delegate.call(this, args)
        };
        return G__10757
      }()
    };
    var G__10755 = function(f1, f2, f3, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__10755__delegate.call(this, f1, f2, f3, fs)
    };
    G__10755.cljs$lang$maxFixedArity = 3;
    G__10755.cljs$lang$applyTo = function(arglist__10762) {
      var f1 = cljs.core.first(arglist__10762);
      var f2 = cljs.core.first(cljs.core.next(arglist__10762));
      var f3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10762)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10762)));
      return G__10755__delegate.call(this, f1, f2, f3, fs)
    };
    return G__10755
  }();
  comp = function(f1, f2, f3, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 0:
        return comp__10717.call(this);
      case 1:
        return comp__10718.call(this, f1);
      case 2:
        return comp__10719.call(this, f1, f2);
      case 3:
        return comp__10720.call(this, f1, f2, f3);
      default:
        return comp__10721.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  comp.cljs$lang$maxFixedArity = 3;
  comp.cljs$lang$applyTo = comp__10721.cljs$lang$applyTo;
  return comp
}();
cljs.core.partial = function() {
  var partial = null;
  var partial__10775 = function(f, arg1) {
    return function() {
      var G__10781__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, args)
      };
      var G__10781 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__10781__delegate.call(this, args)
      };
      G__10781.cljs$lang$maxFixedArity = 0;
      G__10781.cljs$lang$applyTo = function(arglist__10783) {
        var args = cljs.core.seq(arglist__10783);
        return G__10781__delegate.call(this, args)
      };
      return G__10781
    }()
  };
  var partial__10776 = function(f, arg1, arg2) {
    return function() {
      var G__10786__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, args)
      };
      var G__10786 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__10786__delegate.call(this, args)
      };
      G__10786.cljs$lang$maxFixedArity = 0;
      G__10786.cljs$lang$applyTo = function(arglist__10789) {
        var args = cljs.core.seq(arglist__10789);
        return G__10786__delegate.call(this, args)
      };
      return G__10786
    }()
  };
  var partial__10777 = function(f, arg1, arg2, arg3) {
    return function() {
      var G__10790__delegate = function(args) {
        return cljs.core.apply.call(null, f, arg1, arg2, arg3, args)
      };
      var G__10790 = function(var_args) {
        var args = null;
        if(goog.isDef(var_args)) {
          args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
        }
        return G__10790__delegate.call(this, args)
      };
      G__10790.cljs$lang$maxFixedArity = 0;
      G__10790.cljs$lang$applyTo = function(arglist__10792) {
        var args = cljs.core.seq(arglist__10792);
        return G__10790__delegate.call(this, args)
      };
      return G__10790
    }()
  };
  var partial__10778 = function() {
    var G__10793__delegate = function(f, arg1, arg2, arg3, more) {
      return function() {
        var G__10794__delegate = function(args) {
          return cljs.core.apply.call(null, f, arg1, arg2, arg3, cljs.core.concat.call(null, more, args))
        };
        var G__10794 = function(var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
          }
          return G__10794__delegate.call(this, args)
        };
        G__10794.cljs$lang$maxFixedArity = 0;
        G__10794.cljs$lang$applyTo = function(arglist__10796) {
          var args = cljs.core.seq(arglist__10796);
          return G__10794__delegate.call(this, args)
        };
        return G__10794
      }()
    };
    var G__10793 = function(f, arg1, arg2, arg3, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__10793__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    G__10793.cljs$lang$maxFixedArity = 4;
    G__10793.cljs$lang$applyTo = function(arglist__10797) {
      var f = cljs.core.first(arglist__10797);
      var arg1 = cljs.core.first(cljs.core.next(arglist__10797));
      var arg2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10797)));
      var arg3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10797))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__10797))));
      return G__10793__delegate.call(this, f, arg1, arg2, arg3, more)
    };
    return G__10793
  }();
  partial = function(f, arg1, arg2, arg3, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return partial__10775.call(this, f, arg1);
      case 3:
        return partial__10776.call(this, f, arg1, arg2);
      case 4:
        return partial__10777.call(this, f, arg1, arg2, arg3);
      default:
        return partial__10778.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  partial.cljs$lang$maxFixedArity = 4;
  partial.cljs$lang$applyTo = partial__10778.cljs$lang$applyTo;
  return partial
}();
cljs.core.fnil = function() {
  var fnil = null;
  var fnil__10923 = function(f, x) {
    return function() {
      var G__10928 = null;
      var G__10928__10930 = function(a) {
        return f.call(null, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, a)) ? x : a)
      };
      var G__10928__10931 = function(a, b) {
        return f.call(null, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, a)) ? x : a, b)
      };
      var G__10928__10932 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, a)) ? x : a, b, c)
      };
      var G__10928__10933 = function() {
        var G__10938__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, a)) ? x : a, b, c, ds)
        };
        var G__10938 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10938__delegate.call(this, a, b, c, ds)
        };
        G__10938.cljs$lang$maxFixedArity = 3;
        G__10938.cljs$lang$applyTo = function(arglist__10943) {
          var a = cljs.core.first(arglist__10943);
          var b = cljs.core.first(cljs.core.next(arglist__10943));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10943)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10943)));
          return G__10938__delegate.call(this, a, b, c, ds)
        };
        return G__10938
      }();
      G__10928 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 1:
            return G__10928__10930.call(this, a);
          case 2:
            return G__10928__10931.call(this, a, b);
          case 3:
            return G__10928__10932.call(this, a, b, c);
          default:
            return G__10928__10933.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__10928.cljs$lang$maxFixedArity = 3;
      G__10928.cljs$lang$applyTo = G__10928__10933.cljs$lang$applyTo;
      return G__10928
    }()
  };
  var fnil__10924 = function(f, x, y) {
    return function() {
      var G__10947 = null;
      var G__10947__10948 = function(a, b) {
        return f.call(null, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, a)) ? x : a, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, b)) ? y : b)
      };
      var G__10947__10949 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, a)) ? x : a, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, b)) ? y : b, c)
      };
      var G__10947__10951 = function() {
        var G__10961__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, a)) ? x : a, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, b)) ? y : b, c, ds)
        };
        var G__10961 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10961__delegate.call(this, a, b, c, ds)
        };
        G__10961.cljs$lang$maxFixedArity = 3;
        G__10961.cljs$lang$applyTo = function(arglist__10970) {
          var a = cljs.core.first(arglist__10970);
          var b = cljs.core.first(cljs.core.next(arglist__10970));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__10970)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__10970)));
          return G__10961__delegate.call(this, a, b, c, ds)
        };
        return G__10961
      }();
      G__10947 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__10947__10948.call(this, a, b);
          case 3:
            return G__10947__10949.call(this, a, b, c);
          default:
            return G__10947__10951.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__10947.cljs$lang$maxFixedArity = 3;
      G__10947.cljs$lang$applyTo = G__10947__10951.cljs$lang$applyTo;
      return G__10947
    }()
  };
  var fnil__10925 = function(f, x, y, z) {
    return function() {
      var G__10978 = null;
      var G__10978__10979 = function(a, b) {
        return f.call(null, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, a)) ? x : a, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, b)) ? y : b)
      };
      var G__10978__10981 = function(a, b, c) {
        return f.call(null, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, a)) ? x : a, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, b)) ? y : b, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, c)) ? z : c)
      };
      var G__10978__10982 = function() {
        var G__10993__delegate = function(a, b, c, ds) {
          return cljs.core.apply.call(null, f, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, a)) ? x : a, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, b)) ? y : b, cljs.core.truth_(cljs.core.nil_QMARK_.call(null, c)) ? z : c, ds)
        };
        var G__10993 = function(a, b, c, var_args) {
          var ds = null;
          if(goog.isDef(var_args)) {
            ds = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__10993__delegate.call(this, a, b, c, ds)
        };
        G__10993.cljs$lang$maxFixedArity = 3;
        G__10993.cljs$lang$applyTo = function(arglist__11000) {
          var a = cljs.core.first(arglist__11000);
          var b = cljs.core.first(cljs.core.next(arglist__11000));
          var c = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11000)));
          var ds = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11000)));
          return G__10993__delegate.call(this, a, b, c, ds)
        };
        return G__10993
      }();
      G__10978 = function(a, b, c, var_args) {
        var ds = var_args;
        switch(arguments.length) {
          case 2:
            return G__10978__10979.call(this, a, b);
          case 3:
            return G__10978__10981.call(this, a, b, c);
          default:
            return G__10978__10982.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__10978.cljs$lang$maxFixedArity = 3;
      G__10978.cljs$lang$applyTo = G__10978__10982.cljs$lang$applyTo;
      return G__10978
    }()
  };
  fnil = function(f, x, y, z) {
    switch(arguments.length) {
      case 2:
        return fnil__10923.call(this, f, x);
      case 3:
        return fnil__10924.call(this, f, x, y);
      case 4:
        return fnil__10925.call(this, f, x, y, z)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return fnil
}();
cljs.core.map_indexed = function map_indexed(f, coll) {
  var mapi__11022 = function mpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____11017 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____11017)) {
        var s__11018 = temp__3698__auto____11017;
        return cljs.core.cons.call(null, f.call(null, idx, cljs.core.first.call(null, s__11018)), mpi.call(null, idx + 1, cljs.core.rest.call(null, s__11018)))
      }else {
        return null
      }
    })
  };
  return mapi__11022.call(null, 0, coll)
};
cljs.core.keep = function keep(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____11048 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____11048)) {
      var s__11049 = temp__3698__auto____11048;
      var x__11050 = f.call(null, cljs.core.first.call(null, s__11049));
      if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, x__11050))) {
        return keep.call(null, f, cljs.core.rest.call(null, s__11049))
      }else {
        return cljs.core.cons.call(null, x__11050, keep.call(null, f, cljs.core.rest.call(null, s__11049)))
      }
    }else {
      return null
    }
  })
};
cljs.core.keep_indexed = function keep_indexed(f, coll) {
  var keepi__11205 = function kpi(idx, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____11193 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____11193)) {
        var s__11196 = temp__3698__auto____11193;
        var x__11199 = f.call(null, idx, cljs.core.first.call(null, s__11196));
        if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, x__11199))) {
          return kpi.call(null, idx + 1, cljs.core.rest.call(null, s__11196))
        }else {
          return cljs.core.cons.call(null, x__11199, kpi.call(null, idx + 1, cljs.core.rest.call(null, s__11196)))
        }
      }else {
        return null
      }
    })
  };
  return keepi__11205.call(null, 0, coll)
};
cljs.core.every_pred = function() {
  var every_pred = null;
  var every_pred__11431 = function(p) {
    return function() {
      var ep1 = null;
      var ep1__11437 = function() {
        return true
      };
      var ep1__11438 = function(x) {
        return cljs.core.boolean$.call(null, p.call(null, x))
      };
      var ep1__11439 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____11237 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____11237)) {
            return p.call(null, y)
          }else {
            return and__3546__auto____11237
          }
        }())
      };
      var ep1__11440 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____11238 = p.call(null, x);
          if(cljs.core.truth_(and__3546__auto____11238)) {
            var and__3546__auto____11240 = p.call(null, y);
            if(cljs.core.truth_(and__3546__auto____11240)) {
              return p.call(null, z)
            }else {
              return and__3546__auto____11240
            }
          }else {
            return and__3546__auto____11238
          }
        }())
      };
      var ep1__11441 = function() {
        var G__11453__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____11242 = ep1.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____11242)) {
              return cljs.core.every_QMARK_.call(null, p, args)
            }else {
              return and__3546__auto____11242
            }
          }())
        };
        var G__11453 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__11453__delegate.call(this, x, y, z, args)
        };
        G__11453.cljs$lang$maxFixedArity = 3;
        G__11453.cljs$lang$applyTo = function(arglist__11461) {
          var x = cljs.core.first(arglist__11461);
          var y = cljs.core.first(cljs.core.next(arglist__11461));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11461)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11461)));
          return G__11453__delegate.call(this, x, y, z, args)
        };
        return G__11453
      }();
      ep1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep1__11437.call(this);
          case 1:
            return ep1__11438.call(this, x);
          case 2:
            return ep1__11439.call(this, x, y);
          case 3:
            return ep1__11440.call(this, x, y, z);
          default:
            return ep1__11441.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep1.cljs$lang$maxFixedArity = 3;
      ep1.cljs$lang$applyTo = ep1__11441.cljs$lang$applyTo;
      return ep1
    }()
  };
  var every_pred__11432 = function(p1, p2) {
    return function() {
      var ep2 = null;
      var ep2__11462 = function() {
        return true
      };
      var ep2__11463 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____11245 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____11245)) {
            return p2.call(null, x)
          }else {
            return and__3546__auto____11245
          }
        }())
      };
      var ep2__11464 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____11246 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____11246)) {
            var and__3546__auto____11247 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____11247)) {
              var and__3546__auto____11249 = p2.call(null, x);
              if(cljs.core.truth_(and__3546__auto____11249)) {
                return p2.call(null, y)
              }else {
                return and__3546__auto____11249
              }
            }else {
              return and__3546__auto____11247
            }
          }else {
            return and__3546__auto____11246
          }
        }())
      };
      var ep2__11465 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____11250 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____11250)) {
            var and__3546__auto____11252 = p1.call(null, y);
            if(cljs.core.truth_(and__3546__auto____11252)) {
              var and__3546__auto____11253 = p1.call(null, z);
              if(cljs.core.truth_(and__3546__auto____11253)) {
                var and__3546__auto____11255 = p2.call(null, x);
                if(cljs.core.truth_(and__3546__auto____11255)) {
                  var and__3546__auto____11257 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____11257)) {
                    return p2.call(null, z)
                  }else {
                    return and__3546__auto____11257
                  }
                }else {
                  return and__3546__auto____11255
                }
              }else {
                return and__3546__auto____11253
              }
            }else {
              return and__3546__auto____11252
            }
          }else {
            return and__3546__auto____11250
          }
        }())
      };
      var ep2__11466 = function() {
        var G__11473__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____11261 = ep2.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____11261)) {
              return cljs.core.every_QMARK_.call(null, function(p1__11072_SHARP_) {
                var and__3546__auto____11264 = p1.call(null, p1__11072_SHARP_);
                if(cljs.core.truth_(and__3546__auto____11264)) {
                  return p2.call(null, p1__11072_SHARP_)
                }else {
                  return and__3546__auto____11264
                }
              }, args)
            }else {
              return and__3546__auto____11261
            }
          }())
        };
        var G__11473 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__11473__delegate.call(this, x, y, z, args)
        };
        G__11473.cljs$lang$maxFixedArity = 3;
        G__11473.cljs$lang$applyTo = function(arglist__11478) {
          var x = cljs.core.first(arglist__11478);
          var y = cljs.core.first(cljs.core.next(arglist__11478));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11478)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11478)));
          return G__11473__delegate.call(this, x, y, z, args)
        };
        return G__11473
      }();
      ep2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep2__11462.call(this);
          case 1:
            return ep2__11463.call(this, x);
          case 2:
            return ep2__11464.call(this, x, y);
          case 3:
            return ep2__11465.call(this, x, y, z);
          default:
            return ep2__11466.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep2.cljs$lang$maxFixedArity = 3;
      ep2.cljs$lang$applyTo = ep2__11466.cljs$lang$applyTo;
      return ep2
    }()
  };
  var every_pred__11433 = function(p1, p2, p3) {
    return function() {
      var ep3 = null;
      var ep3__11482 = function() {
        return true
      };
      var ep3__11483 = function(x) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____11268 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____11268)) {
            var and__3546__auto____11269 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____11269)) {
              return p3.call(null, x)
            }else {
              return and__3546__auto____11269
            }
          }else {
            return and__3546__auto____11268
          }
        }())
      };
      var ep3__11484 = function(x, y) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____11276 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____11276)) {
            var and__3546__auto____11280 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____11280)) {
              var and__3546__auto____11282 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____11282)) {
                var and__3546__auto____11283 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____11283)) {
                  var and__3546__auto____11290 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____11290)) {
                    return p3.call(null, y)
                  }else {
                    return and__3546__auto____11290
                  }
                }else {
                  return and__3546__auto____11283
                }
              }else {
                return and__3546__auto____11282
              }
            }else {
              return and__3546__auto____11280
            }
          }else {
            return and__3546__auto____11276
          }
        }())
      };
      var ep3__11485 = function(x, y, z) {
        return cljs.core.boolean$.call(null, function() {
          var and__3546__auto____11293 = p1.call(null, x);
          if(cljs.core.truth_(and__3546__auto____11293)) {
            var and__3546__auto____11294 = p2.call(null, x);
            if(cljs.core.truth_(and__3546__auto____11294)) {
              var and__3546__auto____11295 = p3.call(null, x);
              if(cljs.core.truth_(and__3546__auto____11295)) {
                var and__3546__auto____11298 = p1.call(null, y);
                if(cljs.core.truth_(and__3546__auto____11298)) {
                  var and__3546__auto____11300 = p2.call(null, y);
                  if(cljs.core.truth_(and__3546__auto____11300)) {
                    var and__3546__auto____11303 = p3.call(null, y);
                    if(cljs.core.truth_(and__3546__auto____11303)) {
                      var and__3546__auto____11310 = p1.call(null, z);
                      if(cljs.core.truth_(and__3546__auto____11310)) {
                        var and__3546__auto____11312 = p2.call(null, z);
                        if(cljs.core.truth_(and__3546__auto____11312)) {
                          return p3.call(null, z)
                        }else {
                          return and__3546__auto____11312
                        }
                      }else {
                        return and__3546__auto____11310
                      }
                    }else {
                      return and__3546__auto____11303
                    }
                  }else {
                    return and__3546__auto____11300
                  }
                }else {
                  return and__3546__auto____11298
                }
              }else {
                return and__3546__auto____11295
              }
            }else {
              return and__3546__auto____11294
            }
          }else {
            return and__3546__auto____11293
          }
        }())
      };
      var ep3__11487 = function() {
        var G__11507__delegate = function(x, y, z, args) {
          return cljs.core.boolean$.call(null, function() {
            var and__3546__auto____11319 = ep3.call(null, x, y, z);
            if(cljs.core.truth_(and__3546__auto____11319)) {
              return cljs.core.every_QMARK_.call(null, function(p1__11073_SHARP_) {
                var and__3546__auto____11323 = p1.call(null, p1__11073_SHARP_);
                if(cljs.core.truth_(and__3546__auto____11323)) {
                  var and__3546__auto____11325 = p2.call(null, p1__11073_SHARP_);
                  if(cljs.core.truth_(and__3546__auto____11325)) {
                    return p3.call(null, p1__11073_SHARP_)
                  }else {
                    return and__3546__auto____11325
                  }
                }else {
                  return and__3546__auto____11323
                }
              }, args)
            }else {
              return and__3546__auto____11319
            }
          }())
        };
        var G__11507 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__11507__delegate.call(this, x, y, z, args)
        };
        G__11507.cljs$lang$maxFixedArity = 3;
        G__11507.cljs$lang$applyTo = function(arglist__11522) {
          var x = cljs.core.first(arglist__11522);
          var y = cljs.core.first(cljs.core.next(arglist__11522));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11522)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11522)));
          return G__11507__delegate.call(this, x, y, z, args)
        };
        return G__11507
      }();
      ep3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return ep3__11482.call(this);
          case 1:
            return ep3__11483.call(this, x);
          case 2:
            return ep3__11484.call(this, x, y);
          case 3:
            return ep3__11485.call(this, x, y, z);
          default:
            return ep3__11487.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      ep3.cljs$lang$maxFixedArity = 3;
      ep3.cljs$lang$applyTo = ep3__11487.cljs$lang$applyTo;
      return ep3
    }()
  };
  var every_pred__11434 = function() {
    var G__11530__delegate = function(p1, p2, p3, ps) {
      var ps__11342 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var epn = null;
        var epn__11531 = function() {
          return true
        };
        var epn__11532 = function(x) {
          return cljs.core.every_QMARK_.call(null, function(p1__11076_SHARP_) {
            return p1__11076_SHARP_.call(null, x)
          }, ps__11342)
        };
        var epn__11533 = function(x, y) {
          return cljs.core.every_QMARK_.call(null, function(p1__11082_SHARP_) {
            var and__3546__auto____11360 = p1__11082_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____11360)) {
              return p1__11082_SHARP_.call(null, y)
            }else {
              return and__3546__auto____11360
            }
          }, ps__11342)
        };
        var epn__11534 = function(x, y, z) {
          return cljs.core.every_QMARK_.call(null, function(p1__11083_SHARP_) {
            var and__3546__auto____11391 = p1__11083_SHARP_.call(null, x);
            if(cljs.core.truth_(and__3546__auto____11391)) {
              var and__3546__auto____11396 = p1__11083_SHARP_.call(null, y);
              if(cljs.core.truth_(and__3546__auto____11396)) {
                return p1__11083_SHARP_.call(null, z)
              }else {
                return and__3546__auto____11396
              }
            }else {
              return and__3546__auto____11391
            }
          }, ps__11342)
        };
        var epn__11535 = function() {
          var G__11549__delegate = function(x, y, z, args) {
            return cljs.core.boolean$.call(null, function() {
              var and__3546__auto____11407 = epn.call(null, x, y, z);
              if(cljs.core.truth_(and__3546__auto____11407)) {
                return cljs.core.every_QMARK_.call(null, function(p1__11187_SHARP_) {
                  return cljs.core.every_QMARK_.call(null, p1__11187_SHARP_, args)
                }, ps__11342)
              }else {
                return and__3546__auto____11407
              }
            }())
          };
          var G__11549 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__11549__delegate.call(this, x, y, z, args)
          };
          G__11549.cljs$lang$maxFixedArity = 3;
          G__11549.cljs$lang$applyTo = function(arglist__11550) {
            var x = cljs.core.first(arglist__11550);
            var y = cljs.core.first(cljs.core.next(arglist__11550));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11550)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11550)));
            return G__11549__delegate.call(this, x, y, z, args)
          };
          return G__11549
        }();
        epn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return epn__11531.call(this);
            case 1:
              return epn__11532.call(this, x);
            case 2:
              return epn__11533.call(this, x, y);
            case 3:
              return epn__11534.call(this, x, y, z);
            default:
              return epn__11535.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        epn.cljs$lang$maxFixedArity = 3;
        epn.cljs$lang$applyTo = epn__11535.cljs$lang$applyTo;
        return epn
      }()
    };
    var G__11530 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__11530__delegate.call(this, p1, p2, p3, ps)
    };
    G__11530.cljs$lang$maxFixedArity = 3;
    G__11530.cljs$lang$applyTo = function(arglist__11553) {
      var p1 = cljs.core.first(arglist__11553);
      var p2 = cljs.core.first(cljs.core.next(arglist__11553));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11553)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11553)));
      return G__11530__delegate.call(this, p1, p2, p3, ps)
    };
    return G__11530
  }();
  every_pred = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return every_pred__11431.call(this, p1);
      case 2:
        return every_pred__11432.call(this, p1, p2);
      case 3:
        return every_pred__11433.call(this, p1, p2, p3);
      default:
        return every_pred__11434.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  every_pred.cljs$lang$maxFixedArity = 3;
  every_pred.cljs$lang$applyTo = every_pred__11434.cljs$lang$applyTo;
  return every_pred
}();
cljs.core.some_fn = function() {
  var some_fn = null;
  var some_fn__11691 = function(p) {
    return function() {
      var sp1 = null;
      var sp1__11696 = function() {
        return null
      };
      var sp1__11697 = function(x) {
        return p.call(null, x)
      };
      var sp1__11699 = function(x, y) {
        var or__3548__auto____11570 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____11570)) {
          return or__3548__auto____11570
        }else {
          return p.call(null, y)
        }
      };
      var sp1__11700 = function(x, y, z) {
        var or__3548__auto____11571 = p.call(null, x);
        if(cljs.core.truth_(or__3548__auto____11571)) {
          return or__3548__auto____11571
        }else {
          var or__3548__auto____11572 = p.call(null, y);
          if(cljs.core.truth_(or__3548__auto____11572)) {
            return or__3548__auto____11572
          }else {
            return p.call(null, z)
          }
        }
      };
      var sp1__11701 = function() {
        var G__11705__delegate = function(x, y, z, args) {
          var or__3548__auto____11574 = sp1.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____11574)) {
            return or__3548__auto____11574
          }else {
            return cljs.core.some.call(null, p, args)
          }
        };
        var G__11705 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__11705__delegate.call(this, x, y, z, args)
        };
        G__11705.cljs$lang$maxFixedArity = 3;
        G__11705.cljs$lang$applyTo = function(arglist__11708) {
          var x = cljs.core.first(arglist__11708);
          var y = cljs.core.first(cljs.core.next(arglist__11708));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11708)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11708)));
          return G__11705__delegate.call(this, x, y, z, args)
        };
        return G__11705
      }();
      sp1 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp1__11696.call(this);
          case 1:
            return sp1__11697.call(this, x);
          case 2:
            return sp1__11699.call(this, x, y);
          case 3:
            return sp1__11700.call(this, x, y, z);
          default:
            return sp1__11701.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp1.cljs$lang$maxFixedArity = 3;
      sp1.cljs$lang$applyTo = sp1__11701.cljs$lang$applyTo;
      return sp1
    }()
  };
  var some_fn__11692 = function(p1, p2) {
    return function() {
      var sp2 = null;
      var sp2__11712 = function() {
        return null
      };
      var sp2__11713 = function(x) {
        var or__3548__auto____11576 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____11576)) {
          return or__3548__auto____11576
        }else {
          return p2.call(null, x)
        }
      };
      var sp2__11714 = function(x, y) {
        var or__3548__auto____11578 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____11578)) {
          return or__3548__auto____11578
        }else {
          var or__3548__auto____11579 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____11579)) {
            return or__3548__auto____11579
          }else {
            var or__3548__auto____11581 = p2.call(null, x);
            if(cljs.core.truth_(or__3548__auto____11581)) {
              return or__3548__auto____11581
            }else {
              return p2.call(null, y)
            }
          }
        }
      };
      var sp2__11715 = function(x, y, z) {
        var or__3548__auto____11583 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____11583)) {
          return or__3548__auto____11583
        }else {
          var or__3548__auto____11584 = p1.call(null, y);
          if(cljs.core.truth_(or__3548__auto____11584)) {
            return or__3548__auto____11584
          }else {
            var or__3548__auto____11585 = p1.call(null, z);
            if(cljs.core.truth_(or__3548__auto____11585)) {
              return or__3548__auto____11585
            }else {
              var or__3548__auto____11587 = p2.call(null, x);
              if(cljs.core.truth_(or__3548__auto____11587)) {
                return or__3548__auto____11587
              }else {
                var or__3548__auto____11588 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____11588)) {
                  return or__3548__auto____11588
                }else {
                  return p2.call(null, z)
                }
              }
            }
          }
        }
      };
      var sp2__11716 = function() {
        var G__11723__delegate = function(x, y, z, args) {
          var or__3548__auto____11622 = sp2.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____11622)) {
            return or__3548__auto____11622
          }else {
            return cljs.core.some.call(null, function(p1__11223_SHARP_) {
              var or__3548__auto____11629 = p1.call(null, p1__11223_SHARP_);
              if(cljs.core.truth_(or__3548__auto____11629)) {
                return or__3548__auto____11629
              }else {
                return p2.call(null, p1__11223_SHARP_)
              }
            }, args)
          }
        };
        var G__11723 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__11723__delegate.call(this, x, y, z, args)
        };
        G__11723.cljs$lang$maxFixedArity = 3;
        G__11723.cljs$lang$applyTo = function(arglist__11727) {
          var x = cljs.core.first(arglist__11727);
          var y = cljs.core.first(cljs.core.next(arglist__11727));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11727)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11727)));
          return G__11723__delegate.call(this, x, y, z, args)
        };
        return G__11723
      }();
      sp2 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp2__11712.call(this);
          case 1:
            return sp2__11713.call(this, x);
          case 2:
            return sp2__11714.call(this, x, y);
          case 3:
            return sp2__11715.call(this, x, y, z);
          default:
            return sp2__11716.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp2.cljs$lang$maxFixedArity = 3;
      sp2.cljs$lang$applyTo = sp2__11716.cljs$lang$applyTo;
      return sp2
    }()
  };
  var some_fn__11693 = function(p1, p2, p3) {
    return function() {
      var sp3 = null;
      var sp3__11733 = function() {
        return null
      };
      var sp3__11734 = function(x) {
        var or__3548__auto____11637 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____11637)) {
          return or__3548__auto____11637
        }else {
          var or__3548__auto____11641 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____11641)) {
            return or__3548__auto____11641
          }else {
            return p3.call(null, x)
          }
        }
      };
      var sp3__11735 = function(x, y) {
        var or__3548__auto____11643 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____11643)) {
          return or__3548__auto____11643
        }else {
          var or__3548__auto____11645 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____11645)) {
            return or__3548__auto____11645
          }else {
            var or__3548__auto____11648 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____11648)) {
              return or__3548__auto____11648
            }else {
              var or__3548__auto____11652 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____11652)) {
                return or__3548__auto____11652
              }else {
                var or__3548__auto____11654 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____11654)) {
                  return or__3548__auto____11654
                }else {
                  return p3.call(null, y)
                }
              }
            }
          }
        }
      };
      var sp3__11736 = function(x, y, z) {
        var or__3548__auto____11657 = p1.call(null, x);
        if(cljs.core.truth_(or__3548__auto____11657)) {
          return or__3548__auto____11657
        }else {
          var or__3548__auto____11658 = p2.call(null, x);
          if(cljs.core.truth_(or__3548__auto____11658)) {
            return or__3548__auto____11658
          }else {
            var or__3548__auto____11659 = p3.call(null, x);
            if(cljs.core.truth_(or__3548__auto____11659)) {
              return or__3548__auto____11659
            }else {
              var or__3548__auto____11660 = p1.call(null, y);
              if(cljs.core.truth_(or__3548__auto____11660)) {
                return or__3548__auto____11660
              }else {
                var or__3548__auto____11661 = p2.call(null, y);
                if(cljs.core.truth_(or__3548__auto____11661)) {
                  return or__3548__auto____11661
                }else {
                  var or__3548__auto____11663 = p3.call(null, y);
                  if(cljs.core.truth_(or__3548__auto____11663)) {
                    return or__3548__auto____11663
                  }else {
                    var or__3548__auto____11664 = p1.call(null, z);
                    if(cljs.core.truth_(or__3548__auto____11664)) {
                      return or__3548__auto____11664
                    }else {
                      var or__3548__auto____11666 = p2.call(null, z);
                      if(cljs.core.truth_(or__3548__auto____11666)) {
                        return or__3548__auto____11666
                      }else {
                        return p3.call(null, z)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      var sp3__11737 = function() {
        var G__11754__delegate = function(x, y, z, args) {
          var or__3548__auto____11675 = sp3.call(null, x, y, z);
          if(cljs.core.truth_(or__3548__auto____11675)) {
            return or__3548__auto____11675
          }else {
            return cljs.core.some.call(null, function(p1__11226_SHARP_) {
              var or__3548__auto____11676 = p1.call(null, p1__11226_SHARP_);
              if(cljs.core.truth_(or__3548__auto____11676)) {
                return or__3548__auto____11676
              }else {
                var or__3548__auto____11677 = p2.call(null, p1__11226_SHARP_);
                if(cljs.core.truth_(or__3548__auto____11677)) {
                  return or__3548__auto____11677
                }else {
                  return p3.call(null, p1__11226_SHARP_)
                }
              }
            }, args)
          }
        };
        var G__11754 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__11754__delegate.call(this, x, y, z, args)
        };
        G__11754.cljs$lang$maxFixedArity = 3;
        G__11754.cljs$lang$applyTo = function(arglist__11759) {
          var x = cljs.core.first(arglist__11759);
          var y = cljs.core.first(cljs.core.next(arglist__11759));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11759)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11759)));
          return G__11754__delegate.call(this, x, y, z, args)
        };
        return G__11754
      }();
      sp3 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return sp3__11733.call(this);
          case 1:
            return sp3__11734.call(this, x);
          case 2:
            return sp3__11735.call(this, x, y);
          case 3:
            return sp3__11736.call(this, x, y, z);
          default:
            return sp3__11737.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      sp3.cljs$lang$maxFixedArity = 3;
      sp3.cljs$lang$applyTo = sp3__11737.cljs$lang$applyTo;
      return sp3
    }()
  };
  var some_fn__11694 = function() {
    var G__11763__delegate = function(p1, p2, p3, ps) {
      var ps__11680 = cljs.core.list_STAR_.call(null, p1, p2, p3, ps);
      return function() {
        var spn = null;
        var spn__11764 = function() {
          return null
        };
        var spn__11765 = function(x) {
          return cljs.core.some.call(null, function(p1__11227_SHARP_) {
            return p1__11227_SHARP_.call(null, x)
          }, ps__11680)
        };
        var spn__11766 = function(x, y) {
          return cljs.core.some.call(null, function(p1__11230_SHARP_) {
            var or__3548__auto____11681 = p1__11230_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____11681)) {
              return or__3548__auto____11681
            }else {
              return p1__11230_SHARP_.call(null, y)
            }
          }, ps__11680)
        };
        var spn__11767 = function(x, y, z) {
          return cljs.core.some.call(null, function(p1__11231_SHARP_) {
            var or__3548__auto____11682 = p1__11231_SHARP_.call(null, x);
            if(cljs.core.truth_(or__3548__auto____11682)) {
              return or__3548__auto____11682
            }else {
              var or__3548__auto____11683 = p1__11231_SHARP_.call(null, y);
              if(cljs.core.truth_(or__3548__auto____11683)) {
                return or__3548__auto____11683
              }else {
                return p1__11231_SHARP_.call(null, z)
              }
            }
          }, ps__11680)
        };
        var spn__11768 = function() {
          var G__11788__delegate = function(x, y, z, args) {
            var or__3548__auto____11687 = spn.call(null, x, y, z);
            if(cljs.core.truth_(or__3548__auto____11687)) {
              return or__3548__auto____11687
            }else {
              return cljs.core.some.call(null, function(p1__11232_SHARP_) {
                return cljs.core.some.call(null, p1__11232_SHARP_, args)
              }, ps__11680)
            }
          };
          var G__11788 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__11788__delegate.call(this, x, y, z, args)
          };
          G__11788.cljs$lang$maxFixedArity = 3;
          G__11788.cljs$lang$applyTo = function(arglist__11791) {
            var x = cljs.core.first(arglist__11791);
            var y = cljs.core.first(cljs.core.next(arglist__11791));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11791)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11791)));
            return G__11788__delegate.call(this, x, y, z, args)
          };
          return G__11788
        }();
        spn = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return spn__11764.call(this);
            case 1:
              return spn__11765.call(this, x);
            case 2:
              return spn__11766.call(this, x, y);
            case 3:
              return spn__11767.call(this, x, y, z);
            default:
              return spn__11768.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        spn.cljs$lang$maxFixedArity = 3;
        spn.cljs$lang$applyTo = spn__11768.cljs$lang$applyTo;
        return spn
      }()
    };
    var G__11763 = function(p1, p2, p3, var_args) {
      var ps = null;
      if(goog.isDef(var_args)) {
        ps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__11763__delegate.call(this, p1, p2, p3, ps)
    };
    G__11763.cljs$lang$maxFixedArity = 3;
    G__11763.cljs$lang$applyTo = function(arglist__11796) {
      var p1 = cljs.core.first(arglist__11796);
      var p2 = cljs.core.first(cljs.core.next(arglist__11796));
      var p3 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11796)));
      var ps = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__11796)));
      return G__11763__delegate.call(this, p1, p2, p3, ps)
    };
    return G__11763
  }();
  some_fn = function(p1, p2, p3, var_args) {
    var ps = var_args;
    switch(arguments.length) {
      case 1:
        return some_fn__11691.call(this, p1);
      case 2:
        return some_fn__11692.call(this, p1, p2);
      case 3:
        return some_fn__11693.call(this, p1, p2, p3);
      default:
        return some_fn__11694.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  some_fn.cljs$lang$maxFixedArity = 3;
  some_fn.cljs$lang$applyTo = some_fn__11694.cljs$lang$applyTo;
  return some_fn
}();
cljs.core.map = function() {
  var map = null;
  var map__11848 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____11808 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____11808)) {
        var s__11814 = temp__3698__auto____11808;
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s__11814)), map.call(null, f, cljs.core.rest.call(null, s__11814)))
      }else {
        return null
      }
    })
  };
  var map__11850 = function(f, c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__11822 = cljs.core.seq.call(null, c1);
      var s2__11823 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____11830 = s1__11822;
        if(cljs.core.truth_(and__3546__auto____11830)) {
          return s2__11823
        }else {
          return and__3546__auto____11830
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__11822), cljs.core.first.call(null, s2__11823)), map.call(null, f, cljs.core.rest.call(null, s1__11822), cljs.core.rest.call(null, s2__11823)))
      }else {
        return null
      }
    })
  };
  var map__11851 = function(f, c1, c2, c3) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__11833 = cljs.core.seq.call(null, c1);
      var s2__11834 = cljs.core.seq.call(null, c2);
      var s3__11835 = cljs.core.seq.call(null, c3);
      if(cljs.core.truth_(function() {
        var and__3546__auto____11836 = s1__11833;
        if(cljs.core.truth_(and__3546__auto____11836)) {
          var and__3546__auto____11837 = s2__11834;
          if(cljs.core.truth_(and__3546__auto____11837)) {
            return s3__11835
          }else {
            return and__3546__auto____11837
          }
        }else {
          return and__3546__auto____11836
        }
      }())) {
        return cljs.core.cons.call(null, f.call(null, cljs.core.first.call(null, s1__11833), cljs.core.first.call(null, s2__11834), cljs.core.first.call(null, s3__11835)), map.call(null, f, cljs.core.rest.call(null, s1__11833), cljs.core.rest.call(null, s2__11834), cljs.core.rest.call(null, s3__11835)))
      }else {
        return null
      }
    })
  };
  var map__11853 = function() {
    var G__11945__delegate = function(f, c1, c2, c3, colls) {
      var step__11846 = function step(cs) {
        return new cljs.core.LazySeq(null, false, function() {
          var ss__11844 = map.call(null, cljs.core.seq, cs);
          if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__11844))) {
            return cljs.core.cons.call(null, map.call(null, cljs.core.first, ss__11844), step.call(null, map.call(null, cljs.core.rest, ss__11844)))
          }else {
            return null
          }
        })
      };
      return map.call(null, function(p1__11558_SHARP_) {
        return cljs.core.apply.call(null, f, p1__11558_SHARP_)
      }, step__11846.call(null, cljs.core.conj.call(null, colls, c3, c2, c1)))
    };
    var G__11945 = function(f, c1, c2, c3, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 4), 0)
      }
      return G__11945__delegate.call(this, f, c1, c2, c3, colls)
    };
    G__11945.cljs$lang$maxFixedArity = 4;
    G__11945.cljs$lang$applyTo = function(arglist__11953) {
      var f = cljs.core.first(arglist__11953);
      var c1 = cljs.core.first(cljs.core.next(arglist__11953));
      var c2 = cljs.core.first(cljs.core.next(cljs.core.next(arglist__11953)));
      var c3 = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__11953))));
      var colls = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(arglist__11953))));
      return G__11945__delegate.call(this, f, c1, c2, c3, colls)
    };
    return G__11945
  }();
  map = function(f, c1, c2, c3, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return map__11848.call(this, f, c1);
      case 3:
        return map__11850.call(this, f, c1, c2);
      case 4:
        return map__11851.call(this, f, c1, c2, c3);
      default:
        return map__11853.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  map.cljs$lang$maxFixedArity = 4;
  map.cljs$lang$applyTo = map__11853.cljs$lang$applyTo;
  return map
}();
cljs.core.take = function take(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    if(cljs.core.truth_(n > 0)) {
      var temp__3698__auto____11957 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____11957)) {
        var s__11958 = temp__3698__auto____11957;
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__11958), take.call(null, n - 1, cljs.core.rest.call(null, s__11958)))
      }else {
        return null
      }
    }else {
      return null
    }
  })
};
cljs.core.drop = function drop(n, coll) {
  var step__11969 = function(n, coll) {
    while(true) {
      var s__11965 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____11967 = n > 0;
        if(cljs.core.truth_(and__3546__auto____11967)) {
          return s__11965
        }else {
          return and__3546__auto____11967
        }
      }())) {
        var G__11974 = n - 1;
        var G__11975 = cljs.core.rest.call(null, s__11965);
        n = G__11974;
        coll = G__11975;
        continue
      }else {
        return s__11965
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__11969.call(null, n, coll)
  })
};
cljs.core.drop_last = function() {
  var drop_last = null;
  var drop_last__11979 = function(s) {
    return drop_last.call(null, 1, s)
  };
  var drop_last__11980 = function(n, s) {
    return cljs.core.map.call(null, function(x, _) {
      return x
    }, s, cljs.core.drop.call(null, n, s))
  };
  drop_last = function(n, s) {
    switch(arguments.length) {
      case 1:
        return drop_last__11979.call(this, n);
      case 2:
        return drop_last__11980.call(this, n, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return drop_last
}();
cljs.core.take_last = function take_last(n, coll) {
  var s__11988 = cljs.core.seq.call(null, coll);
  var lead__11989 = cljs.core.seq.call(null, cljs.core.drop.call(null, n, coll));
  while(true) {
    if(cljs.core.truth_(lead__11989)) {
      var G__11995 = cljs.core.next.call(null, s__11988);
      var G__11997 = cljs.core.next.call(null, lead__11989);
      s__11988 = G__11995;
      lead__11989 = G__11997;
      continue
    }else {
      return s__11988
    }
    break
  }
};
cljs.core.drop_while = function drop_while(pred, coll) {
  var step__12002 = function(pred, coll) {
    while(true) {
      var s__12000 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(function() {
        var and__3546__auto____12001 = s__12000;
        if(cljs.core.truth_(and__3546__auto____12001)) {
          return pred.call(null, cljs.core.first.call(null, s__12000))
        }else {
          return and__3546__auto____12001
        }
      }())) {
        var G__12006 = pred;
        var G__12007 = cljs.core.rest.call(null, s__12000);
        pred = G__12006;
        coll = G__12007;
        continue
      }else {
        return s__12000
      }
      break
    }
  };
  return new cljs.core.LazySeq(null, false, function() {
    return step__12002.call(null, pred, coll)
  })
};
cljs.core.cycle = function cycle(coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____12013 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____12013)) {
      var s__12014 = temp__3698__auto____12013;
      return cljs.core.concat.call(null, s__12014, cycle.call(null, s__12014))
    }else {
      return null
    }
  })
};
cljs.core.split_at = function split_at(n, coll) {
  return cljs.core.Vector.fromArray([cljs.core.take.call(null, n, coll), cljs.core.drop.call(null, n, coll)])
};
cljs.core.repeat = function() {
  var repeat = null;
  var repeat__12026 = function(x) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, x, repeat.call(null, x))
    })
  };
  var repeat__12027 = function(n, x) {
    return cljs.core.take.call(null, n, repeat.call(null, x))
  };
  repeat = function(n, x) {
    switch(arguments.length) {
      case 1:
        return repeat__12026.call(this, n);
      case 2:
        return repeat__12027.call(this, n, x)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return repeat
}();
cljs.core.replicate = function replicate(n, x) {
  return cljs.core.take.call(null, n, cljs.core.repeat.call(null, x))
};
cljs.core.repeatedly = function() {
  var repeatedly = null;
  var repeatedly__12042 = function(f) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, f.call(null), repeatedly.call(null, f))
    })
  };
  var repeatedly__12043 = function(n, f) {
    return cljs.core.take.call(null, n, repeatedly.call(null, f))
  };
  repeatedly = function(n, f) {
    switch(arguments.length) {
      case 1:
        return repeatedly__12042.call(this, n);
      case 2:
        return repeatedly__12043.call(this, n, f)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return repeatedly
}();
cljs.core.iterate = function iterate(f, x) {
  return cljs.core.cons.call(null, x, new cljs.core.LazySeq(null, false, function() {
    return iterate.call(null, f, f.call(null, x))
  }))
};
cljs.core.interleave = function() {
  var interleave = null;
  var interleave__12063 = function(c1, c2) {
    return new cljs.core.LazySeq(null, false, function() {
      var s1__12052 = cljs.core.seq.call(null, c1);
      var s2__12053 = cljs.core.seq.call(null, c2);
      if(cljs.core.truth_(function() {
        var and__3546__auto____12054 = s1__12052;
        if(cljs.core.truth_(and__3546__auto____12054)) {
          return s2__12053
        }else {
          return and__3546__auto____12054
        }
      }())) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s1__12052), cljs.core.cons.call(null, cljs.core.first.call(null, s2__12053), interleave.call(null, cljs.core.rest.call(null, s1__12052), cljs.core.rest.call(null, s2__12053))))
      }else {
        return null
      }
    })
  };
  var interleave__12064 = function() {
    var G__12092__delegate = function(c1, c2, colls) {
      return new cljs.core.LazySeq(null, false, function() {
        var ss__12056 = cljs.core.map.call(null, cljs.core.seq, cljs.core.conj.call(null, colls, c2, c1));
        if(cljs.core.truth_(cljs.core.every_QMARK_.call(null, cljs.core.identity, ss__12056))) {
          return cljs.core.concat.call(null, cljs.core.map.call(null, cljs.core.first, ss__12056), cljs.core.apply.call(null, interleave, cljs.core.map.call(null, cljs.core.rest, ss__12056)))
        }else {
          return null
        }
      })
    };
    var G__12092 = function(c1, c2, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__12092__delegate.call(this, c1, c2, colls)
    };
    G__12092.cljs$lang$maxFixedArity = 2;
    G__12092.cljs$lang$applyTo = function(arglist__12094) {
      var c1 = cljs.core.first(arglist__12094);
      var c2 = cljs.core.first(cljs.core.next(arglist__12094));
      var colls = cljs.core.rest(cljs.core.next(arglist__12094));
      return G__12092__delegate.call(this, c1, c2, colls)
    };
    return G__12092
  }();
  interleave = function(c1, c2, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return interleave__12063.call(this, c1, c2);
      default:
        return interleave__12064.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  interleave.cljs$lang$maxFixedArity = 2;
  interleave.cljs$lang$applyTo = interleave__12064.cljs$lang$applyTo;
  return interleave
}();
cljs.core.interpose = function interpose(sep, coll) {
  return cljs.core.drop.call(null, 1, cljs.core.interleave.call(null, cljs.core.repeat.call(null, sep), coll))
};
cljs.core.flatten1 = function flatten1(colls) {
  var cat__12104 = function cat(coll, colls) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____12100 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____12100)) {
        var coll__12101 = temp__3695__auto____12100;
        return cljs.core.cons.call(null, cljs.core.first.call(null, coll__12101), cat.call(null, cljs.core.rest.call(null, coll__12101), colls))
      }else {
        if(cljs.core.truth_(cljs.core.seq.call(null, colls))) {
          return cat.call(null, cljs.core.first.call(null, colls), cljs.core.rest.call(null, colls))
        }else {
          return null
        }
      }
    })
  };
  return cat__12104.call(null, null, colls)
};
cljs.core.mapcat = function() {
  var mapcat = null;
  var mapcat__12117 = function(f, coll) {
    return cljs.core.flatten1.call(null, cljs.core.map.call(null, f, coll))
  };
  var mapcat__12118 = function() {
    var G__12120__delegate = function(f, coll, colls) {
      return cljs.core.flatten1.call(null, cljs.core.apply.call(null, cljs.core.map, f, coll, colls))
    };
    var G__12120 = function(f, coll, var_args) {
      var colls = null;
      if(goog.isDef(var_args)) {
        colls = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
      }
      return G__12120__delegate.call(this, f, coll, colls)
    };
    G__12120.cljs$lang$maxFixedArity = 2;
    G__12120.cljs$lang$applyTo = function(arglist__12121) {
      var f = cljs.core.first(arglist__12121);
      var coll = cljs.core.first(cljs.core.next(arglist__12121));
      var colls = cljs.core.rest(cljs.core.next(arglist__12121));
      return G__12120__delegate.call(this, f, coll, colls)
    };
    return G__12120
  }();
  mapcat = function(f, coll, var_args) {
    var colls = var_args;
    switch(arguments.length) {
      case 2:
        return mapcat__12117.call(this, f, coll);
      default:
        return mapcat__12118.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  mapcat.cljs$lang$maxFixedArity = 2;
  mapcat.cljs$lang$applyTo = mapcat__12118.cljs$lang$applyTo;
  return mapcat
}();
cljs.core.filter = function filter(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____12124 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____12124)) {
      var s__12125 = temp__3698__auto____12124;
      var f__12126 = cljs.core.first.call(null, s__12125);
      var r__12127 = cljs.core.rest.call(null, s__12125);
      if(cljs.core.truth_(pred.call(null, f__12126))) {
        return cljs.core.cons.call(null, f__12126, filter.call(null, pred, r__12127))
      }else {
        return filter.call(null, pred, r__12127)
      }
    }else {
      return null
    }
  })
};
cljs.core.remove = function remove(pred, coll) {
  return cljs.core.filter.call(null, cljs.core.complement.call(null, pred), coll)
};
cljs.core.tree_seq = function tree_seq(branch_QMARK_, children, root) {
  var walk__12135 = function walk(node) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, node, cljs.core.truth_(branch_QMARK_.call(null, node)) ? cljs.core.mapcat.call(null, walk, children.call(null, node)) : null)
    })
  };
  return walk__12135.call(null, root)
};
cljs.core.flatten = function flatten(x) {
  return cljs.core.filter.call(null, function(p1__12133_SHARP_) {
    return cljs.core.not.call(null, cljs.core.sequential_QMARK_.call(null, p1__12133_SHARP_))
  }, cljs.core.rest.call(null, cljs.core.tree_seq.call(null, cljs.core.sequential_QMARK_, cljs.core.seq, x)))
};
cljs.core.into = function into(to, from) {
  return cljs.core.reduce.call(null, cljs.core._conj, to, from)
};
cljs.core.partition = function() {
  var partition = null;
  var partition__12157 = function(n, coll) {
    return partition.call(null, n, n, coll)
  };
  var partition__12158 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____12147 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____12147)) {
        var s__12150 = temp__3698__auto____12147;
        var p__12153 = cljs.core.take.call(null, n, s__12150);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__12153)))) {
          return cljs.core.cons.call(null, p__12153, partition.call(null, n, step, cljs.core.drop.call(null, step, s__12150)))
        }else {
          return null
        }
      }else {
        return null
      }
    })
  };
  var partition__12159 = function(n, step, pad, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____12154 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____12154)) {
        var s__12155 = temp__3698__auto____12154;
        var p__12156 = cljs.core.take.call(null, n, s__12155);
        if(cljs.core.truth_(cljs.core._EQ_.call(null, n, cljs.core.count.call(null, p__12156)))) {
          return cljs.core.cons.call(null, p__12156, partition.call(null, n, step, pad, cljs.core.drop.call(null, step, s__12155)))
        }else {
          return cljs.core.list.call(null, cljs.core.take.call(null, n, cljs.core.concat.call(null, p__12156, pad)))
        }
      }else {
        return null
      }
    })
  };
  partition = function(n, step, pad, coll) {
    switch(arguments.length) {
      case 2:
        return partition__12157.call(this, n, step);
      case 3:
        return partition__12158.call(this, n, step, pad);
      case 4:
        return partition__12159.call(this, n, step, pad, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition
}();
cljs.core.get_in = function() {
  var get_in = null;
  var get_in__12168 = function(m, ks) {
    return cljs.core.reduce.call(null, cljs.core.get, m, ks)
  };
  var get_in__12170 = function(m, ks, not_found) {
    var sentinel__12161 = cljs.core.lookup_sentinel;
    var m__12162 = m;
    var ks__12163 = cljs.core.seq.call(null, ks);
    while(true) {
      if(cljs.core.truth_(ks__12163)) {
        var m__12164 = cljs.core.get.call(null, m__12162, cljs.core.first.call(null, ks__12163), sentinel__12161);
        if(cljs.core.truth_(sentinel__12161 === m__12164)) {
          return not_found
        }else {
          var G__12174 = sentinel__12161;
          var G__12176 = m__12164;
          var G__12177 = cljs.core.next.call(null, ks__12163);
          sentinel__12161 = G__12174;
          m__12162 = G__12176;
          ks__12163 = G__12177;
          continue
        }
      }else {
        return m__12162
      }
      break
    }
  };
  get_in = function(m, ks, not_found) {
    switch(arguments.length) {
      case 2:
        return get_in__12168.call(this, m, ks);
      case 3:
        return get_in__12170.call(this, m, ks, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return get_in
}();
cljs.core.assoc_in = function assoc_in(m, p__12181, v) {
  var vec__12182__12183 = p__12181;
  var k__12184 = cljs.core.nth.call(null, vec__12182__12183, 0, null);
  var ks__12185 = cljs.core.nthnext.call(null, vec__12182__12183, 1);
  if(cljs.core.truth_(ks__12185)) {
    return cljs.core.assoc.call(null, m, k__12184, assoc_in.call(null, cljs.core.get.call(null, m, k__12184), ks__12185, v))
  }else {
    return cljs.core.assoc.call(null, m, k__12184, v)
  }
};
cljs.core.update_in = function() {
  var update_in__delegate = function(m, p__12191, f, args) {
    var vec__12192__12193 = p__12191;
    var k__12194 = cljs.core.nth.call(null, vec__12192__12193, 0, null);
    var ks__12195 = cljs.core.nthnext.call(null, vec__12192__12193, 1);
    if(cljs.core.truth_(ks__12195)) {
      return cljs.core.assoc.call(null, m, k__12194, cljs.core.apply.call(null, update_in, cljs.core.get.call(null, m, k__12194), ks__12195, f, args))
    }else {
      return cljs.core.assoc.call(null, m, k__12194, cljs.core.apply.call(null, f, cljs.core.get.call(null, m, k__12194), args))
    }
  };
  var update_in = function(m, p__12191, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
    }
    return update_in__delegate.call(this, m, p__12191, f, args)
  };
  update_in.cljs$lang$maxFixedArity = 3;
  update_in.cljs$lang$applyTo = function(arglist__12196) {
    var m = cljs.core.first(arglist__12196);
    var p__12191 = cljs.core.first(cljs.core.next(arglist__12196));
    var f = cljs.core.first(cljs.core.next(cljs.core.next(arglist__12196)));
    var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__12196)));
    return update_in__delegate.call(this, m, p__12191, f, args)
  };
  return update_in
}();
cljs.core.Vector = function(meta, array) {
  this.meta = meta;
  this.array = array
};
cljs.core.Vector.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.Vector")
};
cljs.core.Vector.prototype.cljs$core$IHash$ = true;
cljs.core.Vector.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__12237 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Vector.prototype.cljs$core$ILookup$ = true;
cljs.core.Vector.prototype.cljs$core$ILookup$_lookup = function() {
  var G__12408 = null;
  var G__12408__12409 = function(coll, k) {
    var this__12238 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__12408__12410 = function(coll, k, not_found) {
    var this__12239 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__12408 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__12408__12409.call(this, coll, k);
      case 3:
        return G__12408__12410.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__12408
}();
cljs.core.Vector.prototype.cljs$core$IAssociative$ = true;
cljs.core.Vector.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__12240 = this;
  var new_array__12241 = cljs.core.aclone.call(null, this__12240.array);
  new_array__12241[k] = v;
  return new cljs.core.Vector(this__12240.meta, new_array__12241)
};
cljs.core.Vector.prototype.cljs$core$IFn$ = true;
cljs.core.Vector.prototype.call = function() {
  var G__12415 = null;
  var G__12415__12416 = function(coll, k) {
    var this__12242 = this;
    coll = this;
    return cljs.core._lookup.call(null, coll, k)
  };
  var G__12415__12427 = function(coll, k, not_found) {
    var this__12243 = this;
    coll = this;
    return cljs.core._lookup.call(null, coll, k, not_found)
  };
  G__12415 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__12415__12416.call(this, coll, k);
      case 3:
        return G__12415__12427.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__12415
}();
cljs.core.Vector.prototype.cljs$core$ISequential$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$ = true;
cljs.core.Vector.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__12245 = this;
  var new_array__12248 = cljs.core.aclone.call(null, this__12245.array);
  new_array__12248.push(o);
  return new cljs.core.Vector(this__12245.meta, new_array__12248)
};
cljs.core.Vector.prototype.cljs$core$IReduce$ = true;
cljs.core.Vector.prototype.cljs$core$IReduce$_reduce = function() {
  var G__12434 = null;
  var G__12434__12435 = function(v, f) {
    var this__12251 = this;
    return cljs.core.ci_reduce.call(null, this__12251.array, f)
  };
  var G__12434__12437 = function(v, f, start) {
    var this__12252 = this;
    return cljs.core.ci_reduce.call(null, this__12252.array, f, start)
  };
  G__12434 = function(v, f, start) {
    switch(arguments.length) {
      case 2:
        return G__12434__12435.call(this, v, f);
      case 3:
        return G__12434__12437.call(this, v, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__12434
}();
cljs.core.Vector.prototype.cljs$core$ISeqable$ = true;
cljs.core.Vector.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__12253 = this;
  if(cljs.core.truth_(this__12253.array.length > 0)) {
    var vector_seq__12254 = function vector_seq(i) {
      return new cljs.core.LazySeq(null, false, function() {
        if(cljs.core.truth_(i < this__12253.array.length)) {
          return cljs.core.cons.call(null, this__12253.array[i], vector_seq.call(null, i + 1))
        }else {
          return null
        }
      })
    };
    return vector_seq__12254.call(null, 0)
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$ICounted$ = true;
cljs.core.Vector.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__12255 = this;
  return this__12255.array.length
};
cljs.core.Vector.prototype.cljs$core$IStack$ = true;
cljs.core.Vector.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__12257 = this;
  var count__12258 = this__12257.array.length;
  if(cljs.core.truth_(count__12258 > 0)) {
    return this__12257.array[count__12258 - 1]
  }else {
    return null
  }
};
cljs.core.Vector.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__12259 = this;
  if(cljs.core.truth_(this__12259.array.length > 0)) {
    var new_array__12260 = cljs.core.aclone.call(null, this__12259.array);
    new_array__12260.pop();
    return new cljs.core.Vector(this__12259.meta, new_array__12260)
  }else {
    throw new Error("Can't pop empty vector");
  }
};
cljs.core.Vector.prototype.cljs$core$IVector$ = true;
cljs.core.Vector.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__12261 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Vector.prototype.cljs$core$IEquiv$ = true;
cljs.core.Vector.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__12262 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Vector.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__12265 = this;
  return new cljs.core.Vector(meta, this__12265.array)
};
cljs.core.Vector.prototype.cljs$core$IMeta$ = true;
cljs.core.Vector.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__12391 = this;
  return this__12391.meta
};
cljs.core.Vector.prototype.cljs$core$IIndexed$ = true;
cljs.core.Vector.prototype.cljs$core$IIndexed$_nth = function() {
  var G__12462 = null;
  var G__12462__12463 = function(coll, n) {
    var this__12392 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____12393 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____12393)) {
        return n < this__12392.array.length
      }else {
        return and__3546__auto____12393
      }
    }())) {
      return this__12392.array[n]
    }else {
      return null
    }
  };
  var G__12462__12464 = function(coll, n, not_found) {
    var this__12395 = this;
    if(cljs.core.truth_(function() {
      var and__3546__auto____12398 = 0 <= n;
      if(cljs.core.truth_(and__3546__auto____12398)) {
        return n < this__12395.array.length
      }else {
        return and__3546__auto____12398
      }
    }())) {
      return this__12395.array[n]
    }else {
      return not_found
    }
  };
  G__12462 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__12462__12463.call(this, coll, n);
      case 3:
        return G__12462__12464.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__12462
}();
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Vector.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__12403 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__12403.meta)
};
cljs.core.Vector;
cljs.core.Vector.EMPTY = new cljs.core.Vector(null, cljs.core.array.call(null));
cljs.core.Vector.fromArray = function(xs) {
  return new cljs.core.Vector(null, xs)
};
cljs.core.vec = function vec(coll) {
  return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.Vector.EMPTY, coll)
};
cljs.core.vector = function() {
  var vector__delegate = function(args) {
    return cljs.core.vec.call(null, args)
  };
  var vector = function(var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return vector__delegate.call(this, args)
  };
  vector.cljs$lang$maxFixedArity = 0;
  vector.cljs$lang$applyTo = function(arglist__12490) {
    var args = cljs.core.seq(arglist__12490);
    return vector__delegate.call(this, args)
  };
  return vector
}();
cljs.core.Subvec = function(meta, v, start, end) {
  this.meta = meta;
  this.v = v;
  this.start = start;
  this.end = end
};
cljs.core.Subvec.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.Subvec")
};
cljs.core.Subvec.prototype.cljs$core$IHash$ = true;
cljs.core.Subvec.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__12496 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Subvec.prototype.cljs$core$ILookup$ = true;
cljs.core.Subvec.prototype.cljs$core$ILookup$_lookup = function() {
  var G__12618 = null;
  var G__12618__12619 = function(coll, k) {
    var this__12500 = this;
    return cljs.core._nth.call(null, coll, k, null)
  };
  var G__12618__12620 = function(coll, k, not_found) {
    var this__12501 = this;
    return cljs.core._nth.call(null, coll, k, not_found)
  };
  G__12618 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__12618__12619.call(this, coll, k);
      case 3:
        return G__12618__12620.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__12618
}();
cljs.core.Subvec.prototype.cljs$core$IAssociative$ = true;
cljs.core.Subvec.prototype.cljs$core$IAssociative$_assoc = function(coll, key, val) {
  var this__12502 = this;
  var v_pos__12503 = this__12502.start + key;
  return new cljs.core.Subvec(this__12502.meta, cljs.core._assoc.call(null, this__12502.v, v_pos__12503, val), this__12502.start, this__12502.end > v_pos__12503 + 1 ? this__12502.end : v_pos__12503 + 1)
};
cljs.core.Subvec.prototype.cljs$core$IFn$ = true;
cljs.core.Subvec.prototype.call = function() {
  var G__12630 = null;
  var G__12630__12631 = function(coll, k) {
    var this__12507 = this;
    coll = this;
    return cljs.core._lookup.call(null, coll, k)
  };
  var G__12630__12632 = function(coll, k, not_found) {
    var this__12508 = this;
    coll = this;
    return cljs.core._lookup.call(null, coll, k, not_found)
  };
  G__12630 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__12630__12631.call(this, coll, k);
      case 3:
        return G__12630__12632.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__12630
}();
cljs.core.Subvec.prototype.cljs$core$ISequential$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$ = true;
cljs.core.Subvec.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__12509 = this;
  return new cljs.core.Subvec(this__12509.meta, cljs.core._assoc_n.call(null, this__12509.v, this__12509.end, o), this__12509.start, this__12509.end + 1)
};
cljs.core.Subvec.prototype.cljs$core$IReduce$ = true;
cljs.core.Subvec.prototype.cljs$core$IReduce$_reduce = function() {
  var G__12637 = null;
  var G__12637__12638 = function(coll, f) {
    var this__12510 = this;
    return cljs.core.ci_reduce.call(null, coll, f)
  };
  var G__12637__12639 = function(coll, f, start) {
    var this__12511 = this;
    return cljs.core.ci_reduce.call(null, coll, f, start)
  };
  G__12637 = function(coll, f, start) {
    switch(arguments.length) {
      case 2:
        return G__12637__12638.call(this, coll, f);
      case 3:
        return G__12637__12639.call(this, coll, f, start)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__12637
}();
cljs.core.Subvec.prototype.cljs$core$ISeqable$ = true;
cljs.core.Subvec.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__12521 = this;
  var subvec_seq__12526 = function subvec_seq(i) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, i, this__12521.end))) {
      return null
    }else {
      return cljs.core.cons.call(null, cljs.core._nth.call(null, this__12521.v, i), new cljs.core.LazySeq(null, false, function() {
        return subvec_seq.call(null, i + 1)
      }))
    }
  };
  return subvec_seq__12526.call(null, this__12521.start)
};
cljs.core.Subvec.prototype.cljs$core$ICounted$ = true;
cljs.core.Subvec.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__12527 = this;
  return this__12527.end - this__12527.start
};
cljs.core.Subvec.prototype.cljs$core$IStack$ = true;
cljs.core.Subvec.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__12536 = this;
  return cljs.core._nth.call(null, this__12536.v, this__12536.end - 1)
};
cljs.core.Subvec.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__12538 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, this__12538.start, this__12538.end))) {
    throw new Error("Can't pop empty vector");
  }else {
    return new cljs.core.Subvec(this__12538.meta, this__12538.v, this__12538.start, this__12538.end - 1)
  }
};
cljs.core.Subvec.prototype.cljs$core$IVector$ = true;
cljs.core.Subvec.prototype.cljs$core$IVector$_assoc_n = function(coll, n, val) {
  var this__12540 = this;
  return cljs.core._assoc.call(null, coll, n, val)
};
cljs.core.Subvec.prototype.cljs$core$IEquiv$ = true;
cljs.core.Subvec.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__12542 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.Subvec.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__12547 = this;
  return new cljs.core.Subvec(meta, this__12547.v, this__12547.start, this__12547.end)
};
cljs.core.Subvec.prototype.cljs$core$IMeta$ = true;
cljs.core.Subvec.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__12549 = this;
  return this__12549.meta
};
cljs.core.Subvec.prototype.cljs$core$IIndexed$ = true;
cljs.core.Subvec.prototype.cljs$core$IIndexed$_nth = function() {
  var G__12665 = null;
  var G__12665__12666 = function(coll, n) {
    var this__12607 = this;
    return cljs.core._nth.call(null, this__12607.v, this__12607.start + n)
  };
  var G__12665__12667 = function(coll, n, not_found) {
    var this__12608 = this;
    return cljs.core._nth.call(null, this__12608.v, this__12608.start + n, not_found)
  };
  G__12665 = function(coll, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__12665__12666.call(this, coll, n);
      case 3:
        return G__12665__12667.call(this, coll, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__12665
}();
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Subvec.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__12611 = this;
  return cljs.core.with_meta.call(null, cljs.core.Vector.EMPTY, this__12611.meta)
};
cljs.core.Subvec;
cljs.core.subvec = function() {
  var subvec = null;
  var subvec__12680 = function(v, start) {
    return subvec.call(null, v, start, cljs.core.count.call(null, v))
  };
  var subvec__12682 = function(v, start, end) {
    return new cljs.core.Subvec(null, v, start, end)
  };
  subvec = function(v, start, end) {
    switch(arguments.length) {
      case 2:
        return subvec__12680.call(this, v, start);
      case 3:
        return subvec__12682.call(this, v, start, end)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return subvec
}();
cljs.core.PersistentQueueSeq = function(meta, front, rear) {
  this.meta = meta;
  this.front = front;
  this.rear = rear
};
cljs.core.PersistentQueueSeq.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.PersistentQueueSeq")
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__12743 = this;
  return coll
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__12744 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__12746 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__12748 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__12748.meta)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__12749 = this;
  return cljs.core.cons.call(null, o, coll)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__12751 = this;
  return cljs.core._first.call(null, this__12751.front)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__12752 = this;
  var temp__3695__auto____12754 = cljs.core.next.call(null, this__12752.front);
  if(cljs.core.truth_(temp__3695__auto____12754)) {
    var f1__12758 = temp__3695__auto____12754;
    return new cljs.core.PersistentQueueSeq(this__12752.meta, f1__12758, this__12752.rear)
  }else {
    if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, this__12752.rear))) {
      return cljs.core._empty.call(null, coll)
    }else {
      return new cljs.core.PersistentQueueSeq(this__12752.meta, this__12752.rear, null)
    }
  }
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__12763 = this;
  return this__12763.meta
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__12764 = this;
  return new cljs.core.PersistentQueueSeq(meta, this__12764.front, this__12764.rear)
};
cljs.core.PersistentQueueSeq;
cljs.core.PersistentQueue = function(meta, count, front, rear) {
  this.meta = meta;
  this.count = count;
  this.front = front;
  this.rear = rear
};
cljs.core.PersistentQueue.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.PersistentQueue")
};
cljs.core.PersistentQueue.prototype.cljs$core$IHash$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__12774 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISequential$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__12776 = this;
  if(cljs.core.truth_(this__12776.front)) {
    return new cljs.core.PersistentQueue(this__12776.meta, this__12776.count + 1, this__12776.front, cljs.core.conj.call(null, function() {
      var or__3548__auto____12778 = this__12776.rear;
      if(cljs.core.truth_(or__3548__auto____12778)) {
        return or__3548__auto____12778
      }else {
        return cljs.core.Vector.fromArray([])
      }
    }(), o))
  }else {
    return new cljs.core.PersistentQueue(this__12776.meta, this__12776.count + 1, cljs.core.conj.call(null, this__12776.front, o), cljs.core.Vector.fromArray([]))
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__12782 = this;
  var rear__12784 = cljs.core.seq.call(null, this__12782.rear);
  if(cljs.core.truth_(function() {
    var or__3548__auto____12785 = this__12782.front;
    if(cljs.core.truth_(or__3548__auto____12785)) {
      return or__3548__auto____12785
    }else {
      return rear__12784
    }
  }())) {
    return new cljs.core.PersistentQueueSeq(null, this__12782.front, cljs.core.seq.call(null, rear__12784))
  }else {
    return cljs.core.List.EMPTY
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__12788 = this;
  return this__12788.count
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_peek = function(coll) {
  var this__12790 = this;
  return cljs.core._first.call(null, this__12790.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$IStack$_pop = function(coll) {
  var this__12793 = this;
  if(cljs.core.truth_(this__12793.front)) {
    var temp__3695__auto____12795 = cljs.core.next.call(null, this__12793.front);
    if(cljs.core.truth_(temp__3695__auto____12795)) {
      var f1__12797 = temp__3695__auto____12795;
      return new cljs.core.PersistentQueue(this__12793.meta, this__12793.count - 1, f1__12797, this__12793.rear)
    }else {
      return new cljs.core.PersistentQueue(this__12793.meta, this__12793.count - 1, cljs.core.seq.call(null, this__12793.rear), cljs.core.Vector.fromArray([]))
    }
  }else {
    return coll
  }
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_first = function(coll) {
  var this__12802 = this;
  return cljs.core.first.call(null, this__12802.front)
};
cljs.core.PersistentQueue.prototype.cljs$core$ISeq$_rest = function(coll) {
  var this__12804 = this;
  return cljs.core.rest.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__12808 = this;
  return cljs.core.equiv_sequential.call(null, coll, other)
};
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__12813 = this;
  return new cljs.core.PersistentQueue(meta, this__12813.count, this__12813.front, this__12813.rear)
};
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__12814 = this;
  return this__12814.meta
};
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.PersistentQueue.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__12815 = this;
  return cljs.core.PersistentQueue.EMPTY
};
cljs.core.PersistentQueue;
cljs.core.PersistentQueue.EMPTY = new cljs.core.PersistentQueue(null, 0, null, cljs.core.Vector.fromArray([]));
cljs.core.NeverEquiv = function() {
};
cljs.core.NeverEquiv.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.NeverEquiv")
};
cljs.core.NeverEquiv.prototype.cljs$core$IEquiv$ = true;
cljs.core.NeverEquiv.prototype.cljs$core$IEquiv$_equiv = function(o, other) {
  var this__12840 = this;
  return false
};
cljs.core.NeverEquiv;
cljs.core.never_equiv = new cljs.core.NeverEquiv;
cljs.core.equiv_map = function equiv_map(x, y) {
  return cljs.core.boolean$.call(null, cljs.core.truth_(cljs.core.map_QMARK_.call(null, y)) ? cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, x), cljs.core.count.call(null, y))) ? cljs.core.every_QMARK_.call(null, cljs.core.identity, cljs.core.map.call(null, function(xkv) {
    return cljs.core._EQ_.call(null, cljs.core.get.call(null, y, cljs.core.first.call(null, xkv), cljs.core.never_equiv), cljs.core.second.call(null, xkv))
  }, x)) : null : null)
};
cljs.core.scan_array = function scan_array(incr, k, array) {
  var len__12856 = array.length;
  var i__12857 = 0;
  while(true) {
    if(cljs.core.truth_(i__12857 < len__12856)) {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, k, array[i__12857]))) {
        return i__12857
      }else {
        var G__12859 = i__12857 + incr;
        i__12857 = G__12859;
        continue
      }
    }else {
      return null
    }
    break
  }
};
cljs.core.obj_map_contains_key_QMARK_ = function() {
  var obj_map_contains_key_QMARK_ = null;
  var obj_map_contains_key_QMARK___12878 = function(k, strobj) {
    return obj_map_contains_key_QMARK_.call(null, k, strobj, true, false)
  };
  var obj_map_contains_key_QMARK___12879 = function(k, strobj, true_val, false_val) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____12877 = goog.isString.call(null, k);
      if(cljs.core.truth_(and__3546__auto____12877)) {
        return strobj.hasOwnProperty(k)
      }else {
        return and__3546__auto____12877
      }
    }())) {
      return true_val
    }else {
      return false_val
    }
  };
  obj_map_contains_key_QMARK_ = function(k, strobj, true_val, false_val) {
    switch(arguments.length) {
      case 2:
        return obj_map_contains_key_QMARK___12878.call(this, k, strobj);
      case 4:
        return obj_map_contains_key_QMARK___12879.call(this, k, strobj, true_val, false_val)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return obj_map_contains_key_QMARK_
}();
cljs.core.ObjMap = function(meta, keys, strobj) {
  this.meta = meta;
  this.keys = keys;
  this.strobj = strobj
};
cljs.core.ObjMap.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.ObjMap")
};
cljs.core.ObjMap.prototype.cljs$core$IHash$ = true;
cljs.core.ObjMap.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__12888 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.ObjMap.prototype.cljs$core$ILookup$ = true;
cljs.core.ObjMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__12976 = null;
  var G__12976__12977 = function(coll, k) {
    var this__12889 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__12976__12978 = function(coll, k, not_found) {
    var this__12890 = this;
    return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__12890.strobj, this__12890.strobj[k], not_found)
  };
  G__12976 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__12976__12977.call(this, coll, k);
      case 3:
        return G__12976__12978.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__12976
}();
cljs.core.ObjMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__12891 = this;
  if(cljs.core.truth_(goog.isString.call(null, k))) {
    var new_strobj__12892 = goog.object.clone.call(null, this__12891.strobj);
    var overwrite_QMARK___12894 = new_strobj__12892.hasOwnProperty(k);
    new_strobj__12892[k] = v;
    if(cljs.core.truth_(overwrite_QMARK___12894)) {
      return new cljs.core.ObjMap(this__12891.meta, this__12891.keys, new_strobj__12892)
    }else {
      var new_keys__12896 = cljs.core.aclone.call(null, this__12891.keys);
      new_keys__12896.push(k);
      return new cljs.core.ObjMap(this__12891.meta, new_keys__12896, new_strobj__12892)
    }
  }else {
    return cljs.core.with_meta.call(null, cljs.core.into.call(null, cljs.core.hash_map.call(null, k, v), cljs.core.seq.call(null, coll)), this__12891.meta)
  }
};
cljs.core.ObjMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__12897 = this;
  return cljs.core.obj_map_contains_key_QMARK_.call(null, k, this__12897.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IFn$ = true;
cljs.core.ObjMap.prototype.call = function() {
  var G__12992 = null;
  var G__12992__12993 = function(coll, k) {
    var this__12938 = this;
    coll = this;
    return cljs.core._lookup.call(null, coll, k)
  };
  var G__12992__12994 = function(coll, k, not_found) {
    var this__12941 = this;
    coll = this;
    return cljs.core._lookup.call(null, coll, k, not_found)
  };
  G__12992 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__12992__12993.call(this, coll, k);
      case 3:
        return G__12992__12994.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__12992
}();
cljs.core.ObjMap.prototype.cljs$core$ICollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__12944 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.ObjMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.ObjMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__12949 = this;
  if(cljs.core.truth_(this__12949.keys.length > 0)) {
    return cljs.core.map.call(null, function(p1__12882_SHARP_) {
      return cljs.core.vector.call(null, p1__12882_SHARP_, this__12949.strobj[p1__12882_SHARP_])
    }, this__12949.keys)
  }else {
    return null
  }
};
cljs.core.ObjMap.prototype.cljs$core$ICounted$ = true;
cljs.core.ObjMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__12952 = this;
  return this__12952.keys.length
};
cljs.core.ObjMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__12956 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__12958 = this;
  return new cljs.core.ObjMap(meta, this__12958.keys, this__12958.strobj)
};
cljs.core.ObjMap.prototype.cljs$core$IMeta$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__12959 = this;
  return this__12959.meta
};
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.ObjMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__12960 = this;
  return cljs.core.with_meta.call(null, cljs.core.ObjMap.EMPTY, this__12960.meta)
};
cljs.core.ObjMap.prototype.cljs$core$IMap$ = true;
cljs.core.ObjMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__12961 = this;
  if(cljs.core.truth_(function() {
    var and__3546__auto____12962 = goog.isString.call(null, k);
    if(cljs.core.truth_(and__3546__auto____12962)) {
      return this__12961.strobj.hasOwnProperty(k)
    }else {
      return and__3546__auto____12962
    }
  }())) {
    var new_keys__12965 = cljs.core.aclone.call(null, this__12961.keys);
    var new_strobj__12966 = goog.object.clone.call(null, this__12961.strobj);
    new_keys__12965.splice(cljs.core.scan_array.call(null, 1, k, new_keys__12965), 1);
    cljs.core.js_delete.call(null, new_strobj__12966, k);
    return new cljs.core.ObjMap(this__12961.meta, new_keys__12965, new_strobj__12966)
  }else {
    return coll
  }
};
cljs.core.ObjMap;
cljs.core.ObjMap.EMPTY = new cljs.core.ObjMap(null, cljs.core.array.call(null), cljs.core.js_obj.call(null));
cljs.core.ObjMap.fromObject = function(ks, obj) {
  return new cljs.core.ObjMap(null, ks, obj)
};
cljs.core.HashMap = function(meta, count, hashobj) {
  this.meta = meta;
  this.count = count;
  this.hashobj = hashobj
};
cljs.core.HashMap.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.HashMap")
};
cljs.core.HashMap.prototype.cljs$core$IHash$ = true;
cljs.core.HashMap.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__13030 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.HashMap.prototype.cljs$core$ILookup$ = true;
cljs.core.HashMap.prototype.cljs$core$ILookup$_lookup = function() {
  var G__13157 = null;
  var G__13157__13159 = function(coll, k) {
    var this__13035 = this;
    return cljs.core._lookup.call(null, coll, k, null)
  };
  var G__13157__13160 = function(coll, k, not_found) {
    var this__13036 = this;
    var bucket__13038 = this__13036.hashobj[cljs.core.hash.call(null, k)];
    var i__13039 = cljs.core.truth_(bucket__13038) ? cljs.core.scan_array.call(null, 2, k, bucket__13038) : null;
    if(cljs.core.truth_(i__13039)) {
      return bucket__13038[i__13039 + 1]
    }else {
      return not_found
    }
  };
  G__13157 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__13157__13159.call(this, coll, k);
      case 3:
        return G__13157__13160.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__13157
}();
cljs.core.HashMap.prototype.cljs$core$IAssociative$ = true;
cljs.core.HashMap.prototype.cljs$core$IAssociative$_assoc = function(coll, k, v) {
  var this__13041 = this;
  var h__13043 = cljs.core.hash.call(null, k);
  var bucket__13044 = this__13041.hashobj[h__13043];
  if(cljs.core.truth_(bucket__13044)) {
    var new_bucket__13045 = cljs.core.aclone.call(null, bucket__13044);
    var new_hashobj__13046 = goog.object.clone.call(null, this__13041.hashobj);
    new_hashobj__13046[h__13043] = new_bucket__13045;
    var temp__3695__auto____13052 = cljs.core.scan_array.call(null, 2, k, new_bucket__13045);
    if(cljs.core.truth_(temp__3695__auto____13052)) {
      var i__13054 = temp__3695__auto____13052;
      new_bucket__13045[i__13054 + 1] = v;
      return new cljs.core.HashMap(this__13041.meta, this__13041.count, new_hashobj__13046)
    }else {
      new_bucket__13045.push(k, v);
      return new cljs.core.HashMap(this__13041.meta, this__13041.count + 1, new_hashobj__13046)
    }
  }else {
    var new_hashobj__13058 = goog.object.clone.call(null, this__13041.hashobj);
    new_hashobj__13058[h__13043] = cljs.core.array.call(null, k, v);
    return new cljs.core.HashMap(this__13041.meta, this__13041.count + 1, new_hashobj__13058)
  }
};
cljs.core.HashMap.prototype.cljs$core$IAssociative$_contains_key_QMARK_ = function(coll, k) {
  var this__13061 = this;
  var bucket__13063 = this__13061.hashobj[cljs.core.hash.call(null, k)];
  var i__13065 = cljs.core.truth_(bucket__13063) ? cljs.core.scan_array.call(null, 2, k, bucket__13063) : null;
  if(cljs.core.truth_(i__13065)) {
    return true
  }else {
    return false
  }
};
cljs.core.HashMap.prototype.cljs$core$IFn$ = true;
cljs.core.HashMap.prototype.call = function() {
  var G__13177 = null;
  var G__13177__13179 = function(coll, k) {
    var this__13066 = this;
    coll = this;
    return cljs.core._lookup.call(null, coll, k)
  };
  var G__13177__13180 = function(coll, k, not_found) {
    var this__13112 = this;
    coll = this;
    return cljs.core._lookup.call(null, coll, k, not_found)
  };
  G__13177 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__13177__13179.call(this, coll, k);
      case 3:
        return G__13177__13180.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__13177
}();
cljs.core.HashMap.prototype.cljs$core$ICollection$ = true;
cljs.core.HashMap.prototype.cljs$core$ICollection$_conj = function(coll, entry) {
  var this__13115 = this;
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, entry))) {
    return cljs.core._assoc.call(null, coll, cljs.core._nth.call(null, entry, 0), cljs.core._nth.call(null, entry, 1))
  }else {
    return cljs.core.reduce.call(null, cljs.core._conj, coll, entry)
  }
};
cljs.core.HashMap.prototype.cljs$core$ISeqable$ = true;
cljs.core.HashMap.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__13118 = this;
  if(cljs.core.truth_(this__13118.count > 0)) {
    var hashes__13123 = cljs.core.js_keys.call(null, this__13118.hashobj).sort();
    return cljs.core.mapcat.call(null, function(p1__13017_SHARP_) {
      return cljs.core.map.call(null, cljs.core.vec, cljs.core.partition.call(null, 2, this__13118.hashobj[p1__13017_SHARP_]))
    }, hashes__13123)
  }else {
    return null
  }
};
cljs.core.HashMap.prototype.cljs$core$ICounted$ = true;
cljs.core.HashMap.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__13130 = this;
  return this__13130.count
};
cljs.core.HashMap.prototype.cljs$core$IEquiv$ = true;
cljs.core.HashMap.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__13133 = this;
  return cljs.core.equiv_map.call(null, coll, other)
};
cljs.core.HashMap.prototype.cljs$core$IWithMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__13136 = this;
  return new cljs.core.HashMap(meta, this__13136.count, this__13136.hashobj)
};
cljs.core.HashMap.prototype.cljs$core$IMeta$ = true;
cljs.core.HashMap.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__13137 = this;
  return this__13137.meta
};
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.HashMap.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__13138 = this;
  return cljs.core.with_meta.call(null, cljs.core.HashMap.EMPTY, this__13138.meta)
};
cljs.core.HashMap.prototype.cljs$core$IMap$ = true;
cljs.core.HashMap.prototype.cljs$core$IMap$_dissoc = function(coll, k) {
  var this__13140 = this;
  var h__13142 = cljs.core.hash.call(null, k);
  var bucket__13143 = this__13140.hashobj[h__13142];
  var i__13145 = cljs.core.truth_(bucket__13143) ? cljs.core.scan_array.call(null, 2, k, bucket__13143) : null;
  if(cljs.core.truth_(cljs.core.not.call(null, i__13145))) {
    return coll
  }else {
    var new_hashobj__13148 = goog.object.clone.call(null, this__13140.hashobj);
    if(cljs.core.truth_(3 > bucket__13143.length)) {
      cljs.core.js_delete.call(null, new_hashobj__13148, h__13142)
    }else {
      var new_bucket__13150 = cljs.core.aclone.call(null, bucket__13143);
      new_bucket__13150.splice(i__13145, 2);
      new_hashobj__13148[h__13142] = new_bucket__13150
    }
    return new cljs.core.HashMap(this__13140.meta, this__13140.count - 1, new_hashobj__13148)
  }
};
cljs.core.HashMap;
cljs.core.HashMap.EMPTY = new cljs.core.HashMap(null, 0, cljs.core.js_obj.call(null));
cljs.core.HashMap.fromArrays = function(ks, vs) {
  var len__13212 = ks.length;
  var i__13213 = 0;
  var out__13215 = cljs.core.HashMap.EMPTY;
  while(true) {
    if(cljs.core.truth_(i__13213 < len__13212)) {
      var G__13222 = i__13213 + 1;
      var G__13223 = cljs.core.assoc.call(null, out__13215, ks[i__13213], vs[i__13213]);
      i__13213 = G__13222;
      out__13215 = G__13223;
      continue
    }else {
      return out__13215
    }
    break
  }
};
cljs.core.hash_map = function() {
  var hash_map__delegate = function(keyvals) {
    var in$__13235 = cljs.core.seq.call(null, keyvals);
    var out__13236 = cljs.core.HashMap.EMPTY;
    while(true) {
      if(cljs.core.truth_(in$__13235)) {
        var G__13245 = cljs.core.nnext.call(null, in$__13235);
        var G__13246 = cljs.core.assoc.call(null, out__13236, cljs.core.first.call(null, in$__13235), cljs.core.second.call(null, in$__13235));
        in$__13235 = G__13245;
        out__13236 = G__13246;
        continue
      }else {
        return out__13236
      }
      break
    }
  };
  var hash_map = function(var_args) {
    var keyvals = null;
    if(goog.isDef(var_args)) {
      keyvals = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return hash_map__delegate.call(this, keyvals)
  };
  hash_map.cljs$lang$maxFixedArity = 0;
  hash_map.cljs$lang$applyTo = function(arglist__13248) {
    var keyvals = cljs.core.seq(arglist__13248);
    return hash_map__delegate.call(this, keyvals)
  };
  return hash_map
}();
cljs.core.keys = function keys(hash_map) {
  return cljs.core.seq.call(null, cljs.core.map.call(null, cljs.core.first, hash_map))
};
cljs.core.vals = function vals(hash_map) {
  return cljs.core.seq.call(null, cljs.core.map.call(null, cljs.core.second, hash_map))
};
cljs.core.merge = function() {
  var merge__delegate = function(maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      return cljs.core.reduce.call(null, function(p1__13301_SHARP_, p2__13302_SHARP_) {
        return cljs.core.conj.call(null, function() {
          var or__3548__auto____13315 = p1__13301_SHARP_;
          if(cljs.core.truth_(or__3548__auto____13315)) {
            return or__3548__auto____13315
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), p2__13302_SHARP_)
      }, maps)
    }else {
      return null
    }
  };
  var merge = function(var_args) {
    var maps = null;
    if(goog.isDef(var_args)) {
      maps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return merge__delegate.call(this, maps)
  };
  merge.cljs$lang$maxFixedArity = 0;
  merge.cljs$lang$applyTo = function(arglist__13317) {
    var maps = cljs.core.seq(arglist__13317);
    return merge__delegate.call(this, maps)
  };
  return merge
}();
cljs.core.merge_with = function() {
  var merge_with__delegate = function(f, maps) {
    if(cljs.core.truth_(cljs.core.some.call(null, cljs.core.identity, maps))) {
      var merge_entry__13327 = function(m, e) {
        var k__13323 = cljs.core.first.call(null, e);
        var v__13324 = cljs.core.second.call(null, e);
        if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, m, k__13323))) {
          return cljs.core.assoc.call(null, m, k__13323, f.call(null, cljs.core.get.call(null, m, k__13323), v__13324))
        }else {
          return cljs.core.assoc.call(null, m, k__13323, v__13324)
        }
      };
      var merge2__13329 = function(m1, m2) {
        return cljs.core.reduce.call(null, merge_entry__13327, function() {
          var or__3548__auto____13328 = m1;
          if(cljs.core.truth_(or__3548__auto____13328)) {
            return or__3548__auto____13328
          }else {
            return cljs.core.ObjMap.fromObject([], {})
          }
        }(), cljs.core.seq.call(null, m2))
      };
      return cljs.core.reduce.call(null, merge2__13329, maps)
    }else {
      return null
    }
  };
  var merge_with = function(f, var_args) {
    var maps = null;
    if(goog.isDef(var_args)) {
      maps = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return merge_with__delegate.call(this, f, maps)
  };
  merge_with.cljs$lang$maxFixedArity = 1;
  merge_with.cljs$lang$applyTo = function(arglist__13340) {
    var f = cljs.core.first(arglist__13340);
    var maps = cljs.core.rest(arglist__13340);
    return merge_with__delegate.call(this, f, maps)
  };
  return merge_with
}();
cljs.core.select_keys = function select_keys(map, keyseq) {
  var ret__13344 = cljs.core.ObjMap.fromObject([], {});
  var keys__13345 = cljs.core.seq.call(null, keyseq);
  while(true) {
    if(cljs.core.truth_(keys__13345)) {
      var key__13347 = cljs.core.first.call(null, keys__13345);
      var entry__13348 = cljs.core.get.call(null, map, key__13347, "\ufdd0'user/not-found");
      var G__13357 = cljs.core.truth_(cljs.core.not_EQ_.call(null, entry__13348, "\ufdd0'user/not-found")) ? cljs.core.assoc.call(null, ret__13344, key__13347, entry__13348) : ret__13344;
      var G__13358 = cljs.core.next.call(null, keys__13345);
      ret__13344 = G__13357;
      keys__13345 = G__13358;
      continue
    }else {
      return ret__13344
    }
    break
  }
};
cljs.core.Set = function(meta, hash_map) {
  this.meta = meta;
  this.hash_map = hash_map
};
cljs.core.Set.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.Set")
};
cljs.core.Set.prototype.cljs$core$IHash$ = true;
cljs.core.Set.prototype.cljs$core$IHash$_hash = function(coll) {
  var this__13364 = this;
  return cljs.core.hash_coll.call(null, coll)
};
cljs.core.Set.prototype.cljs$core$ILookup$ = true;
cljs.core.Set.prototype.cljs$core$ILookup$_lookup = function() {
  var G__13432 = null;
  var G__13432__13433 = function(coll, v) {
    var this__13365 = this;
    return cljs.core._lookup.call(null, coll, v, null)
  };
  var G__13432__13434 = function(coll, v, not_found) {
    var this__13366 = this;
    if(cljs.core.truth_(cljs.core._contains_key_QMARK_.call(null, this__13366.hash_map, v))) {
      return v
    }else {
      return not_found
    }
  };
  G__13432 = function(coll, v, not_found) {
    switch(arguments.length) {
      case 2:
        return G__13432__13433.call(this, coll, v);
      case 3:
        return G__13432__13434.call(this, coll, v, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__13432
}();
cljs.core.Set.prototype.cljs$core$IFn$ = true;
cljs.core.Set.prototype.call = function() {
  var G__13438 = null;
  var G__13438__13439 = function(coll, k) {
    var this__13370 = this;
    coll = this;
    return cljs.core._lookup.call(null, coll, k)
  };
  var G__13438__13440 = function(coll, k, not_found) {
    var this__13373 = this;
    coll = this;
    return cljs.core._lookup.call(null, coll, k, not_found)
  };
  G__13438 = function(coll, k, not_found) {
    switch(arguments.length) {
      case 2:
        return G__13438__13439.call(this, coll, k);
      case 3:
        return G__13438__13440.call(this, coll, k, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__13438
}();
cljs.core.Set.prototype.cljs$core$ICollection$ = true;
cljs.core.Set.prototype.cljs$core$ICollection$_conj = function(coll, o) {
  var this__13377 = this;
  return new cljs.core.Set(this__13377.meta, cljs.core.assoc.call(null, this__13377.hash_map, o, null))
};
cljs.core.Set.prototype.cljs$core$ISeqable$ = true;
cljs.core.Set.prototype.cljs$core$ISeqable$_seq = function(coll) {
  var this__13380 = this;
  return cljs.core.keys.call(null, this__13380.hash_map)
};
cljs.core.Set.prototype.cljs$core$ISet$ = true;
cljs.core.Set.prototype.cljs$core$ISet$_disjoin = function(coll, v) {
  var this__13383 = this;
  return new cljs.core.Set(this__13383.meta, cljs.core.dissoc.call(null, this__13383.hash_map, v))
};
cljs.core.Set.prototype.cljs$core$ICounted$ = true;
cljs.core.Set.prototype.cljs$core$ICounted$_count = function(coll) {
  var this__13386 = this;
  return cljs.core.count.call(null, cljs.core.seq.call(null, coll))
};
cljs.core.Set.prototype.cljs$core$IEquiv$ = true;
cljs.core.Set.prototype.cljs$core$IEquiv$_equiv = function(coll, other) {
  var this__13388 = this;
  var and__3546__auto____13390 = cljs.core.set_QMARK_.call(null, other);
  if(cljs.core.truth_(and__3546__auto____13390)) {
    var and__3546__auto____13394 = cljs.core._EQ_.call(null, cljs.core.count.call(null, coll), cljs.core.count.call(null, other));
    if(cljs.core.truth_(and__3546__auto____13394)) {
      return cljs.core.every_QMARK_.call(null, function(p1__13342_SHARP_) {
        return cljs.core.contains_QMARK_.call(null, coll, p1__13342_SHARP_)
      }, other)
    }else {
      return and__3546__auto____13394
    }
  }else {
    return and__3546__auto____13390
  }
};
cljs.core.Set.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Set.prototype.cljs$core$IWithMeta$_with_meta = function(coll, meta) {
  var this__13399 = this;
  return new cljs.core.Set(meta, this__13399.hash_map)
};
cljs.core.Set.prototype.cljs$core$IMeta$ = true;
cljs.core.Set.prototype.cljs$core$IMeta$_meta = function(coll) {
  var this__13405 = this;
  return this__13405.meta
};
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Set.prototype.cljs$core$IEmptyableCollection$_empty = function(coll) {
  var this__13406 = this;
  return cljs.core.with_meta.call(null, cljs.core.Set.EMPTY, this__13406.meta)
};
cljs.core.Set;
cljs.core.Set.EMPTY = new cljs.core.Set(null, cljs.core.hash_map.call(null));
cljs.core.set = function set(coll) {
  var in$__13465 = cljs.core.seq.call(null, coll);
  var out__13466 = cljs.core.Set.EMPTY;
  while(true) {
    if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.empty_QMARK_.call(null, in$__13465)))) {
      var G__13479 = cljs.core.rest.call(null, in$__13465);
      var G__13480 = cljs.core.conj.call(null, out__13466, cljs.core.first.call(null, in$__13465));
      in$__13465 = G__13479;
      out__13466 = G__13480;
      continue
    }else {
      return out__13466
    }
    break
  }
};
cljs.core.replace = function replace(smap, coll) {
  if(cljs.core.truth_(cljs.core.vector_QMARK_.call(null, coll))) {
    var n__13486 = cljs.core.count.call(null, coll);
    return cljs.core.reduce.call(null, function(v, i) {
      var temp__3695__auto____13489 = cljs.core.find.call(null, smap, cljs.core.nth.call(null, v, i));
      if(cljs.core.truth_(temp__3695__auto____13489)) {
        var e__13491 = temp__3695__auto____13489;
        return cljs.core.assoc.call(null, v, i, cljs.core.second.call(null, e__13491))
      }else {
        return v
      }
    }, coll, cljs.core.take.call(null, n__13486, cljs.core.iterate.call(null, cljs.core.inc, 0)))
  }else {
    return cljs.core.map.call(null, function(p1__13463_SHARP_) {
      var temp__3695__auto____13493 = cljs.core.find.call(null, smap, p1__13463_SHARP_);
      if(cljs.core.truth_(temp__3695__auto____13493)) {
        var e__13494 = temp__3695__auto____13493;
        return cljs.core.second.call(null, e__13494)
      }else {
        return p1__13463_SHARP_
      }
    }, coll)
  }
};
cljs.core.distinct = function distinct(coll) {
  var step__13520 = function step(xs, seen) {
    return new cljs.core.LazySeq(null, false, function() {
      return function(p__13510, seen) {
        while(true) {
          var vec__13511__13512 = p__13510;
          var f__13513 = cljs.core.nth.call(null, vec__13511__13512, 0, null);
          var xs__13514 = vec__13511__13512;
          var temp__3698__auto____13516 = cljs.core.seq.call(null, xs__13514);
          if(cljs.core.truth_(temp__3698__auto____13516)) {
            var s__13518 = temp__3698__auto____13516;
            if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, seen, f__13513))) {
              var G__13531 = cljs.core.rest.call(null, s__13518);
              var G__13532 = seen;
              p__13510 = G__13531;
              seen = G__13532;
              continue
            }else {
              return cljs.core.cons.call(null, f__13513, step.call(null, cljs.core.rest.call(null, s__13518), cljs.core.conj.call(null, seen, f__13513)))
            }
          }else {
            return null
          }
          break
        }
      }.call(null, xs, seen)
    })
  };
  return step__13520.call(null, coll, cljs.core.set([]))
};
cljs.core.butlast = function butlast(s) {
  var ret__13536 = cljs.core.Vector.fromArray([]);
  var s__13538 = s;
  while(true) {
    if(cljs.core.truth_(cljs.core.next.call(null, s__13538))) {
      var G__13546 = cljs.core.conj.call(null, ret__13536, cljs.core.first.call(null, s__13538));
      var G__13547 = cljs.core.next.call(null, s__13538);
      ret__13536 = G__13546;
      s__13538 = G__13547;
      continue
    }else {
      return cljs.core.seq.call(null, ret__13536)
    }
    break
  }
};
cljs.core.name = function name(x) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, x))) {
    return x
  }else {
    if(cljs.core.truth_(function() {
      var or__3548__auto____13593 = cljs.core.keyword_QMARK_.call(null, x);
      if(cljs.core.truth_(or__3548__auto____13593)) {
        return or__3548__auto____13593
      }else {
        return cljs.core.symbol_QMARK_.call(null, x)
      }
    }())) {
      var i__13594 = x.lastIndexOf("/");
      if(cljs.core.truth_(i__13594 < 0)) {
        return cljs.core.subs.call(null, x, 2)
      }else {
        return cljs.core.subs.call(null, x, i__13594 + 1)
      }
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        throw new Error(cljs.core.str.call(null, "Doesn't support name: ", x));
      }else {
        return null
      }
    }
  }
};
cljs.core.namespace = function namespace(x) {
  if(cljs.core.truth_(function() {
    var or__3548__auto____13616 = cljs.core.keyword_QMARK_.call(null, x);
    if(cljs.core.truth_(or__3548__auto____13616)) {
      return or__3548__auto____13616
    }else {
      return cljs.core.symbol_QMARK_.call(null, x)
    }
  }())) {
    var i__13617 = x.lastIndexOf("/");
    if(cljs.core.truth_(i__13617 > -1)) {
      return cljs.core.subs.call(null, x, 2, i__13617)
    }else {
      return null
    }
  }else {
    throw new Error(cljs.core.str.call(null, "Doesn't support namespace: ", x));
  }
};
cljs.core.zipmap = function zipmap(keys, vals) {
  var map__13632 = cljs.core.ObjMap.fromObject([], {});
  var ks__13636 = cljs.core.seq.call(null, keys);
  var vs__13683 = cljs.core.seq.call(null, vals);
  while(true) {
    if(cljs.core.truth_(function() {
      var and__3546__auto____13684 = ks__13636;
      if(cljs.core.truth_(and__3546__auto____13684)) {
        return vs__13683
      }else {
        return and__3546__auto____13684
      }
    }())) {
      var G__13686 = cljs.core.assoc.call(null, map__13632, cljs.core.first.call(null, ks__13636), cljs.core.first.call(null, vs__13683));
      var G__13687 = cljs.core.next.call(null, ks__13636);
      var G__13688 = cljs.core.next.call(null, vs__13683);
      map__13632 = G__13686;
      ks__13636 = G__13687;
      vs__13683 = G__13688;
      continue
    }else {
      return map__13632
    }
    break
  }
};
cljs.core.max_key = function() {
  var max_key = null;
  var max_key__13704 = function(k, x) {
    return x
  };
  var max_key__13705 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) > k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var max_key__13706 = function() {
    var G__13712__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__13627_SHARP_, p2__13628_SHARP_) {
        return max_key.call(null, k, p1__13627_SHARP_, p2__13628_SHARP_)
      }, max_key.call(null, k, x, y), more)
    };
    var G__13712 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__13712__delegate.call(this, k, x, y, more)
    };
    G__13712.cljs$lang$maxFixedArity = 3;
    G__13712.cljs$lang$applyTo = function(arglist__13717) {
      var k = cljs.core.first(arglist__13717);
      var x = cljs.core.first(cljs.core.next(arglist__13717));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__13717)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__13717)));
      return G__13712__delegate.call(this, k, x, y, more)
    };
    return G__13712
  }();
  max_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return max_key__13704.call(this, k, x);
      case 3:
        return max_key__13705.call(this, k, x, y);
      default:
        return max_key__13706.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  max_key.cljs$lang$maxFixedArity = 3;
  max_key.cljs$lang$applyTo = max_key__13706.cljs$lang$applyTo;
  return max_key
}();
cljs.core.min_key = function() {
  var min_key = null;
  var min_key__13728 = function(k, x) {
    return x
  };
  var min_key__13729 = function(k, x, y) {
    if(cljs.core.truth_(k.call(null, x) < k.call(null, y))) {
      return x
    }else {
      return y
    }
  };
  var min_key__13730 = function() {
    var G__13735__delegate = function(k, x, y, more) {
      return cljs.core.reduce.call(null, function(p1__13693_SHARP_, p2__13694_SHARP_) {
        return min_key.call(null, k, p1__13693_SHARP_, p2__13694_SHARP_)
      }, min_key.call(null, k, x, y), more)
    };
    var G__13735 = function(k, x, y, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__13735__delegate.call(this, k, x, y, more)
    };
    G__13735.cljs$lang$maxFixedArity = 3;
    G__13735.cljs$lang$applyTo = function(arglist__13737) {
      var k = cljs.core.first(arglist__13737);
      var x = cljs.core.first(cljs.core.next(arglist__13737));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(arglist__13737)));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__13737)));
      return G__13735__delegate.call(this, k, x, y, more)
    };
    return G__13735
  }();
  min_key = function(k, x, y, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return min_key__13728.call(this, k, x);
      case 3:
        return min_key__13729.call(this, k, x, y);
      default:
        return min_key__13730.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  min_key.cljs$lang$maxFixedArity = 3;
  min_key.cljs$lang$applyTo = min_key__13730.cljs$lang$applyTo;
  return min_key
}();
cljs.core.partition_all = function() {
  var partition_all = null;
  var partition_all__13751 = function(n, coll) {
    return partition_all.call(null, n, n, coll)
  };
  var partition_all__13752 = function(n, step, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____13747 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____13747)) {
        var s__13749 = temp__3698__auto____13747;
        return cljs.core.cons.call(null, cljs.core.take.call(null, n, s__13749), partition_all.call(null, n, step, cljs.core.drop.call(null, step, s__13749)))
      }else {
        return null
      }
    })
  };
  partition_all = function(n, step, coll) {
    switch(arguments.length) {
      case 2:
        return partition_all__13751.call(this, n, step);
      case 3:
        return partition_all__13752.call(this, n, step, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return partition_all
}();
cljs.core.take_while = function take_while(pred, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____13766 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____13766)) {
      var s__13767 = temp__3698__auto____13766;
      if(cljs.core.truth_(pred.call(null, cljs.core.first.call(null, s__13767)))) {
        return cljs.core.cons.call(null, cljs.core.first.call(null, s__13767), take_while.call(null, pred, cljs.core.rest.call(null, s__13767)))
      }else {
        return null
      }
    }else {
      return null
    }
  })
};
cljs.core.Range = function(meta, start, end, step) {
  this.meta = meta;
  this.start = start;
  this.end = end;
  this.step = step
};
cljs.core.Range.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.Range")
};
cljs.core.Range.prototype.cljs$core$IHash$ = true;
cljs.core.Range.prototype.cljs$core$IHash$_hash = function(rng) {
  var this__13794 = this;
  return cljs.core.hash_coll.call(null, rng)
};
cljs.core.Range.prototype.cljs$core$ISequential$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$ = true;
cljs.core.Range.prototype.cljs$core$ICollection$_conj = function(rng, o) {
  var this__13796 = this;
  return cljs.core.cons.call(null, o, rng)
};
cljs.core.Range.prototype.cljs$core$IReduce$ = true;
cljs.core.Range.prototype.cljs$core$IReduce$_reduce = function() {
  var G__13850 = null;
  var G__13850__13851 = function(rng, f) {
    var this__13797 = this;
    return cljs.core.ci_reduce.call(null, rng, f)
  };
  var G__13850__13852 = function(rng, f, s) {
    var this__13803 = this;
    return cljs.core.ci_reduce.call(null, rng, f, s)
  };
  G__13850 = function(rng, f, s) {
    switch(arguments.length) {
      case 2:
        return G__13850__13851.call(this, rng, f);
      case 3:
        return G__13850__13852.call(this, rng, f, s)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__13850
}();
cljs.core.Range.prototype.cljs$core$ISeqable$ = true;
cljs.core.Range.prototype.cljs$core$ISeqable$_seq = function(rng) {
  var this__13805 = this;
  var comp__13810 = cljs.core.truth_(this__13805.step > 0) ? cljs.core._LT_ : cljs.core._GT_;
  if(cljs.core.truth_(comp__13810.call(null, this__13805.start, this__13805.end))) {
    return rng
  }else {
    return null
  }
};
cljs.core.Range.prototype.cljs$core$ICounted$ = true;
cljs.core.Range.prototype.cljs$core$ICounted$_count = function(rng) {
  var this__13817 = this;
  if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._seq.call(null, rng)))) {
    return 0
  }else {
    return Math["ceil"].call(null, (this__13817.end - this__13817.start) / this__13817.step)
  }
};
cljs.core.Range.prototype.cljs$core$ISeq$ = true;
cljs.core.Range.prototype.cljs$core$ISeq$_first = function(rng) {
  var this__13820 = this;
  return this__13820.start
};
cljs.core.Range.prototype.cljs$core$ISeq$_rest = function(rng) {
  var this__13822 = this;
  if(cljs.core.truth_(cljs.core._seq.call(null, rng))) {
    return new cljs.core.Range(this__13822.meta, this__13822.start + this__13822.step, this__13822.end, this__13822.step)
  }else {
    return cljs.core.list.call(null)
  }
};
cljs.core.Range.prototype.cljs$core$IEquiv$ = true;
cljs.core.Range.prototype.cljs$core$IEquiv$_equiv = function(rng, other) {
  var this__13823 = this;
  return cljs.core.equiv_sequential.call(null, rng, other)
};
cljs.core.Range.prototype.cljs$core$IWithMeta$ = true;
cljs.core.Range.prototype.cljs$core$IWithMeta$_with_meta = function(rng, meta) {
  var this__13826 = this;
  return new cljs.core.Range(meta, this__13826.start, this__13826.end, this__13826.step)
};
cljs.core.Range.prototype.cljs$core$IMeta$ = true;
cljs.core.Range.prototype.cljs$core$IMeta$_meta = function(rng) {
  var this__13827 = this;
  return this__13827.meta
};
cljs.core.Range.prototype.cljs$core$IIndexed$ = true;
cljs.core.Range.prototype.cljs$core$IIndexed$_nth = function() {
  var G__13869 = null;
  var G__13869__13871 = function(rng, n) {
    var this__13829 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__13829.start + n * this__13829.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____13830 = this__13829.start > this__13829.end;
        if(cljs.core.truth_(and__3546__auto____13830)) {
          return cljs.core._EQ_.call(null, this__13829.step, 0)
        }else {
          return and__3546__auto____13830
        }
      }())) {
        return this__13829.start
      }else {
        throw new Error("Index out of bounds");
      }
    }
  };
  var G__13869__13872 = function(rng, n, not_found) {
    var this__13837 = this;
    if(cljs.core.truth_(n < cljs.core._count.call(null, rng))) {
      return this__13837.start + n * this__13837.step
    }else {
      if(cljs.core.truth_(function() {
        var and__3546__auto____13839 = this__13837.start > this__13837.end;
        if(cljs.core.truth_(and__3546__auto____13839)) {
          return cljs.core._EQ_.call(null, this__13837.step, 0)
        }else {
          return and__3546__auto____13839
        }
      }())) {
        return this__13837.start
      }else {
        return not_found
      }
    }
  };
  G__13869 = function(rng, n, not_found) {
    switch(arguments.length) {
      case 2:
        return G__13869__13871.call(this, rng, n);
      case 3:
        return G__13869__13872.call(this, rng, n, not_found)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return G__13869
}();
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$ = true;
cljs.core.Range.prototype.cljs$core$IEmptyableCollection$_empty = function(rng) {
  var this__13843 = this;
  return cljs.core.with_meta.call(null, cljs.core.List.EMPTY, this__13843.meta)
};
cljs.core.Range;
cljs.core.range = function() {
  var range = null;
  var range__13890 = function() {
    return range.call(null, 0, Number["MAX_VALUE"], 1)
  };
  var range__13891 = function(end) {
    return range.call(null, 0, end, 1)
  };
  var range__13892 = function(start, end) {
    return range.call(null, start, end, 1)
  };
  var range__13893 = function(start, end, step) {
    return new cljs.core.Range(null, start, end, step)
  };
  range = function(start, end, step) {
    switch(arguments.length) {
      case 0:
        return range__13890.call(this);
      case 1:
        return range__13891.call(this, start);
      case 2:
        return range__13892.call(this, start, end);
      case 3:
        return range__13893.call(this, start, end, step)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return range
}();
cljs.core.take_nth = function take_nth(n, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____13904 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____13904)) {
      var s__13905 = temp__3698__auto____13904;
      return cljs.core.cons.call(null, cljs.core.first.call(null, s__13905), take_nth.call(null, n, cljs.core.drop.call(null, n, s__13905)))
    }else {
      return null
    }
  })
};
cljs.core.split_with = function split_with(pred, coll) {
  return cljs.core.Vector.fromArray([cljs.core.take_while.call(null, pred, coll), cljs.core.drop_while.call(null, pred, coll)])
};
cljs.core.partition_by = function partition_by(f, coll) {
  return new cljs.core.LazySeq(null, false, function() {
    var temp__3698__auto____13922 = cljs.core.seq.call(null, coll);
    if(cljs.core.truth_(temp__3698__auto____13922)) {
      var s__13923 = temp__3698__auto____13922;
      var fst__13924 = cljs.core.first.call(null, s__13923);
      var fv__13925 = f.call(null, fst__13924);
      var run__13928 = cljs.core.cons.call(null, fst__13924, cljs.core.take_while.call(null, function(p1__13910_SHARP_) {
        return cljs.core._EQ_.call(null, fv__13925, f.call(null, p1__13910_SHARP_))
      }, cljs.core.next.call(null, s__13923)));
      return cljs.core.cons.call(null, run__13928, partition_by.call(null, f, cljs.core.seq.call(null, cljs.core.drop.call(null, cljs.core.count.call(null, run__13928), s__13923))))
    }else {
      return null
    }
  })
};
cljs.core.frequencies = function frequencies(coll) {
  return cljs.core.reduce.call(null, function(counts, x) {
    return cljs.core.assoc.call(null, counts, x, cljs.core.get.call(null, counts, x, 0) + 1)
  }, cljs.core.ObjMap.fromObject([], {}), coll)
};
cljs.core.reductions = function() {
  var reductions = null;
  var reductions__13979 = function(f, coll) {
    return new cljs.core.LazySeq(null, false, function() {
      var temp__3695__auto____13973 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3695__auto____13973)) {
        var s__13974 = temp__3695__auto____13973;
        return reductions.call(null, f, cljs.core.first.call(null, s__13974), cljs.core.rest.call(null, s__13974))
      }else {
        return cljs.core.list.call(null, f.call(null))
      }
    })
  };
  var reductions__13980 = function(f, init, coll) {
    return cljs.core.cons.call(null, init, new cljs.core.LazySeq(null, false, function() {
      var temp__3698__auto____13976 = cljs.core.seq.call(null, coll);
      if(cljs.core.truth_(temp__3698__auto____13976)) {
        var s__13977 = temp__3698__auto____13976;
        return reductions.call(null, f, f.call(null, init, cljs.core.first.call(null, s__13977)), cljs.core.rest.call(null, s__13977))
      }else {
        return null
      }
    }))
  };
  reductions = function(f, init, coll) {
    switch(arguments.length) {
      case 2:
        return reductions__13979.call(this, f, init);
      case 3:
        return reductions__13980.call(this, f, init, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return reductions
}();
cljs.core.juxt = function() {
  var juxt = null;
  var juxt__14061 = function(f) {
    return function() {
      var G__14066 = null;
      var G__14066__14068 = function() {
        return cljs.core.vector.call(null, f.call(null))
      };
      var G__14066__14069 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x))
      };
      var G__14066__14070 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y))
      };
      var G__14066__14071 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z))
      };
      var G__14066__14072 = function() {
        var G__14077__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args))
        };
        var G__14077 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__14077__delegate.call(this, x, y, z, args)
        };
        G__14077.cljs$lang$maxFixedArity = 3;
        G__14077.cljs$lang$applyTo = function(arglist__14079) {
          var x = cljs.core.first(arglist__14079);
          var y = cljs.core.first(cljs.core.next(arglist__14079));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__14079)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__14079)));
          return G__14077__delegate.call(this, x, y, z, args)
        };
        return G__14077
      }();
      G__14066 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__14066__14068.call(this);
          case 1:
            return G__14066__14069.call(this, x);
          case 2:
            return G__14066__14070.call(this, x, y);
          case 3:
            return G__14066__14071.call(this, x, y, z);
          default:
            return G__14066__14072.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__14066.cljs$lang$maxFixedArity = 3;
      G__14066.cljs$lang$applyTo = G__14066__14072.cljs$lang$applyTo;
      return G__14066
    }()
  };
  var juxt__14062 = function(f, g) {
    return function() {
      var G__14082 = null;
      var G__14082__14084 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null))
      };
      var G__14082__14085 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x))
      };
      var G__14082__14087 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y))
      };
      var G__14082__14088 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z))
      };
      var G__14082__14089 = function() {
        var G__14095__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args))
        };
        var G__14095 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__14095__delegate.call(this, x, y, z, args)
        };
        G__14095.cljs$lang$maxFixedArity = 3;
        G__14095.cljs$lang$applyTo = function(arglist__14098) {
          var x = cljs.core.first(arglist__14098);
          var y = cljs.core.first(cljs.core.next(arglist__14098));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__14098)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__14098)));
          return G__14095__delegate.call(this, x, y, z, args)
        };
        return G__14095
      }();
      G__14082 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__14082__14084.call(this);
          case 1:
            return G__14082__14085.call(this, x);
          case 2:
            return G__14082__14087.call(this, x, y);
          case 3:
            return G__14082__14088.call(this, x, y, z);
          default:
            return G__14082__14089.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__14082.cljs$lang$maxFixedArity = 3;
      G__14082.cljs$lang$applyTo = G__14082__14089.cljs$lang$applyTo;
      return G__14082
    }()
  };
  var juxt__14063 = function(f, g, h) {
    return function() {
      var G__14100 = null;
      var G__14100__14103 = function() {
        return cljs.core.vector.call(null, f.call(null), g.call(null), h.call(null))
      };
      var G__14100__14104 = function(x) {
        return cljs.core.vector.call(null, f.call(null, x), g.call(null, x), h.call(null, x))
      };
      var G__14100__14105 = function(x, y) {
        return cljs.core.vector.call(null, f.call(null, x, y), g.call(null, x, y), h.call(null, x, y))
      };
      var G__14100__14106 = function(x, y, z) {
        return cljs.core.vector.call(null, f.call(null, x, y, z), g.call(null, x, y, z), h.call(null, x, y, z))
      };
      var G__14100__14107 = function() {
        var G__14118__delegate = function(x, y, z, args) {
          return cljs.core.vector.call(null, cljs.core.apply.call(null, f, x, y, z, args), cljs.core.apply.call(null, g, x, y, z, args), cljs.core.apply.call(null, h, x, y, z, args))
        };
        var G__14118 = function(x, y, z, var_args) {
          var args = null;
          if(goog.isDef(var_args)) {
            args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
          }
          return G__14118__delegate.call(this, x, y, z, args)
        };
        G__14118.cljs$lang$maxFixedArity = 3;
        G__14118.cljs$lang$applyTo = function(arglist__14131) {
          var x = cljs.core.first(arglist__14131);
          var y = cljs.core.first(cljs.core.next(arglist__14131));
          var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__14131)));
          var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__14131)));
          return G__14118__delegate.call(this, x, y, z, args)
        };
        return G__14118
      }();
      G__14100 = function(x, y, z, var_args) {
        var args = var_args;
        switch(arguments.length) {
          case 0:
            return G__14100__14103.call(this);
          case 1:
            return G__14100__14104.call(this, x);
          case 2:
            return G__14100__14105.call(this, x, y);
          case 3:
            return G__14100__14106.call(this, x, y, z);
          default:
            return G__14100__14107.apply(this, arguments)
        }
        throw"Invalid arity: " + arguments.length;
      };
      G__14100.cljs$lang$maxFixedArity = 3;
      G__14100.cljs$lang$applyTo = G__14100__14107.cljs$lang$applyTo;
      return G__14100
    }()
  };
  var juxt__14064 = function() {
    var G__14135__delegate = function(f, g, h, fs) {
      var fs__14048 = cljs.core.list_STAR_.call(null, f, g, h, fs);
      return function() {
        var G__14140 = null;
        var G__14140__14141 = function() {
          return cljs.core.reduce.call(null, function(p1__13947_SHARP_, p2__13948_SHARP_) {
            return cljs.core.conj.call(null, p1__13947_SHARP_, p2__13948_SHARP_.call(null))
          }, cljs.core.Vector.fromArray([]), fs__14048)
        };
        var G__14140__14142 = function(x) {
          return cljs.core.reduce.call(null, function(p1__13949_SHARP_, p2__13950_SHARP_) {
            return cljs.core.conj.call(null, p1__13949_SHARP_, p2__13950_SHARP_.call(null, x))
          }, cljs.core.Vector.fromArray([]), fs__14048)
        };
        var G__14140__14143 = function(x, y) {
          return cljs.core.reduce.call(null, function(p1__13951_SHARP_, p2__13952_SHARP_) {
            return cljs.core.conj.call(null, p1__13951_SHARP_, p2__13952_SHARP_.call(null, x, y))
          }, cljs.core.Vector.fromArray([]), fs__14048)
        };
        var G__14140__14144 = function(x, y, z) {
          return cljs.core.reduce.call(null, function(p1__13955_SHARP_, p2__13959_SHARP_) {
            return cljs.core.conj.call(null, p1__13955_SHARP_, p2__13959_SHARP_.call(null, x, y, z))
          }, cljs.core.Vector.fromArray([]), fs__14048)
        };
        var G__14140__14145 = function() {
          var G__14155__delegate = function(x, y, z, args) {
            return cljs.core.reduce.call(null, function(p1__13960_SHARP_, p2__13962_SHARP_) {
              return cljs.core.conj.call(null, p1__13960_SHARP_, cljs.core.apply.call(null, p2__13962_SHARP_, x, y, z, args))
            }, cljs.core.Vector.fromArray([]), fs__14048)
          };
          var G__14155 = function(x, y, z, var_args) {
            var args = null;
            if(goog.isDef(var_args)) {
              args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
            }
            return G__14155__delegate.call(this, x, y, z, args)
          };
          G__14155.cljs$lang$maxFixedArity = 3;
          G__14155.cljs$lang$applyTo = function(arglist__14157) {
            var x = cljs.core.first(arglist__14157);
            var y = cljs.core.first(cljs.core.next(arglist__14157));
            var z = cljs.core.first(cljs.core.next(cljs.core.next(arglist__14157)));
            var args = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__14157)));
            return G__14155__delegate.call(this, x, y, z, args)
          };
          return G__14155
        }();
        G__14140 = function(x, y, z, var_args) {
          var args = var_args;
          switch(arguments.length) {
            case 0:
              return G__14140__14141.call(this);
            case 1:
              return G__14140__14142.call(this, x);
            case 2:
              return G__14140__14143.call(this, x, y);
            case 3:
              return G__14140__14144.call(this, x, y, z);
            default:
              return G__14140__14145.apply(this, arguments)
          }
          throw"Invalid arity: " + arguments.length;
        };
        G__14140.cljs$lang$maxFixedArity = 3;
        G__14140.cljs$lang$applyTo = G__14140__14145.cljs$lang$applyTo;
        return G__14140
      }()
    };
    var G__14135 = function(f, g, h, var_args) {
      var fs = null;
      if(goog.isDef(var_args)) {
        fs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 3), 0)
      }
      return G__14135__delegate.call(this, f, g, h, fs)
    };
    G__14135.cljs$lang$maxFixedArity = 3;
    G__14135.cljs$lang$applyTo = function(arglist__14163) {
      var f = cljs.core.first(arglist__14163);
      var g = cljs.core.first(cljs.core.next(arglist__14163));
      var h = cljs.core.first(cljs.core.next(cljs.core.next(arglist__14163)));
      var fs = cljs.core.rest(cljs.core.next(cljs.core.next(arglist__14163)));
      return G__14135__delegate.call(this, f, g, h, fs)
    };
    return G__14135
  }();
  juxt = function(f, g, h, var_args) {
    var fs = var_args;
    switch(arguments.length) {
      case 1:
        return juxt__14061.call(this, f);
      case 2:
        return juxt__14062.call(this, f, g);
      case 3:
        return juxt__14063.call(this, f, g, h);
      default:
        return juxt__14064.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  juxt.cljs$lang$maxFixedArity = 3;
  juxt.cljs$lang$applyTo = juxt__14064.cljs$lang$applyTo;
  return juxt
}();
cljs.core.dorun = function() {
  var dorun = null;
  var dorun__14180 = function(coll) {
    while(true) {
      if(cljs.core.truth_(cljs.core.seq.call(null, coll))) {
        var G__14189 = cljs.core.next.call(null, coll);
        coll = G__14189;
        continue
      }else {
        return null
      }
      break
    }
  };
  var dorun__14183 = function(n, coll) {
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3546__auto____14172 = cljs.core.seq.call(null, coll);
        if(cljs.core.truth_(and__3546__auto____14172)) {
          return n > 0
        }else {
          return and__3546__auto____14172
        }
      }())) {
        var G__14195 = n - 1;
        var G__14196 = cljs.core.next.call(null, coll);
        n = G__14195;
        coll = G__14196;
        continue
      }else {
        return null
      }
      break
    }
  };
  dorun = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return dorun__14180.call(this, n);
      case 2:
        return dorun__14183.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return dorun
}();
cljs.core.doall = function() {
  var doall = null;
  var doall__14200 = function(coll) {
    cljs.core.dorun.call(null, coll);
    return coll
  };
  var doall__14201 = function(n, coll) {
    cljs.core.dorun.call(null, n, coll);
    return coll
  };
  doall = function(n, coll) {
    switch(arguments.length) {
      case 1:
        return doall__14200.call(this, n);
      case 2:
        return doall__14201.call(this, n, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return doall
}();
cljs.core.re_matches = function re_matches(re, s) {
  var matches__14207 = re.exec(s);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.first.call(null, matches__14207), s))) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__14207), 1))) {
      return cljs.core.first.call(null, matches__14207)
    }else {
      return cljs.core.vec.call(null, matches__14207)
    }
  }else {
    return null
  }
};
cljs.core.re_find = function re_find(re, s) {
  var matches__14211 = re.exec(s);
  if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, matches__14211))) {
    return null
  }else {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, matches__14211), 1))) {
      return cljs.core.first.call(null, matches__14211)
    }else {
      return cljs.core.vec.call(null, matches__14211)
    }
  }
};
cljs.core.re_seq = function re_seq(re, s) {
  var match_data__14226 = cljs.core.re_find.call(null, re, s);
  var match_idx__14227 = s.search(re);
  var match_str__14229 = cljs.core.truth_(cljs.core.coll_QMARK_.call(null, match_data__14226)) ? cljs.core.first.call(null, match_data__14226) : match_data__14226;
  var post_match__14232 = cljs.core.subs.call(null, s, match_idx__14227 + cljs.core.count.call(null, match_str__14229));
  if(cljs.core.truth_(match_data__14226)) {
    return new cljs.core.LazySeq(null, false, function() {
      return cljs.core.cons.call(null, match_data__14226, re_seq.call(null, re, post_match__14232))
    })
  }else {
    return null
  }
};
cljs.core.re_pattern = function re_pattern(s) {
  return new RegExp(s)
};
cljs.core.pr_sequential = function pr_sequential(print_one, begin, sep, end, opts, coll) {
  return cljs.core.concat.call(null, cljs.core.Vector.fromArray([begin]), cljs.core.flatten1.call(null, cljs.core.interpose.call(null, cljs.core.Vector.fromArray([sep]), cljs.core.map.call(null, function(p1__14243_SHARP_) {
    return print_one.call(null, p1__14243_SHARP_, opts)
  }, coll))), cljs.core.Vector.fromArray([end]))
};
cljs.core.string_print = function string_print(x) {
  cljs.core._STAR_print_fn_STAR_.call(null, x);
  return null
};
cljs.core.flush = function flush() {
  return null
};
cljs.core.pr_seq = function pr_seq(obj, opts) {
  if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, obj))) {
    return cljs.core.list.call(null, "nil")
  }else {
    if(cljs.core.truth_(void 0 === obj)) {
      return cljs.core.list.call(null, "#<undefined>")
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        return cljs.core.concat.call(null, cljs.core.truth_(function() {
          var and__3546__auto____14275 = cljs.core.get.call(null, opts, "\ufdd0'meta");
          if(cljs.core.truth_(and__3546__auto____14275)) {
            var and__3546__auto____14284 = function() {
              var x__445__auto____14277 = obj;
              if(cljs.core.truth_(function() {
                var and__3546__auto____14281 = x__445__auto____14277;
                if(cljs.core.truth_(and__3546__auto____14281)) {
                  var and__3546__auto____14282 = x__445__auto____14277.cljs$core$IMeta$;
                  if(cljs.core.truth_(and__3546__auto____14282)) {
                    return cljs.core.not.call(null, x__445__auto____14277.hasOwnProperty("cljs$core$IMeta$"))
                  }else {
                    return and__3546__auto____14282
                  }
                }else {
                  return and__3546__auto____14281
                }
              }())) {
                return true
              }else {
                return cljs.core.type_satisfies_.call(null, cljs.core.IMeta, x__445__auto____14277)
              }
            }();
            if(cljs.core.truth_(and__3546__auto____14284)) {
              return cljs.core.meta.call(null, obj)
            }else {
              return and__3546__auto____14284
            }
          }else {
            return and__3546__auto____14275
          }
        }()) ? cljs.core.concat.call(null, cljs.core.Vector.fromArray(["^"]), pr_seq.call(null, cljs.core.meta.call(null, obj), opts), cljs.core.Vector.fromArray([" "])) : null, cljs.core.truth_(function() {
          var x__445__auto____14292 = obj;
          if(cljs.core.truth_(function() {
            var and__3546__auto____14293 = x__445__auto____14292;
            if(cljs.core.truth_(and__3546__auto____14293)) {
              var and__3546__auto____14294 = x__445__auto____14292.cljs$core$IPrintable$;
              if(cljs.core.truth_(and__3546__auto____14294)) {
                return cljs.core.not.call(null, x__445__auto____14292.hasOwnProperty("cljs$core$IPrintable$"))
              }else {
                return and__3546__auto____14294
              }
            }else {
              return and__3546__auto____14293
            }
          }())) {
            return true
          }else {
            return cljs.core.type_satisfies_.call(null, cljs.core.IPrintable, x__445__auto____14292)
          }
        }()) ? cljs.core._pr_seq.call(null, obj, opts) : cljs.core.list.call(null, "#<", cljs.core.str.call(null, obj), ">"))
      }else {
        return null
      }
    }
  }
};
cljs.core.pr_str_with_opts = function pr_str_with_opts(objs, opts) {
  var first_obj__14299 = cljs.core.first.call(null, objs);
  var sb__14300 = new goog.string.StringBuffer;
  var G__14301__14302 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__14301__14302)) {
    var obj__14303 = cljs.core.first.call(null, G__14301__14302);
    var G__14301__14304 = G__14301__14302;
    while(true) {
      if(cljs.core.truth_(obj__14303 === first_obj__14299)) {
      }else {
        sb__14300.append(" ")
      }
      var G__14305__14307 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__14303, opts));
      if(cljs.core.truth_(G__14305__14307)) {
        var string__14308 = cljs.core.first.call(null, G__14305__14307);
        var G__14305__14309 = G__14305__14307;
        while(true) {
          sb__14300.append(string__14308);
          var temp__3698__auto____14312 = cljs.core.next.call(null, G__14305__14309);
          if(cljs.core.truth_(temp__3698__auto____14312)) {
            var G__14305__14313 = temp__3698__auto____14312;
            var G__14326 = cljs.core.first.call(null, G__14305__14313);
            var G__14327 = G__14305__14313;
            string__14308 = G__14326;
            G__14305__14309 = G__14327;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____14314 = cljs.core.next.call(null, G__14301__14304);
      if(cljs.core.truth_(temp__3698__auto____14314)) {
        var G__14301__14318 = temp__3698__auto____14314;
        var G__14329 = cljs.core.first.call(null, G__14301__14318);
        var G__14331 = G__14301__14318;
        obj__14303 = G__14329;
        G__14301__14304 = G__14331;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return cljs.core.str.call(null, sb__14300)
};
cljs.core.pr_with_opts = function pr_with_opts(objs, opts) {
  var first_obj__14333 = cljs.core.first.call(null, objs);
  var G__14334__14336 = cljs.core.seq.call(null, objs);
  if(cljs.core.truth_(G__14334__14336)) {
    var obj__14338 = cljs.core.first.call(null, G__14334__14336);
    var G__14334__14339 = G__14334__14336;
    while(true) {
      if(cljs.core.truth_(obj__14338 === first_obj__14333)) {
      }else {
        cljs.core.string_print.call(null, " ")
      }
      var G__14341__14342 = cljs.core.seq.call(null, cljs.core.pr_seq.call(null, obj__14338, opts));
      if(cljs.core.truth_(G__14341__14342)) {
        var string__14345 = cljs.core.first.call(null, G__14341__14342);
        var G__14341__14346 = G__14341__14342;
        while(true) {
          cljs.core.string_print.call(null, string__14345);
          var temp__3698__auto____14348 = cljs.core.next.call(null, G__14341__14346);
          if(cljs.core.truth_(temp__3698__auto____14348)) {
            var G__14341__14349 = temp__3698__auto____14348;
            var G__14356 = cljs.core.first.call(null, G__14341__14349);
            var G__14357 = G__14341__14349;
            string__14345 = G__14356;
            G__14341__14346 = G__14357;
            continue
          }else {
          }
          break
        }
      }else {
      }
      var temp__3698__auto____14351 = cljs.core.next.call(null, G__14334__14339);
      if(cljs.core.truth_(temp__3698__auto____14351)) {
        var G__14334__14352 = temp__3698__auto____14351;
        var G__14359 = cljs.core.first.call(null, G__14334__14352);
        var G__14360 = G__14334__14352;
        obj__14338 = G__14359;
        G__14334__14339 = G__14360;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
};
cljs.core.newline = function newline(opts) {
  cljs.core.string_print.call(null, "\n");
  if(cljs.core.truth_(cljs.core.get.call(null, opts, "\ufdd0'flush-on-newline"))) {
    return cljs.core.flush.call(null)
  }else {
    return null
  }
};
cljs.core._STAR_flush_on_newline_STAR_ = true;
cljs.core._STAR_print_readably_STAR_ = true;
cljs.core._STAR_print_meta_STAR_ = false;
cljs.core._STAR_print_dup_STAR_ = false;
cljs.core.pr_opts = function pr_opts() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'flush-on-newline", "\ufdd0'readably", "\ufdd0'meta", "\ufdd0'dup"], {"\ufdd0'flush-on-newline":cljs.core._STAR_flush_on_newline_STAR_, "\ufdd0'readably":cljs.core._STAR_print_readably_STAR_, "\ufdd0'meta":cljs.core._STAR_print_meta_STAR_, "\ufdd0'dup":cljs.core._STAR_print_dup_STAR_})
};
cljs.core.pr_str = function() {
  var pr_str__delegate = function(objs) {
    return cljs.core.pr_str_with_opts.call(null, objs, cljs.core.pr_opts.call(null))
  };
  var pr_str = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return pr_str__delegate.call(this, objs)
  };
  pr_str.cljs$lang$maxFixedArity = 0;
  pr_str.cljs$lang$applyTo = function(arglist__14384) {
    var objs = cljs.core.seq(arglist__14384);
    return pr_str__delegate.call(this, objs)
  };
  return pr_str
}();
cljs.core.pr = function() {
  var pr__delegate = function(objs) {
    return cljs.core.pr_with_opts.call(null, objs, cljs.core.pr_opts.call(null))
  };
  var pr = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return pr__delegate.call(this, objs)
  };
  pr.cljs$lang$maxFixedArity = 0;
  pr.cljs$lang$applyTo = function(arglist__14389) {
    var objs = cljs.core.seq(arglist__14389);
    return pr__delegate.call(this, objs)
  };
  return pr
}();
cljs.core.print = function() {
  var cljs_core_print__delegate = function(objs) {
    return cljs.core.pr_with_opts.call(null, objs, cljs.core.assoc.call(null, cljs.core.pr_opts.call(null), "\ufdd0'readably", false))
  };
  var cljs_core_print = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return cljs_core_print__delegate.call(this, objs)
  };
  cljs_core_print.cljs$lang$maxFixedArity = 0;
  cljs_core_print.cljs$lang$applyTo = function(arglist__14419) {
    var objs = cljs.core.seq(arglist__14419);
    return cljs_core_print__delegate.call(this, objs)
  };
  return cljs_core_print
}();
cljs.core.println = function() {
  var println__delegate = function(objs) {
    cljs.core.pr_with_opts.call(null, objs, cljs.core.assoc.call(null, cljs.core.pr_opts.call(null), "\ufdd0'readably", false));
    return cljs.core.newline.call(null, cljs.core.pr_opts.call(null))
  };
  var println = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return println__delegate.call(this, objs)
  };
  println.cljs$lang$maxFixedArity = 0;
  println.cljs$lang$applyTo = function(arglist__14422) {
    var objs = cljs.core.seq(arglist__14422);
    return println__delegate.call(this, objs)
  };
  return println
}();
cljs.core.prn = function() {
  var prn__delegate = function(objs) {
    cljs.core.pr_with_opts.call(null, objs, cljs.core.pr_opts.call(null));
    return cljs.core.newline.call(null, cljs.core.pr_opts.call(null))
  };
  var prn = function(var_args) {
    var objs = null;
    if(goog.isDef(var_args)) {
      objs = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return prn__delegate.call(this, objs)
  };
  prn.cljs$lang$maxFixedArity = 0;
  prn.cljs$lang$applyTo = function(arglist__14456) {
    var objs = cljs.core.seq(arglist__14456);
    return prn__delegate.call(this, objs)
  };
  return prn
}();
cljs.core.HashMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.HashMap.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  var pr_pair__14464 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__14464, "{", ", ", "}", opts, coll)
};
cljs.core.IPrintable["number"] = true;
cljs.core._pr_seq["number"] = function(n, opts) {
  return cljs.core.list.call(null, cljs.core.str.call(null, n))
};
cljs.core.IndexedSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.IndexedSeq.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.Subvec.prototype.cljs$core$IPrintable$ = true;
cljs.core.Subvec.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.LazySeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.LazySeq.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.IPrintable["boolean"] = true;
cljs.core._pr_seq["boolean"] = function(bool, opts) {
  return cljs.core.list.call(null, cljs.core.str.call(null, bool))
};
cljs.core.Set.prototype.cljs$core$IPrintable$ = true;
cljs.core.Set.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "#{", " ", "}", opts, coll)
};
cljs.core.IPrintable["string"] = true;
cljs.core._pr_seq["string"] = function(obj, opts) {
  if(cljs.core.truth_(cljs.core.keyword_QMARK_.call(null, obj))) {
    return cljs.core.list.call(null, cljs.core.str.call(null, ":", function() {
      var temp__3698__auto____14538 = cljs.core.namespace.call(null, obj);
      if(cljs.core.truth_(temp__3698__auto____14538)) {
        var nspc__14539 = temp__3698__auto____14538;
        return cljs.core.str.call(null, nspc__14539, "/")
      }else {
        return null
      }
    }(), cljs.core.name.call(null, obj)))
  }else {
    if(cljs.core.truth_(cljs.core.symbol_QMARK_.call(null, obj))) {
      return cljs.core.list.call(null, cljs.core.str.call(null, function() {
        var temp__3698__auto____14541 = cljs.core.namespace.call(null, obj);
        if(cljs.core.truth_(temp__3698__auto____14541)) {
          var nspc__14542 = temp__3698__auto____14541;
          return cljs.core.str.call(null, nspc__14542, "/")
        }else {
          return null
        }
      }(), cljs.core.name.call(null, obj)))
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        return cljs.core.list.call(null, cljs.core.truth_("\ufdd0'readably".call(null, opts)) ? goog.string.quote.call(null, obj) : obj)
      }else {
        return null
      }
    }
  }
};
cljs.core.Vector.prototype.cljs$core$IPrintable$ = true;
cljs.core.Vector.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "[", " ", "]", opts, coll)
};
cljs.core.List.prototype.cljs$core$IPrintable$ = true;
cljs.core.List.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.IPrintable["array"] = true;
cljs.core._pr_seq["array"] = function(a, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "#<Array [", ", ", "]>", opts, a)
};
cljs.core.PersistentQueueSeq.prototype.cljs$core$IPrintable$ = true;
cljs.core.PersistentQueueSeq.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.EmptyList.prototype.cljs$core$IPrintable$ = true;
cljs.core.EmptyList.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.list.call(null, "()")
};
cljs.core.Cons.prototype.cljs$core$IPrintable$ = true;
cljs.core.Cons.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.Range.prototype.cljs$core$IPrintable$ = true;
cljs.core.Range.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "(", " ", ")", opts, coll)
};
cljs.core.ObjMap.prototype.cljs$core$IPrintable$ = true;
cljs.core.ObjMap.prototype.cljs$core$IPrintable$_pr_seq = function(coll, opts) {
  var pr_pair__14556 = function(keyval) {
    return cljs.core.pr_sequential.call(null, cljs.core.pr_seq, "", " ", "", opts, keyval)
  };
  return cljs.core.pr_sequential.call(null, pr_pair__14556, "{", ", ", "}", opts, coll)
};
cljs.core.Atom = function(state, meta, validator, watches) {
  this.state = state;
  this.meta = meta;
  this.validator = validator;
  this.watches = watches
};
cljs.core.Atom.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.Atom")
};
cljs.core.Atom.prototype.cljs$core$IHash$ = true;
cljs.core.Atom.prototype.cljs$core$IHash$_hash = function(this$) {
  var this__14590 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$ = true;
cljs.core.Atom.prototype.cljs$core$IWatchable$_notify_watches = function(this$, oldval, newval) {
  var this__14592 = this;
  var G__14593__14594 = cljs.core.seq.call(null, this__14592.watches);
  if(cljs.core.truth_(G__14593__14594)) {
    var G__14597__14600 = cljs.core.first.call(null, G__14593__14594);
    var vec__14598__14601 = G__14597__14600;
    var key__14604 = cljs.core.nth.call(null, vec__14598__14601, 0, null);
    var f__14605 = cljs.core.nth.call(null, vec__14598__14601, 1, null);
    var G__14593__14606 = G__14593__14594;
    var G__14597__14607 = G__14597__14600;
    var G__14593__14609 = G__14593__14606;
    while(true) {
      var vec__14610__14611 = G__14597__14607;
      var key__14612 = cljs.core.nth.call(null, vec__14610__14611, 0, null);
      var f__14613 = cljs.core.nth.call(null, vec__14610__14611, 1, null);
      var G__14593__14614 = G__14593__14609;
      f__14613.call(null, key__14612, this$, oldval, newval);
      var temp__3698__auto____14616 = cljs.core.next.call(null, G__14593__14614);
      if(cljs.core.truth_(temp__3698__auto____14616)) {
        var G__14593__14617 = temp__3698__auto____14616;
        var G__14645 = cljs.core.first.call(null, G__14593__14617);
        var G__14647 = G__14593__14617;
        G__14597__14607 = G__14645;
        G__14593__14609 = G__14647;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_add_watch = function(this$, key, f) {
  var this__14620 = this;
  return this$.watches = cljs.core.assoc.call(null, this__14620.watches, key, f)
};
cljs.core.Atom.prototype.cljs$core$IWatchable$_remove_watch = function(this$, key) {
  var this__14622 = this;
  return this$.watches = cljs.core.dissoc.call(null, this__14622.watches, key)
};
cljs.core.Atom.prototype.cljs$core$IPrintable$ = true;
cljs.core.Atom.prototype.cljs$core$IPrintable$_pr_seq = function(a, opts) {
  var this__14623 = this;
  return cljs.core.concat.call(null, cljs.core.Vector.fromArray(["#<Atom: "]), cljs.core._pr_seq.call(null, this__14623.state, opts), ">")
};
cljs.core.Atom.prototype.cljs$core$IMeta$ = true;
cljs.core.Atom.prototype.cljs$core$IMeta$_meta = function(_) {
  var this__14624 = this;
  return this__14624.meta
};
cljs.core.Atom.prototype.cljs$core$IDeref$ = true;
cljs.core.Atom.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__14625 = this;
  return this__14625.state
};
cljs.core.Atom.prototype.cljs$core$IEquiv$ = true;
cljs.core.Atom.prototype.cljs$core$IEquiv$_equiv = function(o, other) {
  var this__14626 = this;
  return o === other
};
cljs.core.Atom;
cljs.core.atom = function() {
  var atom = null;
  var atom__14753 = function(x) {
    return new cljs.core.Atom(x, null, null, null)
  };
  var atom__14754 = function() {
    var G__14756__delegate = function(x, p__14741) {
      var map__14742__14743 = p__14741;
      var map__14742__14744 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__14742__14743)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__14742__14743) : map__14742__14743;
      var validator__14745 = cljs.core.get.call(null, map__14742__14744, "\ufdd0'validator");
      var meta__14746 = cljs.core.get.call(null, map__14742__14744, "\ufdd0'meta");
      return new cljs.core.Atom(x, meta__14746, validator__14745, null)
    };
    var G__14756 = function(x, var_args) {
      var p__14741 = null;
      if(goog.isDef(var_args)) {
        p__14741 = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__14756__delegate.call(this, x, p__14741)
    };
    G__14756.cljs$lang$maxFixedArity = 1;
    G__14756.cljs$lang$applyTo = function(arglist__14761) {
      var x = cljs.core.first(arglist__14761);
      var p__14741 = cljs.core.rest(arglist__14761);
      return G__14756__delegate.call(this, x, p__14741)
    };
    return G__14756
  }();
  atom = function(x, var_args) {
    var p__14741 = var_args;
    switch(arguments.length) {
      case 1:
        return atom__14753.call(this, x);
      default:
        return atom__14754.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  atom.cljs$lang$maxFixedArity = 1;
  atom.cljs$lang$applyTo = atom__14754.cljs$lang$applyTo;
  return atom
}();
cljs.core.reset_BANG_ = function reset_BANG_(a, new_value) {
  var temp__3698__auto____14765 = a.validator;
  if(cljs.core.truth_(temp__3698__auto____14765)) {
    var validate__14766 = temp__3698__auto____14765;
    if(cljs.core.truth_(validate__14766.call(null, new_value))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", "Validator rejected reference state", "\n", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'validate", "\ufdd1'new-value"), cljs.core.hash_map("\ufdd0'line", 3061)))));
    }
  }else {
  }
  var old_value__14768 = a.state;
  a.state = new_value;
  cljs.core._notify_watches.call(null, a, old_value__14768, new_value);
  return new_value
};
cljs.core.swap_BANG_ = function() {
  var swap_BANG_ = null;
  var swap_BANG___14777 = function(a, f) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state))
  };
  var swap_BANG___14779 = function(a, f, x) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x))
  };
  var swap_BANG___14780 = function(a, f, x, y) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y))
  };
  var swap_BANG___14781 = function(a, f, x, y, z) {
    return cljs.core.reset_BANG_.call(null, a, f.call(null, a.state, x, y, z))
  };
  var swap_BANG___14782 = function() {
    var G__14789__delegate = function(a, f, x, y, z, more) {
      return cljs.core.reset_BANG_.call(null, a, cljs.core.apply.call(null, f, a.state, x, y, z, more))
    };
    var G__14789 = function(a, f, x, y, z, var_args) {
      var more = null;
      if(goog.isDef(var_args)) {
        more = cljs.core.array_seq(Array.prototype.slice.call(arguments, 5), 0)
      }
      return G__14789__delegate.call(this, a, f, x, y, z, more)
    };
    G__14789.cljs$lang$maxFixedArity = 5;
    G__14789.cljs$lang$applyTo = function(arglist__14791) {
      var a = cljs.core.first(arglist__14791);
      var f = cljs.core.first(cljs.core.next(arglist__14791));
      var x = cljs.core.first(cljs.core.next(cljs.core.next(arglist__14791)));
      var y = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(arglist__14791))));
      var z = cljs.core.first(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__14791)))));
      var more = cljs.core.rest(cljs.core.next(cljs.core.next(cljs.core.next(cljs.core.next(arglist__14791)))));
      return G__14789__delegate.call(this, a, f, x, y, z, more)
    };
    return G__14789
  }();
  swap_BANG_ = function(a, f, x, y, z, var_args) {
    var more = var_args;
    switch(arguments.length) {
      case 2:
        return swap_BANG___14777.call(this, a, f);
      case 3:
        return swap_BANG___14779.call(this, a, f, x);
      case 4:
        return swap_BANG___14780.call(this, a, f, x, y);
      case 5:
        return swap_BANG___14781.call(this, a, f, x, y, z);
      default:
        return swap_BANG___14782.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  swap_BANG_.cljs$lang$maxFixedArity = 5;
  swap_BANG_.cljs$lang$applyTo = swap_BANG___14782.cljs$lang$applyTo;
  return swap_BANG_
}();
cljs.core.compare_and_set_BANG_ = function compare_and_set_BANG_(a, oldval, newval) {
  if(cljs.core.truth_(cljs.core._EQ_.call(null, a.state, oldval))) {
    cljs.core.reset_BANG_.call(null, a, newval);
    return true
  }else {
    return false
  }
};
cljs.core.deref = function deref(o) {
  return cljs.core._deref.call(null, o)
};
cljs.core.set_validator_BANG_ = function set_validator_BANG_(iref, val) {
  return iref.validator = val
};
cljs.core.get_validator = function get_validator(iref) {
  return iref.validator
};
cljs.core.alter_meta_BANG_ = function() {
  var alter_meta_BANG___delegate = function(iref, f, args) {
    return iref.meta = cljs.core.apply.call(null, f, iref.meta, args)
  };
  var alter_meta_BANG_ = function(iref, f, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return alter_meta_BANG___delegate.call(this, iref, f, args)
  };
  alter_meta_BANG_.cljs$lang$maxFixedArity = 2;
  alter_meta_BANG_.cljs$lang$applyTo = function(arglist__14797) {
    var iref = cljs.core.first(arglist__14797);
    var f = cljs.core.first(cljs.core.next(arglist__14797));
    var args = cljs.core.rest(cljs.core.next(arglist__14797));
    return alter_meta_BANG___delegate.call(this, iref, f, args)
  };
  return alter_meta_BANG_
}();
cljs.core.reset_meta_BANG_ = function reset_meta_BANG_(iref, m) {
  return iref.meta = m
};
cljs.core.add_watch = function add_watch(iref, key, f) {
  return cljs.core._add_watch.call(null, iref, key, f)
};
cljs.core.remove_watch = function remove_watch(iref, key) {
  return cljs.core._remove_watch.call(null, iref, key)
};
cljs.core.gensym_counter = null;
cljs.core.gensym = function() {
  var gensym = null;
  var gensym__14817 = function() {
    return gensym.call(null, "G__")
  };
  var gensym__14818 = function(prefix_string) {
    if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, cljs.core.gensym_counter))) {
      cljs.core.gensym_counter = cljs.core.atom.call(null, 0)
    }else {
    }
    return cljs.core.symbol.call(null, cljs.core.str.call(null, prefix_string, cljs.core.swap_BANG_.call(null, cljs.core.gensym_counter, cljs.core.inc)))
  };
  gensym = function(prefix_string) {
    switch(arguments.length) {
      case 0:
        return gensym__14817.call(this);
      case 1:
        return gensym__14818.call(this, prefix_string)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return gensym
}();
cljs.core.fixture1 = 1;
cljs.core.fixture2 = 2;
cljs.core.Delay = function(f, state) {
  this.f = f;
  this.state = state
};
cljs.core.Delay.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.Delay")
};
cljs.core.Delay.prototype.cljs$core$IPending$ = true;
cljs.core.Delay.prototype.cljs$core$IPending$_realized_QMARK_ = function(d) {
  var this__14832 = this;
  return cljs.core.not.call(null, cljs.core.nil_QMARK_.call(null, cljs.core.deref.call(null, this__14832.state)))
};
cljs.core.Delay.prototype.cljs$core$IDeref$ = true;
cljs.core.Delay.prototype.cljs$core$IDeref$_deref = function(_) {
  var this__14835 = this;
  if(cljs.core.truth_(cljs.core.deref.call(null, this__14835.state))) {
  }else {
    cljs.core.swap_BANG_.call(null, this__14835.state, this__14835.f)
  }
  return cljs.core.deref.call(null, this__14835.state)
};
cljs.core.Delay;
cljs.core.delay = function() {
  var delay__delegate = function(body) {
    return new cljs.core.Delay(function() {
      return cljs.core.apply.call(null, cljs.core.identity, body)
    }, cljs.core.atom.call(null, null))
  };
  var delay = function(var_args) {
    var body = null;
    if(goog.isDef(var_args)) {
      body = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
    }
    return delay__delegate.call(this, body)
  };
  delay.cljs$lang$maxFixedArity = 0;
  delay.cljs$lang$applyTo = function(arglist__14839) {
    var body = cljs.core.seq(arglist__14839);
    return delay__delegate.call(this, body)
  };
  return delay
}();
cljs.core.delay_QMARK_ = function delay_QMARK_(x) {
  return cljs.core.instance_QMARK_.call(null, cljs.core.Delay, x)
};
cljs.core.force = function force(x) {
  if(cljs.core.truth_(cljs.core.delay_QMARK_.call(null, x))) {
    return cljs.core.deref.call(null, x)
  }else {
    return x
  }
};
cljs.core.realized_QMARK_ = function realized_QMARK_(d) {
  return cljs.core._realized_QMARK_.call(null, d)
};
cljs.core.js__GT_clj = function() {
  var js__GT_clj__delegate = function(x, options) {
    var map__14908__14910 = options;
    var map__14908__14967 = cljs.core.truth_(cljs.core.seq_QMARK_.call(null, map__14908__14910)) ? cljs.core.apply.call(null, cljs.core.hash_map, map__14908__14910) : map__14908__14910;
    var keywordize_keys__14968 = cljs.core.get.call(null, map__14908__14967, "\ufdd0'keywordize-keys");
    var keyfn__14970 = cljs.core.truth_(keywordize_keys__14968) ? cljs.core.keyword : cljs.core.str;
    var f__15024 = function thisfn(x) {
      if(cljs.core.truth_(cljs.core.seq_QMARK_.call(null, x))) {
        return cljs.core.doall.call(null, cljs.core.map.call(null, thisfn, x))
      }else {
        if(cljs.core.truth_(cljs.core.coll_QMARK_.call(null, x))) {
          return cljs.core.into.call(null, cljs.core.empty.call(null, x), cljs.core.map.call(null, thisfn, x))
        }else {
          if(cljs.core.truth_(goog.isArray.call(null, x))) {
            return cljs.core.vec.call(null, cljs.core.map.call(null, thisfn, x))
          }else {
            if(cljs.core.truth_(goog.isObject.call(null, x))) {
              return cljs.core.into.call(null, cljs.core.ObjMap.fromObject([], {}), function() {
                var iter__509__auto____15021 = function iter__14971(s__14973) {
                  return new cljs.core.LazySeq(null, false, function() {
                    var s__14973__15015 = s__14973;
                    while(true) {
                      if(cljs.core.truth_(cljs.core.seq.call(null, s__14973__15015))) {
                        var k__15016 = cljs.core.first.call(null, s__14973__15015);
                        return cljs.core.cons.call(null, cljs.core.Vector.fromArray([keyfn__14970.call(null, k__15016), thisfn.call(null, x[k__15016])]), iter__14971.call(null, cljs.core.rest.call(null, s__14973__15015)))
                      }else {
                        return null
                      }
                      break
                    }
                  })
                };
                return iter__509__auto____15021.call(null, cljs.core.js_keys.call(null, x))
              }())
            }else {
              if(cljs.core.truth_("\ufdd0'else")) {
                return x
              }else {
                return null
              }
            }
          }
        }
      }
    };
    return f__15024.call(null, x)
  };
  var js__GT_clj = function(x, var_args) {
    var options = null;
    if(goog.isDef(var_args)) {
      options = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return js__GT_clj__delegate.call(this, x, options)
  };
  js__GT_clj.cljs$lang$maxFixedArity = 1;
  js__GT_clj.cljs$lang$applyTo = function(arglist__15029) {
    var x = cljs.core.first(arglist__15029);
    var options = cljs.core.rest(arglist__15029);
    return js__GT_clj__delegate.call(this, x, options)
  };
  return js__GT_clj
}();
cljs.core.memoize = function memoize(f) {
  var mem__15042 = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
  return function() {
    var G__15057__delegate = function(args) {
      var temp__3695__auto____15045 = cljs.core.get.call(null, cljs.core.deref.call(null, mem__15042), args);
      if(cljs.core.truth_(temp__3695__auto____15045)) {
        var v__15047 = temp__3695__auto____15045;
        return v__15047
      }else {
        var ret__15049 = cljs.core.apply.call(null, f, args);
        cljs.core.swap_BANG_.call(null, mem__15042, cljs.core.assoc, args, ret__15049);
        return ret__15049
      }
    };
    var G__15057 = function(var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 0), 0)
      }
      return G__15057__delegate.call(this, args)
    };
    G__15057.cljs$lang$maxFixedArity = 0;
    G__15057.cljs$lang$applyTo = function(arglist__15062) {
      var args = cljs.core.seq(arglist__15062);
      return G__15057__delegate.call(this, args)
    };
    return G__15057
  }()
};
cljs.core.trampoline = function() {
  var trampoline = null;
  var trampoline__15068 = function(f) {
    while(true) {
      var ret__15064 = f.call(null);
      if(cljs.core.truth_(cljs.core.fn_QMARK_.call(null, ret__15064))) {
        var G__15072 = ret__15064;
        f = G__15072;
        continue
      }else {
        return ret__15064
      }
      break
    }
  };
  var trampoline__15069 = function() {
    var G__15073__delegate = function(f, args) {
      return trampoline.call(null, function() {
        return cljs.core.apply.call(null, f, args)
      })
    };
    var G__15073 = function(f, var_args) {
      var args = null;
      if(goog.isDef(var_args)) {
        args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
      }
      return G__15073__delegate.call(this, f, args)
    };
    G__15073.cljs$lang$maxFixedArity = 1;
    G__15073.cljs$lang$applyTo = function(arglist__15080) {
      var f = cljs.core.first(arglist__15080);
      var args = cljs.core.rest(arglist__15080);
      return G__15073__delegate.call(this, f, args)
    };
    return G__15073
  }();
  trampoline = function(f, var_args) {
    var args = var_args;
    switch(arguments.length) {
      case 1:
        return trampoline__15068.call(this, f);
      default:
        return trampoline__15069.apply(this, arguments)
    }
    throw"Invalid arity: " + arguments.length;
  };
  trampoline.cljs$lang$maxFixedArity = 1;
  trampoline.cljs$lang$applyTo = trampoline__15069.cljs$lang$applyTo;
  return trampoline
}();
cljs.core.rand = function() {
  var rand = null;
  var rand__15090 = function() {
    return rand.call(null, 1)
  };
  var rand__15091 = function(n) {
    return Math.random() * n
  };
  rand = function(n) {
    switch(arguments.length) {
      case 0:
        return rand__15090.call(this);
      case 1:
        return rand__15091.call(this, n)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return rand
}();
cljs.core.rand_int = function rand_int(n) {
  return Math.floor(Math.random() * n)
};
cljs.core.rand_nth = function rand_nth(coll) {
  return cljs.core.nth.call(null, coll, cljs.core.rand_int.call(null, cljs.core.count.call(null, coll)))
};
cljs.core.group_by = function group_by(f, coll) {
  return cljs.core.reduce.call(null, function(ret, x) {
    var k__15098 = f.call(null, x);
    return cljs.core.assoc.call(null, ret, k__15098, cljs.core.conj.call(null, cljs.core.get.call(null, ret, k__15098, cljs.core.Vector.fromArray([])), x))
  }, cljs.core.ObjMap.fromObject([], {}), coll)
};
cljs.core.make_hierarchy = function make_hierarchy() {
  return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'descendants", "\ufdd0'ancestors"], {"\ufdd0'parents":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'descendants":cljs.core.ObjMap.fromObject([], {}), "\ufdd0'ancestors":cljs.core.ObjMap.fromObject([], {})})
};
cljs.core.global_hierarchy = cljs.core.atom.call(null, cljs.core.make_hierarchy.call(null));
cljs.core.isa_QMARK_ = function() {
  var isa_QMARK_ = null;
  var isa_QMARK___15141 = function(child, parent) {
    return isa_QMARK_.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), child, parent)
  };
  var isa_QMARK___15142 = function(h, child, parent) {
    var or__3548__auto____15121 = cljs.core._EQ_.call(null, child, parent);
    if(cljs.core.truth_(or__3548__auto____15121)) {
      return or__3548__auto____15121
    }else {
      var or__3548__auto____15123 = cljs.core.contains_QMARK_.call(null, "\ufdd0'ancestors".call(null, h).call(null, child), parent);
      if(cljs.core.truth_(or__3548__auto____15123)) {
        return or__3548__auto____15123
      }else {
        var and__3546__auto____15124 = cljs.core.vector_QMARK_.call(null, parent);
        if(cljs.core.truth_(and__3546__auto____15124)) {
          var and__3546__auto____15125 = cljs.core.vector_QMARK_.call(null, child);
          if(cljs.core.truth_(and__3546__auto____15125)) {
            var and__3546__auto____15132 = cljs.core._EQ_.call(null, cljs.core.count.call(null, parent), cljs.core.count.call(null, child));
            if(cljs.core.truth_(and__3546__auto____15132)) {
              var ret__15133 = true;
              var i__15134 = 0;
              while(true) {
                if(cljs.core.truth_(function() {
                  var or__3548__auto____15137 = cljs.core.not.call(null, ret__15133);
                  if(cljs.core.truth_(or__3548__auto____15137)) {
                    return or__3548__auto____15137
                  }else {
                    return cljs.core._EQ_.call(null, i__15134, cljs.core.count.call(null, parent))
                  }
                }())) {
                  return ret__15133
                }else {
                  var G__15151 = isa_QMARK_.call(null, h, child.call(null, i__15134), parent.call(null, i__15134));
                  var G__15152 = i__15134 + 1;
                  ret__15133 = G__15151;
                  i__15134 = G__15152;
                  continue
                }
                break
              }
            }else {
              return and__3546__auto____15132
            }
          }else {
            return and__3546__auto____15125
          }
        }else {
          return and__3546__auto____15124
        }
      }
    }
  };
  isa_QMARK_ = function(h, child, parent) {
    switch(arguments.length) {
      case 2:
        return isa_QMARK___15141.call(this, h, child);
      case 3:
        return isa_QMARK___15142.call(this, h, child, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return isa_QMARK_
}();
cljs.core.parents = function() {
  var parents = null;
  var parents__15158 = function(tag) {
    return parents.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var parents__15159 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'parents".call(null, h), tag))
  };
  parents = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return parents__15158.call(this, h);
      case 2:
        return parents__15159.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return parents
}();
cljs.core.ancestors = function() {
  var ancestors = null;
  var ancestors__15163 = function(tag) {
    return ancestors.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var ancestors__15164 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'ancestors".call(null, h), tag))
  };
  ancestors = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return ancestors__15163.call(this, h);
      case 2:
        return ancestors__15164.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return ancestors
}();
cljs.core.descendants = function() {
  var descendants = null;
  var descendants__15182 = function(tag) {
    return descendants.call(null, cljs.core.deref.call(null, cljs.core.global_hierarchy), tag)
  };
  var descendants__15183 = function(h, tag) {
    return cljs.core.not_empty.call(null, cljs.core.get.call(null, "\ufdd0'descendants".call(null, h), tag))
  };
  descendants = function(h, tag) {
    switch(arguments.length) {
      case 1:
        return descendants__15182.call(this, h);
      case 2:
        return descendants__15183.call(this, h, tag)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return descendants
}();
cljs.core.derive = function() {
  var derive = null;
  var derive__15203 = function(tag, parent) {
    if(cljs.core.truth_(cljs.core.namespace.call(null, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'namespace", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3353)))));
    }
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, derive, tag, parent);
    return null
  };
  var derive__15204 = function(h, tag, parent) {
    if(cljs.core.truth_(cljs.core.not_EQ_.call(null, tag, parent))) {
    }else {
      throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'not=", "\ufdd1'tag", "\ufdd1'parent"), cljs.core.hash_map("\ufdd0'line", 3357)))));
    }
    var tp__15193 = "\ufdd0'parents".call(null, h);
    var td__15195 = "\ufdd0'descendants".call(null, h);
    var ta__15196 = "\ufdd0'ancestors".call(null, h);
    var tf__15197 = function(m, source, sources, target, targets) {
      return cljs.core.reduce.call(null, function(ret, k) {
        return cljs.core.assoc.call(null, ret, k, cljs.core.reduce.call(null, cljs.core.conj, cljs.core.get.call(null, targets, k, cljs.core.set([])), cljs.core.cons.call(null, target, targets.call(null, target))))
      }, m, cljs.core.cons.call(null, source, sources.call(null, source)))
    };
    var or__3548__auto____15200 = cljs.core.truth_(cljs.core.contains_QMARK_.call(null, tp__15193.call(null, tag), parent)) ? null : function() {
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__15196.call(null, tag), parent))) {
        throw new Error(cljs.core.str.call(null, tag, "already has", parent, "as ancestor"));
      }else {
      }
      if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, ta__15196.call(null, parent), tag))) {
        throw new Error(cljs.core.str.call(null, "Cyclic derivation:", parent, "has", tag, "as ancestor"));
      }else {
      }
      return cljs.core.ObjMap.fromObject(["\ufdd0'parents", "\ufdd0'ancestors", "\ufdd0'descendants"], {"\ufdd0'parents":cljs.core.assoc.call(null, "\ufdd0'parents".call(null, h), tag, cljs.core.conj.call(null, cljs.core.get.call(null, tp__15193, tag, cljs.core.set([])), parent)), "\ufdd0'ancestors":tf__15197.call(null, "\ufdd0'ancestors".call(null, h), tag, td__15195, parent, ta__15196), "\ufdd0'descendants":tf__15197.call(null, "\ufdd0'descendants".call(null, h), parent, ta__15196, tag, td__15195)})
    }();
    if(cljs.core.truth_(or__3548__auto____15200)) {
      return or__3548__auto____15200
    }else {
      return h
    }
  };
  derive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return derive__15203.call(this, h, tag);
      case 3:
        return derive__15204.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return derive
}();
cljs.core.underive = function() {
  var underive = null;
  var underive__15226 = function(tag, parent) {
    cljs.core.swap_BANG_.call(null, cljs.core.global_hierarchy, underive, tag, parent);
    return null
  };
  var underive__15227 = function(h, tag, parent) {
    var parentMap__15220 = "\ufdd0'parents".call(null, h);
    var childsParents__15221 = cljs.core.truth_(parentMap__15220.call(null, tag)) ? cljs.core.disj.call(null, parentMap__15220.call(null, tag), parent) : cljs.core.set([]);
    var newParents__15222 = cljs.core.truth_(cljs.core.not_empty.call(null, childsParents__15221)) ? cljs.core.assoc.call(null, parentMap__15220, tag, childsParents__15221) : cljs.core.dissoc.call(null, parentMap__15220, tag);
    var deriv_seq__15224 = cljs.core.flatten.call(null, cljs.core.map.call(null, function(p1__15187_SHARP_) {
      return cljs.core.cons.call(null, cljs.core.first.call(null, p1__15187_SHARP_), cljs.core.interpose.call(null, cljs.core.first.call(null, p1__15187_SHARP_), cljs.core.second.call(null, p1__15187_SHARP_)))
    }, cljs.core.seq.call(null, newParents__15222)));
    if(cljs.core.truth_(cljs.core.contains_QMARK_.call(null, parentMap__15220.call(null, tag), parent))) {
      return cljs.core.reduce.call(null, function(p1__15190_SHARP_, p2__15191_SHARP_) {
        return cljs.core.apply.call(null, cljs.core.derive, p1__15190_SHARP_, p2__15191_SHARP_)
      }, cljs.core.make_hierarchy.call(null), cljs.core.partition.call(null, 2, deriv_seq__15224))
    }else {
      return h
    }
  };
  underive = function(h, tag, parent) {
    switch(arguments.length) {
      case 2:
        return underive__15226.call(this, h, tag);
      case 3:
        return underive__15227.call(this, h, tag, parent)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return underive
}();
cljs.core.reset_cache = function reset_cache(method_cache, method_table, cached_hierarchy, hierarchy) {
  cljs.core.swap_BANG_.call(null, method_cache, function(_) {
    return cljs.core.deref.call(null, method_table)
  });
  return cljs.core.swap_BANG_.call(null, cached_hierarchy, function(_) {
    return cljs.core.deref.call(null, hierarchy)
  })
};
cljs.core.prefers_STAR_ = function prefers_STAR_(x, y, prefer_table) {
  var xprefs__15245 = cljs.core.deref.call(null, prefer_table).call(null, x);
  var or__3548__auto____15247 = cljs.core.truth_(function() {
    var and__3546__auto____15246 = xprefs__15245;
    if(cljs.core.truth_(and__3546__auto____15246)) {
      return xprefs__15245.call(null, y)
    }else {
      return and__3546__auto____15246
    }
  }()) ? true : null;
  if(cljs.core.truth_(or__3548__auto____15247)) {
    return or__3548__auto____15247
  }else {
    var or__3548__auto____15250 = function() {
      var ps__15249 = cljs.core.parents.call(null, y);
      while(true) {
        if(cljs.core.truth_(cljs.core.count.call(null, ps__15249) > 0)) {
          if(cljs.core.truth_(prefers_STAR_.call(null, x, cljs.core.first.call(null, ps__15249), prefer_table))) {
          }else {
          }
          var G__15254 = cljs.core.rest.call(null, ps__15249);
          ps__15249 = G__15254;
          continue
        }else {
          return null
        }
        break
      }
    }();
    if(cljs.core.truth_(or__3548__auto____15250)) {
      return or__3548__auto____15250
    }else {
      var or__3548__auto____15252 = function() {
        var ps__15251 = cljs.core.parents.call(null, x);
        while(true) {
          if(cljs.core.truth_(cljs.core.count.call(null, ps__15251) > 0)) {
            if(cljs.core.truth_(prefers_STAR_.call(null, cljs.core.first.call(null, ps__15251), y, prefer_table))) {
            }else {
            }
            var G__15255 = cljs.core.rest.call(null, ps__15251);
            ps__15251 = G__15255;
            continue
          }else {
            return null
          }
          break
        }
      }();
      if(cljs.core.truth_(or__3548__auto____15252)) {
        return or__3548__auto____15252
      }else {
        return false
      }
    }
  }
};
cljs.core.dominates = function dominates(x, y, prefer_table) {
  var or__3548__auto____15257 = cljs.core.prefers_STAR_.call(null, x, y, prefer_table);
  if(cljs.core.truth_(or__3548__auto____15257)) {
    return or__3548__auto____15257
  }else {
    return cljs.core.isa_QMARK_.call(null, x, y)
  }
};
cljs.core.find_and_cache_best_method = function find_and_cache_best_method(name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  var best_entry__15280 = cljs.core.reduce.call(null, function(be, p__15266) {
    var vec__15267__15269 = p__15266;
    var k__15270 = cljs.core.nth.call(null, vec__15267__15269, 0, null);
    var ___15271 = cljs.core.nth.call(null, vec__15267__15269, 1, null);
    var e__15272 = vec__15267__15269;
    if(cljs.core.truth_(cljs.core.isa_QMARK_.call(null, dispatch_val, k__15270))) {
      var be2__15277 = cljs.core.truth_(function() {
        var or__3548__auto____15274 = cljs.core.nil_QMARK_.call(null, be);
        if(cljs.core.truth_(or__3548__auto____15274)) {
          return or__3548__auto____15274
        }else {
          return cljs.core.dominates.call(null, k__15270, cljs.core.first.call(null, be), prefer_table)
        }
      }()) ? e__15272 : be;
      if(cljs.core.truth_(cljs.core.dominates.call(null, cljs.core.first.call(null, be2__15277), k__15270, prefer_table))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Multiple methods in multimethod '", name, "' match dispatch value: ", dispatch_val, " -> ", k__15270, " and ", cljs.core.first.call(null, be2__15277), ", and neither is preferred"));
      }
      return be2__15277
    }else {
      return be
    }
  }, null, cljs.core.deref.call(null, method_table));
  if(cljs.core.truth_(best_entry__15280)) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, cached_hierarchy), cljs.core.deref.call(null, hierarchy)))) {
      cljs.core.swap_BANG_.call(null, method_cache, cljs.core.assoc, dispatch_val, cljs.core.second.call(null, best_entry__15280));
      return cljs.core.second.call(null, best_entry__15280)
    }else {
      cljs.core.reset_cache.call(null, method_cache, method_table, cached_hierarchy, hierarchy);
      return find_and_cache_best_method.call(null, name, dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy)
    }
  }else {
    return null
  }
};
cljs.core.IMultiFn = {};
cljs.core._reset = function _reset(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____15293 = mf;
    if(cljs.core.truth_(and__3546__auto____15293)) {
      return mf.cljs$core$IMultiFn$_reset
    }else {
      return and__3546__auto____15293
    }
  }())) {
    return mf.cljs$core$IMultiFn$_reset(mf)
  }else {
    return function() {
      var or__3548__auto____15296 = cljs.core._reset[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____15296)) {
        return or__3548__auto____15296
      }else {
        var or__3548__auto____15298 = cljs.core._reset["_"];
        if(cljs.core.truth_(or__3548__auto____15298)) {
          return or__3548__auto____15298
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-reset", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._add_method = function _add_method(mf, dispatch_val, method) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____15300 = mf;
    if(cljs.core.truth_(and__3546__auto____15300)) {
      return mf.cljs$core$IMultiFn$_add_method
    }else {
      return and__3546__auto____15300
    }
  }())) {
    return mf.cljs$core$IMultiFn$_add_method(mf, dispatch_val, method)
  }else {
    return function() {
      var or__3548__auto____15303 = cljs.core._add_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____15303)) {
        return or__3548__auto____15303
      }else {
        var or__3548__auto____15307 = cljs.core._add_method["_"];
        if(cljs.core.truth_(or__3548__auto____15307)) {
          return or__3548__auto____15307
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-add-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, method)
  }
};
cljs.core._remove_method = function _remove_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____15310 = mf;
    if(cljs.core.truth_(and__3546__auto____15310)) {
      return mf.cljs$core$IMultiFn$_remove_method
    }else {
      return and__3546__auto____15310
    }
  }())) {
    return mf.cljs$core$IMultiFn$_remove_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____15312 = cljs.core._remove_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____15312)) {
        return or__3548__auto____15312
      }else {
        var or__3548__auto____15315 = cljs.core._remove_method["_"];
        if(cljs.core.truth_(or__3548__auto____15315)) {
          return or__3548__auto____15315
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-remove-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._prefer_method = function _prefer_method(mf, dispatch_val, dispatch_val_y) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____15317 = mf;
    if(cljs.core.truth_(and__3546__auto____15317)) {
      return mf.cljs$core$IMultiFn$_prefer_method
    }else {
      return and__3546__auto____15317
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefer_method(mf, dispatch_val, dispatch_val_y)
  }else {
    return function() {
      var or__3548__auto____15319 = cljs.core._prefer_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____15319)) {
        return or__3548__auto____15319
      }else {
        var or__3548__auto____15320 = cljs.core._prefer_method["_"];
        if(cljs.core.truth_(or__3548__auto____15320)) {
          return or__3548__auto____15320
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefer-method", mf);
        }
      }
    }().call(null, mf, dispatch_val, dispatch_val_y)
  }
};
cljs.core._get_method = function _get_method(mf, dispatch_val) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____15321 = mf;
    if(cljs.core.truth_(and__3546__auto____15321)) {
      return mf.cljs$core$IMultiFn$_get_method
    }else {
      return and__3546__auto____15321
    }
  }())) {
    return mf.cljs$core$IMultiFn$_get_method(mf, dispatch_val)
  }else {
    return function() {
      var or__3548__auto____15322 = cljs.core._get_method[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____15322)) {
        return or__3548__auto____15322
      }else {
        var or__3548__auto____15323 = cljs.core._get_method["_"];
        if(cljs.core.truth_(or__3548__auto____15323)) {
          return or__3548__auto____15323
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-get-method", mf);
        }
      }
    }().call(null, mf, dispatch_val)
  }
};
cljs.core._methods = function _methods(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____15327 = mf;
    if(cljs.core.truth_(and__3546__auto____15327)) {
      return mf.cljs$core$IMultiFn$_methods
    }else {
      return and__3546__auto____15327
    }
  }())) {
    return mf.cljs$core$IMultiFn$_methods(mf)
  }else {
    return function() {
      var or__3548__auto____15330 = cljs.core._methods[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____15330)) {
        return or__3548__auto____15330
      }else {
        var or__3548__auto____15332 = cljs.core._methods["_"];
        if(cljs.core.truth_(or__3548__auto____15332)) {
          return or__3548__auto____15332
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-methods", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._prefers = function _prefers(mf) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____15333 = mf;
    if(cljs.core.truth_(and__3546__auto____15333)) {
      return mf.cljs$core$IMultiFn$_prefers
    }else {
      return and__3546__auto____15333
    }
  }())) {
    return mf.cljs$core$IMultiFn$_prefers(mf)
  }else {
    return function() {
      var or__3548__auto____15334 = cljs.core._prefers[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____15334)) {
        return or__3548__auto____15334
      }else {
        var or__3548__auto____15338 = cljs.core._prefers["_"];
        if(cljs.core.truth_(or__3548__auto____15338)) {
          return or__3548__auto____15338
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-prefers", mf);
        }
      }
    }().call(null, mf)
  }
};
cljs.core._dispatch = function _dispatch(mf, args) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____15339 = mf;
    if(cljs.core.truth_(and__3546__auto____15339)) {
      return mf.cljs$core$IMultiFn$_dispatch
    }else {
      return and__3546__auto____15339
    }
  }())) {
    return mf.cljs$core$IMultiFn$_dispatch(mf, args)
  }else {
    return function() {
      var or__3548__auto____15340 = cljs.core._dispatch[goog.typeOf.call(null, mf)];
      if(cljs.core.truth_(or__3548__auto____15340)) {
        return or__3548__auto____15340
      }else {
        var or__3548__auto____15341 = cljs.core._dispatch["_"];
        if(cljs.core.truth_(or__3548__auto____15341)) {
          return or__3548__auto____15341
        }else {
          throw cljs.core.missing_protocol.call(null, "IMultiFn.-dispatch", mf);
        }
      }
    }().call(null, mf, args)
  }
};
cljs.core.do_dispatch = function do_dispatch(mf, dispatch_fn, args) {
  var dispatch_val__15362 = cljs.core.apply.call(null, dispatch_fn, args);
  var target_fn__15364 = cljs.core._get_method.call(null, mf, dispatch_val__15362);
  if(cljs.core.truth_(target_fn__15364)) {
  }else {
    throw new Error(cljs.core.str.call(null, "No method in multimethod '", cljs.core.name, "' for dispatch value: ", dispatch_val__15362));
  }
  return cljs.core.apply.call(null, target_fn__15364, args)
};
cljs.core.MultiFn = function(name, dispatch_fn, default_dispatch_val, hierarchy, method_table, prefer_table, method_cache, cached_hierarchy) {
  this.name = name;
  this.dispatch_fn = dispatch_fn;
  this.default_dispatch_val = default_dispatch_val;
  this.hierarchy = hierarchy;
  this.method_table = method_table;
  this.prefer_table = prefer_table;
  this.method_cache = method_cache;
  this.cached_hierarchy = cached_hierarchy
};
cljs.core.MultiFn.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
  return cljs.core.list.call(null, "cljs.core.MultiFn")
};
cljs.core.MultiFn.prototype.cljs$core$IHash$ = true;
cljs.core.MultiFn.prototype.cljs$core$IHash$_hash = function(this$) {
  var this__15406 = this;
  return goog.getUid.call(null, this$)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$ = true;
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_reset = function(mf) {
  var this__15407 = this;
  cljs.core.swap_BANG_.call(null, this__15407.method_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__15407.method_cache, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__15407.prefer_table, function(mf) {
    return cljs.core.ObjMap.fromObject([], {})
  });
  cljs.core.swap_BANG_.call(null, this__15407.cached_hierarchy, function(mf) {
    return null
  });
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_add_method = function(mf, dispatch_val, method) {
  var this__15408 = this;
  cljs.core.swap_BANG_.call(null, this__15408.method_table, cljs.core.assoc, dispatch_val, method);
  cljs.core.reset_cache.call(null, this__15408.method_cache, this__15408.method_table, this__15408.cached_hierarchy, this__15408.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_remove_method = function(mf, dispatch_val) {
  var this__15412 = this;
  cljs.core.swap_BANG_.call(null, this__15412.method_table, cljs.core.dissoc, dispatch_val);
  cljs.core.reset_cache.call(null, this__15412.method_cache, this__15412.method_table, this__15412.cached_hierarchy, this__15412.hierarchy);
  return mf
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_get_method = function(mf, dispatch_val) {
  var this__15413 = this;
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.deref.call(null, this__15413.cached_hierarchy), cljs.core.deref.call(null, this__15413.hierarchy)))) {
  }else {
    cljs.core.reset_cache.call(null, this__15413.method_cache, this__15413.method_table, this__15413.cached_hierarchy, this__15413.hierarchy)
  }
  var temp__3695__auto____15416 = cljs.core.deref.call(null, this__15413.method_cache).call(null, dispatch_val);
  if(cljs.core.truth_(temp__3695__auto____15416)) {
    var target_fn__15417 = temp__3695__auto____15416;
    return target_fn__15417
  }else {
    var temp__3695__auto____15419 = cljs.core.find_and_cache_best_method.call(null, this__15413.name, dispatch_val, this__15413.hierarchy, this__15413.method_table, this__15413.prefer_table, this__15413.method_cache, this__15413.cached_hierarchy);
    if(cljs.core.truth_(temp__3695__auto____15419)) {
      var target_fn__15421 = temp__3695__auto____15419;
      return target_fn__15421
    }else {
      return cljs.core.deref.call(null, this__15413.method_table).call(null, this__15413.default_dispatch_val)
    }
  }
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefer_method = function(mf, dispatch_val_x, dispatch_val_y) {
  var this__15425 = this;
  if(cljs.core.truth_(cljs.core.prefers_STAR_.call(null, dispatch_val_x, dispatch_val_y, this__15425.prefer_table))) {
    throw new Error(cljs.core.str.call(null, "Preference conflict in multimethod '", this__15425.name, "': ", dispatch_val_y, " is already preferred to ", dispatch_val_x));
  }else {
  }
  cljs.core.swap_BANG_.call(null, this__15425.prefer_table, function(old) {
    return cljs.core.assoc.call(null, old, dispatch_val_x, cljs.core.conj.call(null, cljs.core.get.call(null, old, dispatch_val_x, cljs.core.set([])), dispatch_val_y))
  });
  return cljs.core.reset_cache.call(null, this__15425.method_cache, this__15425.method_table, this__15425.cached_hierarchy, this__15425.hierarchy)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_methods = function(mf) {
  var this__15427 = this;
  return cljs.core.deref.call(null, this__15427.method_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_prefers = function(mf) {
  var this__15429 = this;
  return cljs.core.deref.call(null, this__15429.prefer_table)
};
cljs.core.MultiFn.prototype.cljs$core$IMultiFn$_dispatch = function(mf, args) {
  var this__15430 = this;
  return cljs.core.do_dispatch.call(null, mf, this__15430.dispatch_fn, args)
};
cljs.core.MultiFn;
cljs.core.MultiFn.prototype.call = function() {
  var G__15484__delegate = function(_, args) {
    return cljs.core._dispatch.call(null, this, args)
  };
  var G__15484 = function(_, var_args) {
    var args = null;
    if(goog.isDef(var_args)) {
      args = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return G__15484__delegate.call(this, _, args)
  };
  G__15484.cljs$lang$maxFixedArity = 1;
  G__15484.cljs$lang$applyTo = function(arglist__15487) {
    var _ = cljs.core.first(arglist__15487);
    var args = cljs.core.rest(arglist__15487);
    return G__15484__delegate.call(this, _, args)
  };
  return G__15484
}();
cljs.core.MultiFn.prototype.apply = function(_, args) {
  return cljs.core._dispatch.call(null, this, args)
};
cljs.core.remove_all_methods = function remove_all_methods(multifn) {
  return cljs.core._reset.call(null, multifn)
};
cljs.core.remove_method = function remove_method(multifn, dispatch_val) {
  return cljs.core._remove_method.call(null, multifn, dispatch_val)
};
cljs.core.prefer_method = function prefer_method(multifn, dispatch_val_x, dispatch_val_y) {
  return cljs.core._prefer_method.call(null, multifn, dispatch_val_x, dispatch_val_y)
};
cljs.core.methods$ = function methods$(multifn) {
  return cljs.core._methods.call(null, multifn)
};
cljs.core.get_method = function get_method(multifn, dispatch_val) {
  return cljs.core._get_method.call(null, multifn, dispatch_val)
};
cljs.core.prefers = function prefers(multifn) {
  return cljs.core._prefers.call(null, multifn)
};
goog.provide("clojure.string");
goog.require("cljs.core");
goog.require("goog.string");
goog.require("goog.string.StringBuffer");
clojure.string.seq_reverse = function seq_reverse(coll) {
  return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.List.EMPTY, coll)
};
clojure.string.reverse = function reverse(s) {
  return s.split("").reverse().join("")
};
clojure.string.replace = function replace(s, match, replacement) {
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, match))) {
    return s.replace(new RegExp(goog.string.regExpEscape.call(null, match), "g"), replacement)
  }else {
    if(cljs.core.truth_(match.hasOwnProperty("source"))) {
      return s.replace(new RegExp(match.source, "g"), replacement)
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        throw cljs.core.str.call(null, "Invalid match arg: ", match);
      }else {
        return null
      }
    }
  }
};
clojure.string.replace_first = function replace_first(s, match, replacement) {
  return s.replace(match, replacement)
};
clojure.string.join = function() {
  var join = null;
  var join__16765 = function(coll) {
    return cljs.core.apply.call(null, cljs.core.str, coll)
  };
  var join__16766 = function(separator, coll) {
    return cljs.core.apply.call(null, cljs.core.str, cljs.core.interpose.call(null, separator, coll))
  };
  join = function(separator, coll) {
    switch(arguments.length) {
      case 1:
        return join__16765.call(this, separator);
      case 2:
        return join__16766.call(this, separator, coll)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return join
}();
clojure.string.upper_case = function upper_case(s) {
  return s.toUpperCase()
};
clojure.string.lower_case = function lower_case(s) {
  return s.toLowerCase()
};
clojure.string.capitalize = function capitalize(s) {
  if(cljs.core.truth_(cljs.core.count.call(null, s) < 2)) {
    return clojure.string.upper_case.call(null, s)
  }else {
    return cljs.core.str.call(null, clojure.string.upper_case.call(null, cljs.core.subs.call(null, s, 0, 1)), clojure.string.lower_case.call(null, cljs.core.subs.call(null, s, 1)))
  }
};
clojure.string.split = function() {
  var split = null;
  var split__16780 = function(s, re) {
    return cljs.core.vec.call(null, cljs.core.str.call(null, s).split(re))
  };
  var split__16781 = function(s, re, limit) {
    if(cljs.core.truth_(limit < 1)) {
      return cljs.core.vec.call(null, cljs.core.str.call(null, s).split(re))
    }else {
      var s__16774 = s;
      var limit__16775 = limit;
      var parts__16776 = cljs.core.Vector.fromArray([]);
      while(true) {
        if(cljs.core.truth_(cljs.core._EQ_.call(null, limit__16775, 1))) {
          return cljs.core.conj.call(null, parts__16776, s__16774)
        }else {
          var temp__3695__auto____16777 = cljs.core.re_find.call(null, re, s__16774);
          if(cljs.core.truth_(temp__3695__auto____16777)) {
            var m__16778 = temp__3695__auto____16777;
            var index__16779 = s__16774.indexOf(m__16778);
            var G__16783 = s__16774.substring(index__16779 + cljs.core.count.call(null, m__16778));
            var G__16784 = limit__16775 - 1;
            var G__16785 = cljs.core.conj.call(null, parts__16776, s__16774.substring(0, index__16779));
            s__16774 = G__16783;
            limit__16775 = G__16784;
            parts__16776 = G__16785;
            continue
          }else {
            return cljs.core.conj.call(null, parts__16776, s__16774)
          }
        }
        break
      }
    }
  };
  split = function(s, re, limit) {
    switch(arguments.length) {
      case 2:
        return split__16780.call(this, s, re);
      case 3:
        return split__16781.call(this, s, re, limit)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return split
}();
clojure.string.split_lines = function split_lines(s) {
  return clojure.string.split.call(null, s, /\n|\r\n/)
};
clojure.string.trim = function trim(s) {
  return goog.string.trim.call(null, s)
};
clojure.string.triml = function triml(s) {
  return goog.string.trimLeft.call(null, s)
};
clojure.string.trimr = function trimr(s) {
  return goog.string.trimRight.call(null, s)
};
clojure.string.trim_newline = function trim_newline(s) {
  var index__16788 = s.length;
  while(true) {
    if(cljs.core.truth_(index__16788 === 0)) {
      return""
    }else {
      var ch__16789 = cljs.core.get.call(null, s, index__16788 - 1);
      if(cljs.core.truth_(function() {
        var or__3548__auto____16790 = cljs.core._EQ_.call(null, ch__16789, "\n");
        if(cljs.core.truth_(or__3548__auto____16790)) {
          return or__3548__auto____16790
        }else {
          return cljs.core._EQ_.call(null, ch__16789, "\r")
        }
      }())) {
        var G__16791 = index__16788 - 1;
        index__16788 = G__16791;
        continue
      }else {
        return s.substring(0, index__16788)
      }
    }
    break
  }
};
clojure.string.blank_QMARK_ = function blank_QMARK_(s) {
  var s__16795 = cljs.core.str.call(null, s);
  if(cljs.core.truth_(function() {
    var or__3548__auto____16796 = cljs.core.not.call(null, s__16795);
    if(cljs.core.truth_(or__3548__auto____16796)) {
      return or__3548__auto____16796
    }else {
      var or__3548__auto____16797 = cljs.core._EQ_.call(null, "", s__16795);
      if(cljs.core.truth_(or__3548__auto____16797)) {
        return or__3548__auto____16797
      }else {
        return cljs.core.re_matches.call(null, /\s+/, s__16795)
      }
    }
  }())) {
    return true
  }else {
    return false
  }
};
clojure.string.escape = function escape(s, cmap) {
  var buffer__16798 = new goog.string.StringBuffer;
  var length__16799 = s.length;
  var index__16800 = 0;
  while(true) {
    if(cljs.core.truth_(cljs.core._EQ_.call(null, length__16799, index__16800))) {
      return buffer__16798.toString()
    }else {
      var ch__16804 = s.charAt(index__16800);
      var temp__3695__auto____16810 = cljs.core.get.call(null, cmap, ch__16804);
      if(cljs.core.truth_(temp__3695__auto____16810)) {
        var replacement__16812 = temp__3695__auto____16810;
        buffer__16798.append(cljs.core.str.call(null, replacement__16812))
      }else {
        buffer__16798.append(ch__16804)
      }
      var G__16818 = index__16800 + 1;
      index__16800 = G__16818;
      continue
    }
    break
  }
};
goog.provide("domina.support");
goog.require("cljs.core");
goog.require("goog.dom");
goog.require("goog.events");
var div__16614 = document.createElement("div");
var test_html__16615 = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
div__16614.innerHTML = test_html__16615;
domina.support.leading_whitespace_QMARK_ = cljs.core._EQ_.call(null, div__16614.firstChild.nodeType, 3);
domina.support.extraneous_tbody_QMARK_ = cljs.core._EQ_.call(null, div__16614.getElementsByTagName("tbody").length, 0);
domina.support.unscoped_html_elements_QMARK_ = cljs.core._EQ_.call(null, div__16614.getElementsByTagName("link").length, 0);
goog.provide("domina");
goog.require("cljs.core");
goog.require("domina.support");
goog.require("goog.dom.classes");
goog.require("goog.events");
goog.require("goog.dom.xml");
goog.require("goog.dom.forms");
goog.require("goog.dom");
goog.require("clojure.string");
goog.require("goog.style");
goog.require("cljs.core");
domina.debug = true;
domina.log_debug = function log_debug(mesg) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____15810 = domina.debug;
    if(cljs.core.truth_(and__3546__auto____15810)) {
      return cljs.core.not.call(null, cljs.core._EQ_.call(null, window.console, undefined))
    }else {
      return and__3546__auto____15810
    }
  }())) {
    return console.log(mesg)
  }else {
    return null
  }
};
domina.re_html = /<|&#?\w+;/;
domina.re_leading_whitespace = /^\s+/;
domina.re_xhtml_tag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/i;
domina.re_tag_name = /<([\w:]+)/;
domina.re_no_inner_html = /<(?:script|style)/i;
domina.re_tbody = /<tbody/i;
var opt_wrapper__15817 = cljs.core.Vector.fromArray([1, "<select multiple='multiple'>", "</select>"]);
var table_section_wrapper__15818 = cljs.core.Vector.fromArray([1, "<table>", "</table>"]);
var cell_wrapper__15819 = cljs.core.Vector.fromArray([3, "<table><tbody><tr>", "</tr></tbody></table>"]);
domina.wrap_map = cljs.core.ObjMap.fromObject(["col", "\ufdd0'default", "tfoot", "caption", "optgroup", "legend", "area", "td", "thead", "th", "option", "tbody", "tr", "colgroup"], {"col":cljs.core.Vector.fromArray([2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"]), "\ufdd0'default":cljs.core.Vector.fromArray([0, "", ""]), "tfoot":table_section_wrapper__15818, "caption":table_section_wrapper__15818, "optgroup":opt_wrapper__15817, "legend":cljs.core.Vector.fromArray([1, "<fieldset>", 
"</fieldset>"]), "area":cljs.core.Vector.fromArray([1, "<map>", "</map>"]), "td":cell_wrapper__15819, "thead":table_section_wrapper__15818, "th":cell_wrapper__15819, "option":opt_wrapper__15817, "tbody":table_section_wrapper__15818, "tr":cljs.core.Vector.fromArray([2, "<table><tbody>", "</tbody></table>"]), "colgroup":table_section_wrapper__15818});
domina.remove_extraneous_tbody_BANG_ = function remove_extraneous_tbody_BANG_(div, html) {
  var no_tbody_QMARK___15823 = cljs.core.not.call(null, cljs.core.re_find.call(null, domina.re_tbody, html));
  var tbody__15828 = cljs.core.truth_(function() {
    var and__3546__auto____15825 = cljs.core._EQ_.call(null, domina.tag_name, "table");
    if(cljs.core.truth_(and__3546__auto____15825)) {
      return no_tbody_QMARK___15823
    }else {
      return and__3546__auto____15825
    }
  }()) ? function() {
    var and__3546__auto____15826 = div.firstChild;
    if(cljs.core.truth_(and__3546__auto____15826)) {
      return div.firstChild.childNodes
    }else {
      return and__3546__auto____15826
    }
  }() : cljs.core.truth_(function() {
    var and__3546__auto____15827 = cljs.core._EQ_.call(null, domina.start_wrap, "<table>");
    if(cljs.core.truth_(and__3546__auto____15827)) {
      return no_tbody_QMARK___15823
    }else {
      return and__3546__auto____15827
    }
  }()) ? div.childNodes : cljs.core.Vector.fromArray([]);
  var G__15829__15833 = cljs.core.seq.call(null, tbody__15828);
  if(cljs.core.truth_(G__15829__15833)) {
    var child__15834 = cljs.core.first.call(null, G__15829__15833);
    var G__15829__15835 = G__15829__15833;
    while(true) {
      if(cljs.core.truth_(function() {
        var and__3546__auto____15836 = cljs.core._EQ_.call(null, child__15834.nodeName, "tbody");
        if(cljs.core.truth_(and__3546__auto____15836)) {
          return cljs.core._EQ_.call(null, child__15834.childNodes.length, 0)
        }else {
          return and__3546__auto____15836
        }
      }())) {
        child__15834.parentNode.removeChild(child__15834)
      }else {
      }
      var temp__3698__auto____15837 = cljs.core.next.call(null, G__15829__15835);
      if(cljs.core.truth_(temp__3698__auto____15837)) {
        var G__15829__15838 = temp__3698__auto____15837;
        var G__15839 = cljs.core.first.call(null, G__15829__15838);
        var G__15840 = G__15829__15838;
        child__15834 = G__15839;
        G__15829__15835 = G__15840;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
};
domina.restore_leading_whitespace_BANG_ = function restore_leading_whitespace_BANG_(div, html) {
  return div.insertBefore(document.createTextNode(cljs.core.first.call(null, cljs.core.re_find.call(null, domina.re_leading_whitespace, html))), div.firstChild)
};
domina.html_to_dom = function html_to_dom(html) {
  var html__15847 = clojure.string.replace.call(null, html, domina.re_xhtml_tag, "<$1></$2>");
  var tag_name__15848 = cljs.core.str.call(null, cljs.core.second.call(null, cljs.core.re_find.call(null, domina.re_tag_name, html__15847))).toLowerCase();
  var vec__15846__15849 = cljs.core.get.call(null, domina.wrap_map, tag_name__15848, "\ufdd0'default".call(null, domina.wrap_map));
  var depth__15850 = cljs.core.nth.call(null, vec__15846__15849, 0, null);
  var start_wrap__15851 = cljs.core.nth.call(null, vec__15846__15849, 1, null);
  var end_wrap__15852 = cljs.core.nth.call(null, vec__15846__15849, 2, null);
  var div__15891 = function() {
    var wrapper__15855 = function() {
      var div__15854 = document.createElement("div");
      div__15854.innerHTML = cljs.core.str.call(null, start_wrap__15851, html__15847, end_wrap__15852);
      return div__15854
    }();
    var level__15856 = depth__15850;
    while(true) {
      if(cljs.core.truth_(level__15856 > 0)) {
        var G__15893 = wrapper__15855.lastChild;
        var G__15894 = level__15856 - 1;
        wrapper__15855 = G__15893;
        level__15856 = G__15894;
        continue
      }else {
        return wrapper__15855
      }
      break
    }
  }();
  if(cljs.core.truth_(domina.support.extraneous_tbody_QMARK_)) {
    domina.remove_extraneous_tbody_BANG_.call(null, div__15891, html__15847)
  }else {
  }
  if(cljs.core.truth_(function() {
    var and__3546__auto____15892 = cljs.core.not.call(null, domina.support.leading_whitespace_QMARK_);
    if(cljs.core.truth_(and__3546__auto____15892)) {
      return cljs.core.re_find.call(null, domina.re_leading_whitespace, html__15847)
    }else {
      return and__3546__auto____15892
    }
  }())) {
    domina.restore_leading_whitespace_BANG_.call(null, div__15891, html__15847)
  }else {
  }
  return div__15891.childNodes
};
domina.string_to_dom = function string_to_dom(s) {
  if(cljs.core.truth_(cljs.core.re_find.call(null, domina.re_html, s))) {
    return domina.html_to_dom.call(null, s)
  }else {
    return document.createTextNode(s)
  }
};
domina.DomContent = {};
domina.nodes = function nodes(content) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____15895 = content;
    if(cljs.core.truth_(and__3546__auto____15895)) {
      return content.domina$DomContent$nodes
    }else {
      return and__3546__auto____15895
    }
  }())) {
    return content.domina$DomContent$nodes(content)
  }else {
    return function() {
      var or__3548__auto____15896 = domina.nodes[goog.typeOf.call(null, content)];
      if(cljs.core.truth_(or__3548__auto____15896)) {
        return or__3548__auto____15896
      }else {
        var or__3548__auto____15897 = domina.nodes["_"];
        if(cljs.core.truth_(or__3548__auto____15897)) {
          return or__3548__auto____15897
        }else {
          throw cljs.core.missing_protocol.call(null, "DomContent.nodes", content);
        }
      }
    }().call(null, content)
  }
};
domina.single_node = function single_node(nodeseq) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____15898 = nodeseq;
    if(cljs.core.truth_(and__3546__auto____15898)) {
      return nodeseq.domina$DomContent$single_node
    }else {
      return and__3546__auto____15898
    }
  }())) {
    return nodeseq.domina$DomContent$single_node(nodeseq)
  }else {
    return function() {
      var or__3548__auto____15899 = domina.single_node[goog.typeOf.call(null, nodeseq)];
      if(cljs.core.truth_(or__3548__auto____15899)) {
        return or__3548__auto____15899
      }else {
        var or__3548__auto____15900 = domina.single_node["_"];
        if(cljs.core.truth_(or__3548__auto____15900)) {
          return or__3548__auto____15900
        }else {
          throw cljs.core.missing_protocol.call(null, "DomContent.single-node", nodeseq);
        }
      }
    }().call(null, nodeseq)
  }
};
domina._STAR_debug_STAR_ = true;
domina.log_debug = function log_debug(mesg) {
  if(cljs.core.truth_(function() {
    var and__3546__auto____15901 = domina._STAR_debug_STAR_;
    if(cljs.core.truth_(and__3546__auto____15901)) {
      return cljs.core.not.call(null, cljs.core._EQ_.call(null, window.console, undefined))
    }else {
      return and__3546__auto____15901
    }
  }())) {
    return console.log(mesg)
  }else {
    return null
  }
};
domina.by_id = function by_id(id) {
  return goog.dom.getElement.call(null, cljs.core.name.call(null, id))
};
domina.by_class = function by_class(class_name) {
  if(cljs.core.truth_(void 0 === domina.t15902)) {
    domina.t15902 = function(class_name, by_class, __meta) {
      this.class_name = class_name;
      this.by_class = by_class;
      this.__meta = __meta
    };
    domina.t15902.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
      return cljs.core.list.call(null, "domina.t15902")
    };
    domina.t15902.prototype.domina$DomContent$ = true;
    domina.t15902.prototype.domina$DomContent$nodes = function(_) {
      var this__15910 = this;
      return domina.normalize_seq.call(null, goog.dom.getElementsByClass.call(null, cljs.core.name.call(null, this__15910.class_name)))
    };
    domina.t15902.prototype.domina$DomContent$single_node = function(_) {
      var this__15911 = this;
      return domina.normalize_seq.call(null, goog.dom.getElementByClass.call(null, cljs.core.name.call(null, this__15911.class_name)))
    };
    domina.t15902.prototype.cljs$core$IMeta$ = true;
    domina.t15902.prototype.cljs$core$IMeta$_meta = function(_) {
      var this__15912 = this;
      return this__15912.__meta
    };
    domina.t15902.prototype.cljs$core$IWithMeta$ = true;
    domina.t15902.prototype.cljs$core$IWithMeta$_with_meta = function(_, __meta) {
      var this__15913 = this;
      return new domina.t15902(this__15913.class_name, this__15913.by_class, __meta)
    };
    domina.t15902
  }else {
  }
  return new domina.t15902(class_name, by_class, null)
};
domina.children = function children(content) {
  return cljs.core.mapcat.call(null, goog.dom.getChildren, domina.nodes.call(null, content))
};
domina.clone = function clone(content) {
  return cljs.core.map.call(null, function(p1__15921_SHARP_) {
    return p1__15921_SHARP_.cloneNode(true)
  }, domina.nodes.call(null, content))
};
domina.append_BANG_ = function append_BANG_(parent_content, child_content) {
  domina.apply_with_cloning.call(null, goog.dom.appendChild, parent_content, child_content);
  return parent_content
};
domina.insert_BANG_ = function insert_BANG_(parent_content, child_content, idx) {
  domina.apply_with_cloning.call(null, function(p1__15941_SHARP_, p2__15942_SHARP_) {
    return goog.dom.insertChildAt.call(null, p1__15941_SHARP_, p2__15942_SHARP_, idx)
  }, parent_content, child_content);
  return parent_content
};
domina.prepend_BANG_ = function prepend_BANG_(parent_content, child_content) {
  domina.insert_BANG_.call(null, parent_content, child_content, 0);
  return parent_content
};
domina.insert_before_BANG_ = function insert_before_BANG_(content, new_content) {
  domina.apply_with_cloning.call(null, function(p1__15949_SHARP_, p2__15948_SHARP_) {
    return goog.dom.insertSiblingBefore.call(null, p2__15948_SHARP_, p1__15949_SHARP_)
  }, content, new_content);
  return content
};
domina.insert_after_BANG_ = function insert_after_BANG_(content, new_content) {
  domina.apply_with_cloning.call(null, function(p1__15954_SHARP_, p2__15953_SHARP_) {
    return goog.dom.insertSiblingAfter.call(null, p2__15953_SHARP_, p1__15954_SHARP_)
  }, content, new_content);
  return content
};
domina.swap_content_BANG_ = function swap_content_BANG_(old_content, new_content) {
  domina.apply_with_cloning.call(null, function(p1__15956_SHARP_, p2__15955_SHARP_) {
    return goog.dom.replaceNode.call(null, p2__15955_SHARP_, p1__15956_SHARP_)
  }, old_content, new_content);
  return old_content
};
domina.detach_BANG_ = function detach_BANG_(content) {
  return cljs.core.doall.call(null, cljs.core.map.call(null, goog.dom.removeNode, domina.nodes.call(null, content)))
};
domina.destroy_BANG_ = function destroy_BANG_(content) {
  return cljs.core.dorun.call(null, cljs.core.map.call(null, goog.dom.removeNode, domina.nodes.call(null, content)))
};
domina.destroy_children_BANG_ = function destroy_children_BANG_(content) {
  cljs.core.dorun.call(null, cljs.core.map.call(null, goog.dom.removeChildren, domina.nodes.call(null, content)));
  return content
};
domina.style = function style(content, name) {
  var s__15987 = goog.style.getStyle.call(null, domina.single_node.call(null, content), cljs.core.name.call(null, name));
  if(cljs.core.truth_(clojure.string.blank_QMARK_.call(null, s__15987))) {
    return null
  }else {
    return s__15987
  }
};
domina.attr = function attr(content, name) {
  return domina.single_node.call(null, content).getAttribute(cljs.core.name.call(null, name))
};
domina.set_style_BANG_ = function() {
  var set_style_BANG___delegate = function(content, name, value) {
    var G__15991__15992 = cljs.core.seq.call(null, domina.nodes.call(null, content));
    if(cljs.core.truth_(G__15991__15992)) {
      var n__15994 = cljs.core.first.call(null, G__15991__15992);
      var G__15991__15995 = G__15991__15992;
      while(true) {
        goog.style.setStyle.call(null, n__15994, cljs.core.name.call(null, name), cljs.core.apply.call(null, cljs.core.str, value));
        var temp__3698__auto____15997 = cljs.core.next.call(null, G__15991__15995);
        if(cljs.core.truth_(temp__3698__auto____15997)) {
          var G__15991__15998 = temp__3698__auto____15997;
          var G__16003 = cljs.core.first.call(null, G__15991__15998);
          var G__16004 = G__15991__15998;
          n__15994 = G__16003;
          G__15991__15995 = G__16004;
          continue
        }else {
        }
        break
      }
    }else {
    }
    return content
  };
  var set_style_BANG_ = function(content, name, var_args) {
    var value = null;
    if(goog.isDef(var_args)) {
      value = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return set_style_BANG___delegate.call(this, content, name, value)
  };
  set_style_BANG_.cljs$lang$maxFixedArity = 2;
  set_style_BANG_.cljs$lang$applyTo = function(arglist__16007) {
    var content = cljs.core.first(arglist__16007);
    var name = cljs.core.first(cljs.core.next(arglist__16007));
    var value = cljs.core.rest(cljs.core.next(arglist__16007));
    return set_style_BANG___delegate.call(this, content, name, value)
  };
  return set_style_BANG_
}();
domina.set_attr_BANG_ = function() {
  var set_attr_BANG___delegate = function(content, name, value) {
    var G__16011__16012 = cljs.core.seq.call(null, domina.nodes.call(null, content));
    if(cljs.core.truth_(G__16011__16012)) {
      var n__16016 = cljs.core.first.call(null, G__16011__16012);
      var G__16011__16017 = G__16011__16012;
      while(true) {
        n__16016.setAttribute(cljs.core.name.call(null, name), cljs.core.apply.call(null, cljs.core.str, value));
        var temp__3698__auto____16018 = cljs.core.next.call(null, G__16011__16017);
        if(cljs.core.truth_(temp__3698__auto____16018)) {
          var G__16011__16020 = temp__3698__auto____16018;
          var G__16025 = cljs.core.first.call(null, G__16011__16020);
          var G__16026 = G__16011__16020;
          n__16016 = G__16025;
          G__16011__16017 = G__16026;
          continue
        }else {
        }
        break
      }
    }else {
    }
    return content
  };
  var set_attr_BANG_ = function(content, name, var_args) {
    var value = null;
    if(goog.isDef(var_args)) {
      value = cljs.core.array_seq(Array.prototype.slice.call(arguments, 2), 0)
    }
    return set_attr_BANG___delegate.call(this, content, name, value)
  };
  set_attr_BANG_.cljs$lang$maxFixedArity = 2;
  set_attr_BANG_.cljs$lang$applyTo = function(arglist__16027) {
    var content = cljs.core.first(arglist__16027);
    var name = cljs.core.first(cljs.core.next(arglist__16027));
    var value = cljs.core.rest(cljs.core.next(arglist__16027));
    return set_attr_BANG___delegate.call(this, content, name, value)
  };
  return set_attr_BANG_
}();
domina.parse_style_attributes = function parse_style_attributes(style) {
  return cljs.core.reduce.call(null, function(acc, pair) {
    var vec__16029__16030 = pair.split(/\s*:\s*/);
    var k__16032 = cljs.core.nth.call(null, vec__16029__16030, 0, null);
    var v__16033 = cljs.core.nth.call(null, vec__16029__16030, 1, null);
    if(cljs.core.truth_(function() {
      var and__3546__auto____16034 = k__16032;
      if(cljs.core.truth_(and__3546__auto____16034)) {
        return v__16033
      }else {
        return and__3546__auto____16034
      }
    }())) {
      return cljs.core.assoc.call(null, acc, cljs.core.keyword.call(null, k__16032.toLowerCase()), v__16033)
    }else {
      return acc
    }
  }, cljs.core.ObjMap.fromObject([], {}), style.split(/\s*;\s*/))
};
domina.styles = function styles(content) {
  var style__16046 = domina.attr.call(null, content, "style");
  if(cljs.core.truth_(cljs.core.string_QMARK_.call(null, style__16046))) {
    return domina.parse_style_attributes.call(null, style__16046)
  }else {
    if(cljs.core.truth_(style__16046.cssText)) {
      return domina.parse_style_attributes.call(null, style__16046.cssText)
    }else {
      return null
    }
  }
};
domina.attrs = function attrs(content) {
  var node__16063 = domina.single_node.call(null, content);
  var attrs__16064 = node__16063.attributes;
  return cljs.core.reduce.call(null, cljs.core.conj, cljs.core.filter.call(null, cljs.core.complement.call(null, cljs.core.nil_QMARK_), cljs.core.map.call(null, function(p1__16042_SHARP_) {
    var attr__16068 = attrs__16064.item(p1__16042_SHARP_);
    var value__16069 = attr__16068.nodeValue;
    if(cljs.core.truth_(function() {
      var and__3546__auto____16070 = cljs.core.not_EQ_.call(null, null, value__16069);
      if(cljs.core.truth_(and__3546__auto____16070)) {
        return cljs.core.not_EQ_.call(null, "", value__16069)
      }else {
        return and__3546__auto____16070
      }
    }())) {
      return cljs.core.HashMap.fromArrays([cljs.core.keyword.call(null, attr__16068.nodeName.toLowerCase())], [attr__16068.nodeValue])
    }else {
      return null
    }
  }, cljs.core.range.call(null, attrs__16064.length))))
};
domina.set_styles_BANG_ = function set_styles_BANG_(content, styles) {
  var G__16089__16091 = cljs.core.seq.call(null, styles);
  if(cljs.core.truth_(G__16089__16091)) {
    var G__16093__16095 = cljs.core.first.call(null, G__16089__16091);
    var vec__16094__16096 = G__16093__16095;
    var name__16097 = cljs.core.nth.call(null, vec__16094__16096, 0, null);
    var value__16098 = cljs.core.nth.call(null, vec__16094__16096, 1, null);
    var G__16089__16099 = G__16089__16091;
    var G__16093__16100 = G__16093__16095;
    var G__16089__16101 = G__16089__16099;
    while(true) {
      var vec__16102__16104 = G__16093__16100;
      var name__16106 = cljs.core.nth.call(null, vec__16102__16104, 0, null);
      var value__16107 = cljs.core.nth.call(null, vec__16102__16104, 1, null);
      var G__16089__16108 = G__16089__16101;
      domina.set_style_BANG_.call(null, content, name__16106, value__16107);
      var temp__3698__auto____16112 = cljs.core.next.call(null, G__16089__16108);
      if(cljs.core.truth_(temp__3698__auto____16112)) {
        var G__16089__16116 = temp__3698__auto____16112;
        var G__16128 = cljs.core.first.call(null, G__16089__16116);
        var G__16129 = G__16089__16116;
        G__16093__16100 = G__16128;
        G__16089__16101 = G__16129;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return content
};
domina.set_attrs_BANG_ = function set_attrs_BANG_(content, attrs) {
  var G__16133__16134 = cljs.core.seq.call(null, attrs);
  if(cljs.core.truth_(G__16133__16134)) {
    var G__16136__16140 = cljs.core.first.call(null, G__16133__16134);
    var vec__16139__16141 = G__16136__16140;
    var name__16143 = cljs.core.nth.call(null, vec__16139__16141, 0, null);
    var value__16144 = cljs.core.nth.call(null, vec__16139__16141, 1, null);
    var G__16133__16145 = G__16133__16134;
    var G__16136__16146 = G__16136__16140;
    var G__16133__16147 = G__16133__16145;
    while(true) {
      var vec__16148__16149 = G__16136__16146;
      var name__16150 = cljs.core.nth.call(null, vec__16148__16149, 0, null);
      var value__16151 = cljs.core.nth.call(null, vec__16148__16149, 1, null);
      var G__16133__16152 = G__16133__16147;
      domina.set_attr_BANG_.call(null, content, name__16150, value__16151);
      var temp__3698__auto____16154 = cljs.core.next.call(null, G__16133__16152);
      if(cljs.core.truth_(temp__3698__auto____16154)) {
        var G__16133__16160 = temp__3698__auto____16154;
        var G__16164 = cljs.core.first.call(null, G__16133__16160);
        var G__16165 = G__16133__16160;
        G__16136__16146 = G__16164;
        G__16133__16147 = G__16165;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return content
};
domina.has_class_QMARK_ = function has_class_QMARK_(content, class$) {
  return goog.dom.classes.has.call(null, domina.single_node.call(null, content), class$)
};
domina.add_class_BANG_ = function add_class_BANG_(content, class$) {
  var G__16169__16170 = cljs.core.seq.call(null, domina.nodes.call(null, content));
  if(cljs.core.truth_(G__16169__16170)) {
    var node__16171 = cljs.core.first.call(null, G__16169__16170);
    var G__16169__16172 = G__16169__16170;
    while(true) {
      goog.dom.classes.add.call(null, node__16171, class$);
      var temp__3698__auto____16173 = cljs.core.next.call(null, G__16169__16172);
      if(cljs.core.truth_(temp__3698__auto____16173)) {
        var G__16169__16174 = temp__3698__auto____16173;
        var G__16175 = cljs.core.first.call(null, G__16169__16174);
        var G__16176 = G__16169__16174;
        node__16171 = G__16175;
        G__16169__16172 = G__16176;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return content
};
domina.remove_class_BANG_ = function remove_class_BANG_(content, class$) {
  var G__16181__16182 = cljs.core.seq.call(null, domina.nodes.call(null, content));
  if(cljs.core.truth_(G__16181__16182)) {
    var node__16185 = cljs.core.first.call(null, G__16181__16182);
    var G__16181__16186 = G__16181__16182;
    while(true) {
      goog.dom.classes.remove.call(null, node__16185, class$);
      var temp__3698__auto____16187 = cljs.core.next.call(null, G__16181__16186);
      if(cljs.core.truth_(temp__3698__auto____16187)) {
        var G__16181__16188 = temp__3698__auto____16187;
        var G__16193 = cljs.core.first.call(null, G__16181__16188);
        var G__16194 = G__16181__16188;
        node__16185 = G__16193;
        G__16181__16186 = G__16194;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return content
};
domina.classes = function classes(content) {
  return cljs.core.seq.call(null, goog.dom.classes.get.call(null, domina.single_node.call(null, content)))
};
domina.text = function() {
  var text = null;
  var text__16201 = function(content) {
    return text.call(null, content, true)
  };
  var text__16202 = function(content, normalize) {
    if(cljs.core.truth_(normalize)) {
      return clojure.string.trim.call(null, goog.dom.getTextContent.call(null, domina.single_node.call(null, content)))
    }else {
      return goog.dom.getRawTextContent.call(null, domina.single_node.call(null, content))
    }
  };
  text = function(content, normalize) {
    switch(arguments.length) {
      case 1:
        return text__16201.call(this, content);
      case 2:
        return text__16202.call(this, content, normalize)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return text
}();
domina.set_text_BANG_ = function set_text_BANG_(content, value) {
  var G__16206__16207 = cljs.core.seq.call(null, domina.nodes.call(null, content));
  if(cljs.core.truth_(G__16206__16207)) {
    var node__16208 = cljs.core.first.call(null, G__16206__16207);
    var G__16206__16209 = G__16206__16207;
    while(true) {
      goog.dom.setTextContent.call(null, node__16208, value);
      var temp__3698__auto____16213 = cljs.core.next.call(null, G__16206__16209);
      if(cljs.core.truth_(temp__3698__auto____16213)) {
        var G__16206__16217 = temp__3698__auto____16213;
        var G__16219 = cljs.core.first.call(null, G__16206__16217);
        var G__16220 = G__16206__16217;
        node__16208 = G__16219;
        G__16206__16209 = G__16220;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return content
};
domina.value = function value(content) {
  return goog.dom.forms.getValue.call(null, domina.single_node.call(null, content))
};
domina.set_value_BANG_ = function set_value_BANG_(content, value) {
  var G__16237__16238 = cljs.core.seq.call(null, domina.nodes.call(null, content));
  if(cljs.core.truth_(G__16237__16238)) {
    var node__16239 = cljs.core.first.call(null, G__16237__16238);
    var G__16237__16240 = G__16237__16238;
    while(true) {
      goog.dom.forms.setValue.call(null, node__16239, value);
      var temp__3698__auto____16241 = cljs.core.next.call(null, G__16237__16240);
      if(cljs.core.truth_(temp__3698__auto____16241)) {
        var G__16237__16242 = temp__3698__auto____16241;
        var G__16245 = cljs.core.first.call(null, G__16237__16242);
        var G__16246 = G__16237__16242;
        node__16239 = G__16245;
        G__16237__16240 = G__16246;
        continue
      }else {
      }
      break
    }
  }else {
  }
  return content
};
domina.html = function html(content) {
  return domina.single_node.call(null, content).innerHTML
};
domina.set_html_BANG_ = function set_html_BANG_(content, html_string) {
  var allows_inner_html_QMARK___16260 = cljs.core.not.call(null, cljs.core.re_find.call(null, domina.re_no_inner_html, html_string));
  var leading_whitespace_QMARK___16261 = cljs.core.re_find.call(null, domina.re_leading_whitespace, html_string);
  var tag_name__16263 = cljs.core.str.call(null, cljs.core.second.call(null, cljs.core.re_find.call(null, domina.re_tag_name, html_string))).toLowerCase();
  var special_tag_QMARK___16264 = cljs.core.contains_QMARK_.call(null, domina.wrap_map, tag_name__16263);
  var fallback__16265 = function(p1__16248_SHARP_) {
    return domina.append_BANG_.call(null, domina.destroy_children_BANG_.call(null, content), p1__16248_SHARP_)
  };
  if(cljs.core.truth_(function() {
    var and__3546__auto____16266 = allows_inner_html_QMARK___16260;
    if(cljs.core.truth_(and__3546__auto____16266)) {
      var and__3546__auto____16268 = function() {
        var or__3548__auto____16267 = domina.support.leading_whitespace_QMARK_;
        if(cljs.core.truth_(or__3548__auto____16267)) {
          return or__3548__auto____16267
        }else {
          return cljs.core.not.call(null, leading_whitespace_QMARK___16261)
        }
      }();
      if(cljs.core.truth_(and__3546__auto____16268)) {
        return cljs.core.not.call(null, special_tag_QMARK___16264)
      }else {
        return and__3546__auto____16268
      }
    }else {
      return and__3546__auto____16266
    }
  }())) {
    var value__16291 = clojure.string.replace.call(null, html_string, domina.re_xhtml_tag, "<$1></$2>");
    try {
      var G__16373__16379 = cljs.core.seq.call(null, domina.nodes.call(null, content));
      if(cljs.core.truth_(G__16373__16379)) {
        var node__16380 = cljs.core.first.call(null, G__16373__16379);
        var G__16373__16381 = G__16373__16379;
        while(true) {
          goog.events.removeAll.call(null, node__16380);
          node__16380.innerHTML = value__16291;
          var temp__3698__auto____16384 = cljs.core.next.call(null, G__16373__16381);
          if(cljs.core.truth_(temp__3698__auto____16384)) {
            var G__16373__16385 = temp__3698__auto____16384;
            var G__16397 = cljs.core.first.call(null, G__16373__16385);
            var G__16399 = G__16373__16385;
            node__16380 = G__16397;
            G__16373__16381 = G__16399;
            continue
          }else {
          }
          break
        }
      }else {
      }
    }catch(e16371) {
      if(cljs.core.truth_(cljs.core.instance_QMARK_.call(null, domina.Exception, e16371))) {
        var e__16372 = e16371;
        fallback__16265.call(null, value__16291)
      }else {
        if(cljs.core.truth_("\ufdd0'else")) {
          throw e16371;
        }else {
        }
      }
    }
  }else {
    fallback__16265.call(null, html_string)
  }
  return content
};
domina.apply_with_cloning = function apply_with_cloning(f, parent_content, child_content) {
  var parents__16404 = domina.nodes.call(null, parent_content);
  var children__16405 = domina.nodes.call(null, child_content);
  var first_child__16417 = function() {
    var frag__16406 = document.createDocumentFragment();
    var G__16407__16409 = cljs.core.seq.call(null, children__16405);
    if(cljs.core.truth_(G__16407__16409)) {
      var child__16410 = cljs.core.first.call(null, G__16407__16409);
      var G__16407__16411 = G__16407__16409;
      while(true) {
        frag__16406.appendChild(child__16410);
        var temp__3698__auto____16412 = cljs.core.next.call(null, G__16407__16411);
        if(cljs.core.truth_(temp__3698__auto____16412)) {
          var G__16407__16413 = temp__3698__auto____16412;
          var G__16433 = cljs.core.first.call(null, G__16407__16413);
          var G__16434 = G__16407__16413;
          child__16410 = G__16433;
          G__16407__16411 = G__16434;
          continue
        }else {
        }
        break
      }
    }else {
    }
    return frag__16406
  }();
  var other_children__16420 = cljs.core.doall.call(null, cljs.core.repeatedly.call(null, cljs.core.count.call(null, parents__16404) - 1, function() {
    return first_child__16417.cloneNode(true)
  }));
  if(cljs.core.truth_(cljs.core.seq.call(null, parents__16404))) {
    f.call(null, cljs.core.first.call(null, parents__16404), first_child__16417);
    return cljs.core.doall.call(null, cljs.core.map.call(null, function(p1__16255_SHARP_, p2__16256_SHARP_) {
      return f.call(null, p1__16255_SHARP_, p2__16256_SHARP_)
    }, cljs.core.rest.call(null, parents__16404), other_children__16420))
  }else {
    return null
  }
};
domina.lazy_nl_via_item = function() {
  var lazy_nl_via_item = null;
  var lazy_nl_via_item__16439 = function(nl) {
    return lazy_nl_via_item.call(null, nl, 0)
  };
  var lazy_nl_via_item__16441 = function(nl, n) {
    if(cljs.core.truth_(n < nl.length)) {
      return new cljs.core.LazySeq(null, false, function() {
        return cljs.core.cons.call(null, nl.item(n), lazy_nl_via_item.call(null, nl, n + 1))
      })
    }else {
      return null
    }
  };
  lazy_nl_via_item = function(nl, n) {
    switch(arguments.length) {
      case 1:
        return lazy_nl_via_item__16439.call(this, nl);
      case 2:
        return lazy_nl_via_item__16441.call(this, nl, n)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return lazy_nl_via_item
}();
domina.lazy_nl_via_array_ref = function() {
  var lazy_nl_via_array_ref = null;
  var lazy_nl_via_array_ref__16451 = function(nl) {
    return lazy_nl_via_array_ref.call(null, nl, 0)
  };
  var lazy_nl_via_array_ref__16452 = function(nl, n) {
    if(cljs.core.truth_(n < nl.length)) {
      return new cljs.core.LazySeq(null, false, function() {
        return cljs.core.cons.call(null, nl[n], lazy_nl_via_array_ref.call(null, nl, n + 1))
      })
    }else {
      return null
    }
  };
  lazy_nl_via_array_ref = function(nl, n) {
    switch(arguments.length) {
      case 1:
        return lazy_nl_via_array_ref__16451.call(this, nl);
      case 2:
        return lazy_nl_via_array_ref__16452.call(this, nl, n)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return lazy_nl_via_array_ref
}();
domina.lazy_nodelist = function lazy_nodelist(nl) {
  if(cljs.core.truth_(nl.item)) {
    return domina.lazy_nl_via_item.call(null, nl)
  }else {
    return domina.lazy_nl_via_array_ref.call(null, nl)
  }
};
domina.normalize_seq = function normalize_seq(list_thing) {
  if(cljs.core.truth_(function() {
    var x__6767__auto____16466 = list_thing;
    if(cljs.core.truth_(function() {
      var and__3546__auto____16469 = x__6767__auto____16466;
      if(cljs.core.truth_(and__3546__auto____16469)) {
        var and__3546__auto____16470 = x__6767__auto____16466.cljs$core$ISeqable$;
        if(cljs.core.truth_(and__3546__auto____16470)) {
          var and__3546__auto____16472 = x__6767__auto____16466.hasOwnProperty;
          if(cljs.core.truth_(and__3546__auto____16472)) {
            return cljs.core.not.call(null, x__6767__auto____16466.hasOwnProperty("cljs$core$ISeqable$"))
          }else {
            return and__3546__auto____16472
          }
        }else {
          return and__3546__auto____16470
        }
      }else {
        return and__3546__auto____16469
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeqable, x__6767__auto____16466)
    }
  }())) {
    return cljs.core.seq.call(null, list_thing)
  }else {
    if(cljs.core.truth_(list_thing.length)) {
      return domina.lazy_nodelist.call(null, list_thing)
    }else {
      if(cljs.core.truth_("\ufdd0'default")) {
        return cljs.core.cons.call(null, list_thing)
      }else {
        return null
      }
    }
  }
};
domina.DomContent["_"] = true;
domina.nodes["_"] = function(content) {
  if(cljs.core.truth_(function() {
    var x__6767__auto____16518 = content;
    if(cljs.core.truth_(function() {
      var and__3546__auto____16520 = x__6767__auto____16518;
      if(cljs.core.truth_(and__3546__auto____16520)) {
        var and__3546__auto____16522 = x__6767__auto____16518.cljs$core$ISeqable$;
        if(cljs.core.truth_(and__3546__auto____16522)) {
          var and__3546__auto____16523 = x__6767__auto____16518.hasOwnProperty;
          if(cljs.core.truth_(and__3546__auto____16523)) {
            return cljs.core.not.call(null, x__6767__auto____16518.hasOwnProperty("cljs$core$ISeqable$"))
          }else {
            return and__3546__auto____16523
          }
        }else {
          return and__3546__auto____16522
        }
      }else {
        return and__3546__auto____16520
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeqable, x__6767__auto____16518)
    }
  }())) {
    return cljs.core.seq.call(null, content)
  }else {
    if(cljs.core.truth_(cljs.core.truth_(content.length) ? null : null)) {
      return domina.lazy_nodelist.call(null, content)
    }else {
      if(cljs.core.truth_("\ufdd0'default")) {
        return cljs.core.cons.call(null, content)
      }else {
        return null
      }
    }
  }
};
domina.single_node["_"] = function(content) {
  if(cljs.core.truth_(function() {
    var x__6767__auto____16528 = content;
    if(cljs.core.truth_(function() {
      var and__3546__auto____16531 = x__6767__auto____16528;
      if(cljs.core.truth_(and__3546__auto____16531)) {
        var and__3546__auto____16533 = x__6767__auto____16528.cljs$core$ISeqable$;
        if(cljs.core.truth_(and__3546__auto____16533)) {
          var and__3546__auto____16535 = x__6767__auto____16528.hasOwnProperty;
          if(cljs.core.truth_(and__3546__auto____16535)) {
            return cljs.core.not.call(null, x__6767__auto____16528.hasOwnProperty("cljs$core$ISeqable$"))
          }else {
            return and__3546__auto____16535
          }
        }else {
          return and__3546__auto____16533
        }
      }else {
        return and__3546__auto____16531
      }
    }())) {
      return true
    }else {
      return cljs.core.type_satisfies_.call(null, cljs.core.ISeqable, x__6767__auto____16528)
    }
  }())) {
    return cljs.core.first.call(null, content)
  }else {
    if(cljs.core.truth_(cljs.core.truth_(content.length) ? null : null)) {
      return content.item(0)
    }else {
      if(cljs.core.truth_("\ufdd0'default")) {
        return content
      }else {
        return null
      }
    }
  }
};
domina.DomContent["string"] = true;
domina.nodes["string"] = function(s) {
  return cljs.core.doall.call(null, domina.nodes.call(null, domina.string_to_dom.call(null, s)))
};
domina.single_node["string"] = function(s) {
  return domina.single_node.call(null, domina.string_to_dom.call(null, s))
};
if(cljs.core.truth_(typeof NodeList != "undefined")) {
  NodeList.prototype.cljs$core$ISeqable$ = true;
  NodeList.prototype.cljs$core$ISeqable$_seq = function(nodelist) {
    return domina.lazy_nodelist.call(null, nodelist)
  };
  NodeList.prototype.cljs$core$IIndexed$ = true;
  NodeList.prototype.cljs$core$IIndexed$_nth = function() {
    var G__16570 = null;
    var G__16570__16572 = function(nodelist, n) {
      return nodelist.item(n)
    };
    var G__16570__16573 = function(nodelist, n, not_found) {
      if(cljs.core.truth_(nodelist.length <= n)) {
        return not_found
      }else {
        return cljs.core.nth.call(null, nodelist, n)
      }
    };
    G__16570 = function(nodelist, n, not_found) {
      switch(arguments.length) {
        case 2:
          return G__16570__16572.call(this, nodelist, n);
        case 3:
          return G__16570__16573.call(this, nodelist, n, not_found)
      }
      throw"Invalid arity: " + arguments.length;
    };
    return G__16570
  }();
  NodeList.prototype.cljs$core$ICounted$ = true;
  NodeList.prototype.cljs$core$ICounted$_count = function(nodelist) {
    return nodelist.length
  }
}else {
}
if(cljs.core.truth_(typeof StaticNodeList != "undefined")) {
  StaticNodeList.prototype.cljs$core$ISeqable$ = true;
  StaticNodeList.prototype.cljs$core$ISeqable$_seq = function(nodelist) {
    return domina.lazy_nodelist.call(null, nodelist)
  };
  StaticNodeList.prototype.cljs$core$IIndexed$ = true;
  StaticNodeList.prototype.cljs$core$IIndexed$_nth = function() {
    var G__16584 = null;
    var G__16584__16585 = function(nodelist, n) {
      return nodelist.item(n)
    };
    var G__16584__16587 = function(nodelist, n, not_found) {
      if(cljs.core.truth_(nodelist.length <= n)) {
        return not_found
      }else {
        return cljs.core.nth.call(null, nodelist, n)
      }
    };
    G__16584 = function(nodelist, n, not_found) {
      switch(arguments.length) {
        case 2:
          return G__16584__16585.call(this, nodelist, n);
        case 3:
          return G__16584__16587.call(this, nodelist, n, not_found)
      }
      throw"Invalid arity: " + arguments.length;
    };
    return G__16584
  }();
  StaticNodeList.prototype.cljs$core$ICounted$ = true;
  StaticNodeList.prototype.cljs$core$ICounted$_count = function(nodelist) {
    return nodelist.length
  }
}else {
}
if(cljs.core.truth_(typeof HTMLCollection != "undefined")) {
  HTMLCollection.prototype.cljs$core$ISeqable$ = true;
  HTMLCollection.prototype.cljs$core$ISeqable$_seq = function(coll) {
    return domina.lazy_nodelist.call(null, coll)
  };
  HTMLCollection.prototype.cljs$core$IIndexed$ = true;
  HTMLCollection.prototype.cljs$core$IIndexed$_nth = function() {
    var G__16599 = null;
    var G__16599__16600 = function(coll, n) {
      return coll.item(n)
    };
    var G__16599__16601 = function(coll, n, not_found) {
      if(cljs.core.truth_(coll.length <= n)) {
        return not_found
      }else {
        return cljs.core.nth.call(null, coll, n)
      }
    };
    G__16599 = function(coll, n, not_found) {
      switch(arguments.length) {
        case 2:
          return G__16599__16600.call(this, coll, n);
        case 3:
          return G__16599__16601.call(this, coll, n, not_found)
      }
      throw"Invalid arity: " + arguments.length;
    };
    return G__16599
  }();
  HTMLCollection.prototype.cljs$core$ICounted$ = true;
  HTMLCollection.prototype.cljs$core$ICounted$_count = function(coll) {
    return coll.length
  }
}else {
}
;goog.provide("domina.xpath");
goog.require("cljs.core");
goog.require("domina");
goog.require("goog.dom");
domina.xpath.select_node_STAR_ = function select_node_STAR_(path, node, technique_1, technique_2) {
  var doc__15777 = goog.dom.getOwnerDocument.call(null, node);
  if(cljs.core.truth_(function() {
    var and__3546__auto____15778 = node.selectSingleNode;
    if(cljs.core.truth_(and__3546__auto____15778)) {
      return doc__15777.setProperty
    }else {
      return and__3546__auto____15778
    }
  }())) {
    doc__15777.setProperty("SelectionLanguage", "XPath");
    return technique_1.call(null, node, path)
  }else {
    if(cljs.core.truth_(doc__15777.evaluate)) {
      return technique_2.call(null, null, doc__15777, node, path)
    }else {
      if(cljs.core.truth_("\ufdd0'else")) {
        throw new Error("Could not find XPath support in this browser.");
      }else {
        return null
      }
    }
  }
};
domina.xpath.select_node = function select_node(expr, node) {
  return domina.xpath.select_node_STAR_.call(null, expr, node, function(node, expr) {
    return node.selectSingleNode(expr)
  }, function(resolver, doc, node, expr) {
    var result__15782 = doc.evaluate(expr, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result__15782.singleNodeValue
  })
};
domina.xpath.select_nodes = function select_nodes(expr, node) {
  return domina.xpath.select_node_STAR_.call(null, expr, node, function(node, expr) {
    return node.selectNodes(expr)
  }, function(resolver, doc, node, expr) {
    var result__15783 = doc.evaluate(expr, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    var num_results__15784 = result__15783.snapshotLength;
    var i__15785 = 0;
    var acc__15786 = null;
    while(true) {
      if(cljs.core.truth_(i__15785 < num_results__15784)) {
        var G__15788 = i__15785 + 1;
        var G__15789 = cljs.core.cons.call(null, result__15783.snapshotItem(i__15785), acc__15786);
        i__15785 = G__15788;
        acc__15786 = G__15789;
        continue
      }else {
        return acc__15786
      }
      break
    }
  })
};
domina.xpath.root_element = function root_element() {
  return goog.dom.getElementsByTagNameAndClass.call(null, "html")[0]
};
domina.xpath.xpath = function() {
  var xpath = null;
  var xpath__15800 = function(expr) {
    return xpath.call(null, domina.xpath.root_element.call(null), expr)
  };
  var xpath__15801 = function(base, expr) {
    if(cljs.core.truth_(void 0 === domina.xpath.t15792)) {
      domina.xpath.t15792 = function(expr, base, xpath, __meta) {
        this.expr = expr;
        this.base = base;
        this.xpath = xpath;
        this.__meta = __meta
      };
      domina.xpath.t15792.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
        return cljs.core.list.call(null, "domina.xpath.t15792")
      };
      domina.xpath.t15792.prototype.domina$DomContent$ = true;
      domina.xpath.t15792.prototype.domina$DomContent$nodes = function(_) {
        var this__15796 = this;
        return cljs.core.mapcat.call(null, cljs.core.partial.call(null, domina.xpath.select_nodes, this__15796.expr), domina.nodes.call(null, this__15796.base))
      };
      domina.xpath.t15792.prototype.domina$DomContent$single_node = function(_) {
        var this__15797 = this;
        return cljs.core.first.call(null, cljs.core.filter.call(null, cljs.core.complement.call(null, cljs.core.nil_QMARK_), cljs.core.map.call(null, cljs.core.partial.call(null, domina.xpath.select_node, this__15797.expr), domina.nodes.call(null, this__15797.base))))
      };
      domina.xpath.t15792.prototype.cljs$core$IMeta$ = true;
      domina.xpath.t15792.prototype.cljs$core$IMeta$_meta = function(_) {
        var this__15798 = this;
        return this__15798.__meta
      };
      domina.xpath.t15792.prototype.cljs$core$IWithMeta$ = true;
      domina.xpath.t15792.prototype.cljs$core$IWithMeta$_with_meta = function(_, __meta) {
        var this__15799 = this;
        return new domina.xpath.t15792(this__15799.expr, this__15799.base, this__15799.xpath, __meta)
      };
      domina.xpath.t15792
    }else {
    }
    return new domina.xpath.t15792(expr, base, xpath, null)
  };
  xpath = function(base, expr) {
    switch(arguments.length) {
      case 1:
        return xpath__15800.call(this, base);
      case 2:
        return xpath__15801.call(this, base, expr)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return xpath
}();
goog.provide("domina.css");
goog.require("cljs.core");
goog.require("goog.dom");
goog.require("goog.dom.query");
domina.css.root_element = function root_element() {
  return goog.dom.getElementsByTagNameAndClass.call(null, "html")[0]
};
domina.css.sel = function() {
  var sel = null;
  var sel__16849 = function(expr) {
    return sel.call(null, domina.css.root_element.call(null), expr)
  };
  var sel__16850 = function(base, expr) {
    if(cljs.core.truth_(void 0 === domina.css.t16840)) {
      domina.css.t16840 = function(expr, base, sel, __meta) {
        this.expr = expr;
        this.base = base;
        this.sel = sel;
        this.__meta = __meta
      };
      domina.css.t16840.cljs$core$IPrintable$_pr_seq = function(this__360__auto__) {
        return cljs.core.list.call(null, "domina.css.t16840")
      };
      domina.css.t16840.prototype.domina$DomContent$ = true;
      domina.css.t16840.prototype.domina$DomContent$nodes = function(_) {
        var this__16843 = this;
        return cljs.core.mapcat.call(null, function(p1__16833_SHARP_) {
          return goog.dom.query.call(null, this__16843.expr, p1__16833_SHARP_)
        }, domina.nodes.call(null, this__16843.base))
      };
      domina.css.t16840.prototype.domina$DomContent$single_node = function(_) {
        var this__16844 = this;
        return cljs.core.first.call(null, cljs.core.filter.call(null, cljs.core.complement.call(null, cljs.core.nil_QMARK_), cljs.core.mapcat.call(null, function(p1__16834_SHARP_) {
          return goog.dom.query.call(null, this__16844.expr, p1__16834_SHARP_)
        }, domina.nodes.call(null, this__16844.base))))
      };
      domina.css.t16840.prototype.cljs$core$IMeta$ = true;
      domina.css.t16840.prototype.cljs$core$IMeta$_meta = function(_) {
        var this__16845 = this;
        return this__16845.__meta
      };
      domina.css.t16840.prototype.cljs$core$IWithMeta$ = true;
      domina.css.t16840.prototype.cljs$core$IWithMeta$_with_meta = function(_, __meta) {
        var this__16848 = this;
        return new domina.css.t16840(this__16848.expr, this__16848.base, this__16848.sel, __meta)
      };
      domina.css.t16840
    }else {
    }
    return new domina.css.t16840(expr, base, sel, null)
  };
  sel = function(base, expr) {
    switch(arguments.length) {
      case 1:
        return sel__16849.call(this, base);
      case 2:
        return sel__16850.call(this, base, expr)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return sel
}();
goog.provide("domina.events");
goog.require("cljs.core");
goog.require("domina");
goog.require("goog.events");
domina.events.child_of_QMARK_ = function child_of_QMARK_(parent, child) {
  while(true) {
    if(cljs.core.truth_(cljs.core.not.call(null, child))) {
      return false
    }else {
      if(cljs.core.truth_(parent === child)) {
        return false
      }else {
        if(cljs.core.truth_(child.parentNode === parent)) {
          return true
        }else {
          if(cljs.core.truth_("\ufdd0'else")) {
            var G__15528 = parent;
            var G__15529 = child.parentNode;
            parent = G__15528;
            child = G__15529;
            continue
          }else {
            return null
          }
        }
      }
    }
    break
  }
};
domina.events.mouse_enter_leave = function mouse_enter_leave(func) {
  return function(e) {
    var re__15531 = e.relatedTarget;
    var this$__15532 = e.currentTarget;
    if(cljs.core.truth_(function() {
      var and__3546__auto____15535 = cljs.core.not.call(null, re__15531 === this$__15532);
      if(cljs.core.truth_(and__3546__auto____15535)) {
        return cljs.core.not.call(null, domina.events.child_of_QMARK_.call(null, this$__15532, re__15531))
      }else {
        return and__3546__auto____15535
      }
    }())) {
      return func.call(null, e)
    }else {
      return null
    }
  }
};
domina.events.gen_wrapper = function gen_wrapper(event_key, wrapped_key, wrapper_func) {
  var obj__15545 = new Object;
  var wevent__15547 = cljs.core.name.call(null, wrapped_key);
  var event__15550 = cljs.core.name.call(null, event_key);
  obj__15545.wrapped_event = wevent__15547;
  obj__15545.event = event__15550;
  obj__15545.listen = function(elm, func, capture, opt_scope, opt_handler) {
    var callback__15551 = wrapper_func.call(null, func);
    callback__15551.listen = func;
    callback__15551.scope = opt_scope;
    callback__15551.event = event__15550;
    callback__15551.capture = capture;
    if(cljs.core.truth_(domina.events.op_handler)) {
      return opt_handler.listen(elm, wevent__15547, callback__15551, capture)
    }else {
      return goog.events.listen.call(null, elm, wevent__15547, callback__15551, capture)
    }
  };
  obj__15545.unlisten = function(elm, func, capture, opt_scope, opt_handler) {
    var listeners__15564 = cljs.core.truth_(cljs.core._EQ_.call(null, capture, undefined)) ? cljs.core.concat.call(null, goog.events.getListeners.call(null, elm, wevent__15547, false), goog.events.getListeners.call(null, elm, wevent__15547, true)) : goog.events.getListeners.call(null, elm, wevent__15547, capture);
    return cljs.core.dorun.call(null, cljs.core.map.call(null, function(obj) {
      var listener__15567 = obj.listener;
      var lfunc__15568 = listener__15567.listen;
      var scope__15569 = listener__15567.scope;
      var capture__15570 = listener__15567.capture;
      if(cljs.core.truth_(function() {
        var and__3546__auto____15575 = function() {
          var or__3548__auto____15573 = cljs.core.not.call(null, func);
          if(cljs.core.truth_(or__3548__auto____15573)) {
            return or__3548__auto____15573
          }else {
            return cljs.core._EQ_.call(null, lfunc__15568, func)
          }
        }();
        if(cljs.core.truth_(and__3546__auto____15575)) {
          var or__3548__auto____15577 = cljs.core.not.call(null, opt_scope);
          if(cljs.core.truth_(or__3548__auto____15577)) {
            return or__3548__auto____15577
          }else {
            return cljs.core._EQ_.call(null, scope__15569, opt_scope)
          }
        }else {
          return and__3546__auto____15575
        }
      }())) {
        if(cljs.core.truth_(opt_handler)) {
          return opt_handler.unlisten(elm, wevent__15547, listener__15567, capture__15570)
        }else {
          return goog.events.unlisten.call(null, elm, wevent__15547, listener__15567, capture__15570)
        }
      }else {
        return null
      }
    }, listeners__15564))
  };
  return obj__15545
};
domina.events.wrapper_register = cljs.core.atom.call(null, cljs.core.ObjMap.fromObject([], {}));
domina.events.reg_event_wrapper_BANG_ = function reg_event_wrapper_BANG_(event_key, wrapped_key, wrapper_func) {
  return cljs.core.swap_BANG_.call(null, domina.events.wrapper_register, cljs.core.assoc, event_key, domina.events.gen_wrapper.call(null, event_key, wrapped_key, wrapper_func))
};
domina.events.listen_BANG_ = function() {
  var listen_BANG_ = null;
  var listen_BANG___15602 = function(nds, event, func) {
    return listen_BANG_.call(null, nds, event, func, false)
  };
  var listen_BANG___15603 = function(nds, event, func, capture) {
    var wrapper__15587 = cljs.core.deref.call(null, domina.events.wrapper_register).call(null, event);
    var G__15588__15589 = cljs.core.seq.call(null, domina.nodes.call(null, nds));
    if(cljs.core.truth_(G__15588__15589)) {
      var node__15594 = cljs.core.first.call(null, G__15588__15589);
      var G__15588__15595 = G__15588__15589;
      while(true) {
        if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, wrapper__15587))) {
          goog.events.listen.call(null, node__15594, cljs.core.name.call(null, event), func, capture)
        }else {
          goog.events.listenWithWrapper.call(null, node__15594, wrapper__15587, func, capture)
        }
        var temp__3698__auto____15599 = cljs.core.next.call(null, G__15588__15595);
        if(cljs.core.truth_(temp__3698__auto____15599)) {
          var G__15588__15600 = temp__3698__auto____15599;
          var G__15610 = cljs.core.first.call(null, G__15588__15600);
          var G__15611 = G__15588__15600;
          node__15594 = G__15610;
          G__15588__15595 = G__15611;
          continue
        }else {
          return null
        }
        break
      }
    }else {
      return null
    }
  };
  listen_BANG_ = function(nds, event, func, capture) {
    switch(arguments.length) {
      case 3:
        return listen_BANG___15602.call(this, nds, event, func);
      case 4:
        return listen_BANG___15603.call(this, nds, event, func, capture)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return listen_BANG_
}();
domina.events.unlisten_BANG_ = function() {
  var unlisten_BANG_ = null;
  var unlisten_BANG___15633 = function(nds, event, func) {
    return unlisten_BANG_.call(null, nds, event, func, false)
  };
  var unlisten_BANG___15634 = function(nds, event, func, capture) {
    var wrapper__15621 = cljs.core.deref.call(null, domina.events.wrapper_register).call(null, event);
    var G__15622__15625 = cljs.core.seq.call(null, domina.nodes.call(null, nds));
    if(cljs.core.truth_(G__15622__15625)) {
      var node__15626 = cljs.core.first.call(null, G__15622__15625);
      var G__15622__15628 = G__15622__15625;
      while(true) {
        if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, wrapper__15621))) {
          goog.events.unlisten.call(null, node__15626, cljs.core.name.call(null, event), func, capture)
        }else {
          wrapper__15621.unlisten(node__15626, func, capture)
        }
        var temp__3698__auto____15631 = cljs.core.next.call(null, G__15622__15628);
        if(cljs.core.truth_(temp__3698__auto____15631)) {
          var G__15622__15632 = temp__3698__auto____15631;
          var G__15701 = cljs.core.first.call(null, G__15622__15632);
          var G__15702 = G__15622__15632;
          node__15626 = G__15701;
          G__15622__15628 = G__15702;
          continue
        }else {
          return null
        }
        break
      }
    }else {
      return null
    }
  };
  unlisten_BANG_ = function(nds, event, func, capture) {
    switch(arguments.length) {
      case 3:
        return unlisten_BANG___15633.call(this, nds, event, func);
      case 4:
        return unlisten_BANG___15634.call(this, nds, event, func, capture)
    }
    throw"Invalid arity: " + arguments.length;
  };
  return unlisten_BANG_
}();
domina.events.remove_listeners_BANG_ = function() {
  var remove_listeners_BANG___delegate = function(nds, event_list) {
    var G__15708__15709 = cljs.core.seq.call(null, domina.nodes.call(null, nds));
    if(cljs.core.truth_(G__15708__15709)) {
      var node__15710 = cljs.core.first.call(null, G__15708__15709);
      var G__15708__15711 = G__15708__15709;
      while(true) {
        var map_func__15715 = function(node__15710, G__15708__15711) {
          return function(p1__15614_SHARP_) {
            var wrapper__15713 = cljs.core.deref.call(null, domina.events.wrapper_register).call(null, p1__15614_SHARP_);
            if(cljs.core.truth_(wrapper__15713)) {
              return wrapper__15713.unlisten(node__15710)
            }else {
              return goog.events.removeAll.call(null, node__15710, cljs.core.name.call(null, p1__15614_SHARP_))
            }
          }
        }(node__15710, G__15708__15711);
        cljs.core.doall.call(null, cljs.core.map.call(null, map_func__15715, event_list));
        var temp__3698__auto____15716 = cljs.core.next.call(null, G__15708__15711);
        if(cljs.core.truth_(temp__3698__auto____15716)) {
          var G__15708__15717 = temp__3698__auto____15716;
          var G__15727 = cljs.core.first.call(null, G__15708__15717);
          var G__15729 = G__15708__15717;
          node__15710 = G__15727;
          G__15708__15711 = G__15729;
          continue
        }else {
          return null
        }
        break
      }
    }else {
      return null
    }
  };
  var remove_listeners_BANG_ = function(nds, var_args) {
    var event_list = null;
    if(goog.isDef(var_args)) {
      event_list = cljs.core.array_seq(Array.prototype.slice.call(arguments, 1), 0)
    }
    return remove_listeners_BANG___delegate.call(this, nds, event_list)
  };
  remove_listeners_BANG_.cljs$lang$maxFixedArity = 1;
  remove_listeners_BANG_.cljs$lang$applyTo = function(arglist__15730) {
    var nds = cljs.core.first(arglist__15730);
    var event_list = cljs.core.rest(arglist__15730);
    return remove_listeners_BANG___delegate.call(this, nds, event_list)
  };
  return remove_listeners_BANG_
}();
domina.events.fire_listeners_BANG_ = function fire_listeners_BANG_(nds, event, capture, event_map) {
  var wrapper__15731 = cljs.core.deref.call(null, domina.events.wrapper_register).call(null, event);
  var nevent__15732 = cljs.core.truth_(wrapper__15731) ? wrapper__15731.wrapped_event : cljs.core.name.call(null, event);
  var event_obj__15735 = new goog.events.Event(event_map.call(null, "\ufdd0'type"), event_map.call(null, "\ufdd0'target"));
  event_obj__15735.relatedTarget = event_map.call(null, "\ufdd0'related-target");
  var G__15736__15739 = cljs.core.seq.call(null, domina.nodes.call(null, nds));
  if(cljs.core.truth_(G__15736__15739)) {
    var node__15740 = cljs.core.first.call(null, G__15736__15739);
    var G__15736__15741 = G__15736__15739;
    while(true) {
      goog.events.fireListeners.call(null, node__15740, nevent__15732, capture, event_obj__15735);
      var temp__3698__auto____15743 = cljs.core.next.call(null, G__15736__15741);
      if(cljs.core.truth_(temp__3698__auto____15743)) {
        var G__15736__15745 = temp__3698__auto____15743;
        var G__15759 = cljs.core.first.call(null, G__15736__15745);
        var G__15760 = G__15736__15745;
        node__15740 = G__15759;
        G__15736__15741 = G__15760;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
};
domina.events.reg_event_wrapper_BANG_.call(null, "\ufdd0'mouseenter", "\ufdd0'mouseover", domina.events.mouse_enter_leave);
domina.events.reg_event_wrapper_BANG_.call(null, "\ufdd0'mouseleave", "\ufdd0'mouseout", domina.events.mouse_enter_leave);
goog.provide("domina.test");
goog.require("cljs.core");
goog.require("domina.xpath");
goog.require("domina.css");
goog.require("domina.events");
goog.require("domina");
goog.require("goog.events");
window["tryfn"] = function(f) {
  try {
    return f.call()
  }catch(e) {
    if(e == "fail hard") {
      throw e;
    }else {
      return e
    }
  }
};
domina.test.tests = cljs.core.atom.call(null, cljs.core.Vector.fromArray([]));
domina.test.add_test = function add_test(name, testfn) {
  return cljs.core.swap_BANG_.call(null, domina.test.tests, cljs.core.conj, cljs.core.Vector.fromArray([name, testfn]))
};
domina.test.run_test = function run_test(testfn) {
  return tryfn.call(null, testfn)
};
domina.test.run_named = function run_named(n) {
  return cljs.core.map.call(null, function(p__6586) {
    var vec__6588__6590 = p__6586;
    var name__6592 = cljs.core.nth.call(null, vec__6588__6590, 0, null);
    var testfn__6594 = cljs.core.nth.call(null, vec__6588__6590, 1, null);
    return cljs.core.Vector.fromArray([name__6592, domina.test.run_test.call(null, testfn__6594)])
  }, cljs.core.filter.call(null, function(p__6595) {
    var vec__6596__6597 = p__6595;
    var name__6598 = cljs.core.nth.call(null, vec__6596__6597, 0, null);
    var ___6599 = cljs.core.nth.call(null, vec__6596__6597, 1, null);
    return cljs.core._EQ_.call(null, name__6598, n)
  }, cljs.core.deref.call(null, domina.test.tests)))
};
domina.test.run_tests = function run_tests() {
  return cljs.core.map.call(null, function(p__6605) {
    var vec__6606__6607 = p__6605;
    var name__6608 = cljs.core.nth.call(null, vec__6606__6607, 0, null);
    var testfn__6609 = cljs.core.nth.call(null, vec__6606__6607, 1, null);
    return cljs.core.Vector.fromArray([name__6608, domina.test.run_test.call(null, testfn__6609)])
  }, cljs.core.deref.call(null, domina.test.tests))
};
domina.test.reset = function reset() {
  return domina.destroy_BANG_.call(null, domina.xpath.xpath.call(null, "//body/*"))
};
domina.test.standard_fixture = function standard_fixture() {
  return domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div class='d1'><p class='p1'>P1</p><p class='p2'>P2</p>\n<p id='id1' class='p3'>P3</p>")
};
domina.test.add_test.call(null, "basic CSS selection", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 3, cljs.core.count.call(null, domina.nodes.call(null, domina.css.sel.call(null, "p")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 3, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'sel", "p"), cljs.core.hash_map("\ufdd0'line", 66))), cljs.core.hash_map("\ufdd0'line", 66))), cljs.core.hash_map("\ufdd0'line", 66))), cljs.core.hash_map("\ufdd0'line", 66)))));
  }
});
domina.test.add_test.call(null, "basic CSS selection (single node)", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.nil_QMARK_.call(null, domina.single_node.call(null, domina.css.sel.call(null, "p")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'not", cljs.core.with_meta(cljs.core.list("\ufdd1'nil?", cljs.core.with_meta(cljs.core.list("\ufdd1'single-node", cljs.core.with_meta(cljs.core.list("\ufdd1'sel", "p"), cljs.core.hash_map("\ufdd0'line", 71))), cljs.core.hash_map("\ufdd0'line", 71))), cljs.core.hash_map("\ufdd0'line", 71))), cljs.core.hash_map("\ufdd0'line", 71)))));
  }
});
domina.test.add_test.call(null, "CSS selection with class specification", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.css.sel.call(null, ".d1")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'sel", ".d1"), cljs.core.hash_map("\ufdd0'line", 76))), cljs.core.hash_map("\ufdd0'line", 76))), cljs.core.hash_map("\ufdd0'line", 76))), cljs.core.hash_map("\ufdd0'line", 76)))));
  }
});
domina.test.add_test.call(null, "a relative CSS selector", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 3, cljs.core.count.call(null, domina.nodes.call(null, domina.css.sel.call(null, domina.css.sel.call(null, ".d1"), "p")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 3, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'->", cljs.core.with_meta(cljs.core.list("\ufdd1'sel", ".d1"), cljs.core.hash_map("\ufdd0'line", 81)), cljs.core.with_meta(cljs.core.list("\ufdd1'sel", "p"), cljs.core.hash_map("\ufdd0'line", 82))), cljs.core.hash_map("\ufdd0'line", 
    81))), cljs.core.hash_map("\ufdd0'line", 81))), cljs.core.hash_map("\ufdd0'line", 81))), cljs.core.hash_map("\ufdd0'line", 81)))));
  }
});
domina.test.add_test.call(null, "extended CSS chaining", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.css.sel.call(null, "body"), "<div><p><span>some text</span></p><p><span>more text</span></p></div>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 2, cljs.core.count.call(null, domina.nodes.call(null, domina.css.sel.call(null, domina.css.sel.call(null, domina.css.sel.call(null, domina.css.sel.call(null, "body"), "div"), "p"), "span")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 2, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'->", cljs.core.with_meta(cljs.core.list("\ufdd1'sel", "body"), cljs.core.hash_map("\ufdd0'line", 88)), cljs.core.with_meta(cljs.core.list("\ufdd1'sel", "div"), cljs.core.hash_map("\ufdd0'line", 89)), cljs.core.with_meta(cljs.core.list("\ufdd1'sel", 
    "p"), cljs.core.hash_map("\ufdd0'line", 90)), cljs.core.with_meta(cljs.core.list("\ufdd1'sel", "span"), cljs.core.hash_map("\ufdd0'line", 91))), cljs.core.hash_map("\ufdd0'line", 88))), cljs.core.hash_map("\ufdd0'line", 88))), cljs.core.hash_map("\ufdd0'line", 88))), cljs.core.hash_map("\ufdd0'line", 88)))));
  }
});
domina.test.add_test.call(null, "basic xpath selection", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 3, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 3, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 98))), cljs.core.hash_map("\ufdd0'line", 98))), cljs.core.hash_map("\ufdd0'line", 98))), cljs.core.hash_map("\ufdd0'line", 98)))));
  }
});
domina.test.add_test.call(null, "basic xpath selection (single node)", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core.not.call(null, cljs.core.nil_QMARK_.call(null, domina.single_node.call(null, domina.xpath.xpath.call(null, "//p")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'not", cljs.core.with_meta(cljs.core.list("\ufdd1'nil?", cljs.core.with_meta(cljs.core.list("\ufdd1'single-node", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 103))), cljs.core.hash_map("\ufdd0'line", 103))), cljs.core.hash_map("\ufdd0'line", 103))), cljs.core.hash_map("\ufdd0'line", 103)))));
  }
});
domina.test.add_test.call(null, "xpath selection with class specification", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@class='d1']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@class='d1']"), cljs.core.hash_map("\ufdd0'line", 108))), cljs.core.hash_map("\ufdd0'line", 108))), cljs.core.hash_map("\ufdd0'line", 108))), cljs.core.hash_map("\ufdd0'line", 108)))));
  }
});
domina.test.add_test.call(null, "a relative xpath expression", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 3, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, domina.xpath.xpath.call(null, "//body/div[@class='d1']"), "p")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 3, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'->", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/div[@class='d1']"), cljs.core.hash_map("\ufdd0'line", 113)), cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "p"), cljs.core.hash_map("\ufdd0'line", 
    114))), cljs.core.hash_map("\ufdd0'line", 113))), cljs.core.hash_map("\ufdd0'line", 113))), cljs.core.hash_map("\ufdd0'line", 113))), cljs.core.hash_map("\ufdd0'line", 113)))));
  }
});
domina.test.add_test.call(null, "extended selection chaining", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div><p><span>some text</span></p><p><span>more text</span></p></div>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 2, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, domina.xpath.xpath.call(null, domina.xpath.xpath.call(null, domina.xpath.xpath.call(null, "//body"), "div"), "p"), "span")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 2, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'->", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body"), cljs.core.hash_map("\ufdd0'line", 120)), cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "div"), cljs.core.hash_map("\ufdd0'line", 121)), cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", 
    "p"), cljs.core.hash_map("\ufdd0'line", 122)), cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "span"), cljs.core.hash_map("\ufdd0'line", 123))), cljs.core.hash_map("\ufdd0'line", 120))), cljs.core.hash_map("\ufdd0'line", 120))), cljs.core.hash_map("\ufdd0'line", 120))), cljs.core.hash_map("\ufdd0'line", 120)))));
  }
});
domina.test.add_test.call(null, "advanced xpath", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 2, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p[following-sibling::p[@class='p3']]")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 2, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p[following-sibling::p[@class='p3']]"), cljs.core.hash_map("\ufdd0'line", 127))), cljs.core.hash_map("\ufdd0'line", 127))), cljs.core.hash_map("\ufdd0'line", 127))), cljs.core.hash_map("\ufdd0'line", 127)))));
  }
});
domina.test.add_test.call(null, "look up node by id", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.by_id.call(null, "id1")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'by-id", "id1"), cljs.core.hash_map("\ufdd0'line", 132))), cljs.core.hash_map("\ufdd0'line", 132))), cljs.core.hash_map("\ufdd0'line", 132))), cljs.core.hash_map("\ufdd0'line", 132)))));
  }
});
domina.test.add_test.call(null, "look up nodes by class", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.by_class.call(null, "p3")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'by-class", "p3"), cljs.core.hash_map("\ufdd0'line", 137))), cljs.core.hash_map("\ufdd0'line", 137))), cljs.core.hash_map("\ufdd0'line", 137))), cljs.core.hash_map("\ufdd0'line", 137)))));
  }
});
domina.test.add_test.call(null, "child selection", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 3, cljs.core.count.call(null, domina.children.call(null, domina.xpath.xpath.call(null, "//div[@class='d1']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 3, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'children", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@class='d1']"), cljs.core.hash_map("\ufdd0'line", 142))), cljs.core.hash_map("\ufdd0'line", 142))), cljs.core.hash_map("\ufdd0'line", 142))), cljs.core.hash_map("\ufdd0'line", 142)))));
  }
});
domina.test.add_test.call(null, "clone a single node", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.clone.call(null, domina.single_node.call(null, domina.xpath.xpath.call(null, "//p"))))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'clone", cljs.core.with_meta(cljs.core.list("\ufdd1'single-node", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 147))), cljs.core.hash_map("\ufdd0'line", 147))), cljs.core.hash_map("\ufdd0'line", 147))), cljs.core.hash_map("\ufdd0'line", 
    147))), cljs.core.hash_map("\ufdd0'line", 147)))));
  }
});
domina.test.add_test.call(null, "clone multiple nodes", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 3, cljs.core.count.call(null, domina.clone.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p"))))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 3, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'clone", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 152))), cljs.core.hash_map("\ufdd0'line", 152))), cljs.core.hash_map("\ufdd0'line", 152))), cljs.core.hash_map("\ufdd0'line", 
    152))), cljs.core.hash_map("\ufdd0'line", 152)))));
  }
});
domina.test.add_test.call(null, "append a single child to a single parent", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<p class='appended1'>test</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//body/p[@class='appended1']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/p[@class='appended1']"), cljs.core.hash_map("\ufdd0'line", 158))), cljs.core.hash_map("\ufdd0'line", 158))), cljs.core.hash_map("\ufdd0'line", 158))), cljs.core.hash_map("\ufdd0'line", 158)))));
  }
});
domina.test.add_test.call(null, "append multiple children to a single parent", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<p class='appended2'>test2-1</p><p class='appended2'>test2-2</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 2, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//body/p[@class='appended2']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 2, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/p[@class='appended2']"), cljs.core.hash_map("\ufdd0'line", 164))), cljs.core.hash_map("\ufdd0'line", 164))), cljs.core.hash_map("\ufdd0'line", 164))), cljs.core.hash_map("\ufdd0'line", 164)))));
  }
});
domina.test.add_test.call(null, "append a single child to multiple parents", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body/div/p"), "<span>!!</span>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 3, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div/p/span")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 3, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div/p/span"), cljs.core.hash_map("\ufdd0'line", 171))), cljs.core.hash_map("\ufdd0'line", 171))), cljs.core.hash_map("\ufdd0'line", 171))), cljs.core.hash_map("\ufdd0'line", 171)))));
  }
});
domina.test.add_test.call(null, "append multiple children to multiple parents", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body/div/p"), "some <span class='foo'>more</span> text");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 3, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div/p/span[@class='foo']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 3, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div/p/span[@class='foo']"), cljs.core.hash_map("\ufdd0'line", 178))), cljs.core.hash_map("\ufdd0'line", 178))), cljs.core.hash_map("\ufdd0'line", 178))), cljs.core.hash_map("\ufdd0'line", 178)))));
  }
});
domina.test.add_test.call(null, "prepend a single child to a single parent", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div>2</div><div>3</div>");
  domina.prepend_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div>1</div>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "1", domina.text.call(null, domina.xpath.xpath.call(null, "//body/div[1]"))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "1", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/div[1]"), cljs.core.hash_map("\ufdd0'line", 184))), cljs.core.hash_map("\ufdd0'line", 184))), cljs.core.hash_map("\ufdd0'line", 184)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "2", domina.text.call(null, domina.xpath.xpath.call(null, "//body/div[2]"))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "2", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/div[2]"), cljs.core.hash_map("\ufdd0'line", 185))), cljs.core.hash_map("\ufdd0'line", 185))), cljs.core.hash_map("\ufdd0'line", 185)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "3", domina.text.call(null, domina.xpath.xpath.call(null, "//body/div[3]"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "3", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/div[3]"), cljs.core.hash_map("\ufdd0'line", 186))), cljs.core.hash_map("\ufdd0'line", 186))), cljs.core.hash_map("\ufdd0'line", 186)))));
  }
});
domina.test.add_test.call(null, "prepend a single child to multiple parents", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div><p>2</p></div><div><p>2</p></div>");
  domina.prepend_BANG_.call(null, domina.xpath.xpath.call(null, "//body/div"), "<p>1</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 2, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//body/div/p[text()='2']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 2, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/div/p[text()='2']"), cljs.core.hash_map("\ufdd0'line", 192))), cljs.core.hash_map("\ufdd0'line", 192))), cljs.core.hash_map("\ufdd0'line", 192))), cljs.core.hash_map("\ufdd0'line", 192)))));
  }
});
domina.test.add_test.call(null, "Insert a single child to a single parent", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div class='testInserts'></div>");
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//div[@class='testInserts']"), "<p class='i1'></p>");
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//div[@class='testInserts']"), "<p class='i3'></p>");
  domina.insert_BANG_.call(null, domina.xpath.xpath.call(null, "//div[@class='testInserts']"), "<p class='i2'></p>", 1);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 3, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@class='testInserts']/p")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 3, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@class='testInserts']/p"), cljs.core.hash_map("\ufdd0'line", 204))), cljs.core.hash_map("\ufdd0'line", 204))), cljs.core.hash_map("\ufdd0'line", 204))), cljs.core.hash_map("\ufdd0'line", 204)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p[@class='i2']/preceding-sibling::*")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p[@class='i2']/preceding-sibling::*"), cljs.core.hash_map("\ufdd0'line", 205))), cljs.core.hash_map("\ufdd0'line", 205))), cljs.core.hash_map("\ufdd0'line", 205))), cljs.core.hash_map("\ufdd0'line", 205)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p[@class='i2']/following-sibling::*")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p[@class='i2']/following-sibling::*"), cljs.core.hash_map("\ufdd0'line", 206))), cljs.core.hash_map("\ufdd0'line", 206))), cljs.core.hash_map("\ufdd0'line", 206))), cljs.core.hash_map("\ufdd0'line", 206)))));
  }
});
domina.test.add_test.call(null, "Insert a single child to multiple parents", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div class='testInserts' id='testInsert1'></div>");
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div class='testInserts' id='testInsert2'></div>");
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//div[@class='testInserts']"), "<p class='i1'></p>");
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//div[@class='testInserts']"), "<p class='i3'></p>");
  domina.insert_BANG_.call(null, domina.xpath.xpath.call(null, "//div[@class='testInserts']"), "<p class='i2'></p>", 1);
  var G__6749__6750 = cljs.core.seq.call(null, cljs.core.Vector.fromArray([domina.xpath.xpath.call(null, "//div[@id='testInsert1']"), domina.xpath.xpath.call(null, "//div[@id='testInsert2']")]));
  if(cljs.core.truth_(G__6749__6750)) {
    var children__6751 = cljs.core.first.call(null, G__6749__6750);
    var G__6749__6752 = G__6749__6750;
    while(true) {
      if(cljs.core.truth_(cljs.core._EQ_.call(null, 3, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, children__6751, "p")))))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 3, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "\ufdd1'children", "p"), cljs.core.hash_map("\ufdd0'line", 222))), cljs.core.hash_map("\ufdd0'line", 222))), cljs.core.hash_map("\ufdd0'line", 222))), cljs.core.hash_map("\ufdd0'line", 222)))));
      }
      if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, children__6751, "p[@class='i2']/preceding-sibling::*")))))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "\ufdd1'children", "p[@class='i2']/preceding-sibling::*"), cljs.core.hash_map("\ufdd0'line", 223))), cljs.core.hash_map("\ufdd0'line", 223))), cljs.core.hash_map("\ufdd0'line", 223))), cljs.core.hash_map("\ufdd0'line", 
        223)))));
      }
      if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, children__6751, "p[@class='i2']/following-sibling::*")))))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "\ufdd1'children", "p[@class='i2']/following-sibling::*"), cljs.core.hash_map("\ufdd0'line", 225))), cljs.core.hash_map("\ufdd0'line", 225))), cljs.core.hash_map("\ufdd0'line", 225))), cljs.core.hash_map("\ufdd0'line", 
        225)))));
      }
      var temp__3698__auto____6755 = cljs.core.next.call(null, G__6749__6752);
      if(cljs.core.truth_(temp__3698__auto____6755)) {
        var G__6749__6756 = temp__3698__auto____6755;
        var G__6768 = cljs.core.first.call(null, G__6749__6756);
        var G__6769 = G__6749__6756;
        children__6751 = G__6768;
        G__6749__6752 = G__6769;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
});
domina.test.add_test.call(null, "destroy a single node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<p class='appended1'>app1</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//body/p[@class='appended1']")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/p[@class='appended1']"), cljs.core.hash_map("\ufdd0'line", 231))), cljs.core.hash_map("\ufdd0'line", 231))), cljs.core.hash_map("\ufdd0'line", 231))), cljs.core.hash_map("\ufdd0'line", 231)))));
  }
  domina.destroy_BANG_.call(null, domina.xpath.xpath.call(null, "//body/p[@class='appended1']"));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//body/p[@class='appended1']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 0, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/p[@class='appended1']"), cljs.core.hash_map("\ufdd0'line", 233))), cljs.core.hash_map("\ufdd0'line", 233))), cljs.core.hash_map("\ufdd0'line", 233))), cljs.core.hash_map("\ufdd0'line", 233)))));
  }
});
domina.test.add_test.call(null, "destroy multiple nodes", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<p class='appended2'>app1</p><p class='appended2'>app2</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 2, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//body/p[@class='appended2']")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 2, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/p[@class='appended2']"), cljs.core.hash_map("\ufdd0'line", 239))), cljs.core.hash_map("\ufdd0'line", 239))), cljs.core.hash_map("\ufdd0'line", 239))), cljs.core.hash_map("\ufdd0'line", 239)))));
  }
  domina.destroy_BANG_.call(null, domina.xpath.xpath.call(null, "//body/p[@class='appended2']"));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//body/p[@class='appended2']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 0, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/p[@class='appended2']"), cljs.core.hash_map("\ufdd0'line", 241))), cljs.core.hash_map("\ufdd0'line", 241))), cljs.core.hash_map("\ufdd0'line", 241))), cljs.core.hash_map("\ufdd0'line", 241)))));
  }
});
domina.test.add_test.call(null, "detach and reattach a single node", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  var n__6782 = domina.detach_BANG_.call(null, domina.xpath.xpath.call(null, "//p[@class='p3']"));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p[@class='p3']")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 0, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p[@class='p3']"), cljs.core.hash_map("\ufdd0'line", 247))), cljs.core.hash_map("\ufdd0'line", 247))), cljs.core.hash_map("\ufdd0'line", 247))), cljs.core.hash_map("\ufdd0'line", 247)))));
  }
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//div[@class='d1']"), n__6782);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p[@class='p3']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p[@class='p3']"), cljs.core.hash_map("\ufdd0'line", 249))), cljs.core.hash_map("\ufdd0'line", 249))), cljs.core.hash_map("\ufdd0'line", 249))), cljs.core.hash_map("\ufdd0'line", 249)))));
  }
});
domina.test.add_test.call(null, "detach and reattach multiple nodes", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  var n__6785 = domina.detach_BANG_.call(null, domina.xpath.xpath.call(null, "//div[@class='d1']/p"));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@class='d1']/p")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 0, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@class='d1']/p"), cljs.core.hash_map("\ufdd0'line", 255))), cljs.core.hash_map("\ufdd0'line", 255))), cljs.core.hash_map("\ufdd0'line", 255))), cljs.core.hash_map("\ufdd0'line", 255)))));
  }
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//div[@class='d1']"), n__6785);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 3, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@class='d1']/p")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 3, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@class='d1']/p"), cljs.core.hash_map("\ufdd0'line", 257))), cljs.core.hash_map("\ufdd0'line", 257))), cljs.core.hash_map("\ufdd0'line", 257))), cljs.core.hash_map("\ufdd0'line", 257)))));
  }
});
domina.test.add_test.call(null, "clear a node's contents", function() {
  domina.test.reset.call(null);
  domina.test.standard_fixture.call(null);
  domina.destroy_children_BANG_.call(null, domina.xpath.xpath.call(null, "//div[@class='d1']"));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@class='d1']")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@class='d1']"), cljs.core.hash_map("\ufdd0'line", 263))), cljs.core.hash_map("\ufdd0'line", 263))), cljs.core.hash_map("\ufdd0'line", 263))), cljs.core.hash_map("\ufdd0'line", 263)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@class='d1']/*")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 0, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@class='d1']/*"), cljs.core.hash_map("\ufdd0'line", 264))), cljs.core.hash_map("\ufdd0'line", 264))), cljs.core.hash_map("\ufdd0'line", 264))), cljs.core.hash_map("\ufdd0'line", 264)))));
  }
});
domina.test.add_test.call(null, "insert-before! with a single reference and single new node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='ref'>Some content</div>");
  domina.insert_before_BANG_.call(null, domina.nodes.call(null, domina.by_id.call(null, "ref")), "<p>before</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@id='ref']/preceding-sibling::*[text()='before']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@id='ref']/preceding-sibling::*[text()='before']"), cljs.core.hash_map("\ufdd0'line", 270))), cljs.core.hash_map("\ufdd0'line", 270))), cljs.core.hash_map("\ufdd0'line", 270))), cljs.core.hash_map("\ufdd0'line", 
    270)))));
  }
});
domina.test.add_test.call(null, "insert-before! with a single reference and multiple new nodes", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='ref'>Some content</div>");
  domina.insert_before_BANG_.call(null, domina.nodes.call(null, domina.by_id.call(null, "ref")), "<p>before1</p><p>before2</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@id='ref']/preceding-sibling::*[text()='before2' and position()=1]")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@id='ref']/preceding-sibling::*[text()='before2' and position()=1]"), cljs.core.hash_map("\ufdd0'line", 276))), cljs.core.hash_map("\ufdd0'line", 276))), cljs.core.hash_map("\ufdd0'line", 276))), cljs.core.hash_map("\ufdd0'line", 
    276)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@id='ref']/preceding-sibling::*[text()='before1' and position()=2]")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@id='ref']/preceding-sibling::*[text()='before1' and position()=2]"), cljs.core.hash_map("\ufdd0'line", 277))), cljs.core.hash_map("\ufdd0'line", 277))), cljs.core.hash_map("\ufdd0'line", 277))), cljs.core.hash_map("\ufdd0'line", 
    277)))));
  }
});
domina.test.add_test.call(null, "insert-before! with multiple reference nodes and a single new node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div class='ref' id='ref1'>content1</div>");
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div class='ref' id='ref2'>content2</div>");
  domina.insert_before_BANG_.call(null, domina.nodes.call(null, domina.by_class.call(null, "ref")), "<p>before</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 2, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 2, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 284))), cljs.core.hash_map("\ufdd0'line", 284))), cljs.core.hash_map("\ufdd0'line", 284))), cljs.core.hash_map("\ufdd0'line", 284)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@id='ref1']/preceding-sibling::p")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@id='ref1']/preceding-sibling::p"), cljs.core.hash_map("\ufdd0'line", 285))), cljs.core.hash_map("\ufdd0'line", 285))), cljs.core.hash_map("\ufdd0'line", 285))), cljs.core.hash_map("\ufdd0'line", 285)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 2, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@id='ref2']/preceding-sibling::p")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 2, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@id='ref2']/preceding-sibling::p"), cljs.core.hash_map("\ufdd0'line", 286))), cljs.core.hash_map("\ufdd0'line", 286))), cljs.core.hash_map("\ufdd0'line", 286))), cljs.core.hash_map("\ufdd0'line", 286)))));
  }
});
domina.test.add_test.call(null, "insert-after! with a single reference and single new node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='ref'>Some content</div>");
  domina.insert_after_BANG_.call(null, domina.nodes.call(null, domina.by_id.call(null, "ref")), "<p>after</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@id='ref']/following-sibling::*[text()='after']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@id='ref']/following-sibling::*[text()='after']"), cljs.core.hash_map("\ufdd0'line", 292))), cljs.core.hash_map("\ufdd0'line", 292))), cljs.core.hash_map("\ufdd0'line", 292))), cljs.core.hash_map("\ufdd0'line", 
    292)))));
  }
});
domina.test.add_test.call(null, "insert-after! with a single reference and multiple new nodes", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='ref'>Some content</div>");
  domina.insert_after_BANG_.call(null, domina.nodes.call(null, domina.by_id.call(null, "ref")), "<p>after1</p><p>after2</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@id='ref']/following-sibling::*[text()='after1' and position()=1]")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@id='ref']/following-sibling::*[text()='after1' and position()=1]"), cljs.core.hash_map("\ufdd0'line", 298))), cljs.core.hash_map("\ufdd0'line", 298))), cljs.core.hash_map("\ufdd0'line", 298))), cljs.core.hash_map("\ufdd0'line", 
    298)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@id='ref']/following-sibling::*[text()='after2' and position()=2]")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@id='ref']/following-sibling::*[text()='after2' and position()=2]"), cljs.core.hash_map("\ufdd0'line", 299))), cljs.core.hash_map("\ufdd0'line", 299))), cljs.core.hash_map("\ufdd0'line", 299))), cljs.core.hash_map("\ufdd0'line", 
    299)))));
  }
});
domina.test.add_test.call(null, "insert-after! with multiple reference nodes and a single new node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div class='ref' id='ref1'>content1</div>");
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div class='ref' id='ref2'>content2</div>");
  domina.insert_after_BANG_.call(null, domina.nodes.call(null, domina.by_class.call(null, "ref")), "<p>after</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 2, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 2, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 306))), cljs.core.hash_map("\ufdd0'line", 306))), cljs.core.hash_map("\ufdd0'line", 306))), cljs.core.hash_map("\ufdd0'line", 306)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 2, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@id='ref1']/following-sibling::p")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 2, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@id='ref1']/following-sibling::p"), cljs.core.hash_map("\ufdd0'line", 307))), cljs.core.hash_map("\ufdd0'line", 307))), cljs.core.hash_map("\ufdd0'line", 307))), cljs.core.hash_map("\ufdd0'line", 307)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//div[@id='ref2']/following-sibling::p")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[@id='ref2']/following-sibling::p"), cljs.core.hash_map("\ufdd0'line", 308))), cljs.core.hash_map("\ufdd0'line", 308))), cljs.core.hash_map("\ufdd0'line", 308))), cljs.core.hash_map("\ufdd0'line", 308)))));
  }
});
domina.test.add_test.call(null, "swap-content! with a single reference node and a single new node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div><p id='before'>TYPO</p></div>");
  domina.swap_content_BANG_.call(null, domina.xpath.xpath.call(null, "//p[@id='before']"), "<p id='after'>fixed</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p[@id='before']")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 0, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p[@id='before']"), cljs.core.hash_map("\ufdd0'line", 314))), cljs.core.hash_map("\ufdd0'line", 314))), cljs.core.hash_map("\ufdd0'line", 314))), cljs.core.hash_map("\ufdd0'line", 314)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p[@id='after']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p[@id='after']"), cljs.core.hash_map("\ufdd0'line", 315))), cljs.core.hash_map("\ufdd0'line", 315))), cljs.core.hash_map("\ufdd0'line", 315))), cljs.core.hash_map("\ufdd0'line", 315)))));
  }
});
domina.test.add_test.call(null, "swap-content! with a single reference node and multiple new nodes", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div><p id='before'>TYPO</p></div>");
  domina.swap_content_BANG_.call(null, domina.xpath.xpath.call(null, "//p[@id='before']"), "<p class='after'>fixed1</p><p class='after'>fixed2</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p[@id='before']")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 0, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p[@id='before']"), cljs.core.hash_map("\ufdd0'line", 321))), cljs.core.hash_map("\ufdd0'line", 321))), cljs.core.hash_map("\ufdd0'line", 321))), cljs.core.hash_map("\ufdd0'line", 321)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 2, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p[@class='after']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 2, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p[@class='after']"), cljs.core.hash_map("\ufdd0'line", 322))), cljs.core.hash_map("\ufdd0'line", 322))), cljs.core.hash_map("\ufdd0'line", 322))), cljs.core.hash_map("\ufdd0'line", 322)))));
  }
});
domina.test.add_test.call(null, "swap-content! with multiple reference nodes and multiple new nodes", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div><p class='before'>TYPO-1</p></div>");
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div><p class='before'>TYPO-2</p></div>");
  domina.swap_content_BANG_.call(null, domina.xpath.xpath.call(null, "//p[@class='before']"), "<p class='after'>fixed1</p><p class='after'>fixed2</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p[@class='before']")))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 0, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p[@class='before']"), cljs.core.hash_map("\ufdd0'line", 329))), cljs.core.hash_map("\ufdd0'line", 329))), cljs.core.hash_map("\ufdd0'line", 329))), cljs.core.hash_map("\ufdd0'line", 329)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 4, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//p[@class='after']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 4, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p[@class='after']"), cljs.core.hash_map("\ufdd0'line", 330))), cljs.core.hash_map("\ufdd0'line", 330))), cljs.core.hash_map("\ufdd0'line", 330))), cljs.core.hash_map("\ufdd0'line", 330)))));
  }
});
domina.test.add_test.call(null, "can retrieve a css property value", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), '<div style="background-color: maroon;">Test</div>');
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "maroon", domina.style.call(null, domina.xpath.xpath.call(null, "//div"), "background-color")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "maroon", cljs.core.with_meta(cljs.core.list("\ufdd1'style", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 337)), "background-color"), cljs.core.hash_map("\ufdd0'line", 337))), cljs.core.hash_map("\ufdd0'line", 337)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "maroon", domina.style.call(null, domina.xpath.xpath.call(null, "//div"), "\ufdd0'background-color")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "maroon", cljs.core.with_meta(cljs.core.list("\ufdd1'style", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 338)), "\ufdd0'background-color"), cljs.core.hash_map("\ufdd0'line", 338))), cljs.core.hash_map("\ufdd0'line", 338)))));
  }
  if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, domina.style.call(null, domina.xpath.xpath.call(null, "//div"), "\ufdd0'no-such-style")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'nil?", cljs.core.with_meta(cljs.core.list("\ufdd1'style", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 339)), "\ufdd0'no-such-style"), cljs.core.hash_map("\ufdd0'line", 339))), cljs.core.hash_map("\ufdd0'line", 339)))));
  }
});
domina.test.add_test.call(null, "can retrieve an HTML attribute value", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), '<div height="42">Content!</div>');
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "42", domina.attr.call(null, domina.xpath.xpath.call(null, "//div"), "height")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "42", cljs.core.with_meta(cljs.core.list("\ufdd1'attr", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 344)), "height"), cljs.core.hash_map("\ufdd0'line", 344))), cljs.core.hash_map("\ufdd0'line", 344)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "42", domina.attr.call(null, domina.xpath.xpath.call(null, "//div"), "\ufdd0'height")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "42", cljs.core.with_meta(cljs.core.list("\ufdd1'attr", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 345)), "\ufdd0'height"), cljs.core.hash_map("\ufdd0'line", 345))), cljs.core.hash_map("\ufdd0'line", 345)))));
  }
  if(cljs.core.truth_(cljs.core.nil_QMARK_.call(null, domina.attr.call(null, domina.xpath.xpath.call(null, "//div"), "\ufdd0'no-such-attr:c")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'nil?", cljs.core.with_meta(cljs.core.list("\ufdd1'attr", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 346)), "\ufdd0'no-such-attr:c"), cljs.core.hash_map("\ufdd0'line", 346))), cljs.core.hash_map("\ufdd0'line", 346)))));
  }
});
domina.test.add_test.call(null, "can set a css property on a single node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div>1</div><div>2</div>");
  domina.set_style_BANG_.call(null, domina.xpath.xpath.call(null, "//div[1]"), "background-color", "red");
  domina.set_style_BANG_.call(null, domina.xpath.xpath.call(null, "//div[2]"), "\ufdd0'background-color", "green");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "red", domina.style.call(null, domina.xpath.xpath.call(null, "//div[1]"), "background-color")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "red", cljs.core.with_meta(cljs.core.list("\ufdd1'style", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[1]"), cljs.core.hash_map("\ufdd0'line", 353)), "background-color"), cljs.core.hash_map("\ufdd0'line", 353))), cljs.core.hash_map("\ufdd0'line", 353)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "green", domina.style.call(null, domina.xpath.xpath.call(null, "//div[2]"), "background-color")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "green", cljs.core.with_meta(cljs.core.list("\ufdd1'style", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[2]"), cljs.core.hash_map("\ufdd0'line", 354)), "background-color"), cljs.core.hash_map("\ufdd0'line", 354))), cljs.core.hash_map("\ufdd0'line", 354)))));
  }
});
domina.test.add_test.call(null, "can set a css property on multiple nodes", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div>1</div><div>2</div>");
  domina.set_style_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), "color", "red");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "red", domina.style.call(null, domina.xpath.xpath.call(null, "//div[1]"), "color")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "red", cljs.core.with_meta(cljs.core.list("\ufdd1'style", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[1]"), cljs.core.hash_map("\ufdd0'line", 360)), "color"), cljs.core.hash_map("\ufdd0'line", 360))), cljs.core.hash_map("\ufdd0'line", 360)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "red", domina.style.call(null, domina.xpath.xpath.call(null, "//div[2]"), "color")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "red", cljs.core.with_meta(cljs.core.list("\ufdd1'style", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[2]"), cljs.core.hash_map("\ufdd0'line", 361)), "color"), cljs.core.hash_map("\ufdd0'line", 361))), cljs.core.hash_map("\ufdd0'line", 361)))));
  }
});
domina.test.add_test.call(null, "can set a html attribute on a single node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div>1</div><div>2</div>");
  domina.set_attr_BANG_.call(null, domina.xpath.xpath.call(null, "//div[1]"), "width", 42);
  domina.set_attr_BANG_.call(null, domina.xpath.xpath.call(null, "//div[2]"), "\ufdd0'width", 42);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "42", domina.attr.call(null, domina.xpath.xpath.call(null, "//div[1]"), "width")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "42", cljs.core.with_meta(cljs.core.list("\ufdd1'attr", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[1]"), cljs.core.hash_map("\ufdd0'line", 368)), "width"), cljs.core.hash_map("\ufdd0'line", 368))), cljs.core.hash_map("\ufdd0'line", 368)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "42", domina.attr.call(null, domina.xpath.xpath.call(null, "//div[2]"), "width")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "42", cljs.core.with_meta(cljs.core.list("\ufdd1'attr", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[2]"), cljs.core.hash_map("\ufdd0'line", 369)), "width"), cljs.core.hash_map("\ufdd0'line", 369))), cljs.core.hash_map("\ufdd0'line", 369)))));
  }
});
domina.test.add_test.call(null, "can get multiple CSS styles from a single node.", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div>1</div>");
  domina.set_style_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), "color", "red");
  domina.set_style_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), "background-color", "black");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.ObjMap.fromObject(["\ufdd0'color", "\ufdd0'background-color"], {"\ufdd0'color":"red", "\ufdd0'background-color":"black"}), domina.styles.call(null, domina.xpath.xpath.call(null, "//div"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", cljs.core.hash_map("\ufdd0'color", "red", "\ufdd0'background-color", "black"), cljs.core.with_meta(cljs.core.list("\ufdd1'styles", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 377))), cljs.core.hash_map("\ufdd0'line", 377))), cljs.core.hash_map("\ufdd0'line", 376)))));
  }
});
domina.test.add_test.call(null, "can get multiple HTML attributes from a single node.", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div>1</div>");
  domina.set_attr_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), "width", 42);
  domina.set_attr_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), "height", 24);
  var attributes__6956 = domina.attrs.call(null, domina.xpath.xpath.call(null, "//div"));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "42", "\ufdd0'width".call(null, attributes__6956)))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "42", cljs.core.with_meta(cljs.core.list("\ufdd0'width", "\ufdd1'attributes"), cljs.core.hash_map("\ufdd0'line", 385))), cljs.core.hash_map("\ufdd0'line", 385)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "24", "\ufdd0'height".call(null, attributes__6956)))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "24", cljs.core.with_meta(cljs.core.list("\ufdd0'height", "\ufdd1'attributes"), cljs.core.hash_map("\ufdd0'line", 386))), cljs.core.hash_map("\ufdd0'line", 386)))));
  }
});
domina.test.add_test.call(null, "can set multiple CSS styles on a single node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div>1</div>");
  domina.set_styles_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), cljs.core.ObjMap.fromObject(["\ufdd0'color", "\ufdd0'background-color"], {"\ufdd0'color":"red", "\ufdd0'background-color":"black"}));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "black", domina.style.call(null, domina.xpath.xpath.call(null, "//div"), "background-color")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "black", cljs.core.with_meta(cljs.core.list("\ufdd1'style", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 393)), "background-color"), cljs.core.hash_map("\ufdd0'line", 393))), cljs.core.hash_map("\ufdd0'line", 393)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "red", domina.style.call(null, domina.xpath.xpath.call(null, "//div"), "color")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "red", cljs.core.with_meta(cljs.core.list("\ufdd1'style", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 394)), "color"), cljs.core.hash_map("\ufdd0'line", 394))), cljs.core.hash_map("\ufdd0'line", 394)))));
  }
});
domina.test.add_test.call(null, "can set multiple CSS styles on multiple nodes", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div>1</div><div>2</div>");
  domina.set_styles_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), cljs.core.ObjMap.fromObject(["\ufdd0'color", "\ufdd0'background-color"], {"\ufdd0'color":"red", "\ufdd0'background-color":"black"}));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "black", domina.style.call(null, domina.xpath.xpath.call(null, "//div[1]"), "background-color")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "black", cljs.core.with_meta(cljs.core.list("\ufdd1'style", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[1]"), cljs.core.hash_map("\ufdd0'line", 401)), "background-color"), cljs.core.hash_map("\ufdd0'line", 401))), cljs.core.hash_map("\ufdd0'line", 401)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "red", domina.style.call(null, domina.xpath.xpath.call(null, "//div[1]"), "color")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "red", cljs.core.with_meta(cljs.core.list("\ufdd1'style", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[1]"), cljs.core.hash_map("\ufdd0'line", 402)), "color"), cljs.core.hash_map("\ufdd0'line", 402))), cljs.core.hash_map("\ufdd0'line", 402)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "black", domina.style.call(null, domina.xpath.xpath.call(null, "//div[2]"), "background-color")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "black", cljs.core.with_meta(cljs.core.list("\ufdd1'style", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[2]"), cljs.core.hash_map("\ufdd0'line", 403)), "background-color"), cljs.core.hash_map("\ufdd0'line", 403))), cljs.core.hash_map("\ufdd0'line", 403)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "red", domina.style.call(null, domina.xpath.xpath.call(null, "//div[2]"), "color")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "red", cljs.core.with_meta(cljs.core.list("\ufdd1'style", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[2]"), cljs.core.hash_map("\ufdd0'line", 404)), "color"), cljs.core.hash_map("\ufdd0'line", 404))), cljs.core.hash_map("\ufdd0'line", 404)))));
  }
});
domina.test.add_test.call(null, "can set multiple HTML attributes on a single node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div>1</div>");
  domina.set_attrs_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), cljs.core.ObjMap.fromObject(["\ufdd0'width", "\ufdd0'height"], {"\ufdd0'width":42, "\ufdd0'height":24}));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "42", domina.attr.call(null, domina.xpath.xpath.call(null, "//div"), "width")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "42", cljs.core.with_meta(cljs.core.list("\ufdd1'attr", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 411)), "width"), cljs.core.hash_map("\ufdd0'line", 411))), cljs.core.hash_map("\ufdd0'line", 411)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "24", domina.attr.call(null, domina.xpath.xpath.call(null, "//div"), "height")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "24", cljs.core.with_meta(cljs.core.list("\ufdd1'attr", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 412)), "height"), cljs.core.hash_map("\ufdd0'line", 412))), cljs.core.hash_map("\ufdd0'line", 412)))));
  }
});
domina.test.add_test.call(null, "can set multiple CSS styles on multiple nodes", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div>1</div><div>2</div>");
  domina.set_attrs_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), cljs.core.ObjMap.fromObject(["\ufdd0'width", "\ufdd0'height"], {"\ufdd0'width":42, "\ufdd0'height":24}));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "42", domina.attr.call(null, domina.xpath.xpath.call(null, "//div[1]"), "width")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "42", cljs.core.with_meta(cljs.core.list("\ufdd1'attr", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[1]"), cljs.core.hash_map("\ufdd0'line", 419)), "width"), cljs.core.hash_map("\ufdd0'line", 419))), cljs.core.hash_map("\ufdd0'line", 419)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "24", domina.attr.call(null, domina.xpath.xpath.call(null, "//div[1]"), "height")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "24", cljs.core.with_meta(cljs.core.list("\ufdd1'attr", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[1]"), cljs.core.hash_map("\ufdd0'line", 420)), "height"), cljs.core.hash_map("\ufdd0'line", 420))), cljs.core.hash_map("\ufdd0'line", 420)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "42", domina.attr.call(null, domina.xpath.xpath.call(null, "//div[2]"), "width")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "42", cljs.core.with_meta(cljs.core.list("\ufdd1'attr", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[2]"), cljs.core.hash_map("\ufdd0'line", 421)), "width"), cljs.core.hash_map("\ufdd0'line", 421))), cljs.core.hash_map("\ufdd0'line", 421)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "24", domina.attr.call(null, domina.xpath.xpath.call(null, "//div[2]"), "height")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "24", cljs.core.with_meta(cljs.core.list("\ufdd1'attr", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[2]"), cljs.core.hash_map("\ufdd0'line", 422)), "height"), cljs.core.hash_map("\ufdd0'line", 422))), cljs.core.hash_map("\ufdd0'line", 422)))));
  }
});
domina.test.add_test.call(null, "test the has-class? function", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div class='class1'>1</div>");
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div class='class2'>2</div>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, true, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div[1]"), "class1")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", true, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[1]"), cljs.core.hash_map("\ufdd0'line", 428)), "class1"), cljs.core.hash_map("\ufdd0'line", 428))), cljs.core.hash_map("\ufdd0'line", 428)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, true, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div[2]"), "class2")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", true, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[2]"), cljs.core.hash_map("\ufdd0'line", 429)), "class2"), cljs.core.hash_map("\ufdd0'line", 429))), cljs.core.hash_map("\ufdd0'line", 429)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, false, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div[1]"), "class2")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", false, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[1]"), cljs.core.hash_map("\ufdd0'line", 430)), "class2"), cljs.core.hash_map("\ufdd0'line", 430))), cljs.core.hash_map("\ufdd0'line", 430)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, false, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div[2]"), "class1")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", false, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[2]"), cljs.core.hash_map("\ufdd0'line", 431)), "class1"), cljs.core.hash_map("\ufdd0'line", 431))), cljs.core.hash_map("\ufdd0'line", 431)))));
  }
});
domina.test.add_test.call(null, "can add a CSS class to a single node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div>1</div>");
  domina.add_class_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), "class1");
  domina.add_class_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), "class2");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, true, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div"), "class1")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", true, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 438)), "class1"), cljs.core.hash_map("\ufdd0'line", 438))), cljs.core.hash_map("\ufdd0'line", 438)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, true, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div"), "class2")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", true, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 439)), "class2"), cljs.core.hash_map("\ufdd0'line", 439))), cljs.core.hash_map("\ufdd0'line", 439)))));
  }
});
domina.test.add_test.call(null, "can add a CSS class to multiple nodes", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div>1</div><div>2</div>");
  domina.add_class_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), "class1");
  domina.add_class_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), "class2");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, true, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div[1]"), "class1")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", true, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[1]"), cljs.core.hash_map("\ufdd0'line", 446)), "class1"), cljs.core.hash_map("\ufdd0'line", 446))), cljs.core.hash_map("\ufdd0'line", 446)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, true, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div[2]"), "class1")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", true, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[2]"), cljs.core.hash_map("\ufdd0'line", 447)), "class1"), cljs.core.hash_map("\ufdd0'line", 447))), cljs.core.hash_map("\ufdd0'line", 447)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, true, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div[1]"), "class2")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", true, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[1]"), cljs.core.hash_map("\ufdd0'line", 448)), "class2"), cljs.core.hash_map("\ufdd0'line", 448))), cljs.core.hash_map("\ufdd0'line", 448)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, true, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div[2]"), "class2")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", true, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[2]"), cljs.core.hash_map("\ufdd0'line", 449)), "class2"), cljs.core.hash_map("\ufdd0'line", 449))), cljs.core.hash_map("\ufdd0'line", 449)))));
  }
});
domina.test.add_test.call(null, "can remove a CSS class from a single node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div class='class1 class2'>1</div>");
  domina.remove_class_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), "class1");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, false, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div"), "class1")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", false, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 455)), "class1"), cljs.core.hash_map("\ufdd0'line", 455))), cljs.core.hash_map("\ufdd0'line", 455)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, true, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div"), "class2")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", true, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 456)), "class2"), cljs.core.hash_map("\ufdd0'line", 456))), cljs.core.hash_map("\ufdd0'line", 456)))));
  }
});
domina.test.add_test.call(null, "can remove a CSS class from a multiple nodes", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div class='class1 class2'>1</div><div class='class1 class2'>2</div>");
  domina.remove_class_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), "class1");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, false, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div[1]"), "class1")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", false, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[1]"), cljs.core.hash_map("\ufdd0'line", 462)), "class1"), cljs.core.hash_map("\ufdd0'line", 462))), cljs.core.hash_map("\ufdd0'line", 462)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, true, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div[1]"), "class2")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", true, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[1]"), cljs.core.hash_map("\ufdd0'line", 463)), "class2"), cljs.core.hash_map("\ufdd0'line", 463))), cljs.core.hash_map("\ufdd0'line", 463)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, false, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div[2]"), "class1")))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", false, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[2]"), cljs.core.hash_map("\ufdd0'line", 464)), "class1"), cljs.core.hash_map("\ufdd0'line", 464))), cljs.core.hash_map("\ufdd0'line", 464)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, true, domina.has_class_QMARK_.call(null, domina.xpath.xpath.call(null, "//div[2]"), "class2")))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", true, cljs.core.with_meta(cljs.core.list("\ufdd1'has-class?", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div[2]"), cljs.core.hash_map("\ufdd0'line", 465)), "class2"), cljs.core.hash_map("\ufdd0'line", 465))), cljs.core.hash_map("\ufdd0'line", 465)))));
  }
});
domina.test.add_test.call(null, "can get a list of all css classes for a node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div class='class1 class2 class3'>1</div>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.Vector.fromArray(["class1", "class2", "class3"]), domina.classes.call(null, domina.xpath.xpath.call(null, "//div"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", new cljs.core.Vector(null, ["class1", "class2", "class3"]), cljs.core.with_meta(cljs.core.list("\ufdd1'classes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 470))), cljs.core.hash_map("\ufdd0'line", 470))), cljs.core.hash_map("\ufdd0'line", 470)))));
  }
});
domina.test.add_test.call(null, "can retrieve the text value of a node with normalization.", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<p>\n\n   Some text.  \n  </p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Some text.", domina.text.call(null, domina.xpath.xpath.call(null, "//p"))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Some text.", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 475))), cljs.core.hash_map("\ufdd0'line", 475))), cljs.core.hash_map("\ufdd0'line", 475)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Some text.", domina.text.call(null, domina.xpath.xpath.call(null, "//p"), true)))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Some text.", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 476)), true), cljs.core.hash_map("\ufdd0'line", 476))), cljs.core.hash_map("\ufdd0'line", 476)))));
  }
});
domina.test.add_test.call(null, "can set text on a single node", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<p></p>");
  domina.set_text_BANG_.call(null, domina.xpath.xpath.call(null, "//p"), "Hello world!");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Hello world!", domina.text.call(null, domina.xpath.xpath.call(null, "//p"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Hello world!", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 489))), cljs.core.hash_map("\ufdd0'line", 489))), cljs.core.hash_map("\ufdd0'line", 489)))));
  }
});
domina.test.add_test.call(null, "can set text on a multiple nodes", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<p></p><p></p>");
  domina.set_text_BANG_.call(null, domina.xpath.xpath.call(null, "//p"), "Hello world!");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Hello world!", domina.text.call(null, domina.xpath.xpath.call(null, "//p[1]"))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Hello world!", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p[1]"), cljs.core.hash_map("\ufdd0'line", 495))), cljs.core.hash_map("\ufdd0'line", 495))), cljs.core.hash_map("\ufdd0'line", 495)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Hello world!", domina.text.call(null, domina.xpath.xpath.call(null, "//p[2]"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Hello world!", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p[2]"), cljs.core.hash_map("\ufdd0'line", 496))), cljs.core.hash_map("\ufdd0'line", 496))), cljs.core.hash_map("\ufdd0'line", 496)))));
  }
});
domina.test.add_test.call(null, "can get a form field value", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<form><input type='text' name='test' value='Test Value'></input></form>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Test Value", domina.value.call(null, domina.xpath.xpath.call(null, "//input"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Test Value", cljs.core.with_meta(cljs.core.list("\ufdd1'value", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//input"), cljs.core.hash_map("\ufdd0'line", 501))), cljs.core.hash_map("\ufdd0'line", 501))), cljs.core.hash_map("\ufdd0'line", 501)))));
  }
});
domina.test.add_test.call(null, "can set a form field value", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<form><input type='text' name='test'></input></form>");
  domina.set_value_BANG_.call(null, domina.xpath.xpath.call(null, "//input"), "Test Value");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Test Value", domina.value.call(null, domina.xpath.xpath.call(null, "//input"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Test Value", cljs.core.with_meta(cljs.core.list("\ufdd1'value", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//input"), cljs.core.hash_map("\ufdd0'line", 507))), cljs.core.hash_map("\ufdd0'line", 507))), cljs.core.hash_map("\ufdd0'line", 507)))));
  }
});
domina.test.add_test.call(null, "can set multiple form field values", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<form><input type='text' name='test'></input><input type='text' name='test'></input></form>");
  domina.set_value_BANG_.call(null, domina.xpath.xpath.call(null, "//input"), "Test Value");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Test Value", domina.value.call(null, domina.xpath.xpath.call(null, "//input[1]"))))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Test Value", cljs.core.with_meta(cljs.core.list("\ufdd1'value", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//input[1]"), cljs.core.hash_map("\ufdd0'line", 513))), cljs.core.hash_map("\ufdd0'line", 513))), cljs.core.hash_map("\ufdd0'line", 513)))));
  }
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Test Value", domina.value.call(null, domina.xpath.xpath.call(null, "//input[2]"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Test Value", cljs.core.with_meta(cljs.core.list("\ufdd1'value", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//input[2]"), cljs.core.hash_map("\ufdd0'line", 514))), cljs.core.hash_map("\ufdd0'line", 514))), cljs.core.hash_map("\ufdd0'line", 514)))));
  }
});
domina.test.add_test.call(null, "can get a node's innerHTML", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div><p class='foobar'>some text</p></div>");
  if(cljs.core.truth_(function() {
    var or__3548__auto____7023 = cljs.core._EQ_.call(null, '<p class="foobar">some text</p>', domina.html.call(null, domina.xpath.xpath.call(null, "//div")));
    if(cljs.core.truth_(or__3548__auto____7023)) {
      return or__3548__auto____7023
    }else {
      return cljs.core._EQ_.call(null, "<P class=foobar>some text</P>", domina.html.call(null, domina.xpath.xpath.call(null, "//div")))
    }
  }())) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'or", cljs.core.with_meta(cljs.core.list("\ufdd1'=", '<p class="foobar">some text</p>', cljs.core.with_meta(cljs.core.list("\ufdd1'html", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 520))), cljs.core.hash_map("\ufdd0'line", 520))), cljs.core.hash_map("\ufdd0'line", 520)), cljs.core.with_meta(cljs.core.list("\ufdd1'=", 
    "<P class=foobar>some text</P>", cljs.core.with_meta(cljs.core.list("\ufdd1'html", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 521))), cljs.core.hash_map("\ufdd0'line", 521))), cljs.core.hash_map("\ufdd0'line", 521))), cljs.core.hash_map("\ufdd0'line", 520)))));
  }
});
domina.test.add_test.call(null, "can set a node's innerHTML", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div></div>");
  domina.set_html_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), "<p class='foobar'>some text</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//body/div/p[@class='foobar']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/div/p[@class='foobar']"), cljs.core.hash_map("\ufdd0'line", 527))), cljs.core.hash_map("\ufdd0'line", 527))), cljs.core.hash_map("\ufdd0'line", 527))), cljs.core.hash_map("\ufdd0'line", 527)))));
  }
});
domina.test.add_test.call(null, "can set multiple nodes' innerHTML", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div></div><div></div>");
  domina.set_html_BANG_.call(null, domina.xpath.xpath.call(null, "//div"), "<p class='foobar'>some text</p>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 2, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//body/div/p[@class='foobar']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 2, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/div/p[@class='foobar']"), cljs.core.hash_map("\ufdd0'line", 533))), cljs.core.hash_map("\ufdd0'line", 533))), cljs.core.hash_map("\ufdd0'line", 533))), cljs.core.hash_map("\ufdd0'line", 533)))));
  }
});
domina.test.add_test.call(null, "can set a table's innerHTML", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<table></table>");
  domina.set_html_BANG_.call(null, domina.xpath.xpath.call(null, "//table"), "<tr class='foobar'><th>some</th><td>text</td></tr>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 1, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//body/table/tr[@class='foobar']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 1, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/table/tr[@class='foobar']"), cljs.core.hash_map("\ufdd0'line", 539))), cljs.core.hash_map("\ufdd0'line", 539))), cljs.core.hash_map("\ufdd0'line", 539))), cljs.core.hash_map("\ufdd0'line", 539)))));
  }
});
domina.test.add_test.call(null, "can set multiple tables' innerHTML", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<table></table><table></table>");
  domina.set_html_BANG_.call(null, domina.xpath.xpath.call(null, "//table"), "<tr class='foobar'><th>some</th><td>text</td></tr>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 2, cljs.core.count.call(null, domina.nodes.call(null, domina.xpath.xpath.call(null, "//body/table/tr[@class='foobar']")))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", 2, cljs.core.with_meta(cljs.core.list("\ufdd1'count", cljs.core.with_meta(cljs.core.list("\ufdd1'nodes", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/table/tr[@class='foobar']"), cljs.core.hash_map("\ufdd0'line", 545))), cljs.core.hash_map("\ufdd0'line", 545))), cljs.core.hash_map("\ufdd0'line", 545))), cljs.core.hash_map("\ufdd0'line", 545)))));
  }
});
domina.test.add_test.call(null, "can get nodes from strings containing cell-level table fragments", function() {
  domina.test.reset.call(null);
  var n__7032 = domina.nodes.call(null, "<td>Cell</td><th>Header</th>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, n__7032), 2))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", cljs.core.with_meta(cljs.core.list("\ufdd1'count", "\ufdd1'n"), cljs.core.hash_map("\ufdd0'line", 550)), 2), cljs.core.hash_map("\ufdd0'line", 550)))));
  }
  var G__7033__7034 = cljs.core.seq.call(null, n__7032);
  if(cljs.core.truth_(G__7033__7034)) {
    var h__7035 = cljs.core.first.call(null, G__7033__7034);
    var G__7033__7036 = G__7033__7034;
    while(true) {
      if(cljs.core.truth_(cljs.core.re_find.call(null, /TableCell/, cljs.core.pr_str.call(null, h__7035)))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1're-find", /TableCell/, cljs.core.with_meta(cljs.core.list("\ufdd1'pr-str", "\ufdd1'h"), cljs.core.hash_map("\ufdd0'line", 552))), cljs.core.hash_map("\ufdd0'line", 552)))));
      }
      var temp__3698__auto____7060 = cljs.core.next.call(null, G__7033__7036);
      if(cljs.core.truth_(temp__3698__auto____7060)) {
        var G__7033__7061 = temp__3698__auto____7060;
        var G__7064 = cljs.core.first.call(null, G__7033__7061);
        var G__7065 = G__7033__7061;
        h__7035 = G__7064;
        G__7033__7036 = G__7065;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
});
domina.test.add_test.call(null, "can get nodes from strings containing row-level table fragments", function() {
  domina.test.reset.call(null);
  var n__7068 = domina.nodes.call(null, "<tr><td>Cell</td><th>Header</th></tr><tr><td>Another</td><th>Row</th></tr>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, n__7068), 2))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", cljs.core.with_meta(cljs.core.list("\ufdd1'count", "\ufdd1'n"), cljs.core.hash_map("\ufdd0'line", 557)), 2), cljs.core.hash_map("\ufdd0'line", 557)))));
  }
  var G__7069__7070 = cljs.core.seq.call(null, n__7068);
  if(cljs.core.truth_(G__7069__7070)) {
    var h__7071 = cljs.core.first.call(null, G__7069__7070);
    var G__7069__7072 = G__7069__7070;
    while(true) {
      if(cljs.core.truth_(cljs.core.re_find.call(null, /TableRow/, cljs.core.pr_str.call(null, h__7071)))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1're-find", /TableRow/, cljs.core.with_meta(cljs.core.list("\ufdd1'pr-str", "\ufdd1'h"), cljs.core.hash_map("\ufdd0'line", 559))), cljs.core.hash_map("\ufdd0'line", 559)))));
      }
      var temp__3698__auto____7074 = cljs.core.next.call(null, G__7069__7072);
      if(cljs.core.truth_(temp__3698__auto____7074)) {
        var G__7069__7076 = temp__3698__auto____7074;
        var G__7084 = cljs.core.first.call(null, G__7069__7076);
        var G__7085 = G__7069__7076;
        h__7071 = G__7084;
        G__7069__7072 = G__7085;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
});
domina.test.add_test.call(null, "can get nodes from strings containing section-level table fragments", function() {
  domina.test.reset.call(null);
  var n__7098 = domina.nodes.call(null, "<thead><tr><td>Cell</td><th>Header</th></tr></thead><tbody><tr><td>Another</td><th>Row</th></tr></tbody>");
  if(cljs.core.truth_(cljs.core._EQ_.call(null, cljs.core.count.call(null, n__7098), 2))) {
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", cljs.core.with_meta(cljs.core.list("\ufdd1'count", "\ufdd1'n"), cljs.core.hash_map("\ufdd0'line", 564)), 2), cljs.core.hash_map("\ufdd0'line", 564)))));
  }
  var G__7100__7101 = cljs.core.seq.call(null, n__7098);
  if(cljs.core.truth_(G__7100__7101)) {
    var h__7102 = cljs.core.first.call(null, G__7100__7101);
    var G__7100__7103 = G__7100__7101;
    while(true) {
      if(cljs.core.truth_(cljs.core.re_find.call(null, /TableSection/, cljs.core.pr_str.call(null, h__7102)))) {
      }else {
        throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1're-find", /TableSection/, cljs.core.with_meta(cljs.core.list("\ufdd1'pr-str", "\ufdd1'h"), cljs.core.hash_map("\ufdd0'line", 566))), cljs.core.hash_map("\ufdd0'line", 566)))));
      }
      var temp__3698__auto____7104 = cljs.core.next.call(null, G__7100__7103);
      if(cljs.core.truth_(temp__3698__auto____7104)) {
        var G__7100__7105 = temp__3698__auto____7104;
        var G__7106 = cljs.core.first.call(null, G__7100__7105);
        var G__7107 = G__7100__7105;
        h__7102 = G__7106;
        G__7100__7103 = G__7107;
        continue
      }else {
        return null
      }
      break
    }
  }else {
    return null
  }
});
domina.test.add_test.call(null, "can trigger a handler on a :mouseover event", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='ref'>Some content</div>");
  domina.events.listen_BANG_.call(null, domina.by_id.call(null, "ref"), "\ufdd0'mouseover", function() {
    return domina.append_BANG_.call(null, domina.by_id.call(null, "ref"), "<p>Hello world!</p>")
  });
  var target__7108 = domina.by_id.call(null, "ref");
  domina.events.fire_listeners_BANG_.call(null, target__7108, "\ufdd0'mouseover", false, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'target"], {"\ufdd0'type":"\ufdd0'mouseover", "\ufdd0'target":target__7108}));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Hello world!", domina.text.call(null, domina.xpath.xpath.call(null, "//p"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Hello world!", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 574))), cljs.core.hash_map("\ufdd0'line", 574))), cljs.core.hash_map("\ufdd0'line", 574)))));
  }
});
domina.test.add_test.call(null, "can trigger a handler on a :mouseout event", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='ref'>Some content</div>");
  domina.events.listen_BANG_.call(null, domina.by_id.call(null, "ref"), "\ufdd0'mouseout", function() {
    return domina.append_BANG_.call(null, domina.by_id.call(null, "ref"), "<p>Hello world!</p>")
  });
  var target__7111 = domina.by_id.call(null, "ref");
  domina.events.fire_listeners_BANG_.call(null, target__7111, "\ufdd0'mouseout", false, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'target"], {"\ufdd0'type":"\ufdd0'mouseout", "\ufdd0'target":target__7111}));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Hello world!", domina.text.call(null, domina.xpath.xpath.call(null, "//p"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Hello world!", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 582))), cljs.core.hash_map("\ufdd0'line", 582))), cljs.core.hash_map("\ufdd0'line", 582)))));
  }
});
domina.test.add_test.call(null, "can trigger a handler on a :click event", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='ref'>Some content</div>");
  domina.events.listen_BANG_.call(null, domina.by_id.call(null, "ref"), "\ufdd0'click", function() {
    return domina.append_BANG_.call(null, domina.by_id.call(null, "ref"), "<p>Hello world!</p>")
  });
  var target__7113 = domina.by_id.call(null, "ref");
  domina.events.fire_listeners_BANG_.call(null, target__7113, "\ufdd0'click", false, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'target"], {"\ufdd0'type":"\ufdd0'click", "\ufdd0'target":target__7113}));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Hello world!", domina.text.call(null, domina.xpath.xpath.call(null, "//p"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Hello world!", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 590))), cljs.core.hash_map("\ufdd0'line", 590))), cljs.core.hash_map("\ufdd0'line", 590)))));
  }
});
domina.test.add_test.call(null, "can trigger a handler on a :mouseenter event", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='parent'><div id='ref'></div></div>");
  domina.events.listen_BANG_.call(null, domina.by_id.call(null, "ref"), "\ufdd0'mouseenter", function() {
    return domina.append_BANG_.call(null, domina.by_id.call(null, "ref"), "<p>Hello world!</p>")
  });
  var rtarget__7116 = domina.by_id.call(null, "parent");
  var target__7117 = domina.by_id.call(null, "ref");
  domina.events.fire_listeners_BANG_.call(null, target__7117, "\ufdd0'mouseenter", false, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'related-target", "\ufdd0'target"], {"\ufdd0'type":"\ufdd0'mouseenter", "\ufdd0'related-target":rtarget__7116, "\ufdd0'target":target__7117}));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Hello world!", domina.text.call(null, domina.xpath.xpath.call(null, "//p"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Hello world!", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 600))), cljs.core.hash_map("\ufdd0'line", 600))), cljs.core.hash_map("\ufdd0'line", 600)))));
  }
});
domina.test.add_test.call(null, "can trigger a handler on a :mouseleave event", function() {
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='parent'><div id='ref'></div></div>");
  domina.events.listen_BANG_.call(null, domina.by_id.call(null, "ref"), "\ufdd0'mouseleave", function() {
    return domina.append_BANG_.call(null, domina.by_id.call(null, "ref"), "<p>Hello world!</p>")
  });
  var rtarget__7133 = domina.by_id.call(null, "parent");
  var target__7134 = domina.by_id.call(null, "ref");
  domina.events.fire_listeners_BANG_.call(null, target__7134, "\ufdd0'mouseleave", false, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'related-target", "\ufdd0'target"], {"\ufdd0'type":"\ufdd0'mouseleave", "\ufdd0'related-target":rtarget__7133, "\ufdd0'target":target__7134}));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Hello world!", domina.text.call(null, domina.xpath.xpath.call(null, "//p"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Hello world!", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//p"), cljs.core.hash_map("\ufdd0'line", 610))), cljs.core.hash_map("\ufdd0'line", 610))), cljs.core.hash_map("\ufdd0'line", 610)))));
  }
});
domina.test.add_test.call(null, "can remove-listeners on a :click event", function() {
  var handler__7141 = function() {
    return domina.append_BANG_.call(null, domina.by_id.call(null, "ref"), "<p>Hello world!</p>")
  };
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='ref'>Some content</div>");
  domina.events.listen_BANG_.call(null, domina.by_id.call(null, "ref"), "\ufdd0'click", handler__7141);
  domina.events.remove_listeners_BANG_.call(null, domina.by_id.call(null, "ref"), "\ufdd0'click");
  var target__7142 = domina.by_id.call(null, "ref");
  domina.events.fire_listeners_BANG_.call(null, target__7142, "\ufdd0'click", false, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'target"], {"\ufdd0'type":"\ufdd0'click", "\ufdd0'target":target__7142}));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Some content", domina.text.call(null, domina.xpath.xpath.call(null, "//div"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Some content", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 620))), cljs.core.hash_map("\ufdd0'line", 620))), cljs.core.hash_map("\ufdd0'line", 620)))));
  }
});
domina.test.add_test.call(null, "can remove-listeners on a :mouseenter event", function() {
  var handler__7145 = function() {
    return domina.append_BANG_.call(null, domina.by_id.call(null, "ref"), "<p>Hello world!</p>")
  };
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='parent'><div id='ref'>Some content</div></div>");
  domina.events.listen_BANG_.call(null, domina.by_id.call(null, "ref"), "\ufdd0'mouseenter", handler__7145);
  domina.events.remove_listeners_BANG_.call(null, domina.by_id.call(null, "ref"), "\ufdd0'mouseenter");
  var rtarget__7147 = domina.by_id.call(null, "parent");
  var target__7149 = domina.by_id.call(null, "ref");
  domina.events.fire_listeners_BANG_.call(null, target__7149, "\ufdd0'mouseenter", false, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'related-target", "\ufdd0'target"], {"\ufdd0'type":"\ufdd0'mouseenter", "\ufdd0'related-target":rtarget__7147, "\ufdd0'target":target__7149}));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Some content", domina.text.call(null, domina.xpath.xpath.call(null, "//div"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Some content", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 631))), cljs.core.hash_map("\ufdd0'line", 631))), cljs.core.hash_map("\ufdd0'line", 631)))));
  }
});
domina.test.add_test.call(null, "can unlisten! on a :click event", function() {
  var handler__7158 = function() {
    return domina.append_BANG_.call(null, domina.by_id.call(null, "ref"), "<p>Hello world!</p>")
  };
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='ref'>Some content</div>");
  domina.events.listen_BANG_.call(null, domina.by_id.call(null, "ref"), "\ufdd0'click", handler__7158);
  domina.events.unlisten_BANG_.call(null, domina.by_id.call(null, "ref"), "\ufdd0'click", handler__7158);
  var target__7159 = domina.by_id.call(null, "ref");
  domina.events.fire_listeners_BANG_.call(null, target__7159, "\ufdd0'click", false, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'target"], {"\ufdd0'type":"\ufdd0'click", "\ufdd0'target":target__7159}));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Some content", domina.text.call(null, domina.xpath.xpath.call(null, "//div"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Some content", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 641))), cljs.core.hash_map("\ufdd0'line", 641))), cljs.core.hash_map("\ufdd0'line", 641)))));
  }
});
domina.test.add_test.call(null, "can unlisten! on a :mouseenter event", function() {
  var handler__7160 = function() {
    return domina.append_BANG_.call(null, domina.by_id.call(null, "ref"), "<p>Hello world!</p>")
  };
  domina.test.reset.call(null);
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='parent'><div id='ref'>Some content</div></div>");
  domina.events.listen_BANG_.call(null, domina.by_id.call(null, "ref"), "\ufdd0'mouseenter", handler__7160);
  domina.events.unlisten_BANG_.call(null, domina.by_id.call(null, "ref"), "\ufdd0'mouseenter", handler__7160);
  var rtarget__7161 = domina.by_id.call(null, "parent");
  var target__7162 = domina.by_id.call(null, "ref");
  domina.events.fire_listeners_BANG_.call(null, target__7162, "\ufdd0'mouseenter", false, cljs.core.ObjMap.fromObject(["\ufdd0'type", "\ufdd0'related-target", "\ufdd0'target"], {"\ufdd0'type":"\ufdd0'mouseenter", "\ufdd0'related-target":rtarget__7161, "\ufdd0'target":target__7162}));
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "Some content", domina.text.call(null, domina.xpath.xpath.call(null, "//div"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "Some content", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 652))), cljs.core.hash_map("\ufdd0'line", 652))), cljs.core.hash_map("\ufdd0'line", 652)))));
  }
});
domina.test.add_test.call(null, "can append to a document fragment", function() {
  domina.test.reset.call(null);
  var frag__7173 = document.createDocumentFragment();
  domina.append_BANG_.call(null, frag__7173, "<div>testing</div>");
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), frag__7173);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, "testing", domina.text.call(null, domina.xpath.xpath.call(null, "//div"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "testing", cljs.core.with_meta(cljs.core.list("\ufdd1'text", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//div"), cljs.core.hash_map("\ufdd0'line", 660))), cljs.core.hash_map("\ufdd0'line", 660))), cljs.core.hash_map("\ufdd0'line", 660)))));
  }
});
domina.test.add_test.call(null, "doesn't clone unless necessary", function() {
  domina.test.reset.call(null);
  var child__7174 = domina.single_node.call(null, "<div>hello</div>");
  domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), child__7174);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, child__7174, domina.single_node.call(null, domina.xpath.xpath.call(null, "//body/div"))))) {
    return null
  }else {
    throw new Error(cljs.core.str.call(null, "Assert failed: ", cljs.core.pr_str.call(null, cljs.core.with_meta(cljs.core.list("\ufdd1'=", "\ufdd1'child", cljs.core.with_meta(cljs.core.list("\ufdd1'single-node", cljs.core.with_meta(cljs.core.list("\ufdd1'xpath", "//body/div"), cljs.core.hash_map("\ufdd0'line", 667))), cljs.core.hash_map("\ufdd0'line", 667))), cljs.core.hash_map("\ufdd0'line", 667)))));
  }
});
domina.test.report = function report(test_results) {
  domina.test.reset.call(null);
  var G__7180__7182 = cljs.core.seq.call(null, test_results);
  if(cljs.core.truth_(G__7180__7182)) {
    var G__7184__7186 = cljs.core.first.call(null, G__7180__7182);
    var vec__7185__7187 = G__7184__7186;
    var name__7188 = cljs.core.nth.call(null, vec__7185__7187, 0, null);
    var result__7189 = cljs.core.nth.call(null, vec__7185__7187, 1, null);
    var G__7180__7190 = G__7180__7182;
    var G__7184__7191 = G__7184__7186;
    var G__7180__7192 = G__7180__7190;
    while(true) {
      var vec__7193__7194 = G__7184__7191;
      var name__7195 = cljs.core.nth.call(null, vec__7193__7194, 0, null);
      var result__7196 = cljs.core.nth.call(null, vec__7193__7194, 1, null);
      var G__7180__7197 = G__7180__7192;
      var result_div__7198 = domina.single_node.call(null, "<div class='test-result'></div>");
      domina.set_text_BANG_.call(null, result_div__7198, name__7195);
      if(cljs.core.truth_(cljs.core.not.call(null, cljs.core._EQ_.call(null, result__7196, null)))) {
        domina.add_class_BANG_.call(null, result_div__7198, "failed");
        domina.append_BANG_.call(null, result_div__7198, cljs.core.str.call(null, "<div class='message'>", result__7196, "</div>"))
      }else {
        domina.add_class_BANG_.call(null, result_div__7198, "passed")
      }
      domina.append_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), result_div__7198);
      var temp__3698__auto____7199 = cljs.core.next.call(null, G__7180__7197);
      if(cljs.core.truth_(temp__3698__auto____7199)) {
        var G__7180__7200 = temp__3698__auto____7199;
        var G__7208 = cljs.core.first.call(null, G__7180__7200);
        var G__7209 = G__7180__7200;
        G__7184__7191 = G__7208;
        G__7180__7192 = G__7209;
        continue
      }else {
      }
      break
    }
  }else {
  }
  domina.prepend_BANG_.call(null, domina.xpath.xpath.call(null, "//body"), "<div id='test-summary'>ran <span id='total-tests'></span> tests with <span id='total-failures'></span> failures");
  domina.set_text_BANG_.call(null, domina.by_id.call(null, "total-tests"), cljs.core.count.call(null, test_results));
  var failure_count__7201 = cljs.core.count.call(null, cljs.core.filter.call(null, cljs.core.complement.call(null, cljs.core.nil_QMARK_), cljs.core.map.call(null, cljs.core.second, test_results)));
  domina.set_text_BANG_.call(null, domina.by_id.call(null, "total-failures"), failure_count__7201);
  if(cljs.core.truth_(cljs.core._EQ_.call(null, 0, failure_count__7201))) {
    return domina.add_class_BANG_.call(null, domina.by_id.call(null, "test-summary"), "passed")
  }else {
    return domina.add_class_BANG_.call(null, domina.by_id.call(null, "test-summary"), "failed")
  }
};
domina.test.test_results = cljs.core.doall.call(null, domina.test.run_tests.call(null));
domina.test.report.call(null, domina.test.test_results);
