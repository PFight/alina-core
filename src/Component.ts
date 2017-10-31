import * as Alina from "./alina";

export class Component<T extends Alina.NodeContext = Alina.NodeContext> {
  root: T;

  initialize(context: T) {
    this.root = context;
  }
}

export type FuncComponent<ContextT, PropsT, RetT> =
  (root: ContextT, props: PropsT) => RetT;