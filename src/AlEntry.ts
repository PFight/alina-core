import * as Alina from "./alina";

export class AlEntry extends Alina.AlinaComponent {

  public getEntries(entry: string, render: (context: Alina.Alina) => void): void {
    let context = this.root.getContext(entry, () => {
      let bindings: Alina.NodeBinding[] = [];
      this.getEntiresInternal(this.root.node, entry, bindings, false);
      return { contexts: bindings.map(x => this.root.create(x)) };
    });
    for (let c of context.contexts) {
      render(c);
    }
  }

  public getEntry(entry: string): Alina.Alina {
    let context = this.root.getContext(entry, () => {
      let bindings: Alina.NodeBinding[] = [];
      this.getEntiresInternal(this.root.node, entry, bindings, true);
      return { nodeContext: this.root.create(bindings[0]) };
    });
    return context.nodeContext;
  }

  protected getEntiresInternal(
    node: Node, query: string, bindings: Alina.NodeBinding[],
    single: boolean, queryType?: Alina.QueryType)
  {
    if (queryType === undefined || queryType == Alina.QueryType.NodeTextContent) {
      if (node.nodeType == Node.TEXT_NODE || node.nodeType == Node.COMMENT_NODE) {
        let parts = node.textContent.split(query);
        if (parts.length > 1) {
          // Split content, to make stub separate node 
          // and save this node to context.stubNodes
          let nodeParent = node.parentNode;
          for (let i = 0; i < parts.length - 1; i++) {
            let part = parts[i];
            if (part.length > 0) {
              nodeParent.insertBefore(document.createTextNode(part), node);
            }
            let stubNode = document.createTextNode(query);
            if (!single || bindings.length == 0) {
              bindings.push({
                node: stubNode,
                queryType: Alina.QueryType.NodeTextContent,
                query: query
              });
            }
            nodeParent.insertBefore(stubNode, node);
          }
          let lastPart = parts[parts.length - 1];
          if (lastPart && lastPart.length > 0) {
            nodeParent.insertBefore(document.createTextNode(lastPart), node);
          }
          nodeParent.removeChild(node);
        }
      }
    }
    if ((queryType === undefined || queryType == Alina.QueryType.NodeAttribute) && node.attributes) {
      for (let i = 0; i < node.attributes.length && (!single || bindings.length == 0); i++) {
        let attr = node.attributes[i];
        if (attr.value && attr.value.indexOf(query) >= 0) {
          bindings.push({
            node: node,
            query: query,
            attributeName: attr.name,
            idlName: Alina.getIdlName(attr, node),
            queryType: Alina.QueryType.NodeAttribute
          });
        }
      }
    }

    for (let i = 0; i < node.childNodes.length && (!single || bindings.length == 0); i++) {
      let lengthBefore = node.childNodes.length;
      this.getEntiresInternal(node.childNodes[i], query, bindings, single, queryType);
      let lengthAfter = node.childNodes.length;
      // Node can be replaced by several other nodes
      if (lengthAfter > lengthBefore) {
        i += lengthAfter - lengthBefore;
      }
    }
  }


}