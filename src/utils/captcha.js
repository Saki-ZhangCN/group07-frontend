export class CaptchaGenerator {
  constructor(options = {}) {
    this.width = options.width || 120
    this.height = options.height || 40
    this.charCount = options.charCount || 4
    this.fontSize = options.fontSize || 28
    this.chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  }

  generateCode() {
    let code = ''
    for (let i = 0; i < this.charCount; i++) {
      code += this.chars.charAt(Math.floor(Math.random() * this.chars.length))
    }
    return code
  }

  generateImage(code) {
    const canvas = document.createElement('canvas')
    canvas.width = this.width
    canvas.height = this.height
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, this.width, this.height)

    for (let i = 0; i < 8; i++) {
      ctx.beginPath()
      ctx.strokeStyle = this.randomColor(100, 200)
      ctx.lineWidth = 1
      ctx.moveTo(Math.random() * this.width, Math.random() * this.height)
      ctx.lineTo(Math.random() * this.width, Math.random() * this.height)
      ctx.stroke()
    }

    for (let i = 0; i < 50; i++) {
      ctx.beginPath()
      ctx.fillStyle = this.randomColor(50, 255)
      ctx.arc(Math.random() * this.width, Math.random() * this.height, 1, 0, Math.PI * 2)
      ctx.fill()
    }

    for (let i = 0; i < code.length; i++) {
      const char = code.charAt(i)
      ctx.font = `${this.fontSize}px Arial`
      ctx.fillStyle = this.randomColor(50, 160)
      ctx.textBaseline = 'middle'
      const x = (this.width / (this.charCount + 1)) * (i + 1)
      const y = this.height / 2 + (Math.random() - 0.5) * 10
      const rotate = (Math.random() - 0.5) * 0.5
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotate)
      ctx.fillText(char, 0, 0)
      ctx.restore()
    }

    return canvas.toDataURL('image/png')
  }

  randomColor(min, max) {
    const r = Math.floor(Math.random() * (max - min) + min)
    const g = Math.floor(Math.random() * (max - min) + min)
    const b = Math.floor(Math.random() * (max - min) + min)
    return `rgb(${r},${g},${b})`
  }

  generate() {
    const code = this.generateCode()
    const image = this.generateImage(code)
    return { code, image }
  }
}

export default CaptchaGenerator