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

function repeat(rootElem, templateSelector, modelItemsFunc, equals, updateFunc) {
    let tpl = rootElem.querySelector(templateSelector);
    let containerElem = tpl.parentElement;
    let itemElements = [];
    let oldModelItems = [];
    let renderers = [];
    
    return (model) => {     
        let modelItems = modelItemsFunc(model);
        // Add new and update existing
        for (let i = 0; i< modelItems.length; i++) {
            let modelItem = modelItems[i];
            if (!compare(modelItem, oldModelItems[i], equals)) {
                oldModelItems[i] = modelItem;
                let elem = createChildFromTemplate(tpl, containerElem);
                itemElements[i] = elem;
                let itemRenderers = updateFunc(elem);
                renderers[i] = (value) => itemRenderers.forEach(x => x(value));
            } else {
                renderers[i](modelItem);
            }
        }
        // Remove old
        let firstIndexToRemove = modelItems.length;
        for (let i = firstIndexToRemove; i< oldModelItems.length; i++) {
            let elem = itemElements[i];
            if (elem) {
                containerElem.remove(elem);
            }
        }        
        itemElements.splice(firstIndexToRemove, itemElements.length - firstIndexToRemove);
        oldModelItems.splice(firstIndexToRemove, oldModelItems.length - firstIndexToRemove);
        renderers.splice(firstIndexToRemove, renderers.length - firstIndexToRemove);
        
        oldItems = modelItems;
    };
}

function setContent(rootElem, placeholder, valueFunc) {
    let check = (node) => node.nodeType== 3 && node.textContent.indexOf(placeholder) >= 0;
    let nodes = [];
    findNodes(rootElem, check, nodes);
    let templates = nodes.map(x => x.textContent.split(placeholder));
    let lastValue = undefined;
    
    return (model) => {
        let value = valueFunc(model);
        if (lastValue != value) {        
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].textContent = templates[i].join(value);
            }
            lastValue = value;
        }
    }
}

function setClass(rootElem, placeholder, valueFunc) {
    let check = (node) => node.className && node.className.indexOf(placeholder) >= 0;
    let nodes = [];
    findNodes(rootElem, check, nodes);
    let templates = nodes.map(x => x.className.split(placeholder));
    let lastValue = undefined;
    
    return (model) => {
        let value = valueFunc(model);
        if (lastValue != value) {        
            for (let i = 0; i < nodes.length; i++) {
                nodes[i].className = templates[i].join(value || "");
            }
            lastValue = value;
        }
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

function createRenderer() {
    return  () => {
        for (let i = 0; i < arguments.length; i++) { //>
            arguments[i]();
        }
    };
}