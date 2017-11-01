(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.alina = {})));
}(this, (function (exports) { 'use strict';

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

var __assign = (window && window.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var NodeContext = /** @class */ (function () {
    function NodeContext(nodeOrBinding, parent) {
        this.extensions = {};
        this.children = [];
        this.disposeListeners = [];
        this.init(nodeOrBinding, parent);
    }
    Object.defineProperty(NodeContext.prototype, "elem", {
        get: function () {
            return this.getNode();
        },
        set: function (elem) {
            this.setNode(elem);
        },
        enumerable: true,
        configurable: true
    });
    NodeContext.prototype.nodeAs = function () {
        return this.node;
    };
    Object.defineProperty(NodeContext.prototype, "node", {
        get: function () {
            return this.getNode();
        },
        set: function (node) {
            this.setNode(node);
        },
        enumerable: true,
        configurable: true
    });
    NodeContext.prototype.create = function (nodeOrBinding) {
        var inst = new NodeContext(nodeOrBinding, this);
        return inst;
    };
    Object.defineProperty(NodeContext.prototype, "binding", {
        get: function () {
            return this._binding;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NodeContext.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    NodeContext.prototype.getComponentContext = function (component, additionalKey, createContext) {
        var key = this.getComponentKey(additionalKey, component);
        var context = this.componentsContext[key];
        if (!context) {
            context = this.componentsContext[key] = createContext ? createContext() : {};
        }
        return context;
    };
    NodeContext.prototype.clearComponentContext = function (component, additionalKey) {
        var key = this.getComponentKey(additionalKey, component);
        delete this.componentsContext[key];
    };
    NodeContext.prototype.ext = function (extension) {
        var key = this.getComponentKey("", extension);
        var ext = this.extensions[key];
        if (!ext) {
            extension(this);
            this.extensions[key] = extension;
        }
        return this;
    };
    NodeContext.prototype.mount = function (componentCtor, services, key) {
        var _this = this;
        var context = this.getComponentContext(componentCtor, key, function () {
            var context = _this.create(_this.binding);
            var instance = new componentCtor(context, services);
            instance.init();
            return { instance: instance, context: context };
        });
        return context.instance;
    };
    NodeContext.prototype.call = function (component, props, key) {
        var _this = this;
        var context = this.getComponentContext(component, key, function () { return ({
            context: _this.create(_this.binding)
        }); });
        return component(context.context, props);
    };
    NodeContext.prototype.unmount = function (component, key) {
        var context = this.getComponentContext(component, key);
        if (context.context) {
            context.context.dispose();
        }
        this.clearComponentContext(component, key);
    };
    NodeContext.prototype.unmountAll = function () {
        var children = this.children.slice();
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var c = children_1[_i];
            c.dispose();
        }
        this.componentsContext = {};
    };
    NodeContext.prototype.addDisposeListener = function (callback) {
        this.disposeListeners.push(callback);
    };
    NodeContext.prototype.removeDisposeListener = function (callback) {
        var index = this.disposeListeners.indexOf(callback);
        if (index >= 0) {
            this.disposeListeners.splice(index, 1);
        }
    };
    NodeContext.prototype.dispose = function () {
        for (var _i = 0, _a = this.disposeListeners; _i < _a.length; _i++) {
            var listener = _a[_i];
            listener(this);
        }
        var children = this.children.slice();
        for (var _b = 0, children_2 = children; _b < children_2.length; _b++) {
            var child = children_2[_b];
            child.dispose();
        }
        if (this.parent) {
            this.parent.children.splice(this.parent.children.indexOf(this), 1);
        }
    };
    NodeContext.prototype.getComponentKey = function (key, component) {
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
    NodeContext.prototype.init = function (nodeOrBinding, parent) {
        if (nodeOrBinding.nodeType !== undefined) {
            this._binding = {
                node: nodeOrBinding,
                queryType: exports.QueryType.Node
            };
        }
        else {
            this._binding = __assign({}, nodeOrBinding);
        }
        this.componentsContext = {};
        this._parent = parent;
        if (parent) {
            this.extensions = __assign({}, parent.extensions);
            for (var extKey in this.extensions) {
                this.extensions[extKey](this);
            }
            parent.children.push(this);
        }
    };
    NodeContext.prototype.getNode = function () {
        return this._binding.node;
    };
    NodeContext.prototype.setNode = function (node) {
        if (!this._binding) {
            this._binding = {};
        }
        var oldVal = this._binding.node;
        if (oldVal != node) {
            this._binding.node = node;
            this._binding.queryType = exports.QueryType.Node;
            if (this._parent && this._parent.node == oldVal) {
                this._parent.node = node;
            }
        }
    };
    return NodeContext;
}());
;
(function (QueryType) {
    QueryType[QueryType["Node"] = 1] = "Node";
    QueryType[QueryType["NodeAttribute"] = 2] = "NodeAttribute";
    QueryType[QueryType["NodeTextContent"] = 3] = "NodeTextContent";
})(exports.QueryType || (exports.QueryType = {}));
var COMPONENT_KEY_COUNTER = 1;

var Component = /** @class */ (function () {
    function Component(root) {
        var _this = this;
        this.root = root;
        root.addDisposeListener(function () { return _this.onDispose(); });
    }
    Component.prototype.init = function () {
        this.onInit();
    };
    Component.prototype.onInit = function () {
    };
    Component.prototype.onDispose = function () {
    };
    return Component;
}());

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
var AlinaComponent = /** @class */ (function (_super) {
    __extends(AlinaComponent, _super);
    function AlinaComponent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AlinaComponent;
}(Component));

var Document = new NodeContext(document, null).ext(StandardExt);

var __extends$1 = (window && window.__extends) || (function () {
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
var AlRepeat = /** @class */ (function (_super) {
    __extends$1(AlRepeat, _super);
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
            if (!itemContext.nodeContext) {
                var node = fromTemplate(props.template);
                itemContext.nodeContext = this.root.create(node);
            }
            // Fill content
            props.update(itemContext.nodeContext, modelItem);
            // Insert to parent
            if (!itemContext.mounted) {
                var position = i == 0 ? props.insertBefore : this.itemContexts[i - 1].nodeContext.node.nextSibling;
                if (position) {
                    props.container.insertBefore(itemContext.nodeContext.node, position);
                }
                else {
                    props.container.appendChild(itemContext.nodeContext.node);
                }
                itemContext.mounted = true;
            }
            itemContext.oldModelItem = modelItem;
        }
        // Remove old
        var firstIndexToRemove = items.length;
        for (var i = firstIndexToRemove; i < this.itemContexts.length; i++) {
            var context_1 = this.itemContexts[i];
            context_1.nodeContext.dispose();
            var elem = context_1.nodeContext.node;
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
}(AlinaComponent));

var __extends$2 = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlSet = /** @class */ (function (_super) {
    __extends$2(AlSet, _super);
    function AlSet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlSet.prototype.set = function (value) {
        if (this.lastValue !== value) {
            var preparedValue = value;
            var binding = this.root.binding;
            // Initial value is stub text (query)
            var lastValue = this.lastValue !== undefined ? this.lastValue : binding.query;
            if (binding.queryType == exports.QueryType.NodeAttribute) {
                // Class names should be separated with space         
                if (binding.attributeName == "class") {
                    preparedValue = (!value) ? "" : value + " ";
                }
                // Some attributes has corresponding idl, some doesn't.
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
            this.lastValue = preparedValue;
        }
    };
    return AlSet;
}(AlinaComponent));

var __extends$3 = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlShow = /** @class */ (function (_super) {
    __extends$3(AlShow, _super);
    function AlShow() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlShow.prototype.showIf = function (value, render) {
        if (this.lastValue !== value) {
            var templateElem = this.root.nodeAs();
            if (value) {
                // Value changed and now is true - show node
                this.node = fromTemplate(templateElem);
                if (render) {
                    this.nodeContext = this.root.create(this.node);
                    render(this.nodeContext);
                }
                templateElem.parentElement.insertBefore(this.node, templateElem);
            }
            else {
                // Value changed and now is false - remove node
                if (this.nodeContext) {
                    this.nodeContext.dispose();
                    this.nodeContext = null;
                }
                if (this.node && this.node.parentElement) {
                    this.node.parentElement.removeChild(this.node);
                }
            }
            this.lastValue = value;
        }
        else {
            // Render on every call, even if value not changed
            if (value && render && this.nodeContext) {
                render(this.nodeContext);
            }
        }
    };
    return AlShow;
}(AlinaComponent));

var __extends$4 = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlTemplate = /** @class */ (function (_super) {
    __extends$4(AlTemplate, _super);
    function AlTemplate() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlTemplate.prototype.addChild = function (template, render) {
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
    AlTemplate.prototype.setChild = function (template, render) {
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
    //protected instantiateTemplate(templateElem: HTMLTemplateElement): Node[] {
    //  return templateElem.content ?
    //    [].map.call(templateElem.content.children, (node) => node.cloneNode(true))
    //    :
    //    [].map.call(templateElem.children, (node) => node.cloneNode(true))
    //}
    AlTemplate.prototype.instantiateTemplateOne = function (templateElem) {
        return fromTemplate(templateElem);
    };
    return AlTemplate;
}(AlinaComponent));

var __extends$5 = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlQuery = /** @class */ (function (_super) {
    __extends$5(AlQuery, _super);
    function AlQuery() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlQuery.prototype.query = function (selector) {
        var _this = this;
        var context = this.root.getComponentContext(AlQuery, selector, function () { return ({
            result: _this.root.create(_this.querySelectorInternal(selector))
        }); });
        return context.result;
    };
    AlQuery.prototype.queryAll = function (selector, render) {
        var _this = this;
        var context = this.root.getComponentContext(AlQuery, selector, function () { return ({
            contexts: _this.querySelectorAllInternal(selector).map(function (x) { return _this.root.create({
                node: x,
                queryType: exports.QueryType.Node,
                query: selector
            }); })
        }); });
        for (var _i = 0, _a = context.contexts; _i < _a.length; _i++) {
            var c = _a[_i];
            render(c);
        }
    };
    AlQuery.prototype.querySelectorInternal = function (selector) {
        var result;
        if (this.root.node.nodeType == Node.ELEMENT_NODE || this.root.node.nodeType == Node.DOCUMENT_NODE) {
            var elem = this.root.node;
            if (elem.matches && elem.matches(selector)) {
                result = elem;
            }
            else {
                result = elem.querySelector(selector);
            }
        }
        return result;
    };
    AlQuery.prototype.querySelectorAllInternal = function (selector) {
        var result = [];
        var node = this.root.node;
        if (node.nodeType == Node.ELEMENT_NODE || node.nodeType == Node.DOCUMENT_NODE) {
            var elem = node;
            if (elem.matches && elem.matches(selector)) {
                result.push(elem);
            }
            result = result.concat(elem.querySelectorAll(selector));
        }
        return result;
    };
    return AlQuery;
}(AlinaComponent));

var __extends$6 = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlEntry = /** @class */ (function (_super) {
    __extends$6(AlEntry, _super);
    function AlEntry() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlEntry.prototype.getEntries = function (entry, render) {
        var _this = this;
        var context = this.root.getComponentContext(AlEntry, entry, function () {
            var bindings = [];
            _this.getEntiresInternal(_this.root.node, entry, bindings, false);
            return { contexts: bindings.map(function (x) { return _this.root.create(x); }) };
        });
        for (var _i = 0, _a = context.contexts; _i < _a.length; _i++) {
            var c = _a[_i];
            render(c);
        }
    };
    AlEntry.prototype.getEntry = function (entry) {
        var _this = this;
        var context = this.root.getComponentContext(AlEntry, entry, function () {
            var bindings = [];
            _this.getEntiresInternal(_this.root.node, entry, bindings, true);
            return { nodeContext: _this.root.create(bindings[0]) };
        });
        return context.nodeContext;
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
}(AlinaComponent));

var __extends$7 = (window && window.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var AlFind = /** @class */ (function (_super) {
    __extends$7(AlFind, _super);
    function AlFind() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AlFind.prototype.findNode = function (entry) {
        var _this = this;
        var context = this.root.getComponentContext(AlFind, entry, function () {
            var bindings = [];
            _this.findNodesInternal(_this.root.node, entry, bindings, true);
            return { nodeContext: _this.root.create(bindings[0]) };
        });
        return context.nodeContext;
    };
    AlFind.prototype.findNodes = function (entry, render) {
        var _this = this;
        var context = this.root.getComponentContext(AlFind, entry, function () {
            var bindings = [];
            _this.findNodesInternal(_this.root.node, entry, bindings, false);
            return { contexts: bindings.map(function (x) { return _this.root.create(x); }) };
        });
        for (var _i = 0, _a = context.contexts; _i < _a.length; _i++) {
            var c = _a[_i];
            render(c);
        }
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
}(AlinaComponent));

var Slot = /** @class */ (function () {
    function Slot(component) {
        this.component = component;
    }
    Slot.prototype.set = function (val) {
        this.value = val;
        return this.component;
    };
    return Slot;
}());

function StandardExt(renderer) {
    var result = renderer;
    result.query = query;
    result.queryAll = queryAll;
    result.getEntry = getEntry;
    result.getEntries = getEntries;
    result.findNode = findNode;
    result.findNodes = findNodes;
    result.set = set;
    result.showIf = showIf;
    result.tpl = tpl;
    result.repeat = repeat;
    result.on = on;
    result.once = once;
    return result;
}
function on(value, callback, key) {
    var context = this.getComponentContext(on, key);
    if (context.lastValue !== value) {
        var result = callback(this, value, context.lastValue);
        context.lastValue = result !== undefined ? result : value;
    }
}
function once(callback) {
    var context = this.getComponentContext(once, "", function () { return ({ first: true }); });
    if (context.first) {
        callback(this);
        context.first = false;
    }
}
function query(selector) {
    return this.mount(AlQuery).query(selector);
}
function queryAll(selector, render) {
    this.mount(AlQuery).queryAll(selector, render);
}
function getEntries(entry, render) {
    return this.mount(AlEntry).getEntries(entry, render);
}
function getEntry(entry) {
    return this.mount(AlEntry).getEntry(entry);
}
function findNode(entry) {
    return this.mount(AlFind).findNode(entry);
}
function findNodes(entry, render) {
    return this.mount(AlFind).findNodes(entry, render);
}
function set(stub, value) {
    this.mount(AlEntry).getEntries(stub, function (context) {
        context.mount(AlSet).set(value);
    });
}
function repeat(templateSelector, items, update) {
    this.mount(AlQuery).query(templateSelector)
        .mount(AlRepeat).repeat(items, update);
}
function showIf(templateSelector, value, render) {
    this.mount(AlQuery).query(templateSelector)
        .mount(AlShow).showIf(value, render);
}
function tpl(key) {
    return this.mount(AlTemplate, key);
}

exports.makeTemplate = makeTemplate;
exports.fromTemplate = fromTemplate;
exports.definedNotNull = definedNotNull;
exports.undefinedOrNull = undefinedOrNull;
exports.getIdlName = getIdlName;
exports.ATTRIBUTE_TO_IDL_MAP = ATTRIBUTE_TO_IDL_MAP;
exports.NodeContext = NodeContext;
exports.Component = Component;
exports.AlinaComponent = AlinaComponent;
exports.Document = Document;
exports.AlRepeat = AlRepeat;
exports.AlSet = AlSet;
exports.AlShow = AlShow;
exports.AlTemplate = AlTemplate;
exports.AlQuery = AlQuery;
exports.AlEntry = AlEntry;
exports.AlFind = AlFind;
exports.Slot = Slot;
exports.StandardExt = StandardExt;

Object.defineProperty(exports, '__esModule', { value: true });

})));
