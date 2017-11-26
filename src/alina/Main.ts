import * as Alina from "../alina";

export type Alina = Alina.NodeContext;

export class AlinaComponent<ContextT extends Alina.Alina = Alina> 
  extends Alina.Component<ContextT>
{
};

export type FuncAlinaComponent<PropsT, RetT> = Alina.FuncComponent<Alina, PropsT, RetT>;

let rootNode = typeof(document) === 'undefined' ? null : document;
export var Document: Alina.NodeContext = 
  rootNode && new Alina.NodeContext(rootNode, null);
