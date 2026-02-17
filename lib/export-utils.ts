// CSV Export
export function exportToCSV(data: any[], filename: string = 'export.csv') {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  let csv = headers.join(',') + '\n'
  
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      // Handle values with commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    })
    csv += values.join(',') + '\n'
  })

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// PDF Export using jsPDF
export async function exportToPDF(
  data: any[],
  filename: string = 'export.pdf',
  title: string = 'Report'
) {
  try {
    // Dynamically import jsPDF to reduce bundle size
    const { jsPDF } = await import('jspdf')
    const { autoTable } = await import('jspdf-autotable')

    const pdf = new jsPDF()
    
    // Add title
    pdf.setFontSize(16)
    pdf.text(title, 15, 15)
    
    // Add date
    pdf.setFontSize(10)
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 25)

    // Prepare table data
    if (data.length === 0) {
      pdf.text('No data to display', 15, 35)
      pdf.save(filename)
      return
    }

    const headers = Object.keys(data[0])
    const rows = data.map(item =>
      headers.map(header => {
        const value = item[header]
        if (value instanceof Date) return value.toLocaleDateString()
        if (typeof value === 'number') return value.toFixed(2)
        return value || '-'
      })
    )

    // Use autoTable to add table
    autoTable(pdf, {
      head: [headers],
      body: rows,
      startY: 35,
      theme: 'grid',
      headerStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
    })

    pdf.save(filename)
  } catch (error) {
    console.error('Error generating PDF:', error)
    // Fallback to CSV if PDF generation fails
    console.log('Falling back to CSV export...')
    exportToCSV(data, filename.replace('.pdf', '.csv'))
  }
}

// Format data for export
export function formatExportData(data: any[]) {
  return data.map(item => {
    const formatted: any = {}
    Object.keys(item).forEach(key => {
      // Skip internal fields
      if (key.startsWith('_')) return
      
      // Format dates
      if (item[key] instanceof Date) {
        formatted[key] = item[key].toLocaleDateString()
        return
      }

      // Format field names
      const formattedKey = key
        .replace(/_/g, ' ')
        .replace(/^\w/, c => c.toUpperCase())
        .replace(/([A-Z])/g, ' $1')
        .trim()

      formatted[formattedKey] = item[key]
    })
    return formatted
  })
}
