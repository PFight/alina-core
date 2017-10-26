interface AltComponent {
  initialize(context: Renderer): void;
}

interface AltMultiComponent {
  initializeMulti(context: Renderer): void;
}

interface ComponentConstructor<ComponentT> {
  new(): ComponentT;
}

enum QueryType {
  Node = 1,
  NodeAttribute = 2,
  NodeTextContent = 3
}

interface NodeBinding {
  node: Node;
  queryType: QueryType;
  query?: string;
  attributeName?: string;
  idlName?: string;
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

class Renderer implements IMultiNodeRenderer, ISingleNodeRenderer {
  protected context: { [key: string]: any };
  protected onLastValue;
  protected onceFlag: boolean;
  protected parentRenderer: Renderer;
  protected _bindings: NodeBinding[];

  static Main = new Renderer(document.body, null);

  static Create(nodeOrBindings: Node | NodeBinding[]): ISingleNodeRenderer {
    return Renderer.Main.create(nodeOrBindings);
  }

  static CreateMulti(nodeOrBindings: Node | NodeBinding[]): IMultiNodeRenderer {
    return Renderer.Main.createMulti(nodeOrBindings);
  }

  protected constructor(nodeOrBindings: Node | NodeBinding[], parent: Renderer) {
    if (Array.isArray(nodeOrBindings)) {
      this._bindings = nodeOrBindings;
    } else {
      this._bindings = [{
        node: nodeOrBindings,
        queryType: QueryType.Node
      }];
    }
    this.context = {};
    this.parentRenderer = parent;
  }

  public get nodes(): Node[] {
    return this._bindings.map(x => x.node);
  }

  public get bindings() {
    return this._bindings;
  }

  public get elem(): HTMLElement {
    return this.node as HTMLElement;
  }
  public set elem(elem: HTMLElement) {
    this.node = elem;
  }

  public nodeAs<T extends Node>() {
    return this.node as T;
  }

  public get node(): Node {
    return this._bindings[0].node;
  }

  public set node(node: Node) {
    let binding = this._bindings[0];
    if (!binding) {
      binding = this._bindings[0] = {} as NodeBinding;
    }
    binding.node = node;
    binding.queryType = QueryType.Node;
  }

  public create(nodeOrBindings: Node | NodeBinding[]) {
    return new Renderer(nodeOrBindings, this);
  }

  public createMulti(nodeOrBindings: Node | NodeBinding[]) {
    return new Renderer(nodeOrBindings, this);
  }

  public get binding() {
    return this._bindings[0];
  }

  public getContext<T>(key: string, createContext?: () => T): T {
    let context = this.context[key];
    if (!context) {
      context = this.context[key] = createContext ? createContext() : {};
    }
    return context as T;
  }

  public mount<ComponentT>(
    componentCtor: ComponentConstructor<ComponentT>,
    key?: string): ComponentT
  {
    let componentKey = this.getComponentKey(key, componentCtor);
    let context = this.getContext<any>(componentKey);
    if (!context.instance) {
      let sameAsParent = this.parentRenderer && this.parentRenderer.node == this.node;

      context.instance = new componentCtor();
      (context.instance as AltMultiComponent).initializeMulti(this);

      // Component can replace current node
      if (sameAsParent && this.parentRenderer.node != this.node) {
        this.parentRenderer.node = this.node;
      }
    }
    return context.instance;
  }

  public query(selector: string): Renderer {
    let context = this.context[selector];
    if (!context) {
      context = this.context[selector] = {
        result: this.create(this.querySelectorInternal(selector))
      }
    }
    return context.result;
  }

