class DbMonQueryList implements ISingleNodeComponent {
  root: ISingleNodeRenderer;

  initialize(root: ISingleNodeRenderer) {
    this.root = root;
  }

  template = makeTemplate(`
      @queryComponent
  `);

  update(quries: Query[]) {
    this.root.mount(AltRepeat).repeatEx(quries, {
      template: this.template,
      container: this.root.elem.parentElement,
      insertBefore: this.root.elem,
      update: (query, queryModel) => {
        query.findNode("@queryComponent").mount(DbMonQuery).update(queryModel);
      }
    });
  }
}
