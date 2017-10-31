import * as Alina from "./alina";

export class NodeContext {
  protected context: { [key: string]: any };
  protected parentRenderer: NodeContext;
  protected _binding: Alina.NodeBinding;
  protected extensions: ((renderer: Alina.NodeContext) => Alina.NodeContext)[] = [];
  
  constructor(nodeOrBinding: Node | Alina.NodeBinding, parent: NodeContext) {
    this.init(nodeOrBinding, parent);
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
    return this.getNode();
  }

  public set node(node: Node) {
    this.setNode(node);
  }

  public create(nodeOrBinding: Node | Alina.NodeBinding): this {
    let inst = new NodeContext(nodeOrBinding, this);
    for (let ext of this.extensions) {
      inst = ext(inst);
    }
    return inst as this;
  }

  public get binding(): Alina.NodeBinding {
    return this._binding;
  }

  public get parent(): NodeContext {
    return this.parentRenderer;
  }

  public getContext<T>(key: string, createContext?: () => T): T {
    let context = this.context[key];
    if (!context) {
      context = this.context[key] = createContext ? createContext() : {};
    }
    return context as T;
  }

  public ext<T>(createExtension: (renderer: this) => T): T {
    let key = this.getKey("", createExtension);
    let context = this.getContext(key, () => {
      this.extensions.push(createExtension as any);
      return { extension: createExtension(this) };
    });
    return context.extension;
  }

  public mount<ComponentT extends Alina.Component<this>>(this: this,
    componentCtor: Alina.Ctor<ComponentT>,
    key?: string): ComponentT
  {
    let componentKey = this.getKey(key, componentCtor);
    let context = this.getContext(componentKey, () => {
      let instance = new componentCtor() as any;
      (instance as Alina.Component<this>).initialize(this);
      return { instance };
    });
    return context.instance;
  }

  public call<PropsT, RetT>(this: this,
    component: Alina.FuncComponent<this, PropsT, RetT>,
    props: PropsT,
    key?: string): RetT {
    let componentKey = this.getKey(key, component);
    let context = this.getContext(componentKey, () => ({
      renderer: this.create(this.binding)
    }));
    return component(context.renderer, props);
  }


  public getKey(key: string, component: Function) {
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
      this._binding = nodeOrBinding as Alina.NodeBinding;
    }    
    this.context = {};
    this.parentRenderer = parent;
    if (parent) {
      this.extensions = [...parent.extensions];
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

      if (this.parentRenderer && this.parentRenderer.node == oldVal) {
        this.parentRenderer.node = node;
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

var COMPONENT_KEY_COUNTER = 1;