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
      const saleData = {
        total: cartData.total,
        paymentMethod: paymentMethod,
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
   * Imprime un ticket (placeholder para futura implementación)
   */
  async printTicket(sale) {
    // TODO: Implementar impresión de tickets
    console.log('Imprimir ticket:', sale);
    
    // Si hay electronAPI disponible, usar IPC
    if (window.electronAPI) {
      try {
        await window.electronAPI.invoke('print-ticket', sale);
      } catch (error) {
        console.error('Error al imprimir:', error);
      }
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
