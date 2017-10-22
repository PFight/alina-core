

class DbMonTable {
    constructor() {
        this.databases = [];        
        // this.template = document.getElementById("component-template");
        this.template = template(`
            <template id="component-template">
                <div>
                    <table class="table table-striped latest-data">
                      <tbody>
                        <template id="row">
                            <tr>
                                <td class="dbname">@dbname</td>
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
    }
    
    mount(parent) {
        return createChildFromTemplate(this.template, parent, this.createRenderer.bind(this));
    }

    createRenderer(rootElem) {
        this.renderer = renderer(rootElem, (table) => {
            table.repeatTemplate("#row", this.databases, (a,b) => a.dbname == b.dbname, (row, db) => {
                row.setContent("@dbname", db.dbname)
                   .setClass("@countClass", db.lastSample.countClassName)
                   .setContent("@queryCount", db.lastSample.nbQueries)
                   .repeatTemplate("#query", db.lastSample.topFiveQueries, null, (query, queryModel) => {
                        query.setContent("@formatElapsed", queryModel.formatElapsed)
                             .setContent("@query", queryModel.query);
                    });
            });
        });
        return this.renderer;
    }
    
    update() {
        if (this.renderer) {
            this.renderer();
        } else{
            throw new Exception("Call 'createRenderer' first");
        }
    }
    
    run() {
        this.databases = ENV.generateData().toArray();
        this.update();
        Monitoring.renderRate.ping();
        setTimeout(this.run.bind(this), ENV.timeout);
    }
}

let comp = new DbMonTable();
comp.mount(document.body);
comp.run();