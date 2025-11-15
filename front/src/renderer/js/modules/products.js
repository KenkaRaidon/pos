/**
 * Products Module - Gestión de búsqueda de productos
 */

class ProductsManager {
  constructor() {
    this.cache = new Map(); // Cache de productos para búsquedas rápidas
  }

  /**
   * Busca un producto por código de barras
   */
  async searchByBarcode(barcode) {
    // Verificar cache primero
    if (this.cache.has(barcode)) {
      return this.cache.get(barcode);
    }

    try {
      const product = await apiClient.get(`/products/barcode/${barcode}`);
      
      // Transformar datos al formato interno
      const productData = {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        price: parseFloat(product.salePrice),
        cost: parseFloat(product.costPrice || 0),
        stock: product.currentStock || 0
      };

      // Guardar en cache
      this.cache.set(barcode, productData);
      
      return productData;
    } catch (error) {
      throw new Error(`Producto no encontrado: ${error.message}`);
    }
  }

  /**
   * Busca productos por nombre (para búsqueda manual)
   */
  async searchByName(name) {
    try {
      return await apiClient.get(`/products?search=${encodeURIComponent(name)}`);
    } catch (error) {
      throw new Error(`Error en búsqueda: ${error.message}`);
    }
  }

  /**
   * Limpia el cache de productos
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Valida si hay suficiente stock
   */
  validateStock(product, quantity) {
    if (product.stock !== undefined && product.stock < quantity) {
      return {
        valid: false,
        message: `Stock insuficiente. Disponible: ${product.stock}`
      };
    }
    return { valid: true };
  }
}

// Instancia singleton global
const productsManager = new ProductsManager();
