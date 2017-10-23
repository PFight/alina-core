class DbMonQueryList implements AlterNativeComponent<Query[]> {
  root: Renderer;
  container: HTMLElement;
  insertBefore: HTMLElement | null;

  constructor(elem, props) {
    // elem is a stub. Replace it with our elements.
    let prev = elem.previousSibling;
    this.container = elem.parentElement;
    this.container.removeChild(elem);
    this.insertBefore = prev ? prev.nextSibling : null;
  }

  template = makeTemplate(`
      <template>
          <td is="db-mon-query"></td>
      </template>                
  `);

  update(props: Query[]) {
    this.root.repeatEx("row", this.template, this.container,
      this.insertBefore, props, (query, queryModel) => {
        query.mount("td[is='db-mon-query']", DbMonQuery, queryModel)
    });
  }
}
