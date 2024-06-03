const express = require('express')
const router = express.Router()

const generateSingle = require('../controller/generate-single')
const generateMultiple = require('../controller/generate-multiple')

router.get('/', (req, res) => res.send('ok-111'))
router.get('/api/home', (req, res) => res.send('ok-111'))
router.post('/api/pdf', generateSingle)
router.post('/api/pdf/multiple', generateMultiple)

module.exports = router
