class DbMonQueryList implements AltComponent<Query[]> {
  root: Renderer;

  constructor(elem, props) {
    this.root = new Renderer(elem);
  }

  template = makeTemplate(`
      @queryComponent
  `);

  update(props: Query[]) {
    let container = this.root.elem.parentElement;
    let pos = this.root.elem;
    this.root.repeatEx("row", this.template, container, pos, props, (query, queryModel) => {
        query.send(queryModel).into("@queryComponent", DbMonQuery)
    });
  }
}
