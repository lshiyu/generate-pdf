// 生成一页PDF
const puppeteer = require('puppeteer')

function generate(url, token, options) {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({ args: ['--no-sandbox'], headless: true })
      const page = await browser.newPage()

      await page.goto(url, { waitUntil: 'networkidle0' })
      await page.evaluate(t => {
        localStorage.setItem('XR_TOKEN', t)
      }, token)
      await page.goto(url, { waitUntil: 'networkidle0' })
      const buffer = await page.pdf(options)
      await browser.close()
      resolve(buffer)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = async (req, res) => {
  const { subjectid, token } = req.headers
  const { url, options } = req.body
  if (!url) return res.status(400).send({ code: -1, message: 'url 不能为空！' })
  if (!options) return res.status(400).send({ code: -1, message: 'options 不能为空！' })

  try {
    const pdf = await generate(url, token, options)
    res.set('header', { 'x-oss-subjectid': subjectid, 'x-oss-token': token })
    res.set('Content-Type', 'application/pdf')
    res.status(200).send(pdf)
  } catch (error) {
    const message = error.message || error
    res.send({ code: 500, message: message || '生成pdf失败，请稍后再试' })
  }
}
