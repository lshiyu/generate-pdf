const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const config = require('./config')
const router = require('./router')

const app = new express()
app.use(cors())
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))
app.use(router)

app.listen(config.port, () => {
  console.log(`listening on port ${config.port}`)
})
