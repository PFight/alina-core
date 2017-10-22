function template(str) {
    let elem = document.createElement("div");
    elem.innerHTML = str;
    document.body.appendChild(elem);
    return elem.firstElementChild;
}

function instantiateTemplate(templateElem) {
    return templateElem.content ? templateElem.content.querySelector("*").cloneNode(true) : templateElem.firstElementChild.cloneNode(true);
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
    }
    
    next() {
        if (!this.nextInstance) {
            this.nextInstance = new Renderer(this.elem);
        }
        return this.nextInstance;
    }

    repeatTemplate(templateSelector, modelItems, updateFunc, equals) {
        let context = this;
        let elem = context.elem;
        
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
        
        return this.next();
    }

    setContent(stub, value) {    
        let context = this;
        if (context.stubNodes === undefined) {
            let nodes = [];
            let check = (node) => node.nodeType== 3 && node.textContent.indexOf(stub) >= 0;
            findNodes(context.elem, check, nodes);
            context.stubNodes = [];
            for (let node of nodes) {
                // Split content, to make stub separate node 
                // and save this node to context.stubNodes
                let parts = node.textContent.split(stub);
                let nodeParent = node.parentNode;
                nodeParent.removeChild(node);
                for (let i = 0; i < parts.length-1; i++) {
                    let part = parts[i];
                    if (part.length > 0) {
                        nodeParent.appendChild(document.createTextNode(part));
                    }
                    let stubNode = document.createTextNode("");
                    context.stubNodes.push(stubNode);
                    nodeParent.appendChild(stubNode);
                }
                let lastPart = parts[parts.length-1];
                if (lastPart) {
                    nodeParent.appendChild(document.createTextNode(lastPart));
                }
            }
        }
        
        if (context.lastValue != value) {        
            for (let i = 0; i < context.stubNodes.length; i++) {
                context.stubNodes[i].textContent = value;
            }
            context.lastValue = value;
        }
        
        return this.next();
    }

    setClass(stub, value) {    
        let context = this;
        if (context.nodes === undefined) {
            context.nodes = [];
            let check = (node) => node.className && node.className.indexOf(stub) >= 0;
            findNodes(context.elem, check, context.nodes);
            context.lastValue = stub;
        }
        
        if (context.lastValue != value) {
            let preparedValue = (value === null || value === undefined) ?  "" : value;
            let preparedLastValue = (context.lastValue === null || context.lastValue === undefined) ?  "" : context.lastValue;
            context.nodes.forEach(node => {
                let space = "";
                if (!context.lastValue && node.className[0] != ' ') {
                    space = " ";
                }
                node.className = node.className.replace(preparedLastValue, preparedValue + space).trim();
            });
            context.lastValue = value;
        }
        
        return this.next();
    }
    
    update(selector, updateFunc) {
        
    }
}

function findNodes(currentElem, check, nodes) {
    if (check(currentElem)) {
        nodes.push(currentElem);
    }
    for (let i = 0; i < currentElem.childNodes.length; i++) {
        findNodes(currentElem.childNodes[i], check, nodes);
    }
}

function renderer(rootElem, renderFunc) {
    let context = new Renderer(rootElem);
    return  () => {
        renderFunc(context);
    };
}