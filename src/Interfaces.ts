import * as Alina from "./alina";

export interface ISingleNodeComponent {
  initialize(context: ISingleNodeRenderer): void;
}

export interface IMultiNodeComponent {
  initialize(context: IMultiNodeRenderer): void;
}

export interface ComponentConstructor<ComponentT> {
  new(): ComponentT;
}

export interface IBaseRenderer {
  create(nodeOrBindings: Node | NodeBinding): ISingleNodeRenderer;
  createMulti(nodesOrBindings: Node[] | NodeBinding[]): IMultiNodeRenderer;
  readonly parent: IBaseRenderer;
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
  tpl(key?: string): Alina.AlTemplate;
}

export interface IMultiNodeRenderer extends IBaseRenderer {
  nodes: Node[];
  bindings: NodeBinding[];
  mount<ComponentT extends IMultiNodeComponent>(
    componentCtor: ComponentConstructor<ComponentT>,
    key?: string): ComponentT;
  on<T>(value: T, callback: (renderer: IMultiNodeRenderer, value?: T, prevValue?: T) => T | void, key?: string): void;
  once(callback: (renderer: IMultiNodeRenderer) => void): void;
  repeat<T>(templateSelector: string, items: T[], update: (renderer: IMultiNodeRenderer, model: T) => void): void;
  ext<T>(extension: (renderer: IMultiNodeRenderer) => T): T;
}

export interface ISingleNodeRenderer extends IBaseRenderer {
  elem: HTMLElement;
  node: Node;
  binding: NodeBinding;
  nodeAs<T extends Node>(): T;
  mount<ComponentT extends ISingleNodeComponent>(
    componentCtor: ComponentConstructor<ComponentT>,
    key?: string): ComponentT;
  mount<ComponentT extends IMultiNodeComponent>(
    componentCtor: ComponentConstructor<ComponentT>,
    key?: string): ComponentT;
  on<T>(value: T, callback: (renderer: ISingleNodeRenderer, value?: T, prevValue?: T) => T | void, key?: string): void;
  once(callback: (renderer: ISingleNodeRenderer) => void): void;
  repeat<T>(templateSelector: string, items: T[], update: (renderer: ISingleNodeRenderer, model: T) => void): void;
  ext<T>(extension: (renderer: ISingleNodeRenderer) => T): T;
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