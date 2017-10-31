import * as Alina from "./alina";

export class AlTemplate extends Alina.AlinaComponent implements Alina.ITemplateProcessor<Alina.Alina> {
  result: Alina.Alina;

  addChild<T>(template: HTMLTemplateElement, render: (renderer: Alina.Alina) => T | void): T | void {
    if (!this.result) {
      this.result = this.root.create(this.instantiateTemplateOne(template));

      let ret = render(this.result);

      this.root.elem.appendChild(this.result.node);
      return ret;
    } else {
      return render(this.result);
    }
  }


  setChild<T>(template: HTMLTemplateElement, render: (renderer: Alina.Alina) => T | void): T | void {
    if (!this.result) {
      this.result = this.root.create(this.instantiateTemplateOne(template));

      let ret = render(this.result);

      this.root.elem.innerHTML = "";
      this.root.elem.appendChild(this.result.node);
      return ret;
    } else {
      return render(this.result);
    }
  }

  replace<T>(template: HTMLTemplateElement, render: (renderer: Alina.Alina) => T | void): T | void {
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
      return render(this.result as Alina.Alina);
    }
  }

  //protected instantiateTemplate(templateElem: HTMLTemplateElement): Node[] {
  //  return templateElem.content ?
  //    [].map.call(templateElem.content.children, (node) => node.cloneNode(true))
  //    :
  //    [].map.call(templateElem.children, (node) => node.cloneNode(true))
  //}

  protected instantiateTemplateOne(templateElem: HTMLTemplateElement): Node {
    return Alina.fromTemplate(templateElem);
  }
}