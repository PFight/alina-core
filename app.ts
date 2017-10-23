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
    this.appendChild(instantiateTemplate(this.template));
    this.root = new Renderer(this);
    this.update();

    this.toggle = true;
    setInterval(() => {
      this.toggle = !this.toggle;
      this.update();
    }, 3000);
  }

  template = makeTemplate(`
      <template id="component-template">
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
                          <td id="queries"></td>
                      </tr>                  
                  </template>
                </tbody>
              </table>
          </div>
      </template>`
  )

  update() {
    this.root.set("@toggled", this.toggle);
    this.root.repeat("#row", this.databases, (row, db) => {
      row.set("@dbname", db.dbname);
      row.set("@countClass", db.lastSample.countClassName);
      row.set("@queryCount", db.lastSample.nbQueries);
      row.set("@dbclass", this.toggle ? "dbtestclass1" : null);
      row.set("@dbclass2", this.toggle ? "dbtestclass2" : "");
      row.mount(db.lastSample.topFiveQueries).into("#queries", DbMonQueryList);
    });
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
window["customElements"].define('db-mon-table', DbMonTable);

