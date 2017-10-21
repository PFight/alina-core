

class Component {
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
        this.renderer = createRenderer(
            repeat(rootElem, "#row", () => this.databases, (a,b) => a.dbname == b.dbname, (rowElem, db) => [
                setContent(rowElem, "@dbname", (db) => db.dbname),
                setClass(rowElem, "@countClass", (db) => db.lastSample.countClassName),
                setContent(rowElem, "@queryCount", (db) => db.lastSample.nbQueries),
                repeat(rowElem, "#query", (db) => db.lastSample.topFiveQueries, (a,b) => a && b, (queryElem, query) => [
                    setContent(queryElem, "@formatElapsed", (query) => query.formatElapsed),
                    setContent(queryElem, "@query", (query) => query.query)
                ])
            ])
        );
        return this.renderer;
    }
    
    update() {
        if (this.renderer) {
            this.renderer();
        } else{
            throw new Exception("Call 'render' first");
        }
    }
    
    run() {
        this.databases = ENV.generateData().toArray();
        this.update();
        Monitoring.renderRate.ping();
        setTimeout(this.run.bind(this), ENV.timeout);
    }
}

let comp = new Component();
comp.mount(document.body);
comp.run();