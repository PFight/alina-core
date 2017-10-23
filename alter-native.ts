interface AlterNativeComponent<PropsT> {
  update(props: PropsT): void;
}

interface AlterNativeComponentConstructor<PropsT> {
  new(elem: HTMLElement, props: PropsT): AlterNativeComponent<PropsT>;
}


function makeTemplate(str: string): HTMLTemplateElement {
  let elem = document.createElement("template");
  elem.innerHTML = str;
  // document.body.appendChild(elem);
  return elem;
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
  if (typeof (rr) == "function") {
    rr();
  } else if (rr && rr.length) {
    rr.forEach(x => x());
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
  if (a && b && comparer && comparer(a, b)) return true;
  return false;
}

class Renderer {
  context: { [key: string]: any };
  elem: HTMLElement;

  constructor(elem) {
    this.elem = elem;
    this.context = {};
  }

  repeat<T>(templateSelector: string, modelItems: T[],
    updateFunc: (renderer: Renderer, model: T) => void,
    equals?: (a: T, b: T) => boolean) {
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
      context.oldModelItems = [];
      context.elemContexts = [];
    }

    // Add new and update existing
    for (let i = 0; i < modelItems.length; i++) {
      let modelItem = modelItems[i];
      if (!compare(modelItem, context.oldModelItems[i], equals)) {
        context.oldModelItems[i] = modelItem;
        let elem = instantiateTemplate(template);
        if (insertBefore) {
          container.insertBefore(elem, insertBefore);
        } else {
          container.appendChild(elem);
        }
        context.elemContexts[i] = new Renderer(elem);
      }
      updateFunc(context.elemContexts[i], modelItem);
    }
    // Remove old
    let firstIndexToRemove = modelItems.length;
    for (let i = firstIndexToRemove; i < context.oldModelItems.length; i++) {
      let elem = context.elemContexts[i].elem;
      if (elem) {
        container.removeChild(elem);
      }
    }
    context.oldModelItems.splice(firstIndexToRemove, context.oldModelItems.length - firstIndexToRemove);
    context.elemContexts.splice(firstIndexToRemove, context.elemContexts.length - firstIndexToRemove);

    context.oldModelItems = modelItems;

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

  send<PropsT>(props: PropsT): PropsContainer<PropsT> {
    let c = new PropsContainer<PropsT>();
    c.props = props;
    c.renderer = this;
    return c;
  }

  mount<PropsT>(selector: string,
    component: AlterNativeComponentConstructor<PropsT>,
    props: PropsT)
  {
    let context = this.context[selector];
    if (!context) {
      context = this.context[selector] = {};
      let elem = this.elem.matches(selector) ? this.elem : this.elem.querySelector(selector);
      context.componentInstance = new component(elem as HTMLElement, props);
    } else {
      context.componentInstance.update(props)
    }
  }
}

class PropsContainer<T> {
  renderer: Renderer;
  props: T;

  into(selector: string, component: AlterNativeComponentConstructor<T>) {
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
  if (node.nodeType == Node.TEXT_NODE) {
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