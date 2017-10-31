import * as Alina from "./alina";

export type Alina = Alina.NodeContext & Alina.StandardExtensions;
export class AlinaComponent extends Alina.Component<Alina> { };
export type FuncAlinaComponent<PropsT, RetT> = Alina.FuncComponent<Alina, PropsT, RetT>;

export var Document = new Alina.NodeContext(document, null).ext(Alina.StandardExt);