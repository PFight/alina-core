import * as Alina from "../alina-core";

export class Component<T extends Alina.NodeContext = Alina.NodeContext> {
  constructor(protected root: T) {
    root.addDisposeListener(() => this.onDispose());
  }

  public set(props?: Partial<this>): this {
    for (let key in props) {
      this[key] = props[key];
    }
    return this;
  }

  public init() {
    this.onInit();
  }

  protected makeTemplate(str: string): HTMLTemplateElement {
    return Alina.makeTemplate(str);
  }

  protected onInit() {
  }

  protected onDispose() {
  }
}

export type FuncComponent<ContextT, PropsT, RetT> =
  (root: ContextT, props: PropsT) => RetT;