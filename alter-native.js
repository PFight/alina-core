var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var QueryType;
(function (QueryType) {
    QueryType[QueryType["Node"] = 1] = "Node";
    QueryType[QueryType["NodeAttribute"] = 2] = "NodeAttribute";
    QueryType[QueryType["NodeTextContent"] = 3] = "NodeTextContent";
})(QueryType || (QueryType = {}));
function makeTemplate(str) {
    var elem = document.createElement("template");
    elem.innerHTML = str;
    // document.body.appendChild(elem);
    return elem;
}
function fromTemplate(templateElem) {
    return templateElem.content ?
        (templateElem.content.firstElementChild || templateElem.content.firstChild).cloneNode(true)
        :
            (templateElem.firstElementChild || templateElem.firstChild).cloneNode(true);
}
function replaceFromTempalte(elemToReplace, templateElem) {
    var elem = fromTemplate(templateElem);
    var parent = elemToReplace.parentElement;
    if (parent) {
        parent.replaceChild(elem, elemToReplace);
    }
    return elem;
}
function definedNotNull(x) {
    return x !== undefined && x !== null;
}
function undefinedOrNull(x) {
    return x === undefined || x === null;
}
var MultiRenderer = /** @class */ (function () {
    function MultiRenderer(nodeOrBindings, parent) {
        if (Array.isArray(nodeOrBindings)) {
            this._bindings = nodeOrBindings;
        }
        else {
            this._bindings = [{
                    node: nodeOrBindings,
                    queryType: QueryType.Node
                }];
        }
        this.context = {};
        this.parentRenderer = parent;
    }
    MultiRenderer.Create = function (nodeOrBindings) {
        return Renderer.Main.create(nodeOrBindings);
    };
    MultiRenderer.CreateMulti = function (nodeOrBindings) {
        return Renderer.Main.createMulti(nodeOrBindings);
    };
    Object.defineProperty(MultiRenderer.prototype, "nodes", {
        get: function () {
            return this._bindings.map(function (x) { return x.node; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MultiRenderer.prototype, "bindings", {
        get: function () {
            return this._bindings;
        },
        enumerable: true,
        configurable: true
    });
    MultiRenderer.prototype.create = function (nodeOrBindings) {
        return new Renderer(nodeOrBindings, this);
    };
    MultiRenderer.prototype.createMulti = function (nodeOrBindings) {
        return new MultiRenderer(nodeOrBindings, this);
    };
    Object.defineProperty(MultiRenderer.prototype, "binding", {
        get: function () {
            return this._bindings[0];
        },
        enumerable: true,
        configurable: true
    });
    MultiRenderer.prototype.getContext = function (key, createContext) {
        var context = this.context[key];
        if (!context) {
            context = this.context[key] = createContext ? createContext() : {};
        }
        return context;
    };
    MultiRenderer.prototype.mount = function (componentCtor, key) {
        var componentKey = this.getComponentKey(key, componentCtor);
        var context = this.getContext(componentKey);
        if (!context.instance) {
            var sameAsParent = this.parentRenderer && this.parentRenderer.node == this.node;
            context.instance = new componentCtor();
            context.instance.initializeMulti(this);
            // Component can replace current node
            if (sameAsParent && this.parentRenderer.node != this.node) {
                this.parentRenderer.node = this.node;
            }
        }
        return context.instance;
    };
    MultiRenderer.prototype.query = function (selector) {
        var context = this.context[selector];
        if (!context) {
            context = this.context[selector] = {
                result: this.create(this.querySelectorInternal(selector))
            };
        }
        return context.result;
    };
    MultiRenderer.prototype.queryAll = function (selector) {
        var context = this.context[selector];
        if (!context) {
            context = this.context[selector] = {
                result: this.createMulti(this.querySelectorAllInternal(selector).map(function (x) { return ({
                    node: x,
                    queryType: QueryType.Node,
                    query: selector
                }); }))
            };
        }
        return context.result;
    };
    MultiRenderer.prototype.getEntries = function (entry) {
        var _this = this;
        var context = this.context[entry];
        if (!context) {
            context = this.context[entry] = {};
            var bindings_1 = [];
            this._bindings.forEach(function (x) { return _this.fillBindings(x.node, entry, bindings_1, false); });
            context.renderer = this.createMulti(bindings_1);
        }
        return context.renderer;
    };
    MultiRenderer.prototype.getEntry = function (entry) {
        var _this = this;
        var context = this.context[entry];
        if (!context) {
            context = this.context[entry] = {};
            var bindings_2 = [];
            this._bindings.forEach(function (x) { return _this.fillBindings(x.node, entry, bindings_2, true); });
            context.renderer = this.create(bindings_2);
        }
        return context.renderer;
    };
    MultiRenderer.prototype.findNode = function (entry) {
        var _this = this;
        var context = this.context[entry];
        if (!context) {
            context = this.context[entry] = {};
            var bindings_3 = [];
            this._bindings.forEach(function (x) { return _this.findNodesInternal(x.node, entry, bindings_3, true); });
            context.renderer = this.create(bindings_3);
        }
        return context.renderer;
    };
    MultiRenderer.prototype.findNodes = function (entry) {
        var _this = this;
        var context = this.context[entry];
        if (!context) {
            context = this.context[entry] = {};
            var bindings_4 = [];
            this._bindings.forEach(function (x) { return _this.findNodesInternal(x.node, entry, bindings_4, false); });
            context.renderer = this.createMulti(bindings_4);
        }
        return context.renderer;
    };
    MultiRenderer.prototype.on = function (value, callback, key) {
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
    MultiRenderer.prototype.once = function (callback) {
        if (!this.onceFlag) {
            this.onceFlag = true;
            callback(this);
        }
    };
    MultiRenderer.prototype.set = function (stub, value) {
        this.getEntries(stub).mount(AltSet).set(value);
    };
    MultiRenderer.prototype.repeat = function (templateSelector, items, update) {
        this.query(templateSelector).mount(AltRepeat).repeat(items, update);
    };
    MultiRenderer.prototype.showIf = function (templateSelector, value) {
        this.query(templateSelector).mount(AltShow).showIf(value);
    };
    MultiRenderer.prototype.querySelectorInternal = function (selector) {
        var result;
        for (var i = 0; i < this._bindings.length && !result; i++) {
            var node = this._bindings[i].node;
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
    MultiRenderer.prototype.querySelectorAllInternal = function (selector) {
        var result = [];
        for (var i = 0; i < this._bindings.length && !result; i++) {
            var node = this._bindings[i].node;
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
    MultiRenderer.prototype.fillBindings = function (node, query, bindings, single, queryType) {
        if (queryType === undefined || queryType == QueryType.NodeTextContent) {
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
                                queryType: QueryType.NodeTextContent,
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
        if ((queryType === undefined || queryType == QueryType.NodeAttribute) && node.attributes) {
            for (var i = 0; i < node.attributes.length && (!single || bindings.length == 0); i++) {
                var attr = node.attributes[i];
                if (attr.value && attr.value.indexOf(query) >= 0) {
                    bindings.push({
                        node: node,
                        query: query,
                        attributeName: attr.name,
                        idlName: this.getIdlName(attr, node),
                        queryType: QueryType.NodeAttribute
                    });
                }
            }
        }
        for (var i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
            var lengthBefore = node.childNodes.length;
            this.fillBindings(node.childNodes[i], query, bindings, single, queryType);
            var lengthAfter = node.childNodes.length;
            // Node can be replaced by several other nodes
            if (lengthAfter > lengthBefore) {
                i += lengthAfter - lengthBefore;
            }
        }
    };
    MultiRenderer.prototype.findNodesInternal = function (node, query, bindings, single) {
        var found = false;
        if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
            if (node.textContent.indexOf(query) >= 0) {
                bindings.push({
                    node: node,
                    query: query,
                    queryType: QueryType.Node
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
                        idlName: this.getIdlName(attr, node),
                        queryType: QueryType.Node
                    });
                }
            }
        }
        for (var i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
            this.findNodesInternal(node.childNodes[i], query, bindings, single);
        }
    };
    MultiRenderer.prototype.getIdlName = function (attr, node) {
        var idlName = ATTRIBUTE_TO_IDL_MAP[attr.name] || attr.name;
        if (!(idlName in node)) {
            idlName = null;
        }
        return idlName;
    };
    MultiRenderer.prototype.getComponentKey = function (key, component) {
        var result = key || "";
        if (component.name) {
            result += component.name;
        }
        else {
            result += this.hashCode(component.toString());
        }
        return result;
    };
    MultiRenderer.prototype.hashCode = function (str) {
        var hash = 0, i, chr;
        if (str.length === 0)
            return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };
    ;
    MultiRenderer.Main = new MultiRenderer(document.body, null);
    return MultiRenderer;
}());
var Renderer = /** @class */ (function (_super) {
    __extends(Renderer, _super);
    function Renderer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
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
            return this._bindings[0].node;
        },
        set: function (node) {
            var binding = this._bindings[0];
            if (!binding) {
                binding = this._bindings[0] = {};
            }
            binding.node = node;
            binding.queryType = QueryType.Node;
        },
        enumerable: true,
        configurable: true
    });
    Renderer.prototype.mount = function (componentCtor, key) {
        return _super.prototype.mount.call(this, componentCtor, key);
    };
    Renderer.prototype.on = function (value, callback, key) {
        return _super.prototype.on.call(this, value, callback, key);
    };
    Renderer.prototype.once = function (callback) {
        return _super.prototype.once.call(this, callback);
    };
    return Renderer;
}(MultiRenderer));
var ATTRIBUTE_TO_IDL_MAP = {
    "class": "className",
    "for": "htmlFor"
};
