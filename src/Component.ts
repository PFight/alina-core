import * as Alina from "./alina";

export class Component<T extends Alina.NodeContext = Alina.NodeContext> {
  constructor(protected root: T) {
    root.addDisposeListener(() => this.onDispose());
  }

  public init() {
    this.onInit();
  }

  protected onInit() {
  }

  protected onDispose() {
  }
}

export type FuncComponent<ContextT, PropsT, RetT> =
  (root: ContextT, props: PropsT) => RetT;