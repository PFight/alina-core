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

    repeat(templateSelector, modelItems, equals, updateFunc) {
        let context = this;
        let elem = context.elem;
        
        if (!context.templateElem) {
            context.templateElem = elem.querySelector(templateSelector);        
            context.itemElements = [];
            context.oldModelItems = [];
            context.elemContexts = [];
            context.containerElem = context.templateElem.parentElement;
        }

        // Add new and update existing
        for (let i = 0; i< modelItems.length; i++) {
            let modelItem = modelItems[i];
            if (!compare(modelItem, context.oldModelItems[i], equals)) {
                context.oldModelItems[i] = modelItem;
                context.itemElements[i] = createChildFromTemplate(context.templateElem, context.containerElem);
                context.elemContexts[i] = new Renderer(context.itemElements[i]);
            }
            updateFunc(modelItem, context.itemElements[i], context.elemContexts[i]);
        }
        // Remove old
        let firstIndexToRemove = modelItems.length;
        for (let i = firstIndexToRemove; i< context.oldModelItems.length; i++) {
            let elem = context.itemElements[i];
            if (elem) {
                context.containerElem.remove(elem);
            }
        }        
        context.itemElements.splice(firstIndexToRemove, context.itemElements.length - firstIndexToRemove);
        context.oldModelItems.splice(firstIndexToRemove, context.oldModelItems.length - firstIndexToRemove);
        
        context.oldModelItems = modelItems;
        
        return this.next();
    }

    setContent(stub, value) {    
        let context = this;
        if (context.nodes === undefined) {
            context.nodes = [];
            let check = (node) => node.nodeType== 3 && node.textContent.indexOf(stub) >= 0;
            findNodes(context.elem, check, context.nodes);
            context.templates = context.nodes.map(x => x.textContent.split(stub));    
        }
        
        if (context.lastValue != value) {        
            for (let i = 0; i < context.nodes.length; i++) {
                context.nodes[i].textContent = context.templates[i].join(value);
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
            context.templates = context.nodes.map(x => x.className.split(stub));
        }
        
        if (context.lastValue != value) {        
            for (let i = 0; i < context.nodes.length; i++) {
                context.nodes[i].className = context.templates[i].join(value || "");
            }
            context.lastValue = value;
        }
        
        return this.next();
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