  public queryAll(selector: string): Renderer {
    let context = this.context[selector];
    if (!context) {
      context = this.context[selector] = {
        result: this.createMulti(
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

  public getEntries(entry: string): Renderer {
    let context = this.context[entry];
    if (!context) {
      context = this.context[entry] = {};
      let bindings: NodeBinding[] = [];
      this._bindings.forEach(x => this.fillBindings(x.node, entry, bindings, false));
      context.renderer = this.createMulti(bindings);      
    }
    return context.renderer;
  }

  public getEntry(entry: string): Renderer {
    let context = this.context[entry];
    if (!context) {
      context = this.context[entry] = {};
      let bindings: NodeBinding[] = [];
      this._bindings.forEach(x => this.fillBindings(x.node, entry, bindings, true));
      context.renderer = this.create(bindings);
    }
    return context.renderer;
  }

  public findNode(entry: string): Renderer {
    let context = this.context[entry];
    if (!context) {
      context = this.context[entry] = {};
      let bindings: NodeBinding[] = [];
      this._bindings.forEach(x => this.findNodesInternal(x.node, entry, bindings, true));
      context.renderer = this.create(bindings);
    }
    return context.renderer;
  }

  public findNodes(entry: string): Renderer {
    let context = this.context[entry];
    if (!context) {
      context = this.context[entry] = {};
      let bindings: NodeBinding[] = [];
      this._bindings.forEach(x => this.findNodesInternal(x.node, entry, bindings, false));
      context.renderer = this.createMulti(bindings);
    }
    return context.renderer;
  }

  public on<T>(value: T, callback: (renderer: Renderer, value?: T, prevValue?: T) => T | void, key?: string): void {
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

  public once(callback: (renderer: Renderer) => void): void {
    if (!this.onceFlag) {
      this.onceFlag = true;
      callback(this);
    }
  }

  public set<T>(stub: string, value: T): void {
    this.getEntries(stub).mount(AltSet).set(value);
  }

  public repeat<T>(templateSelector: string, items: T[], update: (renderer: Renderer, model: T) => void): void {
    this.query(templateSelector).mount(AltRepeat).repeat(items, update);
  }

  public showIf(templateSelector: string, value: boolean): void {
    this.query(templateSelector).mount(AltShow).showIf(value);
  }

  protected querySelectorInternal(selector: string) {
    let result: Element;
    for (let i = 0; i < this._bindings.length && !result; i++) {
      let node = this._bindings[i].node;
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
    for (let i = 0; i < this._bindings.length && !result; i++) {
      let node = this._bindings[i].node;
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

  protected fillBindings(node: Node, query: string, bindings: NodeBinding[], single: boolean, queryType?: QueryType) {
    if (queryType === undefined || queryType == QueryType.NodeTextContent) {
      if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
        let parts = node.textContent.split(query);
        if (parts.length > 1) {
          // Split content, to make stub separate node 
          // and save this node to context.stubNodes
          let nodeParent = node.parentNode;
          for (let i = 0; i < parts.length - 1; i++) {
            let part = parts[i];
            if (part.length > 0) {
              nodeParent.insertBefore(document.createTextNode(part), node);
            }
            let stubNode = document.createTextNode(query);
            if (!single || bindings.length == 0) {
              bindings.push({
                node: stubNode,
                queryType: QueryType.NodeTextContent,
                query: query
              });
            }
            nodeParent.insertBefore(stubNode, node);
          }
          let lastPart = parts[parts.length - 1];
          if (lastPart && lastPart.length > 0) {
            nodeParent.insertBefore(document.createTextNode(lastPart), node);
          }
          nodeParent.removeChild(node);
        }
      }
    }
    if ((queryType === undefined || queryType == QueryType.NodeAttribute) && node.attributes) {
      for (let i = 0; i < node.attributes.length && (!single || bindings.length == 0); i++) {
        let attr = node.attributes[i];
        if (attr.value && attr.value.indexOf(query) >= 0) {
          bindings.push({
            node: node,
            query: query,
            attributeName: attr.name,
            idlName: this.getIdlName(attr, node),
            queryType: QueryType.NodeAttribute
          });
        }
      }
    }

    for (let i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
      let lengthBefore = node.childNodes.length;
      this.fillBindings(node.childNodes[i], query, bindings, single, queryType);
      let lengthAfter = node.childNodes.length;
      // Node can be replaced by several other nodes
      if (lengthAfter > lengthBefore) {
        i += lengthAfter - lengthBefore;
      }
    }
  }

  protected findNodesInternal(node: Node, query: string, bindings: NodeBinding[], single: boolean) {
    let found = false;
    if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
      if (node.textContent.indexOf(query) >= 0) {
          bindings.push({
            node: node,
            query: query,
            queryType: QueryType.Node
        });
        found = true;
      } 
    }
    
    if (!found && node.attributes) {
      for (let i = 0; i < node.attributes.length && !found; i++) {
        let attr = node.attributes[i];
        if (attr.name.indexOf(query) >= 0 || attr.value.indexOf(query) >= 0) {
          bindings.push({
            node: node,
            query: query,
            attributeName: attr.name,
            idlName: this.getIdlName(attr, node),
            queryType: QueryType.Node
          });
        }
      }
    }

    for (let i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
      this.findNodesInternal(node.childNodes[i], query, bindings, single);
    }
  }

  protected getIdlName(attr: Attr, node: Node) {
    let idlName = ATTRIBUTE_TO_IDL_MAP[attr.name] || attr.name;
    if (!(idlName in node)) {
      idlName = null;
    }
    return idlName;
  }

  protected getComponentKey(key: string, component: ComponentConstructor<any>) {
    let result = key || "";
    if (component.name) {
      result += component.name;
    } else {
      result += this.hashCode(component.toString());
    }
    return result;
  }

  protected hashCode(str: string) {
    var hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };
}

interface IBaseRenderer {
  create(nodeOrBindings: Node | NodeBinding[]): ISingleNodeRenderer;
  createMulti(nodeOrBindings: Node | NodeBinding[]): IMultiNodeRenderer;
  binding: NodeBinding;
  getContext<T>(key: string, createContext?: () => T): T;
  query(selector: string): ISingleNodeRenderer;
  queryAll(selector: string): IMultiNodeRenderer;
  getEntries(entry: string): IMultiNodeRenderer;
  getEntry(entry: string): ISingleNodeRenderer;
  findNode(entry: string): ISingleNodeRenderer;
  findNodes(entry: string): IMultiNodeRenderer; 
  set<T>(stub: string, value: T): void;  
  showIf(templateSelector: string, value: boolean): void;
}

interface IMultiNodeRenderer extends IBaseRenderer {
  nodes: Node[];
  bindings: NodeBinding[];
  mount<ComponentT extends AltMultiComponent>(
    componentCtor: ComponentConstructor<ComponentT>,
    key?: string): ComponentT;
  on<T>(value: T, callback: (renderer: IMultiNodeRenderer, value?: T, prevValue?: T) => T | void, key?: string): void;
  once(callback: (renderer: IMultiNodeRenderer) => void): void;
  repeat<T>(templateSelector: string, items: T[], update: (renderer: IMultiNodeRenderer, model: T) => void): void;
}

interface ISingleNodeRenderer extends IBaseRenderer {
  elem: HTMLElement;  
  node: Node;
  binding: NodeBinding;
  nodeAs<T extends Node>(): T;
  mount<ComponentT extends AltComponent>(
    componentCtor: ComponentConstructor<ComponentT>,
    key?: string): ComponentT;
  on<T>(value: T, callback: (renderer: ISingleNodeRenderer, value?: T, prevValue?: T) => T | void, key?: string): void;
  once(callback: (renderer: ISingleNodeRenderer) => void): void;
  repeat<T>(templateSelector: string, items: T[], update: (renderer: ISingleNodeRenderer, model: T) => void): void;
}

var ATTRIBUTE_TO_IDL_MAP: { [attributeName: string]: string } = {
  "class": "className",
  "for": "htmlFor"
};