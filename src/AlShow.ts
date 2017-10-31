import * as Alina from "./alina";

export class AlShow extends Alina.AlinaComponent {
  lastValue: any;
  node: Node;

  showIf(value: boolean) {
    if (this.lastValue !== value) {
      let templateElem = this.root.nodeAs<HTMLTemplateElement>();
      let node = this.node;
      if (value) {
        if (!node) {
          node = this.node = Alina.fromTemplate(templateElem);
        }
        if (!node.parentElement) {
          templateElem.parentElement.insertBefore(node, templateElem);
        }
      } else {
        if (node && node.parentElement) {
          node.parentElement.removeChild(node);
        }
      }
      this.lastValue = value;
    }
  }
}