import * as Alina from "./alina";

export class Component<T extends Alina.NodeContext = Alina.NodeContext> {
  constructor(protected root: T) {
  }
}

export type FuncComponent<ContextT, PropsT, RetT> =
  (root: ContextT, props: PropsT) => RetT;