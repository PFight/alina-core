function template(str) {
    let elem = document.createElement("div");
    elem.innerHTML = str;
    document.body.appendChild(elem);
    return elem.firstElementChild;
}

function instantiateTemplate(templateElem) {
    return templateElem.content ? templateElem.content.querySelector("*").cloneNode(true) : templateElem.firstElementChild.cloneNode(true);
}

function replaceFromTempalte(elemToReplace, templateElem) {
     let elem = instantiateTemplate(templateElem);
     let parent = elemToReplace.parentElement;
     parent.replaceChild(elem, elemToReplace);
     return elem;
}

function createChildFromTemplate(templateElem, parentElem, renderer) {
    let elem = instantiateTemplate(templateElem);
    let rr = renderer && renderer(elem);
    if (typeof(rr) == "function") {
        rr();
    } else if (rr && rr.length) {
        rr.forEach(x =>x());
    }
    if (parentElem) {
        parentElem.appendChild(elem);
    }
    return elem;
}

function compare(a, b, comparer) {
    if (!a && b) return false;
    if (a && !b) return false;
    if (!a && !b) return true;
    if (a && b && !comparer) return true;
    if (a && b && comparer && comparer(a,b)) return true;
    return false;
}

class Renderer {
    constructor(elem) {
        this.elem = elem;
        this.context = {};
    }    

    repeat(templateSelector, modelItems, updateFunc, equals) {
        let context = this.context[templateSelector];
        if (!context) {
            context = this.context[templateSelector] = {};
        }
        let elem = this.elem;
        
        if (!context.templateElem) {
            context.templateElem = elem.querySelector(templateSelector);        
            context.oldModelItems = [];
            context.elemContexts = [];
            context.containerElem = context.templateElem.parentElement;
        }

        // Add new and update existing
        for (let i = 0; i< modelItems.length; i++) {
            let modelItem = modelItems[i];
            if (!compare(modelItem, context.oldModelItems[i], equals)) {
                context.oldModelItems[i] = modelItem;
                let elem = createChildFromTemplate(context.templateElem, context.containerElem);
                context.elemContexts[i] = new Renderer(elem);
            }
            updateFunc(context.elemContexts[i], modelItem);
        }
        // Remove old
        let firstIndexToRemove = modelItems.length;
        for (let i = firstIndexToRemove; i< context.oldModelItems.length; i++) {
            let elem = context.elemContexts[i].elem;
            if (elem) {
                context.containerElem.remove(elem);
            }
        }        
        context.oldModelItems.splice(firstIndexToRemove, context.oldModelItems.length - firstIndexToRemove);
        context.elemContexts.splice(firstIndexToRemove, context.elemContexts.length - firstIndexToRemove);
        
        context.oldModelItems = modelItems;
        
        return this;
    }

    set(stub, value) {  
        let context = this.context[stub];
        if (!context) {
            context = this.context[stub] = {};
        }
    
        if (context.setters === undefined) {
            context.setters = [];
            fillSetters(this.elem, stub, context.setters);
            context.lastValue = stub;
        } else {        
            if (context.lastValue != value) {        
                let newLastValue = value;
                context.setters.forEach(setter => {
                    let result = setter(context.lastValue, value);
                    if (result !== undefined) {
                        newLastValue = result;
                    }                    
                });
                context.lastValue = newLastValue;
            }
        }
        
        return this;
    }
    
    mount(selector, component, props) {
        let context = this.context[selector];
        if (!context) {
            context = this.context[selector] = {};
            let elem = this.elem.matches(selector) ? this.elem : this.elem.querySelector(selector);
            context.componentInstance = new component(elem, props);
        }
        context.componentInstance.update(props)
    }
}

function createIdlSetter(idlName) {
    return function (oldVal, newVal) {
        let currentVal = this[idlName];
        if (typeof(currentVal) == "string") {
            this[idlName] = currentVal.replace(oldVal, newVal); 
        } else {
            this[idlName] = newVal;
        }
    }        
}

var CUSTOM_ATTRIBUTE_SETTERS = {
    "class": function (oldVal,newVal) {
        let preparedValue = (!newVal) ?  "" :  newVal + " ";
        this.className = this.className.replace(oldVal, preparedValue);
        return preparedValue;
    },
    "for": createIdlSetter("htmlFor")
    
};

function fillSetters(node, stub, setters) {
    if (node.nodeType == 3) {
        let parts = node.textContent.split(stub);
        if (parts.length > 1) {
            // Split content, to make stub separate node 
            // and save this node to context.stubNodes
            let nodeParent = node.parentNode;
            nodeParent.removeChild(node);
            for (let i = 0; i < parts.length-1; i++) {
                let part = parts[i];
                if (part.length > 0) {
                    nodeParent.appendChild(document.createTextNode(part));
                }
                let stubNode = document.createTextNode("");
                setters.push((oldVal, newVal) =>  stubNode.textContent = newVal);
                nodeParent.appendChild(stubNode);
            }
            let lastPart = parts[parts.length-1];
            if (lastPart) {
                nodeParent.appendChild(document.createTextNode(lastPart));
            }
        }
    }
    if (node.attributes) {
        for (let i = 0; i < node.attributes.length; i++) {
            let attr = node.attributes[i];
            if (attr.value && attr.value.indexOf(stub) >= 0) {
                let setter = CUSTOM_ATTRIBUTE_SETTERS[attr.name];
                if (!setter) {
                    if (attr.name in node) {
                        setter = createIdlSetter(attr.name);
                    } else {
                        setter = (oldVal, newVal) => attr.value = attr.value.replace(oldVal, newVal);
                    }
                }
                setters.push(setter.bind(node));
            }
        }
    }
    
    for (let i = 0; i < node.childNodes.length; i++) {
        fillSetters(node.childNodes[i], stub, setters);
    }
}


function renderer(rootElem, renderFunc) {
    let context = new Renderer(rootElem);
    return  (props) => {
        renderFunc(context, props);
    };
}