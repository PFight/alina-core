interface Query {
  formatElapsed: number;
  query: string;
  elapsedClassName: string;
}

class DbMonQuery implements AltComponent {
  root: Renderer;

  initialize(root: Renderer) {
    root.elem = replaceFromTempalte(root.elem, this.template);
    this.root = root;
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

  update(queryModel: Query) {
    this.root.set("@formatElapsed", queryModel.formatElapsed);
    this.root.set("@query", queryModel.query);
    this.root.set("@elapsedClass", queryModel.elapsedClassName);
  }
}