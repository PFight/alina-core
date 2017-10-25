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
  inputValue: string = "";
  started: boolean = true;
  timeout: number;

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
        <div>
          <input disabled="@toggled" oninput=@inputChange /> 
          You entered: @inputText
          <button onclick=@onStartStopClick >@startStopButtonText</button>
        </div>
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
    this.root.update("@toggled", !this.toggle);
    this.root.update("@inputChange", this.onInputChange);
    this.root.update("@inputText", this.inputValue);
    this.root.update("@onStartStopClick", this.onStartStop);
    this.root.update("@startStopButtonText", this.started ? "Стоп" : "Старт");
    this.root.querySelector("input").on(this.toggle, (input) => {
      input.nodeAs<HTMLInputElement>().style.backgroundColor = this.toggle ? "white" : "yellow";
    });

    this.root.repeat("#row", this.databases, this.root.once && ((row, db) => {
      row.update("@dbname", db.dbname);
      row.update("@countClass", db.lastSample.countClassName);
      row.update("@queryCount", db.lastSample.nbQueries);
      row.update("@dbclass", this.toggle ? "dbtestclass1" : null);
      row.update("@dbclass2", this.toggle ? "dbtestclass2" : "");
      row.componentOnNode("@queries", DbMonQueryList).update(db.lastSample.topFiveQueries);
    }));
  }

  onInputChange = (ev: Event) => {
    this.inputValue = (ev.target as HTMLInputElement).value;
    this.update();
  }

  onStartStop = () => {
    if (this.started) {
      this.stop();
    } else {
      this.run();
    }
    this.update();
  }

  connectedCallback() {
    this.run();
  }

  run() {
    this.databases = window["ENV"].generateData().toArray();
    this.update();
    window["Monitoring"].renderRate.ping();
    this.timeout = setTimeout(this.run.bind(this), window["ENV"].timeout);
    this.started = true;
  }

  stop() {
    clearTimeout(this.timeout);
    this.started = false;
  }
}
customElements.define('db-mon-table', DbMonTable);
