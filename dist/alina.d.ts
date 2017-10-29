declare module "AlRepeat" {
    import * as Alina from "alina";
    export interface RepeatExtraOptions<T> {
        equals?: (a: T, b: T) => boolean;
    }
    export interface RepeatItemContext<T> {
        oldModelItem?: T;
        mounted?: boolean;
        renderer?: Alina.Renderer;
    }
    export interface AlRepeatContext<T> {
        template: HTMLTemplateElement;
        insertBefore: HTMLElement | null;
        container: HTMLElement;
        equals?: (a: T, b: T) => boolean;
        update: (renderer: Alina.Renderer, model: T) => void;
    }
    export class AlRepeat implements Alina.ISingleNodeComponent {
        itemContexts: RepeatItemContext<any>[];
        renderer: Alina.Renderer;
        context: AlRepeatContext<any>;
        initialize(context: Alina.Renderer): void;
        repeat<T>(items: T[], update: (renderer: Alina.Renderer, model: T) => void, options?: RepeatExtraOptions<T>): void;
        repeatEx<T>(items: T[], context: AlRepeatContext<T>): void;
        protected compare(a: any, b: any, comparer: any): any;
    }
}
declare module "AlSet" {
    import * as Alina from "alina";
    export class AlSet implements Alina.IMultiNodeComponent {
        root: Alina.IMultiNodeRenderer;
        lastValue: any;
        initialize(context: Alina.IMultiNodeRenderer): void;
        set(value: any): void;
        reset(value: any): void;
    }
}
declare module "AlShow" {
    import * as Alina from "alina";
    export class AlShow implements Alina.IMultiNodeComponent {
        root: Alina.IMultiNodeRenderer;
        lastValue: any;
        nodes: Node[];
        initialize(context: Alina.IMultiNodeRenderer): void;
        showIf(value: boolean): void;
    }
}
declare module "AlTemplate" {
    import * as Alina from "alina";
    export class AlTemplate implements Alina.ISingleNodeComponent, Alina.ITemplateProcessor {
        root: Alina.ISingleNodeRenderer;
        result: Alina.IMultiNodeRenderer | Alina.ISingleNodeRenderer;
        initialize(context: Alina.ISingleNodeRenderer): void;
        appendChildren<T>(template: HTMLTemplateElement, render: (renderer: Alina.IMultiNodeRenderer) => T | void): T | void;
        appendChild<T>(template: HTMLTemplateElement, render: (renderer: Alina.ISingleNodeRenderer) => T | void): T | void;
        replaceChildren<T>(template: HTMLTemplateElement, render: (renderer: Alina.IMultiNodeRenderer) => T | void): T | void;
        replaceChild<T>(template: HTMLTemplateElement, render: (renderer: Alina.ISingleNodeRenderer) => T | void): T | void;
        replace<T>(template: HTMLTemplateElement, render: (renderer: Alina.ISingleNodeRenderer) => T | void): T | void;
        protected instantiateTemplate(templateElem: HTMLTemplateElement): Node[];
        protected instantiateTemplateOne(templateElem: HTMLTemplateElement): Node;
    }
}
declare module "AlQuery" {
    import * as Alina from "alina";
    export class AlQuery implements Alina.IMultiNodeComponent {
        root: Alina.IMultiNodeRenderer;
        initialize(context: Alina.IMultiNodeRenderer): void;
        query(selector: string): Alina.ISingleNodeRenderer;
        queryAll(selector: string): Alina.IMultiNodeRenderer;
        protected querySelectorInternal(selector: string): Element;
        protected querySelectorAllInternal(selector: string): Element[];
    }
}
declare module "AlFind" {
    import * as Alina from "alina";
    export class AlFind implements Alina.IMultiNodeComponent {
        root: Alina.IMultiNodeRenderer;
        initialize(context: Alina.IMultiNodeRenderer): void;
        findNode(entry: string): Alina.ISingleNodeRenderer;
        findNodes(entry: string): Alina.IMultiNodeRenderer;
        protected findNodesInternal(node: Node, query: string, bindings: Alina.NodeBinding[], single: boolean): void;
    }
}
declare module "Interfaces" {
    export interface ISingleNodeComponent {
        initialize(context: ISingleNodeRenderer): void;
    }
    export interface IMultiNodeComponent {
        initialize(context: IMultiNodeRenderer): void;
    }
    export interface ComponentConstructor<ComponentT> {
        new (): ComponentT;
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
        tpl(key?: string): ITemplateProcessor;
    }
    export interface IMultiNodeRenderer extends IBaseRenderer {
        nodes: Node[];
        bindings: NodeBinding[];
        mount<ComponentT extends IMultiNodeComponent>(componentCtor: ComponentConstructor<ComponentT>, key?: string): ComponentT;
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
        mount<ComponentT extends ISingleNodeComponent>(componentCtor: ComponentConstructor<ComponentT>, key?: string): ComponentT;
        mount<ComponentT extends IMultiNodeComponent>(componentCtor: ComponentConstructor<ComponentT>, key?: string): ComponentT;
        on<T>(value: T, callback: (renderer: ISingleNodeRenderer, value?: T, prevValue?: T) => T | void, key?: string): void;
        once(callback: (renderer: ISingleNodeRenderer) => void): void;
        repeat<T>(templateSelector: string, items: T[], update: (renderer: ISingleNodeRenderer, model: T) => void): void;
        ext<T>(extension: (renderer: ISingleNodeRenderer) => T): T;
    }
    export interface ITemplateProcessor {
        appendChildren<T>(template: HTMLTemplateElement, render: (renderer: IMultiNodeRenderer) => T | void): T | void;
        appendChild<T>(template: HTMLTemplateElement, render: (renderer: ISingleNodeRenderer) => T | void): T | void;
        replaceChildren<T>(template: HTMLTemplateElement, render: (renderer: IMultiNodeRenderer) => T | void): T | void;
        replaceChild<T>(template: HTMLTemplateElement, render: (renderer: ISingleNodeRenderer) => T | void): T | void;
        replace<T>(template: HTMLTemplateElement, render: (renderer: ISingleNodeRenderer) => T | void): T | void;
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
declare module "Utils" {
    export function makeTemplate(str: string): HTMLTemplateElement;
    export function fromTemplate(templateElem: HTMLTemplateElement): Node;
    export function definedNotNull(x: any): boolean;
    export function undefinedOrNull(x: any): boolean;
    export function getIdlName(attr: Attr, node: Node): string;
    export var ATTRIBUTE_TO_IDL_MAP: {
        [attributeName: string]: string;
    };
}
declare module "Slot" {
    export class Slot<T, ComponentT> {
        component: ComponentT;
        value: T;
        constructor(component: ComponentT);
        set(val: T): ComponentT;
    }
}
declare module "Renderer" {
    import * as Alina from "alina";
    export class Renderer implements Alina.IMultiNodeRenderer, Alina.ISingleNodeRenderer {
        protected context: {
            [key: string]: any;
        };
        protected onLastValue: any;
        protected onceFlag: boolean;
        protected parentRenderer: Renderer;
        protected _bindings: Alina.NodeBinding[];
        protected getSetComponent(): Alina.ComponentConstructor<Alina.AlSet>;
        protected getRepeatComponent(): Alina.ComponentConstructor<Alina.AlRepeat>;
        protected getTemplateComponent(): Alina.ComponentConstructor<Alina.AlTemplate>;
        protected getQueryComponent(): Alina.ComponentConstructor<Alina.AlQuery>;
        protected getFindComponent(): Alina.ComponentConstructor<Alina.AlFind>;
        protected getEntryComponent(): Alina.ComponentConstructor<Alina.AlEntry>;
        protected getShowComponent(): Alina.ComponentConstructor<Alina.AlShow>;
        static Main: Renderer;
        static Create(nodeOrBinding: Node | Alina.NodeBinding): Alina.ISingleNodeRenderer;
        static CreateMulti(nodesOrBindings: Node[] | Alina.NodeBinding[]): Alina.IMultiNodeRenderer;
        protected constructor(nodesOrBindings: Node[] | Alina.NodeBinding[], parent: Renderer);
        readonly nodes: Node[];
        bindings: Alina.NodeBinding[];
        elem: HTMLElement;
        nodeAs<T extends Node>(): T;
        node: Node;
        create(nodeOrBinding: Node | Alina.NodeBinding): Renderer;
        createMulti(nodesOrBindings: Node[] | Alina.NodeBinding[]): Renderer;
        readonly binding: Alina.NodeBinding;
        readonly parent: Alina.IBaseRenderer;
        getContext<T>(key: string, createContext?: () => T): T;
        on<T>(value: T, callback: (renderer: Renderer, value?: T, prevValue?: T) => T | void, key?: string): void;
        once(callback: (renderer: Renderer) => void): void;
        ext<T>(createExtension: (renderer: Renderer) => T): T;
        mount<ComponentT>(componentCtor: Alina.ComponentConstructor<ComponentT>, key?: string): ComponentT;
        query(selector: string): Alina.ISingleNodeRenderer;
        queryAll(selector: string): Alina.IMultiNodeRenderer;
        getEntries(entry: string): Alina.IMultiNodeRenderer;
        getEntry(entry: string): Alina.ISingleNodeRenderer;
        findNode(entry: string): Alina.ISingleNodeRenderer;
        findNodes(entry: string): Alina.IMultiNodeRenderer;
        set<T>(stub: string, value: T): void;
        repeat<T>(templateSelector: string, items: T[], update: (renderer: Renderer, model: T) => void): void;
        showIf(templateSelector: string, value: boolean): void;
        tpl(key?: string): Alina.ITemplateProcessor;
        protected init(nodesOrBindings: Node[] | Alina.NodeBinding[], parent: Renderer): void;
        protected getNode(): Node;
        protected setNode(node: Node): void;
        protected getComponentKey(key: string, component: Function): string;
    }
}
declare module "alina" {
    export * from "AlRepeat";
    export * from "AlSet";
    export * from "AlShow";
    export * from "AlTemplate";
    export * from "AlQuery";
    export * from "AlEntry";
    export * from "AlFind";
    export * from "Interfaces";
    export * from "Utils";
    export * from "Slot";
    export * from "Renderer";
}
declare module "AlEntry" {
    import * as Alina from "alina";
    export class AlEntry implements Alina.IMultiNodeComponent {
        root: Alina.IMultiNodeRenderer;
        initialize(context: Alina.IMultiNodeRenderer): void;
        getEntries(entry: string): Alina.IMultiNodeRenderer;
        getEntry(entry: string): Alina.ISingleNodeRenderer;
        protected getEntiresInternal(node: Node, query: string, bindings: Alina.NodeBinding[], single: boolean, queryType?: Alina.QueryType): void;
    }
}
