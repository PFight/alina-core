import * as Alina from "./alina";

export class AlQuery implements Alina.IMultiNodeComponent {
  root: Alina.IMultiNodeRenderer;

  initialize(context: Alina.IMultiNodeRenderer) {
    this.root = context;
  }

  public query(selector: string): Alina.ISingleNodeRenderer {
    let context = this.root.getContext(selector, () => ({
      result: this.root.create(this.querySelectorInternal(selector))
    }));
    return context.result;
  }

  public queryAll(selector: string): Alina.IMultiNodeRenderer {
    let context = this.root.getContext(selector, () => ({
      result: this.root.createMulti(
        this.querySelectorAllInternal(selector).map(x => ({
          node: x,
          queryType: Alina.QueryType.Node,
          query: selector
        } as Alina.NodeBinding))
      )
    }));
    return context.result;
  }

  protected querySelectorInternal(selector: string) {
    let result: Element;
    for (let i = 0; i < this.root.bindings.length && !result; i++) {
      let node = this.root.bindings[i].node;
      if (node.nodeType == Node.ELEMENT_NODE) {
        let elem = node as HTMLElement;
        if (elem.matches(selector)) {
          result = elem;
        } else {
          result = elem.querySelector(selector);
        }
      }
    }
    return result;
  }

  protected querySelectorAllInternal(selector: string) {
    let result: Element[] = [];
    for (let i = 0; i < this.root.bindings.length && !result; i++) {
      let node = this.root.bindings[i].node;
      if (node.nodeType == Node.ELEMENT_NODE) {
        let elem = node as HTMLElement;
        if (elem.matches(selector)) {
          result.push(elem);
        }
        result = result.concat(elem.querySelectorAll(selector) as any);
      }
    }
    return result;
  }
}