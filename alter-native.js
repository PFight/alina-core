function makeTemplate(str) {
    var elem = document.createElement("template");
    elem.innerHTML = str;
    // document.body.appendChild(elem);
    return elem;
}
function instantiateTemplate(templateElem) {
    return templateElem.content ?
        (templateElem.content.firstElementChild || templateElem.content.firstChild).cloneNode(true)
        :
            (templateElem.firstElementChild || templateElem.firstChild).cloneNode(true);
}
function replaceFromTempalte(elemToReplace, templateElem) {
    var elem = instantiateTemplate(templateElem);
    var parent = elemToReplace.parentElement;
    parent.replaceChild(elem, elemToReplace);
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
    function Renderer(elem) {
        this.elem = elem;
        this.context = {};
    }
    Renderer.prototype.repeat = function (templateSelector, modelItems, updateFunc, equals) {
        var template = this.elem.querySelector(templateSelector);
        var container = template.parentElement;
        return this.repeatEx(templateSelector, template, container, null, modelItems, updateFunc, equals);
    };
    Renderer.prototype.repeatEx = function (key, template, container, insertBefore, modelItems, updateFunc, equals) {
        var context = this.context[key];
        if (!context) {
            context = this.context[key] = {};
            context.itemContexts = [];
        }
        // Add new and update existing
        for (var i = 0; i < modelItems.length; i++) {
            var modelItem = modelItems[i];
            // Createcontext
            var itemContext = context.itemContexts[i];
            if (!itemContext || !compare(modelItem, itemContext.oldModelItem, equals)) {
                itemContext = context.itemContexts[i] = {};
            }
            // Create node
            if (!itemContext.node) {
                itemContext.node = instantiateTemplate(template);
                itemContext.renderer = new Renderer(itemContext.node);
            }
            // Insert to parent
            if (!itemContext.mounted) {
                var position = i == 0 ? insertBefore : context.itemContexts[i - 1].node.nextSibling;
                if (position) {
                    container.insertBefore(itemContext.node, position);
                }
                else {
                    container.appendChild(itemContext.node);
                }
                itemContext.mounted = true;
            }
            // Fill content
            updateFunc(itemContext.renderer, modelItem);
            itemContext.oldModelItem = modelItem;
        }
        // Remove old
        var firstIndexToRemove = modelItems.length;
        for (var i = firstIndexToRemove; i < context.itemContexts.length; i++) {
            var elem = context.itemContexts[i].node;
            if (elem) {
                container.removeChild(elem);
            }
        }
        context.itemContexts.splice(firstIndexToRemove, context.itemContexts.length - firstIndexToRemove);
        return this;
    };
    Renderer.prototype.set = function (stub, value) {
        var context = this.context[stub];
        if (!context) {
            context = this.context[stub] = {};
        }
        if (context.setters === undefined) {
            context.setters = [];
            fillSetters(this.elem, stub, context.setters);
            context.lastValue = stub;
        }
        if (context.lastValue != value) {
            var newLastValue_1 = value;
            context.setters.forEach(function (setter) {
                var result = setter(context.lastValue, value);
                if (result !== undefined) {
                    newLastValue_1 = result;
                }
            });
            context.lastValue = newLastValue_1;
        }
        return this;
    };
    Renderer.prototype.send = function (props) {
        var c = new PropsContainer();
        c.props = props;
        c.renderer = this;
        return c;
    };
    Renderer.prototype.mount = function (selector, component, props) {
        var context = this.context[selector];
        if (!context) {
            context = this.context[selector] = {};
            var elem = void 0;
            try {
                elem = this.elem.matches(selector) ? this.elem : this.elem.querySelector(selector);
            }
            catch (_a) { }
            if (!elem) {
                elem = findTextNode(selector, this.elem);
            }
            context.componentInstance = new component();
            context.componentInstance.initialize(elem, props);
        }
        context.componentInstance.update(props);
    };
    return Renderer;
}());
var PropsContainer = /** @class */ (function () {
    function PropsContainer() {
    }
    PropsContainer.prototype.into = function (selector, component) {
        return this.renderer.mount(selector, component, this.props);
    };
    return PropsContainer;
}());
function createIdlSetter(idlName) {
    return function (oldVal, newVal) {
        var currentVal = this[idlName];
        if (typeof (currentVal) == "string") {
            this[idlName] = currentVal.replace(oldVal, newVal);
        }
        else {
            this[idlName] = newVal;
        }
    };
}
var CUSTOM_ATTRIBUTE_SETTERS = {
    "class": function (oldVal, newVal) {
        var preparedValue = (!newVal) ? "" : newVal + " ";
        this.className = this.className.replace(oldVal, preparedValue);
        return preparedValue;
    },
    "for": createIdlSetter("htmlFor")
};
function fillSetters(node, stub, setters) {
    if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
        var parts = node.textContent.split(stub);
        if (parts.length > 1) {
            // Split content, to make stub separate node 
            // and save this node to context.stubNodes
            var nodeParent = node.parentNode;
            nodeParent.removeChild(node);
            var _loop_1 = function (i) {
                var part = parts[i];
                if (part.length > 0) {
                    nodeParent.appendChild(document.createTextNode(part));
                }
                var stubNode = document.createTextNode("");
                setters.push(function (oldVal, newVal) { return stubNode.textContent = newVal; });
                nodeParent.appendChild(stubNode);
            };
            for (var i = 0; i < parts.length - 1; i++) {
                _loop_1(i);
            }
            var lastPart = parts[parts.length - 1];
            if (lastPart) {
                nodeParent.appendChild(document.createTextNode(lastPart));
            }
        }
    }
    if (node.attributes) {
        var _loop_2 = function (i) {
            var attr = node.attributes[i];
            if (attr.value && attr.value.indexOf(stub) >= 0) {
                var setter = CUSTOM_ATTRIBUTE_SETTERS[attr.name];
                if (!setter) {
                    if (attr.name in node) {
                        setter = createIdlSetter(attr.name);
                    }
                    else {
                        setter = function (oldVal, newVal) { return attr.value = attr.value.replace(oldVal, newVal); };
                    }
                }
                setters.push(setter.bind(node));
            }
        };
        for (var i = 0; i < node.attributes.length; i++) {
            _loop_2(i);
        }
    }
    for (var i = 0; i < node.childNodes.length; i++) {
        fillSetters(node.childNodes[i], stub, setters);
    }
}
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
