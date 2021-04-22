#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { findLastIndex } = require("lodash")
const params = process.argv.splice(2)
const commandMap = {
    mkModel,
    mkRoute,
    mkComponent,
    mkContainer
}

function mkModel(fileName) {
    const url = path.resolve(__dirname, "../src/models/"+fileName)
    fs.mkdirSync(url)
    fs.writeFileSync(url + "/index.js", 
    `import namespace from "./namespace";\nexport default { \n    namespace,\n    state: {},\n    reducers: {},\n    effects: {}\n}`)
    fs.writeFileSync(url + "/namespace.js", `const namespace = "${fileName}";\nexport default namespace`)
    fs.readFile(path.resolve(__dirname, "../src/index.js"), function(err, data) {
        let fileData = data.toString().split("\n")
        let dependencies = []
        fileData.forEach(item => {
            if (item.startsWith("import")) {
                dependencies.push(item)
            }
        })
        let lastDependencies = dependencies.length
        fileData.splice(lastDependencies, 0, `import ${fileName} from "./models/${fileName}";`)
        
        let models = []
        fileData.map(item => {
            if (item.startsWith("app.model")) {
                return models.push(item)
            } else {
                return models.push("undefined")
            }
        })
        let lastModel = findLastIndex(models, (o) => { return o !== "undefined" }) + 1
        fileData.splice(lastModel, 0, `app.model(${fileName});`)
        const dataString = fileData.join("\n")
        fs.unlink(path.resolve(__dirname, "../src/index.js"), function(err){
            if (err) {
                return "index.js删除失败"
            }
            fs.writeFileSync(path.resolve(__dirname, "../src/index.js"), dataString)
        })
    })
}

function mkRoute(fileName) {
    const url = path.resolve(__dirname, "../src/routes/"+fileName)
    fs.mkdirSync(url)
    fs.writeFileSync(url + "/index.less", "") 
    fs.writeFileSync(url + "/index.js", 
    `import React, { Component } from "react";\nimport { connect } from "dva";\nimport "./index.less";\n\nconst mapStateToProps = (state) => ({...state});\nconst mapDispatchToProps = (dispatch) => ({dispatch});\n@connect(mapStateToProps, mapDispatchToProps)\nclass ${fileName} extends Component {\n   render() {\n      return <div>${fileName}</div>\n   }\n}\nexport default ${fileName}`)
}

function mkComponent(fileName) {
    const functionalString = `import React from "react"\nimport "./index.less";\n\nexport default function ${fileName} (props) {\n   return <div>${fileName}</div>\n}`,
    classString = `import React, { Component } from "react";\nimport { connect } from "dva";\nimport "./index.less";\n\nconst mapStateToProps = (state) => ({...state});\nconst mapDispatchToProps = (dispatch) => ({dispatch});\n@connect(mapStateToProps, mapDispatchToProps)\nclass ${fileName} extends Component {\n   render() {\n      return <div>${fileName}</div>\n   }\n}\nexport default ${fileName}`
    const url = path.resolve(__dirname, "../src/components/"+fileName)
    const dataString = params.indexOf("--functional") !== -1 ? functionalString : classString
    fs.mkdirSync(url)
    fs.writeFileSync(url + "/index.less", "")
    fs.writeFileSync(url + "/index.js", dataString)
}

function mkContainer(fileName) {
    const functionalString = `import React from "react"\nimport "./index.less";\n\nexport default function ${fileName} (props) {\n   return <div>${fileName}</div>\n}`,
    classString = `import React, { Component } from "react";\nimport { connect } from "dva";\nimport "./index.less";\n\nconst mapStateToProps = (state) => ({...state});\nconst mapDispatchToProps = (dispatch) => ({dispatch});\n@connect(mapStateToProps, mapDispatchToProps)\nclass ${fileName} extends Component {\n   render() {\n      return <div>${fileName}</div>\n   }\n}\nexport default ${fileName}`
    const url = path.resolve(__dirname, "../src/containers/"+fileName)
    const dataString = params.indexOf("--functional") !== -1 ? functionalString : classString
    fs.mkdirSync(url)
    fs.writeFileSync(url + "/index.less", "")
    fs.writeFileSync(url + "/index.js", dataString)
}

const method = params[0],
fileName = params[1]
handler = commandMap[method]
handler(fileName)