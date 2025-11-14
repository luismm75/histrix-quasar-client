// src/utils/asyncComponent.js
import { defineAsyncComponent, isVue3 } from 'vue-demi';

export function defineAsyncComponentCompat(loader) {
  if (isVue3) {
    // Vue 3
    return defineAsyncComponent({
      loader,
      loadingComponent: { template: '<div>Cargando...</div>' },
      errorComponent: { template: '<div>Error</div>' },
      delay: 200,
      timeout: 10000
    });
  }
  
  // Vue 2
  return () => ({
    component: loader(),
    loading: { template: '<div>Cargando...</div>' },
    error: { template: '<div>Error al cargar</div>' },
    delay: 200,
    timeout: 10000
  });
}