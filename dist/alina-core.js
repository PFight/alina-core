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
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.alina = {})));
}(this, (function (exports) {
    'use strict';
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
    function defaultEmptyFunc(target, propertyKey) {
        if (target[propertyKey] === undefined) {
            target[propertyKey] = null;
        }
        var descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
        if (descriptor.get || descriptor.set) {
            var originalGet_1 = descriptor.get;
            var originalSet_1 = descriptor.set;
            descriptor.get = function () {
                var value = originalGet_1.call(this);
                return definedNotNull(value) && value || empty;
            };
            descriptor.set = function (val) {
                originalSet_1.call(this, val);
            };
        }
        else {
            delete descriptor.value;
            delete descriptor.writable;
            var value_1 = null;
            descriptor.get = function () {
                return definedNotNull(value_1) && value_1 || empty;
            };
            descriptor.set = function (val) {
                value_1 = val;
            };
        }
        Object.defineProperty(target, propertyKey, {});
    }
    function empty() {
    }
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
                this._binding = Object.assign({}, nodeOrBinding);
            }
            this.componentsContext = {};
            this._parent = parent;
            if (parent) {
                this.extensions = Object.assign({}, parent.extensions);
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
        Component.prototype.set = function (props) {
            for (var key in props) {
                this[key] = props[key];
            }
            return this;
        };
        Component.prototype.init = function () {
            this.onInit();
        };
        Component.prototype.makeTemplate = function (str) {
            return makeTemplate(str);
        };
        Component.prototype.onInit = function () {
        };
        Component.prototype.onDispose = function () {
        };
        return Component;
    }());
    var AlinaComponent = /** @class */ (function (_super) {
        __extends(AlinaComponent, _super);
        function AlinaComponent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return AlinaComponent;
    }(Component));
    var rootNode = typeof (document) === 'undefined' ? null : document;
    var Document = rootNode && new NodeContext(rootNode, null);
    exports.makeTemplate = makeTemplate;
    exports.fromTemplate = fromTemplate;
    exports.definedNotNull = definedNotNull;
    exports.undefinedOrNull = undefinedOrNull;
    exports.getIdlName = getIdlName;
    exports.ATTRIBUTE_TO_IDL_MAP = ATTRIBUTE_TO_IDL_MAP;
    exports.defaultEmptyFunc = defaultEmptyFunc;
    exports.NodeContext = NodeContext;
    exports.Component = Component;
    exports.AlinaComponent = AlinaComponent;
    exports.Document = Document;
    Object.defineProperty(exports, '__esModule', { value: true });
})));
