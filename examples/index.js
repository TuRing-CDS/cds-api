/**
 * Created by Z on 2017-03-01.
 */
const raml1Parser = require('raml-1-parser');
const path = require('path');


const apis = raml1Parser.loadApiSync(path.join(__dirname, './apis/api.raml')).toJSON();

function forEach(resources) {
    resources.forEach((item) => {
        // console.log(item.absoluteUri, item.relativeUriPathSegments.filter((t) => t.indexOf(':') != -1),item)
        if (item.resources) {
            forEach(item.resources);
        }
    })
}



// forEach(apis.resources)

apis.schemas.forEach((item)=>{
    console.log(item)
})