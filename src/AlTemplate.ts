import * as Alina from "./alina";

export class AlTemplate implements Alina.ISingleNodeComponent {
  root: Alina.ISingleNodeRenderer;
  result: Alina.IMultiNodeRenderer | Alina.ISingleNodeRenderer;

  initialize(context: Alina.ISingleNodeRenderer) {
    this.root = context;
  }

  appendChildren<T>(template: HTMLTemplateElement, render: (renderer: Alina.IMultiNodeRenderer) => T | void): T | void {
    if (!this.result) {
      this.result = this.root.createMulti(this.instantiateTemplate(template));

      let ret = render(this.result);

      for (let node of this.result.nodes) {
        this.root.elem.appendChild(node);
      }

      return ret;
    } else {
      return render(this.result as Alina.IMultiNodeRenderer);
    }
  }

  appendChild<T>(template: HTMLTemplateElement, render: (renderer: Alina.ISingleNodeRenderer) => T | void): T | void {
    if (!this.result) {
      this.result = this.root.create(this.instantiateTemplateOne(template));

      let ret = render(this.result);

      this.root.elem.appendChild(this.result.node);
      return ret;
    } else {
      return render(this.result as Alina.ISingleNodeRenderer);
    }
  }

  replaceChildren<T>(template: HTMLTemplateElement, render: (renderer: Alina.IMultiNodeRenderer) => T | void): T | void {
    if (!this.result) {
      this.result = this.root.createMulti(this.instantiateTemplate(template));

      let ret = render(this.result);

      let rootElem = this.root.elem;
      rootElem.innerHTML = "";
      for (let node of this.result.nodes) {
        rootElem.appendChild(node);
      }

      return ret;
    } else {
      return render(this.result as Alina.IMultiNodeRenderer);
    }
  }

  replaceChild<T>(template: HTMLTemplateElement, render: (renderer: Alina.ISingleNodeRenderer) => T | void): T | void {
    if (!this.result) {
      this.result = this.root.create(this.instantiateTemplateOne(template));

      let ret = render(this.result);

      this.root.elem.innerHTML = "";
      this.root.elem.appendChild(this.result.node);
      return ret;
    } else {
      return render(this.result as Alina.ISingleNodeRenderer);
    }
  }

  replace<T>(template: HTMLTemplateElement, render: (renderer: Alina.ISingleNodeRenderer) => T | void): T | void {
    if (!this.result) {
      this.result = this.root.create(this.instantiateTemplateOne(template));

      let ret = render(this.result);

      let parent = this.root.elem.parentElement;
      if (parent) {
        parent.replaceChild(this.result.elem, this.root.elem);
      }
      this.root.elem = this.result.elem;
      return ret;
    } else {
      return render(this.result as Alina.ISingleNodeRenderer);
    }
  }


  protected instantiateTemplate(templateElem: HTMLTemplateElement): Node[] {
    return templateElem.content ?
      [].map.apply(templateElem.content.children, (node) => node.cloneNode(true))
      :
      [].map.apply(templateElem.children, (node) => node.cloneNode(true))
  }

  protected instantiateTemplateOne(templateElem: HTMLTemplateElement): Node {
    return Alina.fromTemplate(templateElem);
  }
}