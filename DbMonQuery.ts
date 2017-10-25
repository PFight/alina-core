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
    this.root.update("@formatElapsed", queryModel.formatElapsed);
    this.root.update("@query", queryModel.query);
    this.root.update("@elapsedClass", queryModel.elapsedClassName);
  }
}