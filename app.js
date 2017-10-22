

class DbMonTable extends HTMLElement {
    constructor() {
        super();
        
        this.databases = [];        
        // this.template = document.getElementById("component-template");
        this.template = template(`
            <template id="component-template">
                <div>
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
                                <template id="query" >
                                    <td class="Query @elapsedClass">
                                      @formatElapsed
                                      <div class="popover left">
                                        <div class="popover-content">@query</div>
                                        <div class="arrow"/>
                                      </div>
                                    </td>
                                </template>
                            </tr>                  
                        </template>
                      </tbody>
                    </table>
                </div>
            </template>`)
            
        createChildFromTemplate(this.template, this, this.createRenderer.bind(this));
        this.update();
    }

    createRenderer(rootElem) {
        let toggle = true;
        setInterval(() => {
            toggle = !toggle;
            this.update();
        }, 3000);
        
        this.renderer = renderer(rootElem, (table) => { table
            .repeat("#row", this.databases, (row, db) => { row                
                .set("@dbname", db.dbname)
                .set("@countClass", db.lastSample.countClassName)
                .set("@queryCount", db.lastSample.nbQueries)
                .set("@dbclass", toggle ? "dbtestclass1" : null)
                .set("@dbclass2", toggle ? "dbtestclass2" : "")
                .repeat("#query", db.lastSample.topFiveQueries, (query, queryModel) => { query
                    .set("@formatElapsed", queryModel.formatElapsed)
                    .set("@query", queryModel.query)
                    .set("@elapsedClass", queryModel.elapsedClassName);
                });
            });
        });
        return this.renderer;
    }
    
    update() {
        this.renderer();
    }
    
    connectedCallback() {
        this.run();
    }
    
    run() {
        this.databases = ENV.generateData().toArray();
        this.update();
        Monitoring.renderRate.ping();
        setTimeout(this.run.bind(this), ENV.timeout);
    }
}
customElements.define('db-mon-table', DbMonTable);


class TestWrapper extends HTMLElement {
    constructor(){
        super();
        
        let inner = this.firstElementChild;
        this.innerHTML = "<div data-test-wrapper></div>";
        this.firstElementChild.appendChild(inner);
        console.info(this.querySelector("#wrapped"));
    }
    
     connectedCallback() {
        console.info(this.querySelector("#wrapped"));
    }
}

customElements.define('test-wrapper', TestWrapper);