class DbMonQueryList implements AltComponent {
  root: Renderer;

  initialize(root: Renderer) {
    this.root = root;
  }

  template = makeTemplate(`
      @queryComponent
  `);

  update(quries: Query[]) {
    this.root.component("queries", AltRepeat).repeatEx(quries, this.root.once && {
      template: this.template,
      container: this.root.elem.parentElement,
      insertBefore: this.root.elem,
      update: (query, queryModel) => {
        query.componentOnNode("@queryComponent", DbMonQuery).update(queryModel);
      }
    });
  }
}
