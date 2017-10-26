class AltShow implements AltMultiComponent {
  root: MultiRenderer;
  lastValue: any;
  nodes: Node[] = [];


  initializeMulti(context: MultiRenderer) {
    this.root = context;
  }

  showIf(value: boolean) {
    if (this.lastValue !== value) {
      for (let i = 0; i < this.root.bindings.length; i++) {
        let templateElem = this.root.bindings[i].node as HTMLTemplateElement;
        let node = this.nodes[i];
        if (value) {
          if (!node) {
            node = this.nodes[i] = fromTemplate(templateElem);
          }
          if (!node.parentElement) {
            templateElem.parentElement.insertBefore(node, templateElem);
          }
        } else {
          if (node && node.parentElement) {
            node.parentElement.removeChild(node);
          }
        }
      }
      this.lastValue = value;
    }
  }
}