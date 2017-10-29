(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.alina = {})));
}(this, (function (exports) { 'use strict';

var SingleNodeComponent = (function () {
    function SingleNodeComponent() {
    }
    SingleNodeComponent.prototype.initialize = function (context) {
        this.root = context;
    };
    return SingleNodeComponent;
}());
var MultiNodeComponent = (function () {
    function MultiNodeComponent() {
    }
    MultiNodeComponent.prototype.initialize = function (context) {
        this.root = context;
    };
    return MultiNodeComponent;
}());
;
(function (QueryType) {
    QueryType[QueryType["Node"] = 1] = "Node";
    QueryType[QueryType["NodeAttribute"] = 2] = "NodeAttribute";
    QueryType[QueryType["NodeTextContent"] = 3] = "NodeTextContent";
})(exports.QueryType || (exports.QueryType = {}));

function makeTemplate(str) {
    var elem = document.createElement("template");
    elem.innerHTML = str.trim();
    // document.body.appendChild(elem);
    return elem;
}
function fromTemplate(templateElem) {
    return templateElem.content ?
        (templateElem.content.firstElementChild || templateElem.content.firstChild).cloneNode(true)
        :
            (templateElem.firstElementChild || templateElem.firstChild).cloneNode(true);
}
function definedNotNull(x) {
    return x !== undefined && x !== null;
}
function undefinedOrNull(x) {
    return x === undefined || x === null;
}
function getIdlName(attr, node) {
    var idlName = ATTRIBUTE_TO_IDL_MAP[attr.name] || attr.name;
    if (!(idlName in node)) {
        idlName = null;
    }
    return idlName;
}
var ATTRIBUTE_TO_IDL_MAP = {
    "class": "className",
    "for": "htmlFor"
};

var __extends = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var undefinedOrNull$1 = undefinedOrNull;
var definedNotNull$1 = definedNotNull;
var AlRepeat = (function (_super) {
    __extends(AlRepeat, _super);
    function AlRepeat() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.itemContexts = [];
        return _this;
    }
    AlRepeat.prototype.repeat = function (items, update, options) {
        if (update) {
            this.context = {
                template: this.root.elem,
                container: this.root.elem.parentElement,
                insertBefore: this.root.elem,
                equals: options && options.equals,
                update: update
            };
        }
        this.repeatEx(items, this.context);
    };
    AlRepeat.prototype.repeatEx = function (items, context) {
        if (context) {
            this.context = context;
        }
        var props = this.context;
        // Add new and update existing
        for (var i = 0; i < items.length; i++) {
            var modelItem = items[i];
            // Createcontext
            var itemContext = this.itemContexts[i];
            if (!itemContext || !this.compare(modelItem, itemContext.oldModelItem, props.equals)) {
                itemContext = this.itemContexts[i] = {};
            }
            // Create node
            if (!itemContext.renderer) {
                var node = fromTemplate(props.template);
                itemContext.renderer = this.root.create(node);
            }
            // Fill content
            props.update(itemContext.renderer, modelItem);
            // Insert to parent
            if (!itemContext.mounted) {
                var position = i == 0 ? props.insertBefore : this.itemContexts[i - 1].renderer.node.nextSibling;
                if (position) {
                    props.container.insertBefore(itemContext.renderer.node, position);
                }
                else {
                    props.container.appendChild(itemContext.renderer.node);
                }
                itemContext.mounted = true;
            }
            itemContext.oldModelItem = modelItem;
        }
        // Remove old
        var firstIndexToRemove = items.length;
        for (var i = firstIndexToRemove; i < this.itemContexts.length; i++) {
            var elem = this.itemContexts[i].renderer.node;
            if (elem) {
                props.container.removeChild(elem);
            }
        }
        this.itemContexts.splice(firstIndexToRemove, this.itemContexts.length - firstIndexToRemove);
    };
    AlRepeat.prototype.compare = function (a, b, comparer) {
        return (undefinedOrNull$1(a) && undefinedOrNull$1(b)) ||
            (definedNotNull$1(a) && definedNotNull$1(b) && !comparer) ||
            (definedNotNull$1(a) && definedNotNull$1(b) && comparer && comparer(a, b));
    };
    return AlRepeat;
}(SingleNodeComponent));

var AlSet = (function () {
    function AlSet() {
    }
    AlSet.prototype.initialize = function (context) {
        this.root = context;
    };
    AlSet.prototype.set = function (value) {
        if (this.lastValue !== value) {
            var preparedValue = value;
            for (var _i = 0, _a = this.root.bindings; _i < _a.length; _i++) {
                var binding = _a[_i];
                // Initial value is stub text (query)
                var lastValue = this.lastValue !== undefined ? this.lastValue : binding.query;
                if (binding.queryType == exports.QueryType.NodeAttribute) {
                    // Class names should be separated with space         
                    if (binding.attributeName == "class") {
                        preparedValue = (!value) ? "" : value + " ";
                    }
                    // Some attributes has corresponding idl, some doesnt.
                    if (binding.idlName) {
                        var currentVal = binding.node[binding.idlName];
                        if (typeof (currentVal) == "string") {
                            binding.node[binding.idlName] = currentVal.replace(lastValue, preparedValue);
                        }
                        else {
                            binding.node[binding.idlName] = preparedValue;
                        }
                    }
                    else {
                        var elem = binding.node;
                        var currentVal = elem.getAttribute(binding.attributeName);
                        elem.setAttribute(binding.attributeName, currentVal.replace(lastValue, preparedValue));
                    }
                }
                else {
                    binding.node.textContent = binding.node.textContent.replace(lastValue, value);
                }
            }
            
            this.lastValue = preparedValue;
        }
    };
    AlSet.prototype.reset = function (value) {
        if (this.lastValue !== value) {
            for (var _i = 0, _a = this.root.bindings; _i < _a.length; _i++) {
                var binding = _a[_i];
                if (binding.queryType == exports.QueryType.NodeAttribute) {
                    if (binding.idlName) {
                        binding.node[binding.idlName] = value;
                    }
                    else {
                        var elem = binding.node;
                        elem.setAttribute(binding.attributeName, value);
                    }
                }
                else {
                    binding.node.textContent = value;
                }
            }
            this.lastValue = value;
        }
    };
    return AlSet;
}());

var AlShow = (function () {
    function AlShow() {
        this.nodes = [];
    }
    AlShow.prototype.initialize = function (context) {
        this.root = context;
    };
    AlShow.prototype.showIf = function (value) {
        if (this.lastValue !== value) {
            for (var i = 0; i < this.root.bindings.length; i++) {
                var templateElem = this.root.bindings[i].node;
                var node = this.nodes[i];
                if (value) {
                    if (!node) {
                        node = this.nodes[i] = fromTemplate(templateElem);
                    }
                    if (!node.parentElement) {
                        templateElem.parentElement.insertBefore(node, templateElem);
                    }
                }
                else {
                    if (node && node.parentElement) {
                        node.parentElement.removeChild(node);
                    }
                }
            }
            this.lastValue = value;
        }
    };
    return AlShow;
}());

var AlTemplate = (function () {
    function AlTemplate() {
    }
    AlTemplate.prototype.initialize = function (context) {
        this.root = context;
    };
    AlTemplate.prototype.appendChildren = function (template, render) {
        if (!this.result) {
            this.result = this.root.createMulti(this.instantiateTemplate(template));
            var ret = render(this.result);
            for (var _i = 0, _a = this.result.nodes; _i < _a.length; _i++) {
                var node = _a[_i];
                this.root.elem.appendChild(node);
            }
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    AlTemplate.prototype.appendChild = function (template, render) {
        if (!this.result) {
            this.result = this.root.create(this.instantiateTemplateOne(template));
            var ret = render(this.result);
            this.root.elem.appendChild(this.result.node);
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    AlTemplate.prototype.replaceChildren = function (template, render) {
        if (!this.result) {
            this.result = this.root.createMulti(this.instantiateTemplate(template));
            var ret = render(this.result);
            var rootElem = this.root.elem;
            rootElem.innerHTML = "";
            for (var _i = 0, _a = this.result.nodes; _i < _a.length; _i++) {
                var node = _a[_i];
                rootElem.appendChild(node);
            }
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    AlTemplate.prototype.replaceChild = function (template, render) {
        if (!this.result) {
            this.result = this.root.create(this.instantiateTemplateOne(template));
            var ret = render(this.result);
            this.root.elem.innerHTML = "";
            this.root.elem.appendChild(this.result.node);
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    AlTemplate.prototype.replace = function (template, render) {
        if (!this.result) {
            this.result = this.root.create(this.instantiateTemplateOne(template));
            var ret = render(this.result);
            var parent_1 = this.root.elem.parentElement;
            if (parent_1) {
                parent_1.replaceChild(this.result.elem, this.root.elem);
            }
            this.root.elem = this.result.elem;
            return ret;
        }
        else {
            return render(this.result);
        }
    };
    AlTemplate.prototype.instantiateTemplate = function (templateElem) {
        return templateElem.content ?
            [].map.apply(templateElem.content.children, function (node) { return node.cloneNode(true); })
            :
                [].map.apply(templateElem.children, function (node) { return node.cloneNode(true); });
    };
    AlTemplate.prototype.instantiateTemplateOne = function (templateElem) {
        return fromTemplate(templateElem);
    };
    return AlTemplate;
}());

var AlQuery = (function () {
    function AlQuery() {
    }
    AlQuery.prototype.initialize = function (context) {
        this.root = context;
    };
    AlQuery.prototype.query = function (selector) {
        var _this = this;
        var context = this.root.getContext(selector, function () { return ({
            result: _this.root.create(_this.querySelectorInternal(selector))
        }); });
        return context.result;
    };
    AlQuery.prototype.queryAll = function (selector) {
        var _this = this;
        var context = this.root.getContext(selector, function () { return ({
            result: _this.root.createMulti(_this.querySelectorAllInternal(selector).map(function (x) { return ({
                node: x,
                queryType: exports.QueryType.Node,
                query: selector
            }); }))
        }); });
        return context.result;
    };
    AlQuery.prototype.querySelectorInternal = function (selector) {
        var result;
        for (var i = 0; i < this.root.bindings.length && !result; i++) {
            var node = this.root.bindings[i].node;
            if (node.nodeType == Node.ELEMENT_NODE) {
                var elem = node;
                if (elem.matches(selector)) {
                    result = elem;
                }
                else {
                    result = elem.querySelector(selector);
                }
            }
        }
        return result;
    };
    AlQuery.prototype.querySelectorAllInternal = function (selector) {
        var result = [];
        for (var i = 0; i < this.root.bindings.length && !result; i++) {
            var node = this.root.bindings[i].node;
            if (node.nodeType == Node.ELEMENT_NODE) {
                var elem = node;
                if (elem.matches(selector)) {
                    result.push(elem);
                }
                result = result.concat(elem.querySelectorAll(selector));
            }
        }
        return result;
    };
    return AlQuery;
}());

var AlEntry = (function () {
    function AlEntry() {
    }
    AlEntry.prototype.initialize = function (context) {
        this.root = context;
    };
    AlEntry.prototype.getEntries = function (entry) {
        var _this = this;
        var context = this.root.getContext(entry, function () {
            var bindings = [];
            _this.root.bindings.forEach(function (x) { return _this.getEntiresInternal(x.node, entry, bindings, false); });
            return { renderer: _this.root.createMulti(bindings) };
        });
        return context.renderer;
    };
    AlEntry.prototype.getEntry = function (entry) {
        var _this = this;
        var context = this.root.getContext(entry, function () {
            var bindings = [];
            _this.root.bindings.forEach(function (x) { return _this.getEntiresInternal(x.node, entry, bindings, true); });
            return { renderer: _this.root.create(bindings[0]) };
        });
        return context.renderer;
    };
    AlEntry.prototype.getEntiresInternal = function (node, query, bindings, single, queryType) {
        if (queryType === undefined || queryType == exports.QueryType.NodeTextContent) {
            if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
                var parts = node.textContent.split(query);
                if (parts.length > 1) {
                    // Split content, to make stub separate node 
                    // and save this node to context.stubNodes
                    var nodeParent = node.parentNode;
                    for (var i = 0; i < parts.length - 1; i++) {
                        var part = parts[i];
                        if (part.length > 0) {
                            nodeParent.insertBefore(document.createTextNode(part), node);
                        }
                        var stubNode = document.createTextNode(query);
                        if (!single || bindings.length == 0) {
                            bindings.push({
                                node: stubNode,
                                queryType: exports.QueryType.NodeTextContent,
                                query: query
                            });
                        }
                        nodeParent.insertBefore(stubNode, node);
                    }
                    var lastPart = parts[parts.length - 1];
                    if (lastPart && lastPart.length > 0) {
                        nodeParent.insertBefore(document.createTextNode(lastPart), node);
                    }
                    nodeParent.removeChild(node);
                }
            }
        }
        if ((queryType === undefined || queryType == exports.QueryType.NodeAttribute) && node.attributes) {
            for (var i = 0; i < node.attributes.length && (!single || bindings.length == 0); i++) {
                var attr = node.attributes[i];
                if (attr.value && attr.value.indexOf(query) >= 0) {
                    bindings.push({
                        node: node,
                        query: query,
                        attributeName: attr.name,
                        idlName: getIdlName(attr, node),
                        queryType: exports.QueryType.NodeAttribute
                    });
                }
            }
        }
        for (var i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
            var lengthBefore = node.childNodes.length;
            this.getEntiresInternal(node.childNodes[i], query, bindings, single, queryType);
            var lengthAfter = node.childNodes.length;
            // Node can be replaced by several other nodes
            if (lengthAfter > lengthBefore) {
                i += lengthAfter - lengthBefore;
            }
        }
    };
    return AlEntry;
}());

var AlFind = (function () {
    function AlFind() {
    }
    AlFind.prototype.initialize = function (context) {
        this.root = context;
    };
    AlFind.prototype.findNode = function (entry) {
        var _this = this;
        var context = this.root.getContext(entry, function () {
            var bindings = [];
            _this.root.bindings.forEach(function (x) { return _this.findNodesInternal(x.node, entry, bindings, true); });
            return { renderer: _this.root.create(bindings[0]) };
        });
        return context.renderer;
    };
    AlFind.prototype.findNodes = function (entry) {
        var _this = this;
        var context = this.root.getContext(entry, function () {
            var bindings = [];
            _this.root.bindings.forEach(function (x) { return _this.findNodesInternal(x.node, entry, bindings, false); });
            return { renderer: _this.root.createMulti(bindings) };
        });
        return context.renderer;
    };
    AlFind.prototype.findNodesInternal = function (node, query, bindings, single) {
        var found = false;
        if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
            if (node.textContent.indexOf(query) >= 0) {
                bindings.push({
                    node: node,
                    query: query,
                    queryType: exports.QueryType.Node
                });
                found = true;
            }
        }
        if (!found && node.attributes) {
            for (var i = 0; i < node.attributes.length && !found; i++) {
                var attr = node.attributes[i];
                if (attr.name.indexOf(query) >= 0 || attr.value.indexOf(query) >= 0) {
                    bindings.push({
                        node: node,
                        query: query,
                        attributeName: attr.name,
                        idlName: getIdlName(attr, node),
                        queryType: exports.QueryType.Node
                    });
                }
            }
        }
        for (var i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
            this.findNodesInternal(node.childNodes[i], query, bindings, single);
        }
    };
    return AlFind;
}());

var Slot = (function () {
    function Slot(component) {
        this.component = component;
    }
    Slot.prototype.set = function (val) {
        this.value = val;
        return this.component;
    };
    return Slot;
}());

var Renderer = (function () {
    function Renderer(nodesOrBindings, parent) {
        this.init(nodesOrBindings, parent);
    }
    Renderer.prototype.getSetComponent = function () {
        return AlSet;
    };
    Renderer.prototype.getRepeatComponent = function () {
        return AlRepeat;
    };
    Renderer.prototype.getTemplateComponent = function () {
        return AlTemplate;
    };
    Renderer.prototype.getQueryComponent = function () {
        return AlQuery;
    };
    Renderer.prototype.getFindComponent = function () {
        return AlFind;
    };
    Renderer.prototype.getEntryComponent = function () {
        return AlEntry;
    };
    Renderer.prototype.getShowComponent = function () {
        return AlShow;
    };
    Renderer.Create = function (nodeOrBinding) {
        return Renderer.Main.create(nodeOrBinding);
    };
    Renderer.CreateMulti = function (nodesOrBindings) {
        return Renderer.Main.createMulti(nodesOrBindings);
    };
    Object.defineProperty(Renderer.prototype, "nodes", {
        get: function () {
            return this._bindings.map(function (x) { return x.node; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Renderer.prototype, "bindings", {
        get: function () {
            return this._bindings;
        },
        set: function (bindings) {
            this._bindings = bindings;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Renderer.prototype, "elem", {
        get: function () {
            return this.node;
        },
        set: function (elem) {
            this.node = elem;
        },
        enumerable: true,
        configurable: true
    });
    Renderer.prototype.nodeAs = function () {
        return this.node;
    };
    Object.defineProperty(Renderer.prototype, "node", {
        get: function () {
            return this.getNode();
        },
        set: function (node) {
            this.setNode(node);
        },
        enumerable: true,
        configurable: true
    });
    Renderer.prototype.create = function (nodeOrBinding) {
        return new Renderer([nodeOrBinding], this);
    };
    Renderer.prototype.createMulti = function (nodesOrBindings) {
        return new Renderer(nodesOrBindings, this);
    };
    Object.defineProperty(Renderer.prototype, "binding", {
        get: function () {
            return this._bindings[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Renderer.prototype, "parent", {
        get: function () {
            return this.parentRenderer;
        },
        enumerable: true,
        configurable: true
    });
    Renderer.prototype.getContext = function (key, createContext) {
        var context = this.context[key];
        if (!context) {
            context = this.context[key] = createContext ? createContext() : {};
        }
        return context;
    };
    Renderer.prototype.on = function (value, callback, key) {
        var lastValue = key ? this.context[key] : this.onLastValue;
        if (this.onLastValue !== value) {
            var result = callback(this, value, this.onLastValue);
            var lastValue_1 = result !== undefined ? result : value;
            if (key) {
                this.context[key] = lastValue_1;
            }
            else {
                this.onLastValue = lastValue_1;
            }
        }
    };
    Renderer.prototype.once = function (callback) {
        if (!this.onceFlag) {
            this.onceFlag = true;
            callback(this);
        }
    };
    Renderer.prototype.ext = function (createExtension) {
        var key = this.getComponentKey("", createExtension);
        var context = this.getContext(key);
        if (!context.extension) {
            context.extension = createExtension(this);
        }
        return context.extension;
    };
    Renderer.prototype.mount = function (componentCtor, key) {
        var _this = this;
        var componentKey = this.getComponentKey(key, componentCtor);
        var context = this.getContext(componentKey, function () {
            var instance = new componentCtor();
            instance.initialize(_this);
            return { instance: instance };
        });
        return context.instance;
    };
    Renderer.prototype.call = function (component, props, key) {
        var _this = this;
        var componentKey = this.getComponentKey(key, component);
        var context = this.getContext(componentKey, function () { return ({
            renderer: _this.createMulti(_this.bindings)
        }); });
        return component(context.renderer, props);
    };
    Renderer.prototype.query = function (selector) {
        return this.mount(this.getQueryComponent()).query(selector);
    };
    Renderer.prototype.queryAll = function (selector) {
        return this.mount(this.getQueryComponent()).queryAll(selector);
    };
    Renderer.prototype.getEntries = function (entry) {
        return this.mount(this.getEntryComponent()).getEntries(entry);
    };
    Renderer.prototype.getEntry = function (entry) {
        return this.mount(this.getEntryComponent()).getEntry(entry);
    };
    Renderer.prototype.findNode = function (entry) {
        return this.mount(this.getFindComponent()).findNode(entry);
    };
    Renderer.prototype.findNodes = function (entry) {
        return this.mount(this.getFindComponent()).findNodes(entry);
    };
    Renderer.prototype.set = function (stub, value) {
        this.getEntry(stub).mount(this.getSetComponent()).set(value);
    };
    Renderer.prototype.repeat = function (templateSelector, items, update) {
        this.query(templateSelector).mount(this.getRepeatComponent()).repeat(items, update);
    };
    Renderer.prototype.showIf = function (templateSelector, value) {
        this.query(templateSelector).mount(this.getShowComponent()).showIf(value);
    };
    Renderer.prototype.tpl = function (key) {
        return this.mount(this.getTemplateComponent(), key);
    };
    Renderer.prototype.init = function (nodesOrBindings, parent) {
        if (nodesOrBindings.length > 0) {
            var first = nodesOrBindings[0];
            if (first.nodeType !== undefined) {
                this._bindings = nodesOrBindings.map(function (x) { return ({
                    node: x,
                    queryType: exports.QueryType.Node
                }); });
            }
            else {
                this._bindings = nodesOrBindings;
            }
        }
        else {
            this._bindings = [];
        }
        this.context = {};
        this.parentRenderer = parent;
    };
    Renderer.prototype.getNode = function () {
        return this._bindings.length > 0 && this._bindings[0].node || null;
    };
    Renderer.prototype.setNode = function (node) {
        var binding = this._bindings[0];
        if (!binding) {
            binding = this._bindings[0] = {};
        }
        var oldVal = binding.node;
        if (oldVal != node) {
            binding.node = node;
            binding.queryType = exports.QueryType.Node;
            if (this.parentRenderer && this.parentRenderer.node == oldVal) {
                this.parentRenderer.node = node;
            }
        }
    };
    Renderer.prototype.getComponentKey = function (key, component) {
        var result = key || "";
        if (component["AlinaComponentName"]) {
            result += component["AlinaComponentName"];
        }
        else {
            var name_1 = component["AlinaComponentName"] =
                (component["name"] || "") + COMPONENT_KEY_COUNTER.toString();
            COMPONENT_KEY_COUNTER++;
            result += name_1;
        }
        return result;
    };
    Renderer.Main = new Renderer([document.body], null);
    return Renderer;
}());
var COMPONENT_KEY_COUNTER = 1;

exports.SingleNodeComponent = SingleNodeComponent;
exports.MultiNodeComponent = MultiNodeComponent;
exports.makeTemplate = makeTemplate;
exports.fromTemplate = fromTemplate;
exports.definedNotNull = definedNotNull;
exports.undefinedOrNull = undefinedOrNull;
exports.getIdlName = getIdlName;
exports.ATTRIBUTE_TO_IDL_MAP = ATTRIBUTE_TO_IDL_MAP;
exports.AlRepeat = AlRepeat;
exports.AlSet = AlSet;
exports.AlShow = AlShow;
exports.AlTemplate = AlTemplate;
exports.AlQuery = AlQuery;
exports.AlEntry = AlEntry;
exports.AlFind = AlFind;
exports.Slot = Slot;
exports.Renderer = Renderer;

Object.defineProperty(exports, '__esModule', { value: true });

})));
