declare module "alina-core/Utils" {
    export function makeTemplate(str: string): HTMLTemplateElement;
    export function fromTemplate(templateElem: HTMLTemplateElement): Node;
    export function definedNotNull(x: any): boolean;
    export function undefinedOrNull(x: any): boolean;
    export function getIdlName(attr: Attr, node: Node): string;
    export var ATTRIBUTE_TO_IDL_MAP: {
        [attributeName: string]: string;
    };
    export interface ComponentCtor<ComponentT, ContextT, DepsT> {
        new (context: ContextT, deps?: DepsT): ComponentT;
    }
    export function defaultEmptyFunc(target: Object, propertyKey: string | symbol): void;
}
declare module "alina-core/NodeContext" {
    import * as Alina from "alina-core";
    export class NodeContext {
        protected componentsContext: {
            [key: string]: any;
        };
        protected _parent: NodeContext;
        protected _binding: Alina.NodeBinding;
        protected extensions: {
            [key: string]: (renderer: Alina.NodeContext) => Alina.NodeContext;
        };
        protected children: NodeContext[];
        protected disposeListeners: ((context: Alina.NodeContext) => void)[];
        constructor(nodeOrBinding: Node | Alina.NodeBinding, parent: NodeContext);
        elem: HTMLElement;
        nodeAs<T extends Node>(): T;
        node: Node;
        create(nodeOrBinding: Node | Alina.NodeBinding): this;
        readonly binding: Alina.NodeBinding;
        readonly parent: NodeContext;
        getComponentContext<T>(component: Function, additionalKey: string, createContext?: () => T): T;
        clearComponentContext(component: Function, additionalKey: string): void;
        ext<T extends Alina.NodeContext>(extension: (renderer: this) => T): T;
        mount<ComponentT extends Alina.Component<ContextT>, ContextT extends NodeContext, ServicesT>(this: ContextT, componentCtor: Alina.ComponentCtor<ComponentT, ContextT, ServicesT>, services?: ServicesT, key?: string): ComponentT;
        call<PropsT, RetT>(this: this, component: Alina.FuncComponent<this, PropsT, RetT>, props: PropsT, key?: string): RetT;
        unmount<ComponentT extends Function>(component: ComponentT, key?: string): void;
        unmountAll(): void;
        addDisposeListener(callback: (context: this) => void): void;
        removeDisposeListener(callback: (context: this) => void): void;
        dispose(): void;
        protected getComponentKey(key: string, component: Function): string;
        protected init(nodeOrBinding: Node | Alina.NodeBinding, parent: NodeContext): void;
        protected getNode(): Node;
        protected setNode(node: Node): void;
    }
    export enum QueryType {
        Node = 1,
        NodeAttribute = 2,
        NodeTextContent = 3,
    }
    export interface NodeBinding {
        node: Node;
        queryType: QueryType;
        query?: string;
        attributeName?: string;
        idlName?: string;
    }
}
declare module "alina-core/Component" {
    import * as Alina from "alina-core";
    export class Component<T extends Alina.NodeContext = Alina.NodeContext> {
        protected root: T;
        constructor(root: T);
        set(props?: Partial<this>): this;
        init(): void;
        protected makeTemplate(str: string): HTMLTemplateElement;
        protected onInit(): void;
        protected onDispose(): void;
    }
    export type FuncComponent<ContextT, PropsT, RetT> = (root: ContextT, props: PropsT) => RetT;
}
declare module "alina-core/Main" {
    import * as Alina from "alina-core";
    export type Alina = Alina.NodeContext;
    export class AlinaComponent<ContextT extends Alina.Alina = Alina> extends Alina.Component<ContextT> {
    }
    export type FuncAlinaComponent<PropsT, RetT> = Alina.FuncComponent<Alina, PropsT, RetT>;
    export var Document: Alina.NodeContext;
}
declare module "alina-core" {
    export * from "alina-core/Utils";
    export * from "alina-core/NodeContext";
    export * from "alina-core/Component";
    export * from "alina-core/Main";
}
