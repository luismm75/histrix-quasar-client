import { defineAsyncComponent } from 'vue';
import { isVue3 } from 'vue-demi';

export function defineAsyncComponentCompat(loader, options = {}) {
  const normalizedLoader = () =>
    Promise.resolve().then(() => (typeof loader === 'function' ? loader() : loader))
      .then(m => (m && m.__esModule ? m.default || m : m.default || m));

  const defaultLoading = { template: '<div>Cargando...</div>' };
  const defaultError = { template: '<div>Error al cargar componente</div>' };

  const { loading = defaultLoading, error = defaultError, delay, timeout } = options;

  if (isVue3) {
    return defineAsyncComponent({
      loader: normalizedLoader,
      loadingComponent: loading,
      errorComponent: error,
      delay,
      timeout
    });
  } else {
    return () => ({
      component: normalizedLoader(),
      loading,
      error,
      delay,
      timeout
    });
  }
}
