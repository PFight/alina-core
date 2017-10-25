interface Database {
  dbname: string;
  lastSample: Sample;
}

interface Sample {
  countClassName: string;
  nbQueries: number;
  topFiveQueries: Query[];
}

class DbMonTable extends HTMLElement {
  databases: Database[];
  root: Renderer;
  toggle: boolean;

  constructor() {
    super();
    this.databases = [];
    // this.template = document.getElementById("component-template");
    this.appendChild(fromTemplate(this.template));
    this.root = new Renderer(this);
    this.update();

    this.toggle = true;
    setInterval(() => {
      this.toggle = !this.toggle;
      this.update();
    }, 3000);
  }

  template = makeTemplate(`
    <div>
        <input disabled="@toggled" />
        <table class="table table-striped latest-data">
          <tbody>
            <template id="row">
                <tr>
                    <td class="dbname @dbclass xx @dbclass2">It is @dbname! Yes @dbname!</td>
                    <td class="query-count">
                      <span class="@countClass">
                        @queryCount
                      </span>
                    </td>
                    <!-- @queries -->
                </tr>                  
            </template>
          </tbody>
        </table>
    </div>
  `)

  update() {
    this.root.update("@toggled", this.toggle);

    this.root.repeat("#row", this.databases, this.root.once && ((row, db) => {
      row.update("@dbname", db.dbname);
      row.update("@countClass", db.lastSample.countClassName);
      row.update("@queryCount", db.lastSample.nbQueries);
      row.update("@dbclass", this.toggle ? "dbtestclass1" : null);
      row.update("@dbclass2", this.toggle ? "dbtestclass2" : "");
      row.componentOnNode("@queries", DbMonQueryList).update(db.lastSample.topFiveQueries);
    }));
  }

  connectedCallback() {
    this.run();
  }

  run() {
    this.databases = window["ENV"].generateData().toArray();
    this.update();
    window["Monitoring"].renderRate.ping();
    setTimeout(this.run.bind(this), window["ENV"].timeout);
  }
}
customElements.define('db-mon-table', DbMonTable);
