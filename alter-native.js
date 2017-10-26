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
var Renderer = /** @class */ (function () {
    function Renderer(nodeOrBindings, parent) {
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
    Renderer.Create = function (nodeOrBindings) {
        return Renderer.Main.create(nodeOrBindings);
    };
    Renderer.CreateMulti = function (nodeOrBindings) {
        return Renderer.Main.createMulti(nodeOrBindings);
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
    Renderer.prototype.create = function (nodeOrBindings) {
        return new Renderer(nodeOrBindings, this);
    };
    Renderer.prototype.createMulti = function (nodeOrBindings) {
        return new Renderer(nodeOrBindings, this);
    };
    Object.defineProperty(Renderer.prototype, "binding", {
        get: function () {
            return this._bindings[0];
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
    Renderer.prototype.mount = function (componentCtor, key) {
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
    Renderer.prototype.query = function (selector) {
        var context = this.context[selector];
        if (!context) {
            context = this.context[selector] = {
                result: this.create(this.querySelectorInternal(selector))
            };
        }
        return context.result;
    };
    Renderer.prototype.queryAll = function (selector) {
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
    Renderer.prototype.getEntries = function (entry) {
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
    Renderer.prototype.getEntry = function (entry) {
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
    Renderer.prototype.findNode = function (entry) {
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
    Renderer.prototype.findNodes = function (entry) {
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
    Renderer.prototype.set = function (stub, value) {
        this.getEntries(stub).mount(AltSet).set(value);
    };
    Renderer.prototype.repeat = function (templateSelector, items, update) {
        this.query(templateSelector).mount(AltRepeat).repeat(items, update);
    };
    Renderer.prototype.showIf = function (templateSelector, value) {
        this.query(templateSelector).mount(AltShow).showIf(value);
    };
    Renderer.prototype.querySelectorInternal = function (selector) {
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
    Renderer.prototype.querySelectorAllInternal = function (selector) {
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
    Renderer.prototype.fillBindings = function (node, query, bindings, single, queryType) {
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
    Renderer.prototype.findNodesInternal = function (node, query, bindings, single) {
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
    Renderer.prototype.getIdlName = function (attr, node) {
        var idlName = ATTRIBUTE_TO_IDL_MAP[attr.name] || attr.name;
        if (!(idlName in node)) {
            idlName = null;
        }
        return idlName;
    };
    Renderer.prototype.getComponentKey = function (key, component) {
        var result = key || "";
        if (component.name) {
            result += component.name;
        }
        else {
            result += this.hashCode(component.toString());
        }
        return result;
    };
    Renderer.prototype.hashCode = function (str) {
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
    Renderer.Main = new Renderer(document.body, null);
    return Renderer;
}());
var ATTRIBUTE_TO_IDL_MAP = {
    "class": "className",
    "for": "htmlFor"
};
