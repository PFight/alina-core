class DbMonQuery {
    constructor(elem, props) { 
        this.elem = replaceFromTempalte(elem, template(`
            <template>
                <td class="Query @elapsedClass">
                  @formatElapsed
                  <div class="popover left">
                    <div class="popover-content">@query</div>
                    <div class="arrow"/>
                  </div>
                </td>
            </template>                
        `));
        
        this.renderer = renderer(this.elem, (query, props) => {
            query.set("@formatElapsed", props.formatElapsed);
            query.set("@query", props.query);
            query.set("@elapsedClass", props.elapsedClassName);
        });   
    }
    
    update(props) {
        this.renderer(props);
    }
}

class DbMonTable extends HTMLElement {
    constructor() {
        super();
        
        this.databases = [];        
        // this.template = document.getElementById("component-template");
        this.template = template(`
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
                                <template id="query" >
                                    <td is="db-mon-query"></td>
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
        
        this.renderer = renderer(rootElem, (table) => {
            table.set("@toggled", toggle);
            table.repeat("#row", this.databases, (row, db) => {                
                row.set("@dbname", db.dbname);
                row.set("@countClass", db.lastSample.countClassName);
                row.set("@queryCount", db.lastSample.nbQueries);
                row.set("@dbclass", toggle ? "dbtestclass1" : null);
                row.set("@dbclass2", toggle ? "dbtestclass2" : "");
                row.repeat("#query", db.lastSample.topFiveQueries, (query, queryModel) => {
                    query.mount("td[is='db-mon-query']", DbMonQuery, queryModel)
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

