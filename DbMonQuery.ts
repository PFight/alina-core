interface Query {
  formatElapsed: number;
  query: string;
  elapsedClassName: string;
}

class DbMonQuery implements AltComponent<Query> {
  root: Renderer;

  constructor(elem, props) {
    let rootElem = replaceFromTempalte(elem, this.template);
    this.root = new Renderer(rootElem);
  }

  template = makeTemplate(`
      <td class="Query @elapsedClass">
        @formatElapsed
        <div class="popover left">
          <div class="popover-content">@query</div>
          <div class="arrow"/>
        </div>
      </td>
  `);

  update(props: Query) {
    this.root.set("@formatElapsed", props.formatElapsed);
    this.root.set("@query", props.query);
    this.root.set("@elapsedClass", props.elapsedClassName);
  }
}