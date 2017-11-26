import * as Alina from "../alina-core";

export class NodeContext {
  protected componentsContext: { [key: string]: any };
  protected _parent: NodeContext;
  protected _binding: Alina.NodeBinding;
  protected extensions: { [key: string]: (renderer: Alina.NodeContext) => Alina.NodeContext } = {};
  protected children: NodeContext[] = [];
  protected disposeListeners: ((context: Alina.NodeContext) => void)[] = []; 
  
  constructor(nodeOrBinding: Node | Alina.NodeBinding, parent: NodeContext) {
    this.init(nodeOrBinding, parent);
  }

  public get elem(): HTMLElement {
    return this.getNode() as HTMLElement;
  }
  public set elem(elem: HTMLElement) {
    this.setNode(elem);
  }

  public nodeAs<T extends Node>() {
    return this.node as T;
  }

  public get node(): Node {
    return this.getNode();
  }

  public set node(node: Node) {
    this.setNode(node);
  }

  public create(nodeOrBinding: Node | Alina.NodeBinding): this {
    let inst = new NodeContext(nodeOrBinding, this);
    return inst as this;
  }

  public get binding(): Alina.NodeBinding {
    return this._binding;
  }

  public get parent(): NodeContext {
    return this._parent;
  }

  public getComponentContext<T>(component: Function, additionalKey: string, createContext?: () => T): T {
    let key = this.getComponentKey(additionalKey, component);
    let context = this.componentsContext[key];
    if (!context) {
      context = this.componentsContext[key] = createContext ? createContext() : {};
    }
    return context as T;
  }

  public clearComponentContext(component: Function, additionalKey: string) {
    let key = this.getComponentKey(additionalKey, component);
    delete this.componentsContext[key];
  }

  public ext<T extends Alina.NodeContext>(extension: (renderer: this) => T): T {
    let key = this.getComponentKey("", extension);
    let ext = this.extensions[key];
    if (!ext) {
      extension(this);
      this.extensions[key] = extension as any;
    }
    return this as any;
  }

  public mount<ComponentT extends Alina.Component<ContextT>, ContextT extends NodeContext, ServicesT>(this: ContextT,
    componentCtor: Alina.ComponentCtor<ComponentT, ContextT, ServicesT>,
    services?: ServicesT,
    key?: string): ComponentT
  {
    let context = this.getComponentContext<IComponentContext>(componentCtor, key, () => {
      let context = this.create(this.binding);
      let instance = new componentCtor(context, services);
      instance.init();
      return { instance: instance as any, context: context as any} as IComponentContext;
    });
    return context.instance as any;
  }
  
  public call<PropsT, RetT>(this: this,
    component: Alina.FuncComponent<this, PropsT, RetT>,
    props: PropsT,
    key?: string): RetT {
    let context = this.getComponentContext<IComponentContext>(component, key, () => ({
      context: this.create(this.binding)
    }));
    return component(context.context as any, props);
  }

  public unmount<ComponentT extends Function>(component: ComponentT, key?: string): void {
    let context = this.getComponentContext<IComponentContext>(component, key);
    if (context.context) {
      context.context.dispose();
    }
    this.clearComponentContext(component, key);
  }

  public unmountAll() {
    let children = [...this.children];
    for (let c of children) {
      c.dispose();
    }
    this.componentsContext = {};
  }

  public addDisposeListener(callback: (context: this) => void) {
    this.disposeListeners.push(callback as any);
  }

  public removeDisposeListener(callback: (context: this) => void) {
    let index = this.disposeListeners.indexOf(callback as any);
    if (index >= 0) {
      this.disposeListeners.splice(index, 1);
    }
  }

  public dispose() {
    for (let listener of this.disposeListeners) {
      listener(this);
    }
    let children = [...this.children];
    for (let child of children) {
      child.dispose();
    }
    if (this.parent) {
      this.parent.children.splice(this.parent.children.indexOf(this), 1);
    }
  }

  protected getComponentKey(key: string, component: Function) {
    let result = key || "";
    if (component["AlinaComponentName"]) {
      result += component["AlinaComponentName"];
    } else {
      let name = component["AlinaComponentName"] =
        (component["name"] || "") + COMPONENT_KEY_COUNTER.toString();
      COMPONENT_KEY_COUNTER++;
      result += name;
    }
    return result;
  }

  protected init(nodeOrBinding: Node | Alina.NodeBinding, parent: NodeContext) {
    if ((nodeOrBinding as Node).nodeType !== undefined) {
      this._binding = {
        node: (nodeOrBinding as Node),
        queryType: Alina.QueryType.Node
      };
    } else {
      this._binding = { ...nodeOrBinding as Alina.NodeBinding };
    }
    this.componentsContext = {};
    this._parent = parent;
    if (parent) {
      this.extensions = { ...parent.extensions };
      for (let extKey in this.extensions) {
        this.extensions[extKey](this);
      }
      parent.children.push(this);
    }
  }
  
  protected getNode(): Node {
    return this._binding.node;
  }

  protected setNode(node: Node) {
    if (!this._binding) {
      this._binding = {} as Alina.NodeBinding;
    }
    let oldVal = this._binding.node;
    if (oldVal != node) {
      this._binding.node = node;
      this._binding.queryType = Alina.QueryType.Node;

      if (this._parent && this._parent.node == oldVal) {
        this._parent.node = node;
      }
    }
  }
}

export enum QueryType {
  Node = 1,
  NodeAttribute = 2,
  NodeTextContent = 3
}

export interface NodeBinding {
  node: Node;
  queryType: QueryType;
  query?: string;
  attributeName?: string;
  idlName?: string;
}

interface IComponentContext {
  context: Alina.NodeContext;
  instance?: Function;
}

var COMPONENT_KEY_COUNTER = 1;