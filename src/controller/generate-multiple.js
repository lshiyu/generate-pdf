// 生成多页PDF
const puppeteer = require('puppeteer')
const PDFMerger = require('pdf-merger-js')
const merger = new PDFMerger()

function generate(options, token) {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true })
      const page = await browser.newPage()

      // 开始循环生成
      let bufList = []

      for (let i = 0; i < options.length; i++) {
        await page.goto(options[i].url, { waitUntil: 'networkidle0' })
        await page.evaluate(t => {
          localStorage.setItem('XR_TOKEN', t)
        }, token)
        await page.goto(options[i].url, { waitUntil: 'networkidle0' })
        const buf = await page.pdf(options[i].option)
        bufList.push(buf)
        await merger.add(buf)
      }
      // 合并 buffer
      merger.saveAsBuffer().then(async buf => {
        await browser.close()
        resolve(buf)
        merger.reset()
      })
    } catch (error) {
      reject(error)
    }
  })
}

function checkParams(options) {
  if (!options || !Array.isArray(options))
    return {
      valid: false,
      message: 'options 必须为数组!'
    }
  for (let i = 0; i < options.length; i++) {
    const item = options[i]
    if (!item.url) return { valid: false, message: 'url 不能为空！' }
    if (!item.option) return { valid: false, message: 'option 不能为空!' }
  }
  return { valid: true, message: 'ok' }
}

module.exports = async (req, res) => {
  const { token } = req.headers
  const options = req.body.options
  // 校验参数
  const { valid, message } = checkParams(options)
  if (!valid) return res.status(400).send({ code: -1, message })

  try {
    const pdf = await generate(options, token)
    res.set('Content-Type', 'application/pdf')
    res.status(200).send(pdf)
  } catch (error) {
    const message = error.message || error
    res.send({ code: 500, message: message || '生成pdf失败，请稍后再试' })
  }
}
