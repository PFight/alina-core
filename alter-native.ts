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
  idlName?: string;
  setter?: ValueSetter<any>;
}

function makeTemplate(str: string): HTMLTemplateElement {
  let elem = document.createElement("template");
  elem.innerHTML = str;
  // document.body.appendChild(elem);
  return elem;
}

function fromTemplate(templateElem: HTMLTemplateElement) {
  return templateElem.content ?
    (templateElem.content.firstElementChild || templateElem.content.firstChild).cloneNode(true)
    :
    (templateElem.firstElementChild || templateElem.firstChild).cloneNode(true);
}

function replaceFromTempalte<T extends Node>(elemToReplace: T, templateElem: HTMLTemplateElement): T {
  let elem = fromTemplate(templateElem);
  let parent = elemToReplace.parentElement;
  if (parent) {
    parent.replaceChild(elem, elemToReplace);
  }
  return elem as T;
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
  protected onceFlag: boolean;
  protected onLastValue;

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

  nodeAs<T extends Node>() {
    return this.node as T;
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

      // Component can replace current node
      if (result == this.node && renderer.node != result) {
        this.node = renderer.node;
      }
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

  findTextNode(text: string): Renderer {
    let context = this.context[text];
    if (!context) {
      context = this.context[text] = {};
      for (let i = 0; i < this.bindings.length && !context.result; i++) {
        let elem = findTextNode(text, this.bindings[i].node) as Element;
        if (elem) {
          context.result = new Renderer(elem);
        }
      }
    }
    return context.result;
  }

  querySelector(selector: string): Renderer {
    let context = this.context[selector];
    if (!context) {
      context = this.context[selector] = {
        result: new Renderer(this.querySelectorInternal(selector));
      }
    }
    return context.result;
  }

  querySelectorAll(selector: string): Renderer {
    let context = this.context[selector];
    if (!context) {
      context = this.context[selector] = {
        result: new Renderer(
          this.querySelectorAllInternal(selector).map(x => ({
            node: x,
            queryType: QueryType.Node,
            query: selector
          } as NodeBinding))
        )
      };
    }
    return context.result;
  }

  findAll(stub: string): Renderer {
    let context = this.context[stub];
    if (!context) {
      context = this.context[stub] = {};
      let bindings: NodeBinding[] = [];
      this.nodes.forEach(x => fillBindings(x, stub, bindings));
      context.renderer = new Renderer(bindings);      
    }
    return context.renderer;
  }

  on<T>(value: T, callback: (renderer: Renderer, value?: T, prevValue?: T) => T | void, key?: string) {
    let lastValue = key ? this.context[key] : this.onLastValue;
    if (this.onLastValue !== value) {
      let result = callback(this, value, this.onLastValue);
      let lastValue = result !== undefined ? result : value;
      if (key) {
        this.context[key] = lastValue;
      } else {
        this.onLastValue = lastValue;
      }
    }
  }

  componentOn<ComponentT extends AltComponent>(stub: string,
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

  update<T>(stub: string, value: T) {
    this.componentOn(stub, AltSet).update(value);
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

  protected querySelectorAllInternal(selector: string) {
    let result: Element[] = [];
    for (let i = 0; i < this.bindings.length && !result; i++) {
      let node = this.bindings[i].node;
      if (node.nodeType == Node.ELEMENT_NODE) {
        let elem = node as HTMLElement;
        if (elem.matches(selector)) {
          result.push(elem);
        }
        result = result.concat(elem.querySelectorAll(selector) as any);
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



function fillBindings(node: Node, query: string, bindings: NodeBinding[], queryType?: QueryType) {
  if (!queryType || queryType == QueryType.NodeTextContent) {
    if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
      let parts = node.textContent.split(query);
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
          let stubNode = document.createTextNode(query);
          bindings.push({
            node: stubNode,
            queryType: QueryType.NodeTextContent,
            query: query
          });
          nodeParent.appendChild(stubNode);
        }
        let lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.length > 0) {
          nodeParent.appendChild(document.createTextNode(lastPart));
        }
      }
    }
  }
  if ((!queryType || queryType == QueryType.NodeAttribute) && node.attributes) {
    for (let i = 0; i < node.attributes.length; i++) {
      let attr = node.attributes[i];
      if (attr.value && attr.value.indexOf(query) >= 0) {
        let idlName = ATTRIBUTE_TO_IDL_MAP[attr.name] || attr.name;
        if (!(idlName in node)) {
          idlName = null;
        }
        bindings.push({
          node: node,
          query: query,
          attributeName: attr.name,
          idlName: idlName,
          queryType: QueryType.NodeAttribute
        });
      }
    }
  }

  for (let i = 0; i < node.childNodes.length; i++) {
    let lengthBefore = node.childNodes.length;
    fillBindings(node.childNodes[i], query, bindings);
    let lengthAfter = node.childNodes.length;
    // Node can be replaced by several other nodes
    if (lengthAfter > lengthBefore) {
      i += lengthAfter - lengthBefore;
    } 
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

var ATTRIBUTE_TO_IDL_MAP: { [attributeName: string]: string } = {
  "class": "className",
  "for": "htmlFor"
};