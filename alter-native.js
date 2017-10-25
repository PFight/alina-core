var QueryType;
(function (QueryType) {
    QueryType[QueryType["Node"] = 0] = "Node";
    QueryType[QueryType["NodeAttribute"] = 1] = "NodeAttribute";
    QueryType[QueryType["NodeTextContent"] = 2] = "NodeTextContent";
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
function compare(a, b, comparer) {
    return (undefinedOrNull(a) && undefinedOrNull(b)) ||
        (definedNotNull(a) && definedNotNull(b) && !comparer) ||
        (definedNotNull(a) && definedNotNull(b) && comparer && comparer(a, b));
}
var Renderer = /** @class */ (function () {
    function Renderer(nodeOrBindings) {
        if (Array.isArray(nodeOrBindings)) {
            this.bindings = nodeOrBindings;
        }
        else {
            this.bindings = [{
                    node: nodeOrBindings,
                    queryType: QueryType.Node
                }];
        }
        this.context = {};
    }
    Object.defineProperty(Renderer.prototype, "once", {
        get: function () {
            if (!this.onceFlag) {
                this.onceFlag = true;
                return true;
            }
            return false;
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
            return this.bindings[0].node;
        },
        set: function (node) {
            var binding = this.bindings[0];
            if (!binding) {
                binding = this.bindings[0] = {};
            }
            binding.node = node;
            binding.queryType = QueryType.Node;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Renderer.prototype, "nodes", {
        get: function () {
            return this.bindings.map(function (x) { return x.node; });
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
    Renderer.prototype.componentOnNode = function (selectorOrText, component) {
        var key = getComponentKey(selectorOrText, component);
        var context = this.context[key];
        if (!context) {
            context = this.context[key] = {};
            var result = void 0;
            try {
                result = this.querySelectorInternal(selectorOrText);
            }
            catch (_a) { }
            if (!result) {
                result = this.findNodeInternal(selectorOrText);
            }
            var renderer = new Renderer([{
                    node: result,
                    queryType: QueryType.Node,
                    query: selectorOrText
                }]);
            context.componentInstance = new component();
            context.componentInstance.initialize(renderer);
            // Component can replace current node
            if (result == this.node && renderer.node != result) {
                this.node = renderer.node;
            }
        }
        return context.componentInstance;
    };
    Renderer.prototype.webComponent = function (selector, component) {
        var key = getComponentKey(selector, component);
        var context = this.context[key];
        if (!context) {
            context = this.context[key] = {};
            var result = this.querySelectorInternal(selector);
            if (customElements.get(result.nodeName.toLowerCase()) == component) {
                context.componentInstance = result;
            }
            else {
                throw new Error("Component do not match element");
            }
        }
        return context.componentInstance;
    };
    Renderer.prototype.component = function (key, componentCtor) {
        var componentKey = getComponentKey(key, componentCtor);
        var context = this.getContext(componentKey);
        if (!context.instance) {
            context.instance = new componentCtor();
            context.instance.initialize(this);
        }
        return context.instance;
    };
    Renderer.prototype.findTextNode = function (text) {
        var context = this.context[text];
        if (!context) {
            context = this.context[text] = {};
            for (var i = 0; i < this.bindings.length && !context.result; i++) {
                var elem = findTextNode(text, this.bindings[i].node);
                if (elem) {
                    context.result = new Renderer(elem);
                }
            }
        }
        return context.result;
    };
    Renderer.prototype.querySelector = function (selector) {
        var context = this.context[selector];
        if (!context) {
            context = this.context[selector] = {
                result: new Renderer(this.querySelectorInternal(selector))
            };
        }
        return context.result;
    };
    Renderer.prototype.querySelectorAll = function (selector) {
        var context = this.context[selector];
        if (!context) {
            context = this.context[selector] = {
                result: new Renderer(this.querySelectorAllInternal(selector).map(function (x) { return ({
                    node: x,
                    queryType: QueryType.Node,
                    query: selector
                }); }))
            };
        }
        return context.result;
    };
    Renderer.prototype.findAll = function (stub) {
        var context = this.context[stub];
        if (!context) {
            context = this.context[stub] = {};
            var bindings_1 = [];
            this.nodes.forEach(function (x) { return fillBindings(x, stub, bindings_1); });
            context.renderer = new Renderer(bindings_1);
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
    Renderer.prototype.componentOn = function (stub, component) {
        var key = getComponentKey(stub, component);
        var context = this.context[key];
        if (!context) {
            context = this.context[key] = {};
            var bindings_2 = [];
            this.nodes.forEach(function (x) { return fillBindings(x, stub, bindings_2); });
            var renderer = new Renderer(bindings_2);
            context.componentInstance = new component();
            context.componentInstance.initialize(renderer);
        }
        return context.componentInstance;
    };
    Renderer.prototype.update = function (stub, value) {
        this.componentOn(stub, AltSet).update(value);
    };
    Renderer.prototype.repeat = function (templateSelector, items, update) {
        this.componentOnNode(templateSelector, AltRepeat).repeat(items, update);
    };
    Renderer.prototype.findNodeInternal = function (text) {
        var result;
        for (var i = 0; i < this.bindings.length && !result; i++) {
            result = findTextNode(text, this.bindings[i].node);
        }
        return result;
    };
    Renderer.prototype.querySelectorInternal = function (selector) {
        var result;
        for (var i = 0; i < this.bindings.length && !result; i++) {
            var node = this.bindings[i].node;
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
        for (var i = 0; i < this.bindings.length && !result; i++) {
            var node = this.bindings[i].node;
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
    return Renderer;
}());
function findTextNode(searchText, current) {
    if (current.nodeType == Node.TEXT_NODE || current.nodeType == Node.COMMENT_NODE) {
        if (current.textContent && current.textContent.indexOf(searchText) >= 0) {
            return current;
        }
    }
    for (var i = 0; i < current.childNodes.length; i++) {
        var result = findTextNode(searchText, current.childNodes[i]);
        if (result) {
            return result;
        }
    }
}
function fillBindings(node, query, bindings, queryType) {
    if (!queryType || queryType == QueryType.NodeTextContent) {
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
                    bindings.push({
                        node: stubNode,
                        queryType: QueryType.NodeTextContent,
                        query: query
                    });
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
    if ((!queryType || queryType == QueryType.NodeAttribute) && node.attributes) {
        for (var i = 0; i < node.attributes.length; i++) {
            var attr = node.attributes[i];
            if (attr.value && attr.value.indexOf(query) >= 0) {
                var idlName = ATTRIBUTE_TO_IDL_MAP[attr.name] || attr.name;
                if (!(idlName in node)) {
                    idlName = null;
                }
                bindings.push({
                    node: node,
                    query: query,
                    attributeName: attr.name,
                    idlName: idlName,
                    queryType: QueryType.NodeAttribute
                });
            }
        }
    }
    for (var i = 0; i < node.childNodes.length; i++) {
        var lengthBefore = node.childNodes.length;
        fillBindings(node.childNodes[i], query, bindings);
        var lengthAfter = node.childNodes.length;
        // Node can be replaced by several other nodes
        if (lengthAfter > lengthBefore) {
            i += lengthAfter - lengthBefore;
        }
    }
}
function getComponentKey(key, component) {
    var result = key || "";
    if (component.name) {
        result += component.name;
    }
    else {
        result += hashCode(component.toString());
    }
    return result;
}
function hashCode(str) {
    var hash = 0, i, chr;
    if (str.length === 0)
        return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
;
var ATTRIBUTE_TO_IDL_MAP = {
    "class": "className",
    "for": "htmlFor"
};
