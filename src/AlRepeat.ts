import * as Alina from "./alina";
const undefinedOrNull = Alina.undefinedOrNull;
const definedNotNull = Alina.definedNotNull;

export interface RepeatExtraOptions<T> {
  equals?: (a: T, b: T) => boolean;
}

export interface RepeatItemContext<T> {
  oldModelItem?: T;
  mounted?: boolean;
  renderer?: Alina.Renderer;
}

export interface AlRepeatContext<T> {
  template: HTMLTemplateElement;
  insertBefore: HTMLElement | null;
  container: HTMLElement;
  equals?: (a: T, b: T) => boolean;
  update: (renderer: Alina.Renderer, model: T) => void;
}

export class AlRepeat implements Alina.ISingleNodeComponent {
  itemContexts: RepeatItemContext<any>[] = [];
  renderer: Alina.Renderer;
  context: AlRepeatContext<any>;

  initialize(context: Alina.Renderer) {
    this.renderer = context;
  }

  repeat<T>(items: T[], update: (renderer: Alina.Renderer, model: T) => void, options?: RepeatExtraOptions<T>) {
    if (update) {
      this.context = {
        template: this.renderer.elem as HTMLTemplateElement,
        container: this.renderer.elem.parentElement,
        insertBefore: this.renderer.elem,
        equals: options && options.equals,
        update: update
      };
    }
    this.repeatEx(items, this.context);
  } 

  repeatEx<T>(items: T[], context: AlRepeatContext<T>) {
    if (context) {
      this.context = context;
    }
    let props = this.context;

    // Add new and update existing
    for (let i = 0; i < items.length; i++) {
      let modelItem = items[i];

      // Createcontext
      let itemContext = this.itemContexts[i];
      if (!itemContext || !this.compare(modelItem, itemContext.oldModelItem, props.equals)) {
        itemContext = this.itemContexts[i] = {};
      }

      // Create node
      if (!itemContext.renderer) {
        let node = Alina.fromTemplate(props.template);
        itemContext.renderer = this.renderer.create(node);
      }

      // Fill content
      props.update(itemContext.renderer, modelItem);

      // Insert to parent
      if (!itemContext.mounted) {
        let position = i == 0 ? props.insertBefore : this.itemContexts[i - 1].renderer.node.nextSibling;
        if (position) {
          props.container.insertBefore(itemContext.renderer.node, position);
        } else {
          props.container.appendChild(itemContext.renderer.node);
        }
        itemContext.mounted = true;
      }

      itemContext.oldModelItem = modelItem;
    }

    // Remove old
    let firstIndexToRemove = items.length;
    for (let i = firstIndexToRemove; i < this.itemContexts.length; i++) {
      let elem = this.itemContexts[i].renderer.node;
      if (elem) {
        props.container.removeChild(elem);
      }
    }
    this.itemContexts.splice(firstIndexToRemove,
      this.itemContexts.length - firstIndexToRemove);
  }

  protected compare(a, b, comparer) {
    return (undefinedOrNull(a) && undefinedOrNull(b)) ||
      (definedNotNull(a) && definedNotNull(b) && !comparer) ||
      (definedNotNull(a) && definedNotNull(b) && comparer && comparer(a, b));
  }
}