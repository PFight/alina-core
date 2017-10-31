declare module "Utils" {
    export function makeTemplate(str: string): HTMLTemplateElement;
    export function fromTemplate(templateElem: HTMLTemplateElement): Node;
    export function definedNotNull(x: any): boolean;
    export function undefinedOrNull(x: any): boolean;
    export function getIdlName(attr: Attr, node: Node): string;
    export var ATTRIBUTE_TO_IDL_MAP: {
        [attributeName: string]: string;
    };
    export interface Ctor<ComponentT> {
        new (): ComponentT;
    }
}
declare module "NodeContext" {
    import * as Alina from "alina";
    export class NodeContext {
        protected context: {
            [key: string]: any;
        };
        protected parentRenderer: NodeContext;
        protected _binding: Alina.NodeBinding;
        protected extensions: ((renderer: Alina.NodeContext) => Alina.NodeContext)[];
        constructor(nodeOrBinding: Node | Alina.NodeBinding, parent: NodeContext);
        elem: HTMLElement;
        nodeAs<T extends Node>(): T;
        node: Node;
        create(nodeOrBinding: Node | Alina.NodeBinding): this;
        readonly binding: Alina.NodeBinding;
        readonly parent: NodeContext;
        getContext<T>(key: string, createContext?: () => T): T;
        ext<T>(createExtension: (renderer: this) => T): T;
        mount<ComponentT extends Alina.Component<this>>(this: this, componentCtor: Alina.Ctor<ComponentT>, key?: string): ComponentT;
        call<PropsT, RetT>(this: this, component: Alina.FuncComponent<this, PropsT, RetT>, props: PropsT, key?: string): RetT;
        getKey(key: string, component: Function): string;
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
declare module "Component" {
    import * as Alina from "alina";
    export class Component<T extends Alina.NodeContext = Alina.NodeContext> {
        root: T;
        initialize(context: T): void;
    }
    export type FuncComponent<ContextT, PropsT, RetT> = (root: ContextT, props: PropsT) => RetT;
}
declare module "Main" {
    import * as Alina from "alina";
    export type Alina = Alina.NodeContext & Alina.StandardExtensions;
    export class AlinaComponent extends Alina.Component<Alina> {
    }
    export type FuncAlinaComponent<PropsT, RetT> = Alina.FuncComponent<Alina, PropsT, RetT>;
    export var Document: Alina;
}
declare module "AlRepeat" {
    import * as Alina from "alina";
    export interface RepeatExtraOptions<T> {
        equals?: (a: T, b: T) => boolean;
    }
    export interface RepeatItemContext<T> {
        oldModelItem?: T;
        mounted?: boolean;
        renderer?: Alina.Alina;
    }
    export interface AlRepeatContext<T> {
        template: HTMLTemplateElement;
        insertBefore: HTMLElement | null;
        container: HTMLElement;
        equals?: (a: T, b: T) => boolean;
        update: (renderer: Alina.Alina, model: T) => void;
    }
    export class AlRepeat extends Alina.AlinaComponent {
        itemContexts: RepeatItemContext<any>[];
        context: AlRepeatContext<any>;
        repeat<T>(items: T[], update: (renderer: Alina.Alina, model: T) => void, options?: RepeatExtraOptions<T>): void;
        repeatEx<T>(items: T[], context: AlRepeatContext<T>): void;
        protected compare(a: any, b: any, comparer: any): any;
    }
}
declare module "AlSet" {
    import * as Alina from "alina";
    export class AlSet extends Alina.AlinaComponent {
        lastValue: any;
        set(value: any): void;
    }
}
declare module "AlShow" {
    import * as Alina from "alina";
    export class AlShow extends Alina.AlinaComponent {
        lastValue: any;
        node: Node;
        showIf(value: boolean): void;
    }
}
declare module "AlTemplate" {
    import * as Alina from "alina";
    export class AlTemplate extends Alina.AlinaComponent implements Alina.ITemplateProcessor<Alina.Alina> {
        result: Alina.Alina;
        addChild<T>(template: HTMLTemplateElement, render: (renderer: Alina.Alina) => T | void): T | void;
        setChild<T>(template: HTMLTemplateElement, render: (renderer: Alina.Alina) => T | void): T | void;
        replace<T>(template: HTMLTemplateElement, render: (renderer: Alina.Alina) => T | void): T | void;
        protected instantiateTemplateOne(templateElem: HTMLTemplateElement): Node;
    }
}
declare module "AlQuery" {
    import * as Alina from "alina";
    export class AlQuery extends Alina.AlinaComponent {
        query(selector: string): Alina.Alina;
        queryAll(selector: string, render: (context: Alina.NodeContext) => void): void;
        protected querySelectorInternal(selector: string): Element;
        protected querySelectorAllInternal(selector: string): Element[];
    }
}
declare module "AlFind" {
    import * as Alina from "alina";
    export class AlFind extends Alina.AlinaComponent {
        findNode(entry: string): Alina.Alina;
        findNodes(entry: string, render: (context: Alina.NodeContext) => void): void;
        protected findNodesInternal(node: Node, query: string, bindings: Alina.NodeBinding[], single: boolean): void;
    }
}
declare module "Slot" {
    export class Slot<T, ComponentT> {
        component: ComponentT;
        value: T;
        constructor(component: ComponentT);
        set(val: T): ComponentT;
    }
}
declare module "StandardExtensions" {
    import * as Alina from "alina";
    export interface StandardExtensions {
        query(selector: string): this;
        queryAll(selector: string, render: (context: this) => void): void;
        getEntry(entry: string): this;
        getEntries(entry: string, render: (context: this) => void): void;
        findNode(entry: string): this;
        findNodes(entry: string, render: (context: this) => void): void;
        set<T>(stub: string, value: T): void;
        showIf(templateSelector: string, value: boolean): void;
        tpl(key?: string): ITemplateProcessor<this>;
        repeat<T>(templateSelector: string, items: T[], update: (renderer: this, model: T) => void): void;
        on<T>(value: T, callback: (renderer: this, value?: T, prevValue?: T) => T | void, key?: string): void;
        once(callback: (renderer: this) => void): void;
    }
    export interface ITemplateProcessor<ContextT> {
        addChild<T>(template: HTMLTemplateElement, render: (renderer: ContextT) => T | void): T | void;
        setChild<T>(template: HTMLTemplateElement, render: (renderer: ContextT) => T | void): T | void;
        replace<T>(template: HTMLTemplateElement, render: (renderer: ContextT) => T | void): T | void;
    }
    export function StandardExt<T extends Alina.NodeContext>(renderer: T): T & StandardExtensions;
}
declare module "alina" {
    export * from "Utils";
    export * from "NodeContext";
    export * from "Component";
    export * from "Main";
    export * from "AlRepeat";
    export * from "AlSet";
    export * from "AlShow";
    export * from "AlTemplate";
    export * from "AlQuery";
    export * from "AlEntry";
    export * from "AlFind";
    export * from "Slot";
    export * from "StandardExtensions";
}
declare module "AlEntry" {
    import * as Alina from "alina";
    export class AlEntry extends Alina.AlinaComponent {
        getEntries(entry: string, render: (context: Alina.Alina) => void): void;
        getEntry(entry: string): Alina.Alina;
        protected getEntiresInternal(node: Node, query: string, bindings: Alina.NodeBinding[], single: boolean, queryType?: Alina.QueryType): void;
    }
}
