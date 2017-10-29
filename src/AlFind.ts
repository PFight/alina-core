import * as Alina from "./alina";

export class AlFind implements Alina.IMultiNodeComponent {
  root: Alina.IMultiNodeRenderer;

  initialize(context: Alina.IMultiNodeRenderer) {
    this.root = context;
  }

  public findNode(entry: string): Alina.ISingleNodeRenderer {
    let context = this.root.getContext(entry, () => {
      let bindings: Alina.NodeBinding[] = [];
      this.root.bindings.forEach(x => this.findNodesInternal(x.node, entry, bindings, true));
      return { renderer: this.root.create(bindings[0]) };
    });
    return context.renderer;
  }

  public findNodes(entry: string): Alina.IMultiNodeRenderer {
    let context = this.root.getContext(entry, () => {
      let bindings: Alina.NodeBinding[] = [];
      this.root.bindings.forEach(x => this.findNodesInternal(x.node, entry, bindings, false));
      return { renderer: this.root.createMulti(bindings) };
    });
    return context.renderer;
  }

  protected findNodesInternal(node: Node, query: string, bindings: Alina.NodeBinding[], single: boolean) {
    let found = false;
    if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
      if (node.textContent.indexOf(query) >= 0) {
        bindings.push({
          node: node,
          query: query,
          queryType: Alina.QueryType.Node
        });
        found = true;
      }
    }

    if (!found && node.attributes) {
      for (let i = 0; i < node.attributes.length && !found; i++) {
        let attr = node.attributes[i];
        if (attr.name.indexOf(query) >= 0 || attr.value.indexOf(query) >= 0) {
          bindings.push({
            node: node,
            query: query,
            attributeName: attr.name,
            idlName: Alina.getIdlName(attr, node),
            queryType: Alina.QueryType.Node
          });
        }
      }
    }

    for (let i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
      this.findNodesInternal(node.childNodes[i], query, bindings, single);
    }
  }
}