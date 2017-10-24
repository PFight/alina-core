interface AltComponent<PropsT> {
  initialize(node: Node, props: PropsT): Node | void;
  update(props: PropsT): void;
}

interface AltComponentConstructor<PropsT> {
  new(): AltComponent<PropsT>;
}

function makeTemplate(str: string): HTMLTemplateElement {
  let elem = document.createElement("template");
  elem.innerHTML = str;
  // document.body.appendChild(elem);
  return elem;
}

function instantiateTemplate(templateElem: HTMLTemplateElement) {
  return templateElem.content ?
    (templateElem.content.firstElementChild || templateElem.content.firstChild).cloneNode(true)
    :
    (templateElem.firstElementChild || templateElem.firstChild).cloneNode(true);
}

function replaceFromTempalte(elemToReplace, templateElem) {
  let elem = instantiateTemplate(templateElem);
  let parent = elemToReplace.parentElement;
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

class Renderer {
  context: { [key: string]: any };
  elem: HTMLElement;

  constructor(elem) {
    this.elem = elem;
    this.context = {};
  }

  repeat<T>(templateSelector: string,
    modelItems: T[],
    updateFunc: (renderer: Renderer, model: T) => void,
    equals?: (a: T, b: T) => boolean)
  {
    let template = this.elem.querySelector(templateSelector) as HTMLTemplateElement;
    let container = template.parentElement;
    return this.repeatEx(templateSelector, template, container,
      null, modelItems, updateFunc, equals);
  }

  repeatEx<T>(key: string, template: HTMLTemplateElement, container: HTMLElement,
    insertBefore: HTMLElement | null, modelItems: T[],
    updateFunc: (renderer: Renderer, model: T) => void, 
    equals?: (a: T, b: T) => boolean)
  {
    let context = this.context[key];
    if (!context) {
      context = this.context[key] = {}
      context.itemContexts = [];
    }

    // Add new and update existing
    for (let i = 0; i < modelItems.length; i++) {
      let modelItem = modelItems[i];

      // Createcontext
      let itemContext = context.itemContexts[i];
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
        let position = i == 0 ? insertBefore : context.itemContexts[i - 1].node.nextSibling;
        if (position) {
          container.insertBefore(itemContext.node, position);
        } else {
          container.appendChild(itemContext.node);
        }
        itemContext.mounted = true;
      }

      // Fill content
      updateFunc(itemContext.renderer, modelItem);

      itemContext.oldModelItem = modelItem;
    }

    // Remove old
    let firstIndexToRemove = modelItems.length;
    for (let i = firstIndexToRemove; i < context.itemContexts.length; i++) {
      let elem = context.itemContexts[i].node;
      if (elem) {
        container.removeChild(elem);
      }
    }
    context.itemContexts.splice(firstIndexToRemove,
      context.itemContexts.length - firstIndexToRemove);
    return this;
  }

  set<T>(stub: string, value: T) {
    let context = this.context[stub];
    if (!context) {
      context = this.context[stub] = {};
    }

    if (context.setters === undefined) {
      context.setters = [];
      fillSetters(this.elem, stub, context.setters);
      context.lastValue = stub;
    }

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

    return this;
  }

  send<PropsT>(props: PropsT): PropsContainer<PropsT> {
    let c = new PropsContainer<PropsT>();
    c.props = props;
    c.renderer = this;
    return c;
  }

  mount<PropsT>(selector: string,
    component: AltComponentConstructor<PropsT>,
    props: PropsT)
  {
    let context = this.context[selector];
    if (!context) {
      context = this.context[selector] = {};
      let elem: Element;
      try {
        elem = this.elem.matches(selector) ? this.elem : this.elem.querySelector(selector);
      } catch { }
      if (!elem) {
        elem = findTextNode(selector, this.elem) as Element;
      }
      context.componentInstance = new component();
      context.componentInstance.initialize(elem, props);
    }

    context.componentInstance.update(props)
  }
}

class PropsContainer<T> {
  renderer: Renderer;
  props: T;

  into(selector: string, component: AltComponentConstructor<T>) {
    return this.renderer.mount(selector, component, this.props);
  }
}

type ElementSetter = (this: Element, oldVal, newVal) => void;

function createIdlSetter(idlName: string): ElementSetter {
  return function (oldVal, newVal) {
    let currentVal = this[idlName];
    if (typeof (currentVal) == "string") {
      this[idlName] = currentVal.replace(oldVal, newVal);
    } else {
      this[idlName] = newVal;
    }
  }
}

var CUSTOM_ATTRIBUTE_SETTERS: { [attributeName: string]: ElementSetter } = {
  "class": function (oldVal, newVal) {
    let preparedValue = (!newVal) ? "" : newVal + " ";
    this.className = this.className.replace(oldVal, preparedValue);
    return preparedValue;
  },
  "for": createIdlSetter("htmlFor")

};

type ValueSetter<T> = (oldVal: T, newVal: T) => void;

function fillSetters(node: Node, stub: string, setters: ValueSetter<any>[]) {
  if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
    let parts = node.textContent.split(stub);
    if (parts.length > 1) {
      // Split content, to make stub separate node 
      // and save this node to context.stubNodes
      let nodeParent = node.parentNode;
      nodeParent.removeChild(node);
      for (let i = 0; i < parts.length - 1; i++) {
        let part = parts[i];
        if (part.length > 0) {
          nodeParent.appendChild(document.createTextNode(part));
        }
        let stubNode = document.createTextNode("");
        setters.push((oldVal, newVal) => stubNode.textContent = newVal);
        nodeParent.appendChild(stubNode);
      }
      let lastPart = parts[parts.length - 1];
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

function findTextNode(searchText: string, current: Node): Node | undefined {
  if (current.nodeType == Node.TEXT_NODE || current.nodeType == Node.COMMENT_NODE) {
    if (current.textContent && current.textContent.indexOf(searchText) >= 0) {
      return current;
    }
  }
  for (let i = 0; i < current.childNodes.length; i++) {
    let result = findTextNode(searchText, current.childNodes[i]);
    if (result) {
      return result;
    }
  }
}