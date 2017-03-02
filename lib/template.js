/**
 * Created by Z on 2017-03-02.
 */
const path = require('path');
const mkdirp = require('mkdirp');
const ejs = require('ejs');
const fs = require('fs');
class Template {
    constructor(templateContent, router) {
        this.templateContent = templateContent;
        this.router = router;
    }

    writeFile(controllerPath) {
        controllerPath = path.join(process.cwd(), 'controllers', controllerPath);
        mkdirp.sync(controllerPath);
        let filePath = path.join(controllerPath, 'index.js');
        let content = ejs.render(this.templateContent, {
            controller: this.router.controller,
            description: this.router.description,
            router: this.router
        });
        fs.appendFileSync(filePath, content);
    }

}

module.exports = Template;