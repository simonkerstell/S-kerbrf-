import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib'

interface StegData {
  ordning: number
  rubrik: string
  instruktion: string
  bild_url: string | null
  signerad_av: string | null
  signerad_tid: string | null
  status: string
  kommentar: string | null
  noteringar: string | null
}

interface ProjektData {
  brf_adress: string
  mall_namn: string
  skapad_tid: string
  steg: StegData[]
  imageLoader: (url: string) => Promise<Uint8Array | null>
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current)
      current = word
    } else {
      current = current ? current + ' ' + word : word
    }
  }
  if (current) lines.push(current)
  return lines
}

export async function generateProjektPDF(data: ProjektData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const PAGE_W = 595
  const PAGE_H = 842
  const MARGIN = 40
  const CONTENT_W = PAGE_W - MARGIN * 2

  let page = doc.addPage([PAGE_W, PAGE_H])
  let y = PAGE_H - MARGIN

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE_W, PAGE_H])
      y = PAGE_H - MARGIN
    }
  }

  function drawText(text: string, x: number, size: number, bold = false, color = rgb(0, 0, 0)) {
    page.drawText(text, { x, y, size, font: bold ? fontBold : font, color })
    y -= size + 4
  }

  // Header
  page.drawRectangle({ x: 0, y: PAGE_H - 60, width: PAGE_W, height: 60, color: rgb(0.15, 0.35, 0.6) })
  page.drawText('SÄKER BRF', { x: MARGIN, y: PAGE_H - 38, size: 22, font: fontBold, color: rgb(1, 1, 1) })
  page.drawText('Besiktningsprotokoll', { x: MARGIN, y: PAGE_H - 56, size: 10, font, color: rgb(0.8, 0.9, 1) })
  y = PAGE_H - 80

  drawText(data.mall_namn, MARGIN, 16, true)
  drawText(data.brf_adress, MARGIN, 11)
  drawText(`Genererad: ${new Date(data.skapad_tid).toLocaleString('sv-SE')}`, MARGIN, 9, false, rgb(0.4, 0.4, 0.4))
  y -= 10

  for (const steg of data.steg) {
    ensureSpace(60)

    // Step header
    const statusColor =
      steg.status === 'godkand' ? rgb(0.1, 0.6, 0.1) :
      steg.status === 'underkand' ? rgb(0.8, 0.1, 0.1) :
      steg.status === 'klar' ? rgb(0.1, 0.4, 0.8) :
      rgb(0.5, 0.5, 0.5)

    page.drawRectangle({ x: MARGIN, y: y - 2, width: CONTENT_W, height: 18, color: rgb(0.93, 0.96, 1) })
    page.drawText(`${steg.ordning}. ${steg.rubrik}`, { x: MARGIN + 4, y: y, size: 11, font: fontBold, color: rgb(0.1, 0.2, 0.5) })
    const statusText = { ej_paborjad: 'Ej påbörjad', klar: 'Klar', godkand: 'Godkänd', underkand: 'Underkänd' }[steg.status] ?? steg.status
    page.drawText(statusText, { x: PAGE_W - MARGIN - 70, y: y, size: 9, font: fontBold, color: statusColor })
    y -= 22

    // Instruction
    const instrLines = wrapText(steg.instruktion, 90)
    for (const line of instrLines) {
      ensureSpace(14)
      page.drawText(line, { x: MARGIN + 4, y, size: 8, font, color: rgb(0.35, 0.35, 0.35) })
      y -= 12
    }
    y -= 4

    // Noteringar
    if (steg.noteringar) {
      const notLines = wrapText(`Information: ${steg.noteringar}`, 90)
      for (const line of notLines) {
        ensureSpace(14)
        page.drawText(line, { x: MARGIN + 4, y, size: 9, font, color: rgb(0.1, 0.1, 0.1) })
        y -= 13
      }
    }

    // Signature
    if (steg.signerad_av) {
      ensureSpace(14)
      const tid = steg.signerad_tid ? new Date(steg.signerad_tid).toLocaleString('sv-SE') : ''
      page.drawText(`Signerad av: ${steg.signerad_av}  |  ${tid}`, { x: MARGIN + 4, y, size: 8, font: fontBold, color: rgb(0.1, 0.4, 0.1) })
      y -= 14
    }

    // Comment
    if (steg.kommentar) {
      ensureSpace(14)
      const commentLines = wrapText(`Kommentar: ${steg.kommentar}`, 90)
      for (const line of commentLines) {
        page.drawText(line, { x: MARGIN + 4, y, size: 8, font, color: rgb(0.6, 0.2, 0.1) })
        y -= 12
      }
    }

    // Image
    if (steg.bild_url) {
      try {
        const imageBytes = await data.imageLoader(steg.bild_url)
        if (imageBytes) {
          ensureSpace(160)
          let img
          try {
            img = await doc.embedJpg(imageBytes)
          } catch {
            img = await doc.embedPng(imageBytes)
          }
          const maxW = Math.min(CONTENT_W - 8, 200)
          const scale = Math.min(maxW / img.width, 150 / img.height)
          const imgW = img.width * scale
          const imgH = img.height * scale
          ensureSpace(imgH + 10)
          page.drawImage(img, { x: MARGIN + 4, y: y - imgH, width: imgW, height: imgH })
          y -= imgH + 10
        }
      } catch {
        // Skip image if it fails
      }
    }

    y -= 8
    // Divider
    ensureSpace(4)
    page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) })
    y -= 8
  }

  // Footer on last page
  page.drawText('Säker BRF™ – Besiktningsprotokoll', { x: MARGIN, y: MARGIN - 10, size: 8, font, color: rgb(0.6, 0.6, 0.6) })

  return doc.save()
}
