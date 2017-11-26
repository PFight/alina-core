(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.alina = {})));
}(this, (function (exports) { 'use strict';

function makeTemplate(str) {
    let elem = document.createElement("template");
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
    let idlName = ATTRIBUTE_TO_IDL_MAP[attr.name] || attr.name;
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
    let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);
    if (descriptor.get || descriptor.set) {
        let originalGet = descriptor.get;
        let originalSet = descriptor.set;
        descriptor.get = function () {
            let value = originalGet.call(this);
            return definedNotNull(value) && value || empty;
        };
        descriptor.set = function (val) {
            originalSet.call(this, val);
        };
    }
    else {
        delete descriptor.value;
        delete descriptor.writable;
        let value = null;
        descriptor.get = function () {
            return definedNotNull(value) && value || empty;
        };
        descriptor.set = function (val) {
            value = val;
        };
    }
    Object.defineProperty(target, propertyKey, {});
}
function empty() {
}

class NodeContext {
    constructor(nodeOrBinding, parent) {
        this.extensions = {};
        this.children = [];
        this.disposeListeners = [];
        this.init(nodeOrBinding, parent);
    }
    get elem() {
        return this.getNode();
    }
    set elem(elem) {
        this.setNode(elem);
    }
    nodeAs() {
        return this.node;
    }
    get node() {
        return this.getNode();
    }
    set node(node) {
        this.setNode(node);
    }
    create(nodeOrBinding) {
        let inst = new NodeContext(nodeOrBinding, this);
        return inst;
    }
    get binding() {
        return this._binding;
    }
    get parent() {
        return this._parent;
    }
    getComponentContext(component, additionalKey, createContext) {
        let key = this.getComponentKey(additionalKey, component);
        let context = this.componentsContext[key];
        if (!context) {
            context = this.componentsContext[key] = createContext ? createContext() : {};
        }
        return context;
    }
    clearComponentContext(component, additionalKey) {
        let key = this.getComponentKey(additionalKey, component);
        delete this.componentsContext[key];
    }
    ext(extension) {
        let key = this.getComponentKey("", extension);
        let ext = this.extensions[key];
        if (!ext) {
            extension(this);
            this.extensions[key] = extension;
        }
        return this;
    }
    mount(componentCtor, services, key) {
        let context = this.getComponentContext(componentCtor, key, () => {
            let context = this.create(this.binding);
            let instance = new componentCtor(context, services);
            instance.init();
            return { instance: instance, context: context };
        });
        return context.instance;
    }
    call(component, props, key) {
        let context = this.getComponentContext(component, key, () => ({
            context: this.create(this.binding)
        }));
        return component(context.context, props);
    }
    unmount(component, key) {
        let context = this.getComponentContext(component, key);
        if (context.context) {
            context.context.dispose();
        }
        this.clearComponentContext(component, key);
    }
    unmountAll() {
        let children = [...this.children];
        for (let c of children) {
            c.dispose();
        }
        this.componentsContext = {};
    }
    addDisposeListener(callback) {
        this.disposeListeners.push(callback);
    }
    removeDisposeListener(callback) {
        let index = this.disposeListeners.indexOf(callback);
        if (index >= 0) {
            this.disposeListeners.splice(index, 1);
        }
    }
    dispose() {
        for (let listener of this.disposeListeners) {
            listener(this);
        }
        let children = [...this.children];
        for (let child of children) {
            child.dispose();
        }
        if (this.parent) {
            this.parent.children.splice(this.parent.children.indexOf(this), 1);
        }
    }
    getComponentKey(key, component) {
        let result = key || "";
        if (component["AlinaComponentName"]) {
            result += component["AlinaComponentName"];
        }
        else {
            let name = component["AlinaComponentName"] =
                (component["name"] || "") + COMPONENT_KEY_COUNTER.toString();
            COMPONENT_KEY_COUNTER++;
            result += name;
        }
        return result;
    }
    init(nodeOrBinding, parent) {
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
            for (let extKey in this.extensions) {
                this.extensions[extKey](this);
            }
            parent.children.push(this);
        }
    }
    getNode() {
        return this._binding.node;
    }
    setNode(node) {
        if (!this._binding) {
            this._binding = {};
        }
        let oldVal = this._binding.node;
        if (oldVal != node) {
            this._binding.node = node;
            this._binding.queryType = exports.QueryType.Node;
            if (this._parent && this._parent.node == oldVal) {
                this._parent.node = node;
            }
        }
    }
}
;
(function (QueryType) {
    QueryType[QueryType["Node"] = 1] = "Node";
    QueryType[QueryType["NodeAttribute"] = 2] = "NodeAttribute";
    QueryType[QueryType["NodeTextContent"] = 3] = "NodeTextContent";
})(exports.QueryType || (exports.QueryType = {}));
var COMPONENT_KEY_COUNTER = 1;

class Component {
    constructor(root) {
        this.root = root;
        root.addDisposeListener(() => this.onDispose());
    }
    set(props) {
        for (let key in props) {
            this[key] = props[key];
        }
        return this;
    }
    init() {
        this.onInit();
    }
    makeTemplate(str) {
        return makeTemplate(str);
    }
    onInit() {
    }
    onDispose() {
    }
}

class AlinaComponent extends Component {
}

let rootNode = typeof (document) === 'undefined' ? null : document;
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
