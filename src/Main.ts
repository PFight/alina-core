import * as Alina from "./alina";

export type Alina = Alina.NodeContext & Alina.StandardExtensions;

export class AlinaComponent<ContextT extends Alina.Alina = Alina>
  extends Alina.Component<ContextT> implements Alina.ITemplateProcessor<ContextT>
{
  addChild(template: HTMLTemplateElement, render?: (renderer: ContextT) => void): void {
    this.root.tpl().addChild(template, render);
  }
  setChild(template: HTMLTemplateElement, render?: (renderer: ContextT) => void): void {
    this.root.tpl().setChild(template, render);
  }
  replace(template: HTMLTemplateElement, render?: (renderer: ContextT) => void): void {
    this.root.tpl().replace(template, render);
  }
};

export type FuncAlinaComponent<PropsT, RetT> = Alina.FuncComponent<Alina, PropsT, RetT>;

let rootNode = typeof(document) === 'undefined' ? null : document;
export var Document = rootNode && new Alina.NodeContext(rootNode, null).ext(Alina.StandardExt);
