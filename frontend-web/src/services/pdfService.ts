import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { VocationalResult } from '../types'
import { formatDate, formatPercentage } from '../utils/formatters'

const BRAND_RGB: [number, number, number] = [239, 125, 0]
const DARK_RGB: [number, number, number] = [50, 50, 50]
const GRAY_RGB: [number, number, number] = [109, 109, 109]
const LINE_RGB: [number, number, number] = [233, 228, 219]

function sanitizeFileName(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9_-]/g, '')
  return cleaned || 'resultado-vocacional'
}

export function generateResultPdf(result: VocationalResult, userName: string): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 48

  const encabezado = () => {
    doc.setFillColor(...BRAND_RGB)
    doc.rect(0, 0, pageWidth, 96, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('Orientación Vocacional USB', margin, 44)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text('Resultado de tu prueba vocacional', margin, 66)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('usbbog.edu.co', pageWidth - margin, 66, { align: 'right' })
  }

  const piePagina = () => {
    const pages = doc.getNumberOfPages()
    for (let i = 1; i <= pages; i += 1) {
      doc.setPage(i)
      doc.setDrawColor(...LINE_RGB)
      doc.line(margin, doc.internal.pageSize.getHeight() - 40, pageWidth - margin, doc.internal.pageSize.getHeight() - 40)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...GRAY_RGB)
      doc.text('Orientación Vocacional USB · Documento de orientación, no vinculante.', margin, doc.internal.pageSize.getHeight() - 22)
      doc.text(`Página ${i} de ${pages}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 22, { align: 'right' })
    }
  }

  encabezado()

  let cursorY = 128
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...DARK_RGB)
  doc.text('Información general', margin, cursorY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...GRAY_RGB)
  cursorY += 18
  doc.text(`Estudiante: ${userName || 'No registrado'}`, margin, cursorY)
  cursorY += 15
  doc.text(`Fecha de generación: ${formatDate(result.generatedAt)}`, margin, cursorY)
  cursorY += 15
  doc.text(`Nombre del informe: ${result.nombreReporte ?? 'Sin identificar'}`, margin, cursorY)

  cursorY += 32
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...DARK_RGB)
  doc.text('Área de mayor afinidad', margin, cursorY)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...BRAND_RGB)
  cursorY += 20
  doc.text(result.primaryArea, margin, cursorY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...GRAY_RGB)
  const perfilGeneral = result.perfil ?? result.qualitativeSummary
  cursorY += 18
  const lineasPerfil = doc.splitTextToSize(perfilGeneral, pageWidth - margin * 2)
  doc.text(lineasPerfil, margin, cursorY)
  cursorY += lineasPerfil.length * 13 + 22

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...DARK_RGB)
  doc.text('Afinidad por área', margin, cursorY)

  autoTable(doc, {
    startY: cursorY + 8,
    head: [['Área', 'Afinidad']],
    body: result.affinityByArea.map((item) => [item.label, formatPercentage(item.value)]),
    theme: 'grid',
    headStyles: { fillColor: BRAND_RGB, textColor: 255, fontStyle: 'bold', fontSize: 10 },
    styles: { fontSize: 9, textColor: DARK_RGB, cellPadding: 6 },
    columnStyles: { 1: { halign: 'right', cellWidth: 80 } },
    margin: { left: margin, right: margin },
  })

  const finTabla1 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
  cursorY = finTabla1 + 28

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(...DARK_RGB)
  doc.text('Programas recomendados', margin, cursorY)

  autoTable(doc, {
    startY: cursorY + 8,
    head: [['Programa', 'Área', 'Compatibilidad']],
    body: result.careers.map((career) => [career.name, career.area, formatPercentage(career.affinity)]),
    theme: 'grid',
    headStyles: { fillColor: DARK_RGB, textColor: 255, fontStyle: 'bold', fontSize: 10 },
    styles: { fontSize: 9, textColor: DARK_RGB, cellPadding: 6 },
    columnStyles: { 2: { halign: 'right', cellWidth: 90 } },
    margin: { left: margin, right: margin },
  })

  const finTabla2 = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
  cursorY = finTabla2 + 24

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...GRAY_RGB)
  const aviso = 'Este informe se genera automáticamente a partir de tus respuestas y busca orientarte ' +
    'en la exploración de tu vocación. No sustituye la asesoría profesional.'
  const lineasAviso = doc.splitTextToSize(aviso, pageWidth - margin * 2)
  if (cursorY + lineasAviso.length * 13 < doc.internal.pageSize.getHeight() - 56) {
    doc.text(lineasAviso, margin, cursorY)
  }

  piePagina()

  const baseName = sanitizeFileName(result.nombreReporte ?? 'resultado-vocacional')
  const fileName = `${baseName}.pdf`
  doc.save(fileName)
  return fileName
}
