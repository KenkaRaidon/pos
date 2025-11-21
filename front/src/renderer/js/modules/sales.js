/**
 * Sales Module - Gestión de ventas
 */

class SalesManager {
  constructor() {
    this.currentSale = null;
  }

  /**
   * Guarda una venta en el backend
   */
  async saveSale(cartData, paymentMethod = 'CASH') {
    try {
      // Obtener usuario actual
      const userJson = sessionStorage.getItem('currentUser');
      if (!userJson) {
        throw new Error('No hay usuario autenticado');
      }
      
      const currentUser = JSON.parse(userJson);

      const saleData = {
        total: cartData.total,
        paymentMethod: paymentMethod,
        userId: currentUser.id, // Agregar userId
        items: cartData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        }))
      };

      const sale = await apiClient.post('/sales', saleData);
      this.currentSale = sale;
      
      return sale;
    } catch (error) {
      throw new Error(`Error al guardar venta: ${error.message}`);
    }
  }

  /**
   * Obtiene el historial de ventas
   */
  async getSalesHistory(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/sales?${queryParams}` : '/sales';
      
      return await apiClient.get(endpoint);
    } catch (error) {
      throw new Error(`Error al obtener ventas: ${error.message}`);
    }
  }

  /**
   * Obtiene una venta específica por ID
   */
  async getSaleById(saleId) {
    try {
      return await apiClient.get(`/sales/${saleId}`);
    } catch (error) {
      throw new Error(`Error al obtener venta: ${error.message}`);
    }
  }

  /**
   * Imprime un ticket de venta como PDF
   */
  async printTicket(sale) {
    try {
      // Importar jsPDF dinámicamente
      const { jsPDF } = window.jspdf;
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // Ancho de ticket térmico estándar
      });

      // Configuración
      const pageWidth = 80;
      const margin = 5;
      let y = 10;

      // Función helper para centrar texto
      const centerText = (text, yPos, fontSize = 10) => {
        doc.setFontSize(fontSize);
        const textWidth = doc.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        doc.text(text, x, yPos);
      };

      // Encabezado
      doc.setFont('helvetica', 'bold');
      centerText('TICKET DE VENTA', y, 14);
      y += 8;

      // Información de la tienda
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      centerText('Sistema POS', y);
      y += 5;
      centerText('RFC: XAXX010101000', y);
      y += 8;

      // Línea separadora
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      // Información de la venta
      doc.setFontSize(8);
      doc.text(`Venta #${sale.id}`, margin, y);
      y += 4;
      
      const fecha = new Date(sale.createdAt);
      doc.text(`Fecha: ${fecha.toLocaleDateString('es-MX')}`, margin, y);
      y += 4;
      doc.text(`Hora: ${fecha.toLocaleTimeString('es-MX')}`, margin, y);
      y += 4;
      
      // Obtener nombre del cajero
      const userJson = sessionStorage.getItem('currentUser');
      if (userJson) {
        const user = JSON.parse(userJson);
        doc.text(`Cajero: ${user.name}`, margin, y);
        y += 4;
      }

      // Método de pago
      const paymentMethods = {
        'CASH': 'Efectivo',
        'CARD': 'Tarjeta',
        'TRANSFER': 'Transferencia'
      };
      doc.text(`Pago: ${paymentMethods[sale.paymentMethod] || sale.paymentMethod}`, margin, y);
      y += 6;

      // Línea separadora
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      // Encabezados de tabla
      doc.setFont('helvetica', 'bold');
      doc.text('Cant', margin, y);
      doc.text('Producto', margin + 10, y);
      doc.text('Total', pageWidth - margin - 15, y);
      y += 4;

      // Línea debajo de encabezados
      doc.line(margin, y, pageWidth - margin, y);
      y += 4;

      // Items de la venta
      doc.setFont('helvetica', 'normal');
      for (const item of sale.items) {
        const product = item.product || { name: 'Producto' };
        const qty = parseFloat(item.quantity);
        const price = parseFloat(item.priceAtTime);
        const subtotal = qty * price;

        // Cantidad
        doc.text(qty.toString(), margin, y);
        
        // Nombre del producto (truncar si es muy largo)
        let productName = product.name;
        if (productName.length > 20) {
          productName = productName.substring(0, 20) + '...';
        }
        doc.text(productName, margin + 10, y);
        
        // Subtotal
        doc.text(`$${subtotal.toFixed(2)}`, pageWidth - margin - 15, y);
        y += 4;

        // Si el nombre era largo, agregar espacio
        if (product.name.length > 20) {
          y += 1;
        }
      }

      y += 2;
      // Línea separadora
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      // Total
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      const total = parseFloat(sale.total);
      doc.text('TOTAL:', margin, y);
      doc.text(`$${total.toFixed(2)}`, pageWidth - margin - 20, y);
      y += 8;

      // Línea separadora
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;

      // Pie de página
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      centerText('¡Gracias por su compra!', y);
      y += 5;
      centerText('Conserve su ticket', y);

      // Generar nombre de archivo
      const fileName = `ticket_${sale.id}_${Date.now()}.pdf`;

      // Guardar PDF
      doc.save(fileName);

      console.log('✅ Ticket generado:', fileName);
      return fileName;

    } catch (error) {
      console.error('Error al generar ticket:', error);
      throw new Error('Error al generar el ticket PDF');
    }
  }

  /**
   * Cancela una venta
   */
  async cancelSale(saleId, reason = '') {
    try {
      return await apiClient.post(`/sales/${saleId}/cancel`, { reason });
    } catch (error) {
      throw new Error(`Error al cancelar venta: ${error.message}`);
    }
  }
}

// Instancia singleton global
const salesManager = new SalesManager();
