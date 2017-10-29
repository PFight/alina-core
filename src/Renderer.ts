import * as Alina from "./alina";

export class Renderer implements Alina.IMultiNodeRenderer, Alina.ISingleNodeRenderer {
  protected context: { [key: string]: any };
  protected onLastValue;
  protected onceFlag: boolean;
  protected parentRenderer: Renderer;
  protected _bindings: Alina.NodeBinding[];

  protected getSetComponent(): Alina.ComponentConstructor<Alina.AlSet> {
    return Alina.AlSet;
  }
  protected getRepeatComponent(): Alina.ComponentConstructor<Alina.AlRepeat> {
    return Alina.AlRepeat as any;
  }
  protected getTemplateComponent(): Alina.ComponentConstructor<Alina.AlTemplate> {
    return Alina.AlTemplate as any;
  }
  protected getQueryComponent(): Alina.ComponentConstructor<Alina.AlQuery> {
    return Alina.AlQuery as any;
  }
  protected getFindComponent(): Alina.ComponentConstructor<Alina.AlFind> {
    return Alina.AlFind as any;
  }
  protected getEntryComponent(): Alina.ComponentConstructor<Alina.AlEntry> {
    return Alina.AlEntry as any;
  }
  protected getShowComponent(): Alina.ComponentConstructor<Alina.AlShow> {
    return Alina.AlShow as any;
  }

  static Main = new Renderer([document.body], null);

  static Create(nodeOrBinding: Node | Alina.NodeBinding): Alina.ISingleNodeRenderer {
    return Renderer.Main.create(nodeOrBinding);
  }

  static CreateMulti(nodesOrBindings: Node[] | Alina.NodeBinding[]): Alina.IMultiNodeRenderer {
    return Renderer.Main.createMulti(nodesOrBindings);
  }

  protected constructor(nodesOrBindings: Node[] | Alina.NodeBinding[], parent: Renderer) {
    this.init(nodesOrBindings, parent);
  }

  public get nodes(): Node[] {
    return this._bindings.map(x => x.node);
  }

  public get bindings(): Alina.NodeBinding[] {
    return this._bindings;
  }

  public set bindings(bindings) {
    this._bindings = bindings;
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

  public create(nodeOrBinding: Node | Alina.NodeBinding) {
    return new Renderer([nodeOrBinding] as any, this);
  }

  public createMulti(nodesOrBindings: Node[] | Alina.NodeBinding[]) {
    return new Renderer(nodesOrBindings, this);
  }

  public get binding(): Alina.NodeBinding {
    return this._bindings[0];
  }

  public get parent(): Alina.IBaseRenderer {
    return this.parentRenderer;
  }

  public getContext<T>(key: string, createContext?: () => T): T {
    let context = this.context[key];
    if (!context) {
      context = this.context[key] = createContext ? createContext() : {};
    }
    return context as T;
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

  public ext<T>(createExtension: (renderer: Renderer) => T): T {
    let key = this.getComponentKey("", createExtension);
    let context = this.getContext<any>(key);
    if (!context.extension) {
      context.extension = createExtension(this);
    }
    return context.extension;
  }

  public mount<ComponentT>(
    componentCtor: Alina.ComponentConstructor<ComponentT>,
    key?: string): ComponentT
  {
    let componentKey = this.getComponentKey(key, componentCtor);
    let context = this.getContext(componentKey, () => {
      let instance = new componentCtor() as any;
      (instance as Alina.IMultiNodeComponent).initialize(this);
      return { instance };
    });
    return context.instance;
  }

  public query(selector: string): Alina.ISingleNodeRenderer {
    return this.mount(this.getQueryComponent()).query(selector);
  }

  public queryAll(selector: string): Alina.IMultiNodeRenderer {
    return this.mount(this.getQueryComponent()).queryAll(selector);
  }

  public getEntries(entry: string): Alina.IMultiNodeRenderer {
    return this.mount(this.getEntryComponent()).getEntries(entry);
  }

  public getEntry(entry: string): Alina.ISingleNodeRenderer {
    return this.mount(this.getEntryComponent()).getEntry(entry);
  }

  public findNode(entry: string): Alina.ISingleNodeRenderer {
    return this.mount(this.getFindComponent()).findNode(entry);
  }

  public findNodes(entry: string): Alina.IMultiNodeRenderer {
    return this.mount(this.getFindComponent()).findNodes(entry);
  }

  public set<T>(stub: string, value: T): void {
    (this.getEntry(stub) as Alina.ISingleNodeRenderer).mount(this.getSetComponent()).set(value);
  }

  public repeat<T>(templateSelector: string, items: T[], update: (renderer: Renderer, model: T) => void): void {
    this.query(templateSelector).mount(this.getRepeatComponent()).repeat(items, update);
  }

  public showIf(templateSelector: string, value: boolean): void {
    this.query(templateSelector).mount(this.getShowComponent()).showIf(value);
  }

  public tpl(key?: string): Alina.ITemplateProcessor {
    return this.mount(this.getTemplateComponent(), key);
  }

  protected init(nodesOrBindings: Node[] | Alina.NodeBinding[], parent: Renderer) {
    if (nodesOrBindings.length > 0) {
      let first = nodesOrBindings[0];
      if ((first as Node).nodeType !== undefined) {
        this._bindings = (nodesOrBindings as Node[]).map(x => ({
          node: x,
          queryType: Alina.QueryType.Node
        }));
      } else {
        this._bindings = nodesOrBindings as Alina.NodeBinding[];
      }
    } else {
      this._bindings = [];
    }
    this.context = {};
    this.parentRenderer = parent;
  }

  protected getNode(): Node {
    return this._bindings.length > 0 && this._bindings[0].node || null;
  }

  protected setNode(node: Node) {
    let binding = this._bindings[0];
    if (!binding) {
      binding = this._bindings[0] = {} as Alina.NodeBinding;
    }
    let oldVal = binding.node;
    if (oldVal != node) {
      binding.node = node;
      binding.queryType = Alina.QueryType.Node;

      if (this.parentRenderer && this.parentRenderer.node == oldVal) {
        this.parentRenderer.node = node;
      }
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
}

var COMPONENT_KEY_COUNTER = 1;