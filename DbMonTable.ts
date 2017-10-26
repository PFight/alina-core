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
  root: ISingleNodeRenderer;
  toggle: boolean;
  inputValue: string = "";
  started: boolean = true;
  timeout: number;

  constructor() {
    super();
    this.databases = [];
    // this.template = document.getElementById("component-template");
    this.appendChild(fromTemplate(this.template));
    this.root = Renderer.Create(this);
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
          <template id="blink">
            <span>Blink</span>
          </template>
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
    this.root.set("@toggled", !this.toggle);
    this.root.set("@inputChange", this.onInputChange);
    this.root.set("@inputText", this.inputValue);
    this.root.set("@onStartStopClick", this.onStartStop);
    this.root.set("@startStopButtonText", this.started ? "Стоп" : "Старт");
    this.root.query("input").on(this.toggle, (input) => {
      input.nodeAs<HTMLInputElement>().style.backgroundColor = this.toggle ? "white" : "yellow";
    });
    this.root.ext(SuperExt).superQuery("input").once((input) => {
      input.nodeAs<HTMLInputElement>().style.color = "green";
    });
    this.root.showIf("#blink", this.toggle);

    this.root.repeat("#row", this.databases, ((row, db) => {
      row.set("@dbname", db.dbname);
      row.set("@countClass", db.lastSample.countClassName);
      row.set("@queryCount", db.lastSample.nbQueries);
      row.set("@dbclass", this.toggle ? "dbtestclass1" : null);
      row.set("@dbclass2", this.toggle ? "dbtestclass2" : "");
      
      row.findNode("@queries").mount(DbMonQueryList).update(db.lastSample.topFiveQueries);
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

class SuperQuery extends Renderer {
  constructor(nodesOrBindings: Node[] | NodeBinding[], parent: Renderer) {
    super(nodesOrBindings, parent);
  }

  superQuery(selector: string): ISingleNodeRenderer {
    let context = this.getContext<any>(selector);
    if (!context.result) {
      let node = this.querySelectorInternal(selector);
      context.result = new SuperQuery([node], this);
    }
    return context.result;
  }
}

function SuperExt(renderer: ISingleNodeRenderer): SuperQuery {
  return new SuperQuery([renderer.binding], renderer as Renderer);
}