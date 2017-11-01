import * as Alina from "./alina";

export class AlQuery extends Alina.AlinaComponent {

  public query(selector: string): Alina.Alina {
    let context = this.root.getComponentContext(AlQuery, selector, () => ({
      result: this.root.create(this.querySelectorInternal(selector))
    }));
    return context.result;
  }

  public queryAll(selector: string, render: (context: Alina.NodeContext) => void): void {
    let context = this.root.getComponentContext(AlQuery, selector, () => ({
      contexts:
        this.querySelectorAllInternal(selector).map(x => this.root.create({
          node: x,
          queryType: Alina.QueryType.Node,
          query: selector
        } as Alina.NodeBinding)
      )
    }));
    for (let c of context.contexts) {
      render(c);
    }
  }

  protected querySelectorInternal(selector: string) {
    let result: Element;    
    if (this.root.node.nodeType == Node.ELEMENT_NODE || this.root.node.nodeType == Node.DOCUMENT_NODE) {
      let elem = this.root.node as HTMLElement;
      if (elem.matches && elem.matches(selector)) {
        result = elem;
      } else {
        result = elem.querySelector(selector);
      }
    }    
    return result;
  }

  protected querySelectorAllInternal(selector: string) {
    let result: Element[] = [];
    let node = this.root.node;
    if (node.nodeType == Node.ELEMENT_NODE || node.nodeType == Node.DOCUMENT_NODE) {
      let elem = node as HTMLElement;
      if (elem.matches && elem.matches(selector)) {
        result.push(elem);
      }
      result = result.concat(elem.querySelectorAll(selector) as any);
    }    
    return result;
  }
}