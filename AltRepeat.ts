interface RepeatExtraOptions<T> {
  equals?: (a: T, b: T) => boolean;
}

interface RepeatItemContext<T> {
  oldModelItem?: T;
  node?: Node;
  mounted?: boolean;
  renderer?: Renderer;
}

interface AltRepeatContext<T> {
  template: HTMLTemplateElement;
  insertBefore: HTMLElement | null;
  container: HTMLElement;
  equals?: (a: T, b: T) => boolean;
  update: (renderer: Renderer, model: T) => void;
}

class AltRepeat implements AltComponent {
  itemContexts: RepeatItemContext<any>[] = [];
  renderer: Renderer;
  context: AltRepeatContext<any>;

  initialize(context: Renderer) {
    this.renderer = context;
  }

  repeat<T>(items: T[], update: (renderer: Renderer, model: T) => void, options?: RepeatExtraOptions<T>) {
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

  repeatEx<T>(items: T[], context: AltRepeatContext<T>) {
    if (context) {
      this.context = context;
    }
    let props = this.context;

    // Add new and update existing
    for (let i = 0; i < items.length; i++) {
      let modelItem = items[i];

      // Createcontext
      let itemContext = this.itemContexts[i];
      if (!itemContext || !compare(modelItem, itemContext.oldModelItem, props.equals)) {
        itemContext = this.itemContexts[i] = {};
      }

      // Create node
      if (!itemContext.node) {
        itemContext.node = instantiateTemplate(props.template);
        itemContext.renderer = new Renderer([{ node: itemContext.node, queryType: QueryType.Node }]);
      }

      // Insert to parent
      if (!itemContext.mounted) {
        let position = i == 0 ? props.insertBefore : this.itemContexts[i - 1].node.nextSibling;
        if (position) {
          props.container.insertBefore(itemContext.node, position);
        } else {
          props.container.appendChild(itemContext.node);
        }
        itemContext.mounted = true;
      }

      // Fill content
      props.update(itemContext.renderer, modelItem);

      itemContext.oldModelItem = modelItem;
    }

    // Remove old
    let firstIndexToRemove = items.length;
    for (let i = firstIndexToRemove; i < this.itemContexts.length; i++) {
      let elem = this.itemContexts[i].node;
      if (elem) {
        props.container.removeChild(elem);
      }
    }
    this.itemContexts.splice(firstIndexToRemove,
      this.itemContexts.length - firstIndexToRemove);
  }
}