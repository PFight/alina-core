declare module "Renderer" {
    import * as Alina from "alina";
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
    export class Slot<T, ComponentT> {
        component: ComponentT;
        value: T;
        constructor(component: ComponentT);
        set(val: T): ComponentT;
    }
    export function makeTemplate(str: string): HTMLTemplateElement;
    export function fromTemplate(templateElem: HTMLTemplateElement): Node;
    export function replaceFromTempalte<T extends Node>(elemToReplace: T, templateElem: HTMLTemplateElement): T;
    export function definedNotNull(x: any): boolean;
    export function undefinedOrNull(x: any): boolean;
    export class Renderer implements IMultiNodeRenderer, ISingleNodeRenderer {
        protected context: {
            [key: string]: any;
        };
        protected onLastValue: any;
        protected onceFlag: boolean;
        protected parentRenderer: Renderer;
        protected _bindings: NodeBinding[];
        static Main: Renderer;
        static Create(nodeOrBinding: Node | NodeBinding): ISingleNodeRenderer;
        static CreateMulti(nodesOrBindings: Node[] | NodeBinding[]): IMultiNodeRenderer;
        protected constructor(nodesOrBindings: Node[] | NodeBinding[], parent: Renderer);
        readonly nodes: Node[];
        readonly bindings: NodeBinding[];
        elem: HTMLElement;
        nodeAs<T extends Node>(): T;
        node: Node;
        create(nodeOrBinding: Node | NodeBinding): Renderer;
        createMulti(nodesOrBindings: Node[] | NodeBinding[]): Renderer;
        readonly binding: NodeBinding;
        getContext<T>(key: string, createContext?: () => T): T;
        mount<ComponentT>(componentCtor: ComponentConstructor<ComponentT>, key?: string): ComponentT;
        query(selector: string): Renderer;
        queryAll(selector: string): Renderer;
        getEntries(entry: string): Renderer;
        getEntry(entry: string): Renderer;
        findNode(entry: string): Renderer;
        findNodes(entry: string): Renderer;
        on<T>(value: T, callback: (renderer: Renderer, value?: T, prevValue?: T) => T | void, key?: string): void;
        once(callback: (renderer: Renderer) => void): void;
        set<T>(stub: string, value: T): void;
        repeat<T>(templateSelector: string, items: T[], update: (renderer: Renderer, model: T) => void): void;
        showIf(templateSelector: string, value: boolean): void;
        tpl(key?: string): Alina.AlTemplate;
        ext<T>(createExtension: (renderer: Renderer) => T): T;
        protected querySelectorInternal(selector: string): Element;
        protected querySelectorAllInternal(selector: string): Element[];
        protected fillBindings(node: Node, query: string, bindings: NodeBinding[], single: boolean, queryType?: QueryType): void;
        protected findNodesInternal(node: Node, query: string, bindings: NodeBinding[], single: boolean): void;
        protected getIdlName(attr: Attr, node: Node): string;
        protected getComponentKey(key: string, component: Function): string;
        protected hashCode(str: string): number;
    }
    export var ATTRIBUTE_TO_IDL_MAP: {
        [attributeName: string]: string;
    };
}
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
    export class AlTemplate implements Alina.ISingleNodeComponent {
        root: Alina.ISingleNodeRenderer;
        result: Alina.IMultiNodeRenderer | Alina.ISingleNodeRenderer;
        initialize(context: Alina.ISingleNodeRenderer): void;
        appendChildren<T>(template: HTMLTemplateElement, render: (renderer: Alina.IMultiNodeRenderer) => T | void): T | void;
        appendChild<T>(template: HTMLTemplateElement, render: (renderer: Alina.ISingleNodeRenderer) => T | void): T | void;
        replaceChildren<T>(template: HTMLTemplateElement, render: (renderer: Alina.IMultiNodeRenderer) => T | void): T | void;
        replaceChild<T>(template: HTMLTemplateElement, render: (renderer: Alina.ISingleNodeRenderer) => T | void): T | void;
        protected instantiateTemplate(templateElem: HTMLTemplateElement): Node[];
        protected instantiateTemplateOne(templateElem: HTMLTemplateElement): Node;
    }
}
declare module "alina" {
    export * from "Renderer";
    export * from "AlRepeat";
    export * from "AlSet";
    export * from "AlShow";
    export * from "AlTemplate";
}
