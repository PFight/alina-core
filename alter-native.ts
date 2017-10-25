interface AltComponent {
  initialize(context: Renderer);
}

interface ComponentConstructor<ComponentT> {
  new(): ComponentT;
}

enum QueryType {
  Node,
  NodeAttribute,
  NodeTextContent
}

interface NodeBinding {
  node: Node;
  queryType: QueryType;
  query?: string;
  attributeName?: string;
  setter?: ValueSetter<any>;
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
  bindings: NodeBinding[];
  onceFlag: boolean;

  constructor(node: Node);
  constructor(bindings: NodeBinding[]);
  constructor(nodeOrBindings: Node | NodeBinding[]) {
    if (Array.isArray(nodeOrBindings)) {
      this.bindings = nodeOrBindings;
    } else {
      this.bindings = [{
        node: nodeOrBindings,
        queryType: QueryType.Node
      }];
    }
    this.context = {};
  }

  get once() {
    if (!this.onceFlag) {
      this.onceFlag = true;
      return true;
    }
    return false;
  }

  get elem(): HTMLElement {
    return this.node as HTMLElement;
  }
  set elem(elem: HTMLElement) {
    this.node = elem;
  }

  get node(): Node {
    return this.bindings[0].node;
  }

  get nodes(): Node[] {
    return this.bindings.map(x => x.node);
  }

  set node(node: Node) {
    let binding = this.bindings[0];
    if (!binding) {
      binding = this.bindings[0] = {} as NodeBinding;
    }
    binding.node = node;
    binding.queryType = QueryType.Node;
  }

  getContext<T>(key: string, createContext?: () => T): T {
    let context = this.context[key];
    if (!context) {
      context = this.context[key] = createContext ? createContext() : {};
    }
    return context as T;
  }

  componentOnNode<ComponentT extends AltComponent>(selectorOrText: string,
    component: ComponentConstructor<ComponentT>): ComponentT
  {
    let key = getComponentKey(selectorOrText, component);
    let context = this.context[key];
    if (!context) {
      context = this.context[key] = {};
      let result: Element;
      try {
        result = this.querySelectorInternal(selectorOrText);
      } catch { }
      if (!result) {
        result = this.findNodeInternal(selectorOrText);
      }      

      let renderer = new Renderer([{
        node: result,
        queryType: QueryType.Node,
        query: selectorOrText
      }]);
      context.componentInstance = new component();
      (context.componentInstance as AltComponent).initialize(renderer);      
    }
    return context.componentInstance;
  }

  webComponent<ComponentT extends HTMLElement>(selector: string,
    component: ComponentConstructor<ComponentT>): ComponentT {
    let key = getComponentKey(selector, component);
    let context = this.context[key];
    if (!context) {
      context = this.context[key] = {};
      let result = this.querySelectorInternal(selector);
      if (customElements.get(result.nodeName.toLowerCase()) == component) {
        context.componentInstance = result;
      } else {
        throw new Error("Component do not match element");
      }
    }
    return context.componentInstance;
  }

  component<ComponentT extends AltComponent>(key: string,
    componentCtor: ComponentConstructor<ComponentT>): ComponentT {
    let componentKey = getComponentKey(key, componentCtor);
    let context = this.getContext<any>(componentKey);
    if (!context.instance) {
      context.instance = new componentCtor();
      (context.instance as AltComponent).initialize(this);
    }
    return context.instance;
  }

  findNode(text: string, callback?: (el: Node) => void): Node {
    let context = this.context[text];
    if (!context) {
      context = this.context[text] = {};
      for (let i = 0; i < this.bindings.length && !context.result; i++) {
        context.result = findTextNode(text, this.bindings[i].node) as Element;
      }
    }
    if (callback) {
      callback(context.result);
    }
    return context.result;
  }

  querySelector(selector: string, callback?: (el: HTMLElement) => void): HTMLElement {
    let context = this.context[selector];
    if (!context) {
      context = this.context[selector] = {};
      context.result = this.querySelectorInternal(selector);
    }
    if (callback) {
      callback(context.result);
    }
    return context.result;
  }

  componentOnStub<ComponentT extends AltComponent>(stub: string,
    component: ComponentConstructor<ComponentT>): ComponentT {
    let key = getComponentKey(stub, component);
    let context = this.context[key];
    if (!context) {
      context = this.context[key] = {};
      let bindings: NodeBinding[] = [];
      this.nodes.forEach(x => fillBindings(x, stub, bindings));
      let renderer = new Renderer(bindings);
      context.componentInstance = new component();
      (context.componentInstance as AltComponent).initialize(renderer);
    }
    return context.componentInstance;
  }

  set<T>(stub: string, value: T) {
    this.componentOnStub(stub, AltSet).set(value);
  }

  repeat<T>(templateSelector: string, items: T[], update: (renderer: Renderer, model: T) => void) {
    this.componentOnNode(templateSelector, AltRepeat).repeat(items, update);
  }

  protected findNodeInternal(text: string) {
    let result;
    for (let i = 0; i < this.bindings.length && !result; i++) {
      result = findTextNode(text, this.bindings[i].node) as Element;
    }
    return result;
  }

  protected querySelectorInternal(selector: string) {
    let result: Element;
    for (let i = 0; i < this.bindings.length && !result; i++) {
      let node = this.bindings[i].node;
      if (node.nodeType == Node.ELEMENT_NODE) {
        let elem = node as HTMLElement;
        if (elem.matches(selector)) {
          result = elem;
        } else {
          result = elem.querySelector(selector);
        }
      }
    }
    return result;
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

type ValueSetter<T> = (oldVal: T, newVal: T) => T;

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

function fillBindings(node: Node, qeury: string, bindings: NodeBinding[], queryType?: QueryType) {
  if (!queryType || queryType == QueryType.NodeTextContent) {
    if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
      let parts = node.textContent.split(qeury);
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
          bindings.push({
            node: stubNode,
            queryType: QueryType.NodeTextContent,
            query: qeury,
            setter: (oldVal, newVal) => stubNode.textContent = newVal
          });
          nodeParent.appendChild(stubNode);
        }
        let lastPart = parts[parts.length - 1];
        if (lastPart) {
          nodeParent.appendChild(document.createTextNode(lastPart));
        }
      }
    }
  }
  if ((!queryType || queryType == QueryType.NodeAttribute) && node.attributes) {
    for (let i = 0; i < node.attributes.length; i++) {
      let attr = node.attributes[i];
      if (attr.value && attr.value.indexOf(qeury) >= 0) {
        let setter = CUSTOM_ATTRIBUTE_SETTERS[attr.name];
        if (!setter) {
          if (attr.name in node) {
            setter = createIdlSetter(attr.name);
          } else {
            setter = (oldVal, newVal) => attr.value = attr.value.replace(oldVal, newVal);
          }
        }
        bindings.push({
          node: node,
          query: qeury,
          attributeName: attr.name,
          queryType: QueryType.NodeAttribute,
          setter: setter.bind(node)
        });
      }
    }
  }

  for (let i = 0; i < node.childNodes.length; i++) {
    fillBindings(node.childNodes[i], qeury, bindings);
  }
}

function getComponentKey(key: string, component: ComponentConstructor<any>) {
  let result = key || "";
  if (component.name) {
    result += component.name;
  } else {
    result += hashCode(component.toString());
  }
  return result;
}

function hashCode(str: string) {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};